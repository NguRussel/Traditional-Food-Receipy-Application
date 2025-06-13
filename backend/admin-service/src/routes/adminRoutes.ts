import express from 'express';
import { body, param, query } from 'express-validator';
import {
    createAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
} from '../controllers/adminController';
import { protectAdmin, authorizeAdminRoles, authorizeAdminPermissions } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationMiddleware';
import { AdminRole, AdminStatus } from '../models/Admin'; // For validation

const router = express.Router();

// All routes in this file are protected and require an authenticated admin
router.use(protectAdmin);

/**
 * @openapi
 * tags:
 *   name: Admins
 *   description: Admin account management (requires authentication and authorization)
 */

/**
 * @openapi
 * /admins:
 *   post:
 *     tags:
 *       - Admins
 *     summary: Create a new admin account
 *     description: Allows authorized admins (e.g., super_admin) to create new admin users. Requires 'super_admin' role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminInput'
 *     responses:
 *       201:
 *         description: Admin account created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Validation error (e.g., email already exists, invalid input).
 *       401:
 *         description: Not authenticated.
 *       403:
 *         description: Not authorized (e.g., insufficient role).
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get all admin accounts
 *     description: Retrieves a list of all admin accounts. Requires 'super_admin' or 'user_manager' role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of admins per page.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by (e.g., name, email, createdAt).
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order.
 *     responses:
 *       200:
 *         description: A list of admin accounts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 pagination:
 *                   type: object # Add pagination details if implemented
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Not authenticated.
 *       403:
 *         description: Not authorized.
 */
router.route('/')
    .post(
        authorizeAdminRoles([AdminRole.SUPER_ADMIN]),
        [
            body('name').trim().notEmpty().withMessage('Name is required.'),
            body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
            body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters if provided.'),
            body('roles').isArray({ min: 1 }).withMessage('At least one role is required.')
                .custom((roles: string[]) => roles.every(role => Object.values(AdminRole).includes(role as AdminRole)))
                .withMessage('Invalid role(s) specified. Valid roles are: ' + Object.values(AdminRole).join(', ')),
            body('permissions').optional().isArray().withMessage('Permissions must be an array of strings.'),
            body('permissions.*').optional().isString().trim(),
            body('status').optional().isIn(Object.values(AdminStatus))
                .withMessage('Invalid status. Valid statuses are: ' + Object.values(AdminStatus).join(', ')),
            body('clerkId').optional().trim().isString(),
            body('avatar').optional().isURL().withMessage('Avatar must be a valid URL.')
        ],
        handleValidationErrors,
        createAdmin
    )
    .get(authorizeAdminRoles([AdminRole.SUPER_ADMIN, AdminRole.USER_MANAGER]), getAllAdmins);

/**
 * @openapi
 * /admins/{id}:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get a specific admin account by ID
 *     description: Retrieves details of a specific admin account. Requires 'super_admin' or 'user_manager' role, or if the admin is fetching their own profile (though /auth/me is preferred for self).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin account to retrieve.
 *     responses:
 *       200:
 *         description: Admin account details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Not authenticated.
 *       403:
 *         description: Not authorized.
 *       404:
 *         description: Admin not found.
 *   put:
 *     tags:
 *       - Admins
 *     summary: Update an admin account
 *     description: Updates details of an existing admin account. Super admins can update any admin. Other admins can only update their own profile (with limitations). Requires 'super_admin' role for updating others, or self-update.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin account to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateInput' # Using a specific schema for updates
 *     responses:
 *       200:
 *         description: Admin account updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Not authenticated.
 *       403:
 *         description: Not authorized (e.g., trying to escalate roles or update protected fields).
 *       404:
 *         description: Admin not found.
 *   delete:
 *     tags:
 *       - Admins
 *     summary: Delete an admin account
 *     description: Deletes an admin account. Requires 'super_admin' role. Super admins cannot delete themselves.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin account to delete.
 *     responses:
 *       200:
 *         description: Admin account deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Admin removed
 *       400:
 *         description: Bad request (e.g., trying to delete self as super_admin).
 *       401:
 *         description: Not authenticated.
 *       403:
 *         description: Not authorized.
 *       404:
 *         description: Admin not found.
 */
router.route('/:id')
    .get(
        authorizeAdminRoles([AdminRole.SUPER_ADMIN, AdminRole.USER_MANAGER]), // Or self - handled in controller
        [param('id').isMongoId().withMessage('Invalid admin ID format'), handleValidationErrors],
        getAdminById
    )
    .put(
        // Authorization logic is complex (self or super_admin), handled in controller
        // authorizeAdminRoles([AdminRole.SUPER_ADMIN]), 
        [
            param('id').isMongoId().withMessage('Invalid admin ID format'),
            body('email').optional().isEmail().withMessage('Please provide a valid email'),
            body('roles').optional().isArray().withMessage('Roles must be an array')
                .custom((roles: AdminRole[]) => !roles || roles.every(role => Object.values(AdminRole).includes(role)))
                .withMessage('Invalid role specified'),
            body('permissions').optional().isArray(),
            body('status').optional().isIn(Object.values(AdminStatus)).withMessage('Invalid status'),
            body('isActive').optional().isBoolean(),
            // Password change fields validation (currentPassword, newPassword)
            body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
            body('currentPassword').if(body('newPassword').exists()).notEmpty().withMessage('Current password is required to set a new password'),
            handleValidationErrors,
        ],
        updateAdmin
    )
    .delete(
        authorizeAdminRoles([AdminRole.SUPER_ADMIN]),
        [param('id').isMongoId().withMessage('Invalid admin ID format'), handleValidationErrors],
        deleteAdmin
    );

export default router; 