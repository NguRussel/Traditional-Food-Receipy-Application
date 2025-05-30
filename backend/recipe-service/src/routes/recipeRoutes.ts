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
} from '../controllers/recipeController';

// TODO: Add authentication and authorization middleware
// import { protect, authorize } from '../middleware/authMiddleware'; // Example

const router = express.Router();

// Search Route (should be defined before routes with /:id)
router.get('/search', searchRecipes);

// Get popular recipes
router.get('/popular', getPopularRecipes);

// Get recent recipes
router.get('/recent', getRecentRecipes);

// Get recipes by Chef
router.get('/chef/:chefId', getRecipesByChef);

// CRUD Operations
router.route('/')
  .post(/*protect, authorize('chef'),*/ createRecipe) // Example for protected route
  .get(getAllRecipes);

router.route('/:id')
  .get(getRecipeById)
  .put(/*protect, authorize('chef', 'admin'),*/ updateRecipe) // Example for protected route
  .delete(/*protect, authorize('chef', 'admin'),*/ deleteRecipe); // Example for protected route

export default router; 