import express from 'express';
import {
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
} from '../controllers/searchController';
import { authMiddleware, optionalAuth } from '../middleware/authMiddleware'; // Assuming you have auth middleware
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware'; // Assuming you have rate limiting

const router = express.Router();

// Public search routes
router.get('/search', optionalAuth, rateLimitMiddleware, searchRecipes);
router.get('/search/ingredients', optionalAuth, rateLimitMiddleware, searchByIngredients);
router.get('/search/suggestions', rateLimitMiddleware, getSearchSuggestions);
router.get('/search/ingredients/suggestions', rateLimitMiddleware, getIngredientSuggestions);

// Public discovery routes
router.get('/trending', rateLimitMiddleware, getTrendingRecipes);
router.get('/popular', rateLimitMiddleware, getPopularRecipes);

// Recipe interaction routes
router.post('/:id/view', optionalAuth, trackRecipeView);

// Private user-specific routes
router.get('/recommendations', authMiddleware, getPersonalizedRecommendations);
router.get('/search/history', authMiddleware, getSearchHistory);
router.get('/favorites', authMiddleware, getUserFavorites);
router.post('/:id/favorite', authMiddleware, addToFavorites);
router.delete('/:id/favorite', authMiddleware, removeFromFavorites);

// Admin routes
router.delete('/search/cache', authMiddleware, clearSearchCache);

export default router; 