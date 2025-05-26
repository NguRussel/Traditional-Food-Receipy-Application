export enum UserRole {
  USER = 'user',
  CHEF = 'chef',
  ADMIN = 'admin'
}

export enum Permission {
  READ_RECIPES = 'read:recipes',
  WRITE_RECIPES = 'write:recipes',
  DELETE_RECIPES = 'delete:recipes',
  MANAGE_USERS = 'manage:users',
  MANAGE_CHEFS = 'manage:chefs',
  VIEW_ANALYTICS = 'view:analytics',
  MODERATE_CONTENT = 'moderate:content'
}

export interface AuthUser {
  id: string;
  email: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}