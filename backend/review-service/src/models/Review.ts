import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  recipeId: Types.ObjectId; // ID of the recipe being reviewed
  userId: Types.ObjectId;   // ID of the user who wrote the review
  rating: number;           // Rating from 1 to 5
  comment?: string;         // Optional comment
  // createdAt and updatedAt are automatically added by timestamps: true
}

const ReviewSchema = new Schema<IReview>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      required: true,
      // ref: 'Recipe' // No direct DB link, but good for documentation/understanding
                     // Actual recipe data is in recipe-service
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      // ref: 'User'   // No direct DB link, but good for documentation/understanding
                     // Actual user data will be in user-service
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000, // Optional: limit comment length
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Indexing for common query patterns
ReviewSchema.index({ recipeId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true }); // A user can review a recipe only once
ReviewSchema.index({ rating: 1 });

const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default ReviewModel; 