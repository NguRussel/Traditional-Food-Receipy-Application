import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from '../models/User';
import { UserRole } from '../types/auth.types';
import { logger } from '../utils/logger';

class ClerkService {
  async syncClerkUser(clerkUser: any) {
    try {
      // Validate Clerk user data
      if (!clerkUser || !clerkUser.id) {
        throw new Error('Invalid Clerk user data: missing id');
      }

      // Get primary email if available
      const primaryEmail = clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
        ? clerkUser.emailAddresses[0]?.emailAddress
        : null;

      if (!primaryEmail) {
        logger.warn(`Clerk user ${clerkUser.id} has no email addresses`);
      }

      const existingUser = await User.findOne({ 
        $or: [
          { clerkId: clerkUser.id },
          ...(primaryEmail ? [{ email: primaryEmail }] : [])
        ]
      });

      if (existingUser) {
        // Update existing user with Clerk data
        existingUser.clerkId = clerkUser.id;

        if (primaryEmail) {
          existingUser.isEmailVerified = 
            clerkUser.emailAddresses[0]?.verification?.status === 'verified';
        }

        existingUser.profile.firstName = clerkUser.firstName || existingUser.profile.firstName;
        existingUser.profile.lastName = clerkUser.lastName || existingUser.profile.lastName;
        existingUser.profile.avatar = clerkUser.imageUrl || existingUser.profile.avatar;

        await existingUser.save();
        return existingUser;
      }

      // Create new user from Clerk data
      if (!primaryEmail) {
        throw new Error(`Cannot create user for Clerk ID ${clerkUser.id}: No email address provided`);
      }

      const newUser = new User({
        email: primaryEmail,
        clerkId: clerkUser.id,
        role: UserRole.USER,
        isEmailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        profile: {
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          avatar: clerkUser.imageUrl || ''
        }
      });

      await newUser.save();
      return newUser;
    } catch (error) {
      logger.error('Error syncing Clerk user:', error);
      throw error;
    }
  }

  async handleWebhook(eventType: string, data: any) {
    try {
      switch (eventType) {
        case 'user.created':
        case 'user.updated':
          await this.syncClerkUser(data);
          break;
        case 'user.deleted':
          await User.updateOne(
            { clerkId: data.id },
            { isActive: false }
          );
          break;
        default:
          logger.info(`Unhandled Clerk webhook event: ${eventType}`);
      }
    } catch (error) {
      logger.error('Error handling Clerk webhook:', error);
      throw error;
    }
  }
}

export const clerkService = new ClerkService();
