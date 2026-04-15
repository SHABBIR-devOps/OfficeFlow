import express from 'express';
import * as authController from '../controllers/authController.ts';

const router = express.Router();

// Middleware sorie deya hoyeche jate 'next is not a function' error na ashe
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login); 
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
import { authenticate } from '../middleware/auth.ts';
router.get('/me', authenticate, authController.getMe);

export default router;