import express from 'express';
import * as recipeController from '../controllers/recipeController';
import { isAuthenticated, isChef, isAdmin, isChefOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/recipes', recipeController.getRecipes);
router.get('/recipes/:id', recipeController.getRecipeById);
router.get('/chef/:chefId/recipes', recipeController.getChefRecipes);
router.get('/region/:region/recipes', recipeController.getRecipesByRegion);
router.get('/allergen/:allergen/recipes', recipeController.getAllergenRecipes);

// Chef routes (chef authentication required)
router.post('/recipes', isAuthenticated, isChef, recipeController.createRecipe);

// Chef or Admin routes (chef or admin authentication required)
router.put('/recipes/:id', isAuthenticated, isChefOrAdmin, recipeController.updateRecipe);
router.delete('/recipes/:id', isAuthenticated, isChefOrAdmin, recipeController.deleteRecipe);

// Admin routes (admin authentication required)
router.patch('/recipes/:id/flag', isAuthenticated, isAdmin, recipeController.flagRecipe);

export default router;