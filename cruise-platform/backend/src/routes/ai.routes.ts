import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route to get AI response based on user input
router.post('/response', authMiddleware, aiController.generateResponse.bind(aiController));

// Route to get AI context for a specific conversation
router.post('/context', authMiddleware, aiController.generateWithContext.bind(aiController));

export default router;