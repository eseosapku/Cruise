import { Router } from 'express';
import { register, login, testAuth } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route for user registration
router.post('/register', validateRegistration, register);

// Route for user login
router.post('/login', validateLogin, login);

// Test route to verify authentication
router.get('/test', authMiddleware, testAuth);

export default router;