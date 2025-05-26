// Import UserRole and Permission from the correct path
import { UserRole, Permission } from '../types/enums';

export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    LOGOUT: '/api/auth/logout',
    CLERK_WEBHOOK: '/api/auth/clerk/webhook'
  }
};

export const ROLE_PERMISSIONS = {
  [UserRole.USER]: [Permission.READ_RECIPES],
  [UserRole.CHEF]: [
    Permission.READ_RECIPES,
    Permission.WRITE_RECIPES,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.ADMIN]: Object.values(Permission)
};

export const EMAIL_TEMPLATES = {
  OTP_VERIFICATION: 'otp-verification',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset'
};
