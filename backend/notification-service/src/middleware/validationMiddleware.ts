import { Request, Response, NextFunction } from 'express';
import { validationResult, Result, ValidationError, param, query, body } from 'express-validator';
import CustomError from '../utils/CustomError';
import mongoose from 'mongoose';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error: any) => ({ // Changed error type to any to match previous fix
            field: error.param || error.path, // error.param might be undefined for some errors
            message: error.msg,
        }));
        // Use CustomError for consistent error responses
        return next(new CustomError(JSON.stringify(errorMessages), 400));
    }
    next();
};

export const validateMongoIdParam = (paramName: string = 'id') => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName} format (must be a Mongo ID)`),
];

export const validatePaginationQueryParams = () => [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Specific validation rules for notification service will be added here
// For example, for creating a system notification:
export const validateCreateSystemNotification = () => [
    body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
    body('message').notEmpty().withMessage('Message is required').isString().withMessage('Message must be a string'),
    body('type').isIn(['maintenance', 'feature', 'policy', 'warning']).withMessage('Invalid notification type'),
    body('targetAudience').optional().isIn(['all', 'users', 'chefs', 'admins']).withMessage('Invalid target audience'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('scheduledAt').optional().isISO8601().toDate().withMessage('Invalid scheduledAt date format'),
    body('expiresAt').optional().isISO8601().toDate().withMessage('Invalid expiresAt date format')
        .custom((value, { req }) => {
            if (req.body.scheduledAt && value && new Date(value) <= new Date(req.body.scheduledAt)) {
                throw new Error('expiresAt must be after scheduledAt');
            }
            return true;
        }),
];

export const validateUpdateSystemNotification = () => [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('message').optional().isString().withMessage('Message must be a string'),
    body('type').optional().isIn(['maintenance', 'feature', 'policy', 'warning']).withMessage('Invalid notification type'),
    body('targetAudience').optional().isIn(['all', 'users', 'chefs', 'admins']).withMessage('Invalid target audience'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('scheduledAt').optional().isISO8601().toDate().withMessage('Invalid scheduledAt date format'),
    body('expiresAt').optional().isISO8601().toDate().withMessage('Invalid expiresAt date format')
        .custom((value, { req }) => {
            const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
            const expiresAt = value ? new Date(value) : null;
            // Only validate if both dates are present or if one is being updated relative to an existing one (would require fetching the existing doc)
            // For simplicity, we only validate if both are provided in the update payload.
            if (scheduledAt && expiresAt && expiresAt <= scheduledAt) {
                throw new Error('expiresAt must be after scheduledAt');
            }
            return true;
        }),
];

export const validateSubscribe = () => [
    body('token').notEmpty().withMessage('Push token is required').isString().withMessage('Token must be a string'),
    body('platform').optional().isIn(['ios', 'android', 'web']).withMessage('Invalid platform'),
];

export const validateSendNotification = () => [
    body('userId').if(body('targetType').equals('user')).isMongoId().withMessage('Valid userId is required when targetType is user'),
    body('targetType').isIn(['user', 'topic', 'all']).withMessage('Invalid targetType. Must be user, topic, or all.'),
    body('topicName').if(body('targetType').equals('topic')).notEmpty().withMessage('topicName is required when targetType is topic'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('data').optional().isObject().withMessage('Data must be an object'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
]; 