const express = require('express');
const pitchDeckController = require('./pitchDeck.controller');
const authMiddleware = require('../../../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/generate', pitchDeckController.generatePitchDeck);
router.put('/slide', pitchDeckController.updateSlide);
router.post('/data-points', pitchDeckController.addDataPoints);
router.get('/export/:deckId/:format', pitchDeckController.exportDeck);
router.get('/templates', pitchDeckController.getDeckTemplates);

module.exports = router;
