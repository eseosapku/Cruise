import app from './app';
import { environment } from './config/environment';
import { logger } from './utils/logger';

const PORT = environment.PORT;

// Start the server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Cruise Platform API Server is running on port ${PORT}`);
    logger.info(`📊 Environment: ${environment.NODE_ENV}`);
    logger.info(`🌐 CORS Origin: ${environment.CORS_ORIGIN}`);

    if (environment.NODE_ENV === 'development') {
        logger.info(`📍 API Base URL: http://localhost:${PORT}/api/v1`);
        logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
    }
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

// Handle server listening
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
    logger.info(`Server listening on ${bind}`);
});

export default server;