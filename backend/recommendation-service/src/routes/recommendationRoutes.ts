import express from 'express';
import {
  trackInteraction, 
  getForYouRecommendations, 
  getSimilarRecipes,
  getTrendingRecipes,
  getRecipesByIngredients,
  getUserTasteProfile,
  getRecommendationAnalytics,
  triggerModelRetraining
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
const adminRouter = express.Router(); // Create a new router for admin routes

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

// --- Admin Routes ---
// These routes would typically be protected by an admin authentication/authorization middleware

// @desc    Get recommendation service analytics
// @route   GET /api/v1/recommendations/admin/analytics
// @access  Admin
adminRouter.get(
    '/analytics',
    // TODO: Add admin authentication middleware here
    getRecommendationAnalytics
);

// @desc    Trigger recommendation model retraining
// @route   POST /api/v1/recommendations/admin/retrain-model
// @access  Admin
adminRouter.post(
    '/retrain-model',
    // TODO: Add admin authentication middleware here
    triggerModelRetraining
);

// Mount the admin router under the /admin path
router.use('/admin', adminRouter);

export default router; 