import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password must be at most 64 characters long"),
})

export const loginSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters long").max(64, "Password must be at most 64 characters long")
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string("Refresh token is required").min(1, "Refresh token is required").max(512, "Refresh token must be at most 512 characters long")
})