import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Environment {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL?: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  GEMINI_PROJECT_ID: string;
  GOOGLE_SEARCH_API_KEY: string;
  GOOGLE_SEARCH_ENGINE_ID: string;
  GOOGLE_SEARCH_ENDPOINT: string;
  PEXELS_API_KEY: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: string;
}

const getEnvVariable = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
};

const getEnvNumber = (name: string, defaultValue?: number): number => {
  const value = process.env[name];
  if (!value) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${name} is required but not set`);
    }
    return defaultValue;
  }
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return numValue;
};

export const environment: Environment = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 5000),
  DATABASE_URL: process.env.DATABASE_URL, // Optional Supabase connection string
  DB_HOST: getEnvVariable('DB_HOST', 'localhost'),
  DB_PORT: getEnvNumber('DB_PORT', 5432),
  DB_NAME: getEnvVariable('DB_NAME', 'cruise_platform'),
  DB_USER: getEnvVariable('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVariable('DB_PASSWORD', 'password'),
  JWT_SECRET: getEnvVariable('JWT_SECRET', 'your_jwt_secret_change_in_production'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '24h'),
  GEMINI_API_KEY: getEnvVariable('GEMINI_API_KEY', 'your_gemini_api_key'),
  GEMINI_MODEL: getEnvVariable('GEMINI_MODEL', 'gemini-1.5-pro'),
  GEMINI_PROJECT_ID: getEnvVariable('GEMINI_PROJECT_ID', 'your_project_id'),
  GOOGLE_SEARCH_API_KEY: getEnvVariable('GOOGLE_SEARCH_API_KEY', 'your_google_search_api_key'),
  GOOGLE_SEARCH_ENGINE_ID: getEnvVariable('GOOGLE_SEARCH_ENGINE_ID', 'your_search_engine_id'),
  GOOGLE_SEARCH_ENDPOINT: getEnvVariable('GOOGLE_SEARCH_ENDPOINT', 'https://www.googleapis.com/customsearch/v1'),
  PEXELS_API_KEY: getEnvVariable('PEXELS_API_KEY', 'your_pexels_api_key'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:3001'),
  RATE_LIMIT_WINDOW: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100), // 100 requests per window
  LOG_LEVEL: getEnvVariable('LOG_LEVEL', 'info')
};

export const isDevelopment = environment.NODE_ENV === 'development';
export const isProduction = environment.NODE_ENV === 'production';
export const isTest = environment.NODE_ENV === 'test';

// For backward compatibility
export default environment;