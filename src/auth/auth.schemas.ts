import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password must be at most 64 characters long"),
})

export const loginSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password must be at most 64 characters long")
});

