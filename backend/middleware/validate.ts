import type { RequestHandler } from 'express';
import type { ZodError, ZodType } from 'zod';

function respondWithValidationError(res: Parameters<RequestHandler>[1], error: ZodError): void {
    res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
}

export function validateBody(schema: ZodType): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            respondWithValidationError(res, result.error);
            return;
        }
        req.body = result.data;
        next();
    };
}

export function validateParams(schema: ZodType): RequestHandler {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            respondWithValidationError(res, result.error);
            return;
        }
        next();
    };
}
