import express from 'express';
import { register, login, getMe } from './auth.controller.js';
import authMiddleware from './auth.middleware.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', authMiddleware, getMe);

export default router;
