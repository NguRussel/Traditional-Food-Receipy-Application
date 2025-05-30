import express from 'express';
import {
  trackInteraction, 
  getForYouRecommendations, 
  getSimilarRecipes 
} from '../controllers/interactionController';
import {
  validateTrackInteraction, 
  handleValidationErrors,
  validateMongoIdParam
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
    // TODO: Add validation if userId is a query param (e.g., isMongoId)
    // TODO: Add authentication middleware (e.g., protect) to get userId from req.user
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

// Other recommendation routes will be added here:
// GET /trending
// GET /based-on-ingredients
// GET /user-taste-profile

// Admin routes for recommendations could be separate or have admin middleware here
// GET /analytics
// POST /retrain-model

export default router; 