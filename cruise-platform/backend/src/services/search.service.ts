import axios from 'axios';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
    relevanceScore: number;
    timestamp?: string;
}

interface SearchQuery {
    query: string;
    count?: number;
    market?: string;
    safeSearch?: 'Off' | 'Moderate' | 'Strict';
}

interface GoogleSearchResult {
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
    formattedUrl: string;
    htmlSnippet: string;
    htmlTitle: string;
    pagemap?: {
        cse_image?: Array<{ src: string }>;
        metatags?: Array<any>;
    };
}

interface GoogleSearchResponse {
    items: GoogleSearchResult[];
    searchInformation: {
        totalResults: string;
        searchTime: number;
    };
}

interface ImageSearchResult {
    title: string;
    url: string;
    thumbnailUrl: string;
    source: string;
    width: number;
    height: number;
    relevanceScore: number;
}

class SearchService {
    private readonly GOOGLE_SEARCH_API_KEY = environment.GOOGLE_SEARCH_API_KEY;
    private readonly GOOGLE_SEARCH_ENGINE_ID = environment.GOOGLE_SEARCH_ENGINE_ID;
    private readonly GOOGLE_SEARCH_ENDPOINT = environment.GOOGLE_SEARCH_ENDPOINT;

    /**
     * Search the web using Google Custom Search API
     */
    async searchWeb(searchQuery: SearchQuery): Promise<SearchResult[]> {
        try {
            if (!this.GOOGLE_SEARCH_API_KEY || !this.GOOGLE_SEARCH_ENGINE_ID) {
                logger.error('Google Search API credentials are not configured');
                return this.getMockSearchResults(searchQuery.query);
            }

            logger.info(`Searching web for: ${searchQuery.query}`);

            const response = await axios.get<GoogleSearchResponse>(this.GOOGLE_SEARCH_ENDPOINT, {
                params: {
                    key: this.GOOGLE_SEARCH_API_KEY,
                    cx: this.GOOGLE_SEARCH_ENGINE_ID,
                    q: searchQuery.query,
                    num: Math.min(searchQuery.count || 10, 10), // Google allows max 10 per request
                    safe: 'active',
                    lr: 'lang_en',
                    gl: 'us'
                }
            });

            const results = response.data.items?.map((item, index) => ({
                title: this.cleanHtml(item.title),
                url: item.link,
                snippet: this.cleanHtml(item.snippet),
                source: item.displayLink,
                relevanceScore: this.calculateRelevanceScore(item, searchQuery.query, index),
                timestamp: new Date().toISOString()
            })) || [];

            logger.info(`Found ${results.length} search results for query: ${searchQuery.query}`);
            return results;

        } catch (error: any) {
            logger.error('Google Search API error:', error.response?.data || error.message);
            // Return mock results as fallback
            return this.getMockSearchResults(searchQuery.query);
        }
    }

    /**
     * Search for images using Google Custom Search API
     */
    async searchImages(query: string, count: number = 10): Promise<ImageSearchResult[]> {
        try {
            if (!this.GOOGLE_SEARCH_API_KEY || !this.GOOGLE_SEARCH_ENGINE_ID) {
                logger.error('Google Search API credentials are not configured');
                return [];
            }

            logger.info(`Searching images for: ${query}`);

            const response = await axios.get<GoogleSearchResponse>(this.GOOGLE_SEARCH_ENDPOINT, {
                params: {
                    key: this.GOOGLE_SEARCH_API_KEY,
                    cx: this.GOOGLE_SEARCH_ENGINE_ID,
                    q: query,
                    num: Math.min(count, 10),
                    searchType: 'image',
                    safe: 'active',
                    imgSize: 'large',
                    imgType: 'photo',
                    lr: 'lang_en'
                }
            });

            const results = response.data.items?.map((item, index) => ({
                title: this.cleanHtml(item.title),
                url: item.link,
                thumbnailUrl: item.pagemap?.cse_image?.[0]?.src || item.link,
                source: item.displayLink,
                width: 800, // Default values since Google doesn't always provide dimensions
                height: 600,
                relevanceScore: this.calculateRelevanceScore(item, query, index)
            })) || [];

            logger.info(`Found ${results.length} image results for query: ${query}`);
            return results;

        } catch (error: any) {
            logger.error('Google Image Search API error:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Search for specific topics related to pitch deck creation
     */
    async searchForPitchDeckContent(topic: string, industry?: string): Promise<SearchResult[]> {
        const queries = this.generatePitchDeckQueries(topic, industry);
        const allResults: SearchResult[] = [];

        for (const query of queries) {
            try {
                const results = await this.searchWeb({ query, count: 5 });
                allResults.push(...results);
                
                // Add delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                logger.error(`Error searching for: ${query}`, error);
            }
        }

        // Remove duplicates and sort by relevance
        const uniqueResults = this.removeDuplicates(allResults);
        return this.rankResults(uniqueResults, topic);
    }

    /**
     * Generate search queries optimized for pitch deck content
     */
    private generatePitchDeckQueries(topic: string, industry?: string): string[] {
        const baseQueries = [
            `${topic} market size trends 2024`,
            `${topic} business model revenue streams`,
            `${topic} competitive analysis competitors`,
            `${topic} industry statistics data`,
            `${topic} growth opportunities market`,
            `${topic} customer segments target audience`,
            `${topic} technology trends innovation`,
            `${topic} investment funding statistics`
        ];

        if (industry) {
            baseQueries.push(
                `${industry} ${topic} market analysis`,
                `${industry} industry trends 2024`,
                `${topic} ${industry} startup opportunities`
            );
        }

        return baseQueries;
    }

    /**
     * Calculate relevance score based on multiple factors
     */
    private calculateRelevanceScore(result: GoogleSearchResult, query: string, position: number): number {
        let score = 100 - position; // Base score decreases with position

        // Boost for authoritative sources
        const authoritativeDomains = [
            'statista.com', 'mckinsey.com', 'pwc.com', 'deloitte.com',
            'bloomberg.com', 'reuters.com', 'techcrunch.com', 'forbes.com',
            'harvard.edu', 'mit.edu', 'stanford.edu', 'wikipedia.org'
        ];

        const domain = this.extractDomain(result.link);
        if (authoritativeDomains.some(auth => domain.includes(auth))) {
            score += 20;
        }

        // Boost for keyword match in title
        const queryTerms = query.toLowerCase().split(' ');
        const titleMatch = queryTerms.filter(term =>
            result.title.toLowerCase().includes(term)
        ).length / queryTerms.length;
        score += titleMatch * 15;

        // Boost for keyword match in snippet
        const snippetMatch = queryTerms.filter(term =>
            result.snippet.toLowerCase().includes(term)
        ).length / queryTerms.length;
        score += snippetMatch * 10;

        return Math.min(score, 100);
    }

    /**
     * Remove duplicate URLs and consolidate results
     */
    private removeDuplicates(results: SearchResult[]): SearchResult[] {
        const seen = new Set<string>();
        return results.filter(result => {
            const normalizedUrl = this.normalizeUrl(result.url);
            if (seen.has(normalizedUrl)) {
                return false;
            }
            seen.add(normalizedUrl);
            return true;
        });
    }

    /**
     * Rank and sort results by relevance
     */
    private rankResults(results: SearchResult[], topic: string): SearchResult[] {
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 15); // Return top 15 results
    }

    /**
     * Extract domain from URL
     */
    private extractDomain(url: string): string {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.hostname;
        } catch {
            return url;
        }
    }

    /**
     * Normalize URL for duplicate detection
     */
    private normalizeUrl(url: string): string {
        try {
            const parsedUrl = new URL(url);
            return `${parsedUrl.hostname}${parsedUrl.pathname}`;
        } catch {
            return url;
        }
    }

    /**
     * Clean HTML from text
     */
    private cleanHtml(text: string): string {
        return text.replace(/<[^>]*>/g, '').trim();
    }

    /**
     * Mock search results for development/testing
     */
    private getMockSearchResults(query: string): SearchResult[] {
        return [
            {
                title: `${query} - Market Analysis and Trends`,
                url: `https://example.com/market-analysis-${query.replace(/\s+/g, '-')}`,
                snippet: `Comprehensive analysis of ${query} market trends, growth opportunities, and industry insights for 2024.`,
                source: 'example.com',
                relevanceScore: 95,
                timestamp: new Date().toISOString()
            },
            {
                title: `${query} Industry Report 2024`,
                url: `https://research.com/industry-report-${query.replace(/\s+/g, '-')}`,
                snippet: `Latest industry report covering ${query} market size, competitive landscape, and future projections.`,
                source: 'research.com',
                relevanceScore: 90,
                timestamp: new Date().toISOString()
            },
            {
                title: `Startup Guide: Building a ${query} Business`,
                url: `https://startup.com/guide-${query.replace(/\s+/g, '-')}`,
                snippet: `Complete guide for entrepreneurs looking to start a ${query} business, including market opportunities and strategies.`,
                source: 'startup.com',
                relevanceScore: 85,
                timestamp: new Date().toISOString()
            }
        ];
    }
}

export { SearchService, SearchResult, SearchQuery, ImageSearchResult };
export default new SearchService();
