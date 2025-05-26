import { clerkClient } from '@clerk/clerk-sdk-node';
import { User } from '../models/User';
import { UserRole } from '../types/auth.types';
import { logger } from '../utils/logger';

class ClerkService {
  async syncClerkUser(clerkUser: any) {
    try {
      const existingUser = await User.findOne({ 
        $or: [
          { clerkId: clerkUser.id },
          { email: clerkUser.emailAddresses[0]?.emailAddress }
        ]
      });

      if (existingUser) {
        // Update existing user with Clerk data
        existingUser.clerkId = clerkUser.id;
        existingUser.isEmailVerified = clerkUser.emailAddresses[0]?.verification?.status === 'verified';
        existingUser.profile.firstName = clerkUser.firstName;
        existingUser.profile.lastName = clerkUser.lastName;
        existingUser.profile.avatar = clerkUser.imageUrl;
        await existingUser.save();
        return existingUser;
      }

      // Create new user from Clerk data
      const newUser = new User({
        email: clerkUser.emailAddresses[0]?.emailAddress,
        clerkId: clerkUser.id,
        role: UserRole.USER,
        isEmailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        profile: {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatar: clerkUser.imageUrl
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
