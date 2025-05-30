import express from 'express';
import {
  createReview,
  getReviewsForRecipe,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByUser
} from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware'; // Import protect
// import { authorize } from '../middleware/authMiddleware'; // Will be needed later
import {
  handleValidationErrors,
  validateCreateReview,
  validateUpdateReview,
  validateMongoIdParam,
  validatePaginationQueryParams
} from '../middleware/validationMiddleware';

const router = express.Router();

// Create a new review
router.post(
  '/',
  protect, // User must be logged in to create
  validateCreateReview,
  handleValidationErrors,
  createReview
);

// Get all reviews for a specific recipe (e.g., GET /api/v1/reviews/recipe/someRecipeId)
router.get(
  '/recipe/:recipeId',
  validateMongoIdParam('recipeId'),
  validatePaginationQueryParams,
  handleValidationErrors,
  getReviewsForRecipe
);

// Get all reviews by a specific user (e.g., GET /api/v1/reviews/user/someUserId)
router.get(
  '/user/:userId',
  validateMongoIdParam('userId'),
  validatePaginationQueryParams,
  handleValidationErrors,
  getReviewsByUser
);

// Get a single review by its ID
router.get(
  '/:id',
  validateMongoIdParam('id'),
  handleValidationErrors,
  getReviewById
);

// Update a review (user must own the review)
router.put(
  '/:id',
  protect, // User must be logged in
  validateMongoIdParam('id'),
  validateUpdateReview,
  handleValidationErrors,
  updateReview
);

// Delete a review (user must own the review or be an admin)
router.delete(
  '/:id',
  protect, // User must be logged in
  // authorize(['admin']), // Further role check can be added if needed or handled in controller
  validateMongoIdParam('id'),
  handleValidationErrors,
  deleteReview
);

export default router; 