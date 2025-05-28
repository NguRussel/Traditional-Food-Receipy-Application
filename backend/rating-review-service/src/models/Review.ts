import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  recipeId: string;
  userId: string;
  text: string;
  isPublished: boolean;
  isFlagged: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>({
  recipeId: { 
    type: String, 
    required: true,
    index: true
  },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  text: { 
    type: String, 
    required: true,
    maxlength: 1000 // Limit review length
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isFlagged: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true
});

// Create text index for search functionality
ReviewSchema.index({ text: 'text' });

export default mongoose.model<IReview>('Review', ReviewSchema);