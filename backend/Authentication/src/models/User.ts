import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, Permission } from '../types/auth.types';

export interface IUser extends Document {
  _id: Types.ObjectId; // <-- add this
  email: string;
  password?: string;
  role: UserRole;
  permissions: Permission[];
  isEmailVerified: boolean;
  clerkId?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
  };
  otp?: {
    code: string;
    expiresAt: Date;
    attempts: number;
  };
  refreshTokens: string[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt?: Date;   // <-- add this
  updatedAt?: Date;   // <-- add this
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 8
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  permissions: [{
    type: String,
    enum: Object.values(Permission)
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  clerkId: {
    type: String,
    sparse: true
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    phone: String
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  refreshTokens: [String],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (!this.isModified('role')) return next();
  
  switch (this.role) {
    case UserRole.USER:
      this.permissions = [Permission.READ_RECIPES];
      break;
    case UserRole.CHEF:
      this.permissions = [
        Permission.READ_RECIPES,
        Permission.WRITE_RECIPES,
        Permission.VIEW_ANALYTICS
      ];
      break;
    case UserRole.ADMIN:
      this.permissions = Object.values(Permission);
      break;
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
