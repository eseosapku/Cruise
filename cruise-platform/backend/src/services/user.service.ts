import { databaseService } from '../config/database';
import { logger } from '../utils/logger';
import { hashPassword } from '../utils/bcrypt';

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
}

export class UserService {
    async createUser(userData: CreateUserRequest) {
        try {
            const hashedPassword = await hashPassword(userData.password);

            const result = await databaseService.query(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id, username, email, first_name, last_name, created_at, updated_at`,
                [
                    userData.username,
                    userData.email,
                    hashedPassword,
                    userData.firstName || null,
                    userData.lastName || null
                ]
            );

            logger.info('User created successfully', { userId: result.rows[0].id });
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    async getUserById(userId: string) {
        try {
            const result = await databaseService.query(
                `SELECT id, username, email, first_name, last_name, created_at, updated_at
                 FROM users WHERE id = $1`,
                [userId]
            );

            if (result.rows.length === 0) {
                throw new Error('User not found');
            }

            return result.rows[0];
        } catch (error) {
            logger.error('Error getting user by ID:', error);
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            const result = await databaseService.query(
                `SELECT id, username, email, first_name, last_name, password_hash, created_at, updated_at
                 FROM users WHERE email = $1`,
                [email]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            logger.error('Error getting user by email:', error);
            throw error;
        }
    }

    async updateUser(userId: string, updateData: UpdateUserRequest) {
        try {
            const updates: string[] = [];
            const values: any[] = [];
            let valueIndex = 1;

            if (updateData.username) {
                updates.push(`username = $${valueIndex++}`);
                values.push(updateData.username);
            }
            if (updateData.email) {
                updates.push(`email = $${valueIndex++}`);
                values.push(updateData.email);
            }
            if (updateData.firstName !== undefined) {
                updates.push(`first_name = $${valueIndex++}`);
                values.push(updateData.firstName);
            }
            if (updateData.lastName !== undefined) {
                updates.push(`last_name = $${valueIndex++}`);
                values.push(updateData.lastName);
            }
            if (updateData.password) {
                const hashedPassword = await hashPassword(updateData.password);
                updates.push(`password_hash = $${valueIndex++}`);
                values.push(hashedPassword);
            }

            if (updates.length === 0) {
                throw new Error('No valid fields to update');
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(userId);

            const result = await databaseService.query(
                `UPDATE users SET ${updates.join(', ')} 
                 WHERE id = $${valueIndex}
                 RETURNING id, username, email, first_name, last_name, created_at, updated_at`,
                values
            );

            if (result.rows.length === 0) {
                throw new Error('User not found');
            }

            logger.info('User updated successfully', { userId });
            return result.rows[0];
        } catch (error) {
            logger.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(userId: string) {
        try {
            const result = await databaseService.query(
                'DELETE FROM users WHERE id = $1 RETURNING id',
                [userId]
            );

            if (result.rows.length === 0) {
                throw new Error('User not found');
            }

            logger.info('User deleted successfully', { userId });
            return { message: 'User deleted successfully' };
        } catch (error) {
            logger.error('Error deleting user:', error);
            throw error;
        }
    }

    async getAllUsers(limit: number = 10, offset: number = 0) {
        try {
            const result = await databaseService.query(
                `SELECT id, username, email, first_name, last_name, created_at, updated_at
                 FROM users 
                 ORDER BY created_at DESC
                 LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            return result.rows;
        } catch (error) {
            logger.error('Error getting all users:', error);
            throw error;
        }
    }
}

export const userService = new UserService();
