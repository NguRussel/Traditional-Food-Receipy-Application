import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { emailService } from './emailService';
import { otpService } from './otpService';
import { UserRole, Permission, RegisterRequest, LoginRequest, AuthTokens } from '../types/auth.types';
import { logger } from '../utils/logger';

class AuthService {
  private generateTokens(userId: string, role: UserRole, permissions: Permission[]) {
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not defined');
      throw new Error('Authentication configuration error');
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      logger.error('JWT_REFRESH_SECRET is not defined');
      throw new Error('Authentication configuration error');
    }

    const accessToken = jwt.sign(
      { userId, role, permissions },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  private getDefaultPermissions(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.USER:
        return [Permission.READ_RECIPES];
      case UserRole.CHEF:
        return [
          Permission.READ_RECIPES,
          Permission.WRITE_RECIPES,
          Permission.VIEW_ANALYTICS
        ];
      case UserRole.ADMIN:
        return Object.values(Permission);
      default:
        return [Permission.READ_RECIPES];
    }
  }

  async register(data: RegisterRequest) {
    const { email, password, role = UserRole.USER, firstName, lastName } = data;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate OTP
    const otp = otpService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      email,
      password,
      role,
      permissions: this.getDefaultPermissions(role),
      profile: { firstName, lastName },
      otp: {
        code: otp,
        expiresAt: otpExpiry,
        attempts: 0
      }
    });

    await user.save();

    // Send OTP email
    await emailService.sendOTPEmail(email, otp, firstName);

    return {
      message: 'Registration successful. Please verify your email.',
      userId: user._id
    };
  }

  async login(data: LoginRequest): Promise<AuthTokens> {
    const { email, password } = data;

    const user = await User.findOne({ email, isActive: true });
    if (!user || !await user.comparePassword(password)) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const tokens = this.generateTokens(user._id.toString(), user.role, user.permissions);

    // Store refresh token (limit to 5 tokens per user)
    user.refreshTokens.push(tokens.refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5); // Keep only the 5 most recent tokens
    }
    user.lastLogin = new Date();
    await user.save();

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified
      }
    };
  }

  async verifyOTP(email: string, otp: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.otp || user.otp.expiresAt < new Date()) {
      throw new Error('OTP expired');
    }

    if (user.otp.attempts >= 3) {
      throw new Error('Too many OTP attempts. Please request a new OTP.');
    }

    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      throw new Error('Invalid OTP');
    }

    // Verify user
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    const tokens = this.generateTokens(user._id.toString(), user.role, user.permissions);
    user.refreshTokens.push(tokens.refreshToken);
    // Limit to 5 tokens per user
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: true
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || '') as any;
      const user = await User.findById(decoded.userId);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new Error('Invalid refresh token');
      }

      const tokens = this.generateTokens(user._id.toString(), user.role, user.permissions);

      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      user.refreshTokens.push(tokens.refreshToken);
      // Limit to 5 tokens per user
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      await user.save();

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
    }
  }

  async resendOTP(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    const otp = otpService.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0
    };
    await user.save();

    await emailService.sendOTPEmail(email, otp, user.profile.firstName);

    return { message: 'OTP sent successfully' };
  }
}

export const authService = new AuthService();
