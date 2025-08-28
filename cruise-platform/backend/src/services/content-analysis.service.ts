import AIService from './ai.service';
import { ScrapedContent } from './scraper.service';
import { logger } from '../utils/logger';

interface ContentInsights {
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

interface PitchDeckOutline {
    title: string;
    subtitle: string;
    slides: Array<{
        slideType: string;
        title: string;
        content: string[];
        keyPoints: string[];
        statistics: string[];
        visualSuggestions: string[];
    }>;
    executiveSummary: string;
    companyOverview: string;
    callToAction: string;
}

interface AnalysisContext {
    companyName?: string;
    industry?: string;
    targetAudience?: string;
    fundingStage?: string;
    businessType?: string;
}

class ContentAnalysisService {
    private aiService = AIService;

    constructor() {
        // AIService is already instantiated as default export
    }

    /**
     * Analyze scraped content and extract pitch deck insights
     */
    async analyzeContentForPitchDeck(
        scrapedContents: ScrapedContent[],
        context: AnalysisContext = {}
    ): Promise<ContentInsights> {
        try {
            logger.info('Starting content analysis for pitch deck generation');

            const combinedContent = this.combineAndCleanContent(scrapedContents);
            const insights = await this.extractBusinessInsights(combinedContent, context);

            return insights;
        } catch (error) {
            logger.error('Error analyzing content:', error);
            throw new Error('Failed to analyze content for pitch deck generation');
        }
    }

    /**
     * Generate a complete pitch deck outline based on analyzed content
     */
    async generatePitchDeckOutline(
        insights: ContentInsights,
        context: AnalysisContext = {}
    ): Promise<PitchDeckOutline> {
        try {
            logger.info('Generating pitch deck outline');

            const slideTemplates = this.getPitchDeckSlideTemplates();
            const slides = await this.populateSlideTemplates(slideTemplates, insights, context);

            const title = this.generateTitle(context);
            const subtitle = this.generateSubtitle(insights, context);
            const executiveSummary = await this.generateExecutiveSummary(insights, context);
            const companyOverview = await this.generateCompanyOverview(insights, context);
            const callToAction = this.generateCallToAction(context);

            return {
                title,
                subtitle,
                slides,
                executiveSummary,
                companyOverview,
                callToAction
            };
        } catch (error) {
            logger.error('Error generating pitch deck outline:', error);
            throw new Error('Failed to generate pitch deck outline');
        }
    }

    /**
     * Combine and clean content from multiple sources
     */
    private combineAndCleanContent(scrapedContents: ScrapedContent[]): string {
        return scrapedContents
            .map(content => {
                // Combine title, content, and key points
                const sections = [
                    content.title,
                    content.content,
                    ...content.keyPoints,
                    ...content.statistics,
                    ...content.facts
                ];
                return sections.join('\n');
            })
            .join('\n\n---\n\n') // Separate different sources
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Extract business insights using AI analysis
     */
    private async extractBusinessInsights(
        content: string,
        context: AnalysisContext
    ): Promise<ContentInsights> {
        const prompt = `
        Analyze the following content and extract key business insights for a pitch deck presentation:

        Company Context:
        - Company: ${context.companyName || 'Not specified'}
        - Industry: ${context.industry || 'Not specified'}
        - Target Audience: ${context.targetAudience || 'Investors'}
        - Funding Stage: ${context.fundingStage || 'Not specified'}

        Content to analyze:
        ${content.substring(0, 8000)} // Limit content length for AI processing

        Please extract and categorize the following insights:

        1. Market Size & Opportunity
        2. Competitive Advantage
        3. Problem Statement
        4. Solution
        5. Business Model
        6. Target Market
        7. Financial Projections
        8. Team Credentials
        9. Traction & Validation
        10. Risks & Mitigation
        11. Key Metrics & KPIs
        12. Industry Trends

        Format the response as a JSON object with arrays for each category.
        Focus on concrete, actionable insights that would be compelling in a pitch deck.
        Include specific numbers, statistics, and data points where available.
        `;

        try {
            const aiResponse = await this.aiService.generateResponse({
                prompt,
                userId: 'content-analysis-service'
            });

            // Try to parse AI response as JSON, fallback to structured parsing
            try {
                return JSON.parse(aiResponse.response);
            } catch {
                return this.parseAIResponseToInsights(aiResponse.response);
            }
        } catch (error) {
            logger.warn('AI analysis failed, using fallback content extraction');
            return this.extractInsightsFallback(content);
        }
    }

    /**
     * Parse AI response to insights structure
     */
    private parseAIResponseToInsights(response: string): ContentInsights {
        const insights: ContentInsights = {
            marketSize: [],
            competitiveAdvantage: [],
            problemStatement: [],
            solution: [],
            businessModel: [],
            targetMarket: [],
            financialProjections: [],
            teamCredentials: [],
            traction: [],
            risks: [],
            keyMetrics: [],
            industryTrends: []
        };

        // Simple parsing logic for structured AI responses
        const sections = response.split(/\d+\./);

        sections.forEach(section => {
            const lowerSection = section.toLowerCase();
            const lines = section.split('\n').filter(line => line.trim().length > 0);

            if (lowerSection.includes('market size') || lowerSection.includes('opportunity')) {
                insights.marketSize.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('competitive') || lowerSection.includes('advantage')) {
                insights.competitiveAdvantage.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('problem')) {
                insights.problemStatement.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('solution')) {
                insights.solution.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('business model')) {
                insights.businessModel.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('target market')) {
                insights.targetMarket.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('financial') || lowerSection.includes('projection')) {
                insights.financialProjections.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('team')) {
                insights.teamCredentials.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('traction') || lowerSection.includes('validation')) {
                insights.traction.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('risk')) {
                insights.risks.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('metric') || lowerSection.includes('kpi')) {
                insights.keyMetrics.push(...lines.slice(1, 4));
            } else if (lowerSection.includes('trend')) {
                insights.industryTrends.push(...lines.slice(1, 4));
            }
        });

        return insights;
    }

    /**
     * Fallback insight extraction without AI
     */
    private extractInsightsFallback(content: string): ContentInsights {
        const lines = content.split('\n').filter(line => line.trim().length > 10);

        return {
            marketSize: this.extractByKeywords(lines, ['market', 'size', '$', 'billion', 'revenue']),
            competitiveAdvantage: this.extractByKeywords(lines, ['advantage', 'unique', 'differentiate', 'better']),
            problemStatement: this.extractByKeywords(lines, ['problem', 'challenge', 'pain', 'issue']),
            solution: this.extractByKeywords(lines, ['solution', 'solve', 'address', 'approach']),
            businessModel: this.extractByKeywords(lines, ['model', 'revenue', 'subscription', 'pricing']),
            targetMarket: this.extractByKeywords(lines, ['customer', 'user', 'demographic', 'segment']),
            financialProjections: this.extractByKeywords(lines, ['projection', 'forecast', 'growth', 'revenue']),
            teamCredentials: this.extractByKeywords(lines, ['team', 'founder', 'experience', 'background']),
            traction: this.extractByKeywords(lines, ['user', 'customer', 'growth', 'adoption']),
            risks: this.extractByKeywords(lines, ['risk', 'challenge', 'threat', 'concern']),
            keyMetrics: this.extractByKeywords(lines, ['metric', 'kpi', '%', 'growth', 'conversion']),
            industryTrends: this.extractByKeywords(lines, ['trend', 'future', 'emerging', 'direction'])
        };
    }

    /**
     * Extract content by keywords
     */
    private extractByKeywords(lines: string[], keywords: string[]): string[] {
        return lines
            .filter(line => {
                const lowerLine = line.toLowerCase();
                return keywords.some(keyword => lowerLine.includes(keyword));
            })
            .slice(0, 5); // Limit to top 5 matches
    }

    /**
     * Get standard pitch deck slide templates
     */
    private getPitchDeckSlideTemplates(): Array<{
        slideType: string;
        title: string;
        contentType: keyof ContentInsights;
        description: string;
    }> {
        return [
            { slideType: 'title', title: 'Company Introduction', contentType: 'solution', description: 'Company name, tagline, and mission' },
            { slideType: 'problem', title: 'Problem Statement', contentType: 'problemStatement', description: 'The problem you are solving' },
            { slideType: 'solution', title: 'Our Solution', contentType: 'solution', description: 'How you solve the problem' },
            { slideType: 'market', title: 'Market Opportunity', contentType: 'marketSize', description: 'Market size and opportunity' },
            { slideType: 'product', title: 'Product Overview', contentType: 'solution', description: 'Product features and benefits' },
            { slideType: 'business-model', title: 'Business Model', contentType: 'businessModel', description: 'How you make money' },
            { slideType: 'traction', title: 'Traction & Validation', contentType: 'traction', description: 'Proof of concept and early results' },
            { slideType: 'competition', title: 'Competitive Analysis', contentType: 'competitiveAdvantage', description: 'Competitive landscape and advantages' },
            { slideType: 'marketing', title: 'Go-to-Market Strategy', contentType: 'targetMarket', description: 'How you will reach customers' },
            { slideType: 'financials', title: 'Financial Projections', contentType: 'financialProjections', description: 'Revenue projections and key metrics' },
            { slideType: 'team', title: 'Team', contentType: 'teamCredentials', description: 'Key team members and expertise' },
            { slideType: 'funding', title: 'Funding Request', contentType: 'financialProjections', description: 'Investment ask and use of funds' }
        ];
    }

    /**
     * Populate slide templates with content insights
     */
    private async populateSlideTemplates(
        templates: Array<any>,
        insights: ContentInsights,
        context: AnalysisContext
    ): Promise<PitchDeckOutline['slides']> {
        const slides = [];

        for (const template of templates) {
            const relevantInsights = insights[template.contentType as keyof ContentInsights] || [];

            const slide = {
                slideType: template.slideType,
                title: template.title,
                content: relevantInsights.slice(0, 3), // Top 3 insights
                keyPoints: this.generateKeyPoints(relevantInsights, template.slideType),
                statistics: this.extractStatisticsFromInsights(relevantInsights),
                visualSuggestions: this.generateVisualSuggestions(template.slideType)
            };

            slides.push(slide);
        }

        return slides;
    }

    /**
     * Generate key points for a slide
     */
    private generateKeyPoints(insights: string[], slideType: string): string[] {
        return insights
            .filter(insight => insight.length > 20 && insight.length < 150)
            .map(insight => insight.trim())
            .slice(0, 4); // Max 4 key points per slide
    }

    /**
     * Extract statistics from insights
     */
    private extractStatisticsFromInsights(insights: string[]): string[] {
        const stats: string[] = [];
        const content = insights.join(' ');

        const patterns = [
            /\$[\d,.]+ (?:billion|million|thousand|M|B|K)/gi,
            /\d+(?:\.\d+)?%/gi,
            /\d+(?:,\d{3})*/gi
        ];

        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                stats.push(...matches.slice(0, 3));
            }
        });

        return [...new Set(stats)];
    }

    /**
     * Generate visual suggestions for each slide type
     */
    private generateVisualSuggestions(slideType: string): string[] {
        const visualMap: { [key: string]: string[] } = {
            'title': ['Company logo', 'Hero image', 'Clean typography'],
            'problem': ['Problem illustration', 'Pain point icons', 'Before/after comparison'],
            'solution': ['Product screenshots', 'Solution diagram', 'Feature highlights'],
            'market': ['Market size chart', 'TAM/SAM/SOM diagram', 'Growth trajectory'],
            'product': ['Product demo', 'User interface', 'Feature comparison'],
            'business-model': ['Revenue model diagram', 'Pricing tiers', 'Unit economics'],
            'traction': ['Growth charts', 'User metrics', 'Milestone timeline'],
            'competition': ['Competitive matrix', 'Positioning map', 'Advantage comparison'],
            'marketing': ['Customer journey', 'Channel strategy', 'Acquisition funnel'],
            'financials': ['Revenue projections', 'Key metrics dashboard', 'ROI charts'],
            'team': ['Team photos', 'Credential highlights', 'Organization chart'],
            'funding': ['Use of funds chart', 'Investment timeline', 'Valuation comparison']
        };

        return visualMap[slideType] || ['Charts and graphs', 'Supporting visuals', 'Data visualization'];
    }

    /**
     * Generate presentation title
     */
    private generateTitle(context: AnalysisContext): string {
        if (context.companyName) {
            return `${context.companyName} - Investor Presentation`;
        }
        return 'Company Investor Presentation';
    }

    /**
     * Generate presentation subtitle
     */
    private generateSubtitle(insights: ContentInsights, context: AnalysisContext): string {
        const solutions = insights.solution.slice(0, 1);
        if (solutions.length > 0 && solutions[0]) {
            return solutions[0].substring(0, 80) + (solutions[0].length > 80 ? '...' : '');
        }
        return `Revolutionizing ${context.industry || 'the Market'} - Investment Opportunity`;
    }

    /**
     * Generate executive summary using AI
     */
    private async generateExecutiveSummary(insights: ContentInsights, context: AnalysisContext): Promise<string> {
        const keyInsights = [
            ...insights.problemStatement.slice(0, 1),
            ...insights.solution.slice(0, 1),
            ...insights.marketSize.slice(0, 1),
            ...insights.traction.slice(0, 1)
        ].join(' ');

        const prompt = `Create a compelling executive summary for a pitch deck based on these key insights: ${keyInsights}. Keep it under 200 words and focus on the investment opportunity.`;

        try {
            const aiResponse = await this.aiService.generateResponse({
                prompt,
                userId: 'content-analysis-service'
            });
            return aiResponse.response;
        } catch {
            return `${context.companyName || 'Our company'} addresses a significant market opportunity in ${context.industry || 'the industry'} with an innovative solution that has shown strong early traction and is ready for the next stage of growth.`;
        }
    }

    /**
     * Generate company overview
     */
    private async generateCompanyOverview(insights: ContentInsights, context: AnalysisContext): Promise<string> {
        const overview = [
            ...insights.solution.slice(0, 2),
            ...insights.targetMarket.slice(0, 1)
        ].join(' ');

        return overview || `${context.companyName || 'Our company'} is a ${context.industry || 'technology'} company focused on delivering innovative solutions to the market.`;
    }

    /**
     * Generate call to action
     */
    private generateCallToAction(context: AnalysisContext): string {
        return `Join us in revolutionizing ${context.industry || 'the industry'}. Let's discuss how you can be part of our growth story.`;
    }
}

export { ContentAnalysisService, ContentInsights, PitchDeckOutline, AnalysisContext };
export default new ContentAnalysisService();
