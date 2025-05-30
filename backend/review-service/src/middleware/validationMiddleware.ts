import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return; // Explicitly return to satisfy void return type for this path
  }
  next();
};

// Validation rules for creating a review
export const validateCreateReview: ValidationChain[] = [
  body('recipeId')
    .notEmpty().withMessage('Recipe ID is required.')
    .isMongoId().withMessage('Recipe ID must be a valid MongoDB ObjectId.'),
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5.'),
  body('comment')
    .optional()
    .isString().withMessage('Comment must be a string.')
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters.'),
];

// Validation rules for updating a review
export const validateUpdateReview: ValidationChain[] = [
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5.'),
  body('comment')
    .optional()
    .isString().withMessage('Comment must be a string.')
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters.'),
  // Ensure at least one field is being updated (custom validation, can be handled in controller or a custom validator)
  body().custom((value, { req }) => {
    if (req.body.rating === undefined && req.body.comment === undefined) {
      throw new Error('At least one field (rating or comment) must be provided for update.');
    }
    return true;
  }),
];

// Generic validator for MongoDB ObjectId in URL parameters
export const validateMongoIdParam = (paramName: string): ValidationChain => {
  return param(paramName)
    .isMongoId().withMessage(`Parameter '${paramName}' must be a valid MongoDB ObjectId.`);
};

// Generic validator for page and limit query parameters for pagination
export const validatePaginationQueryParams: ValidationChain[] = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer.')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100.')
        .toInt(),
]; 