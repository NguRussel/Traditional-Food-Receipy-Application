import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     UserInteractionInput:
 *       type: object
 *       required:
 *         - userId
 *         - recipeId
 *         - interactionType
 *       properties:
 *         userId:
 *           type: string
 *           format: objectId
 *           description: The ID of the user performing the interaction.
 *         recipeId:
 *           type: string
 *           format: objectId
 *           description: The ID of the recipe being interacted with.
 *         interactionType:
 *           type: string
 *           enum: [view, like, save, cook, share, rating]
 *           description: The type of interaction.
 *         duration:
 *           type: integer
 *           format: int32
 *           description: Duration of interaction in seconds (e.g., for 'view').
 *           nullable: true
 *         rating:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value (1-5) if interactionType is 'rating'.
 *           nullable: true
 *     UserInteraction:
 *       allOf:
 *         - $ref: '#/components/schemas/UserInteractionInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               format: objectId
 *               description: The unique identifier for the interaction.
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp of when the interaction was created.
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp of when the interaction was last updated.
 */
export interface IUserInteraction extends Document {
  userId: Types.ObjectId; // Assuming this will be linked to a User model in another service or passed directly
  recipeId: Types.ObjectId; // Assuming this will be linked to a Recipe model
  interactionType: 'view' | 'like' | 'save' | 'cook' | 'share' | 'rating';
  duration?: number; // Optional: duration of view in seconds, for example
  rating?: number;   // Optional: if the interaction was a rating, store the rating value (1-5)
  // timestamp is handled by Mongoose timestamps: true
}

const UserInteractionSchema = new Schema<IUserInteraction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      // ref: 'User' // No direct ref if User service is separate, but good for documentation
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Recipe', // Can ref Recipe if Recipe IDs are consistent and known
    },
    interactionType: {
      type: String,
      enum: ['view', 'like', 'save', 'cook', 'share', 'rating'],
      required: true,
    },
    duration: {
      type: Number,
      required: false,
    },
    rating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true } // Adds createdAt (for timestamp field) and updatedAt
);

// Indexing for frequently queried fields
UserInteractionSchema.index({ userId: 1, recipeId: 1 });
UserInteractionSchema.index({ recipeId: 1, interactionType: 1 });
UserInteractionSchema.index({ userId: 1, interactionType: 1 });
UserInteractionSchema.index({ createdAt: -1 });

const UserInteractionModel = mongoose.model<IUserInteraction>(
  'UserInteraction',
  UserInteractionSchema
);

export default UserInteractionModel; 