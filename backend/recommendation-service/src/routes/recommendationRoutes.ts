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
  // validateUserIdQueryParam, // No longer needed for routes, userId from req.user
} from '../middleware/validationMiddleware';
import { protect, authorize, IAuthRequest } from '../middleware/authMiddleware'; // Added protect, authorize

// We will add validation middleware later
// import { validateTrackInteraction } from '../middleware/validationMiddleware'; 
// import { handleValidationErrors } from '../middleware/validationMiddleware';

const router = express.Router();
const adminRouter = express.Router(); // Create a new router for admin routes

/**
 * @openapi
 * tags:
 *   - name: Interactions
 *     description: User interaction tracking
 *   - name: Recommendations
 *     description: Recipe recommendation endpoints
 *   - name: Admin Recommendations
 *     description: Administrative endpoints for recommendations
 */

/**
 * @openapi
 * /interaction:
 *   post:
 *     tags:
 *       - Interactions
 *     summary: Track a user interaction with a recipe
 *     description: Records an interaction like view, like, save, cook, share, or rating. Requires user authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInteractionInput'
 *     responses:
 *       201:
 *         description: Interaction tracked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Interaction tracked successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserInteraction'
 *       400:
 *         description: Bad request (e.g., validation error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (User ID not provided or invalid).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/interaction',
    protect, // Added protect
    validateTrackInteraction, // Apply validation rules
    handleValidationErrors,   // Handle any validation errors
    trackInteraction
);

/**
 * @openapi
 * /for-you:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get personalized recipe recommendations for the authenticated user
 *     description: Retrieves a list of recommended recipe IDs based on the user's past interactions. Requires user authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipeId:
 *                         type: string
 *                         format: objectId
 *       400:
 *         description: Bad request (e.g., User ID missing if not using ApiKeyAuth correctly).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/for-you',
    protect, // Added protect
    // validateUserIdQueryParam, // Removed, userId from req.user
    handleValidationErrors, // Keep for other potential query validations if added later
    getForYouRecommendations
);

/**
 * @openapi
 * /similar/{recipeId}:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get recipes similar to a given recipe ID
 *     description: Retrieves a list of recipe IDs that are considered similar to the provided recipeId based on placeholder logic (e.g. shared user interactions).
 *     parameters:
 *       - name: recipeId
 *         in: path
 *         required: true
 *         description: The ID of the recipe to find similar ones for.
 *         schema:
 *           type: string
 *           format: objectId 
 *     responses:
 *       200:
 *         description: Similar recipes retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipeId:
 *                         type: string
 *                         format: objectId
 *       400:
 *         description: Bad request (e.g., invalid recipeId format).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/similar/:recipeId',
    validateMongoIdParam('recipeId'), // Validate the recipeId URL parameter
    handleValidationErrors,
    getSimilarRecipes
);

/**
 * @openapi
 * /trending:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get trending recipes
 *     description: Retrieves a list of recipe IDs that are currently trending based on recent positive interactions.
 *     responses:
 *       200:
 *         description: Trending recipes retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipeId:
 *                         type: string
 *                         format: objectId
 *                       trendScore:
 *                         type: integer
 */
router.get(
    '/trending',
    getTrendingRecipes
);

/**
 * @openapi
 * /based-on-ingredients:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get recipe suggestions based on a list of ingredients
 *     description: Suggests recipes based on a comma-separated list of ingredients provided as a query parameter.
 *     parameters:
 *       - name: ingredients
 *         in: query
 *         required: true
 *         description: Comma-separated string of ingredient names (e.g., tomatoes,onions,garlic).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe suggestions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 providedIngredients:
 *                   type: array
 *                   items:
 *                     type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object # Placeholder structure
 *                     properties:
 *                       recipeId: 
 *                         type: string
 *                         example: mockRecipeId1
 *                       name:
 *                         type: string
 *                         example: Suggested Recipe (Placeholder)
 *                       matchedIngredients:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Bad request (e.g., missing or invalid ingredients query parameter).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/based-on-ingredients',
    validateIngredientsQueryParam,
    handleValidationErrors,
    getRecipesByIngredients
);

/**
 * @openapi
 * /user-taste-profile:
 *   get:
 *     tags:
 *       - Recommendations
 *     summary: Get the authenticated user's taste profile
 *     description: Retrieves a summary of the user's interaction history and preferences. Requires user authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: User taste profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: objectId
 *                     totalInteractions:
 *                       type: integer
 *                     interactionSummary:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example: { "view": 50, "like": 10, "rated_5_star": 3 }
 *                     distinctPositivelyInteractedRecipes:
 *                       type: integer
 *                     recentPositiveInteractionsRecipeIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: objectId
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/user-taste-profile',
    protect, // Added protect
    // validateUserIdQueryParam, // Removed, userId from req.user
    handleValidationErrors, // Keep for other potential query validations
    getUserTasteProfile
);

// Other recommendation routes will be added here:
// GET /user-taste-profile

// --- Admin Routes ---
// These routes would typically be protected by an admin authentication/authorization middleware

/**
 * @openapi
 * /admin/analytics:
 *   get:
 *     tags:
 *       - Admin Recommendations
 *     summary: Get recommendation service analytics (Admin Only)
 *     description: Retrieves analytics data for the recommendation service. Requires admin privileges.
 *     security:
 *       - ApiKeyAuth: [] 
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object # Placeholder structure
 *                   properties:
 *                      totalInteractionsTracked:
 *                          type: integer
 *                      sampleMetric:
 *                          type: string
 *                      notes:
 *                          type: string
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
adminRouter.use(protect, authorize(['admin'])); // Apply protect and authorize to all admin routes
adminRouter.get(
    '/analytics',
    getRecommendationAnalytics
);

/**
 * @openapi
 * /admin/retrain-model:
 *   post:
 *     tags:
 *       - Admin Recommendations
 *     summary: Trigger recommendation model retraining (Admin Only)
 *     description: Initiates the process of retraining the recommendation models. Requires admin privileges.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Model retraining process initiated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object # Placeholder structure
 *                   properties:
 *                      status:
 *                          type: string
 *                          example: RetrainingJobScheduled
 *                      timestamp:
 *                          type: string
 *                          format: date-time
 *                      notes:
 *                          type: string
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
adminRouter.post(
    '/retrain-model',
    triggerModelRetraining
);

// Mount the admin router under the /admin path
router.use('/admin', adminRouter);

export default router; 