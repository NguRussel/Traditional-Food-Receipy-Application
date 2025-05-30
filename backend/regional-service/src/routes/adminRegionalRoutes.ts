import { Router } from 'express';
import {
    createRegion,
    updateRegion,
    deleteRegion,
    createTribeInRegion,
    updateTribeInRegion,
    deleteTribeInRegion
} from '../controllers/regionalController';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    validateRegion,
    validateTribe,
    validateMongoIdParam,
    validateTribeNameParam,
    handleValidationErrors
} from '../middleware/validationMiddleware';

const router = Router();

// Apply protect and authorize middleware to all admin routes
// Assuming 'admin' and 'content_manager' roles can manage regional data
router.use(protect);
router.use(authorize(['admin', 'content_manager'])); 

/**
 * @openapi
 * /admin/regional/regions:
 *   post:
 *     tags:
 *       - Regional Admin
 *     summary: Create a new region
 *     description: Adds a new region to the database. Requires admin or content_manager role.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Region' # Reuses the Region schema, _id, createdAt, updatedAt are ignored on input
 *     responses:
 *       201:
 *         description: Region created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Region'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.route('/regions')
    .post(validateRegion, handleValidationErrors, createRegion);

/**
 * @openapi
 * /admin/regional/regions/{id}:
 *   put:
 *     tags:
 *       - Regional Admin
 *     summary: Update an existing region
 *     description: Updates details of an existing region by its ID. Requires admin or content_manager role.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Region' # Fields to update
 *     responses:
 *       200:
 *         description: Region updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Region'
 *       400:
 *         description: Invalid input data or ID format
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Regional Admin
 *     summary: Delete a region (mark as inactive)
 *     description: Marks a region as inactive (soft delete). Requires admin or content_manager role.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region to mark as inactive.
 *     responses:
 *       200:
 *         description: Region marked as inactive successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.route('/regions/:id')
    .put(validateMongoIdParam('id'), validateRegion, handleValidationErrors, updateRegion)
    .delete(validateMongoIdParam('id'), handleValidationErrors, deleteRegion);

/**
 * @openapi
 * /admin/regional/regions/{regionId}/tribes:
 *   post:
 *     tags:
 *       - Regional Admin
 *     summary: Create a new tribe within a region
 *     description: Adds a new tribe to a specified region. Requires admin or content_manager role.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region containing the tribe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tribe' # Fields to create for the tribe
 *     responses:
 *       201:
 *         description: Tribe created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tribe'
 *       400:
 *         description: Invalid input data, Region ID, or new tribe name conflicts
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.route('/regions/:regionId/tribes')
    .post(validateMongoIdParam('regionId'), validateTribe, handleValidationErrors, createTribeInRegion);

/**
 * @openapi
 * /admin/regional/regions/{regionId}/tribes/{tribeName}:
 *   put:
 *     tags:
 *       - Regional Admin
 *     summary: Update a tribe within a region
 *     description: Updates details of an existing tribe within a specific region. Requires admin or content_manager role.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region containing the tribe.
 *       - in: path
 *         name: tribeName
 *         required: true
 *         schema:
 *           type: string
 *         description: The current name of the tribe to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tribe' # Fields to update for the tribe
 *     responses:
 *       200:
 *         description: Tribe updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Region' # Returns the updated Region object
 *       400:
 *         description: Invalid input data, Region ID, or Tribe name; or new tribe name conflicts
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Region or Tribe not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Regional Admin
 *     summary: Delete a tribe from a region (mark as inactive)
 *     description: Marks a tribe within a specific region as inactive (soft delete). Requires admin or content_manager role.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region containing the tribe.
 *       - in: path
 *         name: tribeName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the tribe to mark as inactive.
 *     responses:
 *       200:
 *         description: Tribe marked as inactive successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid Region ID or Tribe name
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Region or Tribe not found
 *       500:
 *         description: Internal server error
 */
router.route('/regions/:regionId/tribes/:tribeName')
    .put(validateMongoIdParam('regionId'), validateTribeNameParam, validateTribe, handleValidationErrors, updateTribeInRegion)
    .delete(validateMongoIdParam('regionId'), validateTribeNameParam, handleValidationErrors, deleteTribeInRegion);

export default router; 