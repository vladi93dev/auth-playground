import express from 'express';
import { register, login, getMe, refresh, logout, admin } from './auth.controller.js';
import { authMiddleware, roleMiddleware } from './auth.middleware.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', authMiddleware, getMe);

router.post('/refresh', refresh);

router.post('/logout', logout);

router.get('/admin', authMiddleware, roleMiddleware(['ADMIN']), admin);

export default router;
