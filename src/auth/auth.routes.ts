import express from 'express';
import { register, login, getMe, refresh, logout } from './auth.controller.js';
import authMiddleware from './auth.middleware.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', authMiddleware, getMe);

router.post('/refresh', refresh);

router.post('/logout', logout);

export default router;
