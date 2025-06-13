import express from 'express';
import { body } from 'express-validator';
import { loginAdmin, getMe } from '../controllers/authController';
import { protectAdmin } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validationMiddleware';

const router = express.Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate admin and receive JWT token
 *     description: Logs in an admin user using email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: superadmin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Admin logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admin logged in successfully
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 admin:
 *                   $ref: '#/components/schemas/Admin' # Assuming Admin schema without password
 *       400:
 *         description: Validation error (e.g., missing fields).
 *       401:
 *         description: Invalid credentials or admin not found/inactive.
 *       500:
 *         description: Server configuration error (e.g., JWT secret missing).
 */
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
        handleValidationErrors,
    ],
    loginAdmin
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current logged-in admin profile
 *     description: Retrieves the profile information of the currently authenticated admin user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin profile.
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
 *       401:
 *         description: Not authorized, token failed or not provided.
 *       403:
 *         description: Admin account is not active or token invalid.
 *       404:
 *         description: Admin profile not found (should be rare if protectAdmin works).
 */
router.get('/me', protectAdmin, getMe);

export default router; 