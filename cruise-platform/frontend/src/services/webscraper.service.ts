import apiService from './api.service';
import { ENDPOINTS, SUCCESS_MESSAGES } from '../utils/constants';

// Web Scraper interfaces
export interface ScrapeRequest {
    url: string;
    options?: {
        extractText?: boolean;
        extractImages?: boolean;
        extractLinks?: boolean;
        maxDepth?: number;
        timeout?: number;
    };
}

export interface ScrapeResult {
    url: string;
    title: string;
    content: string;
    images?: string[];
    links?: string[];
    metadata?: {
        description?: string;
        keywords?: string[];
        author?: string;
        publishDate?: string;
        wordCount?: number;
    };
    scrapedAt: string;
    success: boolean;
    error?: string;
}

export interface ScrapeResponse {
    results: ScrapeResult[];
    totalUrls: number;
    successCount: number;
    failureCount: number;
    processingTime: number;
}

export interface StoredScrapeResult {
    id: string;
    userId: string;
    results: ScrapeResult[];
    createdAt: string;
    query?: string;
}

class WebScraperService {

    /**
     * Scrape data from a single URL
     */
    async scrapeUrl(request: ScrapeRequest): Promise<ScrapeResult> {
        try {
            const response = await apiService.post<ScrapeResult>(
                ENDPOINTS.SCRAPER.SCRAPE,
                request
            );

            console.log(`Successfully scraped: ${request.url}`);
            return response;
        } catch (error) {
            console.error('Failed to scrape URL:', error);
            throw error;
        }
    }

    /**
     * Scrape data from multiple URLs
     */
    async scrapeMultipleUrls(urls: string[], options?: ScrapeRequest['options']): Promise<ScrapeResponse> {
        try {
            const requests = urls.map(url => ({ url, options }));
            const response = await apiService.post<ScrapeResponse>(
                ENDPOINTS.SCRAPER.SCRAPE,
                { urls: requests }
            );

            console.log(`Successfully scraped ${response.successCount}/${response.totalUrls} URLs`);
            return response;
        } catch (error) {
            console.error('Failed to scrape multiple URLs:', error);
            throw error;
        }
    }

    /**
     * Get stored scraping results
     */
    async getResults(): Promise<StoredScrapeResult[]> {
        try {
            const response = await apiService.get<StoredScrapeResult[]>(
                ENDPOINTS.SCRAPER.RESULTS
            );

            return response;
        } catch (error) {
            console.error('Failed to get scraping results:', error);
            throw error;
        }
    }

    /**
     * Get specific scraping result by ID
     */
    async getResultById(id: string): Promise<StoredScrapeResult> {
        try {
            const response = await apiService.get<StoredScrapeResult>(
                `${ENDPOINTS.SCRAPER.RESULTS}/${id}`
            );

            return response;
        } catch (error) {
            console.error('Failed to get scraping result:', error);
            throw error;
        }
    }

    /**
     * Delete scraping result
     */
    async deleteResult(id: string): Promise<void> {
        try {
            await apiService.delete(`${ENDPOINTS.SCRAPER.RESULTS}/${id}`);
            console.log('Scraping result deleted successfully');
        } catch (error) {
            console.error('Failed to delete scraping result:', error);
            throw error;
        }
    }

    /**
     * Validate URL before scraping
     */
    validateUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract domain from URL
     */
    extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (error) {
            return '';
        }
    }

    /**
     * Get scraping suggestions based on topic
     */
    async getSuggestions(topic: string): Promise<string[]> {
        try {
            // This could be enhanced to use AI or a suggestion API
            const commonSources = [
                `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
                `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/ /g, '_'))}`,
                `https://www.crunchbase.com/search/principal.companies/field/companies/query/${encodeURIComponent(topic)}`,
            ];

            return commonSources;
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            return [];
        }
    }

    /**
     * Analyze scraped content
     */
    async analyzeContent(content: string): Promise<{
        wordCount: number;
        sentiment: string;
        keywords: string[];
        summary: string;
    }> {
        try {
            // Basic analysis - could be enhanced with AI service
            const wordCount = content.split(/\s+/).length;
            const words = content.toLowerCase().match(/\b\w+\b/g) || [];
            const wordFreq: { [key: string]: number } = {};

            words.forEach(word => {
                if (word.length > 3) {
                    wordFreq[word] = (wordFreq[word] || 0) + 1;
                }
            });

            const keywords = Object.entries(wordFreq)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([word]) => word);

            const summary = content.substring(0, 200) + (content.length > 200 ? '...' : '');

            return {
                wordCount,
                sentiment: 'neutral', // Basic sentiment
                keywords,
                summary,
            };
        } catch (error) {
            console.error('Failed to analyze content:', error);
            throw error;
        }
    }
}

// Create singleton instance
const webScraperService = new WebScraperService();

export default webScraperService;
export { webScraperService };