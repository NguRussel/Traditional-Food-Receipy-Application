import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return; // Explicitly return after sending response
  }
  next();
};

// Validation rules for creating a new recipe
export const validateCreateRecipe: ValidationChain[] = [
  body('name').notEmpty().withMessage('Recipe name is required').trim().isString(),
  body('description').notEmpty().withMessage('Description is required').trim().isString(),
  body('chefName').notEmpty().withMessage('Chef name is required for now (will be from auth later)').trim().isString(), // Temporary until full auth integration
  body('cookingTime').isInt({ min: 1 }).withMessage('Cooking time must be a positive integer (minutes)'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be a positive integer'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('ingredients.*.name').notEmpty().withMessage('Ingredient name is required').trim().isString(),
  body('ingredients.*.quantity').notEmpty().withMessage('Ingredient quantity is required').trim().isString(), // Can be more specific, e.g., '1 cup', '200g'
  body('ingredients.*.unit').notEmpty().withMessage('Ingredient unit is required').trim().isString(),
  body('ingredients.*.isOptional').optional().isBoolean().withMessage('isOptional must be a boolean'),
  body('instructions').isArray({ min: 1 }).withMessage('At least one instruction step is required'),
  body('instructions.*').notEmpty().withMessage('Instruction step cannot be empty').trim().isString(),
  body('tags.region').notEmpty().withMessage('Region tag is required').trim().isString(),
  body('tags.tribe').notEmpty().withMessage('Tribe tag is required').trim().isString(),
  body('tags.categories').optional().isArray().withMessage('Categories tag must be an array'),
  body('tags.categories.*').optional().trim().isString(),
  body('tags.timeOfDay').optional().isArray().withMessage('Time of day tag must be an array'),
  body('tags.timeOfDay.*').optional().trim().isString(),
  body('tags.holidays').optional().isArray().withMessage('Holidays tag must be an array'),
  body('tags.holidays.*').optional().trim().isString(),
  body('tags.ingredients').optional().isArray().withMessage('Ingredient tags must be an array of strings'), // These are keywords, not the detailed ingredients list
  body('tags.ingredients.*').optional().trim().isString(),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('videoUrl').optional().isURL().withMessage('Video URL must be a valid URL'),
  body('nutritionInfo').optional().isObject().withMessage('Nutrition info must be an object'), // Basic check, can be more detailed
];

// Reusable MongoDB ID validation for URL parameters
export const validateMongoIdParam = (paramName: string = 'id'): ValidationChain => {
    return param(paramName).isMongoId().withMessage(`Invalid ${paramName} format in URL parameter`);
}; 