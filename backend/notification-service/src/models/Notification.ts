import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - title
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the notification
 *           example: 60d0fe4f5311236168a109ca
 *         userId:
 *           type: string
 *           description: The ID of the user this notification is for.
 *           example: 60d0fe4f5311236168a109cb
 *         type:
 *           type: string
 *           description: Type of the notification.
 *           enum: [recipe_liked, new_follower, chef_reply, new_recipe, meal_reminder, account_warning, system_announcement]
 *           example: new_recipe
 *         title:
 *           type: string
 *           description: Title of the notification.
 *           example: New Recipe Alert!
 *         message:
 *           type: string
 *           description: Main content of the notification.
 *           example: Chef John added a new recipe for Ndole.
 *         data:
 *           type: object
 *           description: Additional data associated with the notification (e.g., recipeId, chefId).
 *           example: { recipeId: '60d0fe4f5311236168a109cc' }
 *         priority:
 *           type: string
 *           description: Priority of the notification.
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           example: medium
 *         isRead:
 *           type: boolean
 *           description: Whether the notification has been read by the user.
 *           default: false
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the notification was created.
 *           example: '2023-01-01T12:00:00.000Z'
 *     NotificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Notification'
 *     NotificationsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 1
 *         currentPage:
 *           type: integer
 *           example: 1
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 */
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'recipe_liked' | 'new_follower' | 'chef_reply' | 'new_recipe' | 'meal_reminder' | 'account_warning' | 'system_announcement';
  title: string;
  message: string;
  data?: any; // Additional notification data
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['recipe_liked', 'new_follower', 'chef_reply', 'new_recipe', 'meal_reminder', 'account_warning', 'system_announcement'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true } // Only createdAt, as notifications are typically not updated
);

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema); 