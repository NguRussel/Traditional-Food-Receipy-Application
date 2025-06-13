import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '1'), // Use DB 1 for recipe service
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis instances
export const redisClient = new Redis(redisConfig);
export const redisSearchClient = new Redis(redisConfig);

// Redis Cache Keys for Recipe Service
export const CACHE_KEYS = {
  // Recipe caching
  RECIPE: (id: string) => `recipe:${id}`,
  RECIPES_BY_USER: (userId: string) => `recipes:user:${userId}`,
  RECIPES_BY_CHEF: (chefId: string) => `recipes:chef:${chefId}`,
  POPULAR_RECIPES: 'recipes:popular',
  TRENDING_RECIPES: 'recipes:trending',
  FEATURED_RECIPES: 'recipes:featured',
  
  // Search caching
  SEARCH_RESULTS: (query: string, filters: string) => `search:${Buffer.from(query + filters).toString('base64')}`,
  SEARCH_SUGGESTIONS: (query: string) => `suggestions:${query.toLowerCase()}`,
  SEARCH_HISTORY: (userId: string) => `search:history:${userId}`,
  
  // Category and tag caching
  RECIPES_BY_CATEGORY: (category: string) => `recipes:category:${category}`,
  RECIPES_BY_TAG: (tag: string) => `recipes:tag:${tag}`,
  RECIPES_BY_CUISINE: (cuisine: string) => `recipes:cuisine:${cuisine}`,
  RECIPES_BY_DIFFICULTY: (difficulty: string) => `recipes:difficulty:${difficulty}`,
  
  // Ingredient-based search
  RECIPES_BY_INGREDIENT: (ingredient: string) => `recipes:ingredient:${ingredient}`,
  INGREDIENT_SUGGESTIONS: 'ingredients:suggestions',
  
  // Recipe statistics
  RECIPE_VIEWS: (id: string) => `recipe:views:${id}`,
  RECIPE_LIKES: (id: string) => `recipe:likes:${id}`,
  RECIPE_RATINGS: (id: string) => `recipe:ratings:${id}`,
  
  // User preferences
  USER_PREFERENCES: (userId: string) => `user:preferences:${userId}`,
  USER_FAVORITES: (userId: string) => `user:favorites:${userId}`,
  
  // Rate limiting
  RATE_LIMIT: (userId: string, action: string) => `rate_limit:${action}:${userId}`,
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  RECIPE: 1800, // 30 minutes
  RECIPES_LIST: 600, // 10 minutes
  SEARCH_RESULTS: 300, // 5 minutes
  SEARCH_SUGGESTIONS: 3600, // 1 hour
  POPULAR_RECIPES: 1800, // 30 minutes
  TRENDING_RECIPES: 900, // 15 minutes
  FEATURED_RECIPES: 3600, // 1 hour
  CATEGORY_RECIPES: 1200, // 20 minutes
  INGREDIENT_SUGGESTIONS: 7200, // 2 hours
  USER_PREFERENCES: 3600, // 1 hour
  SEARCH_HISTORY: 86400, // 24 hours
  RECIPE_STATS: 300, // 5 minutes
};

// Redis Connection Event Handlers
redisClient.on('connect', () => {
  console.log('✅ Recipe Service Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ Recipe Service Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ Recipe Service Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('⚠️ Recipe Service Redis client connection closed');
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

  // Add to sorted set with score
  static async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await redisClient.zadd(key, score, member);
    } catch (error) {
      console.error('Redis ZADD error:', error);
    }
  }

  // Get sorted set range
  static async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await redisClient.zrevrange(key, start, stop);
    } catch (error) {
      console.error('Redis ZREVRANGE error:', error);
      return [];
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

  // Get set members
  static async smembers(key: string): Promise<string[]> {
    try {
      return await redisClient.smembers(key);
    } catch (error) {
      console.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  // Add to list
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
}

// Recipe-specific caching operations
export class RecipeCache {
  // Cache single recipe
  static async cacheRecipe(recipe: any): Promise<void> {
    const key = CACHE_KEYS.RECIPE(recipe._id || recipe.id);
    await RedisCache.set(key, recipe, CACHE_TTL.RECIPE);
  }

  // Get cached recipe
  static async getCachedRecipe(id: string): Promise<any | null> {
    const key = CACHE_KEYS.RECIPE(id);
    return await RedisCache.get(key);
  }

  // Cache recipes list
  static async cacheRecipesList(cacheKey: string, recipes: any[], ttl?: number): Promise<void> {
    await RedisCache.set(cacheKey, recipes, ttl || CACHE_TTL.RECIPES_LIST);
  }

  // Get cached recipes list
  static async getCachedRecipesList(cacheKey: string): Promise<any[] | null> {
    return await RedisCache.get(cacheKey);
  }

  // Cache popular recipes
  static async cachePopularRecipes(recipes: any[]): Promise<void> {
    await RedisCache.set(CACHE_KEYS.POPULAR_RECIPES, recipes, CACHE_TTL.POPULAR_RECIPES);
  }

  // Get popular recipes
  static async getPopularRecipes(): Promise<any[] | null> {
    return await RedisCache.get(CACHE_KEYS.POPULAR_RECIPES);
  }

  // Cache trending recipes
  static async cacheTrendingRecipes(recipes: any[]): Promise<void> {
    await RedisCache.set(CACHE_KEYS.TRENDING_RECIPES, recipes, CACHE_TTL.TRENDING_RECIPES);
  }

  // Get trending recipes
  static async getTrendingRecipes(): Promise<any[] | null> {
    return await RedisCache.get(CACHE_KEYS.TRENDING_RECIPES);
  }

  // Invalidate recipe cache
  static async invalidateRecipeCache(recipeId: string): Promise<void> {
    const keys = [
      CACHE_KEYS.RECIPE(recipeId),
      CACHE_KEYS.POPULAR_RECIPES,
      CACHE_KEYS.TRENDING_RECIPES,
      CACHE_KEYS.FEATURED_RECIPES,
    ];
    
    await Promise.all(keys.map(key => RedisCache.del(key)));
    
    // Also clear search results that might contain this recipe
    await RedisCache.delPattern('search:*');
  }

  // Track recipe view
  static async trackRecipeView(recipeId: string): Promise<number> {
    const key = CACHE_KEYS.RECIPE_VIEWS(recipeId);
    return await RedisCache.incr(key, CACHE_TTL.RECIPE_STATS);
  }

  // Get recipe view count
  static async getRecipeViews(recipeId: string): Promise<number> {
    const key = CACHE_KEYS.RECIPE_VIEWS(recipeId);
    const views = await RedisCache.get<number>(key);
    return views || 0;
  }
}

// Search-specific operations
export class RecipeSearch {
  // Cache search results
  static async cacheSearchResults(query: string, filters: any, results: any[]): Promise<void> {
    const filtersString = JSON.stringify(filters);
    const key = CACHE_KEYS.SEARCH_RESULTS(query, filtersString);
    await RedisCache.set(key, results, CACHE_TTL.SEARCH_RESULTS);
  }

  // Get cached search results
  static async getCachedSearchResults(query: string, filters: any): Promise<any[] | null> {
    const filtersString = JSON.stringify(filters);
    const key = CACHE_KEYS.SEARCH_RESULTS(query, filtersString);
    return await RedisCache.get(key);
  }

  // Cache search suggestions
  static async cacheSearchSuggestions(query: string, suggestions: string[]): Promise<void> {
    const key = CACHE_KEYS.SEARCH_SUGGESTIONS(query);
    await RedisCache.set(key, suggestions, CACHE_TTL.SEARCH_SUGGESTIONS);
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string): Promise<string[] | null> {
    const key = CACHE_KEYS.SEARCH_SUGGESTIONS(query);
    return await RedisCache.get(key);
  }

  // Add to search history
  static async addToSearchHistory(userId: string, query: string): Promise<void> {
    const key = CACHE_KEYS.SEARCH_HISTORY(userId);
    await RedisCache.lpush(key, JSON.stringify({ query, timestamp: new Date() }));
    
    // Keep only last 50 searches
    await redisClient.ltrim(key, 0, 49);
    await redisClient.expire(key, CACHE_TTL.SEARCH_HISTORY);
  }

  // Get search history
  static async getSearchHistory(userId: string, limit: number = 10): Promise<any[]> {
    const key = CACHE_KEYS.SEARCH_HISTORY(userId);
    const history = await RedisCache.lrange(key, 0, limit - 1);
    return history.map(item => JSON.parse(item));
  }

  // Build search index for recipes
  static async indexRecipe(recipe: any): Promise<void> {
    try {
      const recipeId = recipe._id || recipe.id;
      
      // Index by ingredients
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        for (const ingredient of recipe.ingredients) {
          const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
          if (ingredientName) {
            const key = CACHE_KEYS.RECIPES_BY_INGREDIENT(ingredientName.toLowerCase());
            await RedisCache.sadd(key, recipeId);
          }
        }
      }

      // Index by category
      if (recipe.category) {
        const key = CACHE_KEYS.RECIPES_BY_CATEGORY(recipe.category.toLowerCase());
        await RedisCache.sadd(key, recipeId);
      }

      // Index by cuisine
      if (recipe.cuisine) {
        const key = CACHE_KEYS.RECIPES_BY_CUISINE(recipe.cuisine.toLowerCase());
        await RedisCache.sadd(key, recipeId);
      }

      // Index by difficulty
      if (recipe.difficulty) {
        const key = CACHE_KEYS.RECIPES_BY_DIFFICULTY(recipe.difficulty.toLowerCase());
        await RedisCache.sadd(key, recipeId);
      }

      // Index by tags
      if (recipe.tags && Array.isArray(recipe.tags)) {
        for (const tag of recipe.tags) {
          const key = CACHE_KEYS.RECIPES_BY_TAG(tag.toLowerCase());
          await RedisCache.sadd(key, recipeId);
        }
      }

      // Add to trending if it has high engagement
      if (recipe.likes > 10 || recipe.views > 100) {
        await RedisCache.zadd('recipes:trending:scores', recipe.likes + recipe.views, recipeId);
      }

    } catch (error) {
      console.error('Error indexing recipe:', error);
    }
  }

  // Search recipes by ingredient
  static async searchByIngredient(ingredient: string): Promise<string[]> {
    const key = CACHE_KEYS.RECIPES_BY_INGREDIENT(ingredient.toLowerCase());
    return await RedisCache.smembers(key);
  }

  // Search recipes by multiple ingredients
  static async searchByIngredients(ingredients: string[]): Promise<string[]> {
    try {
      const keys = ingredients.map(ingredient => 
        CACHE_KEYS.RECIPES_BY_INGREDIENT(ingredient.toLowerCase())
      );
      
      if (keys.length === 1) {
        return await RedisCache.smembers(keys[0]);
      }

      // Find intersection of all ingredient sets
      const tempKey = `temp:intersection:${Date.now()}`;
      await redisClient.sinterstore(tempKey, ...keys);
      const result = await RedisCache.smembers(tempKey);
      await RedisCache.del(tempKey);
      
      return result;
    } catch (error) {
      console.error('Error searching by ingredients:', error);
      return [];
    }
  }

  // Get recipe suggestions based on user preferences
  static async getPersonalizedSuggestions(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const preferencesData = await RedisCache.get(CACHE_KEYS.USER_PREFERENCES(userId));
      if (!preferencesData) {
        // Return popular recipes if no preferences
        return await RedisCache.zrevrange('recipes:trending:scores', 0, limit - 1);
      }

      const preferences = preferencesData as IUserPreferences;
      // Build suggestions based on preferences
      const suggestionKeys: string[] = [];
      
      if (preferences.favoriteCategories) {
        preferences.favoriteCategories.forEach((category: string) => {
          suggestionKeys.push(CACHE_KEYS.RECIPES_BY_CATEGORY(category.toLowerCase()));
        });
      }

      if (preferences.favoriteCuisines) {
        preferences.favoriteCuisines.forEach((cuisine: string) => {
          suggestionKeys.push(CACHE_KEYS.RECIPES_BY_CUISINE(cuisine.toLowerCase()));
        });
      }

      if (suggestionKeys.length === 0) {
        return await RedisCache.zrevrange('recipes:trending:scores', 0, limit - 1);
      }

      // Union all preference-based recipe sets
      const tempKey = `temp:suggestions:${userId}:${Date.now()}`;
      await redisClient.sunionstore(tempKey, ...suggestionKeys);
      const suggestions = await RedisCache.smembers(tempKey);
      await RedisCache.del(tempKey);

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized suggestions:', error);
      return [];
    }
  }

  // Update ingredient suggestions
  static async updateIngredientSuggestions(ingredients: string[]): Promise<void> {
    const key = CACHE_KEYS.INGREDIENT_SUGGESTIONS;
    await RedisCache.sadd(key, ...ingredients.map(ing => ing.toLowerCase()));
    await redisClient.expire(key, CACHE_TTL.INGREDIENT_SUGGESTIONS);
  }

  // Get ingredient suggestions
  static async getIngredientSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const key = CACHE_KEYS.INGREDIENT_SUGGESTIONS;
    const allIngredients = await RedisCache.smembers(key);
    
    // Filter ingredients that start with the query
    const filtered = allIngredients
      .filter(ingredient => ingredient.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, limit);
    
    return filtered;
  }

  // Clear search cache
  static async clearSearchCache(): Promise<void> {
    await RedisCache.delPattern('search:*');
    await RedisCache.delPattern('suggestions:*');
  }
}

// User preferences interface
interface IUserPreferences {
  favoriteCategories?: string[];
  favoriteCuisines?: string[];
  [key: string]: any;
}

// User preference management
export class UserPreferences {
  // Cache user preferences
  static async cacheUserPreferences(userId: string, preferences: any): Promise<void> {
    const key = CACHE_KEYS.USER_PREFERENCES(userId);
    await RedisCache.set(key, preferences, CACHE_TTL.USER_PREFERENCES);
  }

  // Get user preferences
  static async getUserPreferences(userId: string): Promise<any | null> {
    const key = CACHE_KEYS.USER_PREFERENCES(userId);
    return await RedisCache.get(key);
  }

  // Add to user favorites
  static async addToFavorites(userId: string, recipeId: string): Promise<void> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    await RedisCache.sadd(key, recipeId);
  }

  // Remove from user favorites
  static async removeFromFavorites(userId: string, recipeId: string): Promise<void> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    await redisClient.srem(key, recipeId);
  }

  // Get user favorites
  static async getUserFavorites(userId: string): Promise<string[]> {
    const key = CACHE_KEYS.USER_FAVORITES(userId);
    return await RedisCache.smembers(key);
  }
}

export default redisClient; 