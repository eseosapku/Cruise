import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Validation result interface
interface ValidationResult {
    isValid: boolean;
    errors: string[];
    field?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
    const errors: string[] = [];

    if (!email) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }

        if (email.length > 254) {
            errors.push('Email is too long');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: 'email'
    };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
    const errors: string[] = [];

    if (!password) {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (password.length > 128) {
            errors.push('Password is too long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: 'password'
    };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'name'): ValidationResult => {
    const errors: string[] = [];

    if (!name) {
        errors.push(`${fieldName} is required`);
    } else {
        if (name.trim().length < 2) {
            errors.push(`${fieldName} must be at least 2 characters long`);
        }

        if (name.length > 50) {
            errors.push(`${fieldName} is too long`);
        }

        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(name)) {
            errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: fieldName
    };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
    const errors: string[] = [];

    if (!url) {
        errors.push('URL is required');
    } else {
        try {
            new URL(url);

            // Check for valid protocols
            const validProtocols = ['http:', 'https:'];
            const urlObj = new URL(url);
            if (!validProtocols.includes(urlObj.protocol)) {
                errors.push('URL must use HTTP or HTTPS protocol');
            }
        } catch {
            errors.push('Invalid URL format');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: 'url'
    };
};

// ID validation (UUID v4)
export const validateId = (id: string, fieldName: string = 'id'): ValidationResult => {
    const errors: string[] = [];

    if (!id) {
        errors.push(`${fieldName} is required`);
    } else {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            errors.push(`${fieldName} must be a valid UUID`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: fieldName
    };
};

// Text content validation
export const validateText = (
    text: string,
    fieldName: string,
    minLength: number = 1,
    maxLength: number = 1000
): ValidationResult => {
    const errors: string[] = [];

    if (!text) {
        errors.push(`${fieldName} is required`);
    } else {
        if (text.trim().length < minLength) {
            errors.push(`${fieldName} must be at least ${minLength} characters long`);
        }

        if (text.length > maxLength) {
            errors.push(`${fieldName} must not exceed ${maxLength} characters`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: fieldName
    };
};

// Array validation
export const validateArray = (
    arr: any[],
    fieldName: string,
    minLength: number = 0,
    maxLength: number = 100
): ValidationResult => {
    const errors: string[] = [];

    if (!Array.isArray(arr)) {
        errors.push(`${fieldName} must be an array`);
    } else {
        if (arr.length < minLength) {
            errors.push(`${fieldName} must contain at least ${minLength} items`);
        }

        if (arr.length > maxLength) {
            errors.push(`${fieldName} must not contain more than ${maxLength} items`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: fieldName
    };
};

// User registration validation
export const validateUserRegistration = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}): ValidationResult => {
    const errors: string[] = [];

    const firstNameResult = validateName(data.firstName, 'firstName');
    const lastNameResult = validateName(data.lastName, 'lastName');
    const emailResult = validateEmail(data.email);
    const passwordResult = validatePassword(data.password);

    errors.push(...firstNameResult.errors);
    errors.push(...lastNameResult.errors);
    errors.push(...emailResult.errors);
    errors.push(...passwordResult.errors);

    return {
        isValid: errors.length === 0,
        errors
    };
};

// User login validation
export const validateUserLogin = (data: {
    email: string;
    password: string;
}): ValidationResult => {
    const errors: string[] = [];

    if (!data.email) {
        errors.push('Email is required');
    }

    if (!data.password) {
        errors.push('Password is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Project validation
export const validateProject = (data: {
    title: string;
    description: string;
    industry?: string;
    targetMarket?: string;
}): ValidationResult => {
    const errors: string[] = [];

    const titleResult = validateText(data.title, 'title', 3, 100);
    const descriptionResult = validateText(data.description, 'description', 10, 1000);

    errors.push(...titleResult.errors);
    errors.push(...descriptionResult.errors);

    if (data.industry && data.industry.length > 50) {
        errors.push('Industry must not exceed 50 characters');
    }

    if (data.targetMarket && data.targetMarket.length > 100) {
        errors.push('Target market must not exceed 100 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Scraping request validation
export const validateScrapeRequest = (data: {
    url: string;
    selector?: string;
    extractType?: string;
}): ValidationResult => {
    const errors: string[] = [];

    const urlResult = validateUrl(data.url);
    errors.push(...urlResult.errors);

    if (data.extractType) {
        const validTypes = ['text', 'html', 'data', 'all'];
        if (!validTypes.includes(data.extractType)) {
            errors.push('Invalid extract type');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Sanitize input data
export const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML/XML tags
        .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
        .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Validation middleware for Express routes
export const validationMiddleware = (
    validationFn: (data: any) => ValidationResult
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = validationFn(req.body);

            if (!result.isValid) {
                logger.warn('Validation failed:', {
                    path: req.path,
                    errors: result.errors,
                    body: req.body
                });

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: result.errors
                });
            }

            next();
        } catch (error) {
            logger.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal validation error'
            });
        }
    };
};

// Export all validation functions
export default {
    validateEmail,
    validatePassword,
    validateName,
    validateUrl,
    validateId,
    validateText,
    validateArray,
    validateUserRegistration,
    validateUserLogin,
    validateProject,
    validateScrapeRequest,
    sanitizeInput,
    validationMiddleware
};