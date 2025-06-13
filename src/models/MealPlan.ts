import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for a single meal entry in a day
export interface IMeal extends Document {
  date: Date;
  breakfast?: Types.ObjectId; // Recipe ID
  lunch?: Types.ObjectId;     // Recipe ID
  dinner?: Types.ObjectId;    // Recipe ID
  snacks?: Types.ObjectId[];  // Array of Recipe IDs
}

// Interface for MealPlan Document
export interface IMealPlan extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // User who owns this meal plan
  name: string;
  startDate: Date;
  endDate: Date;
  meals: IMeal[]; // Array of daily meal plans
  // createdAt and updatedAt are automatically added by timestamps: true
}

const MealSchema = new Schema<IMeal>(
  {
    date: {
      type: Date,
      required: [true, 'Meal date is required.'],
    },
    breakfast: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    lunch: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    dinner: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    snacks: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  { _id: false, timestamps: false } // _id is not needed here as it's part of an array in MealPlan
);

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for the meal plan.'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Meal plan name is required.'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required.'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required.'],
    },
    meals: [MealSchema], // Array of meal objects
  },
  { timestamps: true }
);

// Index for querying meal plans by user and date range might be useful
MealPlanSchema.index({ userId: 1, startDate: 1, endDate: 1 });

const MealPlanModel = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);

export default MealPlanModel; 