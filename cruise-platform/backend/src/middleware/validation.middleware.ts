import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Create validation chains that include the middleware
const createValidationChain = (validations: any[]) => {
    return [...validations, validationMiddleware];
};

// Registration validation
export const validateRegistration = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('firstName').optional().isLength({ min: 1 }).withMessage('First name must not be empty if provided'),
    body('lastName').optional().isLength({ min: 1 }).withMessage('Last name must not be empty if provided'),
    validationMiddleware
];

// Login validation
export const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validationMiddleware
];

// Scrape request validation
export const validateScrapeRequest = [
    body('url').isURL().withMessage('Please provide a valid URL'),
    body('type').optional().isIn(['company', 'industry', 'general']).withMessage('Invalid scrape type'),
    validationMiddleware
];

export { validationMiddleware };
export default validationMiddleware;