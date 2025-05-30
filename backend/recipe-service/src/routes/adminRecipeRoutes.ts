import express from 'express';
import {
  getPendingRecipes,
  approveRecipe,
  rejectRecipe,
} from '../controllers/recipeController';

// TODO: Add authentication and authorization middleware (e.g., protect, authorizeAdmin)
// import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All routes in this file will be prefixed with something like /api/v1/recipes/admin

// @route   GET /pending
router.get('/pending', /* protect, authorize('admin'), */ getPendingRecipes);

// @route   PUT /:id/approve
router.put('/:id/approve', /* protect, authorize('admin'), */ approveRecipe);

// @route   PUT /:id/reject
router.put('/:id/reject', /* protect, authorize('admin'), */ rejectRecipe);

export default router; 