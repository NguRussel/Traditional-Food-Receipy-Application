import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param } from 'express-validator';
import mongoose from 'mongoose';

// Middleware to handle validation errors from express-validator
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validator for MongoDB ObjectId in URL parameters
export const validateMongoIdParam = (paramName: string) => [
  param(paramName).custom((value: string) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${paramName} format`);
    }
    return true;
  }),
  handleValidationErrors,
];

// Validation rules for updating user profile
export const validateUpdateUserProfile = [
  body('fullName').optional().isString().trim().notEmpty().withMessage('Full name must be a non-empty string'),
  body('username').optional().isString().trim().notEmpty().withMessage('Username must be a non-empty string')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  handleValidationErrors,
];

// Validation rules for updating user preferences
export const validateUpdateUserPreferences = [
  body('dietaryRestrictions').optional().isArray().withMessage('Dietary restrictions must be an array of strings'),
  body('dietaryRestrictions.*').optional().isString().trim(),
  body('allergies').optional().isArray().withMessage('Allergies must be an array of strings'),
  body('allergies.*').optional().isString().trim(),
  body('favoriteRegions').optional().isArray().withMessage('Favorite regions must be an array of strings'),
  body('favoriteRegions.*').optional().isString().trim(),
  body('favoriteTribes').optional().isArray().withMessage('Favorite tribes must be an array of strings'),
  body('favoriteTribes.*').optional().isString().trim(),
  body('spiceLevel').optional().isIn(['Mild', 'Medium', 'Hot']).withMessage('Invalid spice level'),
  body('cookingExperience').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid cooking experience level'),
  handleValidationErrors,
];

// Validation rules for MealPlanItem (used within validateCreateMealPlan and validateUpdateMealPlan)
const mealPlanItemValidationRules = [
  body('*.date').isISO8601().toDate().withMessage('Each meal date must be a valid ISO 8601 date'),
  body('*.breakfast').optional({ checkFalsy: true }).isMongoId().withMessage('Breakfast recipe ID must be a valid MongoDB ObjectId'),
  body('*.lunch').optional({ checkFalsy: true }).isMongoId().withMessage('Lunch recipe ID must be a valid MongoDB ObjectId'),
  body('*.dinner').optional({ checkFalsy: true }).isMongoId().withMessage('Dinner recipe ID must be a valid MongoDB ObjectId'),
  body('*.snacks').optional().isArray().withMessage('Snacks must be an array'),
  body('*.snacks.*').optional({ checkFalsy: true }).isMongoId().withMessage('Each snack recipe ID must be a valid MongoDB ObjectId'),
];

// Validation rules for creating a new meal plan
export const validateCreateMealPlan = [
  body('name').isString().trim().notEmpty().withMessage('Meal plan name is required and must be a string'),
  body('startDate').isISO8601().toDate().withMessage('Start date is required and must be a valid ISO 8601 date'),
  body('endDate').isISO8601().toDate().withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('meals').optional().isArray().withMessage('Meals must be an array of meal items'),
  // Apply meal item validation rules to each item in the meals array
  // Note: express-validator path for items in an array is 'meals.*.date' etc.
  body('meals.*.date').isISO8601().toDate().withMessage('Each meal date must be a valid ISO 8601 date'),
  body('meals.*.breakfast').optional({ checkFalsy: true }).isMongoId().withMessage('Breakfast recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.lunch').optional({ checkFalsy: true }).isMongoId().withMessage('Lunch recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.dinner').optional({ checkFalsy: true }).isMongoId().withMessage('Dinner recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.snacks').optional().isArray().withMessage('Snacks must be an array'),
  body('meals.*.snacks.*').optional({ checkFalsy: true }).isMongoId().withMessage('Each snack recipe ID must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

// Validation rules for updating an existing meal plan (all fields optional)
export const validateUpdateMealPlan = [
  body('name').optional().isString().trim().notEmpty().withMessage('Meal plan name must be a non-empty string'),
  body('startDate').optional().isISO8601().toDate().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate').optional().isISO8601().toDate().withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
      // Only validate if both start and end dates are present or being updated together
      if (startDate && new Date(value) < startDate) {
        throw new Error('End date must be after start date');
      } // Consider if only end date is provided, how to compare with existing start date.
      return true;
    }),
  body('meals').optional().isArray().withMessage('Meals must be an array of meal items'),
  // Apply meal item validation rules to each item in the meals array if meals are provided
  body('meals.*.date').optional().isISO8601().toDate().withMessage('Each meal date must be a valid ISO 8601 date'),
  body('meals.*.breakfast').optional({ checkFalsy: true }).isMongoId().withMessage('Breakfast recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.lunch').optional({ checkFalsy: true }).isMongoId().withMessage('Lunch recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.dinner').optional({ checkFalsy: true }).isMongoId().withMessage('Dinner recipe ID must be a valid MongoDB ObjectId'),
  body('meals.*.snacks').optional().isArray().withMessage('Snacks must be an array'),
  body('meals.*.snacks.*').optional({ checkFalsy: true }).isMongoId().withMessage('Each snack recipe ID must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

// Validation rules for adding a search term
export const validateAddSearchTerm = [
  body('searchTerm').isString().trim().notEmpty().withMessage('Search term is required and must be a non-empty string')
    .isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors,
];

// Validation rules for updating user status by Admin
export const validateUpdateUserStatusByAdmin = [
  param('userId').isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'), // Assuming userId in param is the mongo _id
  body('accountStatus').isIn(['active', 'suspended', 'banned', 'pending_verification']).withMessage('Invalid account status'),
  body('suspensionReason').optional().if(body('accountStatus').custom(status => status === 'suspended' || status === 'banned'))
    .isString().trim().notEmpty().withMessage('Suspension reason is required if status is suspended or banned'),
  body('suspensionExpiry').optional().if(body('accountStatus').custom(status => status === 'suspended'))
    .isISO8601().toDate().withMessage('Suspension expiry must be a valid date if status is suspended'),
  // Ensure suspensionReason and suspensionExpiry are not present if status is not suspended/banned
  body('suspensionReason').if(body('accountStatus').custom(status => status === 'active' || status === 'pending_verification'))
    .not().exists().withMessage('Suspension reason should not be provided if status is active or pending'),
  body('suspensionExpiry').if(body('accountStatus').custom(status => status === 'active' || status === 'pending_verification' || status === 'banned'))
    .not().exists().withMessage('Suspension expiry should not be provided if status is active, pending, or banned'),
  handleValidationErrors,
]; 