import express from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, param, query } from 'express-validator';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: User profile, preferences, favorites, meal plans, and activity management
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfileUpdateInput:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: User's full name.
 *         username:
 *           type: string
 *           description: User's username (must be unique).
 *           minLength: 3
 *           maxLength: 30
 *         avatar:
 *           type: string
 *           format: url
 *           description: URL to user's avatar image.
 *     UserPreferencesInput:
 *       type: object
 *       properties:
 *         dietaryRestrictions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of dietary restrictions.
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergies.
 *         favoriteRegions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of favorite Cameroonian regions.
 *         favoriteTribes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of favorite Cameroonian tribes.
 *         spiceLevel:
 *           type: string
 *           enum: [Mild, Medium, Hot]
 *           description: Preferred spice level.
 *         cookingExperience:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *           description: User's cooking experience level.
 *     MealPlanInput:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the meal plan.
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the meal plan.
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of the meal plan.
 *         meals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MealPlanItem'
 *           description: Array of meal items for the plan.
 *     SearchTermInput:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: The search term to add to history.
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *           description: A success message.
 *         data:
 *           type: object
 *           description: Response data.
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         error:
 *           type: string
 *           description: Error message detailing what went wrong.
 *         timestamp:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for user authentication
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User Profile Routes
/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/profile', UserController.getProfile);

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdateInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.put('/profile', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  validateRequest
], UserController.updateProfile);

// User Preferences Routes
/**
 * @openapi
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User preferences not found
 */
router.get('/preferences', UserController.getPreferences);

/**
 * @openapi
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferencesInput'
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.put('/preferences', [
  body('dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  body('dietaryRestrictions.*')
    .optional()
    .isString()
    .withMessage('Each dietary restriction must be a string'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*')
    .optional()
    .isString()
    .withMessage('Each allergy must be a string'),
  body('favoriteRegions')
    .optional()
    .isArray()
    .withMessage('Favorite regions must be an array'),
  body('favoriteRegions.*')
    .optional()
    .isString()
    .withMessage('Each favorite region must be a string'),
  body('favoriteTribes')
    .optional()
    .isArray()
    .withMessage('Favorite tribes must be an array'),
  body('favoriteTribes.*')
    .optional()
    .isString()
    .withMessage('Each favorite tribe must be a string'),
  body('spiceLevel')
    .optional()
    .isIn(['Mild', 'Medium', 'Hot'])
    .withMessage('Spice level must be Mild, Medium, or Hot'),
  body('cookingExperience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Cooking experience must be Beginner, Intermediate, or Advanced'),
  validateRequest
], UserController.updatePreferences);

// User Favorites Routes
/**
 * @openapi
 * /api/users/favorites:
 *   get:
 *     summary: Get user's favorite recipes
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites', UserController.getFavorites);

/**
 * @openapi
 * /api/users/favorites/{recipeId}:
 *   post:
 *     summary: Add recipe to favorites
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID to add to favorites
 *     responses:
 *       200:
 *         description: Recipe added to favorites
 *       400:
 *         description: Invalid recipe ID
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Recipe already in favorites
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/favorites/:recipeId', [
  param('recipeId')
    .isMongoId()
    .withMessage('Recipe ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.addToFavorites);

/**
 * @openapi
 * /api/users/favorites/{recipeId}:
 *   delete:
 *     summary: Remove recipe from favorites
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID to remove from favorites
 *     responses:
 *       200:
 *         description: Recipe removed from favorites
 *       400:
 *         description: Invalid recipe ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipe not found in favorites
 */
router.delete('/favorites/:recipeId', [
  param('recipeId')
    .isMongoId()
    .withMessage('Recipe ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.removeFromFavorites);

/**
 * @openapi
 * /api/users/favorites/{recipeId}/check:
 *   get:
 *     summary: Check if recipe is favorited
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID to check
 *     responses:
 *       200:
 *         description: Favorite status retrieved
 *       400:
 *         description: Invalid recipe ID
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites/:recipeId/check', [
  param('recipeId')
    .isMongoId()
    .withMessage('Recipe ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.checkFavorite);

// Meal Planning Routes
/**
 * @openapi
 * /api/users/meal-plans:
 *   get:
 *     summary: Get user's meal plans
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Meal plans retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/meal-plans', UserController.getMealPlans);

/**
 * @openapi
 * /api/users/meal-plans:
 *   post:
 *     summary: Create new meal plan
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlanInput'
 *     responses:
 *       201:
 *         description: Meal plan created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/meal-plans', [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Meal plan name must be between 1 and 100 characters')
    .trim(),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('meals')
    .optional()
    .isArray()
    .withMessage('Meals must be an array'),
  body('meals.*.date')
    .optional()
    .isISO8601()
    .withMessage('Meal date must be a valid ISO 8601 date'),
  body('meals.*.breakfast')
    .optional()
    .isMongoId()
    .withMessage('Breakfast recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.lunch')
    .optional()
    .isMongoId()
    .withMessage('Lunch recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.dinner')
    .optional()
    .isMongoId()
    .withMessage('Dinner recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.snacks')
    .optional()
    .isArray()
    .withMessage('Snacks must be an array'),
  body('meals.*.snacks.*')
    .optional()
    .isMongoId()
    .withMessage('Each snack recipe ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.createMealPlan);

/**
 * @openapi
 * /api/users/meal-plans/{id}:
 *   put:
 *     summary: Update meal plan
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlanInput'
 *     responses:
 *       200:
 *         description: Meal plan updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meal plan not found
 *       429:
 *         description: Rate limit exceeded
 */
router.put('/meal-plans/:id', [
  param('id')
    .isMongoId()
    .withMessage('Meal plan ID must be a valid MongoDB ObjectId'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Meal plan name must be between 1 and 100 characters')
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('meals')
    .optional()
    .isArray()
    .withMessage('Meals must be an array'),
  validateRequest
], UserController.updateMealPlan);

/**
 * @openapi
 * /api/users/meal-plans/{id}:
 *   delete:
 *     summary: Delete meal plan
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal plan ID
 *     responses:
 *       200:
 *         description: Meal plan deleted successfully
 *       400:
 *         description: Invalid meal plan ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meal plan not found
 */
router.delete('/meal-plans/:id', [
  param('id')
    .isMongoId()
    .withMessage('Meal plan ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.deleteMealPlan);

// User Activity Routes
/**
 * @openapi
 * /api/users/search-history:
 *   get:
 *     summary: Get user's search history
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of search history items to return
 *     responses:
 *       200:
 *         description: Search history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/search-history', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validateRequest
], UserController.getSearchHistory);

/**
 * @openapi
 * /api/users/search-history:
 *   post:
 *     summary: Add search query to history
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchTermInput'
 *     responses:
 *       200:
 *         description: Search query added to history
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/search-history', [
  body('query')
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .trim(),
  validateRequest
], UserController.addToSearchHistory);

/**
 * @openapi
 * /api/users/view-history:
 *   get:
 *     summary: Get user's view history
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of view history items to return
 *     responses:
 *       200:
 *         description: View history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/view-history', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest
], UserController.getViewHistory);

/**
 * @openapi
 * /api/users/view-history/{recipeId}:
 *   post:
 *     summary: Add recipe to view history
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe ID to add to view history
 *     responses:
 *       200:
 *         description: Recipe added to view history
 *       400:
 *         description: Invalid recipe ID
 *       401:
 *         description: Unauthorized
 */
router.post('/view-history/:recipeId', [
  param('recipeId')
    .isMongoId()
    .withMessage('Recipe ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.addToViewHistory);

// User Statistics Routes
/**
 * @openapi
 * /api/users/statistics:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/statistics', UserController.getStatistics);

// Social Features Routes
/**
 * @openapi
 * /api/users/following:
 *   get:
 *     summary: Get user's following list
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/following', UserController.getFollowing);

/**
 * @openapi
 * /api/users/follow/{chefId}:
 *   post:
 *     summary: Follow a chef
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chef ID to follow
 *     responses:
 *       200:
 *         description: Chef followed successfully
 *       400:
 *         description: Invalid chef ID
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Already following this chef
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/follow/:chefId', [
  param('chefId')
    .isMongoId()
    .withMessage('Chef ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.followChef);

/**
 * @openapi
 * /api/users/follow/{chefId}:
 *   delete:
 *     summary: Unfollow a chef
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chef ID to unfollow
 *     responses:
 *       200:
 *         description: Chef unfollowed successfully
 *       400:
 *         description: Invalid chef ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not following this chef
 */
router.delete('/follow/:chefId', [
  param('chefId')
    .isMongoId()
    .withMessage('Chef ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.unfollowChef);

/**
 * @openapi
 * /api/users/follow/{chefId}/check:
 *   get:
 *     summary: Check if following a chef
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chef ID to check
 *     responses:
 *       200:
 *         description: Following status retrieved
 *       400:
 *         description: Invalid chef ID
 *       401:
 *         description: Unauthorized
 */
router.get('/follow/:chefId/check', [
  param('chefId')
    .isMongoId()
    .withMessage('Chef ID must be a valid MongoDB ObjectId'),
  validateRequest
], UserController.checkFollowing);

// Recommendations Routes
/**
 * @openapi
 * /api/users/recommendations:
 *   get:
 *     summary: Get user recommendations
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/recommendations', UserController.getRecommendations);

// Activity Routes
/**
 * @openapi
 * /api/users/activity:
 *   get:
 *     summary: Get recent user activity
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of activity items to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/activity', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validateRequest
], UserController.getRecentActivity);

// Authentication Routes
/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Update last login time
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Last login updated
 *       401:
 *         description: Unauthorized
 */
router.post('/login', UserController.updateLastLogin);

export default router; 