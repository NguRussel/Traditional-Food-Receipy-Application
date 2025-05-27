import express from 'express';
import * as videoController from '../controllers/videoController';
import { isAuthenticated, isChef, isAdmin, isChefOrAdmin } from '../middleware/authMiddleware';
import { upload, uploadToFirebase } from '../middleware/uploadMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/videos', videoController.getVideos);
router.get('/videos/:id', videoController.getVideoById);
router.get('/chef/:chefId/videos', videoController.getChefVideos);

// User routes (authentication required)
router.get('/user/favorites', isAuthenticated, videoController.getFavoriteVideos);

// Chef routes (chef authentication required)
router.post(
  '/videos',
  isAuthenticated,
  isChef,
  upload.single('video'),
  uploadToFirebase,
  videoController.uploadVideo
);

// Chef or Admin routes (chef or admin authentication required)
router.put('/videos/:id', isAuthenticated, isChefOrAdmin, videoController.updateVideo);
router.delete('/videos/:id', isAuthenticated, isChefOrAdmin, videoController.deleteVideo);

// Admin routes (admin authentication required)
router.patch('/videos/:id/flag', isAuthenticated, isAdmin, videoController.flagVideo);

export default router;