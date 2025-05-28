import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit?: string;
    isAllergen?: boolean;
  }>;
  instructions: string[];
  preparationTime: number; // in minutes
  cookingTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  videoId?: string;
  createdBy: string; // chef ID
  region?: string; // Cameroonian tribe/region
  category: string[];
  tags: string[];
  cost: 'low' | 'medium' | 'high';
  isPublished: boolean;
  isFlagged: boolean;
  averageRating?: number;
  ratingsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const RecipeSchema = new Schema<IRecipe>({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  ingredients: [{
    name: { type: String, required: true, index: true },
    quantity: { type: String, required: true },
    unit: String,
    isAllergen: { type: Boolean, default: false }
  }],
  instructions: [{ type: String, required: true }],
  preparationTime: { type: Number, required: true },
  cookingTime: { type: Number, required: true },
  servings: { type: Number, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  imageUrl: String,
  videoId: String,
  createdBy: { type: String, required: true, index: true },
  region: { type: String, index: true },
  category: [{ type: String, index: true }],
  tags: [{ type: String, index: true }],
  cost: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    required: true 
  },
  isPublished: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 }
}, { timestamps: true });

// Create text indexes for search functionality
RecipeSchema.index({ 
  title: 'text', 
  description: 'text', 
  'ingredients.name': 'text',
  region: 'text',
  tags: 'text'
});

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);