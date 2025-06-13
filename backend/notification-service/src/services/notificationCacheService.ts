import {
  NotificationCache,
  NotificationPubSub,
  RedisCache,
  CACHE_KEYS,
  CACHE_TTL,
  CHANNELS
} from '../config/redis';
import { Notification, INotification } from '../models/Notification';
import { SystemNotification } from '../models/SystemNotification';
import mongoose from 'mongoose';

export interface NotificationData {
  userId?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetType?: 'user' | 'topic' | 'all';
  topicName?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'isRead';
  sortOrder?: 'asc' | 'desc';
}

export class NotificationCacheService {
  /**
   * Get user notifications with Redis caching
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    options: NotificationOptions = {}
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    try {
      const { page = 1, limit = 20 } = options;
      
      // Check cache first for basic requests (no complex filters)
      const isBasicRequest = Object.keys(filters).length === 0;
      if (isBasicRequest && page === 1) {
        const cached = await NotificationCache.getCachedUserNotifications(userId);
        if (cached) {
          const unreadCount = await this.getUnreadCount(userId);
          return {
            notifications: cached.slice(0, limit),
            total: cached.length,
            unreadCount
          };
        }
      }

      // Build database query
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.priority) {
        query.priority = filters.priority;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }

      // Execute query with pagination
      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Notification.countDocuments(query),
        this.getUnreadCount(userId)
      ]);

      // Cache basic requests
      if (isBasicRequest && page === 1) {
        await NotificationCache.cacheUserNotifications(userId, notifications);
      }

      return { notifications, total, unreadCount };

    } catch (error) {
      console.error('Get user notifications error:', error);
      throw new Error('Failed to retrieve notifications');
    }
  }

  /**
   * Create and cache notification
   */
  static async createNotification(notificationData: NotificationData): Promise<INotification | null> {
    try {
      const { userId, type, title, message, data, priority = 'medium' } = notificationData;

      if (!userId) {
        throw new Error('User ID is required for user notifications');
      }

      // Create notification in database
      const notification = await Notification.create({
        userId: new mongoose.Types.ObjectId(userId),
        type,
        title,
        message,
        data,
        priority
      });

      if (!notification) {
        throw new Error('Failed to create notification');
      }

      // Update cache
      await this.invalidateUserCache(userId);
      await this.incrementUnreadCount(userId);

      // Publish real-time notification
      await NotificationPubSub.publishNewNotification(userId, notification);

      // Queue for push notification processing
      await NotificationCache.queueNotification({
        notificationId: notification._id,
        userId,
        type,
        title,
        message,
        data,
        priority,
        createdAt: notification.createdAt
      });

      return notification;

    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await Notification.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(notificationId),
          userId: new mongoose.Types.ObjectId(userId),
          isRead: false
        },
        { isRead: true },
        { new: true }
      );

      if (result) {
        // Update cache
        await this.invalidateUserCache(userId);
        await this.decrementUnreadCount(userId);

        // Publish read event
        await NotificationPubSub.publishNotificationRead(userId, notificationId);

        return true;
      }

      return false;

    } catch (error) {
      console.error('Mark as read error:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await Notification.updateMany(
        { 
          userId: new mongoose.Types.ObjectId(userId),
          isRead: false
        },
        { isRead: true }
      );

      if (result.modifiedCount > 0) {
        // Update cache
        await this.invalidateUserCache(userId);
        await this.resetUnreadCount(userId);

        // Publish read event for all
        await NotificationPubSub.publishNotificationRead(userId, 'all');
      }

      return result.modifiedCount;

    } catch (error) {
      console.error('Mark all as read error:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (notification) {
        // Update cache
        await this.invalidateUserCache(userId);
        
        // Update unread count if notification was unread
        if (!notification.isRead) {
          await this.decrementUnreadCount(userId);
        }

        return true;
      }

      return false;

    } catch (error) {
      console.error('Delete notification error:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Get unread count with caching
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      // Check cache first
      const cached = await NotificationCache.getUnreadCount(userId);
      if (cached !== null) {
        return cached;
      }

      // Get from database
      const count = await Notification.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false
      });

      // Cache the count
      await NotificationCache.updateUnreadCount(userId, count);

      return count;

    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  /**
   * Create system notification
   */
  static async createSystemNotification(
    notificationData: Omit<NotificationData, 'userId'> & { 
      targetAudience: 'all' | 'users' | 'chefs' | 'admins';
      createdBy: string;
      scheduledAt?: Date;
      expiresAt?: Date;
    }
  ): Promise<any> {
    try {
      const {
        title,
        message,
        type,
        data,
        targetAudience,
        createdBy,
        scheduledAt,
        expiresAt
      } = notificationData;

      // Create system notification
      const systemNotification = await SystemNotification.create({
        title,
        message,
        type,
        targetAudience,
        isActive: true,
        scheduledAt,
        expiresAt,
        createdBy: new mongoose.Types.ObjectId(createdBy)
      });

      // Cache active system notifications
      await this.cacheActiveSystemNotifications();

      // If immediate and targets all, broadcast
      const isImmediate = !scheduledAt || new Date(scheduledAt) <= new Date();
      if (systemNotification.isActive && isImmediate && targetAudience === 'all') {
        await NotificationPubSub.publishSystemBroadcast(systemNotification);
      }

      return systemNotification;

    } catch (error) {
      console.error('Create system notification error:', error);
      throw error;
    }
  }

  /**
   * Get active system notifications
   */
  static async getActiveSystemNotifications(): Promise<any[]> {
    try {
      // Check cache first
      const cached = await RedisCache.get<any[]>(CACHE_KEYS.SYSTEM_NOTIFICATIONS);
      if (cached) {
        return cached;
      }

      // Get from database
      const notifications = await SystemNotification.find({
        isActive: true,
        $and: [
          {
            $or: [
              { scheduledAt: { $lte: new Date() } },
              { scheduledAt: { $exists: false } }
            ]
          },
          {
            $or: [
              { expiresAt: { $gte: new Date() } },
              { expiresAt: { $exists: false } }
            ]
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

      // Cache the results
      await RedisCache.set(
        CACHE_KEYS.SYSTEM_NOTIFICATIONS,
        notifications,
        CACHE_TTL.SYSTEM_NOTIFICATIONS
      );

      return notifications;

    } catch (error) {
      console.error('Get active system notifications error:', error);
      return [];
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<any> {
    try {
      const cached = await RedisCache.get(CACHE_KEYS.NOTIFICATION_PREFERENCES(userId));
      if (cached) {
        return cached;
      }

      // Default preferences if not found
      const defaultPreferences = {
        email: {
          newRecipe: true,
          recipeLiked: true,
          newFollower: true,
          chefReply: true,
          mealReminder: true,
          systemAnnouncement: true
        },
        push: {
          newRecipe: true,
          recipeLiked: true,
          newFollower: true,
          chefReply: true,
          mealReminder: true,
          systemAnnouncement: true
        },
        inApp: {
          newRecipe: true,
          recipeLiked: true,
          newFollower: true,
          chefReply: true,
          mealReminder: true,
          systemAnnouncement: true
        }
      };

      // Cache default preferences
      await RedisCache.set(
        CACHE_KEYS.NOTIFICATION_PREFERENCES(userId),
        defaultPreferences,
        CACHE_TTL.NOTIFICATION_PREFERENCES
      );

      return defaultPreferences;

    } catch (error) {
      console.error('Get notification preferences error:', error);
      return {};
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(userId: string, preferences: any): Promise<void> {
    try {
      // Cache updated preferences
      await RedisCache.set(
        CACHE_KEYS.NOTIFICATION_PREFERENCES(userId),
        preferences,
        CACHE_TTL.NOTIFICATION_PREFERENCES
      );

      // TODO: Update in database if you have a preferences collection

    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Get notification analytics
   */
  static async getNotificationAnalytics(userId?: string): Promise<any> {
    try {
      const analytics: any = {};

      if (userId) {
        // User-specific analytics
        const [total, unread, byType, byPriority] = await Promise.all([
          Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
          Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId), isRead: false }),
          Notification.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ]),
          Notification.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ])
        ]);

        analytics.user = {
          total,
          unread,
          readRate: total > 0 ? ((total - unread) / total * 100).toFixed(2) : 0,
          byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
          byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
        };
      } else {
        // System-wide analytics
        const [totalNotifications, totalUsers, avgNotificationsPerUser] = await Promise.all([
          Notification.countDocuments(),
          Notification.distinct('userId').then(users => users.length),
          Notification.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $group: { _id: null, avg: { $avg: '$count' } } }
          ])
        ]);

        analytics.system = {
          totalNotifications,
          totalUsers,
          avgNotificationsPerUser: avgNotificationsPerUser[0]?.avg || 0
        };
      }

      return analytics;

    } catch (error) {
      console.error('Get notification analytics error:', error);
      return {};
    }
  }

  // Private helper methods

  private static async invalidateUserCache(userId: string): Promise<void> {
    await NotificationCache.invalidateUserCache(userId);
  }

  private static async incrementUnreadCount(userId: string): Promise<void> {
    const key = CACHE_KEYS.UNREAD_COUNT(userId);
    await RedisCache.incr(key, CACHE_TTL.UNREAD_COUNT);
  }

  private static async decrementUnreadCount(userId: string): Promise<void> {
    const key = CACHE_KEYS.UNREAD_COUNT(userId);
    const current = await RedisCache.get<number>(key) || 0;
    if (current > 0) {
      await RedisCache.set(key, current - 1, CACHE_TTL.UNREAD_COUNT);
    }
  }

  private static async resetUnreadCount(userId: string): Promise<void> {
    const key = CACHE_KEYS.UNREAD_COUNT(userId);
    await RedisCache.set(key, 0, CACHE_TTL.UNREAD_COUNT);
  }

  private static async cacheActiveSystemNotifications(): Promise<void> {
    try {
      const notifications = await SystemNotification.find({
        isActive: true,
        $and: [
          {
            $or: [
              { scheduledAt: { $lte: new Date() } },
              { scheduledAt: { $exists: false } }
            ]
          },
          {
            $or: [
              { expiresAt: { $gte: new Date() } },
              { expiresAt: { $exists: false } }
            ]
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

      await RedisCache.set(
        CACHE_KEYS.SYSTEM_NOTIFICATIONS,
        notifications,
        CACHE_TTL.SYSTEM_NOTIFICATIONS
      );

    } catch (error) {
      console.error('Cache active system notifications error:', error);
    }
  }
}

export default NotificationCacheService; 