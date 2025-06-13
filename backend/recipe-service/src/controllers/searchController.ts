import { Request, Response, NextFunction } from 'express';
import { RecipeSearchService, SearchFilters, SearchOptions } from '../services/searchService';
import { RecipeCache, RecipeSearch, UserPreferences } from '../config/redis';

// Interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Simple asyncHandler utility
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Search recipes with filters and caching
 * @route   GET /api/recipes/search
 * @access  Public
 */
export const searchRecipes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      q: query = '',
      category,
      cuisine,
      difficulty,
      cookingTimeMin,
      cookingTimeMax,
      servingsMin,
      servingsMax,
      tags,
      ingredients,
      excludeIngredients,
      ratingMin,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isDairyFree,
      chefId,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    // Build filters object
    const filters: SearchFilters = {};
    
    if (category) filters.category = category as string;
    if (cuisine) filters.cuisine = cuisine as string;
    if (difficulty) filters.difficulty = difficulty as string;
    if (chefId) filters.chefId = chefId as string;
    
    if (cookingTimeMin || cookingTimeMax) {
      filters.cookingTime = {};
      if (cookingTimeMin) filters.cookingTime.min = parseInt(cookingTimeMin as string);
      if (cookingTimeMax) filters.cookingTime.max = parseInt(cookingTimeMax as string);
    }
    
    if (servingsMin || servingsMax) {
      filters.servings = {};
      if (servingsMin) filters.servings.min = parseInt(servingsMin as string);
      if (servingsMax) filters.servings.max = parseInt(servingsMax as string);
    }
    
    if (ratingMin) {
      filters.rating = { min: parseFloat(ratingMin as string) };
    }
    
    if (tags) {
      filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
    }
    
    if (ingredients) {
      filters.ingredients = Array.isArray(ingredients) ? ingredients as string[] : [ingredients as string];
    }
    
    if (excludeIngredients) {
      filters.excludeIngredients = Array.isArray(excludeIngredients) 
        ? excludeIngredients as string[] 
        : [excludeIngredients as string];
    }
    
    if (isVegetarian === 'true') filters.isVegetarian = true;
    if (isVegan === 'true') filters.isVegan = true;
    if (isGlutenFree === 'true') filters.isGlutenFree = true;
    if (isDairyFree === 'true') filters.isDairyFree = true;

    // Build options object
    const options: SearchOptions = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100), // Max 100 per page
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    // Perform search
    const result = await RecipeSearchService.searchRecipes(
      query as string,
      filters,
      options,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      message: 'Recipes retrieved successfully',
      data: result,
      cached: false // You could track this if needed
    });

  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching recipes',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
};

/**
 * @desc    Search recipes by ingredients
 * @route   GET /api/recipes/search/ingredients
 * @access  Public
 */
export const searchByIngredients = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      ingredients,
      excludeIngredients,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    if (!ingredients) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients parameter is required'
      });
    }

    const ingredientsList = Array.isArray(ingredients) ? ingredients as string[] : [ingredients as string];
    const excludeList = excludeIngredients 
      ? (Array.isArray(excludeIngredients) ? excludeIngredients as string[] : [excludeIngredients as string])
      : [];

    const options: SearchOptions = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await RecipeSearchService.searchByIngredients(
      ingredientsList,
      excludeList,
      options,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      message: 'Recipes found by ingredients',
      data: result
    });

  } catch (error) {
    console.error('Search by ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching recipes by ingredients',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get search suggestions
 * @route   GET /api/recipes/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const suggestions = await RecipeSearchService.getSearchSuggestions(
      query,
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Search suggestions retrieved',
      data: { suggestions }
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting search suggestions',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get ingredient suggestions
 * @route   GET /api/recipes/search/ingredients/suggestions
 * @access  Public
 */
export const getIngredientSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const suggestions = await RecipeSearchService.getIngredientSuggestions(
      query,
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Ingredient suggestions retrieved',
      data: { suggestions }
    });

  } catch (error) {
    console.error('Get ingredient suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting ingredient suggestions',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get trending recipes
 * @route   GET /api/recipes/trending
 * @access  Public
 */
export const getTrendingRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    const recipes = await RecipeSearchService.getTrendingRecipes(parseInt(limit as string));

    res.status(200).json({
      success: true,
      message: 'Trending recipes retrieved',
      data: { recipes }
    });

  } catch (error) {
    console.error('Get trending recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting trending recipes',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get popular recipes
 * @route   GET /api/recipes/popular
 * @access  Public
 */
export const getPopularRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    const recipes = await RecipeSearchService.getPopularRecipes(parseInt(limit as string));

    res.status(200).json({
      success: true,
      message: 'Popular recipes retrieved',
      data: { recipes }
    });

  } catch (error) {
    console.error('Get popular recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular recipes',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/recipes/recommendations
 * @access  Private
 */
export const getPersonalizedRecommendations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { limit = 10 } = req.query;

    const recipes = await RecipeSearchService.getPersonalizedRecommendations(
      req.user.id,
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Personalized recommendations retrieved',
      data: { recipes }
    });

  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting personalized recommendations',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get user's search history
 * @route   GET /api/recipes/search/history
 * @access  Private
 */
export const getSearchHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { limit = 10 } = req.query;

    const history = await RecipeSearch.getSearchHistory(
      req.user.id,
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Search history retrieved',
      data: { history }
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting search history',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Track recipe view
 * @route   POST /api/recipes/:id/view
 * @access  Public
 */
export const trackRecipeView = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID is required'
      });
    }

    await RecipeSearchService.trackRecipeView(recipeId, req.user?.id);

    // Get updated view count
    const viewCount = await RecipeCache.getRecipeViews(recipeId);

    res.status(200).json({
      success: true,
      message: 'Recipe view tracked',
      data: { viewCount }
    });

  } catch (error) {
    console.error('Track recipe view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking recipe view',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Add recipe to favorites
 * @route   POST /api/recipes/:id/favorite
 * @access  Private
 */
export const addToFavorites = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id: recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID is required'
      });
    }

    await UserPreferences.addToFavorites(req.user.id, recipeId);

    res.status(200).json({
      success: true,
      message: 'Recipe added to favorites'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding recipe to favorites',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Remove recipe from favorites
 * @route   DELETE /api/recipes/:id/favorite
 * @access  Private
 */
export const removeFromFavorites = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { id: recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Recipe ID is required'
      });
    }

    await UserPreferences.removeFromFavorites(req.user.id, recipeId);

    res.status(200).json({
      success: true,
      message: 'Recipe removed from favorites'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing recipe from favorites',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Get user's favorite recipes
 * @route   GET /api/recipes/favorites
 * @access  Private
 */
export const getUserFavorites = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const favoriteIds = await UserPreferences.getUserFavorites(req.user.id);
    
    // Get full recipe data for favorites
    const recipes = await RecipeSearchService.searchRecipes('', { }, { limit: 100 }, req.user.id);
    const favoriteRecipes = recipes.recipes.filter(recipe => 
      favoriteIds.includes(recipe._id.toString())
    );

    res.status(200).json({
      success: true,
      message: 'Favorite recipes retrieved',
      data: { recipes: favoriteRecipes }
    });

  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting favorite recipes',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

/**
 * @desc    Clear search cache (Admin only)
 * @route   DELETE /api/recipes/search/cache
 * @access  Private (Admin)
 */
export const clearSearchCache = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    await RecipeSearch.clearSearchCache();

    res.status(200).json({
      success: true,
      message: 'Search cache cleared successfully'
    });

  } catch (error) {
    console.error('Clear search cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing search cache',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

export default {
  searchRecipes,
  searchByIngredients,
  getSearchSuggestions,
  getIngredientSuggestions,
  getTrendingRecipes,
  getPopularRecipes,
  getPersonalizedRecommendations,
  getSearchHistory,
  trackRecipeView,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  clearSearchCache
}; 