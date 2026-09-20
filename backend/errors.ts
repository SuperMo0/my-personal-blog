export class HttpError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'Bad request') {
        super(400, message);
        this.name = 'BadRequestError';
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'Access denied') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'Not found') {
        super(404, message);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends HttpError {
    constructor(message = 'Conflict') {
        super(409, message);
        this.name = 'ConflictError';
    }
}

export class ServiceUnavailableError extends HttpError {
    constructor(message = 'Service unavailable') {
        super(503, message);
        this.name = 'ServiceUnavailableError';
    }
}

const FOREIGN_KEY_VIOLATION = '23503';

export function isForeignKeyViolation(error: unknown): boolean {
    return (error as { code?: string })?.code === FOREIGN_KEY_VIOLATION;
}
