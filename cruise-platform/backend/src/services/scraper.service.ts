import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';

interface ScrapedContent {
    url: string;
    title: string;
    content: string;
    keyPoints: string[];
    statistics: string[];
    facts: string[];
    headings: string[];
    images: Array<{ src: string; alt: string }>;
    links: Array<{ text: string; href: string }>;
    metadata: {
        author?: string;
        publishDate?: string;
        source: string;
        wordCount: number;
        readingTime: number;
    };
}

interface ContentChunk {
    text: string;
    type: 'paragraph' | 'heading' | 'list' | 'quote' | 'statistic';
    importance: number;
}

class ScraperService {
    private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    private readonly REQUEST_TIMEOUT = 15000;

    /**
     * Scrape and parse a single URL with advanced content extraction
     */
    async scrapeUrl(url: string): Promise<ScrapedContent> {
        try {
            logger.info(`Scraping URL: ${url}`);

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
                timeout: this.REQUEST_TIMEOUT,
                maxRedirects: 5
            });

            const $ = cheerio.load(response.data);

            // Remove unwanted elements
            this.removeUnwantedElements($);

            const title = this.extractTitle($);
            const content = this.extractMainContent($);
            const keyPoints = this.extractKeyPoints($);
            const statistics = this.extractStatistics($);
            const facts = this.extractFacts($);
            const headings = this.extractHeadings($);
            const images = this.extractImages($, url);
            const links = this.extractLinks($, url);
            const metadata = this.extractMetadata($, url, content);

            return {
                url,
                title,
                content,
                keyPoints,
                statistics,
                facts,
                headings,
                images,
                links,
                metadata
            };

        } catch (error) {
            logger.error(`Error scraping ${url}:`, error);
            throw new Error(`Failed to scrape content from ${url}`);
        }
    }

    /**
     * Scrape multiple URLs and return combined insights
     */
    async scrapeMultipleUrls(urls: string[]): Promise<ScrapedContent[]> {
        const results: ScrapedContent[] = [];

        // Process URLs in chunks to avoid overwhelming the target servers
        const chunkSize = 3;
        for (let i = 0; i < urls.length; i += chunkSize) {
            const chunk = urls.slice(i, i + chunkSize);

            const chunkPromises = chunk.map(async (url) => {
                try {
                    await this.delay(Math.random() * 2000 + 1000); // Random delay 1-3 seconds
                    return await this.scrapeUrl(url);
                } catch (error) {
                    logger.error(`Failed to scrape ${url}:`, error);
                    return null;
                }
            });

            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults.filter(result => result !== null) as ScrapedContent[]);
        }

        return results;
    }

    /**
     * Extract and analyze content for pitch deck generation
     */
    async extractPitchDeckInsights(scrapedContents: ScrapedContent[]): Promise<{
        marketInsights: string[];
        competitiveAnalysis: string[];
        industryTrends: string[];
        statistics: string[];
        opportunities: string[];
        challenges: string[];
    }> {
        const allContent = scrapedContents.map(sc => sc.content).join('\n');
        const allKeyPoints = scrapedContents.flatMap(sc => sc.keyPoints);
        const allStatistics = scrapedContents.flatMap(sc => sc.statistics);

        return {
            marketInsights: this.categorizeContent(allKeyPoints, ['market', 'size', 'growth', 'revenue', 'demand']),
            competitiveAnalysis: this.categorizeContent(allKeyPoints, ['competitor', 'competition', 'market share', 'leader', 'alternative']),
            industryTrends: this.categorizeContent(allKeyPoints, ['trend', 'future', 'emerging', 'innovation', 'technology']),
            statistics: allStatistics,
            opportunities: this.categorizeContent(allKeyPoints, ['opportunity', 'potential', 'gap', 'underserved', 'growing']),
            challenges: this.categorizeContent(allKeyPoints, ['challenge', 'problem', 'barrier', 'risk', 'threat'])
        };
    }

    /**
     * Remove unwanted HTML elements that don't contain useful content
     */
    private removeUnwantedElements($: cheerio.Root): void {
        const unwantedSelectors = [
            'script', 'style', 'nav', 'header', 'footer',
            '.advertisement', '.ad', '.sidebar', '.comments',
            '.social-share', '.newsletter', '.popup',
            '[class*="cookie"]', '[class*="banner"]',
            '.related-articles', '.recommended'
        ];

        unwantedSelectors.forEach(selector => {
            $(selector).remove();
        });
    }

    /**
     * Extract the main title of the page
     */
    private extractTitle($: cheerio.Root): string {
        return $('title').text().trim() ||
            $('h1').first().text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            'Untitled';
    }

    /**
     * Extract main content from the page
     */
    private extractMainContent($: cheerio.Root): string {
        // Try to find main content containers
        const contentSelectors = [
            'article', 'main', '.content', '.post-content',
            '.entry-content', '.article-body', '[role="main"]'
        ];

        for (const selector of contentSelectors) {
            const content = $(selector).first();
            if (content.length > 0) {
                return content.text().trim();
            }
        }

        // Fallback: extract from paragraphs
        return $('p').map((i, el) => $(el).text().trim()).get().join('\n');
    }

    /**
     * Extract key points from the content
     */
    private extractKeyPoints($: cheerio.Root): string[] {
        const keyPoints: string[] = [];

        // Extract from lists
        $('ul li, ol li').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 20 && text.length < 200) {
                keyPoints.push(text);
            }
        });

        // Extract from highlighted text
        $('strong, b, em, i').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 10 && text.length < 150) {
                keyPoints.push(text);
            }
        });

        // Extract sentences that look like key points
        const paragraphs = $('p').map((i, el) => $(el).text()).get();
        paragraphs.forEach(para => {
            const sentences = para.split(/[.!?]+/);
            sentences.forEach((sentence: string) => {
                const trimmed = sentence.trim();
                if (this.isKeyPoint(trimmed)) {
                    keyPoints.push(trimmed);
                }
            });
        });

        return [...new Set(keyPoints)].slice(0, 20); // Remove duplicates and limit
    }

    /**
     * Extract statistics and numerical data
     */
    private extractStatistics($: cheerio.Root): string[] {
        const statistics: string[] = [];
        const text = $('body').text();

        // Patterns for common statistics
        const patterns = [
            /\$[\d,.]+ (?:billion|million|thousand)/gi,
            /\d+(?:\.\d+)?% (?:increase|decrease|growth|of)/gi,
            /\d+(?:,\d{3})* (?:users|customers|companies|people)/gi,
            /market size of \$[\d,.]+/gi,
            /revenue of \$[\d,.]+/gi,
            /\d+(?:\.\d+)?x (?:growth|increase)/gi
        ];

        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                statistics.push(...matches);
            }
        });

        return [...new Set(statistics)].slice(0, 10);
    }

    /**
     * Extract factual statements
     */
    private extractFacts($: cheerio.Root): string[] {
        const facts: string[] = [];

        // Look for sentences with factual indicators
        const factIndicators = [
            'according to', 'research shows', 'studies indicate',
            'data reveals', 'statistics show', 'report found'
        ];

        $('p').each((i, el) => {
            const text = $(el).text();
            const sentences = text.split(/[.!?]+/);

            sentences.forEach(sentence => {
                const lower = sentence.toLowerCase();
                if (factIndicators.some(indicator => lower.includes(indicator))) {
                    const trimmed = sentence.trim();
                    if (trimmed.length > 30 && trimmed.length < 300) {
                        facts.push(trimmed);
                    }
                }
            });
        });

        return facts.slice(0, 10);
    }

    /**
     * Extract headings for structure understanding
     */
    private extractHeadings($: cheerio.Root): string[] {
        return $('h1, h2, h3, h4, h5, h6')
            .map((i, el) => $(el).text().trim())
            .get()
            .filter(text => text.length > 3 && text.length < 100)
            .slice(0, 15);
    }

    /**
     * Extract relevant images
     */
    private extractImages($: cheerio.Root, baseUrl: string): Array<{ src: string; alt: string }> {
        const images: Array<{ src: string; alt: string }> = [];

        $('img').each((i, el) => {
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || '';

            if (src && !src.includes('logo') && !src.includes('icon')) {
                const absoluteUrl = this.resolveUrl(src, baseUrl);
                images.push({ src: absoluteUrl, alt });
            }
        });

        return images.slice(0, 5);
    }

    /**
     * Extract relevant links
     */
    private extractLinks($: cheerio.Root, baseUrl: string): Array<{ text: string; href: string }> {
        const links: Array<{ text: string; href: string }> = [];

        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();

            if (href && text && text.length > 5 && text.length < 100) {
                const absoluteUrl = this.resolveUrl(href, baseUrl);
                if (absoluteUrl.startsWith('http')) {
                    links.push({ text, href: absoluteUrl });
                }
            }
        });

        return links.slice(0, 10);
    }

    /**
     * Extract metadata about the content
     */
    private extractMetadata($: cheerio.Root, url: string, content: string): ScrapedContent['metadata'] {
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average 200 words per minute

        return {
            author: $('meta[name="author"]').attr('content') ||
                $('.author').first().text().trim() || undefined,
            publishDate: $('meta[property="article:published_time"]').attr('content') ||
                $('time').first().attr('datetime') || undefined,
            source: new URL(url).hostname.replace('www.', ''),
            wordCount,
            readingTime
        };
    }

    /**
     * Check if a sentence looks like a key point
     */
    private isKeyPoint(sentence: string): boolean {
        if (sentence.length < 15 || sentence.length > 200) return false;

        const keyPointIndicators = [
            'key', 'important', 'significant', 'major', 'primary',
            'essential', 'crucial', 'critical', 'main', 'top'
        ];

        const lowerSentence = sentence.toLowerCase();
        return keyPointIndicators.some(indicator => lowerSentence.includes(indicator)) ||
            sentence.includes(':') || // Often introduces key points
            /^\d+\./.test(sentence.trim()); // Numbered points
    }

    /**
     * Categorize content based on keywords
     */
    private categorizeContent(content: string[], keywords: string[]): string[] {
        return content.filter(item => {
            const lowerItem = item.toLowerCase();
            return keywords.some(keyword => lowerItem.includes(keyword.toLowerCase()));
        });
    }

    /**
     * Resolve relative URLs to absolute URLs
     */
    private resolveUrl(url: string, baseUrl: string): string {
        try {
            if (url.startsWith('http')) return url;
            return new URL(url, baseUrl).href;
        } catch {
            return url;
        }
    }

    /**
     * Add delay between requests
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Legacy methods for backward compatibility
    async scrapeData(url: string): Promise<any> {
        const content = await this.scrapeUrl(url);
        return {
            title: content.title,
            content: content.content,
            keyPoints: content.keyPoints,
            statistics: content.statistics
        };
    }

    async scrape(url: string): Promise<any> {
        return this.scrapeData(url);
    }

    async getResults(): Promise<any[]> {
        // This would typically fetch from a database or cache
        return [];
    }

    private extractData($: cheerio.Root): any {
        // Legacy method - kept for compatibility
        const extractedData = {
            title: $('title').text() || '',
            headings: $('h1, h2, h3').map((i, el) => $(el).text()).get(),
            paragraphs: $('p').map((i, el) => $(el).text()).get().slice(0, 5),
            links: $('a[href]').map((i, el) => ({
                text: $(el).text(),
                href: $(el).attr('href')
            })).get().slice(0, 10),
            images: $('img[src]').map((i, el) => ({
                alt: $(el).attr('alt') || '',
                src: $(el).attr('src')
            })).get().slice(0, 5)
        };
        return extractedData;
    }
}

export { ScraperService, ScrapedContent, ContentChunk };
export default new ScraperService();