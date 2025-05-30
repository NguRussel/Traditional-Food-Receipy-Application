import { Schema, model, Document, Types } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     MealPlanItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the meal plan item
 *           readOnly: true
 *         date:
 *           type: string
 *           format: date
 *           description: Date for this meal item
 *         breakfast:
 *           type: string
 *           format: ObjectId
 *           description: Recipe ID for breakfast
 *         lunch:
 *           type: string
 *           format: ObjectId
 *           description: Recipe ID for lunch
 *         dinner:
 *           type: string
 *           format: ObjectId
 *           description: Recipe ID for dinner
 *         snacks:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of Recipe IDs for snacks
 *     MealPlan:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the meal plan
 *           readOnly: true
 *         name:
 *           type: string
 *           description: Name of the meal plan
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the meal plan
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of the meal plan
 *         meals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MealPlanItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of meal plan creation
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last meal plan update
 *           readOnly: true
 *     UserPreferences:
 *       type: object
 *       properties:
 *         dietaryRestrictions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of dietary restrictions (e.g., vegetarian, gluten-free)
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergies
 *         favoriteRegions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of favorite Cameroonian regions
 *         favoriteTribes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of favorite Cameroonian tribes
 *         spiceLevel:
 *           type: string
 *           enum: [Mild, Medium, Hot]
 *           default: Medium
 *           description: Preferred spice level
 *         cookingExperience:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *           default: Beginner
 *           description: User's cooking experience level
 *     User:
 *       type: object
 *       required:
 *         - clerkId
 *         - email
 *         - username
 *         - fullName
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *           readOnly: true
 *         clerkId:
 *           type: string
 *           description: Clerk user ID, unique
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address, unique
 *         username:
 *           type: string
 *           description: User's username, unique
 *         fullName:
 *           type: string
 *           description: User's full name
 *         avatar:
 *           type: string
 *           format: url
 *           description: URL to user's avatar image
 *         preferences:
 *           $ref: '#/components/schemas/UserPreferences'
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of favorite Recipe IDs
 *         mealPlans:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MealPlan'
 *         searchHistory:
 *           type: array
 *           items:
 *             type: string
 *           description: List of recent search terms
 *         viewHistory:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of recently viewed Recipe IDs
 *         accountStatus:
 *           type: string
 *           enum: [active, suspended, banned, pending_verification]
 *           default: pending_verification
 *           description: User's account status
 *         suspensionReason:
 *           type: string
 *           description: Reason for account suspension (if applicable)
 *         suspensionExpiry:
 *           type: string
 *           format: date-time
 *           description: Date when suspension expires (if applicable)
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the user account is active
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user's last login
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user creation
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last user update
 *           readOnly: true
 */

export interface IMealPlanItem extends Document {
  date: Date;
  breakfast?: Types.ObjectId; // Recipe ID
  lunch?: Types.ObjectId;
  dinner?: Types.ObjectId;
  snacks?: Types.ObjectId[];
}

export interface IMealPlan extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  meals: IMealPlanItem[];
}

export interface IUser extends Document {
  clerkId: string; // Clerk user ID
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  preferences: {
    dietaryRestrictions: string[]; // e.g., ['vegetarian', 'gluten-free']
    allergies: string[];
    favoriteRegions: string[];
    favoriteTribes: string[];
    spiceLevel: 'Mild' | 'Medium' | 'Hot';
    cookingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  favorites: Types.ObjectId[]; // Recipe IDs
  mealPlans: IMealPlan[];
  searchHistory: string[];
  viewHistory: Types.ObjectId[]; // Recipe IDs
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending_verification';
  suspensionReason?: string;
  suspensionExpiry?: Date;
  isActive: boolean;
  lastLoginAt?: Date;
}

const MealPlanItemSchema = new Schema<IMealPlanItem>({
  date: { type: Date, required: true },
  breakfast: { type: Schema.Types.ObjectId, ref: 'Recipe' }, // Assuming Recipe model exists in another service or will be referenced loosely
  lunch: { type: Schema.Types.ObjectId, ref: 'Recipe' },
  dinner: { type: Schema.Types.ObjectId, ref: 'Recipe' },
  snacks: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
});

const MealPlanSchema = new Schema<IMealPlan> ({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  meals: [MealPlanItemSchema],
}, { _id: true, timestamps: true }); // _id: true is default, explicitly stated for clarity. Timestamps for meal plan itself.

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    avatar: { type: String },
    preferences: {
      dietaryRestrictions: [{ type: String }],
      allergies: [{ type: String }],
      favoriteRegions: [{ type: String }],
      favoriteTribes: [{ type: String }],
      spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Hot'], default: 'Medium' },
      cookingExperience: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Recipe', index: true }],
    mealPlans: [MealPlanSchema],
    searchHistory: [{ type: String }],
    viewHistory: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'pending_verification'],
      default: 'pending_verification',
      index: true,
    },
    suspensionReason: { type: String },
    suspensionExpiry: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true } // Enables createdAt and updatedAt fields
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'preferences.favoriteRegions': 1 });
UserSchema.index({ 'preferences.favoriteTribes': 1 });

const User = model<IUser>('User', UserSchema);

export default User; 