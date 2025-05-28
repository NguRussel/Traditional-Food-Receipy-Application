import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  recipeId: string;
  userId: string;
  rating: number; // 1-5 stars
  createdAt?: Date;
  updatedAt?: Date;
}

const RatingSchema = new Schema<IRating>({
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
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  }
}, { 
  timestamps: true,
  // Ensure a user can only rate a recipe once
  // (can be updated but not duplicated)
  indexes: [
    { 
      fields: { recipeId: 1, userId: 1 },
      unique: true
    }
  ]
});

export default mongoose.model<IRating>('Rating', RatingSchema);