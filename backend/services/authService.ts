import * as queries from '../db/admin-queries.ts';
import { ServiceUnavailableError, UnauthorizedError } from '../errors.ts';
import type { Role, SessionUser } from '../types.ts';
import { signToken } from '../utils/jwt.ts';
import { compare } from '../utils/password.ts';

const DEFAULT_DEMO_EMAIL = 'demo@my-personal-blog.local';
const LOGIN_ROLES: Role[] = ['admin', 'viewer'];

function toSessionUser(user: { id: number; name: string; email: string; role: string }): SessionUser {
    return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
}

export async function authenticateAdmin(email: string, password: string): Promise<string> {
    const user = await queries.getUserByEmail(email);

    if (!user || !LOGIN_ROLES.includes(user.role as Role) || !(await compare(password, user.password))) {
        throw new UnauthorizedError('Invalid email or password');
    }

    return signToken(toSessionUser(user));
}

export async function authenticateDemo(): Promise<string> {
    const demoEmail = process.env.DEMO_EMAIL || DEFAULT_DEMO_EMAIL;
    const user = await queries.getUserByEmail(demoEmail);

    if (user?.role !== 'viewer') {
        throw new ServiceUnavailableError('The read-only demo account is unavailable');
    }

    return signToken(toSessionUser(user));
}
