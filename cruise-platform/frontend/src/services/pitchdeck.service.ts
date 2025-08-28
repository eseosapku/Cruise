import apiService from './api.service';
import { ENDPOINTS, SUCCESS_MESSAGES } from '../utils/constants';

// Interfaces matching backend
export interface PitchDeckRequest {
    companyName: string;
    industry?: string;
    targetAudience?: string;
    fundingStage?: string;
    businessType?: string;
    specificTopics?: string[];
    researchDepth?: 'basic' | 'comprehensive' | 'expert';
    theme?: 'modern' | 'corporate' | 'startup' | 'creative';
    slideAspectRatio?: '16:9' | '4:3' | 'widescreen';
}

// New interfaces for Genspark-style workflow
export interface ContentBlock {
    id: string;
    type: 'title' | 'subtitle' | 'bullets' | 'quote' | 'image' | 'chart' | 'table' | 'logo' | 'footer' | 'notes';
    content: string | string[] | any;
    metadata: {
        priority: 'must-show' | 'nice-to-have';
        estimatedLength: number;
        visualWeight: 'light' | 'medium' | 'heavy';
        intent: string;
    };
    styling?: {
        fontSize?: string;
        color?: string;
        alignment?: 'left' | 'center' | 'right';
    };
}

export interface LayoutArchetype {
    id: string;
    name: string;
    description: string;
    regions: {
        title: { area: string; maxLines: number };
        body: { area: string; columns: number };
        visual: { area: string; aspectRatio: string };
        footer: { area: string; height: string };
    };
    gridTemplate: string;
    usage: string[];
}

export interface DesignTokens {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
        surface: string;
        muted: string;
    };
    fonts: {
        heading: string;
        body: string;
        mono: string;
    };
    sizes: {
        h1: string;
        h2: string;
        h3: string;
        body: string;
        caption: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borders: {
        radius: string;
        width: string;
    };
    shadows: {
        card: string;
        elevated: string;
    };
}

export interface SlideLayout {
    slideNumber: number;
    layoutId: string;
    contentBlocks: ContentBlock[];
    designTokens: DesignTokens;
    htmlContent: string;
    cssVariables: string;
    metadata: {
        estimatedReadTime: number;
        complexity: 'simple' | 'medium' | 'complex';
        visualDensity: number;
    };
}

export interface PitchDeckResult {
    success: boolean;
    pitchDeck?: PitchDeckOutline;
    researchSources?: ScrapedContent[];
    insights?: ContentInsights;
    error?: string;
    metadata: {
        generatedAt: Date;
        researchSourceCount: number;
        processingTimeMs: number;
        aiTokensUsed?: number;
    };
}

export interface PitchDeckOutline {
    title: string;
    subtitle: string;
    executiveSummary: string;
    companyOverview: string;
    slides: SlideOutline[];
}

export interface SlideOutline {
    slideNumber: number;
    slideType: string;
    title: string;
    content: string[];
    keyPoints: string[];
    statistics: string[];
    visualElements: string[];
}

export interface SlideContent {
    slideNumber: number;
    slideType: string;
    title: string;
    content: string;
    visualElements: string[];
    images: ImageSearchResult[];
    svgElements: SVGElement[];
    speakerNotes: string;
}

export interface CompletePitchDeck {
    outline: PitchDeckOutline;
    slides: SlideContent[] | SlideLayout[];
    visualAssets: {
        totalImages: number;
        totalSVGs: number;
        totalCharts: number;
        imageBreakdown: { [key: string]: number };
        svgBreakdown: { [key: string]: number };
    };
    exportFormats: {
        json: string;
        markdown: string;
        html: string;
        powerpoint?: string;
    };
}

export interface ImageSearchResult {
    url: string;
    title: string;
    source: string;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
}

export interface SVGElement {
    type: string;
    data: any;
    style?: any;
}

export interface ContentInsights {
    marketSize: string[];
    competitiveAdvantage: string[];
    problemStatement: string[];
    solution: string[];
    businessModel: string[];
    targetMarket: string[];
    financialProjections: string[];
    teamCredentials: string[];
    traction: string[];
    risks: string[];
    keyMetrics: string[];
    industryTrends: string[];
}

export interface ScrapedContent {
    url: string;
    title: string;
    content: string;
    metadata?: any;
}

class PitchDeckService {

    /**
     * Generate automated pitch deck using AI and web research
     */
    async generateAutomatedPitchDeck(request: PitchDeckRequest): Promise<PitchDeckResult> {
        try {
            const response = await apiService.post<PitchDeckResult>(
                ENDPOINTS.PITCH_DECK.GENERATE_AUTOMATED,
                request
            );

            console.log('Automated pitch deck generated successfully');
            return response;
        } catch (error) {
            console.error('Failed to generate automated pitch deck:', error);
            throw error;
        }
    }

    /**
     * Create a complete pitch deck with all content and visuals
     */
    async createCompletePitchDeck(request: PitchDeckRequest): Promise<CompletePitchDeck> {
        try {
            const response = await apiService.post<CompletePitchDeck>(
                ENDPOINTS.PITCH_DECK.GENERATE_COMPLETE,
                request
            );

            console.log(SUCCESS_MESSAGES.PITCH_DECK_CREATED);
            return response;
        } catch (error) {
            console.error('Failed to create complete pitch deck:', error);
            throw error;
        }
    }

    /**
     * Generate pitch deck using Genspark-style workflow with advanced layout and design
     */
    async generateGensparkPitchDeck(request: PitchDeckRequest): Promise<CompletePitchDeck> {
        try {
            const response = await apiService.post<CompletePitchDeck>(
                ENDPOINTS.PITCH_DECK.GENERATE_GENSPARK,
                request
            );

            console.log('Genspark-style pitch deck generated successfully');
            return response;
        } catch (error) {
            console.error('Failed to generate Genspark-style pitch deck:', error);
            throw error;
        }
    }

    /**
     * Create a standard pitch deck
     */
    async createPitchDeck(pitchDeckData: any): Promise<any> {
        try {
            const response = await apiService.post(
                ENDPOINTS.PITCH_DECK.BASE,
                pitchDeckData
            );

            console.log(SUCCESS_MESSAGES.PITCH_DECK_CREATED);
            return response;
        } catch (error) {
            console.error('Failed to create pitch deck:', error);
            throw error;
        }
    }

    /**
     * Get pitch deck by ID
     */
    async getPitchDeck(id: string): Promise<any> {
        try {
            const response = await apiService.get(`${ENDPOINTS.PITCH_DECK.BASE}/${id}`);
            return response;
        } catch (error) {
            console.error('Failed to get pitch deck:', error);
            throw error;
        }
    }

    /**
     * Update existing pitch deck
     */
    async updatePitchDeck(id: string, updateData: any): Promise<any> {
        try {
            const response = await apiService.put(
                `${ENDPOINTS.PITCH_DECK.BASE}/${id}`,
                updateData
            );

            console.log(SUCCESS_MESSAGES.DATA_SAVED);
            return response;
        } catch (error) {
            console.error('Failed to update pitch deck:', error);
            throw error;
        }
    }

    /**
     * Delete pitch deck
     */
    async deletePitchDeck(id: string): Promise<void> {
        try {
            await apiService.delete(`${ENDPOINTS.PITCH_DECK.BASE}/${id}`);
            console.log('Pitch deck deleted successfully');
        } catch (error) {
            console.error('Failed to delete pitch deck:', error);
            throw error;
        }
    }

    /**
     * Generate images for slides
     */
    async generateSlideImages(slideData: any): Promise<ImageSearchResult[]> {
        try {
            const response = await apiService.post<ImageSearchResult[]>(
                ENDPOINTS.PITCH_DECK.GENERATE_IMAGES,
                slideData
            );

            console.log('Slide images generated successfully');
            return response;
        } catch (error) {
            console.error('Failed to generate slide images:', error);
            throw error;
        }
    }

    /**
     * Generate SVG visuals for slides
     */
    async generateSVGVisuals(slideData: any): Promise<SVGElement[]> {
        try {
            const response = await apiService.post<SVGElement[]>(
                ENDPOINTS.PITCH_DECK.GENERATE_SVG,
                slideData
            );

            console.log('SVG visuals generated successfully');
            return response;
        } catch (error) {
            console.error('Failed to generate SVG visuals:', error);
            throw error;
        }
    }

    /**
     * Get list of all user's pitch decks
     */
    async getPitchDecks(): Promise<any[]> {
        try {
            const response = await apiService.get(ENDPOINTS.PITCH_DECK.BASE);
            return response;
        } catch (error) {
            console.error('Failed to get pitch decks:', error);
            throw error;
        }
    }
}

// Create singleton instance
const pitchDeckService = new PitchDeckService();

export default pitchDeckService;
export { pitchDeckService };
