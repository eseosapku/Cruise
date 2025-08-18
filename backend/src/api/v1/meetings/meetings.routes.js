const express = require('express');
const meetingsController = require('./meetings.controller');
const authMiddleware = require('../../../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', meetingsController.createMeeting);
router.get('/', meetingsController.getMeetings);
router.put('/:id', meetingsController.updateMeeting);
router.post('/:id/assist', meetingsController.assistMeeting);

module.exports = router;
