import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

function authMiddleware (req: Request, res: Response, next: NextFunction)  {
// Incoming request
// 1. Read Authorization header
    const authHeader = req.headers['authorization'];
    
    // 2. Check that it exists
    if(!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    // 3. Check that it starts with "Bearer "
    if(!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    // 4. Extract token
    const token = authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }
// 5. Verify token with JWT_SECRET
    try {
        const verified = jwt.verify(token, JWT_SECRET);

        if(typeof verified === 'string') {
            return res.status(401).json({ message: 'Invalid or expired token' }); 
        }

        req.user = {
            userId: verified.userId,
            role: verified.role
        }

        next();
    } catch(error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

function roleMiddleware(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user) {
            return res.status(401).json({error: 'User not authorized'});
        }

        if(!allowedRoles.includes(req.user.role)) {
           return res.status(403).json({ message: 'User not authorized' });
        } 

        next();
    }
}

export { authMiddleware, roleMiddleware };