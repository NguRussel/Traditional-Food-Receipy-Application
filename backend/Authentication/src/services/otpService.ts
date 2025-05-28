import { User } from '../models/User';
import crypto from 'crypto';

class OTPService {
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async saveOTP(email: string, otp: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.updateOne(
      { email },
      {
        $set: {
          'otp.code': otp,
          'otp.expiresAt': expiresAt,
          'otp.attempts': 0
        }
      }
    );
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await User.findOne({ email });
    if (!user || !user.otp) return false;

    // Check if OTP has expired
    if (user.otp.expiresAt < new Date()) {
      return false;
    }

    // Check if maximum attempts exceeded
    if (user.otp.attempts >= 3) {
      return false;
    }

    // Check if OTP matches
    const isValid = user.otp.code === otp;

    // Only increment attempts if OTP is incorrect
    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
    }

    return isValid;
  }
}

export const otpService = new OTPService();
