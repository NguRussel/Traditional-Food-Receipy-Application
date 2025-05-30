import { Router } from 'express';
import {
    getAllRegions,
    getRegionDetails,
    getAllTribes,
    getRecipesByRegion,
    getRecipesByTribe,
    getTribesByRegion
} from '../controllers/regionalController';
import {
    validateMongoIdParam,
    validateRegionNameParam,
    validateTribeNameParam,
    handleValidationErrors
} from '../middleware/validationMiddleware';

const router = Router();

/**
 * @openapi
 * /regional/regions:
 *   get:
 *     tags:
 *       - Regional Public
 *     summary: Get all active regions
 *     description: Retrieves a list of all active regions, with a summary of information.
 *     responses:
 *       200:
 *         description: A list of regions.
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
 *                     $ref: '#/components/schemas/Region' # Should be a summarized Region schema
 *       500:
 *         description: Internal server error
 */
router.route('/regions').get(getAllRegions);

/**
 * @openapi
 * /regional/regions/{id}:
 *   get:
 *     tags:
 *       - Regional Public
 *     summary: Get details of a specific region
 *     description: Retrieves detailed information about a single region by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region to retrieve.
 *     responses:
 *       200:
 *         description: Detailed information about the region.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Region'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.route('/regions/:id')
    .get(validateMongoIdParam('id'), handleValidationErrors, getRegionDetails);

/**
 * @openapi
 * /regional/regions/{regionId}/tribes:
 *   get:
 *     tags:
 *       - Regional Public
 *     summary: Get all active tribes for a specific region
 *     description: Retrieves a list of active tribes belonging to a specific region.
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the region.
 *     responses:
 *       200:
 *         description: A list of tribes for the specified region.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 regionName:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object # Simplified Tribe for this view
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       400:
 *         description: Invalid Region ID format
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.route('/regions/:regionId/tribes')
    .get(validateMongoIdParam('regionId'), handleValidationErrors, getTribesByRegion);

/**
 * @openapi
 * /regional/tribes:
 *   get:
 *     tags:
 *       - Regional Public
 *     summary: Get all active tribes globally
 *     description: Retrieves a list of all active tribes across all regions. This can be a large list.
 *     responses:
 *       200:
 *         description: A global list of tribes with their region.
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
 *                     type: object
 *                     properties:
 *                       regionName:
 *                         type: string
 *                       tribeName:
 *                         type: string
 *                       tribeDescription:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.route('/tribes').get(getAllTribes);

/**
 * @openapi
 * /regional/recipes/region/{regionName}:
 *   get:
 *     tags:
 *       - Regional Public
 *     summary: Get recipes by region name (Placeholder)
 *     description: Placeholder - This endpoint will eventually retrieve recipes filtered by a region name. Requires integration with Recipe Service.
 *     parameters:
 *       - in: path
 *         name: regionName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the region.
 *     responses:
 *       200:
 *         description: Confirmation message or list of recipes.
 *       404:
 *         description: Region not found
 *       500:
 *         description: Internal server error
 */
router.route('/recipes/region/:regionName')
    .get(validateRegionNameParam, handleValidationErrors, getRecipesByRegion);

/**
 * @openapi
 * /regional/recipes/tribe/{tribeName}:
 *   get:
 *     tags:
 *       - Regional Public
 *     summary: Get recipes by tribe name (Placeholder)
 *     description: Placeholder - This endpoint will eventually retrieve recipes filtered by a tribe name. Requires integration with Recipe Service.
 *     parameters:
 *       - in: path
 *         name: tribeName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the tribe.
 *     responses:
 *       200:
 *         description: Confirmation message or list of recipes.
 *       404:
 *         description: Tribe not found
 *       500:
 *         description: Internal server error
 */
router.route('/recipes/tribe/:tribeName')
    .get(validateTribeNameParam, handleValidationErrors, getRecipesByTribe);

export default router; 