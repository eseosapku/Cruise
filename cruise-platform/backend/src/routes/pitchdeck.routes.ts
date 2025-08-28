import { Router } from 'express';
import { pitchDeckController } from '../controllers/pitchdeck.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Traditional pitch deck routes
router.post('/', authMiddleware, pitchDeckController.createPitchDeck);
router.get('/:id', authMiddleware, pitchDeckController.getPitchDeck);
router.put('/:id', authMiddleware, pitchDeckController.updatePitchDeck);
router.delete('/:id', authMiddleware, pitchDeckController.deletePitchDeck);

// Automated pitch deck generation routes
router.post('/generate/automated', authMiddleware, pitchDeckController.generateAutomatedPitchDeck);
router.post('/generate/complete', authMiddleware, pitchDeckController.createCompletePitchDeck);
router.post('/generate/genspark', authMiddleware, pitchDeckController.generateGensparkPitchDeck);
router.get('/research/insights', pitchDeckController.getResearchInsights); // Public endpoint for research insights

// Visual content generation routes
router.post('/generate/images', authMiddleware, pitchDeckController.generateSlideImages);
router.post('/generate/svg', authMiddleware, pitchDeckController.generateSVGVisuals);

export default router;