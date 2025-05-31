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

// For file uploads, we will need multer middleware. Configuration will be added later.
// const imageUpload = configureMulter(/* image options */); 
// const videoUpload = configureMulter(/* video options */);
// const documentUpload = configureMulter(/* document options */);

// Image Management
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