import { compare } from './../utils/password.js'
import * as queries from './../db/admin-queries.js'
import * as jwt from './../utils/jwt.js'

function createSessionToken(user) {
    return jwt.signToken({
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
    });
}

export async function authenticateAdmin(req, res) {

    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    try {
        const user = await queries.getUserByEmail(req.body.email);

        if (!user || !['admin', 'viewer'].includes(user.role)
            || !(await compare(req.body.password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = createSessionToken(user);
        res.json({ token });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function authenticateDemo(req, res) {
    try {
        const user = process.env.DEMO_EMAIL
            ? await queries.getUserByEmail(process.env.DEMO_EMAIL)
            : null;

        if (!user || user.role !== 'viewer') {
            return res.status(503).json({ message: 'The read-only demo account is unavailable' });
        }

        return res.json({ token: createSessionToken(user) });
    } catch (error) {
        console.error('Demo login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'This is a read-only demo account. Changes are not allowed.',
        });
    }

    next();
}

export function authorizeAccess(req, res, next) {
    const authHeader = req.header('authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const match = authHeader.match(/^Bearer ([^\s]+)$/);
        if (!match) throw new Error('Format Error');

        const decoded = jwt.verifayToken(match[1]);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}
