import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET } from '../config/env.js';

if(!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const signJwt = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
}

const hashRefreshToken = (refreshToken: string) => {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

const refreshTokenExpiry = () => {
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    return expiresAt;
};


export { signJwt, generateRefreshToken, hashRefreshToken, refreshTokenExpiry };