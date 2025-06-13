import express from 'express';
import {
  scanIngredients,
  suggestRecipesFromIngredients,
  getIngredientDatabase, // Assuming this might be public, or needs specific protection
  identifyDish
} from '../controllers/scannerController';
import { protect } from '../middleware/authMiddleware'; // Or remove protect if truly public
import { 
  suggestRecipesValidationRules, 
  // scanIngredientsValidationRules, // Add when defined for image upload
  // identifyDishValidationRules, // Add when defined for image upload
  handleValidationErrors 
} from '../middleware/validationMiddleware';
import upload from '../middleware/uploadMiddleware'; // Import multer middleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scanner
 *   description: Endpoints for scanning images for ingredients and dishes, and suggesting recipes.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ScannedIngredientsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Ingredients scanned successfully
 *         ingredients:
 *           $ref: '#/components/schemas/IngredientList'
 *     SuggestedRecipesRequest:
 *       type: object
 *       required:
 *         - ingredients
 *       properties:
 *         ingredients:
 *           $ref: '#/components/schemas/IngredientList'
 *     SuggestedRecipesResponse: # Placeholder schema
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: '[Placeholder] Recipes suggested based on ingredients'
 *         suggestedRecipes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, example: 'recipe1' }
 *               name: { type: string, example: 'Tomato Soup' }
 *     IdentifiedDishResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Dish identified successfully
 *         dish:
 *           type: object
 *           properties:
 *             name: { type: string, example: 'Jollof Rice' }
 *             confidence: { type: number, example: 0.85 }
 *     IngredientDatabaseResponse:
 *        type: object
 *        properties:
 *          message: { type: string, example: 'Ingredient database retrieved successfully' }
 *          count: { type: integer, example: 50 }
 *          ingredients: { $ref: '#/components/schemas/IngredientList' }
 */

/**
 * @swagger
 * /scanner/scan-ingredients:
 *   post:
 *     summary: Scans an uploaded image to identify ingredients.
 *     tags: [Scanner]
 *     security:
 *       - gatewayAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: 
 *                 type: string
 *                 format: binary
 *                 description: The image file to scan for ingredients.
 *     responses:
 *       200:
 *         description: Ingredients scanned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScannedIngredientsResponse'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
router.post(
  '/scan-ingredients', 
  protect, 
  upload.single('image'), // Expect a single file with field name 'image'
  // scanIngredientsValidationRules, // We can add more specific validation after multer if needed
  // handleValidationErrors, 
  scanIngredients
);

/**
 * @swagger
 * /scanner/suggest-recipes:
 *   post:
 *     summary: Suggests recipes based on a provided list of ingredients.
 *     tags: [Scanner]
 *     security:
 *       - gatewayAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SuggestedRecipesRequest'
 *     responses:
 *       200:
 *         description: Recipes suggested successfully (placeholder).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuggestedRecipesResponse'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
router.post(
  '/suggest-recipes', 
  protect, 
  suggestRecipesValidationRules, 
  handleValidationErrors, 
  suggestRecipesFromIngredients
);

/**
 * @swagger
 * /scanner/ingredient-database:
 *   get:
 *     summary: Retrieves a list of known ingredients.
 *     tags: [Scanner]
 *     responses:
 *       200:
 *         description: Ingredient database retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IngredientDatabaseResponse'
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
router.get('/ingredient-database', getIngredientDatabase); // Likely public or cached

/**
 * @swagger
 * /scanner/identify-dish:
 *   post:
 *     summary: Scans an uploaded image to identify a dish.
 *     tags: [Scanner]
 *     security:
 *       - gatewayAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to identify the dish from.
 *     responses:
 *       200:
 *         description: Dish identified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdentifiedDishResponse'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
router.post(
  '/identify-dish', 
  protect, 
  upload.single('image'), // Expect a single file with field name 'image'
  // identifyDishValidationRules, 
  // handleValidationErrors, 
  identifyDish
);

export default router; 