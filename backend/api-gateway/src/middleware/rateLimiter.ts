import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000, // Per 15 minutes (in seconds)
});

// Different rate limits for different endpoints
const strictRateLimiter = new RateLimiterMemory({
  points: 10, // Stricter limit for sensitive endpoints
  duration: 60, // Per minute
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Apply stricter rate limiting to auth endpoints
    const isAuthEndpoint = req.path.includes('/auth') || 
                          req.path.includes('/login') || 
                          req.path.includes('/register');
    
    const limiter = isAuthEndpoint ? strictRateLimiter : rateLimiter;
    
    // Use IP address as the key for rate limiting
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    await limiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: secs,
      timestamp: new Date().toISOString()
    });
  }
};

export { rateLimiterMiddleware as rateLimiter }; 