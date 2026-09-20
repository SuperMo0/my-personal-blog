import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors.ts';
import { verifayToken } from '../utils/jwt.ts';

export const requireAdmin: RequestHandler = (req, _res, next) => {
    if (req.user.role !== 'admin') {
        throw new ForbiddenError('This is a read-only demo account. Changes are not allowed.');
    }

    next();
};

export const authorizeAccess: RequestHandler = (req, _res, next) => {
    const authHeader = req.header('authorization');

    if (!authHeader) {
        throw new UnauthorizedError('Access denied. No token provided.');
    }

    const match = authHeader.match(/^Bearer ([^\s]+)$/);
    if (!match) {
        throw new ForbiddenError('Invalid or expired token');
    }

    try {
        req.user = verifayToken(match[1]);
    } catch (_error) {
        throw new ForbiddenError('Invalid or expired token');
    }

    next();
};
