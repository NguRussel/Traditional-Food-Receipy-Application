import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator.
 * If errors are present, it sends a 400 response with the errors.
 * Otherwise, it calls the next middleware.
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Add other specific validation chains here as needed, for example:

// export const validateCreateAdmin = [
//     body('name').notEmpty().withMessage('Name is required'),
//     body('email').isEmail().withMessage('Valid email is required'),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
//     body('roles').isArray({ min: 1 }).withMessage('At least one role is required')
//         .custom((roles: string[]) => roles.every(role => Object.values(AdminRole).includes(role as AdminRole)))
//         .withMessage('Invalid role specified'),
//     // Add more validations as needed for permissions, status etc.
//     handleValidationErrors // Ensure this is the last in the chain if used directly here
// ]; 