import express from 'express';
import {
  getPendingRecipes,
  approveRecipe,
  rejectRecipe,
} from '../controllers/recipeController';
import { protect, authorize } from '../middleware/authMiddleware';
import { 
  validateMongoIdParam, 
  handleValidationErrors,
  validateRejectRecipe
} from '../middleware/validationMiddleware';

const router = express.Router();

// Apply protect and authorize middleware to all routes in this router
router.use(protect, authorize('admin'));

/**
 * @openapi
 * tags:
 *   name: AdminRecipes
 *   description: Recipe management endpoints for administrators.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     RejectRecipeInput:
 *       type: object
 *       required:
 *         - moderationNotes
 *       properties:
 *         moderationNotes:
 *           type: string
 *           description: Reason for rejecting the recipe.
 *           example: Incomplete instructions.
 */

/**
 * @openapi
 * /admin/recipes/pending:
 *   get:
 *     summary: Get all recipes pending approval
 *     description: Retrieves a paginated list of recipes with 'pending' status, for admin review.
 *     tags: [AdminRecipes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQueryParam' 
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *     responses:
 *       200:
 *         description: A list of pending recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe' 
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationData' 
 *       401:
 *         description: Unauthorized - User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/pending', getPendingRecipes);

/**
 * @openapi
 * /admin/recipes/{id}/approve:
 *   put:
 *     summary: Approve a pending recipe
 *     description: Allows an admin to approve a recipe, changing its status to 'approved'.
 *     tags: [AdminRecipes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to approve.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *     responses:
 *       200:
 *         description: Recipe approved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Recipe approved successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipe not found or not pending approval.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/approve', 
  validateMongoIdParam('id'), 
  handleValidationErrors, 
  approveRecipe
);

/**
 * @openapi
 * /admin/recipes/{id}/reject:
 *   put:
 *     summary: Reject a pending recipe
 *     description: Allows an admin to reject a recipe, changing its status to 'rejected' and adding moderation notes.
 *     tags: [AdminRecipes]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB Object ID of the recipe to reject.
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 60d5ec49f739d4001c9d8182
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectRecipeInput'
 *     responses:
 *       200:
 *         description: Recipe rejected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Recipe rejected successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid input data or invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not an admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recipe not found or not pending approval.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/reject', 
  validateMongoIdParam('id'), 
  validateRejectRecipe,
  handleValidationErrors, 
  rejectRecipe
);

export default router; 