import type { Request, Response } from 'express';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schemas.js';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import { 
    signJwt, 
    generateRefreshToken, 
    hashRefreshToken, 
    refreshTokenExpiry 
} from './auth.utils.js';


export const register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    
    if(!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(', ') });
    }  
    
    const { email, password } = parsed.data;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if(userExists) {
        return res.status(409).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true
        }
    });

    return res.status(201).json({ message: 'User registered successfully', user: user});
}


export const login = async (req: Request, res: Response) => {
    // 1. Validate request body
    const parsed = loginSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    // 2. Find user by email
    const { email, password } = parsed.data;

    const userFound = await prisma.user.findUnique({ where: { email }});
    // 3. If no user, return invalid credentials
    if(!userFound) {
        return res.status(401).json({ message: 'Invalid email and/or password' });
    }
    // 4. Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, userFound.password);

    // 5. If password invalid, return invalid credentials
    if(!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email and/or password' });
    }

    // 6. Sign access token
    const token = signJwt(userFound.id, userFound.role)

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = refreshTokenExpiry();
    
    await prisma.refreshToken.create({
        data: {
            tokenHash: refreshTokenHash,
            userId: userFound.id,
            expiresAt: expiresAt
        }
    })

    // 7. Return token and safe user data
    return res.status(200).json({
        status: 'success',
        data: {
            id: userFound.id,
            email: userFound.email
        },
        accessToken: token,
        refreshToken: refreshToken
    });
}

export const getMe = async (req: Request, res: Response) => {
    // 1. Check req.user exists
    if(!req.user) {
        return res.status(401).json({ message: 'Unauthorized user'});
    }

    // 2. Use req.user.userId
    const userId = req.user.userId;

    // 3. Fetch user from DB
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true
        }
    });
    

    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // 4. Return safe user data
    return res.status(200).json({ status: 'success', data: user});
}

export const refresh = async(req: Request, res: Response) => {
    // receive refreshToken
    const parsed = refreshTokenSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(', ') });
    }

    const { refreshToken } = parsed.data;
    // hash it
    const refreshTokenHash = hashRefreshToken(refreshToken);
    // find tokenHash in DB
    const refreshTokenFound = await prisma.refreshToken.findUnique({ where: {tokenHash: refreshTokenHash }});
    // check not expired
    if(!refreshTokenFound || refreshTokenFound.expiresAt < new Date()) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
    // check not revoked
    if(refreshTokenFound.revokedAt) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    
    // issue new accessToken
    const foundUser = await prisma.user.findUnique(
        { 
            where: { id: refreshTokenFound.userId },
            select: {
                id: true,
                role: true
            }
        }
    );
    
    if(!foundUser) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const expiresAt = refreshTokenExpiry();
    
    try {
        await prisma.$transaction(async(tx) => {
            const revoked = await tx.refreshToken.updateMany({
                where: { id: refreshTokenFound.id, revokedAt: null },
                data: { revokedAt: new Date() }
            });

            if(revoked.count !== 1) {
                throw new Error('Invalid refresh token');
            }

            await tx.refreshToken.create({
                data: {
                    tokenHash: newRefreshTokenHash,
                    userId: foundUser.id,
                    expiresAt: expiresAt
                }
            })
        })

        const newAccessToken = signJwt(foundUser.id, foundUser.role);

        return res.status(200).json({
            status: 'success',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    } catch(error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
}

export const logout = async(req: Request, res: Response) => {
    const parsed = refreshTokenSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(', ') });
    }

    const { refreshToken } = parsed.data;
    const refreshTokenHash = hashRefreshToken(refreshToken);
    
    const refreshTokenFound = await prisma.refreshToken.findUnique({ where: { tokenHash: refreshTokenHash }});
    
    if(!refreshTokenFound || refreshTokenFound.expiresAt < new Date() || refreshTokenFound.revokedAt) {
        return res.status(401).json({ message: 'Invalid refresh token'})
    }
    
    const revoked = await prisma.refreshToken.updateMany({
        where: { id: refreshTokenFound.id, revokedAt: null},
        data: { revokedAt: new Date()}
    });

    if(revoked.count !== 1) {
        return res.status(401).json({ message: 'Invalid or expired refresh token'});
    }

    return res.status(200).json({ message: 'Logged out successfully'});
}