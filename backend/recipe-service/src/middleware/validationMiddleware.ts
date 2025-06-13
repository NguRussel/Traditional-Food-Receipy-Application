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

// Validation rules for updating an existing recipe (all fields optional)
export const validateUpdateRecipe: ValidationChain[] = [
  body('name').optional().trim().isString().notEmpty().withMessage('Recipe name cannot be empty if provided'),
  body('description').optional().trim().isString().notEmpty().withMessage('Description cannot be empty if provided'),
  // chefName is usually not updatable by chef, or derived from auth, so likely not in an update payload from chef.
  // If admin can update chefName, that would be a separate consideration.
  body('cookingTime').optional().isInt({ min: 1 }).withMessage('Cooking time must be a positive integer (minutes)'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('servings').optional().isInt({ min: 1 }).withMessage('Servings must be a positive integer'),
  body('ingredients').optional().isArray({ min: 1 }).withMessage('If ingredients are provided, at least one is required'),
  body('ingredients.*.name').optional().notEmpty().withMessage('Ingredient name is required if ingredient object is present').trim().isString(),
  body('ingredients.*.quantity').optional().notEmpty().withMessage('Ingredient quantity is required if ingredient object is present').trim().isString(),
  body('ingredients.*.unit').optional().notEmpty().withMessage('Ingredient unit is required if ingredient object is present').trim().isString(),
  body('ingredients.*.isOptional').optional().isBoolean().withMessage('isOptional must be a boolean'),
  body('instructions').optional().isArray({ min: 1 }).withMessage('If instructions are provided, at least one step is required'),
  body('instructions.*').optional().notEmpty().withMessage('Instruction step cannot be empty if provided').trim().isString(),
  body('tags.region').optional().notEmpty().withMessage('Region tag cannot be empty if provided').trim().isString(),
  body('tags.tribe').optional().notEmpty().withMessage('Tribe tag cannot be empty if provided').trim().isString(),
  body('tags.categories').optional().isArray().withMessage('Categories tag must be an array if provided'),
  body('tags.categories.*').optional().trim().isString(),
  body('tags.timeOfDay').optional().isArray().withMessage('Time of day tag must be an array if provided'),
  body('tags.timeOfDay.*').optional().trim().isString(),
  body('tags.holidays').optional().isArray().withMessage('Holidays tag must be an array if provided'),
  body('tags.holidays.*').optional().trim().isString(),
  body('tags.ingredients').optional().isArray().withMessage('Ingredient tags must be an array of strings if provided'),
  body('tags.ingredients.*').optional().trim().isString(),
  body('images').optional().isArray().withMessage('Images must be an array of URLs if provided'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL if provided'),
  body('videoUrl').optional().isURL().withMessage('Video URL must be a valid URL if provided'),
  body('nutritionInfo').optional().isObject().withMessage('Nutrition info must be an object if provided'),
  body('status').optional().isIn(['draft', 'pending', 'approved', 'rejected']).withMessage('Invalid status value'), // Admin might change this
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Validation for rejecting a recipe (admin)
export const validateRejectRecipe: ValidationChain[] = [
  body('moderationNotes').notEmpty().withMessage('Moderation notes are required for rejection').trim().isString(),
];

// Validation rules for search recipes query parameters
export const validateSearchRecipesQuery: ValidationChain[] = [
  query('q').optional().isString().trim().withMessage('Search query (q) must be a string'),
  query('region').optional().isString().trim().notEmpty().withMessage('Region filter cannot be empty if provided'),
  query('category').optional().isString().trim().notEmpty().withMessage('Category filter cannot be empty if provided'),
  query('tribe').optional().isString().trim().notEmpty().withMessage('Tribe filter cannot be empty if provided'),
  query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  query('minCookingTime').optional().isInt({ min: 0 }).withMessage('Min cooking time must be a non-negative integer'),
  query('maxCookingTime').optional().isInt({ min: 0 }).withMessage('Max cooking time must be a non-negative integer')
    .custom((value, { req }) => {
      if (req.query?.minCookingTime && value < req.query.minCookingTime) {
        throw new Error('Max cooking time must be greater than or equal to min cooking time');
      }
      return true;
    }),
  query('servings').optional().isInt({ min: 1 }).withMessage('Servings must be a positive integer'),
  query('ingredients').optional().isString().trim().notEmpty().withMessage('Ingredients filter (comma-separated string) cannot be empty if provided'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
];

// Validation rules for path parameters like :category, :region, :tribe
export const validatePathParameter = (paramName: string): ValidationChain => {
  return param(paramName).notEmpty().withMessage(`${paramName} cannot be empty`).trim().isString().withMessage(`${paramName} must be a string`);
};

// Reusable MongoDB ID validation for URL parameters
export const validateMongoIdParam = (paramName: string = 'id'): ValidationChain => {
    return param(paramName).isMongoId().withMessage(`Invalid ${paramName} format in URL parameter`);
}; 