import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - recipeId
 *         - userId
 *         - rating
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated MongoDB ID of the review.
 *           example: 60d5f2f5a1b2c3d4e5f6a7b8
 *         recipeId:
 *           type: string
 *           description: ID of the recipe being reviewed.
 *           example: 60d5f2f5a1b2c3d4e5f6a7c1
 *         userId:
 *           type: string
 *           description: ID of the user who wrote the review.
 *           example: 60d5f2f5a1b2c3d4e5f6a7d2
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given by the user (1-5).
 *           example: 4.5
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           description: Optional comment from the user.
 *           example: 'This recipe was delicious and easy to follow!'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the review was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the review was last updated.
 *     ReviewInput:
 *       type: object
 *       required:
 *         - recipeId
 *         - rating
 *       properties:
 *         recipeId:
 *           type: string
 *           description: ID of the recipe being reviewed.
 *           example: 60d5f2f5a1b2c3d4e5f6a7c1
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given by the user (1-5).
 *           example: 4
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           description: Optional comment from the user.
 *           example: 'Great recipe!'
 *     ReviewUpdateInput:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           description: New rating for the review (1-5).
 *           example: 5
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           description: New comment for the review.
 *           example: 'Even better the second time!'
 */
export interface IReview extends Document {
  recipeId: Types.ObjectId; // ID of the recipe being reviewed
  userId: Types.ObjectId;   // ID of the user who wrote the review
  rating: number;           // Rating from 1 to 5
  comment?: string;         // Optional comment
  createdAt: Date;
  updatedAt: Date;
  // createdAt and updatedAt are automatically added by timestamps: true
}

const ReviewSchema = new Schema<IReview>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe', // Assuming you have a Recipe model elsewhere
      required: [true, 'Recipe ID is required.'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model elsewhere
      required: [true, 'User ID is required.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters.'],
    },
  },
  { timestamps: true }
);

// Indexing for common query patterns
ReviewSchema.index({ recipeId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true }); // A user can review a recipe only once
ReviewSchema.index({ rating: 1 });

const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default ReviewModel; 