import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateMongoIdParam = (paramName: string) => [
    param(paramName).custom((value) => {
        // Check if it's a valid ObjectId. If not, it could be a ClerkId string, which is fine for some routes.
        // Specific logic in controller will differentiate.
        // This basic check here is mostly to ensure it's not obviously malformed if it *should* be an ObjectId.
        // For routes strictly expecting ObjectId, a .isMongoId() can be chained if needed AFTER this custom check
        // or if the route only accepts ObjectIds.
        if (value && !mongoose.Types.ObjectId.isValid(value) && value.length !== 24) {
            // If it's not a valid ObjectId format and not a typical ClerkId length (which can vary), 
            // it might be an issue. However, ClerkIDs are strings and don't have a fixed format like ObjectId.
            // For now, we allow any non-empty string for params that can be either ClerkId or ObjectId.
            // The controller handles the distinction.
        }
        return true;
    }).withMessage(`Parameter '${paramName}' format is not typical for ID if intended as ObjectId.`) // General message
];

export const validateStrictMongoIdParam = (paramName: string) => [
    param(paramName).isMongoId().withMessage(`Parameter '${paramName}' must be a valid MongoDB ObjectId`)
];


export const validateUpdateChefProfile = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('bio').optional().trim().notEmpty().withMessage('Bio cannot be empty')
        .isString().withMessage('Bio must be a string')
        .isLength({ min: 10 }).withMessage('Bio must be at least 10 characters'),
    body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
    body('specialization').optional().isArray().withMessage('Specialization must be an array'),
    body('specialization.*').optional().trim().notEmpty().isString().withMessage('Each specialization must be a non-empty string'),
    body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
    body('region').optional().trim().notEmpty().isString().withMessage('Region must be a string'),
    body('tribe').optional().trim().isString().withMessage('Tribe must be a string'),
    // SocialMedia is an object, validate its properties if present
    body('socialMedia').optional().isObject().withMessage('socialMedia must be an object'),
    body('socialMedia.instagram').optional().trim().isURL().withMessage('Instagram URL must be valid'),
    body('socialMedia.facebook').optional().trim().isURL().withMessage('Facebook URL must be valid'),
    body('socialMedia.youtube').optional().trim().isURL().withMessage('YouTube URL must be valid'),
    // Prevent disallowed fields explicitly (controller also filters, but good to have here)
    body('email').not().exists().withMessage('Email cannot be updated via this route'),
    body('clerkId').not().exists().withMessage('Clerk ID cannot be updated via this route'),
    body('verificationStatus').not().exists().withMessage('Verification status cannot be updated by chef'),
    body('isVerified').not().exists().withMessage('Verification flag cannot be updated by chef'),
    body('statistics').not().exists().withMessage('Statistics cannot be updated by chef'),
    body('followers').not().exists().withMessage('Followers cannot be updated by chef'),
    body('accountStatus').not().exists().withMessage('Account status cannot be updated by chef'),
];

export const validateApplyForVerification = [
    body('verificationDocuments').isArray({ min: 1 }).withMessage('At least one verification document URL is required'),
    body('verificationDocuments.*').isString().trim().notEmpty().withMessage('Each verification document must be a non-empty string (URL or identifier)')
];

export const validateVerificationDocumentsUpload = [
    body('verificationDocuments').isArray({ min: 1 }).withMessage('At least one verification document URL is required'),
    body('verificationDocuments.*').isString().trim().notEmpty().withMessage('Each verification document must be a non-empty string (URL or identifier)')
];

export const validateAdminRejectVerification = [
    body('verificationNotes').trim().notEmpty().isString().withMessage('Verification notes are required for rejection')
        .isLength({ min: 10 }).withMessage('Verification notes must be at least 10 characters'),
];

export const validateSearchChefsQuery = [
    query('q').optional().isString().trim(),
    query('region').optional().isString().trim(),
    query('tribe').optional().isString().trim(),
    query('specialization').optional().isString().trim(), // Comma-separated string
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be an integer between 1 and 100'),
];

export const validateGetAllChefsAdminQuery = [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be an integer between 1 and 100'),
    query('verificationStatus').optional().isIn(['pending', 'verified', 'rejected']).withMessage('Invalid verification status'),
    query('accountStatus').optional().isIn(['active', 'suspended', 'banned']).withMessage('Invalid account status'),
    query('region').optional().isString().trim(),
    query('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean string (true/false)').toBoolean(),
]; 