import { Request, Response } from 'express';
import PitchDeckService, { PitchDeckRequest } from '../services/pitchdeck.service';
import { AuthenticatedRequest } from '../types/api.types';
import { logger } from '../utils/logger';

class PitchDeckController {
    public async createPitchDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const pitchDeckData = req.body;
            const userId = req.user?.id || '1'; // Default user ID for testing
            const projectId = pitchDeckData.projectId || '1'; // Default project ID

            const newPitchDeck = await PitchDeckService.createPitchDeck(userId, projectId, pitchDeckData);
            res.status(201).json(newPitchDeck);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error creating pitch deck', error: errorMessage });
        }
    }

    /**
     * Generate automated pitch deck using AI and web research
     */
    public async generateAutomatedPitchDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {
                companyName,
                industry,
                targetAudience,
                fundingStage,
                businessType,
                specificTopics,
                researchDepth
            } = req.body;

            if (!companyName) {
                res.status(400).json({
                    message: 'Company name is required',
                    error: 'Missing required field: companyName'
                });
                return;
            }

            const request: PitchDeckRequest = {
                companyName,
                industry,
                targetAudience: targetAudience || 'investors',
                fundingStage,
                businessType,
                specificTopics,
                researchDepth: researchDepth || 'comprehensive'
            };

            logger.info(`Starting automated pitch deck generation for: ${companyName}`);

            const result = await PitchDeckService.generateAutomatedPitchDeck(request);

            if (result.success) {
                res.status(200).json({
                    message: 'Automated pitch deck generated successfully',
                    result
                });
            } else {
                res.status(500).json({
                    message: 'Failed to generate automated pitch deck',
                    error: result.error,
                    metadata: result.metadata
                });
            }

        } catch (error) {
            logger.error('Error in automated pitch deck generation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({
                message: 'Error generating automated pitch deck',
                error: errorMessage
            });
        }
    }

    /**
     * Create complete pitch deck package with detailed slides and export formats
     */
    public async createCompletePitchDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {
                companyName,
                industry,
                targetAudience,
                fundingStage,
                businessType,
                specificTopics,
                researchDepth
            } = req.body;

            if (!companyName) {
                res.status(400).json({
                    message: 'Company name is required',
                    error: 'Missing required field: companyName'
                });
                return;
            }

            const request: PitchDeckRequest = {
                companyName,
                industry,
                targetAudience: targetAudience || 'investors',
                fundingStage,
                businessType,
                specificTopics,
                researchDepth: researchDepth || 'comprehensive'
            };

            logger.info(`Creating complete pitch deck package for: ${companyName}`);

            const completePitchDeck = await PitchDeckService.createCompletePitchDeck(request);

            res.status(200).json({
                message: 'Complete pitch deck package created successfully',
                data: {
                    outline: completePitchDeck.outline,
                    slideCount: completePitchDeck.slides.length,
                    slides: completePitchDeck.slides,
                    visualAssets: completePitchDeck.visualAssets,
                    exportFormats: {
                        json: completePitchDeck.exportFormats.json.length,
                        markdown: completePitchDeck.exportFormats.markdown.length,
                        html: completePitchDeck.exportFormats.html.length,
                        powerpoint: completePitchDeck.exportFormats.powerpoint
                    }
                },
                exports: completePitchDeck.exportFormats
            });

        } catch (error) {
            logger.error('Error creating complete pitch deck:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({
                message: 'Error creating complete pitch deck package',
                error: errorMessage
            });
        }
    }

    /**
     * Get research insights for a company
     */
    public async getResearchInsights(req: Request, res: Response): Promise<void> {
        try {
            const { companyName, industry } = req.query;

            if (!companyName) {
                res.status(400).json({
                    message: 'Company name is required',
                    error: 'Missing required parameter: companyName'
                });
                return;
            }

            const request: PitchDeckRequest = {
                companyName: companyName as string,
                industry: industry as string,
                researchDepth: 'basic'
            };

            // Generate insights without full pitch deck
            const result = await PitchDeckService.generateAutomatedPitchDeck(request);

            if (result.success) {
                res.status(200).json({
                    message: 'Research insights generated successfully',
                    data: {
                        companyName,
                        industry,
                        insights: result.insights,
                        sources: result.researchSources?.map(source => ({
                            url: source.url,
                            title: source.title,
                            keyPoints: source.keyPoints.slice(0, 3),
                            statistics: source.statistics.slice(0, 3)
                        })),
                        metadata: result.metadata
                    }
                });
            } else {
                res.status(500).json({
                    message: 'Failed to generate research insights',
                    error: result.error
                });
            }

        } catch (error) {
            logger.error('Error generating research insights:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({
                message: 'Error generating research insights',
                error: errorMessage
            });
        }
    }

    public async getPitchDeck(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const pitchDeck = await PitchDeckService.getPitchDeckById(id);
            if (pitchDeck) {
                res.status(200).json(pitchDeck);
            } else {
                res.status(404).json({ message: 'Pitch deck not found' });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error retrieving pitch deck', error: errorMessage });
        }
    }

    public async updatePitchDeck(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const pitchDeckData = req.body;
            const updatedPitchDeck = await PitchDeckService.updatePitchDeck(id, pitchDeckData);
            if (updatedPitchDeck) {
                res.status(200).json(updatedPitchDeck);
            } else {
                res.status(404).json({ message: 'Pitch deck not found' });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error updating pitch deck', error: errorMessage });
        }
    }

    /**
     * Generate images for a specific slide or topic
     */
    public async generateSlideImages(req: Request, res: Response): Promise<void> {
        try {
            const { slideType, contentTheme, keywords, preferredStyle = 'professional' } = req.body;

            if (!slideType || !contentTheme) {
                res.status(400).json({
                    message: 'Slide type and content theme are required',
                    error: 'Missing required fields: slideType, contentTheme'
                });
                return;
            }

            const imageRequirement = {
                slideType,
                contentTheme,
                preferredStyle,
                imageType: 'illustration' as any,
                keywords: keywords || [contentTheme]
            };

            // Note: This would use ImageService in a real implementation
            // For now, returning mock data
            const mockImages = [
                {
                    url: `https://picsum.photos/1200/800?random=${Date.now()}`,
                    thumbnailUrl: `https://picsum.photos/300/200?random=${Date.now()}`,
                    title: `${contentTheme} - Professional Image`,
                    source: 'unsplash.com',
                    license: 'creative-commons',
                    dimensions: { width: 1200, height: 800 },
                    format: 'jpg',
                    size: 0
                }
            ];

            res.status(200).json({
                message: 'Images generated successfully',
                data: {
                    searchedImages: mockImages,
                    generatedImages: [],
                    recommendations: [
                        `Generated images for ${slideType} slide`,
                        'Consider using the high-resolution images for better visual impact',
                        'Images are optimized for presentation format'
                    ]
                }
            });

        } catch (error) {
            logger.error('Error generating slide images:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({
                message: 'Error generating slide images',
                error: errorMessage
            });
        }
    }

    /**
     * Generate SVG charts and diagrams
     */
    public async generateSVGVisuals(req: Request, res: Response): Promise<void> {
        try {
            const { slideType, chartType, data, title } = req.body;

            if (!slideType) {
                res.status(400).json({
                    message: 'Slide type is required',
                    error: 'Missing required field: slideType'
                });
                return;
            }

            // Note: This would use SVGService in a real implementation
            // For now, returning mock SVG data
            const mockSVG = {
                type: 'chart',
                content: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                    <title>${title || 'Sample Chart'}</title>
                    <rect x="50" y="50" width="300" height="200" fill="#f0f0f0" stroke="#ccc" rx="10"/>
                    <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
                        ${chartType || 'Chart'} Placeholder
                    </text>
                </svg>`,
                title: title || 'Sample Chart',
                description: `${chartType || 'Chart'} for ${slideType} slide`,
                dimensions: { width: 400, height: 300 },
                colorScheme: ['#3B82F6', '#10B981', '#F59E0B'],
                metadata: {
                    generatedAt: new Date(),
                    prompt: `Generate ${chartType} for ${slideType}`,
                    style: 'professional'
                }
            };

            res.status(200).json({
                message: 'SVG visuals generated successfully',
                data: {
                    charts: chartType ? [mockSVG] : [],
                    diagrams: chartType === 'diagram' ? [mockSVG] : [],
                    icons: [],
                    recommendations: [
                        `Generated ${chartType || 'visual'} for ${slideType} slide`,
                        'SVG graphics are scalable and perfect for presentations',
                        'Consider adding color schemes that match your brand'
                    ]
                }
            });

        } catch (error) {
            logger.error('Error generating SVG visuals:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({
                message: 'Error generating SVG visuals',
                error: errorMessage
            });
        }
    }

    /**
     * Generate pitch deck using Genspark-style workflow
     */
    public async generateGensparkPitchDeck(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {
                companyName,
                industry,
                targetAudience,
                fundingStage,
                businessType,
                specificTopics,
                researchDepth,
                theme
            } = req.body;

            if (!companyName) {
                res.status(400).json({
                    message: 'Company name is required',
                    error: 'Missing required field: companyName'
                });
                return;
            }

            const request: PitchDeckRequest = {
                companyName,
                industry,
                targetAudience: targetAudience || 'investors',
                fundingStage,
                businessType,
                specificTopics,
                researchDepth: researchDepth || 'comprehensive',
                theme: theme || 'modern'
            };

            logger.info(`Starting Genspark-style pitch deck generation for: ${companyName}`);

            const completePitchDeck = await PitchDeckService.generateGensparkPitchDeck(request);

            res.status(200).json({
                message: 'Genspark-style pitch deck generated successfully',
                data: {
                    outline: completePitchDeck.outline,
                    slideCount: completePitchDeck.slides.length,
                    slides: completePitchDeck.slides,
                    visualAssets: completePitchDeck.visualAssets,
                    exportFormats: {
                        json: completePitchDeck.exportFormats.json.length,
                        markdown: completePitchDeck.exportFormats.markdown.length,
                        html: completePitchDeck.exportFormats.html.length,
                        powerpoint: completePitchDeck.exportFormats.powerpoint
                    }
                },
                exports: completePitchDeck.exportFormats
            });

        } catch (error) {
            logger.error('Error generating Genspark-style pitch deck:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({
                message: 'Error generating Genspark-style pitch deck',
                error: errorMessage
            });
        }
    }

    public async deletePitchDeck(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await PitchDeckService.deletePitchDeck(id);
            res.status(200).json(result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            if (errorMessage.includes('not found')) {
                res.status(404).json({ message: 'Pitch deck not found' });
            } else {
                res.status(500).json({ message: 'Error deleting pitch deck', error: errorMessage });
            }
        }
    }
}

export const pitchDeckController = new PitchDeckController();