import express from 'express';
import {
  protect,
  authorize,
} from '../middleware/authMiddleware';
import {
  // Placeholder controller functions - to be implemented
  uploadRecipeImage,
  uploadAvatar,
  deleteMediaById,
  getOptimizedImage,
  uploadRecipeVideo,
  streamVideo,
  generateVideoThumbnail,
  uploadVerificationDocument,
  getFlaggedMedia,
  moderateMedia,
  getMediaStatistics,
} from '../controllers/mediaController'; // Assuming controller path
import {
  validateMongoIdParam,
  handleValidationErrors,
  validateModerationData,
  // We might add specific file validation rules here later if needed
} from '../middleware/validationMiddleware';
import { 
  imageUpload,
  videoUpload,
  documentUpload
} from '../middleware/multerConfig';

// import { configureMulter } from '../middleware/multerConfig'; // We will create this later

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Image management operations
 */

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management operations
 */

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management operations (e.g., verification)
 */

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-specific media operations
 */

// For file uploads, we will need multer middleware. Configuration will be added later.
// const imageUpload = configureMulter(/* image options */); 
// const videoUpload = configureMulter(/* video options */);
// const documentUpload = configureMulter(/* document options */);

// Image Management
/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: Upload a recipe image
 *     tags: [Images]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: 
 *                 type: string
 *                 format: binary
 *                 description: The recipe image file to upload.
 *               category: # Example of an additional form field, though our controller deduces it
 *                 type: string
 *                 enum: [recipe]
 *                 default: recipe
 *                 description: Category of the image (currently fixed to 'recipe' by this endpoint).
 *     responses:
 *       '201':
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: Recipe image uploaded successfully. }
 *                 data: { $ref: '#/components/schemas/Media' }
 *       '400':
 *         description: Bad request (e.g., no file, invalid file type, validation error)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' } # Or ErrorResponse
 *       '401':
 *         description: Unauthorized (e.g., x-user-id header missing)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal server error (e.g., Firebase issue, database issue)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  '/images/upload',
  protect,
  imageUpload.single('image'), // 'image' is the field name in form-data
  // validateImageUpload, // Placeholder for any additional express-validator rules for image metadata
  handleValidationErrors, // This should ideally come after all multer and express-validator checks
  uploadRecipeImage
);
router.post(
  '/images/avatar',
  protect,
  imageUpload.single('avatar'), // 'avatar' is the field name
  // validateAvatarUpload, 
  handleValidationErrors,
  uploadAvatar
);
router.delete(
  '/images/:id',
  protect, 
  validateMongoIdParam('id'), 
  handleValidationErrors, 
  deleteMediaById
);
router.get(
  '/images/:id/optimized',
  validateMongoIdParam('id'),
  handleValidationErrors,
  getOptimizedImage
); // Public or protected? Let's assume public for now

// Video Management
router.post(
  '/videos/upload',
  protect,
  videoUpload.single('video'), // 'video' is the field name
  // validateVideoUpload,
  handleValidationErrors,
  uploadRecipeVideo
);
router.get(
  '/videos/:id/stream',
  validateMongoIdParam('id'),
  handleValidationErrors,
  streamVideo
); // Public or protected?
router.post(
  '/videos/:id/thumbnail',
  protect, // Or should this be callable by system/another service?
  validateMongoIdParam('id'),
  handleValidationErrors,
  generateVideoThumbnail
);

// Document Management
router.post(
  '/documents/upload',
  protect,
  authorize(['chef', 'admin']),
  documentUpload.single('document'), // 'document' is the field name
  // validateDocumentUpload,
  handleValidationErrors,
  uploadVerificationDocument
);

// Admin-specific endpoints
/**
 * @swagger
 * /flagged:
 *   get:
 *     summary: Get all flagged media items (paginated)
 *     tags: [Admin]
 *     security:
 *       - apiKeyAuth: []
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
 *     responses:
 *       '200':
 *         description: A list of flagged media items.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string, example: Flagged media retrieved successfully. }
 *                 data: 
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Media' }
 *                 pagination: 
 *                   type: object
 *                   properties:
 *                     currentPage: { type: integer, example: 1 }
 *                     totalPages: { type: integer, example: 5 }
 *                     totalItems: { type: integer, example: 48 }
 *                     itemsPerPage: { type: integer, example: 10 }
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '403':
 *         description: Forbidden (user is not an admin)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  '/flagged',
  protect,
  authorize(['admin']),
  getFlaggedMedia
);
router.put(
  '/:id/moderate',
  protect,
  authorize(['admin']),
  validateMongoIdParam('id'),
  validateModerationData(),
  handleValidationErrors,
  moderateMedia
);
router.get(
  '/statistics',
  protect,
  authorize(['admin']),
  getMediaStatistics
);

// Note: DELETE /media/images/:id and potentially DELETE /media/videos/:id 
// are already covered by a generic deleteMediaById. 
// If specific logic is needed for video deletion beyond what generic deleteMediaById handles,
// we might need a dedicated route or adjust deleteMediaById.
// For now, deleteMediaById is assumed to handle both based on the media type in the DB.

export default router; 