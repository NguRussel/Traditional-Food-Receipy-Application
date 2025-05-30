import express from 'express';
import {
  createReview,
  getReviewsForRecipe,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByUser
} from '../controllers/reviewController';
// import { protect, authorize } from '../middleware/authMiddleware'; // Will be needed later
// import { validateCreateReview, validateUpdateReview, validateMongoIdParam } from '../middleware/validationMiddleware'; // Will be needed later
// import { handleValidationErrors } from '../middleware/validationMiddleware'; // Will be needed later

const router = express.Router();

// Create a new review
router.post(
  '/',
  // protect, // Example: User must be logged in to create
  // validateCreateReview, // Example: Validate input
  // handleValidationErrors,
  createReview
);

// Get all reviews for a specific recipe (e.g., GET /api/v1/reviews/recipe/someRecipeId)
router.get(
  '/recipe/:recipeId',
  // validateMongoIdParam('recipeId'), // Example: Validate recipeId format
  // handleValidationErrors,
  getReviewsForRecipe
);

// Get all reviews by a specific user (e.g., GET /api/v1/reviews/user/someUserId)
router.get(
  '/user/:userId',
  // validateMongoIdParam('userId'), // Example: Validate userId format
  // handleValidationErrors,
  getReviewsByUser
);

// Get a single review by its ID
router.get(
  '/:id',
  // validateMongoIdParam('id'), // Example: Validate review ID format
  // handleValidationErrors,
  getReviewById
);

// Update a review (user must own the review)
router.put(
  '/:id',
  // protect, // Example: User must be logged in
  // validateMongoIdParam('id'),
  // validateUpdateReview, // Example: Validate input for update
  // handleValidationErrors,
  updateReview
);

// Delete a review (user must own the review or be an admin)
router.delete(
  '/:id',
  // protect, // Example: User must be logged in
  // authorize(['admin', 'user']), // Example: Specific logic for delete will be in controller based on ownership
  // validateMongoIdParam('id'),
  // handleValidationErrors,
  deleteReview
);

export default router; 