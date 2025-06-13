import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis instances
export const redisClient = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);
export const redisPublisher = new Redis(redisConfig);

// Redis Cache Keys
export const CACHE_KEYS = {
  USER_NOTIFICATIONS: (userId: string) => `notifications:user:${userId}`,
  NOTIFICATION_COUNT: (userId: string) => `notifications:count:${userId}`,
  UNREAD_COUNT: (userId: string) => `notifications:unread:${userId}`,
  SYSTEM_NOTIFICATIONS: 'notifications:system:active',
  NOTIFICATION_PREFERENCES: (userId: string) => `notifications:preferences:${userId}`,
  PUSH_SUBSCRIPTIONS: (userId: string) => `push:subscriptions:${userId}`,
  RATE_LIMIT: (userId: string, action: string) => `rate_limit:${action}:${userId}`,
  NOTIFICATION_QUEUE: 'notifications:queue',
  FAILED_NOTIFICATIONS: 'notifications:failed',
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  USER_NOTIFICATIONS: 300, // 5 minutes
  NOTIFICATION_COUNT: 60, // 1 minute
  UNREAD_COUNT: 30, // 30 seconds
  SYSTEM_NOTIFICATIONS: 600, // 10 minutes
  NOTIFICATION_PREFERENCES: 3600, // 1 hour
  PUSH_SUBSCRIPTIONS: 1800, // 30 minutes
  RATE_LIMIT: 3600, // 1 hour
};

// Redis Pub/Sub Channels
export const CHANNELS = {
  NEW_NOTIFICATION: 'notifications:new',
  NOTIFICATION_READ: 'notifications:read',
  SYSTEM_BROADCAST: 'notifications:system:broadcast',
  USER_ONLINE: 'users:online',
  USER_OFFLINE: 'users:offline',
};

// Redis Connection Event Handlers
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('⚠️ Redis client connection closed');
});

redisSubscriber.on('connect', () => {
  console.log('✅ Redis subscriber connected');
});

redisPublisher.on('connect', () => {
  console.log('✅ Redis publisher connected');
});

// Utility Functions
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

  // Decrement counter
  static async decr(key: string): Promise<number> {
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Redis DECR error:', error);
      throw error;
    }
  }

  // Add to list
  static async lpush(key: string, value: any): Promise<void> {
    try {
      await redisClient.lpush(key, JSON.stringify(value));
    } catch (error) {
      console.error('Redis LPUSH error:', error);
    }
  }

  // Get list range
  static async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await redisClient.lrange(key, start, stop);
      return values.map(value => JSON.parse(value));
    } catch (error) {
      console.error('Redis LRANGE error:', error);
      return [];
    }
  }

  // Add to set
  static async sadd(key: string, value: string): Promise<void> {
    try {
      await redisClient.sadd(key, value);
    } catch (error) {
      console.error('Redis SADD error:', error);
    }
  }

  // Remove from set
  static async srem(key: string, value: string): Promise<void> {
    try {
      await redisClient.srem(key, value);
    } catch (error) {
      console.error('Redis SREM error:', error);
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

  // Get all set members
  static async smembers(key: string): Promise<string[]> {
    try {
      return await redisClient.smembers(key);
    } catch (error) {
      console.error('Redis SMEMBERS error:', error);
      return [];
    }
  }
}

// Notification-specific Redis operations
export class NotificationCache {
  // Cache user notifications
  static async cacheUserNotifications(userId: string, notifications: any[]): Promise<void> {
    const key = CACHE_KEYS.USER_NOTIFICATIONS(userId);
    await RedisCache.set(key, notifications, CACHE_TTL.USER_NOTIFICATIONS);
  }

  // Get cached user notifications
  static async getCachedUserNotifications(userId: string): Promise<any[] | null> {
    const key = CACHE_KEYS.USER_NOTIFICATIONS(userId);
    return await RedisCache.get(key);
  }

  // Update unread count
  static async updateUnreadCount(userId: string, count: number): Promise<void> {
    const key = CACHE_KEYS.UNREAD_COUNT(userId);
    await RedisCache.set(key, count, CACHE_TTL.UNREAD_COUNT);
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number | null> {
    const key = CACHE_KEYS.UNREAD_COUNT(userId);
    return await RedisCache.get(key);
  }

  // Invalidate user notification cache
  static async invalidateUserCache(userId: string): Promise<void> {
    const keys = [
      CACHE_KEYS.USER_NOTIFICATIONS(userId),
      CACHE_KEYS.NOTIFICATION_COUNT(userId),
      CACHE_KEYS.UNREAD_COUNT(userId),
    ];
    
    await Promise.all(keys.map(key => RedisCache.del(key)));
  }

  // Add notification to queue for processing
  static async queueNotification(notification: any): Promise<void> {
    await RedisCache.lpush(CACHE_KEYS.NOTIFICATION_QUEUE, notification);
  }

  // Get notifications from queue
  static async getQueuedNotifications(count: number = 10): Promise<any[]> {
    return await RedisCache.lrange(CACHE_KEYS.NOTIFICATION_QUEUE, 0, count - 1);
  }
}

// Pub/Sub for real-time notifications
export class NotificationPubSub {
  // Publish new notification
  static async publishNewNotification(userId: string, notification: any): Promise<void> {
    try {
      await redisPublisher.publish(
        CHANNELS.NEW_NOTIFICATION,
        JSON.stringify({ userId, notification })
      );
    } catch (error) {
      console.error('Error publishing new notification:', error);
    }
  }

  // Publish notification read event
  static async publishNotificationRead(userId: string, notificationId: string): Promise<void> {
    try {
      await redisPublisher.publish(
        CHANNELS.NOTIFICATION_READ,
        JSON.stringify({ userId, notificationId })
      );
    } catch (error) {
      console.error('Error publishing notification read:', error);
    }
  }

  // Publish system broadcast
  static async publishSystemBroadcast(notification: any): Promise<void> {
    try {
      await redisPublisher.publish(
        CHANNELS.SYSTEM_BROADCAST,
        JSON.stringify(notification)
      );
    } catch (error) {
      console.error('Error publishing system broadcast:', error);
    }
  }

  // Subscribe to channels
  static async subscribeToChannels(channels: string[], callback: (channel: string, message: string) => void): Promise<void> {
    try {
      await redisSubscriber.subscribe(...channels);
      redisSubscriber.on('message', callback);
    } catch (error) {
      console.error('Error subscribing to channels:', error);
    }
  }
}

export default redisClient; 