import { RecipeSearch, RecipeCache, UserPreferences, RedisCache, redisClient } from '../config/redis';
import Recipe from '../models/Recipe'; // Default export
import mongoose from 'mongoose';
export interface SearchFilters {
  category?: string;
  cuisine?: string;
  difficulty?: string;
  cookingTime?: { min?: number; max?: number };
  servings?: { min?: number; max?: number };
  tags?: string[];
  ingredients?: string[];
  excludeIngredients?: string[];
  rating?: { min?: number };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  chefId?: string;
  userId?: string;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'rating' | 'cookingTime' | 'createdAt' | 'popularity' | 'trending';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

export interface SearchResult {
  recipes: any[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  suggestions?: string[];
  filters?: any;
}

export class RecipeSearchService {
  /**
   * Main search function with Redis caching
   */
  static async searchRecipes(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {},
    userId?: string
  ): Promise<SearchResult> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'relevance',
        sortOrder = 'desc',
        includeInactive = false
      } = options;

      // Check cache first
      const cacheKey = this.generateCacheKey(query, filters, options);
      const cachedResult = await RecipeSearch.getCachedSearchResults(query, { filters, options });
      
      if (cachedResult) {
        console.log('🚀 Returning cached search results');
        
        // Track search for analytics (async)
        if (userId) {
          RecipeSearch.addToSearchHistory(userId, query).catch(console.error);
        }
        
        return this.formatSearchResult(cachedResult, page, limit);
      }

      console.log('🔍 Performing fresh search');

      // Build MongoDB aggregation pipeline
      const pipeline = await this.buildSearchPipeline(query, filters, options);
      
      // Execute search
      const [results, totalCount] = await Promise.all([
        Recipe.aggregate(pipeline),
        this.getSearchCount(query, filters, options)
      ]);

      // Process and enhance results
      const enhancedResults = await this.enhanceSearchResults(results, userId);

      // Cache the results
      await RecipeSearch.cacheSearchResults(query, { filters, options }, enhancedResults);

      // Track search for analytics and suggestions
      if (userId) {
        await Promise.all([
          RecipeSearch.addToSearchHistory(userId, query),
          this.updateSearchAnalytics(query, filters, results.length)
        ]);
      }

      // Generate suggestions for empty results
      let suggestions: string[] = [];
      if (results.length === 0) {
        suggestions = await this.generateSearchSuggestions(query, filters);
      }

      return {
        recipes: enhancedResults,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
        suggestions,
        filters: this.getAppliedFilters(filters)
      };

    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  /**
   * Search by ingredients with Redis optimization
   */
  static async searchByIngredients(
    ingredients: string[],
    excludeIngredients: string[] = [],
    options: SearchOptions = {},
    userId?: string
  ): Promise<SearchResult> {
    try {
      // Check Redis index first for fast ingredient-based search
      const recipeIds = await RecipeSearch.searchByIngredients(ingredients);
      
      if (recipeIds.length === 0) {
        return {
          recipes: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          suggestions: await this.getIngredientSuggestions(ingredients[0] || '')
        };
      }

      // Get full recipe data from cache or database
      const recipes = await this.getRecipesByIds(recipeIds, excludeIngredients, options);
      
      // Track ingredient search
      if (userId) {
        RecipeSearch.addToSearchHistory(userId, `ingredients: ${ingredients.join(', ')}`).catch(console.error);
      }

      const { page = 1, limit = 20 } = options;
      return this.formatSearchResult(recipes, page, limit);

    } catch (error) {
      console.error('Ingredient search error:', error);
      throw new Error('Ingredient search service temporarily unavailable');
    }
  }

  /**
   * Get personalized recipe recommendations
   */
  static async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Check if we have cached recommendations
      const cacheKey = `recommendations:user:${userId}`;
      const cached = await RedisCache.get<any[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get personalized suggestions from Redis
      const recipeIds = await RecipeSearch.getPersonalizedSuggestions(userId, limit * 2);
      
      if (recipeIds.length === 0) {
        // Fallback to trending recipes
        const trending = await this.getTrendingRecipes(limit);
        await RedisCache.set(cacheKey, trending, 300); // Cache for 5 minutes
        return trending;
      }

      // Get full recipe data
      const recipes = await this.getRecipesByIds(recipeIds.slice(0, limit));
      
      // Cache recommendations
      await RedisCache.set(cacheKey, recipes, 600); // Cache for 10 minutes
      
      return recipes;

    } catch (error) {
      console.error('Personalized recommendations error:', error);
      return [];
    }
  }

  /**
   * Get trending recipes with Redis caching
   */
  static async getTrendingRecipes(limit: number = 10): Promise<any[]> {
    try {
      // Check cache first
      const cached = await RecipeCache.getTrendingRecipes();
      if (cached) {
        return cached.slice(0, limit);
      }

      // Get trending recipe IDs from Redis sorted set
      const trendingIds = await RedisCache.zrevrange('recipes:trending:scores', 0, limit - 1);
      
      if (trendingIds.length === 0) {
        // Fallback to database query
        const trending = await Recipe.find({ isActive: true })
          .sort({ views: -1, likes: -1, createdAt: -1 })
          .limit(limit)
          .lean();
        
        await RecipeCache.cacheTrendingRecipes(trending);
        return trending;
      }

      // Get full recipe data
      const recipes = await this.getRecipesByIds(trendingIds);
      await RecipeCache.cacheTrendingRecipes(recipes);
      
      return recipes;

    } catch (error) {
      console.error('Trending recipes error:', error);
      return [];
    }
  }

  /**
   * Get popular recipes with caching
   */
  static async getPopularRecipes(limit: number = 10): Promise<any[]> {
    try {
      const cached = await RecipeCache.getPopularRecipes();
      if (cached) {
        return cached.slice(0, limit);
      }

      const popular = await Recipe.find({ isActive: true })
        .sort({ likes: -1, rating: -1, views: -1 })
        .limit(limit)
        .lean();

      await RecipeCache.cachePopularRecipes(popular);
      return popular;

    } catch (error) {
      console.error('Popular recipes error:', error);
      return [];
    }
  }

  /**
   * Search suggestions with Redis caching
   */
  static async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      // Check cache first
      const cached = await RecipeSearch.getSearchSuggestions(query);
      if (cached) {
        return cached.slice(0, limit);
      }

      // Generate suggestions based on recipe titles, ingredients, and tags
      const suggestions = await this.generateSearchSuggestions(query, {}, limit);
      
      // Cache suggestions
      await RecipeSearch.cacheSearchSuggestions(query, suggestions);
      
      return suggestions;

    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  /**
   * Get ingredient suggestions
   */
  static async getIngredientSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      return await RecipeSearch.getIngredientSuggestions(query, limit);
    } catch (error) {
      console.error('Ingredient suggestions error:', error);
      return [];
    }
  }

  /**
   * Track recipe view and update cache
   */
  static async trackRecipeView(recipeId: string, userId?: string): Promise<void> {
    try {
      // Increment view count in Redis
      await RecipeCache.trackRecipeView(recipeId);
      
      // Update trending score
      await RedisCache.zadd('recipes:trending:scores', Date.now(), recipeId);
      
      // Update database (async)
      Recipe.findByIdAndUpdate(recipeId, { $inc: { views: 1 } }).catch(console.error);
      
      // Track user view history
      if (userId) {
        const key = `user:views:${userId}`;
        await RedisCache.lpush(key, recipeId);
        await redisClient.ltrim(key, 0, 99); // Keep last 100 views
      }

    } catch (error) {
      console.error('Track recipe view error:', error);
    }
  }

  /**
   * Update recipe index when recipe is created/updated
   */
  static async indexRecipe(recipe: any): Promise<void> {
    try {
      // Index in Redis for fast searching
      await RecipeSearch.indexRecipe(recipe);
      
      // Cache the recipe
      await RecipeCache.cacheRecipe(recipe);
      
      // Update ingredient suggestions
      if (recipe.ingredients) {
        const ingredients = recipe.ingredients.map((ing: any) => 
          typeof ing === 'string' ? ing : ing.name
        ).filter(Boolean);
        
        await RecipeSearch.updateIngredientSuggestions(ingredients);
      }

    } catch (error) {
      console.error('Recipe indexing error:', error);
    }
  }

  /**
   * Remove recipe from search index
   */
  static async removeFromIndex(recipeId: string): Promise<void> {
    try {
      await RecipeCache.invalidateRecipeCache(recipeId);
      
      // Remove from trending
      await redisClient.zrem('recipes:trending:scores', recipeId);
      
      // Clear related caches
      await RedisCache.delPattern(`*${recipeId}*`);

    } catch (error) {
      console.error('Remove from index error:', error);
    }
  }

  // Private helper methods

  private static generateCacheKey(query: string, filters: SearchFilters, options: SearchOptions): string {
    const key = `${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
    return Buffer.from(key).toString('base64');
  }

  private static async buildSearchPipeline(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<any[]> {
    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = { isActive: true };

    // Text search
    if (query) {
      matchStage.$text = { $search: query };
    }

    // Apply filters
    if (filters.category) {
      matchStage.category = new RegExp(filters.category, 'i');
    }

    if (filters.cuisine) {
      matchStage.cuisine = new RegExp(filters.cuisine, 'i');
    }

    if (filters.difficulty) {
      matchStage.difficulty = filters.difficulty;
    }

    if (filters.cookingTime) {
      matchStage.cookingTime = {};
      if (filters.cookingTime.min) matchStage.cookingTime.$gte = filters.cookingTime.min;
      if (filters.cookingTime.max) matchStage.cookingTime.$lte = filters.cookingTime.max;
    }

    if (filters.servings) {
      matchStage.servings = {};
      if (filters.servings.min) matchStage.servings.$gte = filters.servings.min;
      if (filters.servings.max) matchStage.servings.$lte = filters.servings.max;
    }

    if (filters.rating?.min) {
      matchStage.rating = { $gte: filters.rating.min };
    }

    if (filters.tags && filters.tags.length > 0) {
      matchStage.tags = { $in: filters.tags };
    }

    if (filters.ingredients && filters.ingredients.length > 0) {
      matchStage['ingredients.name'] = { $in: filters.ingredients.map(ing => new RegExp(ing, 'i')) };
    }

    if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
      matchStage['ingredients.name'] = { 
        ...matchStage['ingredients.name'],
        $nin: filters.excludeIngredients.map(ing => new RegExp(ing, 'i'))
      };
    }

    if (filters.isVegetarian) matchStage.isVegetarian = true;
    if (filters.isVegan) matchStage.isVegan = true;
    if (filters.isGlutenFree) matchStage.isGlutenFree = true;
    if (filters.isDairyFree) matchStage.isDairyFree = true;

    if (filters.chefId) {
      matchStage.chefId = new mongoose.Types.ObjectId(filters.chefId);
    }

    if (filters.userId) {
      matchStage.userId = new mongoose.Types.ObjectId(filters.userId);
    }

    pipeline.push({ $match: matchStage });

    // Add score for text search
    if (query) {
      pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
    }

    // Sort stage
    const sortStage: any = {};
    switch (options.sortBy) {
      case 'rating':
        sortStage.rating = options.sortOrder === 'asc' ? 1 : -1;
        break;
      case 'cookingTime':
        sortStage.cookingTime = options.sortOrder === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
        sortStage.createdAt = options.sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sortStage.likes = -1;
        sortStage.views = -1;
        break;
      case 'trending':
        sortStage.views = -1;
        sortStage.createdAt = -1;
        break;
      default: // relevance
        if (query) {
          sortStage.score = { $meta: 'textScore' };
        } else {
          sortStage.createdAt = -1;
        }
    }

    pipeline.push({ $sort: sortStage });

    // Pagination
    const { page = 1, limit = 20 } = options;
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Populate chef information
    pipeline.push({
      $lookup: {
        from: 'chefs',
        localField: 'chefId',
        foreignField: '_id',
        as: 'chef',
        pipeline: [{ $project: { name: 1, avatar: 1, verified: 1 } }]
      }
    });

    pipeline.push({
      $addFields: {
        chef: { $arrayElemAt: ['$chef', 0] }
      }
    });

    return pipeline;
  }

  private static async getSearchCount(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<number> {
    const pipeline = await this.buildSearchPipeline(query, filters, options);
    
    // Remove pagination and sorting for count
    const countPipeline = pipeline.filter(stage => 
      !stage.$skip && !stage.$limit && !stage.$sort && !stage.$lookup && !stage.$addFields
    );
    
    countPipeline.push({ $count: 'total' });
    
    const result = await Recipe.aggregate(countPipeline);
    return result[0]?.total || 0;
  }

  private static async enhanceSearchResults(results: any[], userId?: string): Promise<any[]> {
    try {
      // Get user favorites if userId provided
      let userFavorites: string[] = [];
      if (userId) {
        userFavorites = await UserPreferences.getUserFavorites(userId);
      }

      // Enhance each recipe with additional data
      return results.map(recipe => ({
        ...recipe,
        isFavorite: userId ? userFavorites.includes(recipe._id.toString()) : false,
        viewCount: 0, // Will be populated from Redis if needed
      }));

    } catch (error) {
      console.error('Error enhancing search results:', error);
      return results;
    }
  }

  private static async getRecipesByIds(
    recipeIds: string[],
    excludeIngredients: string[] = [],
    options: SearchOptions = {}
  ): Promise<any[]> {
    try {
      // Try to get from cache first
      const cachedRecipes: any[] = [];
      const uncachedIds: string[] = [];

      for (const id of recipeIds) {
        const cached = await RecipeCache.getCachedRecipe(id);
        if (cached) {
          cachedRecipes.push(cached);
        } else {
          uncachedIds.push(id);
        }
      }

      // Get uncached recipes from database
      let dbRecipes: any[] = [];
      if (uncachedIds.length > 0) {
        const query: any = { 
          _id: { $in: uncachedIds.map(id => new mongoose.Types.ObjectId(id)) },
          isActive: true 
        };

        // Apply exclude ingredients filter
        if (excludeIngredients.length > 0) {
          query['ingredients.name'] = { 
            $nin: excludeIngredients.map(ing => new RegExp(ing, 'i'))
          };
        }

        dbRecipes = await Recipe.find(query).lean();

        // Cache the recipes
        for (const recipe of dbRecipes) {
          RecipeCache.cacheRecipe(recipe).catch(console.error);
        }
      }

      // Combine and sort by original order
      const allRecipes = [...cachedRecipes, ...dbRecipes];
      const orderedRecipes = recipeIds
        .map(id => allRecipes.find(recipe => recipe._id.toString() === id))
        .filter(Boolean);

      return orderedRecipes;

    } catch (error) {
      console.error('Error getting recipes by IDs:', error);
      return [];
    }
  }

  private static async generateSearchSuggestions(
    query: string,
    filters: SearchFilters,
    limit: number = 5
  ): Promise<string[]> {
    try {
      const suggestions: string[] = [];

      // Get suggestions from recipe titles
      const titleSuggestions = await Recipe.find({
        title: new RegExp(query, 'i'),
        isActive: true
      })
      .select('title')
      .limit(limit)
      .lean();

      suggestions.push(...titleSuggestions.map((r: any) => r.title));

      // Get ingredient suggestions if not enough
      if (suggestions.length < limit) {
        const ingredientSuggestions = await this.getIngredientSuggestions(query, limit - suggestions.length);
        suggestions.push(...ingredientSuggestions);
      }

      return [...new Set(suggestions)].slice(0, limit);

    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  private static formatSearchResult(
    recipes: any[],
    page: number,
    limit: number
  ): SearchResult {
    const total = recipes.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    return {
      recipes: paginatedRecipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: endIndex < total,
      hasPrev: page > 1
    };
  }

  private static getAppliedFilters(filters: SearchFilters): any {
    const applied: any = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          applied[key] = value;
        } else if (!Array.isArray(value)) {
          applied[key] = value;
        }
      }
    });

    return applied;
  }

  private static async updateSearchAnalytics(
    query: string,
    filters: SearchFilters,
    resultCount: number
  ): Promise<void> {
    try {
      // Track search analytics in Redis
      const analyticsKey = `analytics:search:${new Date().toISOString().split('T')[0]}`;
      await RedisCache.incr(analyticsKey, 86400); // 24 hour TTL

      // Track popular search terms
      const popularKey = 'analytics:popular_searches';
      await RedisCache.zadd(popularKey, Date.now(), query);

    } catch (error) {
      console.error('Error updating search analytics:', error);
    }
  }
}

export default RecipeSearchService; 