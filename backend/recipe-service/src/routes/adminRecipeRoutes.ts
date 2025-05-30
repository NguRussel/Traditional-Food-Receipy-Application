import express from 'express';
import {
  getPendingRecipes,
  approveRecipe,
  rejectRecipe,
} from '../controllers/recipeController';
import { protect, authorize } from '../middleware/authMiddleware';

// TODO: Add authentication and authorization middleware (e.g., protect, authorizeAdmin)
// import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All routes in this file will be protected and require admin role
router.use(protect, authorize('admin'));

// All routes in this file will be prefixed with something like /api/v1/recipes/admin

// @route   GET /pending
router.get('/pending', getPendingRecipes);

// @route   PUT /:id/approve
router.put('/:id/approve', approveRecipe);

// @route   PUT /:id/reject
router.put('/:id/reject', rejectRecipe);

export default router; 