import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class SimpleRateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;
  private message: string;

  constructor(windowMs: number, maxRequests: number, message?: string) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message || 'Too many requests, please try again later.';

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: Request): string {
    // Use user ID if authenticated, otherwise use IP
    const userId = (req as any).user?.id;
    return userId || req.ip || 'unknown';
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.getKey(req);
      const now = Date.now();

      // Initialize or reset if window expired
      if (!this.store[key] || this.store[key].resetTime < now) {
        this.store[key] = {
          count: 0,
          resetTime: now + this.windowMs
        };
      }

      // Increment request count
      this.store[key].count++;

      // Check if limit exceeded
      if (this.store[key].count > this.maxRequests) {
        const resetTime = new Date(this.store[key].resetTime);

        logger.warn('Rate limit exceeded', {
          key,
          count: this.store[key].count,
          limit: this.maxRequests,
          resetTime: resetTime.toISOString(),
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          success: false,
          message: this.message,
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000)
        });
        return;
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, this.maxRequests - this.store[key].count).toString(),
        'X-RateLimit-Reset': new Date(this.store[key].resetTime).toISOString()
      });

      next();
    };
  }
}

// Default rate limiter
const defaultLimiter = new SimpleRateLimiter(
  environment.RATE_LIMIT_WINDOW,
  environment.RATE_LIMIT_MAX,
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for auth endpoints
const authLimiter = new SimpleRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later.'
);

// API rate limiter for general API endpoints
const apiLimiter = new SimpleRateLimiter(
  60 * 1000, // 1 minute
  60, // 60 requests per minute
  'API rate limit exceeded, please slow down.'
);

// File upload rate limiter
const uploadLimiter = new SimpleRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Upload limit exceeded, please try again later.'
);

// Export middleware functions
export const rateLimit = defaultLimiter.middleware();
export const authRateLimit = authLimiter.middleware();
export const apiRateLimit = apiLimiter.middleware();
export const uploadRateLimit = uploadLimiter.middleware();

// For backward compatibility
export default rateLimit;