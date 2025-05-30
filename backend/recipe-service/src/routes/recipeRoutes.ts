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

// Search Route
router.get('/search', 
  validateSearchRecipesQuery,
  handleValidationErrors, 
  searchRecipes
);

// Get popular recipes
router.get('/popular', getPopularRecipes);

// Get recent recipes
router.get('/recent', getRecentRecipes);

// Get recipes by Chef
router.get('/chef/:chefId', 
  validateMongoIdParam('chefId'), // Specific param name
  handleValidationErrors, 
  getRecipesByChef
);

// Get recipes by category, region, tribe
router.get('/category/:category', 
  validatePathParameter('category'),
  handleValidationErrors,
  getRecipesByCategory
);
router.get('/region/:region', 
  validatePathParameter('region'),
  handleValidationErrors,
  getRecipesByRegion
);
router.get('/tribe/:tribe', 
  validatePathParameter('tribe'),
  handleValidationErrors,
  getRecipesByTribe
);

// CRUD Operations
router.route('/')
  .post(
    protect, 
    authorize('chef'), 
    validateCreateRecipe, // Add validation rules
    handleValidationErrors, // Add error handler for validation
    createRecipe
  )
  .get(getAllRecipes);

router.route('/:id')
  .get(
    validateMongoIdParam(), // Validate :id parameter
    handleValidationErrors,
    getRecipeById
  )
  .put(
    protect, 
    authorize('chef', 'admin'), 
    validateMongoIdParam(), // Validate :id parameter
    validateUpdateRecipe, // Apply update validation rules
    handleValidationErrors, 
    updateRecipe
  )
  .delete(
    protect, 
    authorize('chef', 'admin'), 
    validateMongoIdParam(), // Validate :id parameter
    handleValidationErrors, 
    deleteRecipe
  );

// Track recipe view
router.post('/:id/view', 
  validateMongoIdParam(), 
  handleValidationErrors, 
  trackRecipeView
);

// Get related recipes
router.get('/:id/related', 
  validateMongoIdParam(), 
  handleValidationErrors, 
  getRelatedRecipes
);

export default router; 