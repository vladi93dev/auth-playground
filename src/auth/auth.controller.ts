import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas.js';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import { signJwt } from './auth.utils.js';


export const register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    
    if(!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(', ') });
    }  
    
    const { email, password } = parsed.data;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if(userExists) {
        return res.status(400).json({ message: 'User already exists' });
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

    // 7. Return token and safe user data
    return res.status(200).json({
        status: 'success',
        data: {
            id: userFound.id,
            email: userFound.email
        },
        token
    });
}