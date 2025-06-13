import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     PushSubscription:
 *       type: object
 *       required:
 *         - userId
 *         - token
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the push subscription.
 *         userId:
 *           type: string
 *           description: The ID of the user this subscription belongs to.
 *         token:
 *           type: string
 *           description: The push notification token from the client device (e.g., FCM token).
 *         platform:
 *           type: string
 *           enum: [ios, android, web, unknown]
 *           description: The platform of the device.
 *           default: unknown
 *         isActive:
 *           type: boolean
 *           description: Whether this subscription is currently active for push notifications.
 *           default: true
 *         lastSubscribed:
 *           type: string
 *           format: date-time
 *           description: The date and time the user last subscribed or re-subscribed with this token.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the subscription record was created.
 *     PushSubscriptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/PushSubscription'
 */
export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  token: string; // FCM token or similar
  platform: 'ios' | 'android' | 'web' | 'unknown';
  isActive: boolean;
  lastSubscribed: Date;
  createdAt: Date;
}

const PushSubscriptionSchema: Schema<IPushSubscription> = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true }, // Unique token
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'unknown'],
      default: 'unknown',
    },
    isActive: { type: Boolean, default: true, index: true },
    lastSubscribed: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Only createdAt, lastSubscribed handles updates
);

// Compound index for querying user's active subscriptions per platform
PushSubscriptionSchema.index({ userId: 1, platform: 1, isActive: 1 });

export const PushSubscription: Model<IPushSubscription> = mongoose.model<IPushSubscription>(
  'PushSubscription',
  PushSubscriptionSchema
); 