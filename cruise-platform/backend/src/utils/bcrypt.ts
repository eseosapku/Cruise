import bcrypt from 'bcryptjs';
import { logger } from './logger';

class PasswordService {
    private saltRounds: number;

    constructor(saltRounds: number = 12) {
        this.saltRounds = saltRounds;
    }

    /**
     * Hash a password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        try {
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);
            logger.debug('Password hashed successfully');
            return hashedPassword;
        } catch (error) {
            logger.error('Error hashing password:', error);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Compare a plain password with a hashed password
     */
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(password, hashedPassword);
            logger.debug(`Password comparison result: ${isMatch ? 'match' : 'no match'}`);
            return isMatch;
        } catch (error) {
            logger.error('Error comparing passwords:', error);
            throw new Error('Failed to compare passwords');
        }
    }

    /**
     * Generate a salt
     */
    async generateSalt(): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return salt;
        } catch (error) {
            logger.error('Error generating salt:', error);
            throw new Error('Failed to generate salt');
        }
    }

    /**
     * Hash password with custom salt
     */
    async hashPasswordWithSalt(password: string, salt: string): Promise<string> {
        try {
            const hashedPassword = await bcrypt.hash(password, salt);
            logger.debug('Password hashed with custom salt');
            return hashedPassword;
        } catch (error) {
            logger.error('Error hashing password with salt:', error);
            throw new Error('Failed to hash password with salt');
        }
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
        score: number;
    } {
        const errors: string[] = [];
        let score = 0;

        // Check length
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        } else {
            score += 1;
        }

        // Check for uppercase letters
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        } else {
            score += 1;
        }

        // Check for lowercase letters
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        } else {
            score += 1;
        }

        // Check for numbers
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        } else {
            score += 1;
        }

        // Check for special characters
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        } else {
            score += 1;
        }

        // Check for common patterns
        const commonPatterns = [
            /(.)\1{2,}/, // Repeated characters
            /123456/, // Sequential numbers
            /abcdef/, // Sequential letters
            /qwerty/, // Common keyboard patterns
            /password/i, // Common words
        ];

        const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
        if (hasCommonPattern) {
            errors.push('Password contains common patterns that are easily guessable');
            score -= 1;
        }

        // Additional points for length
        if (password.length >= 12) {
            score += 1;
        }
        if (password.length >= 16) {
            score += 1;
        }

        return {
            isValid: errors.length === 0,
            errors,
            score: Math.max(0, Math.min(5, score)) // Score between 0-5
        };
    }

    /**
     * Generate a random password
     */
    generateRandomPassword(length: number = 16): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';

        // Ensure at least one character from each category
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

// Create singleton instance
const passwordService = new PasswordService();

// Export the service and convenience functions
export { passwordService };

// Backward compatibility exports
export const hashPassword = async (password: string): Promise<string> => {
    return passwordService.hashPassword(password);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return passwordService.comparePassword(password, hashedPassword);
};

export const validatePasswordStrength = (password: string) => {
    return passwordService.validatePasswordStrength(password);
};

export const generateRandomPassword = (length?: number): string => {
    return passwordService.generateRandomPassword(length);
};

export default passwordService;