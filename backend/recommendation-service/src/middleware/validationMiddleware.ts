import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';

// Middleware to handle validation errors from express-validator
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return; // Ensure no further processing by returning explicitly
  }
  next();
};

// Validation rules for tracking a user interaction
export const validateTrackInteraction: ValidationChain[] = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),
  body('recipeId')
    .notEmpty().withMessage('Recipe ID is required')
    .isMongoId().withMessage('Recipe ID must be a valid MongoDB ObjectId'),
  body('interactionType')
    .notEmpty().withMessage('Interaction type is required')
    .isIn(['view', 'like', 'save', 'cook', 'share', 'rating']).withMessage('Invalid interaction type'),
  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
  body('rating')
    .optional()
    // Add conditional validation: if interactionType is 'rating', then rating is required and must be 1-5
    .custom((value, { req }) => {
      if (req.body.interactionType === 'rating') {
        if (value === undefined || value === null) {
          throw new Error('Rating value is required when interactionType is \'rating\'');
        }
        if (typeof value !== 'number' || value < 1 || value > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
      }
      return true;
    })
    // Ensure it's a number if provided, even if not 'rating' type initially
    .if((value) => value !== undefined && value !== null) 
    .isFloat({ min:1, max: 5}).withMessage('Rating, if provided, must be a number between 1 and 5'),
];

// Validation for MongoDB ObjectIds in URL parameters
export const validateMongoIdParam = (paramName: string = 'id'): ValidationChain => {
  return param(paramName)
    .isMongoId().withMessage(`Parameter :${paramName} must be a valid MongoDB ObjectId`);
}; 