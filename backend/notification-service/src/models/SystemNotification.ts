import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     SystemNotification:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - type
 *         - createdBy
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the system notification.
 *         title:
 *           type: string
 *           description: Title of the system notification.
 *         message:
 *           type: string
 *           description: Main content of the system notification.
 *         type:
 *           type: string
 *           enum: [maintenance, feature, policy, warning]
 *           description: Type of system notification.
 *         targetAudience:
 *           type: string
 *           enum: [all, users, chefs, admins]
 *           default: all
 *           description: Intended audience for the notification.
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the system notification is currently active.
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Optional date and time when the notification should become active or be sent.
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Optional date and time when the notification expires and is no longer active.
 *         createdBy:
 *           type: string
 *           description: ID of the admin user who created the notification.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the system notification was created.
 *     SystemNotificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/SystemNotification'
 *     SystemNotificationsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         count:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         currentPage:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SystemNotification'
 */
export interface ISystemNotification extends Document {
  title: string;
  message: string;
  type: 'maintenance' | 'feature' | 'policy' | 'warning';
  targetAudience: 'all' | 'users' | 'chefs' | 'admins';
  isActive: boolean;
  scheduledAt?: Date;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId; // Admin ID
  createdAt: Date;
}

const SystemNotificationSchema: Schema<ISystemNotification> = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['maintenance', 'feature', 'policy', 'warning'],
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'users', 'chefs', 'admins'],
      default: 'all',
    },
    isActive: { type: Boolean, default: true },
    scheduledAt: { type: Date },
    expiresAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }, // Assuming an Admin model
  },
  { timestamps: true }
);

SystemNotificationSchema.index({ isActive: 1, scheduledAt: 1, expiresAt: 1 });
SystemNotificationSchema.index({ type: 1, targetAudience: 1 });

export const SystemNotification: Model<ISystemNotification> = mongoose.model<ISystemNotification>(
  'SystemNotification',
  SystemNotificationSchema
); 