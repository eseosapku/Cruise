import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthenticatedRequest, JWTPayload } from '../utils/jwt';
import { logger } from '../utils/logger';
import { query } from '../config/database';

interface AuthRequest extends AuthenticatedRequest {
    user?: JWTPayload & {
        firstName: string;
        lastName: string;
        createdAt: string;
    };
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
            return;
        }

        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the token
        let decoded: JWTPayload;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Invalid or expired token.'
            });
            return;
        }

        // Fetch user data from database
        const result = await query(
            'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
            return;
        }

        const user = result.rows[0];

        // Attach user data to request
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            createdAt: user.created_at
        };

        logger.auth('User authenticated', user.id);
        next();

    } catch (error) {
        logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't require authentication
 */
export const optionalAuthMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyToken(token);

            const result = await query(
                'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
                [decoded.id]
            );

            if (result.rows.length > 0) {
                const user = result.rows[0];
                req.user = {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    createdAt: user.created_at
                };
            }
        } catch (error) {
            // Token is invalid, but that's okay for optional auth
            logger.debug('Optional auth failed:', error);
        }

        next();
    } catch (error) {
        logger.error('Optional authentication middleware error:', error);
        next(); // Continue even if there's an error
    }
};

/**
 * Admin-only middleware
 * Requires user to be authenticated and have admin role
 */
export const adminMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
            return;
        }

        // Check if user has admin role
        const result = await query(
            'SELECT role FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
            return;
        }

        logger.auth('Admin access granted', req.user.id);
        next();

    } catch (error) {
        logger.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authorization.'
        });
    }
};

/**
 * Rate limiting for authenticated users
 * Different limits for authenticated vs unauthenticated users
 */
export const authenticatedRateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each authenticated user to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthRequest) => {
        return req.user?.id || req.ip;
    },
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
};

/**
 * Middleware to check if user owns the resource
 * Requires the resource to have a user_id field
 */
export const resourceOwnerMiddleware = (resourceTable: string, idParam: string = 'id') => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
                return;
            }

            const resourceId = req.params[idParam];
            if (!resourceId) {
                res.status(400).json({
                    success: false,
                    message: 'Resource ID is required.'
                });
                return;
            }

            const result = await query(
                `SELECT user_id FROM ${resourceTable} WHERE id = $1`,
                [resourceId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found.'
                });
                return;
            }

            const resource = result.rows[0];
            if (resource.user_id !== req.user.id) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not own this resource.'
                });
                return;
            }

            next();
        } catch (error) {
            logger.error('Resource owner middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during authorization.'
            });
        }
    };
};

export { AuthRequest };