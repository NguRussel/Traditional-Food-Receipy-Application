import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { User, IUser } from '../models/User';
import { AuthUser, LoginRequest, RegisterRequest, UserRole } from '../types/auth.types';
import { otpService } from './otpService';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

class AuthService {
  private generateTokens(user: IUser) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN as string) || '15m' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as string) || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async register(data: RegisterRequest) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const user = new User({
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName
      }
    });

    await user.save();

    // Generate and send OTP
    const otp = otpService.generateOTP();
    await otpService.saveOTP(user.email, otp);
    await emailService.sendOTPEmail(user.email, otp, user.profile.firstName);

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user._id
    };
  }

  async login(data: LoginRequest) {
    const user = await User.findOne({ email: data.email, isActive: true });
    if (!user || !await user.comparePassword(data.password)) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken
    };
  }

  async verifyOTP(email: string, otp: string) {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await otpService.verifyOTP(email, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const user = await User.findById(decoded.id);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new Error('Invalid refresh token');
      }

      // Remove old refresh token and generate new tokens
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      const tokens = this.generateTokens(user);
      user.refreshTokens.push(tokens.refreshToken);
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
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    const otp = otpService.generateOTP();
    await otpService.saveOTP(email, otp);
    await emailService.sendOTPEmail(email, otp, user.profile.firstName);

    return { message: 'OTP sent successfully' };
  }

  private formatUser(user: IUser): AuthUser {
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      isEmailVerified: user.isEmailVerified,
      clerkId: user.clerkId,
      profile: user.profile,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date()
    };
  }
}

export const authService = new AuthService();
