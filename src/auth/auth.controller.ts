import type { Request, Response } from 'express';
import { registerSchema } from './auth.schemas.js';
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
