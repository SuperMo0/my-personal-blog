import jwt from 'jsonwebtoken';
import type { SessionUser } from '../types.ts';
import { requireEnv } from './env.ts';

export function signToken(user: SessionUser): string {
    return jwt.sign(user, requireEnv('SECRET'), { algorithm: 'HS256', expiresIn: '7d' });
}

export function verifayToken(token: string): SessionUser {
    return jwt.verify(token, requireEnv('SECRET'), { algorithms: ['HS256'] }) as SessionUser;
}
