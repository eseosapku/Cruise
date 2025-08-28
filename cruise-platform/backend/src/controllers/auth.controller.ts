import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        logger.info('Registration attempt for email:', email);
        logger.info('Request body:', {
            email,
            hasPassword: !!password,
            hasFirstName: !!firstName,
            hasLastName: !!lastName
        });

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Check if user already exists
        const existingUser = await AuthService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const newUser = await AuthService.createUser({
            email,
            password: password, // Pass plain password, let service handle hashing
            firstName: firstName || '',
            lastName: lastName || ''
        });

        // Generate token for immediate login
        const token = generateToken({ id: newUser.id.toString(), email: newUser.email });

        logger.info('User registered successfully:', newUser.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            },
            token
        });
    } catch (error) {
        logger.error('Registration error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: errorMessage
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        logger.info('Login attempt for email:', email);

        const user = await AuthService.findUserByEmail(email);

        if (!user || !(await comparePassword(password, user.password))) {
            logger.warn('Failed login attempt for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken({ id: user.id.toString(), email: user.email });

        logger.info('User logged in successfully:', user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            token
        });
    } catch (error) {
        logger.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: errorMessage
        });
    }
};

export const testAuth = async (req: Request & { user?: any }, res: Response) => {
    try {
        // This route is protected by authMiddleware, so req.user should exist
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed'
            });
        }

        logger.info('Auth test successful for user:', user.id);

        res.status(200).json({
            success: true,
            message: 'Authentication successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        logger.error('Auth test error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Error testing authentication',
            error: errorMessage
        });
    }
};