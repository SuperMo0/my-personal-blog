import jwt from 'jsonwebtoken';

export function signToken(token) {
    return jwt.sign(token, process.env.SECRET, { algorithm: 'HS256', expiresIn: '7d' });
}

export function verifayToken(token) {
    return jwt.verify(token, process.env.SECRET, { algorithms: 'HS256' });
}
