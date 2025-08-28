import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';
import { logger } from './logger';

interface JWTPayload {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
}

interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}

class JWTService {
    private secret: Secret;
    private expiresIn: string;

    constructor() {
        if (!environment.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        if (!environment.JWT_EXPIRES_IN) {
            throw new Error('JWT_EXPIRES_IN environment variable is required');
        }
        this.secret = environment.JWT_SECRET;
        this.expiresIn = environment.JWT_EXPIRES_IN;
    }

    /**
     * Generate a JWT token for a user
     */
    generateToken(payload: { id: string; email: string }): string {
        try {
            // Use type assertion to handle the expiresIn type issue
            const token = jwt.sign(payload, this.secret, {
                expiresIn: this.expiresIn as any,
                issuer: 'cruise-platform',
                audience: 'cruise-users',
                subject: payload.id,
            });

            logger.auth('Token generated', payload.id);
            return token;
        } catch (error) {
            logger.error('Error generating JWT token:', error);
            throw new Error('Failed to generate authentication token');
        }
    }

    /**
     * Verify and decode a JWT token
     */
    verifyToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(token, this.secret, {
                issuer: 'cruise-platform',
                audience: 'cruise-users',
            }) as JWTPayload;

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                logger.warn('JWT token expired');
                throw new Error('Token expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                logger.warn('Invalid JWT token');
                throw new Error('Invalid token');
            } else {
                logger.error('JWT verification error:', error);
                throw new Error('Token verification failed');
            }
        }
    }

    /**
     * Generate a refresh token (longer expiration)
     */
    generateRefreshToken(payload: { id: string; email: string }): string {
        try {
            const token = jwt.sign(payload, this.secret, {
                expiresIn: '7d', // 7 days for refresh token
                issuer: 'cruise-platform',
                audience: 'cruise-users',
                subject: payload.id,
            });

            logger.auth('Refresh token generated', payload.id);
            return token;
        } catch (error) {
            logger.error('Error generating refresh token:', error);
            throw new Error('Failed to generate refresh token');
        }
    }

    /**
     * Decode token without verification (for inspection)
     */
    decodeToken(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch (error) {
            logger.error('Error decoding JWT token:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token: string): boolean {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return true;

            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    /**
     * Get time until token expires (in seconds)
     */
    getTokenTTL(token: string): number {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return 0;

            const currentTime = Math.floor(Date.now() / 1000);
            return Math.max(0, decoded.exp - currentTime);
        } catch (error) {
            return 0;
        }
    }
}

// Create singleton instance
const jwtService = new JWTService();

// Export convenience functions
export const generateToken = (payload: { id: string; email: string }): string => {
    return jwtService.generateToken(payload);
};

export const verifyToken = (token: string): JWTPayload => {
    return jwtService.verifyToken(token);
};

export const generateRefreshToken = (payload: { id: string; email: string }): string => {
    return jwtService.generateRefreshToken(payload);
};

export const decodeToken = (token: string): JWTPayload | null => {
    return jwtService.decodeToken(token);
};

export const isTokenExpired = (token: string): boolean => {
    return jwtService.isTokenExpired(token);
};

// Export types
export type { JWTPayload, AuthenticatedRequest };

export default jwtService;