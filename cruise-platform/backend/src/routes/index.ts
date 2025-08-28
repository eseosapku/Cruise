import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import aiRoutes from './ai.routes';
import scraperRoutes from './scraper.routes';
import linkedinRoutes from './linkedin.routes';
import pitchdeckRoutes from './pitchdeck.routes';

const router = express.Router();

// Combine all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/scraper', scraperRoutes);
router.use('/linkedin', linkedinRoutes);
router.use('/pitchdeck', pitchdeckRoutes);

export default router;