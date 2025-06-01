import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';

// Middleware to handle validation results
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Validation Rules for Scanner Routes ---

export const suggestRecipesValidationRules = [
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be a non-empty array.')
    .custom((value: any[]) => value.every(item => typeof item === 'string' && item.trim() !== ''))
    .withMessage('All ingredients must be non-empty strings.'),
];

// Placeholder for scanIngredients - might need rules for file upload (e.g., type, size)
// This often requires specific middleware like multer, and validation can be tied to that.
export const scanIngredientsValidationRules = [
    // Example: If you were to pass image as base64 string in body
    // body('imageData').isBase64().withMessage('Image data must be a valid base64 string.'),
    // For multipart/form-data, validation is usually handled differently, often after file parsing.
];

export const identifyDishValidationRules = [
    // Similar to scanIngredients, depends on how image is sent.
];

// --- Validation Rules for Admin Scanner Routes ---

export const updateIngredientDatabaseValidationRules = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates must be a non-empty array.'),
  // Add more specific rules for the items within the 'updates' array if needed
  // e.g., body('updates.*.name').isString().notEmpty(),
];

// Add more validation rules as needed for other routes (getAccuracyMetrics, trainModel)
// For GET routes, you might use query() for query parameters or param() for route parameters. 