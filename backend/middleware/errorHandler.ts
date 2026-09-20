import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors.ts';

// Express only treats a 4-arg function as an error handler, so `next` must stay
// even though it's unused.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}
