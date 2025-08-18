const express = require('express');
const authRoutes = require('./auth/auth.routes');
const meetingsRoutes = require('./meetings/meetings.routes');
const researchRoutes = require('./research/research.routes');
const outreachRoutes = require('./outreach/outreach.routes');
const pitchDeckRoutes = require('./pitch-deck/pitchDeck.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/meetings', meetingsRoutes);
router.use('/research', researchRoutes);
router.use('/outreach', outreachRoutes);
router.use('/pitch-deck', pitchDeckRoutes);

module.exports = router;
