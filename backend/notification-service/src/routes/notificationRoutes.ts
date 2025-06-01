import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    subscribeToPushNotifications,
    sendNotification,
    createSystemNotification,
    getAllSystemNotifications,
    updateSystemNotification,
    deleteSystemNotification,
    getNotificationAnalytics
} from '../controllers/notificationController';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    validateMongoIdParam,
    validatePaginationQueryParams,
    handleValidationErrors,
    validateCreateSystemNotification,
    validateUpdateSystemNotification,
    validateSubscribe,
    validateSendNotification
} from '../middleware/validationMiddleware';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Notifications
 *   description: User notification management
 * components:
 *   schemas:
 *     MarkAsReadRequest: # Placeholder if needed, usually just an ID in path
 *       type: object
 *     MarkAllAsReadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Successfully marked 0 notifications as read."
 *         modifiedCount:
 *           type: integer
 *           example: 0
 *     DeleteNotificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Notification deleted successfully"
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60d0fe4f5311236168a109ca"
 *     SubscribeRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: FCM token or similar push notification token.
 *           example: "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1..."
 *         platform:
 *           type: string
 *           enum: [ios, android, web, unknown]
 *           description: Client platform.
 *           example: "android"
 *     SendNotificationRequest:
 *       type: object
 *       required:
 *         - targetType
 *         - title
 *         - message
 *         - type
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID if targetType is 'user'.
 *           example: "60d0fe4f5311236168a109ca"
 *         targetType:
 *           type: string
 *           enum: [user, topic, all]
 *           description: Target of the notification.
 *           example: "user"
 *         topicName:
 *           type: string
 *           description: Topic name if targetType is 'topic'.
 *           example: "new_recipes_topic"
 *         title:
 *           type: string
 *           example: "Special Announcement"
 *         message:
 *           type: string
 *           example: "Check out our new features!"
 *         data:
 *           type: object
 *           description: Additional data payload for the notification.
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *         type:
 *           type: string
 *           description: Notification type (matches INotification types).
 *           example: "system_announcement"
 *     SendNotificationResponse: # For topic or all, as individual notification is not created in DB directly for those by this endpoint
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Push dispatch to topic new_recipes_topic initiated."
 *         data:
 *           type: object
 *           properties:
 *             targetType: { type: string }
 *             topicName: { type: string, nullable: true }
 *             title: { type: string }
 *             message: { type: string }
 *             data: { type: object, nullable: true }
 * tags:
 *   name: AdminNotifications
 *   description: System notification management (Admin access required)
 * components:
 *   schemas:
 *     CreateSystemNotificationRequest:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           example: "Maintenance Alert"
 *         message:
 *           type: string
 *           example: "System will be down for maintenance on Sunday."
 *         type:
 *           type: string
 *           enum: [maintenance, feature, policy, warning]
 *           example: "maintenance"
 *         targetAudience:
 *           type: string
 *           enum: [all, users, chefs, admins]
 *           default: "all"
 *         isActive:
 *           type: boolean
 *           default: true
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *     UpdateSystemNotificationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Maintenance Extended"
 *         message:
 *           type: string
 *           example: "Maintenance will now end at 5 PM."
 *         type:
 *           type: string
 *           enum: [maintenance, feature, policy, warning]
 *         targetAudience:
 *           type: string
 *           enum: [all, users, chefs, admins]
 *         isActive:
 *           type: boolean
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *     AnalyticsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             totalUserNotifications: { type: integer }
 *             totalReadUserNotifications: { type: integer }
 *             unreadUserNotifications: { type: integer }
 *             readRateUserNotifications: { type: number, format: float }
 *             totalSystemNotifications: { type: integer }
 *             activePushSubscriptions: { type: integer }
 */

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     description: Retrieve a paginated list of notifications for the authenticated user.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of notifications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationsListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', protect, validatePaginationQueryParams(), handleValidationErrors, getUserNotifications);

/**
 * @openapi
 * /notifications/mark-read/{id}:
 *   post:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoIdPathParam'
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
    '/mark-read/:id',
    protect,
    validateMongoIdParam('id'),
    handleValidationErrors,
    markNotificationAsRead
);

/**
 * @openapi
 * /notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read for the user
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarkAllAsReadResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/mark-all-read', protect, markAllNotificationsAsRead);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoIdPathParam'
 *     responses:
 *       200:
 *         description: Notification deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteNotificationResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
    '/:id',
    protect,
    validateMongoIdParam('id'),
    handleValidationErrors,
    deleteNotification
);

/**
 * @openapi
 * /notifications/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscribeRequest'
 *     responses:
 *       200:
 *         description: Successfully subscribed to push notifications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PushSubscriptionResponse' 
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Conflict - e.g., token already in use by another active session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
    '/subscribe',
    protect,
    validateSubscribe(),
    handleValidationErrors,
    subscribeToPushNotifications
);

/**
 * @openapi
 * /notifications/send:
 *   post:
 *     summary: Send a notification (System/Admin only)
 *     tags: [Notifications, AdminNotifications]
 *     security:
 *       - ApiKeyAuth: [] # Requires admin/system role via authorize middleware
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationRequest'
 *     responses:
 *       200: # For topic/all dispatches
 *         description: Notification dispatch initiated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendNotificationResponse'
 *       201: # For user-specific notification creation
 *         description: Notification created and user push dispatch initiated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError' 
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
    '/send',
    protect,
    authorize(['admin', 'system']), 
    validateSendNotification(),
    handleValidationErrors,
    sendNotification
);

// --- Admin-specific routes ---

/**
 * @openapi
 * /notifications/system:
 *   post:
 *     summary: Create a system notification (Admin only)
 *     tags: [AdminNotifications]
 *     security:
 *       - ApiKeyAuth: [] # Requires admin role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSystemNotificationRequest'
 *     responses:
 *       201:
 *         description: System notification created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemNotificationResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
    '/system',
    protect,
    authorize(['admin']),
    validateCreateSystemNotification(),
    handleValidationErrors,
    createSystemNotification
);

/**
 * @openapi
 * /notifications/system/all:
 *   get:
 *     summary: Get all system notifications (Admin only)
 *     tags: [AdminNotifications]
 *     security:
 *       - ApiKeyAuth: [] # Requires admin role
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [maintenance, feature, policy, warning]
 *         description: Filter by notification type.
 *       - name: isActive
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by active status.
 *       - name: targetAudience
 *         in: query
 *         schema:
 *           type: string
 *           enum: [all, users, chefs, admins]
 *         description: Filter by target audience.
 *     responses:
 *       200:
 *         description: A list of system notifications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemNotificationsListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
    '/system/all',
    protect,
    authorize(['admin']),
    validatePaginationQueryParams(),
    handleValidationErrors,
    getAllSystemNotifications
);

/**
 * @openapi
 * /notifications/system/{id}:
 *   put:
 *     summary: Update a system notification (Admin only)
 *     tags: [AdminNotifications]
 *     security:
 *       - ApiKeyAuth: [] # Requires admin role
 *     parameters:
 *       - $ref: '#/components/parameters/MongoIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSystemNotificationRequest'
 *     responses:
 *       200:
 *         description: System notification updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemNotificationResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
    '/system/:id',
    protect,
    authorize(['admin']),
    validateMongoIdParam('id'),
    validateUpdateSystemNotification(),
    handleValidationErrors,
    updateSystemNotification
);

/**
 * @openapi
 * /notifications/system/{id}:
 *   delete:
 *     summary: Delete a system notification (Admin only)
 *     tags: [AdminNotifications]
 *     security:
 *       - ApiKeyAuth: [] # Requires admin role
 *     parameters:
 *       - $ref: '#/components/parameters/MongoIdPathParam'
 *     responses:
 *       200:
 *         description: System notification deleted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteNotificationResponse' # Can reuse this
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
    '/system/:id',
    protect,
    authorize(['admin']),
    validateMongoIdParam('id'),
    handleValidationErrors,
    deleteSystemNotification
);

/**
 * @openapi
 * /notifications/analytics:
 *   get:
 *     summary: Get notification analytics (Admin only)
 *     tags: [AdminNotifications]
 *     security:
 *       - ApiKeyAuth: [] # Requires admin role
 *     responses:
 *       200:
 *         description: Notification analytics data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
    '/analytics',
    protect,
    authorize(['admin']),
    getNotificationAnalytics
);

export default router; 