import { Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { IAuthRequest } from '../middleware/authMiddleware';
import CustomError from '../utils/CustomError';
import { Notification, INotification } from '../models/Notification';
import { SystemNotification } from '../models/SystemNotification';
import { PushSubscription } from '../models/PushSubscription';
import {
    sendPushNotificationToUser,
    sendPushNotificationToTopic
} from '../services/pushNotificationService';

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new CustomError('User not authenticated', 401));
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalNotifications = await Notification.countDocuments({ userId });

    res.status(200).json({
        success: true,
        count: notifications.length,
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: page,
        data: notifications,
    });
});

// @desc    Mark notification as read
// @route   POST /api/v1/notifications/mark-read/:id
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
        return next(new CustomError('User not authenticated', 401));
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true, runValidators: true }
    );

    if (!notification) {
        return next(new CustomError(`Notification not found or user not authorized`, 404));
    }

    res.status(200).json({
        success: true,
        data: notification,
    });
});

// @desc    Mark all notifications as read
// @route   POST /api/v1/notifications/mark-all-read
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        return next(new CustomError('User not authenticated', 401));
    }

    const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: `Successfully marked ${result.modifiedCount} notifications as read.`,
        modifiedCount: result.modifiedCount,
    });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
        return next(new CustomError('User not authenticated', 401));
    }

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!notification) {
        return next(new CustomError(`Notification not found or user not authorized`, 404));
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
        data: { id: notificationId }, // Optionally return the ID of the deleted notification
    });
});

// @desc    Subscribe to push notifications
// @route   POST /api/v1/notifications/subscribe
// @access  Private
export const subscribeToPushNotifications = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { token, platform } = req.body;
    const resolvedPlatform = platform || 'unknown';

    if (!userId) {
        return next(new CustomError('User not authenticated', 401));
    }

    if (!token) {
        return next(new CustomError('Push notification token is required', 400));
    }

    try {
        // Step 1: Deactivate this token if it's actively used by another user.
        // This ensures that a push token is actively associated with only one user.
        await PushSubscription.updateMany(
            { token, userId: { $ne: userId }, isActive: true },
            { isActive: false }
        );

        // Step 2: Upsert the subscription for the current user and platform.
        // This will update the token if the user/platform entry exists and the token changed,
        // or create a new entry if the user is subscribing from a new platform/device.
        // It also ensures the subscription is marked active and the lastSubscribed date is updated.
        const subscription = await PushSubscription.findOneAndUpdate(
            { userId, platform: resolvedPlatform },
            { token, lastSubscribed: new Date(), isActive: true },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        
        console.log(`User ${userId} subscribed/updated push notifications on platform ${subscription.platform} with token: ${token}`);

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed/updated push notifications.',
            data: subscription,
        });

    } catch (error: any) {
        if (error.code === 11000) {
            // This error code indicates a unique key constraint violation.
            // Given the logic above (deactivating token for other users), this might occur if:
            // 1. The unique constraint is on {userId, platform} and somehow an attempt is made to create a duplicate. (Less likely with findOneAndUpdate)
            // 2. The unique constraint is on `token`, and despite deactivation, it's still considered a conflict.
            //    This could happen in highly concurrent scenarios or if the token is somehow still linked to another active user.
            console.error(`Push subscription failed due to unique constraint (token: ${token}, user: ${userId}, platform: ${resolvedPlatform}). Error: ${error.message}`);
            return next(new CustomError('Failed to subscribe due to a conflict. The device token may be associated with another active session or is in an inconsistent state. Please try again.', 409));
        }
        // Log the full error for other unexpected issues
        console.error(`Error in subscribeToPushNotifications for user ${userId}, token ${token}, platform ${resolvedPlatform}: ${error.message}`, error);
        return next(new CustomError('An unexpected error occurred while subscribing to push notifications.', 500));
    }
});

// @desc    Send notification (System only)
// @route   POST /api/v1/notifications/send
// @access  Private (Admin/System role)
export const sendNotification = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId, targetType, topicName, title, message, data, priority, type: notificationType } = req.body;

    if (targetType === 'user' && !userId) {
        return next(new CustomError('User ID is required when targetType is user', 400));
    }
    if (targetType === 'topic' && !topicName) {
        return next(new CustomError('Topic name is required when targetType is topic', 400));
    }
    if (!title || !message) {
        return next(new CustomError('Title and message are required', 400));
    }
    if (!notificationType) {
        return next(new CustomError('Notification type is required', 400));
    }

    let savedNotification: INotification | null = null;
    let topicDispatchInitiated = false;
    const ALL_USERS_TOPIC = 'all_users_global'; // Define the global topic name

    if (targetType === 'user' && userId) {
        savedNotification = await Notification.create({
            userId,
            type: notificationType, 
            title,
            message,
            data,
            priority: priority || 'medium',
        });
        
        if (savedNotification) {
            sendPushNotificationToUser(userId, savedNotification).catch(err => {
                console.error(`Error sending push notification to user ${userId} in background:`, err);
            });
            console.log(`Notification document created for user ${userId}: ${title}. Push dispatch initiated.`);
        } else {
            console.error(`Failed to create notification document for user ${userId}`);
        }

    } else if (targetType === 'topic' && topicName) {
        console.log(`Attempting to send notification to topic ${topicName}: ${title}`);
        sendPushNotificationToTopic(topicName, title, message, data).then(success => {
            if (success) {
                console.log(`Successfully dispatched notification to topic ${topicName}`);
            } else {
                console.error(`Failed to dispatch notification to topic ${topicName}`);
            }
        }).catch(err => {
            console.error(`Error sending push notification to topic ${topicName} in background:`, err);
        });
        topicDispatchInitiated = true;

    } else if (targetType === 'all') {
        console.log(`Attempting to send notification to ALL users via topic ${ALL_USERS_TOPIC}: ${title}.`);
        sendPushNotificationToTopic(ALL_USERS_TOPIC, title, message, data).then(success => {
            if (success) {
                console.log(`Successfully dispatched notification to topic ${ALL_USERS_TOPIC}`);
            } else {
                console.error(`Failed to dispatch notification to topic ${ALL_USERS_TOPIC}`);
            }
        }).catch(err => {
            console.error(`Error sending push notification to topic ${ALL_USERS_TOPIC} in background:`, err);
        });
        topicDispatchInitiated = true;
    }

    if (savedNotification) {
        res.status(201).json({
            success: true,
            message: 'Notification created and user push dispatch initiated.',
            data: savedNotification,
        });
    } else if (topicDispatchInitiated) {
        res.status(200).json({
            success: true,
            message: `Push dispatch to ${targetType === 'all' ? 'all users (simulated as topic)' : `topic ${topicName}`} initiated.`,
            data: { targetType, topicName, title, message, data }
        });
    } else {
        return next(new CustomError('Could not process notification request. Target type invalid or parameters missing.', 400));
    }
});

// --- Admin-specific controllers ---

// @desc    Create system notification
// @route   POST /api/v1/notifications/system
// @access  Private (Admin role)
export const createSystemNotification = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user?.id;
    if (!adminId) {
        return next(new CustomError('Admin user not authenticated', 401));
    }

    const { title, message, type, targetAudience, isActive, scheduledAt, expiresAt } = req.body;

    const systemNotification = await SystemNotification.create({
        title,
        message,
        type,
        targetAudience,
        isActive: isActive === undefined ? true : isActive, // Default to true if not provided
        scheduledAt,
        expiresAt,
        createdBy: adminId,
    });

    // If the system notification is active, immediate, and targets all, send it to the global topic.
    const isImmediate = !scheduledAt || new Date(scheduledAt) <= new Date();
    if (systemNotification.isActive && isImmediate && systemNotification.targetAudience === 'all') {
        console.log(`Broadcasting immediate and active system notification (ID: ${systemNotification.id}) to all_users_global topic.`);
        sendPushNotificationToTopic(
            'all_users_global', 
            systemNotification.title, 
            systemNotification.message,
            { systemNotificationId: systemNotification.id, notificationType: systemNotification.type }
        ).catch(err => {
            console.error(`Error broadcasting system notification ${systemNotification.id} to topic:`, err);
        });
    }
    // TODO: Handle other targetAudiences (users, chefs) which would require fetching user lists
    // and creating individual Notification documents + push calls.
    // TODO: Handle scheduled notifications via a cron job or scheduler that checks SystemNotification collection.

    res.status(201).json({
        success: true,
        message: 'System notification created successfully. Broadcast initiated if applicable.',
        data: systemNotification,
    });
});

// @desc    Get all system notifications
// @route   GET /api/v1/notifications/system/all
// @access  Private (Admin role)
export const getAllSystemNotifications = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // TODO: Add filtering capabilities (e.g., by type, isActive, targetAudience)
    const query: any = {}; 
    if (req.query.type) query.type = req.query.type as string;
    if (req.query.isActive) query.isActive = req.query.isActive === 'true';
    if (req.query.targetAudience) query.targetAudience = req.query.targetAudience as string;

    const systemNotifications = await SystemNotification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'); // Populate admin who created it

    const totalSystemNotifications = await SystemNotification.countDocuments(query);

    res.status(200).json({
        success: true,
        count: systemNotifications.length,
        totalPages: Math.ceil(totalSystemNotifications / limit),
        currentPage: page,
        data: systemNotifications,
    });
});

// @desc    Update system notification
// @route   PUT /api/v1/notifications/system/:id
// @access  Private (Admin role)
export const updateSystemNotification = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const notificationId = req.params.id;
    const adminId = req.user?.id;

    if (!adminId) {
        return next(new CustomError('Admin user not authenticated', 401));
    }

    const { title, message, type, targetAudience, isActive, scheduledAt, expiresAt } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt; 
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;

    if (Object.keys(updateData).length === 0) {
        return next(new CustomError('No fields provided for update', 400));
    }
    
    updateData.updatedBy = adminId; // Consider adding this to the model if audit is needed

    const updatedSystemNotification = await SystemNotification.findByIdAndUpdate(
        notificationId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedSystemNotification) {
        return next(new CustomError(`System notification not found with id ${notificationId}`, 404));
    }

    // Check if the update made it active, immediate, and targeted to all for broadcasting
    const isNowActive = updatedSystemNotification.isActive;
    const effectiveScheduledAt = updatedSystemNotification.scheduledAt || new Date(0); // Treat undefined scheduledAt as immediate
    const isNowImmediate = new Date(effectiveScheduledAt) <= new Date();
    const targetsAll = updatedSystemNotification.targetAudience === 'all';

    if (isNowActive && isNowImmediate && targetsAll) {
        // To avoid re-broadcasting if only minor details changed but it was already broadcast-worthy,
        // you might need more sophisticated logic (e.g., check if specific broadcast-triggering fields changed).
        // For simplicity, if it meets criteria now, we broadcast.
        console.log(`Broadcasting updated, active, and immediate system notification (ID: ${updatedSystemNotification.id}) to all_users_global topic.`);
        sendPushNotificationToTopic(
            'all_users_global',
            updatedSystemNotification.title,
            updatedSystemNotification.message,
            { systemNotificationId: updatedSystemNotification.id, notificationType: updatedSystemNotification.type }
        ).catch(err => {
            console.error(`Error broadcasting updated system notification ${updatedSystemNotification.id} to topic:`, err);
        });
    }
    // TODO: Handle changes that might affect scheduled notifications or other target audiences.

    res.status(200).json({
        success: true,
        message: 'System notification updated successfully. Broadcast initiated if applicable.',
        data: updatedSystemNotification,
    });
});

// @desc    Delete system notification
// @route   DELETE /api/v1/notifications/system/:id
// @access  Private (Admin role)
export const deleteSystemNotification = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const notificationId = req.params.id;

    const systemNotification = await SystemNotification.findByIdAndDelete(notificationId);

    if (!systemNotification) {
        return next(new CustomError(`System notification not found with id ${notificationId}`, 404));
    }

    // TODO: Consider if deleting a system notification should also remove related user notifications
    // or if it simply prevents new ones from being generated from this template.
    // For now, it just deletes the system notification entry.

    res.status(200).json({
        success: true,
        message: 'System notification deleted successfully',
        data: { id: notificationId }, // Return ID of deleted system notification
    });
});

// @desc    Get notification analytics
// @route   GET /api/v1/notifications/analytics
// @access  Private (Admin role)
export const getNotificationAnalytics = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    // TODO: Implement actual analytics gathering logic.
    // Examples:
    // - Total notifications sent (user vs system)
    // - Read rates for different notification types or system notifications
    // - Engagement from notifications (if data.link is used and tracked)
    // - Number of active push subscriptions

    const totalUserNotifications = await Notification.countDocuments();
    const totalSystemNotifications = await SystemNotification.countDocuments();
    const totalReadUserNotifications = await Notification.countDocuments({ isRead: true });
    
    const activePushSubscriptions = await PushSubscription.countDocuments({ isActive: true }); 

    res.status(200).json({
        success: true,
        message: 'Notification analytics retrieved (basic)',
        data: {
            totalUserNotifications,
            totalReadUserNotifications,
            unreadUserNotifications: totalUserNotifications - totalReadUserNotifications,
            readRateUserNotifications: totalUserNotifications > 0 ? (totalReadUserNotifications / totalUserNotifications) : 0,
            totalSystemNotifications,
            activePushSubscriptions: activePushSubscriptions
        },
    });
}); 