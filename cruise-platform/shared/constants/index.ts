export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const PAGE_SIZE = 10;

export const MAX_RETRY_ATTEMPTS = 3;

export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'];

export const ERROR_MESSAGES = {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    INTERNAL_SERVER_ERROR: 'An internal server error occurred',
};

export const SUCCESS_MESSAGES = {
    USER_CREATED: 'User successfully created',
    USER_UPDATED: 'User successfully updated',
    USER_DELETED: 'User successfully deleted',
};