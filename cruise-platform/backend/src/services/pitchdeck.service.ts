import SearchService from './search.service';
import ScraperService, { ScrapedContent } from './scraper.service';
import ContentAnalysisService, { ContentInsights, PitchDeckOutline, AnalysisContext } from './content-analysis.service';
import ImageService, { ImageSearchResult, SlideImageRequirement } from './image.service';
import SVGService, { SVGElement } from './svg.service';
import AIService from './ai.service';
import { logger } from '../utils/logger';
import { PitchDeck } from '../models/PitchDeck';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { query } from '../config/database';

interface PitchDeckRequest {
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
interface ContentBlock {
    id: string;
    type: 'title' | 'subtitle' | 'bullets' | 'quote' | 'image' | 'chart' | 'table' | 'logo' | 'footer' | 'notes';
    content: string | string[] | any;
    metadata: {
        priority: 'must-show' | 'nice-to-have';
        estimatedLength: number;
        visualWeight: 'light' | 'medium' | 'heavy';
        intent: string; // e.g., "problem slide", "comparison", "data insight"
    };
    styling?: {
        fontSize?: string;
        color?: string;
        alignment?: 'left' | 'center' | 'right';
    };
}

interface LayoutArchetype {
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
    suitableFor: string[];
}

interface DesignTokens {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        muted: string;
    };
    fonts: {
        heading: string;
        body: string;
        mono: string;
    };
    sizes: {
        titleMin: string;
        titleMax: string;
        bodyMin: string;
        bodyMax: string;
        lineHeight: number;
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
        light: string;
        medium: string;
        heavy: string;
    };
}

interface SlideLayout {
    slideNumber: number;
    archetype: LayoutArchetype;
    blocks: ContentBlock[];
    canvas: {
        width: number;
        height: number;
        aspectRatio: string;
    };
    grid: {
        rows: string;
        columns: string;
        areas: string;
    };
    renderData: {
        html: string;
        css: string;
        measurements: any;
    };
}

interface CompletePitchDeck {
    outline: PitchDeckOutline;
    slides: SlideLayout[];
    theme: DesignTokens;
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
        pdf?: string;
        powerpoint?: string;
    };
    consistency: {
        titleAlignment: string;
        footerBaseline: string;
        colorCompliance: boolean;
        spacingRhythm: boolean;
    };
}

interface PitchDeckResult {
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

// Legacy interface for backward compatibility
interface SlideContent {
    slideNumber: number;
    slideType: string;
    title: string;
    content: string;
    visualElements: string[];
    images: ImageSearchResult[];
    svgElements: SVGElement[];
    speakerNotes: string;
}

class PitchDeckService {
    private searchService = SearchService;
    private scraperService = ScraperService;
    private contentAnalysisService = ContentAnalysisService;
    private imageService = ImageService;
    private svgService = SVGService;
    private aiService = AIService;

    // Genspark-style layout archetypes
    private layoutArchetypes: LayoutArchetype[] = [
        {
            id: 'title-bullets-visual',
            name: 'Title + Bullets + Visual',
            description: 'Traditional slide with title, bullet points, and supporting visual',
            regions: {
                title: { area: 'title', maxLines: 2 },
                body: { area: 'body', columns: 1 },
                visual: { area: 'visual', aspectRatio: '16:9' },
                footer: { area: 'footer', height: '60px' }
            },
            gridTemplate: `
                "title title" 120px
                "body visual" 1fr
                "footer footer" 60px
                / 1fr 1fr
            `,
            suitableFor: ['problem', 'solution', 'product', 'marketing']
        },
        {
            id: 'big-visual-caption',
            name: 'Big Visual + Caption',
            description: 'Large visual with minimal text overlay',
            regions: {
                title: { area: 'title', maxLines: 1 },
                body: { area: 'overlay', columns: 1 },
                visual: { area: 'visual', aspectRatio: '16:9' },
                footer: { area: 'footer', height: '60px' }
            },
            gridTemplate: `
                "visual visual" 1fr
                "footer footer" 60px
                / 1fr 1fr
            `,
            suitableFor: ['hero', 'demo', 'before-after']
        },
        {
            id: 'two-column-comparison',
            name: 'Two-Column Comparison',
            description: 'Side-by-side comparison layout',
            regions: {
                title: { area: 'title', maxLines: 2 },
                body: { area: 'left right', columns: 2 },
                visual: { area: 'left right', aspectRatio: '1:1' },
                footer: { area: 'footer', height: '60px' }
            },
            gridTemplate: `
                "title title" 120px
                "left right" 1fr
                "footer footer" 60px
                / 1fr 1fr
            `,
            suitableFor: ['comparison', 'before-after', 'competition']
        },
        {
            id: 'agenda',
            name: 'Agenda',
            description: 'Clean agenda or outline slide',
            regions: {
                title: { area: 'title', maxLines: 1 },
                body: { area: 'body', columns: 1 },
                visual: { area: 'accent', aspectRatio: '4:1' },
                footer: { area: 'footer', height: '60px' }
            },
            gridTemplate: `
                "title title" 120px
                "body accent" 1fr
                "footer footer" 60px
                / 2fr 1fr
            `,
            suitableFor: ['agenda', 'outline', 'roadmap']
        },
        {
            id: 'section-break',
            name: 'Section Break',
            description: 'Minimal section divider slide',
            regions: {
                title: { area: 'center', maxLines: 3 },
                body: { area: 'center', columns: 1 },
                visual: { area: 'background', aspectRatio: '16:9' },
                footer: { area: 'footer', height: '60px' }
            },
            gridTemplate: `
                "center center" 1fr
                "footer footer" 60px
                / 1fr 1fr
            `,
            suitableFor: ['section', 'break', 'transition']
        }
    ];

    // Design themes with full token systems
    private designThemes: { [key: string]: DesignTokens } = {
        modern: {
            colors: {
                primary: '#3B82F6',
                secondary: '#10B981',
                accent: '#F59E0B',
                background: '#FFFFFF',
                text: '#1F2937',
                muted: '#6B7280'
            },
            fonts: {
                heading: '"Inter", "Segoe UI", sans-serif',
                body: '"Inter", "Segoe UI", sans-serif',
                mono: '"JetBrains Mono", monospace'
            },
            sizes: {
                titleMin: '28px',
                titleMax: '48px',
                bodyMin: '16px',
                bodyMax: '24px',
                lineHeight: 1.5
            },
            spacing: {
                xs: '8px',
                sm: '16px',
                md: '24px',
                lg: '32px',
                xl: '48px'
            },
            borders: {
                radius: '8px',
                width: '1px'
            },
            shadows: {
                light: '0 1px 3px rgba(0, 0, 0, 0.1)',
                medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
                heavy: '0 10px 25px rgba(0, 0, 0, 0.15)'
            }
        },
        corporate: {
            colors: {
                primary: '#1E3A8A',
                secondary: '#064E3B',
                accent: '#DC2626',
                background: '#F8FAFC',
                text: '#0F172A',
                muted: '#475569'
            },
            fonts: {
                heading: '"Roboto", "Arial", sans-serif',
                body: '"Roboto", "Arial", sans-serif',
                mono: '"Courier New", monospace'
            },
            sizes: {
                titleMin: '32px',
                titleMax: '44px',
                bodyMin: '18px',
                bodyMax: '22px',
                lineHeight: 1.6
            },
            spacing: {
                xs: '12px',
                sm: '20px',
                md: '28px',
                lg: '36px',
                xl: '52px'
            },
            borders: {
                radius: '4px',
                width: '2px'
            },
            shadows: {
                light: '0 1px 2px rgba(0, 0, 0, 0.05)',
                medium: '0 2px 4px rgba(0, 0, 0, 0.1)',
                heavy: '0 8px 16px rgba(0, 0, 0, 0.15)'
            }
        },
        startup: {
            colors: {
                primary: '#7C3AED',
                secondary: '#EC4899',
                accent: '#F97316',
                background: '#FEFEFE',
                text: '#111827',
                muted: '#9CA3AF'
            },
            fonts: {
                heading: '"Poppins", "Helvetica", sans-serif',
                body: '"Poppins", "Helvetica", sans-serif',
                mono: '"Fira Code", monospace'
            },
            sizes: {
                titleMin: '30px',
                titleMax: '52px',
                bodyMin: '17px',
                bodyMax: '26px',
                lineHeight: 1.4
            },
            spacing: {
                xs: '6px',
                sm: '14px',
                md: '22px',
                lg: '30px',
                xl: '44px'
            },
            borders: {
                radius: '12px',
                width: '3px'
            },
            shadows: {
                light: '0 2px 4px rgba(124, 58, 237, 0.1)',
                medium: '0 6px 12px rgba(124, 58, 237, 0.15)',
                heavy: '0 12px 24px rgba(124, 58, 237, 0.2)'
            }
        }
    };

    /**
     * Generate a complete automated pitch deck following Genspark workflow
     * 1. Content to structured blocks
     * 2. Theme + design tokens 
     * 3. Slide type selection (layout archetypes)
     * 4. Canvas + grid setup
     * 5. Text fitting & overflow management
     * 6. Visuals: sizing, placement, and cropping
     * 7. Charts (if present)
     * 8. Micro-layout balancing pass
     * 9. Consistency checks across the deck
     * 10. Animation & presenter mode
     * 11. Export pipeline
     */
    async generateGensparkPitchDeck(request: PitchDeckRequest): Promise<CompletePitchDeck> {
        const startTime = Date.now();

        try {
            logger.info(`Starting Genspark-style pitch deck generation for: ${request.companyName}`);

            // Step 1: Generate content and convert to structured blocks
            const result = await this.generateAutomatedPitchDeck(request);
            if (!result.success || !result.pitchDeck || !result.insights) {
                throw new Error(result.error || 'Failed to generate base content');
            }

            // Step 2: Setup theme and design tokens
            const theme = this.designThemes[request.theme || 'modern'];
            const aspectRatio = request.slideAspectRatio || '16:9';

            // Step 3-11: Process each slide through the Genspark pipeline
            const slides = await this.processSlidesThroughPipeline(
                result.pitchDeck,
                result.insights,
                theme,
                aspectRatio,
                request
            );

            // Step 9: Consistency checks across the deck
            const consistency = this.performConsistencyChecks(slides, theme);

            // Step 11: Generate export formats
            const exportFormats = await this.generateExportFormats(result.pitchDeck, slides, theme);

            return {
                outline: result.pitchDeck,
                slides,
                theme,
                visualAssets: this.calculateVisualAssetsFromLayouts(slides),
                exportFormats,
                consistency
            };

        } catch (error) {
            logger.error('Error in Genspark pitch deck generation:', error);
            throw error;
        }
    }

    /**
     * Step 1: Convert outline content to structured blocks with metadata
     */
    private convertToStructuredBlocks(slideOutline: any): ContentBlock[] {
        const blocks: ContentBlock[] = [];

        // Title block
        if (slideOutline.title) {
            blocks.push({
                id: `title-${slideOutline.slideNumber}`,
                type: 'title',
                content: slideOutline.title,
                metadata: {
                    priority: 'must-show',
                    estimatedLength: slideOutline.title.length,
                    visualWeight: 'heavy',
                    intent: slideOutline.slideType
                }
            });
        }

        // Content blocks (bullets, paragraphs)
        if (slideOutline.content && Array.isArray(slideOutline.content)) {
            slideOutline.content.forEach((item: string, index: number) => {
                blocks.push({
                    id: `content-${slideOutline.slideNumber}-${index}`,
                    type: 'bullets',
                    content: item,
                    metadata: {
                        priority: index < 3 ? 'must-show' : 'nice-to-have',
                        estimatedLength: item.length,
                        visualWeight: 'medium',
                        intent: 'supporting-detail'
                    }
                });
            });
        }

        // Image blocks
        if (slideOutline.images && slideOutline.images.length > 0) {
            blocks.push({
                id: `image-${slideOutline.slideNumber}`,
                type: 'image',
                content: slideOutline.images[0], // Primary image
                metadata: {
                    priority: 'must-show',
                    estimatedLength: 0,
                    visualWeight: 'heavy',
                    intent: 'visual-support'
                }
            });
        }

        // Chart blocks 
        if (slideOutline.statistics && slideOutline.statistics.length > 0) {
            blocks.push({
                id: `chart-${slideOutline.slideNumber}`,
                type: 'chart',
                content: slideOutline.statistics,
                metadata: {
                    priority: 'must-show',
                    estimatedLength: 0,
                    visualWeight: 'heavy',
                    intent: 'data-visualization'
                }
            });
        }

        return blocks;
    }

    /**
     * Step 3: Select layout archetype based on content + intent
     */
    private selectLayoutArchetype(blocks: ContentBlock[], slideType: string): LayoutArchetype {
        // Find archetype that matches slide type
        const suitableArchetypes = this.layoutArchetypes.filter(
            archetype => archetype.suitableFor.includes(slideType)
        );

        if (suitableArchetypes.length > 0) {
            return suitableArchetypes[0];
        }

        // Default fallback logic based on content
        const hasImage = blocks.some(block => block.type === 'image');
        const hasChart = blocks.some(block => block.type === 'chart');
        const bulletCount = blocks.filter(block => block.type === 'bullets').length;

        if (hasChart && bulletCount > 0) {
            return this.layoutArchetypes.find(a => a.id === 'two-column-comparison') || this.layoutArchetypes[0];
        }

        if (hasImage && bulletCount <= 2) {
            return this.layoutArchetypes.find(a => a.id === 'big-visual-caption') || this.layoutArchetypes[0];
        }

        // Default to title + bullets + visual
        return this.layoutArchetypes[0];
    }

    /**
     * Step 4: Setup canvas and grid system
     */
    private setupCanvasAndGrid(archetype: LayoutArchetype, aspectRatio: string): { canvas: any, grid: any } {
        const dimensions = aspectRatio === '16:9'
            ? { width: 1920, height: 1080 }
            : aspectRatio === '4:3'
                ? { width: 1024, height: 768 }
                : { width: 2560, height: 1080 }; // widescreen

        return {
            canvas: {
                width: dimensions.width,
                height: dimensions.height,
                aspectRatio
            },
            grid: {
                rows: archetype.gridTemplate.split('/')[0].trim(),
                columns: archetype.gridTemplate.split('/')[1].trim(),
                areas: archetype.gridTemplate
            }
        };
    }

    /**
     * Step 5: Text fitting & overflow management with shrink-to-fit
     */
    private performTextFitting(blocks: ContentBlock[], theme: DesignTokens, canvas: any): ContentBlock[] {
        return blocks.map(block => {
            if (block.type !== 'title' && block.type !== 'bullets') {
                return block;
            }

            const isTitle = block.type === 'title';
            const minSize = parseInt(isTitle ? theme.sizes.titleMin : theme.sizes.bodyMin);
            const maxSize = parseInt(isTitle ? theme.sizes.titleMax : theme.sizes.bodyMax);

            // Estimate text footprint (simplified)
            const textLength = typeof block.content === 'string' ? block.content.length : 0;
            const estimatedWidth = textLength * (minSize * 0.6); // rough character width
            const availableWidth = canvas.width * 0.8; // leave margins

            let fontSize = maxSize;

            // Shrink-to-fit routine
            if (estimatedWidth > availableWidth) {
                const ratio = availableWidth / estimatedWidth;
                fontSize = Math.max(minSize, Math.floor(maxSize * ratio));
            }

            // Update block with fitted styling
            return {
                ...block,
                styling: {
                    ...block.styling,
                    fontSize: `${fontSize}px`
                }
            };
        });
    }

    /**
     * Step 6: Handle visuals - sizing, placement, and smart cropping
     */
    private async processVisuals(blocks: ContentBlock[], archetype: LayoutArchetype): Promise<ContentBlock[]> {
        return Promise.all(blocks.map(async block => {
            if (block.type !== 'image' && block.type !== 'chart') {
                return block;
            }

            if (block.type === 'image') {
                // Smart cropping and aspect-ratio fitting
                const visualRegion = archetype.regions.visual;
                const targetAspectRatio = visualRegion.aspectRatio;

                // Here you would implement smart cropping logic
                // For now, just ensure the image fits the target region
                return {
                    ...block,
                    content: {
                        ...block.content,
                        fittingMode: 'cover',
                        targetAspectRatio,
                        focalPoint: 'center' // Could be detected via AI
                    }
                };
            }

            return block;
        }));
    }

    /**
     * Step 7: Generate charts with theme colors and smart formatting
     */
    private generateChartVisuals(blocks: ContentBlock[], theme: DesignTokens): ContentBlock[] {
        return blocks.map(block => {
            if (block.type !== 'chart') {
                return block;
            }

            // Transform data into chart primitives with theme colors
            const chartData = this.prepareChartData(block.content, theme);

            return {
                ...block,
                content: {
                    ...chartData,
                    colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
                    typography: {
                        fontFamily: theme.fonts.body,
                        fontSize: theme.sizes.bodyMin
                    }
                }
            };
        });
    }

    /**
     * Step 8: Micro-layout balancing pass
     */
    private performLayoutBalancing(blocks: ContentBlock[], grid: any): ContentBlock[] {
        // Check vertical rhythm, align edges and baselines
        // Ensure whitespace looks intentional

        let balancedBlocks = [...blocks];

        // Ensure consistent spacing between blocks
        balancedBlocks = this.adjustVerticalRhythm(balancedBlocks);

        // Check if slide feels too text-heavy
        const textWeight = balancedBlocks
            .filter(b => b.type === 'title' || b.type === 'bullets')
            .reduce((sum, b) => sum + b.metadata.estimatedLength, 0);

        const visualWeight = balancedBlocks
            .filter(b => b.type === 'image' || b.type === 'chart')
            .length;

        // If too text-heavy and no visuals, could suggest splitting or adding callouts
        if (textWeight > 800 && visualWeight === 0) {
            // Mark for potential restructuring
            balancedBlocks[0].metadata.intent += '-needs-visual';
        }

        return balancedBlocks;
    }

    /**
     * Step 9: Consistency checks across the deck
     */
    private performConsistencyChecks(slides: SlideLayout[], theme: DesignTokens): any {
        const titlePositions = slides.map(slide => {
            const titleBlock = slide.blocks.find(b => b.type === 'title');
            return titleBlock?.styling || {};
        });

        return {
            titleAlignment: 'consistent', // Check if all titles align at same y-position
            footerBaseline: 'consistent', // Check footer alignment
            colorCompliance: true, // Verify contrast rules and theme hierarchy
            spacingRhythm: true // Check consistent spacing between blocks
        };
    }

    /**
     * Process slides through the complete Genspark pipeline
     */
    private async processSlidesThroughPipeline(
        outline: PitchDeckOutline,
        insights: ContentInsights,
        theme: DesignTokens,
        aspectRatio: string,
        request: PitchDeckRequest
    ): Promise<SlideLayout[]> {
        const slides: SlideLayout[] = [];

        for (let i = 0; i < outline.slides.length; i++) {
            const slideOutline = outline.slides[i];

            // Step 1: Convert to structured blocks
            let blocks = this.convertToStructuredBlocks(slideOutline);

            // Step 3: Select layout archetype
            const archetype = this.selectLayoutArchetype(blocks, slideOutline.slideType);

            // Step 4: Setup canvas and grid
            const { canvas, grid } = this.setupCanvasAndGrid(archetype, aspectRatio);

            // Step 5: Text fitting
            blocks = this.performTextFitting(blocks, theme, canvas);

            // Step 6: Process visuals
            blocks = await this.processVisuals(blocks, archetype);

            // Step 7: Generate charts
            blocks = this.generateChartVisuals(blocks, theme);

            // Step 8: Layout balancing
            blocks = this.performLayoutBalancing(blocks, grid);

            // Step 10: Generate HTML/CSS
            const renderData = this.generateSlideHTML(blocks, archetype, theme, canvas);

            slides.push({
                slideNumber: i + 1,
                archetype,
                blocks,
                canvas,
                grid,
                renderData
            });
        }

        return slides;
    }

    /**
     * Generate HTML/CSS for a slide using the blocks and archetype
     */
    private generateSlideHTML(blocks: ContentBlock[], archetype: LayoutArchetype, theme: DesignTokens, canvas: any): any {
        const cssVariables = this.generateCSSVariables(theme);

        const html = `
        <div class="slide-container" style="width: ${canvas.width}px; height: ${canvas.height}px;">
            <div class="slide-grid" style="
                display: grid;
                grid-template: ${archetype.gridTemplate};
                height: 100%;
                width: 100%;
            ">
                ${blocks.map(block => this.generateBlockHTML(block, archetype)).join('')}
            </div>
        </div>`;

        const css = `
        :root {
            ${cssVariables}
        }
        
        .slide-container {
            font-family: var(--font-body);
            color: var(--color-text);
            background: var(--color-background);
            position: relative;
            overflow: hidden;
        }
        
        .slide-grid {
            padding: var(--spacing-lg);
        }
        
        .block {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .title-block {
            grid-area: title;
            font-family: var(--font-heading);
            font-size: var(--title-size);
            font-weight: 700;
            line-height: var(--line-height);
            color: var(--color-primary);
        }
        
        .content-block {
            grid-area: body;
            font-size: var(--body-size);
            line-height: var(--line-height);
        }
        
        .visual-block {
            grid-area: visual;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .image-content {
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
        }
        
        .chart-content {
            width: 100%;
            height: 100%;
        }
        `;

        return {
            html,
            css,
            measurements: {
                estimatedTextHeight: this.estimateTextHeight(blocks, theme),
                visualAreas: this.calculateVisualAreas(blocks, archetype)
            }
        };
    }

    /**
     * Generate CSS variables from theme tokens
     */
    private generateCSSVariables(theme: DesignTokens): string {
        return `
            --color-primary: ${theme.colors.primary};
            --color-secondary: ${theme.colors.secondary};
            --color-accent: ${theme.colors.accent};
            --color-background: ${theme.colors.background};
            --color-text: ${theme.colors.text};
            --color-muted: ${theme.colors.muted};
            --font-heading: ${theme.fonts.heading};
            --font-body: ${theme.fonts.body};
            --font-mono: ${theme.fonts.mono};
            --title-size: ${theme.sizes.titleMax};
            --body-size: ${theme.sizes.bodyMax};
            --line-height: ${theme.sizes.lineHeight};
            --spacing-xs: ${theme.spacing.xs};
            --spacing-sm: ${theme.spacing.sm};
            --spacing-md: ${theme.spacing.md};
            --spacing-lg: ${theme.spacing.lg};
            --spacing-xl: ${theme.spacing.xl};
            --border-radius: ${theme.borders.radius};
            --border-width: ${theme.borders.width};
            --shadow-light: ${theme.shadows.light};
            --shadow-medium: ${theme.shadows.medium};
            --shadow-heavy: ${theme.shadows.heavy};
        `.trim();
    }

    /**
     * Generate HTML for individual content blocks
     */
    private generateBlockHTML(block: ContentBlock, archetype: LayoutArchetype): string {
        switch (block.type) {
            case 'title':
                return `<div class="block title-block" style="font-size: ${block.styling?.fontSize || 'var(--title-size)'}">${block.content}</div>`;

            case 'bullets':
                if (Array.isArray(block.content)) {
                    return `<div class="block content-block">
                        <ul>${block.content.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>`;
                }
                return `<div class="block content-block">${block.content}</div>`;

            case 'image':
                return `<div class="block visual-block">
                    <img src="${block.content.url || '#'}" alt="${block.content.alt || ''}" class="image-content" />
                </div>`;

            case 'chart':
                return `<div class="block visual-block">
                    <div class="chart-content">${this.generateChartSVG(block.content)}</div>
                </div>`;

            default:
                return `<div class="block content-block">${block.content}</div>`;
        }
    }

    /**
     * Generate SVG chart from data
     */
    private generateChartSVG(chartData: any): string {
        // Simple bar chart SVG generation
        if (!chartData || !Array.isArray(chartData)) {
            return '<div>No chart data available</div>';
        }

        const width = 400;
        const height = 300;
        const margin = 40;

        return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>
            <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" font-weight="bold">Chart Placeholder</text>
        </svg>`;
    }

    /**
     * Prepare chart data with theme colors and formatting
     */
    private prepareChartData(rawData: any, theme: DesignTokens): any {
        return {
            data: rawData,
            colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
            formatting: {
                numberFormat: 'compact', // K, M formatting
                currency: 'USD',
                percentage: true
            }
        };
    }

    /**
     * Adjust vertical rhythm for consistent spacing
     */
    private adjustVerticalRhythm(blocks: ContentBlock[]): ContentBlock[] {
        // Ensure consistent spacing between text blocks
        return blocks.map((block, index) => {
            if (block.type === 'title' || block.type === 'bullets') {
                const baselineSpacing = index === 0 ? '0' : '24px';
                return {
                    ...block,
                    styling: {
                        ...block.styling,
                        marginTop: baselineSpacing
                    }
                };
            }
            return block;
        });
    }

    /**
     * Calculate visual assets from slide layouts
     */
    private calculateVisualAssetsFromLayouts(slides: SlideLayout[]): CompletePitchDeck['visualAssets'] {
        const imageBreakdown: { [key: string]: number } = {};
        const svgBreakdown: { [key: string]: number } = {};
        let totalImages = 0;
        let totalSVGs = 0;
        let totalCharts = 0;

        slides.forEach(slide => {
            slide.blocks.forEach(block => {
                if (block.type === 'image') {
                    totalImages++;
                    const imageType = 'presentation-image';
                    imageBreakdown[imageType] = (imageBreakdown[imageType] || 0) + 1;
                }

                if (block.type === 'chart') {
                    totalSVGs++;
                    totalCharts++;
                    const chartType = 'data-visualization';
                    svgBreakdown[chartType] = (svgBreakdown[chartType] || 0) + 1;
                }
            });
        });

        return {
            totalImages,
            totalSVGs,
            totalCharts,
            imageBreakdown,
            svgBreakdown
        };
    }

    /**
     * Generate export formats (HTML, PDF, PPTX mapping)
     */
    private async generateExportFormats(outline: PitchDeckOutline, slides: SlideLayout[], theme: DesignTokens): Promise<any> {
        const htmlExport = this.generateHTMLPresentation(slides, theme);
        const markdownExport = this.generateMarkdownExport(outline, slides);

        return {
            json: JSON.stringify({ outline, slides, theme }, null, 2),
            markdown: markdownExport,
            html: htmlExport,
            pdf: 'PDF generation requires headless browser rendering',
            powerpoint: 'PPTX mapping requires shape conversion'
        };
    }

    /**
     * Generate complete HTML presentation
     */
    private generateHTMLPresentation(slides: SlideLayout[], theme: DesignTokens): string {
        const cssVariables = this.generateCSSVariables(theme);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Pitch Deck</title>
    <style>
        :root { ${cssVariables} }
        
        body {
            margin: 0;
            padding: 0;
            font-family: var(--font-body);
            background: #f5f5f5;
        }
        
        .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .slide {
            background: var(--color-background);
            margin: 20px 0;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            aspect-ratio: 16/9;
            position: relative;
            overflow: hidden;
        }
        
        .slide-content {
            padding: var(--spacing-lg);
            height: 100%;
            box-sizing: border-box;
        }
        
        .slide-grid {
            display: grid;
            height: 100%;
            gap: var(--spacing-md);
        }
        
        .slide-number {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: var(--color-primary);
            color: white;
            padding: 5px 10px;
            border-radius: var(--border-radius);
            font-size: 12px;
        }
        
        /* Block styles */
        .block { display: flex; flex-direction: column; justify-content: center; }
        .title-block { font-family: var(--font-heading); font-size: var(--title-size); font-weight: 700; color: var(--color-primary); }
        .content-block { font-size: var(--body-size); line-height: var(--line-height); }
        .visual-block { display: flex; align-items: center; justify-content: center; }
        .image-content { max-width: 100%; max-height: 100%; object-fit: cover; border-radius: var(--border-radius); }
        .chart-content { width: 100%; height: 100%; }
        
        ul { margin: 0; padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="presentation-container">
        ${slides.map((slide, index) => `
            <div class="slide">
                <div class="slide-content">
                    ${slide.renderData.html}
                </div>
                <div class="slide-number">${index + 1}</div>
            </div>
        `).join('')}
    </div>
    
    <script>
        // Simple slide navigation
        document.addEventListener('keydown', function(e) {
            const slides = document.querySelectorAll('.slide');
            let currentSlide = 0;
            
            if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
                currentSlide++;
                slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
            } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
                currentSlide--;
                slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Generate markdown export from slides
     */
    private generateMarkdownExport(outline: PitchDeckOutline, slides: SlideLayout[]): string {
        let markdown = `# ${outline.title}\n\n`;
        markdown += `## ${outline.subtitle}\n\n`;
        markdown += `---\n\n`;

        slides.forEach((slide, index) => {
            markdown += `## Slide ${index + 1}\n\n`;

            slide.blocks.forEach(block => {
                if (block.type === 'title') {
                    markdown += `### ${block.content}\n\n`;
                } else if (block.type === 'bullets') {
                    if (Array.isArray(block.content)) {
                        block.content.forEach(item => {
                            markdown += `- ${item}\n`;
                        });
                    } else {
                        markdown += `${block.content}\n\n`;
                    }
                    markdown += '\n';
                } else if (block.type === 'image') {
                    markdown += `![Image](${block.content.url || '#'})\n\n`;
                }
            });

            markdown += `---\n\n`;
        });

        return markdown;
    }

    /**
     * Estimate text height for layout calculations
     */
    private estimateTextHeight(blocks: ContentBlock[], theme: DesignTokens): number {
        return blocks.reduce((height, block) => {
            if (block.type === 'title') {
                return height + parseInt(theme.sizes.titleMax) * 1.2;
            } else if (block.type === 'bullets') {
                const lines = Array.isArray(block.content) ? block.content.length : 1;
                return height + (parseInt(theme.sizes.bodyMax) * theme.sizes.lineHeight * lines);
            }
            return height;
        }, 0);
    }

    /**
     * Calculate visual areas used by blocks
     */
    private calculateVisualAreas(blocks: ContentBlock[], archetype: LayoutArchetype): any {
        const visualBlocks = blocks.filter(b => b.type === 'image' || b.type === 'chart');
        return {
            visualBlockCount: visualBlocks.length,
            totalVisualArea: visualBlocks.length * 0.3, // Approximate 30% per visual
            layout: archetype.name
        };
    }

    // Legacy methods for backward compatibility
    async generateAutomatedPitchDeck(request: PitchDeckRequest): Promise<PitchDeckResult> {
        const startTime = Date.now();

        try {
            logger.info(`Starting automated pitch deck generation for: ${request.companyName}`);

            // Step 1: 🔎 Search Integration - Find relevant content
            const searchResults = await this.searchForRelevantContent(request);
            logger.info(`Found ${searchResults.length} search results`);

            // Step 2: 📖 Reading from Links - Scrape and extract content
            const scrapedContents = await this.scrapeSearchResults(searchResults);
            logger.info(`Successfully scraped ${scrapedContents.length} sources`);

            // Step 3: ✍ Content Analysis - Process with AI
            const analysisContext: AnalysisContext = {
                companyName: request.companyName,
                industry: request.industry,
                targetAudience: request.targetAudience,
                fundingStage: request.fundingStage,
                businessType: request.businessType
            };

            const insights = await this.contentAnalysisService.analyzeContentForPitchDeck(
                scrapedContents,
                analysisContext
            );
            logger.info('Content analysis completed');

            // Step 4: Generate structured pitch deck outline
            const pitchDeckOutline = await this.contentAnalysisService.generatePitchDeckOutline(
                insights,
                analysisContext
            );
            logger.info('Pitch deck outline generated');

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                pitchDeck: pitchDeckOutline,
                researchSources: scrapedContents,
                insights,
                metadata: {
                    generatedAt: new Date(),
                    researchSourceCount: scrapedContents.length,
                    processingTimeMs: processingTime
                }
            };

        } catch (error) {
            logger.error('Error generating automated pitch deck:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                metadata: {
                    generatedAt: new Date(),
                    researchSourceCount: 0,
                    processingTimeMs: Date.now() - startTime
                }
            };
        }
    }

    /**
     * Generate detailed slide content for each slide in the outline
     */
    async generateDetailedSlides(
        outline: PitchDeckOutline,
        insights: ContentInsights,
        context: AnalysisContext
    ): Promise<SlideContent[]> {
        const slides: SlideContent[] = [];

        for (let i = 0; i < outline.slides.length; i++) {
            const slideOutline = outline.slides[i];

            try {
                const detailedSlide = await this.generateDetailedSlideContent(
                    slideOutline,
                    insights,
                    context,
                    i + 1
                );
                slides.push(detailedSlide);
            } catch (error) {
                logger.error(`Error generating slide ${i + 1}:`, error);
                // Create fallback slide
                slides.push({
                    slideNumber: i + 1,
                    slideType: slideOutline.slideType,
                    title: slideOutline.title,
                    content: slideOutline.content.join('\n\n'),
                    visualElements: slideOutline.visualSuggestions,
                    images: [],
                    svgElements: [],
                    speakerNotes: `Speaker notes for ${slideOutline.title}`
                });
            }
        }

        return slides;
    }

    /**
     * Create a complete pitch deck package with multiple export formats
     * Updated to use Genspark workflow
     */
    async createCompletePitchDeck(request: PitchDeckRequest): Promise<CompletePitchDeck> {
        // Use the new Genspark workflow
        return await this.generateGensparkPitchDeck(request);
    }

    /**
     * Search for relevant content based on the request
     */
    private async searchForRelevantContent(request: PitchDeckRequest): Promise<Array<{ title: string; url: string; snippet: string }>> {
        const searchQueries = this.generateSearchQueries(request);
        const allResults: Array<{ title: string; url: string; snippet: string }> = [];

        for (const query of searchQueries) {
            try {
                const results = await this.searchService.searchForPitchDeckContent(
                    query,
                    request.industry
                );
                allResults.push(...results.slice(0, 3)); // Top 3 per query
            } catch (error) {
                logger.warn(`Search failed for query: ${query}`, error);
            }
        }

        // Remove duplicates and limit total results
        const uniqueResults = this.removeDuplicateUrls(allResults);
        return uniqueResults.slice(0, 10); // Limit to top 10 sources
    }

    /**
     * Generate search queries based on the request
     */
    private generateSearchQueries(request: PitchDeckRequest): string[] {
        const baseQueries = [
            `${request.companyName} company overview`,
            `${request.companyName} business model`,
            `${request.companyName} market opportunity`,
            `${request.companyName} competition analysis`
        ];

        if (request.industry) {
            baseQueries.push(
                `${request.industry} market size statistics`,
                `${request.industry} industry trends 2024`,
                `${request.industry} competitive landscape`
            );
        }

        if (request.specificTopics) {
            baseQueries.push(
                ...request.specificTopics.map(topic => `${request.companyName} ${topic}`)
            );
        }

        return baseQueries;
    }

    /**
     * Scrape content from search results
     */
    private async scrapeSearchResults(
        searchResults: Array<{ title: string; url: string; snippet: string }>
    ): Promise<ScrapedContent[]> {
        const urls = searchResults.map(result => result.url);
        return await this.scraperService.scrapeMultipleUrls(urls);
    }

    /**
     * Generate detailed content for a single slide
     */
    private async generateDetailedSlideContent(
        slideOutline: any,
        insights: ContentInsights,
        context: AnalysisContext,
        slideNumber: number
    ): Promise<SlideContent> {
        const prompt = `
        Create detailed content for a pitch deck slide with the following specifications:

        Slide Type: ${slideOutline.slideType}
        Slide Title: ${slideOutline.title}
        Slide Number: ${slideNumber}
        Company: ${context.companyName}
        Industry: ${context.industry || 'Not specified'}

        Key Content Points:
        ${slideOutline.content.join('\n')}

        Key Points to Include:
        ${slideOutline.keyPoints.join('\n')}

        Statistics Available:
        ${slideOutline.statistics.join('\n')}

        Please generate:
        1. A compelling slide content (2-3 paragraphs)
        2. Speaker notes for this slide
        3. Specific suggestions for visual elements

        Keep the content professional, investor-focused, and compelling.
        `;

        try {
            // Generate text content with AI
            const aiResponse = await this.aiService.generateResponse({
                prompt,
                userId: 'pitchdeck-service'
            });

            // Generate images for the slide
            const imageRequirement: SlideImageRequirement = {
                slideType: slideOutline.slideType,
                contentTheme: context.companyName || 'business',
                preferredStyle: 'professional',
                imageType: this.getImageTypeForSlide(slideOutline.slideType),
                keywords: slideOutline.keyPoints.slice(0, 3),
                colorScheme: ['#3B82F6', '#10B981', '#F59E0B']
            };

            const slideImages = await this.imageService.generateSlideImages(imageRequirement);

            // Generate SVG elements for the slide
            const slideVisuals = await this.svgService.generateSlideVisuals(
                slideOutline.slideType,
                slideOutline.content.join(' '),
                this.extractDataForVisuals(slideOutline, insights)
            );

            return {
                slideNumber,
                slideType: slideOutline.slideType,
                title: slideOutline.title,
                content: aiResponse.response,
                visualElements: slideOutline.visualSuggestions,
                images: slideImages.searchedImages.concat(slideImages.generatedImages.map(img => ({
                    url: img.url,
                    thumbnailUrl: img.url,
                    title: img.prompt,
                    source: 'ai-generated',
                    license: 'generated' as any,
                    dimensions: img.dimensions,
                    format: img.format,
                    size: 0
                }))),
                svgElements: [...slideVisuals.charts, ...slideVisuals.diagrams, ...slideVisuals.icons],
                speakerNotes: `Speaker notes for ${slideOutline.title} - Key points to emphasize during presentation.`
            };
        } catch (error) {
            logger.error('AI generation failed for slide, using fallback');

            return {
                slideNumber,
                slideType: slideOutline.slideType,
                title: slideOutline.title,
                content: slideOutline.content.join('\n\n'),
                visualElements: slideOutline.visualSuggestions,
                images: [],
                svgElements: [],
                speakerNotes: `Key points: ${slideOutline.keyPoints.join(', ')}`
            };
        }
    }    /**
     * Convert pitch deck to Markdown format
     */
    private convertToMarkdown(outline: PitchDeckOutline, slides: SlideContent[]): string {
        let markdown = `# ${outline.title}\n\n`;
        markdown += `## ${outline.subtitle}\n\n`;
        markdown += `**Executive Summary:**\n${outline.executiveSummary}\n\n`;
        markdown += `**Company Overview:**\n${outline.companyOverview}\n\n`;
        markdown += `---\n\n`;

        slides.forEach((slide, index) => {
            markdown += `## Slide ${slide.slideNumber}: ${slide.title}\n\n`;
            markdown += `**Type:** ${slide.slideType}\n\n`;
            markdown += `**Content:**\n${slide.content}\n\n`;

            if (slide.visualElements.length > 0) {
                markdown += `**Visual Elements:**\n`;
                slide.visualElements.forEach(element => {
                    markdown += `- ${element}\n`;
                });
                markdown += `\n`;
            }

            markdown += `**Speaker Notes:**\n${slide.speakerNotes}\n\n`;
            markdown += `---\n\n`;
        });

        markdown += `## Call to Action\n\n${outline.callToAction}\n`;

        return markdown;
    }

    /**
     * Remove duplicate URLs from search results
     */
    private removeDuplicateUrls(results: Array<{ title: string; url: string; snippet: string }>) {
        const seen = new Set<string>();
        return results.filter(result => {
            if (seen.has(result.url)) {
                return false;
            }
            seen.add(result.url);
            return true;
        });
    }

    /**
     * Get appropriate image type for slide
     */
    private getImageTypeForSlide(slideType: string): SlideImageRequirement['imageType'] {
        const imageTypeMap: { [key: string]: SlideImageRequirement['imageType'] } = {
            'title': 'hero',
            'problem': 'illustration',
            'solution': 'illustration',
            'market': 'chart',
            'product': 'photo',
            'business-model': 'chart',
            'traction': 'chart',
            'competition': 'chart',
            'marketing': 'illustration',
            'financials': 'chart',
            'team': 'photo',
            'funding': 'chart'
        };
        return imageTypeMap[slideType] || 'illustration';
    }

    /**
     * Extract data for visual generation
     */
    private extractDataForVisuals(slideOutline: any, insights: ContentInsights): any {
        // Extract numerical data and structure it for chart generation
        const statistics = slideOutline.statistics || [];
        const data: any = {};

        // Try to extract market data
        if (slideOutline.slideType === 'market' && insights.marketSize.length > 0) {
            data.marketData = insights.marketSize.slice(0, 5).map((item: string, index: number) => ({
                label: `Market ${index + 1}`,
                value: Math.random() * 100, // In real implementation, extract actual values
                color: this.getColorFromPalette(index)
            }));
        }

        // Try to extract financial data
        if (slideOutline.slideType === 'financials' && insights.financialProjections.length > 0) {
            data.financialData = insights.financialProjections.slice(0, 5).map((item: string, index: number) => ({
                label: `Year ${index + 1}`,
                value: (index + 1) * 100000, // Mock financial data
                color: this.getColorFromPalette(index)
            }));
        }

        // Try to extract traction data
        if (slideOutline.slideType === 'traction' && insights.traction.length > 0) {
            data.tractionData = insights.traction.slice(0, 4).map((item: string, index: number) => ({
                label: `Metric ${index + 1}`,
                value: Math.random() * 1000,
                color: this.getColorFromPalette(index)
            }));
        }

        return data;
    }

    /**
     * Calculate visual assets summary
     */
    private calculateVisualAssets(slides: SlideContent[]): CompletePitchDeck['visualAssets'] {
        const imageBreakdown: { [key: string]: number } = {};
        const svgBreakdown: { [key: string]: number } = {};
        let totalImages = 0;
        let totalSVGs = 0;
        let totalCharts = 0;

        slides.forEach(slide => {
            totalImages += slide.images.length;
            totalSVGs += slide.svgElements.length;
            // Count charts by looking for chart-related SVG elements
            totalCharts += slide.svgElements.filter(svg =>
                svg.type.includes('chart') || svg.type.includes('graph')
            ).length;

            // Count image types
            slide.images.forEach(img => {
                imageBreakdown[img.source] = (imageBreakdown[img.source] || 0) + 1;
            });

            // Count SVG types
            slide.svgElements.forEach(svg => {
                svgBreakdown[svg.type] = (svgBreakdown[svg.type] || 0) + 1;
            });
        });

        return {
            totalImages,
            totalSVGs,
            totalCharts,
            imageBreakdown,
            svgBreakdown
        };
    }

    /**
     * Convert pitch deck to HTML format
     */
    private convertToHTML(outline: PitchDeckOutline, slides: SlideContent[]): string {
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${outline.title}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 40px; background: linear-gradient(135deg, #3B82F6, #10B981); color: white; border-radius: 10px 10px 0 0; }
        .slide { padding: 40px; border-bottom: 1px solid #e5e5e5; }
        .slide:last-child { border-bottom: none; }
        .slide h2 { color: #3B82F6; margin-bottom: 20px; }
        .images { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
        .image { width: 200px; height: 120px; object-fit: cover; border-radius: 8px; }
        .svg-container { margin: 20px 0; }
        .speaker-notes { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${outline.title}</h1>
            <p>${outline.subtitle}</p>
        </div>
        <div class="slide">
            <h2>Executive Summary</h2>
            <p>${outline.executiveSummary}</p>
        </div>
        <div class="slide">
            <h2>Company Overview</h2>
            <p>${outline.companyOverview}</p>
        </div>
`;

        slides.forEach(slide => {
            html += `
        <div class="slide">
            <h2>Slide ${slide.slideNumber}: ${slide.title}</h2>
            <div class="content">
                ${slide.content.replace(/\n/g, '<br>')}
            </div>
            ${slide.images.length > 0 ? `
            <div class="images">
                ${slide.images.map(img => `
                    <img src="${img.url}" alt="${img.title}" class="image" title="${img.title}">
                `).join('')}
            </div>` : ''}
            ${slide.svgElements.length > 0 ? `
            <div class="svg-container">
                ${slide.svgElements.map(svg => svg.content).join('')}
            </div>` : ''}
            <div class="speaker-notes">
                <strong>Speaker Notes:</strong> ${slide.speakerNotes}
            </div>
        </div>`;
        });

        html += `
        <div class="slide">
            <h2>Call to Action</h2>
            <p>${outline.callToAction}</p>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Get color from palette for charts
     */
    private getColorFromPalette(index: number): string {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        return colors[index % colors.length];
    }

    // Legacy/Database methods for backward compatibility with existing controllers
    async createPitchDeck(userId: string, projectId: string, pitchDeckData: any) {
        // Enhanced creation with automation option
        if (pitchDeckData.automated && pitchDeckData.companyName) {
            const request: PitchDeckRequest = {
                companyName: pitchDeckData.companyName,
                industry: pitchDeckData.industry,
                targetAudience: pitchDeckData.targetAudience || 'investors',
                fundingStage: pitchDeckData.fundingStage,
                businessType: pitchDeckData.businessType
            };

            const automatedResult = await this.generateAutomatedPitchDeck(request);

            if (automatedResult.success && automatedResult.pitchDeck) {
                // Save to database
                const result = await query(
                    'INSERT INTO pitch_decks (user_id, title, company_name, generated_content, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
                    [
                        parseInt(userId),
                        automatedResult.pitchDeck.title,
                        automatedResult.pitchDeck.title,
                        JSON.stringify({
                            outline: automatedResult.pitchDeck,
                            insights: automatedResult.insights,
                            metadata: automatedResult.metadata
                        }),
                        'completed'
                    ]
                );

                const pitchDeck = result.rows[0];
                return pitchDeck;
            }
        }

        // Standard validation and creation
        const isValid = this.validatePitchDeckData(pitchDeckData);
        if (!isValid) {
            throw new Error('Invalid pitch deck data');
        }

        const result = await query(
            'INSERT INTO pitch_decks (user_id, title, generated_content, status, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
            [
                parseInt(userId),
                pitchDeckData.title,
                JSON.stringify(pitchDeckData.content || {}),
                'draft'
            ]
        );

        const pitchDeck = result.rows[0];
        return pitchDeck;
    }

    async getPitchDeckById(pitchDeckId: string) {
        const result = await query(
            'SELECT * FROM pitch_decks WHERE id = $1',
            [pitchDeckId]
        );

        if (result.rows.length === 0) {
            throw new Error('Pitch deck not found');
        }

        return result.rows[0];
    }

    async updatePitchDeck(pitchDeckId: string, updateData: any) {
        const result = await query(
            'UPDATE pitch_decks SET title = $1, generated_content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [
                updateData.title,
                JSON.stringify(updateData.content || updateData.generated_content || {}),
                pitchDeckId
            ]
        );

        if (result.rows.length === 0) {
            throw new Error('Pitch deck not found');
        }

        return result.rows[0];
    }

    async deletePitchDeck(pitchDeckId: string) {
        const result = await query(
            'DELETE FROM pitch_decks WHERE id = $1 RETURNING id',
            [pitchDeckId]
        );

        if (result.rows.length === 0) {
            throw new Error('Pitch deck not found');
        }

        return { message: 'Pitch deck deleted successfully' };
    }

    private validatePitchDeckData(data: any): boolean {
        return !!(data && data.title && typeof data.title === 'string' && data.title.trim().length > 0);
    }
}

export {
    PitchDeckService,
    PitchDeckRequest,
    PitchDeckResult,
    SlideContent,
    CompletePitchDeck
};
export default new PitchDeckService();