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

/**
 * @openapi
 * tags:
 *   name: Reviews
 *   description: Review management operations
 */

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Review created successfully" }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Validation error (e.g., missing fields, invalid rating).
 *       401:
 *         description: Unauthorized (User ID missing or invalid).
 *       500:
 *         description: Internal server error.
 */
router.post(
  '/',
  protect, // User must be logged in to create
  validateCreateReview,
  handleValidationErrors,
  createReview
);

/**
 * @openapi
 * /reviews/recipe/{recipeId}:
 *   get:
 *     summary: Get all reviews for a specific recipe
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: The ID of the recipe.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page.
 *     responses:
 *       200:
 *         description: A list of reviews for the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Reviews retrieved successfully" }
 *                 count: { type: integer, example: 1 }
 *                 totalReviews: { type: integer, example: 1 }
 *                 totalPages: { type: integer, example: 1 }
 *                 currentPage: { type: integer, example: 1 }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Review' } }
 *       400:
 *         description: Invalid recipeId or pagination parameters.
 *       404:
 *         description: No reviews found for this page.
 *       500:
 *         description: Internal server error.
 */
router.get(
  '/recipe/:recipeId',
  validateMongoIdParam('recipeId'),
  validatePaginationQueryParams,
  handleValidationErrors,
  getReviewsForRecipe
);

/**
 * @openapi
 * /reviews/user/{userId}:
 *   get:
 *     summary: Get all reviews by a specific user
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: The ID of the user.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page.
 *     responses:
 *       200:
 *         description: A list of reviews by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Reviews by user retrieved successfully" }
 *                 count: { type: integer, example: 1 }
 *                 totalReviews: { type: integer, example: 1 }
 *                 totalPages: { type: integer, example: 1 }
 *                 currentPage: { type: integer, example: 1 }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Review' } }
 *       400:
 *         description: Invalid userId or pagination parameters.
 *       404:
 *         description: No reviews found for this user for this page.
 *       500:
 *         description: Internal server error.
 */
router.get(
  '/user/:userId',
  validateMongoIdParam('userId'),
  validatePaginationQueryParams,
  handleValidationErrors,
  getReviewsByUser
);

/**
 * @openapi
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by its ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: The ID of the review to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the review.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Review retrieved successfully" }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Invalid review ID format.
 *       404:
 *         description: Review not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
  '/:id',
  validateMongoIdParam('id'),
  handleValidationErrors,
  getReviewById
);

/**
 * @openapi
 * /reviews/{id}:
 *   put:
 *     summary: Update an existing review
 *     tags: [Reviews]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: The ID of the review to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewUpdateInput'
 *     responses:
 *       200:
 *         description: Review updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Review updated successfully" }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Validation error (e.g., invalid ID, no update fields provided).
 *       401:
 *         description: Unauthorized (User ID missing or invalid).
 *       403:
 *         description: Forbidden (User is not the owner of the review).
 *       404:
 *         description: Review not found.
 *       500:
 *         description: Internal server error.
 */
router.put(
  '/:id',
  protect, // User must be logged in
  validateMongoIdParam('id'),
  validateUpdateReview,
  handleValidationErrors,
  updateReview
);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: The ID of the review to delete.
 *     responses:
 *       200:
 *         description: Review deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Review deleted successfully" }
 *                 data: { type: object, example: {} }
 *       400:
 *         description: Invalid review ID format.
 *       401:
 *         description: Unauthorized (User ID missing or invalid).
 *       403:
 *         description: Forbidden (User is not the owner or an admin).
 *       404:
 *         description: Review not found.
 *       500:
 *         description: Internal server error.
 */
router.delete(
  '/:id',
  protect, // User must be logged in
  // authorize(['admin']), // Further role check can be added if needed or handled in controller
  validateMongoIdParam('id'),
  handleValidationErrors,
  deleteReview
);

export default router; 