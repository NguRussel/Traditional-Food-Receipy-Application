import mongoose, { Schema, Document } from "mongoose";

export interface IMealPlan extends Document {
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  recipes: Array<{
    recipeId: string;
    day: string;
    mealType: string; // breakfast, lunch, dinner, snack
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    recipes: [
      {
        recipeId: { type: String, required: true },
        day: { type: String, required: true },
        mealType: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);