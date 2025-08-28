import { Request, Response } from 'express';
import ScraperService from '../services/scraper.service';

class ScraperController {
    public async scrapeData(req: Request, res: Response): Promise<void> {
        try {
            const { url } = req.body;
            if (!url) {
                res.status(400).json({ success: false, message: 'URL is required' });
                return;
            }
            const data = await ScraperService.scrape(url);
            res.status(200).json({ success: true, data });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }

    public async getScrapedResults(req: Request, res: Response): Promise<void> {
        try {
            const results = await ScraperService.getResults();
            res.status(200).json({ success: true, results });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ success: false, message: errorMessage });
        }
    }
}

export const scraperController = new ScraperController();