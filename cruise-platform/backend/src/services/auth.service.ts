import { User } from '../models/User';
import { sign } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { AuthResponse, RegisterUser, LoginUser } from '../types/auth.types';
import { environment } from '../config/environment';
import { query } from '../config/database';
import { logger } from '../utils/logger';

class AuthService {
    async register(input: RegisterUser): Promise<AuthResponse> {
        const hashedPassword = await hash(input.password, 10);

        // Insert user into database
        const result = await query(
            'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
            [input.name, input.email, hashedPassword]
        );

        const user = result.rows[0];
        const token = this.generateToken(user.id.toString());
        return {
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.username
            },
            token
        };
    }

    async login(input: LoginUser): Promise<AuthResponse> {
        // Find user by email
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [input.email]
        );

        if (result.rows.length === 0) {
            throw new Error('Invalid credentials');
        }

        const user = result.rows[0];

        if (!(await compare(input.password, user.password_hash))) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user.id.toString());
        return {
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.username
            },
            token
        };
    }

    async createUser(userData: { username?: string; email: string; password: string; firstName?: string; lastName?: string }) {
        const hashedPassword = await hash(userData.password, 10);

        // Use email as username if no username provided
        const username = userData.username || userData.email.split('@')[0];

        const result = await query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, username, first_name, last_name',
            [username, userData.email, hashedPassword, userData.firstName || '', userData.lastName || '']
        );

        return {
            id: result.rows[0].id,
            email: result.rows[0].email,
            username: result.rows[0].username,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name
        };
    }

    async findUserByEmail(email: string): Promise<any> {
        try {
            const result = await query(
                'SELECT id, email, password_hash, first_name, last_name, username FROM users WHERE email = $1 LIMIT 1',
                [email]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const user = result.rows[0];
            return {
                id: user.id,
                email: user.email,
                password: user.password_hash, // Map password_hash to password
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username
            };
        } catch (error) {
            logger.error('Database query error:', {
                text: 'SELECT id, email, password_hash, first_name, last_name, username FROM users WHERE email = $1 LIMIT 1',
                params: [email],
                error
            });
            logger.error('Error finding user by email:', error);
            throw error;
        }
    }

    private generateToken(userId: string): string {
        return sign({ id: userId }, environment.JWT_SECRET, { expiresIn: '24h' });
    }
}

export { AuthService };
export default new AuthService();