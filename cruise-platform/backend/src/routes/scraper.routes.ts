import { Router } from 'express';
import { scraperController } from '../controllers/scraper.controller';
import { validateScrapeRequest } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route for scraping data
router.post('/scrape', authMiddleware, validateScrapeRequest, scraperController.scrapeData.bind(scraperController));

// Route to get scraping results
router.get('/results', authMiddleware, scraperController.getScrapedResults.bind(scraperController));

export default router;