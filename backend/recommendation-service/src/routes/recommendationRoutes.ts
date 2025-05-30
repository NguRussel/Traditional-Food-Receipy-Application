import express from 'express';
import { trackInteraction } from '../controllers/interactionController';
import {
  validateTrackInteraction, 
  handleValidationErrors 
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

// Other recommendation routes will be added here:
// GET /for-you
// GET /similar/:recipeId
// GET /trending
// GET /based-on-ingredients
// GET /user-taste-profile

// Admin routes for recommendations could be separate or have admin middleware here
// GET /analytics
// POST /retrain-model

export default router; 