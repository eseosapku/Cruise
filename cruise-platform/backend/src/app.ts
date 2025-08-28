import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'body-parser';
import { connectToDatabase } from './config/database';
import corsOptions from './config/cors';
import routes from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { rateLimit } from './middleware/rateLimit.middleware';
import { logger } from './utils/logger';
import { environment, isDevelopment } from './config/environment';

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for development
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimit);

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(req.method, req.originalUrl, res.statusCode, duration);
    });

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Cruise Platform API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: environment.NODE_ENV
    });
});

// API routes
app.use('/api/v1', routes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const initializeDatabase = async (): Promise<void> => {
    try {
        await connectToDatabase();
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1);
    }
};

// Initialize database connection
initializeDatabase();

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error(`Unhandled Rejection - reason: ${reason}`, { promise });
    process.exit(1);
});

export default app;