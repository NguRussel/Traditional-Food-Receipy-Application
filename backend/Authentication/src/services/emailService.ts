import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendOTPEmail(email: string, otp: string, firstName?: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Food Recipe App - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Food Recipe App!</h2>
            <p>Hi ${firstName || 'there'},</p>
            <p>Thank you for signing up! Please verify your email address using the OTP below:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #ff6b35; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Food Recipe App Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent successfully to ${email}`);
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

export const emailService = new EmailService();
