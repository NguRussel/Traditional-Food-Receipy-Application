import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import CustomError from '../utils/CustomError';
import mongoose from 'mongoose';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));
    // Use void to explicitly indicate no value is returned after sending response
    res.status(400).json({ errors: errorMessages });
    return; 
  }
  next();
};

export const validateMongoIdParam = (paramName: string = 'id'): ValidationChain => {
  return param(paramName).isMongoId().withMessage(`${paramName} must be a valid MongoDB ObjectId`);
};

export const validatePaginationQueryParams = (): ValidationChain[] => {
  return [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be an integer between 1 and 100'),
  ];
};

// Placeholder for media-specific validations - we will add these as we build controllers

// Example: Validation for file upload (general structure)
// export const validateFileUpload = () => {
//   return [
//     body('category').isIn(['recipe', 'profile', 'verification', 'review']).withMessage('Invalid media category'),
//     // We will also need to handle file presence and type using multer or custom logic
//   ];
// };

export const validateModerationData = (): ValidationChain[] => {
  return [
    body('status')
      .trim()
      .notEmpty().withMessage('Moderation status cannot be empty.')
      .isIn(['active', 'flagged', 'hidden', 'deleted']).withMessage('Invalid moderation status.'),
    body('flaggedReason')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Flagged reason cannot exceed 500 characters.'),
  ];
}; 