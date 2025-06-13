# Redis Implementation Guide for AFRI-PLATES Microservices

## 🚀 Overview

This guide covers the comprehensive Redis implementation for caching and search functionality across the AFRI-PLATES microservices architecture, with a focus on the **Notification Service** and **Recipe Service**.

## 📋 Table of Contents

1. [Redis Architecture](#redis-architecture)
2. [Notification Service Redis Implementation](#notification-service-redis-implementation)
3. [Recipe Service Search Implementation](#recipe-service-search-implementation)
4. [Installation & Setup](#installation--setup)
5. [Usage Examples](#usage-examples)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Best Practices](#best-practices)

## 🏗️ Redis Architecture

### Redis Instances
- **Main Redis Client**: Primary caching and data operations
- **Redis Subscriber**: Pub/Sub message consumption
- **Redis Publisher**: Pub/Sub message publishing
- **Redis Search Client**: Dedicated search operations

### Database Separation
- **DB 0**: Notification Service (default)
- **DB 1**: Recipe Service
- **DB 2**: User Service (future)
- **DB 3**: Analytics (future)

## 🔔 Notification Service Redis Implementation

### Features Implemented

#### 1. **Real-time Notifications with Pub/Sub**
```typescript
// Publishing new notifications
await NotificationPubSub.publishNewNotification(userId, notification);

// Subscribing to notification channels
await NotificationPubSub.subscribeToChannels([
  CHANNELS.NEW_NOTIFICATION,
  CHANNELS.NOTIFICATION_READ,
  CHANNELS.SYSTEM_BROADCAST
], handleMessage);
```

#### 2. **Notification Caching**
```typescript
// Cache user notifications
await NotificationCache.cacheUserNotifications(userId, notifications);

// Get cached notifications
const cached = await NotificationCache.getCachedUserNotifications(userId);
```

#### 3. **Unread Count Management**
```typescript
// Update unread count
await NotificationCache.updateUnreadCount(userId, count);

// Get unread count
const unreadCount = await NotificationCache.getUnreadCount(userId);
```

#### 4. **Notification Queue Processing**
```typescript
// Queue notification for background processing
await NotificationCache.queueNotification(notification);

// Process queued notifications
const queued = await NotificationCache.getQueuedNotifications(10);
```

### Cache Keys Structure
```
notifications:user:{userId}           # User's notifications
notifications:count:{userId}          # Total notification count
notifications:unread:{userId}         # Unread notification count
notifications:system:active           # Active system notifications
notifications:preferences:{userId}    # User notification preferences
notifications:queue                   # Notification processing queue
```

### TTL (Time To Live) Configuration
- **User Notifications**: 5 minutes
- **Unread Count**: 30 seconds
- **System Notifications**: 10 minutes
- **User Preferences**: 1 hour

## 🔍 Recipe Service Search Implementation

### Features Implemented

#### 1. **Advanced Recipe Search with Caching**
```typescript
// Search with filters and caching
const result = await RecipeSearchService.searchRecipes(
  "chicken curry",
  { 
    category: "main-course",
    cuisine: "indian",
    difficulty: "medium",
    cookingTime: { max: 60 }
  },
  { 
    page: 1, 
    limit: 20, 
    sortBy: "popularity" 
  },
  userId
);
```

#### 2. **Ingredient-Based Search**
```typescript
// Search by ingredients with Redis optimization
const recipes = await RecipeSearchService.searchByIngredients(
  ["chicken", "tomatoes", "onions"],
  ["beef"], // exclude ingredients
  { page: 1, limit: 10 }
);
```

#### 3. **Search Indexing**
```typescript
// Index recipe for fast searching
await RecipeSearch.indexRecipe(recipe);

// Search by indexed ingredients
const recipeIds = await RecipeSearch.searchByIngredients(["chicken"]);
```

#### 4. **Personalized Recommendations**
```typescript
// Get personalized suggestions
const suggestions = await RecipeSearch.getPersonalizedSuggestions(userId, 10);

// Cache user preferences
await UserPreferences.cacheUserPreferences(userId, preferences);
```

#### 5. **Trending & Popular Recipes**
```typescript
// Get trending recipes with Redis scoring
const trending = await RecipeSearchService.getTrendingRecipes(10);

// Track recipe views for trending calculation
await RecipeCache.trackRecipeView(recipeId);
```

### Search Cache Keys Structure
```
recipe:{id}                           # Individual recipe cache
recipes:user:{userId}                 # User's recipes
recipes:popular                       # Popular recipes
recipes:trending                      # Trending recipes
search:{query_hash}                   # Search results cache
suggestions:{query}                   # Search suggestions
recipes:ingredient:{ingredient}       # Recipes by ingredient
recipes:category:{category}           # Recipes by category
user:preferences:{userId}             # User preferences
user:favorites:{userId}               # User favorites
```

### Search Indexing Strategy
- **Ingredient Index**: Set-based storage for fast intersection queries
- **Category Index**: Grouped recipe IDs by category
- **Trending Score**: Sorted sets with engagement scores
- **Full-text Search**: MongoDB text search with Redis caching

## 🛠️ Installation & Setup

### 1. Install Redis Dependencies
```bash
# In notification-service
cd backend/notification-service
npm install ioredis

# In recipe-service  
cd backend/recipe-service
npm install ioredis
```

### 2. Environment Configuration

#### Notification Service `.env`
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Notification Settings
NOTIFICATION_CACHE_TTL=300
UNREAD_COUNT_TTL=30
```

#### Recipe Service `.env`
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=1

# Search Settings
SEARCH_CACHE_TTL=300
TRENDING_UPDATE_INTERVAL=900
```

### 3. Docker Configuration
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  container_name: afri-plates-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 📚 Usage Examples

### Notification Service Examples

#### Creating and Caching Notifications
```typescript
import { NotificationCacheService } from './services/notificationCacheService';

// Create notification with automatic caching
const notification = await NotificationCacheService.createNotification({
  userId: "user123",
  type: "recipe_liked",
  title: "Your recipe was liked!",
  message: "John Doe liked your Jollof Rice recipe",
  priority: "medium"
});

// Get user notifications (cached)
const { notifications, unreadCount } = await NotificationCacheService.getUserNotifications(
  "user123",
  { isRead: false }, // filters
  { page: 1, limit: 10 } // options
);
```

#### Real-time Notification Handling
```typescript
import { NotificationPubSub, CHANNELS } from './config/redis';

// Subscribe to real-time notifications
await NotificationPubSub.subscribeToChannels(
  [CHANNELS.NEW_NOTIFICATION],
  (channel, message) => {
    const { userId, notification } = JSON.parse(message);
    
    // Send to WebSocket clients
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
);
```

### Recipe Service Examples

#### Advanced Recipe Search
```typescript
import { RecipeSearchService } from './services/searchService';

// Complex search with multiple filters
const searchResult = await RecipeSearchService.searchRecipes(
  "spicy chicken", // query
  {
    category: "main-course",
    cuisine: "african",
    difficulty: "medium",
    cookingTime: { min: 30, max: 90 },
    ingredients: ["chicken", "peppers"],
    excludeIngredients: ["beef"],
    isVegetarian: false,
    rating: { min: 4.0 }
  },
  {
    page: 1,
    limit: 20,
    sortBy: "popularity",
    sortOrder: "desc"
  },
  "user123" // for personalization
);
```

#### Ingredient-Based Search
```typescript
// Search recipes that contain specific ingredients
const recipes = await RecipeSearchService.searchByIngredients(
  ["tomatoes", "onions", "garlic"], // must have
  ["nuts"], // exclude
  { page: 1, limit: 15 }
);

// Get ingredient suggestions
const suggestions = await RecipeSearchService.getIngredientSuggestions("tom", 5);
// Returns: ["tomatoes", "tomato paste", "tomato sauce"]
```

#### Recipe Indexing and Caching
```typescript
// Index recipe for search (called when recipe is created/updated)
await RecipeSearchService.indexRecipe({
  _id: "recipe123",
  title: "Jollof Rice",
  ingredients: ["rice", "tomatoes", "onions", "chicken"],
  category: "main-course",
  cuisine: "nigerian",
  difficulty: "medium",
  tags: ["spicy", "one-pot", "family-meal"]
});

// Track recipe view (updates trending scores)
await RecipeSearchService.trackRecipeView("recipe123", "user123");
```

## ⚡ Performance Optimization

### 1. **Cache Warming Strategies**
```typescript
// Warm popular caches on startup
async function warmCaches() {
  // Pre-load trending recipes
  await RecipeSearchService.getTrendingRecipes(50);
  
  // Pre-load popular searches
  const popularQueries = ["chicken", "rice", "soup", "dessert"];
  for (const query of popularQueries) {
    await RecipeSearchService.searchRecipes(query, {}, { limit: 20 });
  }
}
```

### 2. **Batch Operations**
```typescript
// Batch cache invalidation
async function invalidateUserCaches(userIds: string[]) {
  const promises = userIds.map(userId => 
    NotificationCache.invalidateUserCache(userId)
  );
  await Promise.all(promises);
}
```

### 3. **Memory Optimization**
```typescript
// Use Redis pipelines for bulk operations
const pipeline = redisClient.pipeline();
recipeIds.forEach(id => {
  pipeline.get(CACHE_KEYS.RECIPE(id));
});
const results = await pipeline.exec();
```

## 📊 Monitoring & Debugging

### 1. **Redis Monitoring Commands**
```bash
# Monitor Redis operations
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys (development only)
redis-cli keys "*"

# Check specific key TTL
redis-cli ttl "notifications:user:123"
```

### 2. **Application Monitoring**
```typescript
// Add Redis health check
app.get('/health/redis', async (req, res) => {
  try {
    await redisClient.ping();
    res.json({ status: 'healthy', redis: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', redis: 'disconnected' });
  }
});
```

### 3. **Performance Metrics**
```typescript
// Track cache hit rates
let cacheHits = 0;
let cacheMisses = 0;

async function getCachedData(key: string) {
  const cached = await RedisCache.get(key);
  if (cached) {
    cacheHits++;
    return cached;
  } else {
    cacheMisses++;
    return null;
  }
}

// Log cache performance
setInterval(() => {
  const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;
  console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
}, 60000);
```

## 🎯 Best Practices

### 1. **Key Naming Conventions**
- Use consistent prefixes: `service:type:identifier`
- Include version in keys for schema changes: `v1:recipe:123`
- Use descriptive names: `notifications:unread:user123`

### 2. **TTL Management**
- Always set TTL for temporary data
- Use shorter TTL for frequently changing data
- Implement cache warming for critical data

### 3. **Error Handling**
```typescript
// Graceful Redis failures
async function getCachedRecipe(id: string) {
  try {
    return await RecipeCache.getCachedRecipe(id);
  } catch (error) {
    console.error('Redis error, falling back to database:', error);
    return await Recipe.findById(id);
  }
}
```

### 4. **Memory Management**
- Use Redis `EXPIRE` for automatic cleanup
- Implement LRU eviction policies
- Monitor memory usage regularly

### 5. **Security**
- Use Redis AUTH in production
- Implement network security (VPC, firewalls)
- Encrypt sensitive cached data

## 🚀 API Endpoints

### Notification Service Endpoints
```
GET    /api/notifications              # Get user notifications (cached)
POST   /api/notifications              # Create notification
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/:id          # Delete notification
GET    /api/notifications/unread-count # Get unread count (cached)
```

### Recipe Service Search Endpoints
```
GET    /api/recipes/search                    # Advanced search (cached)
GET    /api/recipes/search/ingredients        # Ingredient-based search
GET    /api/recipes/search/suggestions        # Search suggestions (cached)
GET    /api/recipes/trending                  # Trending recipes (cached)
GET    /api/recipes/popular                   # Popular recipes (cached)
GET    /api/recipes/recommendations           # Personalized recommendations
POST   /api/recipes/:id/view                  # Track recipe view
```

## 🔧 Troubleshooting

### Common Issues

1. **Redis Connection Errors**
   - Check Redis server status
   - Verify connection parameters
   - Check network connectivity

2. **Cache Miss Issues**
   - Verify TTL settings
   - Check key naming consistency
   - Monitor cache invalidation logic

3. **Memory Issues**
   - Monitor Redis memory usage
   - Implement proper TTL
   - Use Redis `FLUSHDB` for cleanup (development only)

4. **Performance Issues**
   - Use Redis pipelining for bulk operations
   - Optimize key structures
   - Monitor slow queries

This Redis implementation provides a robust foundation for caching and search functionality across your microservices architecture, significantly improving performance and user experience. 