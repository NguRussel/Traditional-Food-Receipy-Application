import express from 'express';
import {
  trackInteraction, 
  getForYouRecommendations, 
  getSimilarRecipes,
  getTrendingRecipes,
  getRecipesByIngredients,
  getUserTasteProfile
} from '../controllers/interactionController';
import {
  validateTrackInteraction, 
  handleValidationErrors,
  validateMongoIdParam,
  validateIngredientsQueryParam,
  validateUserIdQueryParam
} from '../middleware/validationMiddleware';

// We will add validation middleware later
// import { validateTrackInteraction } from '../middleware/validationMiddleware'; 
// import { handleValidationErrors } from '../middleware/validationMiddleware';

const router = express.Router();

// @desc    Track a user interaction
// @route   POST /api/v1/recommendations/interaction
// @access  Public (or Private, depending on how userId is handled - e.g. from auth token or request body)
router.post(
    '/interaction',
    validateTrackInteraction, // Apply validation rules
    handleValidationErrors,   // Handle any validation errors
    trackInteraction
);

// GET /for-you
// @desc    Get personalized recipe recommendations
// @route   GET /api/v1/recommendations/for-you
// @access  Private (currently expects userId as query param, ideally from auth)
router.get(
    '/for-you',
    validateUserIdQueryParam, // Added validation for userId query param
    handleValidationErrors,
    getForYouRecommendations
);

// GET /similar/:recipeId
// @desc    Get recipes similar to a given recipe
// @route   GET /api/v1/recommendations/similar/:recipeId
// @access  Public
router.get(
    '/similar/:recipeId',
    validateMongoIdParam('recipeId'), // Validate the recipeId URL parameter
    handleValidationErrors,
    getSimilarRecipes
);

// GET /trending
// @desc    Get trending recipes
// @route   GET /api/v1/recommendations/trending
// @access  Public
router.get(
    '/trending',
    getTrendingRecipes
);

// GET /based-on-ingredients
// @desc    Get recipe suggestions based on ingredients
// @route   GET /api/v1/recommendations/based-on-ingredients
// @access  Public
router.get(
    '/based-on-ingredients',
    validateIngredientsQueryParam,
    handleValidationErrors,
    getRecipesByIngredients
);

// GET /user-taste-profile
// @desc    Get a user's taste profile
// @route   GET /api/v1/recommendations/user-taste-profile
// @access  Private (expects userId as query param)
router.get(
    '/user-taste-profile',
    validateUserIdQueryParam, // Validate the userId query parameter
    handleValidationErrors,
    getUserTasteProfile
);

// Other recommendation routes will be added here:
// GET /user-taste-profile

// Admin routes for recommendations could be separate or have admin middleware here
// GET /analytics
// POST /retrain-model

export default router; 