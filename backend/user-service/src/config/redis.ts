import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '2'), // Use DB 2 for user service
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis instances
export const redisClient = new Redis(redisConfig);

// Redis Cache Keys for User Service
export const CACHE_KEYS = {
  // User profile and authentication
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_SESSION: (sessionId: string) => `user:session:${sessionId}`,
  USER_PREFERENCES: (userId: string) => `user:preferences:${userId}`,
  USER_SETTINGS: (userId: string) => `user:settings:${userId}`,
  
  // User activity and behavior
  USER_FAVORITES: (userId: string) => `user:favorites:${userId}`,
  USER_SEARCH_HISTORY: (userId: string) => `user:search-history:${userId}`,
  USER_VIEW_HISTORY: (userId: string) => `user:view-history:${userId}`,
  USER_RECENT_ACTIVITY: (userId: string) => `user:activity:${userId}`,
  
  // Meal planning
  USER_MEAL_PLANS: (userId: string) => `user:meal-plans:${userId}`,
  MEAL_PLAN: (planId: string) => `meal-plan:${planId}`,
  ACTIVE_MEAL_PLAN: (userId: string) => `user:active-meal-plan:${userId}`,
  
  // User statistics and analytics
  USER_STATS: (userId: string) => `user:stats:${userId}`,
  USER_ACHIEVEMENTS: (userId: string) => `user:achievements:${userId}`,
  
  // Social features
  USER_FOLLOWING: (userId: string) => `user:following:${userId}`,
  USER_FOLLOWERS: (userId: string) => `user:followers:${userId}`,
  
  // Temporary data
  USER_VERIFICATION_CODE: (userId: string) => `user:verification:${userId}`,
  USER_PASSWORD_RESET: (token: string) => `user:password-reset:${token}`,
  
  // Rate limiting
  RATE_LIMIT: (userId: string, action: string) => `rate-limit:${action}:${userId}`,
  
  // User recommendations cache
  USER_RECOMMENDATIONS: (userId: string) => `user:recommendations:${userId}`,
  USER_TASTE_PROFILE: (userId: string) => `user:taste-profile:${userId}`,
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  USER_PROFILE: 1800, // 30 minutes
  USER_SESSION: 86400, // 24 hours
  USER_PREFERENCES: 3600, // 1 hour
  USER_SETTINGS: 3600, // 1 hour
  USER_FAVORITES: 1800, // 30 minutes
  SEARCH_HISTORY: 86400, // 24 hours
  VIEW_HISTORY: 3600, // 1 hour
  MEAL_PLANS: 1800, // 30 minutes
  USER_STATS: 900, // 15 minutes
  USER_ACHIEVEMENTS: 3600, // 1 hour
  SOCIAL_DATA: 1800, // 30 minutes
  VERIFICATION_CODE: 600, // 10 minutes
  PASSWORD_RESET: 3600, // 1 hour
  RATE_LIMIT: 3600, // 1 hour
  RECOMMENDATIONS: 1800, // 30 minutes
  TASTE_PROFILE: 7200, // 2 hours
};

// Redis Connection Event Handlers
redisClient.on('connect', () => {
  console.log('✅ User Service Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ User Service Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ User Service Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('⚠️ User Service Redis client connection closed');
});

// Base Redis Cache Utility
export class RedisCache {
  // Set cache with TTL
  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  // Get cache
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  // Delete cache
  static async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  // Delete multiple keys by pattern
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Increment counter
  static async incr(key: string, ttl?: number): Promise<number> {
    try {
      const result = await redisClient.incr(key);
      if (ttl && result === 1) {
        await redisClient.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error('Redis INCR error:', error);
      throw error;
    }
  }

  // Add to set
  static async sadd(key: string, ...values: string[]): Promise<void> {
    try {
      await redisClient.sadd(key, ...values);
    } catch (error) {
      console.error('Redis SADD error:', error);
    }
  }

  // Remove from set
  static async srem(key: string, ...values: string[]): Promise<void> {
    try {
      await redisClient.srem(key, ...values);
    } catch (error) {
      console.error('Redis SREM error:', error);
    }
  }

  // Get set members
  static async smembers(key: string): Promise<string[]> {
    try {
      return await redisClient.smembers(key);
    } catch (error) {
      console.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  // Check if member exists in set
  static async sismember(key: string, value: string): Promise<boolean> {
    try {
      const result = await redisClient.sismember(key, value);
      return result === 1;
    } catch (error) {
      console.error('Redis SISMEMBER error:', error);
      return false;
    }
  }

  // Add to list (left push)
  static async lpush(key: string, ...values: string[]): Promise<void> {
    try {
      await redisClient.lpush(key, ...values);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
    }
  }

  // Get list range
  static async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await redisClient.lrange(key, start, stop);
    } catch (error) {
      console.error('Redis LRANGE error:', error);
      return [];
    }
  }

  // Trim list to specified range
  static async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await redisClient.ltrim(key, start, stop);
    } catch (error) {
      console.error('Redis LTRIM error:', error);
    }
  }

  // Set expiration
  static async expire(key: string, seconds: number): Promise<void> {
    try {
      await redisClient.expire(key, seconds);
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
    }
  }
}

// User-specific caching operations
export class UserCache {
  // Cache user profile
  static async cacheUserProfile(userId: string, profile: any): Promise<void> {
    const key = CACHE_KEYS.USER_PROFILE(userId);
    await RedisCache.set(key, profile, CACHE_TTL.USER_PROFILE);
  }

  // Get cached user profile
  static async getCachedUserProfile(userId: string): Promise<any | null> {
    const key = CACHE_KEYS.USER_PROFILE(userId);
    return await RedisCache.get(key);
  }

  // Cache user preferences
  static async cacheUserPreferences(userId: string, preferences: any): Promise<void> {
    const key = CACHE_KEYS.USER_PREFERENCES(userId);
    await RedisCache.set(key, preferences, CACHE_TTL.USER_PREFERENCES);
  }

  // Get cached user preferences
  static async getCachedUserPreferences(userId: string): Promise<any | null> {
    const key = CACHE_KEYS.USER_PREFERENCES(userId);
    return await RedisCache.get(key);
  }

  // Cache user session
  static async cacheUserSession(sessionId: string, sessionData: any): Promise<void> {
    const key = CACHE_KEYS.USER_SESSION(sessionId);
    await RedisCache.set(key, sessionData, CACHE_TTL.USER_SESSION);
  }

  // Get cached user session
  static async getCachedUserSession(sessionId: string): Promise<any | null> {
    const key = CACHE_KEYS.USER_SESSION(sessionId);
    return await RedisCache.get(key);
  }

  // Invalidate user session
  static async invalidateUserSession(sessionId: string): Promise<void> {
    const key = CACHE_KEYS.USER_SESSION(sessionId);
    await RedisCache.del(key);
  }

  // Cache user statistics
  static async cacheUserStats(userId: string, stats: any): Promise<void> {
    const key = CACHE_KEYS.USER_STATS(userId);
    await RedisCache.set(key, stats, CACHE_TTL.USER_STATS);
  }

  // Get cached user statistics
  static async getCachedUserStats(userId: string): Promise<any | null> {
    const key = CACHE_KEYS.USER_STATS(userId);
    return await RedisCache.get(key);
  }

  // Invalidate all user cache
  static async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user:*:${userId}`,
      `meal-plan:*:${userId}`,
    ];
    
    for (const pattern of patterns) {
      await RedisCache.delPattern(pattern);
    }
  }
}

// User favorites management
export class UserFavorites {
  // Add recipe to favorites
  static async addToFavorites(userId: string, recipeId: string): Promise<void> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    await RedisCache.sadd(key, recipeId);
    await RedisCache.expire(key, CACHE_TTL.USER_FAVORITES);
  }

  // Remove recipe from favorites
  static async removeFromFavorites(userId: string, recipeId: string): Promise<void> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    await RedisCache.srem(key, recipeId);
  }

  // Get user favorites
  static async getUserFavorites(userId: string): Promise<string[]> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    return await RedisCache.smembers(key);
  }

  // Check if recipe is favorited
  static async isFavorited(userId: string, recipeId: string): Promise<boolean> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    return await RedisCache.sismember(key, recipeId);
  }

  // Cache all favorites from database
  static async cacheFavoritesFromDB(userId: string, favoriteIds: string[]): Promise<void> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    
    // Clear existing cache
    await RedisCache.del(key);
    
    // Add all favorites
    if (favoriteIds.length > 0) {
      await RedisCache.sadd(key, ...favoriteIds);
      await RedisCache.expire(key, CACHE_TTL.USER_FAVORITES);
    }
  }
}

// User activity tracking
export class UserActivity {
  // Add to search history
  static async addToSearchHistory(userId: string, query: string): Promise<void> {
    const key = CACHE_KEYS.USER_SEARCH_HISTORY(userId);
    const searchEntry = JSON.stringify({
      query,
      timestamp: new Date().toISOString()
    });
    
    await RedisCache.lpush(key, searchEntry);
    await RedisCache.ltrim(key, 0, 49); // Keep last 50 searches
    await RedisCache.expire(key, CACHE_TTL.SEARCH_HISTORY);
  }

  // Get search history
  static async getSearchHistory(userId: string, limit: number = 10): Promise<any[]> {
    const key = CACHE_KEYS.USER_SEARCH_HISTORY(userId);
    const history = await RedisCache.lrange(key, 0, limit - 1);
    return history.map(entry => JSON.parse(entry));
  }

  // Add to view history
  static async addToViewHistory(userId: string, recipeId: string): Promise<void> {
    const key = CACHE_KEYS.USER_VIEW_HISTORY(userId);
    const viewEntry = JSON.stringify({
      recipeId,
      timestamp: new Date().toISOString()
    });
    
    await RedisCache.lpush(key, viewEntry);
    await RedisCache.ltrim(key, 0, 99); // Keep last 100 views
    await RedisCache.expire(key, CACHE_TTL.VIEW_HISTORY);
  }

  // Get view history
  static async getViewHistory(userId: string, limit: number = 20): Promise<any[]> {
    const key = CACHE_KEYS.USER_VIEW_HISTORY(userId);
    const history = await RedisCache.lrange(key, 0, limit - 1);
    return history.map(entry => JSON.parse(entry));
  }

  // Track user activity
  static async trackActivity(userId: string, activity: any): Promise<void> {
    const key = CACHE_KEYS.USER_RECENT_ACTIVITY(userId);
    const activityEntry = JSON.stringify({
      ...activity,
      timestamp: new Date().toISOString()
    });
    
    await RedisCache.lpush(key, activityEntry);
    await RedisCache.ltrim(key, 0, 29); // Keep last 30 activities
    await RedisCache.expire(key, CACHE_TTL.VIEW_HISTORY);
  }

  // Get recent activity
  static async getRecentActivity(userId: string, limit: number = 10): Promise<any[]> {
    const key = CACHE_KEYS.USER_RECENT_ACTIVITY(userId);
    const activities = await RedisCache.lrange(key, 0, limit - 1);
    return activities.map(entry => JSON.parse(entry));
  }
}

// Meal planning cache
export class MealPlanCache {
  // Cache meal plans
  static async cacheMealPlans(userId: string, mealPlans: any[]): Promise<void> {
    const key = CACHE_KEYS.USER_MEAL_PLANS(userId);
    await RedisCache.set(key, mealPlans, CACHE_TTL.MEAL_PLANS);
  }

  // Get cached meal plans
  static async getCachedMealPlans(userId: string): Promise<any[] | null> {
    const key = CACHE_KEYS.USER_MEAL_PLANS(userId);
    return await RedisCache.get(key);
  }

  // Cache individual meal plan
  static async cacheMealPlan(planId: string, mealPlan: any): Promise<void> {
    const key = CACHE_KEYS.MEAL_PLAN(planId);
    await RedisCache.set(key, mealPlan, CACHE_TTL.MEAL_PLANS);
  }

  // Get cached meal plan
  static async getCachedMealPlan(planId: string): Promise<any | null> {
    const key = CACHE_KEYS.MEAL_PLAN(planId);
    return await RedisCache.get(key);
  }

  // Cache active meal plan
  static async cacheActiveMealPlan(userId: string, mealPlan: any): Promise<void> {
    const key = CACHE_KEYS.ACTIVE_MEAL_PLAN(userId);
    await RedisCache.set(key, mealPlan, CACHE_TTL.MEAL_PLANS);
  }

  // Get active meal plan
  static async getActiveMealPlan(userId: string): Promise<any | null> {
    const key = CACHE_KEYS.ACTIVE_MEAL_PLAN(userId);
    return await RedisCache.get(key);
  }

  // Invalidate meal plan cache
  static async invalidateMealPlanCache(userId: string, planId?: string): Promise<void> {
    const keys = [
      CACHE_KEYS.USER_MEAL_PLANS(userId),
      CACHE_KEYS.ACTIVE_MEAL_PLAN(userId)
    ];
    
    if (planId) {
      keys.push(CACHE_KEYS.MEAL_PLAN(planId));
    }
    
    await Promise.all(keys.map(key => RedisCache.del(key)));
  }
}

// Social features cache
export class UserSocial {
  // Cache user following list
  static async cacheFollowing(userId: string, followingIds: string[]): Promise<void> {
    const key = CACHE_KEYS.USER_FOLLOWING(userId);
    await RedisCache.del(key); // Clear existing
    
    if (followingIds.length > 0) {
      await RedisCache.sadd(key, ...followingIds);
      await RedisCache.expire(key, CACHE_TTL.SOCIAL_DATA);
    }
  }

  // Get cached following list
  static async getCachedFollowing(userId: string): Promise<string[]> {
    const key = CACHE_KEYS.USER_FOLLOWING(userId);
    return await RedisCache.smembers(key);
  }

  // Add to following
  static async addFollowing(userId: string, chefId: string): Promise<void> {
    const key = CACHE_KEYS.USER_FOLLOWING(userId);
    await RedisCache.sadd(key, chefId);
    await RedisCache.expire(key, CACHE_TTL.SOCIAL_DATA);
  }

  // Remove from following
  static async removeFollowing(userId: string, chefId: string): Promise<void> {
    const key = CACHE_KEYS.USER_FOLLOWING(userId);
    await RedisCache.srem(key, chefId);
  }

  // Check if following
  static async isFollowing(userId: string, chefId: string): Promise<boolean> {
    const key = CACHE_KEYS.USER_FOLLOWING(userId);
    return await RedisCache.sismember(key, chefId);
  }
}

// Rate limiting utilities
export class UserRateLimit {
  // Check rate limit
  static async checkRateLimit(userId: string, action: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = CACHE_KEYS.RATE_LIMIT(userId, action);
    
    try {
      const current = await RedisCache.incr(key, windowSeconds);
      const remaining = Math.max(0, limit - current);
      const resetTime = Date.now() + (windowSeconds * 1000);
      
      return {
        allowed: current <= limit,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + (windowSeconds * 1000) };
    }
  }

  // Reset rate limit
  static async resetRateLimit(userId: string, action: string): Promise<void> {
    const key = CACHE_KEYS.RATE_LIMIT(userId, action);
    await RedisCache.del(key);
  }
}

// User recommendations cache
export class UserRecommendations {
  // Cache user recommendations
  static async cacheRecommendations(userId: string, recommendations: any[]): Promise<void> {
    const key = CACHE_KEYS.USER_RECOMMENDATIONS(userId);
    await RedisCache.set(key, recommendations, CACHE_TTL.RECOMMENDATIONS);
  }

  // Get cached recommendations
  static async getCachedRecommendations(userId: string): Promise<any[] | null> {
    const key = CACHE_KEYS.USER_RECOMMENDATIONS(userId);
    return await RedisCache.get(key);
  }

  // Cache user taste profile
  static async cacheTasteProfile(userId: string, profile: any): Promise<void> {
    const key = CACHE_KEYS.USER_TASTE_PROFILE(userId);
    await RedisCache.set(key, profile, CACHE_TTL.TASTE_PROFILE);
  }

  // Get cached taste profile
  static async getCachedTasteProfile(userId: string): Promise<any | null> {
    const key = CACHE_KEYS.USER_TASTE_PROFILE(userId);
    return await RedisCache.get(key);
  }

  // Invalidate recommendation cache
  static async invalidateRecommendationCache(userId: string): Promise<void> {
    const keys = [
      CACHE_KEYS.USER_RECOMMENDATIONS(userId),
      CACHE_KEYS.USER_TASTE_PROFILE(userId)
    ];
    
    await Promise.all(keys.map(key => RedisCache.del(key)));
  }
}

export default redisClient; 