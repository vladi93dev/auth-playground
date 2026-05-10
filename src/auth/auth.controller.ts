import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas.js';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';


export const register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    console.log(parsed);
    
    if(!parsed.success) {
        return res.status(400).json({ message: 'Invalid input' });
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
console.log(parsed);


// 2. Find user by email

// 3. If no user, return invalid credentials

// 4. Compare password with stored hash

// 5. If password invalid, return invalid credentials

// 6. Sign access token

// 7. Return token and safe user data
}