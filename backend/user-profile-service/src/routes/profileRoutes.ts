import express from 'express';
import { getProfile, updateProfile, addFavorite, removeFavorite } from '../controllers/profileController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:userId', requireAuth, getProfile);
router.put('/:userId', requireAuth, updateProfile);
router.post('/:userId/favorites', requireAuth, addFavorite);
router.delete('/:userId/favorites/:recipeId', requireAuth, removeFavorite);

export default router;