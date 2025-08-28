import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { isDevelopment } from '../config/environment';

interface CustomError extends Error {
    status?: number;
    statusCode?: number;
    code?: string;
    details?: any;
}

/**
 * Central error handling middleware
 */
export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Default error values
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = err.details || null;

    // Handle specific error types
    switch (err.name) {
        case 'ValidationError':
            status = 400;
            message = 'Validation Error';
            details = err.details || err.message;
            break;

        case 'CastError':
            status = 400;
            message = 'Invalid ID format';
            break;

        case 'JsonWebTokenError':
            status = 401;
            message = 'Invalid token';
            break;

        case 'TokenExpiredError':
            status = 401;
            message = 'Token expired';
            break;

        case 'SequelizeUniqueConstraintError':
        case 'MongoError':
            if (err.code === '11000') {
                status = 409;
                message = 'Resource already exists';
            }
            break;

        case 'SequelizeForeignKeyConstraintError':
            status = 400;
            message = 'Invalid reference to related resource';
            break;

        case 'MulterError':
            status = 400;
            if (err.code === 'LIMIT_FILE_SIZE') {
                message = 'File too large';
            } else if (err.code === 'LIMIT_FILE_COUNT') {
                message = 'Too many files';
            } else {
                message = 'File upload error';
            }
            break;
    }

    // Handle PostgreSQL errors
    if (err.code && typeof err.code === 'string') {
        switch (err.code) {
            case '23505': // Unique violation
                status = 409;
                message = 'Resource already exists';
                break;
            case '23503': // Foreign key violation
                status = 400;
                message = 'Invalid reference to related resource';
                break;
            case '23502': // Not null violation
                status = 400;
                message = 'Required field missing';
                break;
            case '22001': // String data too long
                status = 400;
                message = 'Data too long for field';
                break;
            case '22003': // Numeric value out of range
                status = 400;
                message = 'Numeric value out of range';
                break;
        }
    }

    // Log error details
    const errorInfo = {
        message: err.message,
        stack: err.stack,
        status,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
        logger.error('Server Error:', errorInfo);
    } else if (status >= 400) {
        logger.warn('Client Error:', errorInfo);
    }

    // Prepare response
    const errorResponse: any = {
        success: false,
        error: {
            status,
            message,
        },
    };

    // Include additional details in development
    if (isDevelopment) {
        errorResponse.error.stack = err.stack;
        errorResponse.error.details = details;
        errorResponse.error.originalError = err.name;
    }

    // Include request ID if available
    if (req.headers['x-request-id']) {
        errorResponse.error.requestId = req.headers['x-request-id'];
    }

    res.status(status).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`) as CustomError;
    error.status = 404;
    next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Create custom error classes
 */
export class AppError extends Error {
    public status: number;
    public isOperational: boolean;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    public details: any;

    constructor(message: string, details?: any) {
        super(message, 400);
        this.name = 'ValidationError';
        this.details = details;
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 429);
        this.name = 'RateLimitError';
    }
}

// Export default error handler for backward compatibility
export default errorHandler;