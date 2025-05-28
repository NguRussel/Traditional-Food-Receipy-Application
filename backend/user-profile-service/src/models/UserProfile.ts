import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  name: string;
  bio?: string;
  isChef: boolean;
  preferences?: {
    dietary?: string[];
    notifications?: boolean;
  };
  favoriteRecipes: string[];
  allergies?: string[];
  chefProfile?: {
    expertise?: string;
    socialLinks?: string[];
  };
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bio: String,
  isChef: { type: Boolean, default: false },
  preferences: {
    dietary: [String],
    notifications: { type: Boolean, default: true }
  },
  favoriteRecipes: [String],
  allergies: [String],
  chefProfile: {
    expertise: String,
    socialLinks: [String]
  }
}, { timestamps: true });

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);