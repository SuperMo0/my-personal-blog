import { type Options as RateLimitOptions, rateLimit } from 'express-rate-limit';

const TOO_MANY_REQUESTS_BODY = { message: 'Too many requests, please try again later.' };

export function createRateLimiter(overrides: Partial<RateLimitOptions> = {}) {
    return rateLimit({
        windowMs: 60 * 1000,
        limit: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: TOO_MANY_REQUESTS_BODY,
        ...overrides,
    });
}
