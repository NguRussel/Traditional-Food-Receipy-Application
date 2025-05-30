import express from 'express';
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  getRecipesByChef,
  getPopularRecipes,
  getRecentRecipes,
  getRecipesByCategory,
  getRecipesByRegion,
  getRecipesByTribe,
  trackRecipeView,
  getRelatedRecipes,
  // Admin controllers are now in adminRecipeRoutes.ts
} from '../controllers/recipeController';
import { protect, authorize, IAuthRequest } from '../middleware/authMiddleware'; // Import auth middleware
import { 
  validateCreateRecipe, 
  validateUpdateRecipe,
  validateRejectRecipe,
  handleValidationErrors, 
  validateMongoIdParam,
  validateSearchRecipesQuery,
  validatePathParameter
} from '../middleware/validationMiddleware'; // Import validation middleware

// TODO: Add authentication and authorization middleware
// import { protect, authorize } from '../middleware/authMiddleware'; // Example

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     RecipeInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - cookingTime
 *         - difficulty
 *         - servings
 *         - ingredients
 *         - instructions
 *         - tags
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the recipe
 *           example: Ndole
 *         description:
 *           type: string
 *           description: A brief description of the recipe
 *           example: A delicious Cameroonian dish.
 *         cookingTime:
 *           type: integer
 *           description: Cooking time in minutes
 *           example: 90
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: Medium
 *         servings:
 *           type: integer
 *           example: 4
 *         ingredients:
 *           type: array
 *           items:
 *             type: object # Using a simplified IngredientInput here for request body
 *             required: [name, quantity, unit]
 *             properties:
 *               name: { type: string, example: "Palm Oil" }
 *               quantity: { type: string, example: "2" }
 *               unit: { type: string, example: "cups" }
 *               isOptional: { type: boolean, example: false }
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Wash bitterleaf", "Cook peanuts"]
 *         tags:
 *           type: object
 *           properties:
 *             ingredients: { type: array, items: { type: string }, example: ["bitterleaf", "beef"] }
 *             categories: { type: array, items: { type: string }, example: ["main course"] }
 *             timeOfDay: { type: array, items: { type: string }, example: ["lunch"] }
 *             region: { type: string, example: "Littoral" }
 *             tribe: { type: string, example: "Douala" }
 *             holidays: { type: array, items: { type: string }, example: ["Christmas"] }
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: url
 *           example: ["http://example.com/image.jpg"]
 *         videoUrl:
 *           type: string
 *           format: url
 *           example: "http://example.com/video.mp4"
 *         nutritionInfo:
 *           type: object # Flexible for now
 *           example: { "calories": 500 }
 *         status:
 *           type: string
 *           enum: [draft, pending] # Chefs can only create draft or pending
 *           default: draft
 *     RecipeUpdateInput: # Similar to RecipeInput but all fields are optional
 *       type: object
 *       properties:
 *         name: { type: string, description: "Name of the recipe", example: "Ndole" }
 *         description: { type: string, description: "A brief description of the recipe", example: "A delicious Cameroonian dish." }
 *         cookingTime: { type: integer, description: "Cooking time in minutes", example: 90 }
 *         difficulty: { type: string, enum: [Easy, Medium, Hard], example: "Medium" }
 *         servings: { type: integer, example: 4 }
 *         ingredients: { type: array, items: { $ref: '#/components/schemas/RecipeInput/properties/ingredients/items' } }
 *         instructions: { type: array, items: { type: string }, example: ["Wash bitterleaf", "Cook peanuts"] }
 *         tags: { $ref: '#/components/schemas/RecipeInput/properties/tags' }
 *         images: { type: array, items: { type: string, format: "url" }, example: ["http://example.com/image.jpg"] }
 *         videoUrl: { type: string, format: "url", example: "http://example.com/video.mp4" }
 *         nutritionInfo: { type: object, example: { "calories": 500 } }
 *         status: { type: string, enum: [draft, pending], description: "Chef can update to draft or pending" }
 *
 *     SuccessMessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *         data: # Optional data field for specific responses
 *           type: object 
 *           nullable: true
 *
 *   securitySchemes:
 *     ApiKeyAuth: # For x-user-id, x-user-roles
 *       type: apiKey
 *       in: header
 *       name: x-user-id # Or a generic API key if preferred for gateway
 *     # Add another for x-user-roles if needed to be documented explicitly
 *
 * security: # Global security (can be overridden at operation level)
 *  - ApiKeyAuth: [] # Indicates x-user-id is generally expected
 */

/**
 * @openapi
 * /recipes:
 *   get:
 *     summary: Get all recipes (paginated, with optional filters)
 *     description: Retrieves a list of approved recipes. Supports pagination and filtering by various criteria. Filters are applied as query parameters.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       # Add other common filter params if defined globally or repeat them from search here
 *       - name: region
 *         in: query
 *         schema: { type: string }
 *         description: Filter by region (e.g., Centre, Littoral)
 *       - name: category
 *         in: query
 *         schema: { type: string }
 *         description: Filter by category (e.g., main course, soup)
 *       - name: difficulty
 *         in: query
 *         schema: { type: string, enum: [Easy, Medium, Hard] }
 *         description: Filter by difficulty
 *     responses:
 *       200:
 *         description: A list of recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllRecipes); // getAllRecipes also powers search, so it might need more specific docs for simple GET all

/**
 * @openapi
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     description: Allows authenticated chefs to create a new recipe. The recipe status defaults to 'draft' or can be set to 'pending' for review.
 *     tags:
 *       - Recipes
 *     security:
 *       - ApiKeyAuth: [] # Requires x-user-id and x-user-roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       201:
 *         description: Recipe created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Recipe created successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - User not authenticated or not a chef.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not authorized to create a recipe (e.g. not a Chef).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    protect,
    authorize(...['chef', 'admin']), // Corrected: Spread the array
    validateCreateRecipe,
    handleValidationErrors,
    createRecipe
);

/**
 * @openapi
 * /recipes/{id}:
 *   get:
 *     summary: Get a recipe by its ID
 *     description: Retrieves a single recipe by its unique MongoDB Object ID.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to retrieve.
 *         schema:
 *           type: string
 *           format: objectId # Custom format, or just string with pattern
 *           example: 60d5ec49f739d4001c9d8182
 *     responses:
 *       200:
 *         description: Successfully retrieved recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipe not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:id',
    validateMongoIdParam('id'),
    handleValidationErrors,
    getRecipeById
);

/**
 * @openapi
 * /recipes/{id}:
 *   put:
 *     summary: Update an existing recipe
 *     description: Allows the original chef or an admin to update a recipe.
 *     tags:
 *       - Recipes
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to update.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeUpdateInput'
 *     responses:
 *       200:
 *         description: Recipe updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Recipe updated successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid input data or invalid ID format.
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
 *       403:
 *         description: Forbidden - User is not the owner or an admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipe not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id',
    protect,
    authorize(...['chef', 'admin']), // Corrected: Spread the array
    validateMongoIdParam('id'),
    validateUpdateRecipe,
    handleValidationErrors,
    updateRecipe
);

/**
 * @openapi
 * /recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     description: Allows the original chef or an admin to delete a recipe.
 *     tags:
 *       - Recipes
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to delete.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *     responses:
 *       200:
 *         description: Recipe deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse' # Or specific message
 *       400:
 *         description: Invalid ID format.
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
 *       403:
 *         description: Forbidden - User is not the owner or an admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipe not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id',
    protect,
    authorize(...['chef', 'admin']), // Corrected: Spread the array
    validateMongoIdParam('id'),
    handleValidationErrors,
    deleteRecipe
);

/**
 * @openapi
 * /recipes/search:
 *   get:
 *     summary: Search and filter recipes
 *     description: >
 *       Provides advanced search and filtering capabilities for recipes. 
 *       Supports text search (q), and filtering by various fields like region, category, tribe, 
 *       difficulty, cookingTime, servings, and ingredients. 
 *       All parameters are optional. Returns paginated results.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: q
 *         in: query
 *         required: false
 *         description: Search query string (searches name, description, tags.ingredients).
 *         schema:
 *           type: string
 *       - name: region
 *         in: query
 *         required: false
 *         description: Filter by region (e.g., Littoral, West).
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         required: false
 *         description: Filter by category (e.g., main course, dessert).
 *         schema:
 *           type: string
 *       - name: tribe
 *         in: query
 *         required: false
 *         description: Filter by tribe (e.g., Bamileke, Bassa).
 *         schema:
 *           type: string
 *       - name: difficulty
 *         in: query
 *         required: false
 *         description: Filter by difficulty level.
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *       - name: minCookingTime
 *         in: query
 *         required: false
 *         description: Minimum cooking time in minutes.
 *         schema:
 *           type: integer
 *       - name: maxCookingTime
 *         in: query
 *         required: false
 *         description: Maximum cooking time in minutes.
 *         schema:
 *           type: integer
 *       - name: servings
 *         in: query
 *         required: false
 *         description: Filter by number of servings.
 *         schema:
 *           type: integer
 *       - name: ingredients # Matches tags.ingredients
 *         in: query
 *         required: false
 *         description: Filter by ingredients (comma-separated list, e.g., bitterleaf,beef).
 *         schema:
 *           type: string 
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of matching recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', validateSearchRecipesQuery, handleValidationErrors, searchRecipes);

/**
 * @openapi
 * /recipes/chef/{chefId}:
 *   get:
 *     summary: Get recipes by a specific chef
 *     description: Retrieves all recipes created by a specific chef, identified by their ID. Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: chefId
 *         in: path
 *         required: true
 *         description: ID of the chef whose recipes are to be retrieved.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of recipes by the specified chef.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       400:
 *         description: Invalid chef ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Chef not found or no recipes by this chef.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Could be more specific
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/chef/:chefId', validateMongoIdParam('chefId'), handleValidationErrors, getRecipesByChef);

/**
 * @openapi
 * /recipes/popular:
 *   get:
 *     summary: Get popular recipes
 *     description: Retrieves a list of popular recipes, typically sorted by average rating or view count. Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of popular recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/popular', getPopularRecipes);

/**
 * @openapi
 * /recipes/recent:
 *   get:
 *     summary: Get recent recipes
 *     description: Retrieves a list of recently added recipes, sorted by creation date. Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of recent recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recent', getRecentRecipes);

/**
 * @openapi
 * /recipes/category/{category}:
 *   get:
 *     summary: Get recipes by category
 *     description: Retrieves recipes belonging to a specific category. Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: The category name to filter recipes by (e.g., 'main course', 'soup').
 *         schema:
 *           type: string
 *           example: main course
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of recipes in the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       400:
 *         description: Invalid category format or value.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/category/:category', validatePathParameter('category'), handleValidationErrors, getRecipesByCategory);

/**
 * @openapi
 * /recipes/region/{region}:
 *   get:
 *     summary: Get recipes by region
 *     description: Retrieves recipes associated with a specific Cameroonian region. Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: region
 *         in: path
 *         required: true
 *         description: The region name to filter recipes by (e.g., 'Littoral', 'West').
 *         schema:
 *           type: string
 *           example: Littoral
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of recipes from the specified region.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       400:
 *         description: Invalid region format or value.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/region/:region', validatePathParameter('region'), handleValidationErrors, getRecipesByRegion);

/**
 * @openapi
 * /recipes/tribe/{tribe}:
 *   get:
 *     summary: Get recipes by tribe
 *     description: Retrieves recipes associated with a specific Cameroonian tribe. Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: tribe
 *         in: path
 *         required: true
 *         description: The tribe name to filter recipes by (e.g., 'Bamileke', 'Bassa').
 *         schema:
 *           type: string
 *           example: Bamileke
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of recipes from the specified tribe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       400:
 *         description: Invalid tribe format or value.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tribe/:tribe', validatePathParameter('tribe'), handleValidationErrors, getRecipesByTribe);

/**
 * @openapi
 * /recipes/{id}/view:
 *   post:
 *     summary: Track a recipe view
 *     description: Increments the view count for a specific recipe. This endpoint does not require authentication.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to track the view for.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *     responses:
 *       200:
 *         description: View tracked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       400:
 *         description: Invalid recipe ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipe not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/view', validateMongoIdParam('id'), handleValidationErrors, trackRecipeView);

/**
 * @openapi
 * /recipes/{id}/related:
 *   get:
 *     summary: Get related recipes
 *     description: >
 *       Retrieves a list of recipes related to the specified recipe ID. 
 *       Relatedness is typically determined by shared tags (category, region, tribe) 
 *       and recipes are often sorted by popularity or recency. Excludes the source recipe itself.
 *       Supports pagination.
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to find related recipes for.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of related recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData'
 *       400:
 *         description: Invalid recipe ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Source recipe not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/related', validateMongoIdParam('id'), handleValidationErrors, getRelatedRecipes);

export default router; 