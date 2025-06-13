import {
  UserCache,
  UserFavorites,
  UserActivity,
  MealPlanCache,
  UserSocial,
  UserRateLimit,
  UserRecommendations,
  RedisCache
} from '../config/redis';
import { User, IUser, IMealPlan } from '../models/User'; // Using the correct imports from User model
import mongoose from 'mongoose';

export interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  preferences: UserPreferences;
  accountStatus: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteRegions: string[];
  favoriteTribes: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Hot';
  cookingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface UserStats {
  totalRecipes: number;
  totalFavorites: number;
  totalMealPlans: number;
  totalFollowing: number;
  totalViews: number;
  joinedDaysAgo: number;
  lastActiveAt: Date;
}

export class UserCacheService {
  /**
   * Get user profile with Redis caching
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cached = await UserCache.getCachedUserProfile(userId);
      if (cached) {
        console.log('🚀 Returning cached user profile');
        return cached;
      }

      // Get from database
      const user = await User.findById(userId).lean();
      if (!user) {
        return null;
      }

      // Cache the profile
      await UserCache.cacheUserProfile(userId, user);

      return user as UserProfile;

    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error('Failed to retrieve user profile');
    }
  }

  /**
   * Update user profile and cache
   */
  static async updateUserProfile(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Update in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true, lean: true }
      );

      if (!updatedUser) {
        return null;
      }

      // Update cache
      await UserCache.cacheUserProfile(userId, updatedUser);

      return updatedUser as UserProfile;

    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences with caching
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      // Check cache first
      const cached = await UserCache.getCachedUserPreferences(userId);
      if (cached) {
        return cached;
      }

      // Get from database
      const user = await User.findById(userId).select('preferences').lean();
      if (!user) {
        return null;
      }

      // Cache preferences
      await UserCache.cacheUserPreferences(userId, user.preferences);

      return user.preferences;

    } catch (error) {
      console.error('Get user preferences error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      // Update in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          preferences: preferences,
          updatedAt: new Date()
        },
        { new: true, lean: true }
      ).select('preferences');

      if (!updatedUser) {
        return null;
      }

      // Update cache
      await UserCache.cacheUserPreferences(userId, updatedUser.preferences);

      // Invalidate recommendation cache since preferences changed
      await UserRecommendations.invalidateRecommendationCache(userId);

      return updatedUser.preferences;

    } catch (error) {
      console.error('Update user preferences error:', error);
      throw error;
    }
  }

  /**
   * Get user favorites with caching
   */
  static async getUserFavorites(userId: string): Promise<string[]> {
    try {
      // Check cache first
      const cached = await UserFavorites.getUserFavorites(userId);
      if (cached.length > 0) {
        return cached;
      }

      // Get from database
      const user = await User.findById(userId).select('favorites').lean();
      if (!user) {
        return [];
      }

      const favoriteIds = user.favorites?.map(id => id.toString()) || [];

      // Cache favorites
      await UserFavorites.cacheFavoritesFromDB(userId, favoriteIds);

      return favoriteIds;

    } catch (error) {
      console.error('Get user favorites error:', error);
      return [];
    }
  }

  /**
   * Add recipe to favorites
   */
  static async addToFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      // Check if already favorited
      const isFavorited = await UserFavorites.isFavorited(userId, recipeId);
      if (isFavorited) {
        return false; // Already favorited
      }

      // Update database
      await User.findByIdAndUpdate(
        userId,
        { 
          $addToSet: { favorites: new mongoose.Types.ObjectId(recipeId) },
          updatedAt: new Date()
        }
      );

      // Update cache
      await UserFavorites.addToFavorites(userId, recipeId);

      // Track activity
      await UserActivity.trackActivity(userId, {
        type: 'favorite_added',
        recipeId,
        action: 'add_favorite'
      });

      return true;

    } catch (error) {
      console.error('Add to favorites error:', error);
      throw error;
    }
  }

  /**
   * Remove recipe from favorites
   */
  static async removeFromFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      // Update database
      const result = await User.findByIdAndUpdate(
        userId,
        { 
          $pull: { favorites: new mongoose.Types.ObjectId(recipeId) },
          updatedAt: new Date()
        }
      );

      if (!result) {
        return false;
      }

      // Update cache
      await UserFavorites.removeFromFavorites(userId, recipeId);

      // Track activity
      await UserActivity.trackActivity(userId, {
        type: 'favorite_removed',
        recipeId,
        action: 'remove_favorite'
      });

      return true;

    } catch (error) {
      console.error('Remove from favorites error:', error);
      throw error;
    }
  }

  /**
   * Check if recipe is favorited
   */
  static async isFavorited(userId: string, recipeId: string): Promise<boolean> {
    try {
      return await UserFavorites.isFavorited(userId, recipeId);
    } catch (error) {
      console.error('Check favorite error:', error);
      return false;
    }
  }

  /**
   * Get user meal plans with caching
   */
  static async getUserMealPlans(userId: string): Promise<IMealPlan[]> {
    try {
      // Check cache first
      const cached = await MealPlanCache.getCachedMealPlans(userId);
      if (cached) {
        return cached;
      }

      // Get from database
      const user = await User.findById(userId).select('mealPlans').lean();
      if (!user) {
        return [];
      }

      const mealPlans = user.mealPlans || [];

      // Cache meal plans
      await MealPlanCache.cacheMealPlans(userId, mealPlans);

      return mealPlans;

    } catch (error) {
      console.error('Get user meal plans error:', error);
      return [];
    }
  }

  /**
   * Create new meal plan
   */
  static async createMealPlan(userId: string, mealPlanData: any): Promise<IMealPlan | null> {
    try {
      // Create meal plan in database
      const newMealPlan = {
        _id: new mongoose.Types.ObjectId(),
        ...mealPlanData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await User.findByIdAndUpdate(
        userId,
        { 
          $push: { mealPlans: newMealPlan },
          updatedAt: new Date()
        }
      );

      // Invalidate cache
      await MealPlanCache.invalidateMealPlanCache(userId);

      // Cache the new meal plan
      await MealPlanCache.cacheMealPlan(newMealPlan._id.toString(), newMealPlan);

      // Track activity
      await UserActivity.trackActivity(userId, {
        type: 'meal_plan_created',
        mealPlanId: newMealPlan._id.toString(),
        action: 'create_meal_plan'
      });

      return newMealPlan as IMealPlan;

    } catch (error) {
      console.error('Create meal plan error:', error);
      throw error;
    }
  }

  /**
   * Update meal plan
   */
  static async updateMealPlan(userId: string, mealPlanId: string, updateData: any): Promise<IMealPlan | null> {
    try {
      // Update in database
      const result = await User.findOneAndUpdate(
        { 
          _id: userId,
          'mealPlans._id': new mongoose.Types.ObjectId(mealPlanId)
        },
        { 
          $set: {
            'mealPlans.$.name': updateData.name,
            'mealPlans.$.startDate': updateData.startDate,
            'mealPlans.$.endDate': updateData.endDate,
            'mealPlans.$.meals': updateData.meals,
            'mealPlans.$.updatedAt': new Date()
          },
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!result) {
        return null;
      }

      // Invalidate cache
      await MealPlanCache.invalidateMealPlanCache(userId, mealPlanId);

      // Find and cache updated meal plan
      const updatedMealPlan = result.mealPlans?.find(plan => 
        plan._id.toString() === mealPlanId
      );

      if (updatedMealPlan) {
        await MealPlanCache.cacheMealPlan(mealPlanId, updatedMealPlan);
      }

      return updatedMealPlan as IMealPlan;

    } catch (error) {
      console.error('Update meal plan error:', error);
      throw error;
    }
  }

  /**
   * Delete meal plan
   */
  static async deleteMealPlan(userId: string, mealPlanId: string): Promise<boolean> {
    try {
      // Delete from database
      const result = await User.findByIdAndUpdate(
        userId,
        { 
          $pull: { mealPlans: { _id: new mongoose.Types.ObjectId(mealPlanId) } },
          updatedAt: new Date()
        }
      );

      if (!result) {
        return false;
      }

      // Invalidate cache
      await MealPlanCache.invalidateMealPlanCache(userId, mealPlanId);

      return true;

    } catch (error) {
      console.error('Delete meal plan error:', error);
      throw error;
    }
  }

  /**
   * Get user search history
   */
  static async getSearchHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      return await UserActivity.getSearchHistory(userId, limit);
    } catch (error) {
      console.error('Get search history error:', error);
      return [];
    }
  }

  /**
   * Add to search history
   */
  static async addToSearchHistory(userId: string, query: string): Promise<void> {
    try {
      await UserActivity.addToSearchHistory(userId, query);
    } catch (error) {
      console.error('Add to search history error:', error);
    }
  }

  /**
   * Get user view history
   */
  static async getViewHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      return await UserActivity.getViewHistory(userId, limit);
    } catch (error) {
      console.error('Get view history error:', error);
      return [];
    }
  }

  /**
   * Add to view history
   */
  static async addToViewHistory(userId: string, recipeId: string): Promise<void> {
    try {
      await UserActivity.addToViewHistory(userId, recipeId);
    } catch (error) {
      console.error('Add to view history error:', error);
    }
  }

  /**
   * Get user statistics with caching
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Check cache first
      const cached = await UserCache.getCachedUserStats(userId);
      if (cached) {
        return cached;
      }

      // Calculate stats from database
      const [user, favoriteCount, mealPlanCount, followingCount] = await Promise.all([
        User.findById(userId).select('createdAt lastLoginAt').lean(),
        User.findById(userId).select('favorites').lean().then(u => u?.favorites?.length || 0),
        User.findById(userId).select('mealPlans').lean().then(u => u?.mealPlans?.length || 0),
        UserSocial.getCachedFollowing(userId).then(following => following.length)
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      const stats: UserStats = {
        totalRecipes: 0, // This would come from recipe service
        totalFavorites: favoriteCount,
        totalMealPlans: mealPlanCount,
        totalFollowing: followingCount,
        totalViews: 0, // This would come from analytics
        joinedDaysAgo: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        lastActiveAt: user.lastLoginAt || user.createdAt
      };

      // Cache stats
      await UserCache.cacheUserStats(userId, stats);

      return stats;

    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      const now = new Date();
      
      // Update database
      await User.findByIdAndUpdate(userId, { lastLoginAt: now });

      // Invalidate profile cache to reflect new login time
      await UserCache.invalidateUserCache(userId);

    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  /**
   * Check rate limit for user actions
   */
  static async checkRateLimit(
    userId: string, 
    action: string, 
    limit: number = 100, 
    windowSeconds: number = 3600
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      return await UserRateLimit.checkRateLimit(userId, action, limit, windowSeconds);
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + (windowSeconds * 1000) };
    }
  }

  /**
   * Get user following list
   */
  static async getUserFollowing(userId: string): Promise<string[]> {
    try {
      return await UserSocial.getCachedFollowing(userId);
    } catch (error) {
      console.error('Get user following error:', error);
      return [];
    }
  }

  /**
   * Follow a chef
   */
  static async followChef(userId: string, chefId: string): Promise<boolean> {
    try {
      // Check if already following
      const isAlreadyFollowing = await UserSocial.isFollowing(userId, chefId);
      if (isAlreadyFollowing) {
        return false;
      }

      // Add to cache
      await UserSocial.addFollowing(userId, chefId);

      // Track activity
      await UserActivity.trackActivity(userId, {
        type: 'chef_followed',
        chefId,
        action: 'follow_chef'
      });

      return true;

    } catch (error) {
      console.error('Follow chef error:', error);
      throw error;
    }
  }

  /**
   * Unfollow a chef
   */
  static async unfollowChef(userId: string, chefId: string): Promise<boolean> {
    try {
      // Remove from cache
      await UserSocial.removeFollowing(userId, chefId);

      // Track activity
      await UserActivity.trackActivity(userId, {
        type: 'chef_unfollowed',
        chefId,
        action: 'unfollow_chef'
      });

      return true;

    } catch (error) {
      console.error('Unfollow chef error:', error);
      throw error;
    }
  }

  /**
   * Check if user is following a chef
   */
  static async isFollowingChef(userId: string, chefId: string): Promise<boolean> {
    try {
      return await UserSocial.isFollowing(userId, chefId);
    } catch (error) {
      console.error('Check following error:', error);
      return false;
    }
  }

  /**
   * Get user recommendations
   */
  static async getUserRecommendations(userId: string): Promise<any[]> {
    try {
      // Check cache first
      const cached = await UserRecommendations.getCachedRecommendations(userId);
      if (cached) {
        return cached;
      }

      // This would typically call the recommendation service
      // For now, return empty array
      return [];

    } catch (error) {
      console.error('Get user recommendations error:', error);
      return [];
    }
  }

  /**
   * Cache user recommendations
   */
  static async cacheUserRecommendations(userId: string, recommendations: any[]): Promise<void> {
    try {
      await UserRecommendations.cacheRecommendations(userId, recommendations);
    } catch (error) {
      console.error('Cache user recommendations error:', error);
    }
  }

  /**
   * Get recent user activity
   */
  static async getRecentActivity(userId: string, limit: number = 10): Promise<any[]> {
    try {
      return await UserActivity.getRecentActivity(userId, limit);
    } catch (error) {
      console.error('Get recent activity error:', error);
      return [];
    }
  }

  /**
   * Invalidate all user cache
   */
  static async invalidateAllUserCache(userId: string): Promise<void> {
    try {
      await UserCache.invalidateUserCache(userId);
      await UserRecommendations.invalidateRecommendationCache(userId);
    } catch (error) {
      console.error('Invalidate user cache error:', error);
    }
  }

  /**
   * Get user session data
   */
  static async getUserSession(sessionId: string): Promise<any | null> {
    try {
      return await UserCache.getCachedUserSession(sessionId);
    } catch (error) {
      console.error('Get user session error:', error);
      return null;
    }
  }

  /**
   * Create user session
   */
  static async createUserSession(sessionId: string, sessionData: any): Promise<void> {
    try {
      await UserCache.cacheUserSession(sessionId, sessionData);
    } catch (error) {
      console.error('Create user session error:', error);
    }
  }

  /**
   * Invalidate user session
   */
  static async invalidateUserSession(sessionId: string): Promise<void> {
    try {
      await UserCache.invalidateUserSession(sessionId);
    } catch (error) {
      console.error('Invalidate user session error:', error);
    }
  }
}

export default UserCacheService; 