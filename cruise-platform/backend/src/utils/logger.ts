import { environment, isDevelopment } from '../config/environment';

// Simple logger implementation for the Cruise Platform
interface LogLevel {
    ERROR: 'error';
    WARN: 'warn';
    INFO: 'info';
    DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

const LOG_LEVEL_VALUES = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

class Logger {
    private level: string;

    constructor(level: string = 'info') {
        this.level = level;
    }

    private shouldLog(level: string): boolean {
        const currentLevelValue = LOG_LEVEL_VALUES[this.level as keyof typeof LOG_LEVEL_VALUES] || 2;
        const requestedLevelValue = LOG_LEVEL_VALUES[level as keyof typeof LOG_LEVEL_VALUES] || 2;
        return requestedLevelValue <= currentLevelValue;
    }

    private formatMessage(level: string, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
    }

    private log(level: string, message: string, meta?: any): void {
        if (!this.shouldLog(level)) return;

        const formattedMessage = this.formatMessage(level, message, meta);

        if (isDevelopment) {
            // In development, use console methods with colors
            switch (level) {
                case LOG_LEVELS.ERROR:
                    console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red
                    break;
                case LOG_LEVELS.WARN:
                    console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow
                    break;
                case LOG_LEVELS.INFO:
                    console.info('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan
                    break;
                case LOG_LEVELS.DEBUG:
                    console.debug('\x1b[37m%s\x1b[0m', formattedMessage); // White
                    break;
                default:
                    console.log(formattedMessage);
            }
        } else {
            // In production, use plain console.log for all levels
            console.log(formattedMessage);
        }
    }

    error(message: string, meta?: any): void {
        this.log(LOG_LEVELS.ERROR, message, meta);
    }

    warn(message: string, meta?: any): void {
        this.log(LOG_LEVELS.WARN, message, meta);
    }

    info(message: string, meta?: any): void {
        this.log(LOG_LEVELS.INFO, message, meta);
    }

    debug(message: string, meta?: any): void {
        this.log(LOG_LEVELS.DEBUG, message, meta);
    }

    // Helper methods for common logging scenarios
    http(method: string, url: string, statusCode: number, responseTime?: number): void {
        const message = `${method} ${url} ${statusCode}`;
        const meta = responseTime ? { responseTime: `${responseTime}ms` } : undefined;

        if (statusCode >= 400) {
            this.error(message, meta);
        } else {
            this.info(message, meta);
        }
    }

    database(operation: string, table: string, duration?: number): void {
        const message = `DB ${operation} on ${table}`;
        const meta = duration ? { duration: `${duration}ms` } : undefined;
        this.debug(message, meta);
    }

    auth(action: string, userId?: string): void {
        const message = `Auth: ${action}`;
        const meta = userId ? { userId } : undefined;
        this.info(message, meta);
    }

    api(endpoint: string, action: string, userId?: string): void {
        const message = `API ${endpoint}: ${action}`;
        const meta = userId ? { userId } : undefined;
        this.info(message, meta);
    }
}

// Create singleton instance
const logger = new Logger(environment.LOG_LEVEL);

export { logger };
export default logger;