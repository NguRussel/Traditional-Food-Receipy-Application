import express from 'express';
import {
  getAccuracyMetrics,
  trainModel,
  updateIngredientDatabase
} from '../controllers/scannerController';
import { protect, authorize } from '../middleware/authMiddleware';
import { 
  updateIngredientDatabaseValidationRules, 
  handleValidationErrors 
} from '../middleware/validationMiddleware';

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin')); // Assuming a generic 'admin' role for now

router.get('/accuracy-metrics', getAccuracyMetrics);
router.post('/train-model', trainModel);
router.put(
  '/ingredient-database',
  updateIngredientDatabaseValidationRules,
  handleValidationErrors,
  updateIngredientDatabase
);

export default router; 