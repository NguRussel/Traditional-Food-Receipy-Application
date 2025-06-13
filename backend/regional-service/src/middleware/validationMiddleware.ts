import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, check } from 'express-validator';
import mongoose from 'mongoose';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateMongoIdParam = (paramName: string) => [
    param(paramName).isMongoId().withMessage(`Parameter '${paramName}' must be a valid MongoDB ObjectId`)
];

// Validation rules for creating/updating a Region
export const validateRegion = [
    body('name')
        .trim()
        .notEmpty().withMessage('Region name is required')
        .isString().withMessage('Region name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Region name must be between 2 and 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Region description is required')
        .isString().withMessage('Region description must be a string')
        .isLength({ min: 10 }).withMessage('Region description must be at least 10 characters'),
    body('popularDishes').optional().isArray().withMessage('Popular dishes must be an array of strings'),
    body('popularDishes.*').optional().isString().trim().notEmpty().withMessage('Each popular dish must be a non-empty string'),
    body('ingredients').optional().isArray().withMessage('Ingredients must be an array of strings'),
    body('ingredients.*').optional().isString().trim().notEmpty().withMessage('Each ingredient must be a non-empty string'),
    body('culturalInfo').optional().isString().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    // Validate embedded tribes array (optional on region creation/update, handled by specific tribe endpoints if needed in detail)
    body('tribes').optional().isArray().withMessage('Tribes must be an array'),
    // Basic validation for tribes if provided during region creation. More detailed validation can be added.
    check('tribes.*.name').optional().trim().notEmpty().withMessage('Tribe name is required if tribe object is provided').isString(),
    check('tribes.*.description').optional().trim().notEmpty().withMessage('Tribe description is required if tribe object is provided').isString(),
    check('tribes.*.traditionalDishes').optional().isArray(),
    check('tribes.*.traditionalDishes.*').optional().isString().trim().notEmpty(),
    check('tribes.*.cookingMethods').optional().isArray(),
    check('tribes.*.cookingMethods.*').optional().isString().trim().notEmpty(),
    check('tribes.*.isActive').optional().isBoolean(),
];

// Validation rules for creating/updating a Tribe (when managed as a sub-document)
export const validateTribe = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tribe name is required')
        .isString().withMessage('Tribe name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Tribe name must be between 2 and 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Tribe description is required')
        .isString().withMessage('Tribe description must be a string')
        .isLength({ min: 10 }).withMessage('Tribe description must be at least 10 characters'),
    body('traditionalDishes').optional().isArray().withMessage('Traditional dishes must be an array of strings'),
    body('traditionalDishes.*').optional().isString().trim().notEmpty().withMessage('Each traditional dish must be a non-empty string'),
    body('cookingMethods').optional().isArray().withMessage('Cooking methods must be an array of strings'),
    body('cookingMethods.*').optional().isString().trim().notEmpty().withMessage('Each cooking method must be a non-empty string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Middleware to validate tribeName path parameter specifically for name format (not ObjectId)
export const validateTribeNameParam = [
    param('tribeName')
        .trim()
        .notEmpty().withMessage('Tribe name parameter is required')
        .isString().withMessage('Tribe name parameter must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Tribe name parameter must be between 2 and 100 characters')
];

export const validateRegionNameParam = [
    param('regionName')
        .trim()
        .notEmpty().withMessage('Region name parameter is required')
        .isString().withMessage('Region name parameter must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Region name parameter must be between 2 and 100 characters')
]; 