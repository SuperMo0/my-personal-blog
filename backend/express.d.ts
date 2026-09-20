import type { Request } from 'express';
import type { SessionUser } from './types.ts';

declare global {
    namespace Express {
        interface Request {
            user: SessionUser;
        }
    }
}

export type IdRequest = Request<{ id: string }>;
