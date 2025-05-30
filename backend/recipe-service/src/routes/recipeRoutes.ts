import express from 'express';
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController';

// TODO: Add authentication and authorization middleware
// import { protect, authorize } from '../middleware/authMiddleware'; // Example

const router = express.Router();

// CRUD Operations
router.route('/')
  .post(/*protect, authorize('chef'),*/ createRecipe) // Example for protected route
  .get(getAllRecipes);

router.route('/:id')
  .get(getRecipeById)
  .put(/*protect, authorize('chef', 'admin'),*/ updateRecipe) // Example for protected route
  .delete(/*protect, authorize('chef', 'admin'),*/ deleteRecipe); // Example for protected route

export default router; 