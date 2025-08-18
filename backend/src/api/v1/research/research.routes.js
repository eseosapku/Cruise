const express = require('express');
const researchController = require('./research.controller');
const authMiddleware = require('../../../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/web-research', researchController.conductWebResearch);
router.post('/market-insights', researchController.getMarketInsights);
router.post('/idea-validation', researchController.generateIdeaValidation);
router.post('/competitor-analysis', researchController.getCompetitorAnalysis);

module.exports = router;
