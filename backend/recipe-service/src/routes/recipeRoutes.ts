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

// Get recipes by category, region, tribe
router.get('/category/:category', getRecipesByCategory);
router.get('/region/:region', getRecipesByRegion);
router.get('/tribe/:tribe', getRecipesByTribe);

// CRUD Operations
router.route('/')
  .post(protect, authorize('chef'), createRecipe) // Apply protect and authorize
  .get(getAllRecipes);

router.route('/:id')
  .get(getRecipeById)
  .put(protect, authorize('chef', 'admin'), updateRecipe) // Apply protect and authorize
  .delete(protect, authorize('chef', 'admin'), deleteRecipe); // Apply protect and authorize

// Track recipe view
router.post('/:id/view', trackRecipeView);

// Get related recipes
router.get('/:id/related', getRelatedRecipes);

export default router; 