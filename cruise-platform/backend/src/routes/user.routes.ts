import { Router } from 'express';
import { createUser, getUserById, getProfile, updateUser, deleteUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';

const router = Router();

// Get current user profile (protected route)
router.get('/profile', authMiddleware, getProfile);

// Create a new user
router.post('/', createUser);

// Get user by ID
router.get('/:id', authMiddleware, getUserById);

// Update user by ID
router.put('/:id', authMiddleware, updateUser);

// Delete user by ID
router.delete('/:id', authMiddleware, deleteUser);

export default router;