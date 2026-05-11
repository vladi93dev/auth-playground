import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const signJwt = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

export { signJwt };