import { Request, Response } from 'express';
import { userService, CreateUserRequest, UpdateUserRequest } from '../services/user.service';
import { validateUserRegistration, validateName } from '../utils/validation';
import { logger } from '../utils/logger';

export class UserController {
    public async getAllUsers(req: Request, res: Response): Promise<Response> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const users = await userService.getAllUsers(limit, offset);
            return res.status(200).json({
                success: true,
                data: users,
                pagination: { page, limit }
            });
        } catch (error) {
            logger.error('Error retrieving users:', error);
            return res.status(500).json({
                success: false,
                message: 'Error retrieving users',
                error: (error as Error).message
            });
        }
    }

    public async getUserById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const user = await userService.getUserById(id);
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            logger.error('Error retrieving user:', error);
            if ((error as Error).message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error retrieving user',
                error: (error as Error).message
            });
        }
    }

    public async createUser(req: Request, res: Response): Promise<Response> {
        const validation = validateUserRegistration(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        try {
            const userData: CreateUserRequest = req.body;
            const newUser = await userService.createUser(userData);
            return res.status(201).json({
                success: true,
                data: newUser,
                message: 'User created successfully'
            });
        } catch (error) {
            logger.error('Error creating user:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: (error as Error).message
            });
        }
    }

    public async updateUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const validation = validateName(req.body.name || req.body.username || '');
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        try {
            const updateData: UpdateUserRequest = req.body;
            const updatedUser = await userService.updateUser(id, updateData);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: 'User updated successfully'
            });
        } catch (error) {
            logger.error('Error updating user:', error);
            if ((error as Error).message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error updating user',
                error: (error as Error).message
            });
        }
    }

    public async getProfile(req: Request & { user?: any }, res: Response): Promise<Response> {
        try {
            // Get user from auth middleware
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const user = await userService.getUserById(userId);

            // Return user profile without sensitive data
            return res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: `${user.firstName} ${user.lastName}`.trim() || user.email.split('@')[0],
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            logger.error('Error retrieving user profile:', error);
            if ((error as Error).message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User profile not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error retrieving user profile',
                error: (error as Error).message
            });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await userService.deleteUser(id);
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            logger.error('Error deleting user:', error);
            if ((error as Error).message === 'User not found') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error deleting user',
                error: (error as Error).message
            });
        }
    }
}

// Create controller instance
const userController = new UserController();

// Export individual methods for use in routes
export const getAllUsers = userController.getAllUsers.bind(userController);
export const getUserById = userController.getUserById.bind(userController);
export const getProfile = userController.getProfile.bind(userController);
export const createUser = userController.createUser.bind(userController);
export const updateUser = userController.updateUser.bind(userController);
export const deleteUser = userController.deleteUser.bind(userController);