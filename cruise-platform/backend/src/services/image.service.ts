import axios from 'axios';
import AIService from './ai.service';
import SearchService from './search.service';
import { logger } from '../utils/logger';
import { environment } from '../config/environment';

interface ImageSearchResult {
    url: string;
    thumbnailUrl: string;
    title: string;
    source: string;
    license: 'public-domain' | 'creative-commons' | 'commercial' | 'unknown';
    dimensions: {
        width: number;
        height: number;
    };
    format: string;
    size: number;
}

interface GeneratedImage {
    url: string;
    prompt: string;
    style: string;
    dimensions: {
        width: number;
        height: number;
    };
    format: 'png' | 'jpg' | 'webp';
    generatedAt: Date;
}

interface SlideImageRequirement {
    slideType: string;
    contentTheme: string;
    preferredStyle: 'professional' | 'modern' | 'minimal' | 'corporate' | 'creative';
    imageType: 'hero' | 'background' | 'illustration' | 'chart' | 'icon' | 'photo';
    keywords: string[];
    colorScheme?: string[];
}

class ImageService {
    private readonly PEXELS_API_URL = 'https://api.pexels.com/v1/search';
    private readonly PEXELS_API_KEY = environment.PEXELS_API_KEY;

    /**
     * Search for images using Google Images and Pexels
     */
    async searchImages(query: string, count: number = 10): Promise<ImageSearchResult[]> {
        const results: ImageSearchResult[] = [];

        try {
            // Try Google Image Search first
            const googleResults = await this.searchGoogleImages(query, Math.ceil(count / 2));
            results.push(...googleResults);

            // Try Pexels for high-quality photos
            if (this.PEXELS_API_KEY && results.length < count) {
                const pexelsResults = await this.searchPexelsImages(query, count - results.length);
                results.push(...pexelsResults);
            }

            // If no results, return mock data
            if (results.length === 0) {
                return this.getMockImageResults(query, count);
            }

            return results.slice(0, count);

        } catch (error) {
            logger.error('Image search error:', error);
            return this.getMockImageResults(query, count);
        }
    }

    /**
     * Generate AI images for specific content
     */
    async generateAIImage(prompt: string, style: string = 'professional'): Promise<GeneratedImage> {
        try {
            // Enhanced prompt for better results
            const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed, business presentation suitable`;

            // Note: This is a placeholder for AI image generation
            // You would integrate with DALL-E, Midjourney, or Stable Diffusion here
            logger.info(`AI Image generation requested: ${enhancedPrompt}`);

            // Mock generated image for now
            return {
                url: `https://via.placeholder.com/800x600/0066cc/ffffff?text=${encodeURIComponent(prompt)}`,
                prompt: enhancedPrompt,
                style,
                dimensions: { width: 800, height: 600 },
                format: 'png',
                generatedAt: new Date()
            };

        } catch (error) {
            logger.error('AI image generation error:', error);
            throw new Error('Failed to generate AI image');
        }
    }

    /**
     * Generate images specifically for slide content
     */
    async generateSlideImages(requirement: SlideImageRequirement): Promise<{
        searchedImages: ImageSearchResult[];
        generatedImages: GeneratedImage[];
        recommendations: string[];
    }> {
        const searchedImages: ImageSearchResult[] = [];
        const generatedImages: GeneratedImage[] = [];

        try {
            // Search for relevant images based on slide content
            for (const keyword of requirement.keywords.slice(0, 3)) { // Limit to 3 keywords
                const images = await this.searchImages(keyword, 2);
                searchedImages.push(...images);
            }

            // Generate AI images if specific requirements
            if (requirement.imageType === 'illustration' || requirement.imageType === 'icon') {
                for (const keyword of requirement.keywords.slice(0, 2)) {
                    try {
                        const generatedImage = await this.generateAIImage(
                            `${keyword} ${requirement.contentTheme}`,
                            requirement.preferredStyle
                        );
                        generatedImages.push(generatedImage);
                    } catch (error) {
                        logger.warn(`Failed to generate image for keyword: ${keyword}`);
                    }
                }
            }

        } catch (error) {
            logger.error('Error generating slide images:', error);
        }

        const recommendations = this.generateImageRecommendations(requirement, searchedImages, generatedImages);

        return {
            searchedImages,
            generatedImages,
            recommendations
        };
    }

    /**
     * Search Google Images using Custom Search API
     */
    private async searchGoogleImages(query: string, count: number): Promise<ImageSearchResult[]> {
        try {
            const googleResults = await SearchService.searchImages(query, count);

            return googleResults.map(img => ({
                url: img.url,
                thumbnailUrl: img.thumbnailUrl,
                title: img.title,
                source: img.source,
                license: 'unknown' as const,
                dimensions: {
                    width: img.width,
                    height: img.height
                },
                format: this.extractFormat(img.url),
                size: 0 // Google doesn't provide file size
            }));
        } catch (error) {
            logger.error('Error searching Google Images:', error);
            return [];
        }
    }

    /**
     * Search Pexels Images
     */
    private async searchPexelsImages(query: string, count: number): Promise<ImageSearchResult[]> {
        try {
            if (!this.PEXELS_API_KEY) {
                logger.warn('Pexels API key not configured');
                return [];
            }

            const response = await axios.get(this.PEXELS_API_URL, {
                headers: {
                    'Authorization': this.PEXELS_API_KEY,
                },
                params: {
                    query,
                    per_page: count,
                    orientation: 'landscape'
                }
            });

            return response.data.photos?.map((img: any) => ({
                url: img.src.large,
                thumbnailUrl: img.src.medium,
                title: img.alt || `Pexels photo by ${img.photographer}`,
                source: 'pexels.com',
                license: 'creative-commons' as const,
                dimensions: {
                    width: img.width,
                    height: img.height
                },
                format: 'jpg',
                size: 0
            })) || [];

        } catch (error) {
            logger.error('Pexels image search error:', error);
            return [];
        }
    }

    /**
     * Extract file format from URL
     */
    private extractFormat(url: string): string {
        try {
            const extension = url.split('.').pop()?.toLowerCase() || 'jpg';
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) ? extension : 'jpg';
        } catch {
            return 'jpg';
        }
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
     * Generate image recommendations based on slide requirements
     */
    private generateImageRecommendations(
        requirement: SlideImageRequirement,
        searchedImages: ImageSearchResult[],
        generatedImages: GeneratedImage[]
    ): string[] {
        const recommendations: string[] = [];

        if (searchedImages.length === 0 && generatedImages.length === 0) {
            recommendations.push('Consider using placeholder images or icons for this slide');
        }

        if (requirement.imageType === 'hero' && searchedImages.length > 0) {
            recommendations.push('Use the highest resolution image as the hero image');
        }

        if (requirement.preferredStyle === 'professional' && searchedImages.length > 0) {
            recommendations.push('Choose images with clean backgrounds and business-appropriate content');
        }

        if (requirement.slideType.includes('financial') || requirement.slideType.includes('data')) {
            recommendations.push('Consider using charts or infographics instead of photos');
        }

        if (generatedImages.length > 0) {
            recommendations.push('AI-generated images can be customized to match your brand colors');
        }

        return recommendations;
    }

    /**
     * Get slide-specific image keywords
     */
    getSlideImageKeywords(slideType: string, content: string): string[] {
        const slideKeywords: { [key: string]: string[] } = {
            'title': ['business', 'corporate', 'startup', 'innovation'],
            'problem': ['challenge', 'issue', 'solution', 'difficulty'],
            'solution': ['innovation', 'technology', 'breakthrough', 'advancement'],
            'market': ['growth', 'opportunity', 'market', 'demand'],
            'competition': ['competitive', 'analysis', 'comparison', 'advantage'],
            'product': ['product', 'service', 'feature', 'technology'],
            'business-model': ['revenue', 'business', 'model', 'strategy'],
            'traction': ['growth', 'success', 'metrics', 'achievement'],
            'financials': ['financial', 'revenue', 'profit', 'investment'],
            'team': ['team', 'leadership', 'expertise', 'professional'],
            'funding': ['investment', 'funding', 'capital', 'growth'],
            'future': ['future', 'roadmap', 'vision', 'expansion']
        };

        const contentKeywords = content.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3)
            .slice(0, 3);

        const typeKeywords = slideKeywords[slideType] || ['business', 'professional'];

        return [...typeKeywords, ...contentKeywords].slice(0, 5);
    }

    /**
     * Mock image results for development/testing
     */
    private getMockImageResults(query: string, count: number): ImageSearchResult[] {
        const mockImages: ImageSearchResult[] = [];

        for (let i = 0; i < count; i++) {
            mockImages.push({
                url: `https://via.placeholder.com/800x600/0066cc/ffffff?text=${encodeURIComponent(query)}-${i + 1}`,
                thumbnailUrl: `https://via.placeholder.com/200x150/0066cc/ffffff?text=${encodeURIComponent(query)}-${i + 1}`,
                title: `${query} - Professional Image ${i + 1}`,
                source: 'placeholder.com',
                license: 'public-domain',
                dimensions: { width: 800, height: 600 },
                format: 'png',
                size: 50000
            });
        }

        return mockImages;
    }
}

export { ImageService, ImageSearchResult, GeneratedImage, SlideImageRequirement };
export default new ImageService();
