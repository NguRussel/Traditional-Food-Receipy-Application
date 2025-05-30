import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for User Preferences
export interface IUserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteRegions: string[];
  favoriteTribes: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Hot';
  cookingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Interface for User Document
export interface IUser extends Document {
  _id: Types.ObjectId;
  clerkId: string; // Clerk user ID, should be unique
  email: string; // Should be unique
  username: string;
  fullName: string;
  avatar?: string;
  preferences: IUserPreferences;
  favorites: Types.ObjectId[]; // Array of Recipe IDs
  mealPlans: Types.ObjectId[]; // Array of MealPlan IDs
  searchHistory: string[];
  viewHistory: Types.ObjectId[]; // Array of Recipe IDs
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending_verification';
  suspensionReason?: string;
  suspensionExpiry?: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  // createdAt and updatedAt are automatically added by timestamps: true
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  dietaryRestrictions: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
  favoriteRegions: { type: [String], default: [] },
  favoriteTribes: { type: [String], default: [] },
  spiceLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot'],
    default: 'Medium',
  },
  cookingExperience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required.'],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
    },
    avatar: { type: String },
    preferences: { type: UserPreferencesSchema, default: () => ({}) },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }], // Assuming a Recipe model
    mealPlans: [{ type: Schema.Types.ObjectId, ref: 'MealPlan' }], // Assuming a MealPlan model
    searchHistory: { type: [String], default: [] },
    viewHistory: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }], // Assuming a Recipe model
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'pending_verification'],
      default: 'pending_verification',
    },
    suspensionReason: { type: String },
    suspensionExpiry: { type: Date },
    isActive: { type: Boolean, default: true }, // Or based on accountStatus logic
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Additional indexes
UserSchema.index({ username: 1 });

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel; 