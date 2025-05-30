import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for Ingredient Subdocument
export interface IIngredient extends Document {
  name: string;
  quantity: string;
  unit: string;
  isOptional: boolean;
}

// Interface for Recipe Document
export interface IRecipe extends Document {
  name: string;
  description: string;
  chefId: Types.ObjectId;
  chefName: string;
  cookingTime: number; // minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: IIngredient[];
  instructions: string[];
  tags: {
    ingredients: string[];
    categories: string[];
    timeOfDay: string[];
    region: string;
    tribe: string;
    holidays: string[];
  };
  images: string[]; // Firebase Storage URLs
  videoUrl?: string; // Firebase Storage URL
  ratings: {
    average: number;
    count: number;
  };
  nutritionInfo?: any; // Placeholder for NutritionInfo, to be defined later if needed
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  isActive: boolean;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId; // Admin ID
  // createdAt and updatedAt are automatically added by timestamps: true
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, required: true },
  isOptional: { type: Boolean, default: false },
});

const RecipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    chefId: { type: Schema.Types.ObjectId, ref: 'Chef', required: true }, // Assuming a Chef model
    chefName: { type: String, required: true }, // Denormalized for easier querying
    cookingTime: { type: Number, required: true }, // in minutes
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    servings: { type: Number, required: true },
    ingredients: [IngredientSchema],
    instructions: [{ type: String, required: true }],
    tags: {
      ingredients: [{ type: String, trim: true }],
      categories: [{ type: String, trim: true }],
      timeOfDay: [{ type: String, trim: true }],
      region: { type: String, trim: true, required: true },
      tribe: { type: String, trim: true, required: true },
      holidays: [{ type: String, trim: true }],
    },
    images: [{ type: String }], // Array of Firebase Storage URLs
    videoUrl: { type: String }, // Firebase Storage URL
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    nutritionInfo: { type: Schema.Types.Mixed }, // Flexible type for now
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    moderationNotes: { type: String },
    isActive: { type: Boolean, default: true }, // Default to active, can be set to false for soft delete
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }, // Assuming an Admin model
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Indexing for frequently queried fields
RecipeSchema.index({ name: 'text', description: 'text', 'tags.ingredients': 'text' }); // For text search
RecipeSchema.index({ chefId: 1 });
RecipeSchema.index({ region: 1, tribe: 1 });
RecipeSchema.index({ status: 1 });
RecipeSchema.index({ 'ratings.average': -1 });

const RecipeModel = mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default RecipeModel; 