const express = require('express');
const outreachController = require('./outreach.controller');
const authMiddleware = require('../../../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/find-cofounders', outreachController.findCoFounders);
router.post('/linkedin-message', outreachController.sendLinkedInMessage);
router.get('/campaign/:campaignId', outreachController.trackOutreachCampaign);
router.post('/generate-message', outreachController.generateOutreachMessage);

module.exports = router;
