import { Router } from 'express';
import {
    getAllChefs,
    getPendingVerifications,
    verifyChef,
    rejectChefVerification
} from '../controllers/chefController';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    handleValidationErrors,
    validateStrictMongoIdParam, // Use strict ID validation for admin actions on specific chefs
    validateAdminRejectVerification,
    validateGetAllChefsAdminQuery
} from '../middleware/validationMiddleware';
// Validation middleware will be added later

const router = Router();

// All admin routes are protected and require 'admin' role (or more specific roles if needed)
router.use(protect);
router.use(authorize(['admin'])); // Or e.g., ['admin', 'chef_manager']

/**
 * @openapi
 * /admin/chefs/all:
 *   get:
 *     summary: Get all chefs (Admin)
 *     tags: [Chef - Admin]
 *     description: Retrieves a paginated list of all chefs, with optional filters for verification status, account status, region, and verification flag. Requires admin privileges.
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
 *         description: Number of items per page.
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         description: Filter by chef verification status.
 *       - in: query
 *         name: accountStatus
 *         schema:
 *           type: string
 *           enum: [active, suspended, banned]
 *         description: Filter by chef account status.
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region.
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by whether the chef is verified (true/false).
 *     responses:
 *       200:
 *         description: A list of all chefs based on filters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chef'
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden, user is not an admin.
 *       500:
 *         description: Internal server error.
 */
router.get('/all', validateGetAllChefsAdminQuery, handleValidationErrors, getAllChefs);

/**
 * @openapi
 * /admin/chefs/pending-verification:
 *   get:
 *     summary: Get chefs with pending verification (Admin)
 *     tags: [Chef - Admin]
 *     description: Retrieves a list of active chefs whose verification status is pending. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of chefs pending verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object # Or a specific schema for pending chefs if different
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       region:
 *                         type: string
 *                       verificationDocuments:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden, user is not an admin.
 *       500:
 *         description: Internal server error.
 */
router.get('/pending-verification', getPendingVerifications);

/**
 * @openapi
 * /admin/chefs/{chefId}/verify:
 *   put:
 *     summary: Verify a chef (Admin)
 *     tags: [Chef - Admin]
 *     description: Allows an admin to verify a chef. Requires admin privileges. Chef ID must be a valid MongoDB ObjectId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The MongoDB ObjectId of the chef to verify.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificationNotes:
 *                 type: string
 *                 description: Optional notes from the admin regarding the verification.
 *                 example: "All documents look good. Chef verified."
 *     responses:
 *       200:
 *         description: Chef verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chef' # Updated chef object
 *       400:
 *         description: Invalid Chef ID format or chef is already verified.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden, user is not an admin.
 *       404:
 *         description: Chef not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:chefId/verify', 
    validateStrictMongoIdParam('chefId'),
    handleValidationErrors, 
    verifyChef
);

/**
 * @openapi
 * /admin/chefs/{chefId}/reject-verification:
 *   put:
 *     summary: Reject a chef verification (Admin)
 *     tags: [Chef - Admin]
 *     description: Allows an admin to reject a chef's verification application. Requires admin privileges and verification notes. Chef ID must be a valid MongoDB ObjectId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chefId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The MongoDB ObjectId of the chef whose verification is to be rejected.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationNotes
 *             properties:
 *               verificationNotes:
 *                 type: string
 *                 description: Reason for rejecting the verification.
 *                 example: "Submitted documents are unclear. Please re-upload."
 *     responses:
 *       200:
 *         description: Chef verification rejected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Chef' # Updated chef object
 *       400:
 *         description: Invalid Chef ID format, verification notes missing, or cannot reject an already verified chef.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden, user is not an admin.
 *       404:
 *         description: Chef not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:chefId/reject-verification', 
    validateStrictMongoIdParam('chefId'), 
    validateAdminRejectVerification, 
    handleValidationErrors, 
    rejectChefVerification
);

export default router; 