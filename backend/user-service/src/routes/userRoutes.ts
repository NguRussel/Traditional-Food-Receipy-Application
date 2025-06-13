import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getFavoriteRecipes,
  addRecipeToFavorites,
  removeRecipeFromFavorites,
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  addSearchTerm,
  getViewHistory,
  addRecipeToViewHistory,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { 
  validateMongoIdParam, 
  validateUpdateUserProfile, 
  validateUpdateUserPreferences,
  validateCreateMealPlan,
  validateUpdateMealPlan,
  validateAddSearchTerm,
} from '../middleware/validationMiddleware';

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
 *             $ref: '#/components/schemas/MealPlanItem' # Assuming MealPlanItem is defined in User.ts
 *           description: Array of meal items for the plan.
 *     SearchTermInput:
 *       type: object
 *       required:
 *         - searchTerm
 *       properties:
 *         searchTerm:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: The search term to add to history.
 *     SuccessMessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: A success message.
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message detailing what went wrong.
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               value:
 *                 type: string
 *               msg:
 *                 type: string
 *               path:
 *                 type: string
 *               location:
 *                 type: string
 *   securitySchemes:
 *     UserAuth:
 *       type: apiKey
 *       in: header
 *       name: x-user-id
 *       description: User ID passed by API Gateway for authentication. For operations requiring specific roles (like admin), the x-user-roles header is also expected.
 */

// Profile & Preferences
/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200:
 *         description: User profile data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User ID header missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdateInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User' # Or a subset of user fields
 *       400:
 *         description: Invalid input, e.g., username taken or validation error.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, ...validateUpdateUserProfile, updateUserProfile);

/**
 * @openapi
 * /users/preferences:
 *   put:
 *     summary: Update current user's preferences
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferencesInput'
 *     responses:
 *       200:
 *         description: Preferences updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/preferences', protect, ...validateUpdateUserPreferences, updateUserPreferences);

// Favorites
/**
 * @openapi
 * /users/favorites:
 *   get:
 *     summary: Get current user's favorite recipes
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200:
 *         description: A list of favorite recipe IDs (or populated recipe objects).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string # Or $ref to a Recipe schema if populated
 *                 format: ObjectId
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /users/favorites/{recipeId}:
 *   post:
 *     summary: Add a recipe to current user's favorites
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the recipe to add to favorites.
 *     responses:
 *       201:
 *         description: Recipe added to favorites successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 favorites:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: ObjectId
 *       400:
 *         description: Invalid recipe ID or recipe already in favorites.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse' 
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Remove a recipe from current user's favorites
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the recipe to remove from favorites.
 *     responses:
 *       200:
 *         description: Recipe removed from favorites successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 favorites:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: ObjectId
 *       400:
 *         description: Invalid recipe ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found or recipe not in favorites.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/favorites')
  .get(protect, getFavoriteRecipes);

router.route('/favorites/:recipeId')
  .post(protect, ...validateMongoIdParam('recipeId'), addRecipeToFavorites)
  .delete(protect, ...validateMongoIdParam('recipeId'), removeRecipeFromFavorites);

// Meal Planning
/**
 * @openapi
 * /users/meal-plans:
 *   get:
 *     summary: Get current user's meal plans
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's meal plans.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MealPlan'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a new meal plan for the current user
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlanInput'
 *     responses:
 *       201:
 *         description: Meal plan created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlan'
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /users/meal-plans/{mealPlanId}:
 *   put:
 *     summary: Update an existing meal plan for the current user
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: mealPlanId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the meal plan to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MealPlanInput' # Can also be a partial update schema
 *     responses:
 *       200:
 *         description: Meal plan updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MealPlan'
 *       400:
 *         description: Invalid input or invalid mealPlanId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User or meal plan not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete an existing meal plan for the current user
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: mealPlanId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the meal plan to delete.
 *     responses:
 *       200:
 *         description: Meal plan deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       400:
 *         description: Invalid mealPlanId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User or meal plan not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/meal-plans')
  .get(protect, getMealPlans)
  .post(protect, ...validateCreateMealPlan, createMealPlan);

router.route('/meal-plans/:mealPlanId')
  .put(protect, ...validateMongoIdParam('mealPlanId'), ...validateUpdateMealPlan, updateMealPlan)
  .delete(protect, ...validateMongoIdParam('mealPlanId'), deleteMealPlan);

// User Activity
/**
 * @openapi
 * /users/search-history:
 *   post:
 *     summary: Add a search term to current user's history
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchTermInput'
 *     responses:
 *       201:
 *         description: Search term added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 searchHistory:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /users/view-history:
 *   get:
 *     summary: Get current user's view history
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200:
 *         description: A list of viewed recipe IDs (or populated recipe objects).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string # Or $ref to a Recipe schema if populated
 *                 format: ObjectId
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /users/view-history/{recipeId}:
 *   post:
 *     summary: Add a recipe to current user's view history
 *     tags: [Users]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the recipe to add to view history.
 *     responses:
 *       201:
 *         description: Recipe added to view history successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 viewHistory:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: ObjectId
 *       400:
 *         description: Invalid recipe ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/search-history', protect, ...validateAddSearchTerm, addSearchTerm);
router.route('/view-history')
  .get(protect, getViewHistory);
router.post('/view-history/:recipeId', protect, ...validateMongoIdParam('recipeId'), addRecipeToViewHistory);

// TODO: Add Admin User Routes

export default router; 