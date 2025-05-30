import express from 'express';
import {
  getAllUsers,
  updateUserStatusByAdmin,
  getUserStatistics,
} from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';
import { validateUpdateUserStatusByAdmin } from '../middleware/validationMiddleware';
// Note: validateMongoIdParam is part of validateUpdateUserStatusByAdmin for 'userId' param

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: AdminUsers
 *   description: User management by administrators
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserStatusUpdateInput:
 *       type: object
 *       required:
 *         - accountStatus
 *       properties:
 *         accountStatus:
 *           type: string
 *           enum: [active, suspended, banned, pending_verification]
 *           description: The new account status for the user.
 *         suspensionReason:
 *           type: string
 *           description: Reason for suspension (required if status is 'suspended' or 'banned').
 *         suspensionExpiry:
 *           type: string
 *           format: date-time
 *           description: Date when suspension expires (required if status is 'suspended').
 *     UserStatistics:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         activeUsers:
 *           type: integer
 *         pendingVerification:
 *           type: integer
 *         suspendedUsers:
 *           type: integer
 *         bannedUsers:
 *           type: integer
 *         newUsersLast30Days:
 *           type: integer
 *   securitySchemes:
 *     AdminAuth: # Specific for admin routes, might be the same underlying mechanism but good to distinguish
 *       type: apiKey
 *       in: header
 *       name: x-user-id # And x-user-roles must contain 'admin'
 *       description: Admin User ID and Roles (x-user-roles must contain 'admin') passed by API Gateway.
 */

// Protect all admin routes and ensure only users with the 'admin' role can access them
router.use(protect, authorize(['admin']));

/**
 * @openapi
 * /users/admin/all:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: A list of all users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User' # Assumes User schema is defined (e.g., in User.ts or userRoutes.ts)
 *       401:
 *         description: Unauthorized (not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden (user is not an admin).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/all', getAllUsers);

/**
 * @openapi
 * /users/admin/{userId}/status:
 *   put:
 *     summary: Update a user's account status (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The MongoDB _id of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserStatusUpdateInput'
 *     responses:
 *       200:
 *         description: User status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or invalid userId.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:userId/status', ...validateUpdateUserStatusByAdmin, updateUserStatusByAdmin);

/**
 * @openapi
 * /users/admin/statistics:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [AdminUsers]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: User statistics data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatistics'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/statistics', getUserStatistics);

export default router; 