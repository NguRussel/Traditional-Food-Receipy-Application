import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: result.message,
        data: { userId: result.userId }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOTP(email, otp);
      res.json({
        success: true,
        message: 'Email verified successfully',
        data: result
      });
    } catch (error) {
      logger.error('OTP verification error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'OTP verification failed'
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: tokens
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const userId = (req as any).user.id;
      await authService.logout(userId, refreshToken);
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await authService.resendOTP(email);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend OTP'
      });
    }
  }
}