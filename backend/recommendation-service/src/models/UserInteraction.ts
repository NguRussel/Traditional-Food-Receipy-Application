import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserInteraction extends Document {
  userId: Types.ObjectId; // Assuming this will be linked to a User model in another service or passed directly
  recipeId: Types.ObjectId; // Assuming this will be linked to a Recipe model
  interactionType: 'view' | 'like' | 'save' | 'cook' | 'share';
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
      enum: ['view', 'like', 'save', 'cook', 'share'],
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