// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
export const API_URL = API_BASE_URL; // For backward compatibility

// Request Configuration
export const MAX_RETRIES = 3;
export const TIMEOUT_DURATION = 5000; // in milliseconds

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error, please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'Requested resource not found.',
    SERVER_ERROR: 'An unexpected error occurred, please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logout successful!',
    DATA_SAVED: 'Data saved successfully!',
    PITCH_DECK_CREATED: 'Pitch deck created successfully!',
    SEARCH_COMPLETED: 'Search completed successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
};

// API Endpoints
export const ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
    },
    // User endpoints
    USERS: {
        BASE: '/users',
        PROFILE: '/users/profile',
        UPDATE: '/users/update',
    },
    // AI endpoints
    AI: {
        BASE: '/ai',
        RESPONSE: '/ai/response',
        CONTEXT: '/ai/context',
    },
    // Pitch Deck endpoints
    PITCH_DECK: {
        BASE: '/pitchdeck',
        GENERATE_AUTOMATED: '/pitchdeck/generate/automated',
        GENERATE_COMPLETE: '/pitchdeck/generate/complete',
        GENERATE_GENSPARK: '/pitchdeck/generate/genspark',
        GENERATE_IMAGES: '/pitchdeck/generate/images',
        GENERATE_SVG: '/pitchdeck/generate/svg',
    },
    // Scraper endpoints
    SCRAPER: {
        BASE: '/scraper',
        SCRAPE: '/scraper/scrape',
        RESULTS: '/scraper/results',
    },
    // LinkedIn endpoints (commented out as per backend)
    // LINKEDIN: {
    //     BASE: '/linkedin',
    //     CAMPAIGNS: '/linkedin/campaigns',
    //     TEMPLATES: '/linkedin/templates',
    // },
};