import AIService from './ai.service';
import { logger } from '../utils/logger';

interface SVGElement {
    type: 'chart' | 'diagram' | 'icon' | 'illustration' | 'infographic';
    content: string;
    title: string;
    description: string;
    dimensions: {
        width: number;
        height: number;
    };
    colorScheme: string[];
    metadata: {
        generatedAt: Date;
        prompt: string;
        style: string;
    };
}

interface ChartData {
    type: 'pie' | 'bar' | 'line' | 'area' | 'doughnut' | 'timeline' | 'funnel';
    data: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    title: string;
    subtitle?: string;
    units?: string;
}

interface DiagramSpec {
    type: 'flowchart' | 'org-chart' | 'process' | 'comparison' | 'hierarchy' | 'journey';
    elements: Array<{
        id: string;
        label: string;
        type: 'box' | 'circle' | 'diamond' | 'arrow' | 'connector';
        position?: { x: number; y: number };
        connections?: string[];
        style?: string;
    }>;
    title: string;
}

interface IconRequest {
    category: 'business' | 'technology' | 'finance' | 'marketing' | 'team' | 'growth';
    style: 'outline' | 'filled' | 'minimal' | 'detailed';
    size: number;
    color: string;
    theme: string;
}

class SVGService {
    private aiService = AIService;

    /**
     * Generate SVG charts from data
     */
    async generateChart(chartData: ChartData, style: string = 'professional'): Promise<SVGElement> {
        try {
            let svgContent = '';

            switch (chartData.type) {
                case 'pie':
                    svgContent = this.generatePieChart(chartData, style);
                    break;
                case 'bar':
                    svgContent = this.generateBarChart(chartData, style);
                    break;
                case 'line':
                    svgContent = this.generateLineChart(chartData, style);
                    break;
                case 'doughnut':
                    svgContent = this.generateDoughnutChart(chartData, style);
                    break;
                case 'timeline':
                    svgContent = this.generateTimelineChart(chartData, style);
                    break;
                case 'funnel':
                    svgContent = this.generateFunnelChart(chartData, style);
                    break;
                default:
                    svgContent = this.generateBarChart(chartData, style);
            }

            return {
                type: 'chart',
                content: svgContent,
                title: chartData.title,
                description: `${chartData.type} chart showing ${chartData.title}`,
                dimensions: { width: 800, height: 400 },
                colorScheme: this.extractColors(svgContent),
                metadata: {
                    generatedAt: new Date(),
                    prompt: `Generate ${chartData.type} chart for ${chartData.title}`,
                    style
                }
            };

        } catch (error) {
            logger.error('Error generating SVG chart:', error);
            throw new Error('Failed to generate SVG chart');
        }
    }

    /**
     * Generate SVG diagrams using AI
     */
    async generateDiagram(spec: DiagramSpec, style: string = 'modern'): Promise<SVGElement> {
        try {
            const prompt = `
            Generate an SVG diagram with the following specifications:
            
            Type: ${spec.type}
            Title: ${spec.title}
            Style: ${style}
            Elements: ${JSON.stringify(spec.elements, null, 2)}
            
            Requirements:
            - Create clean, professional SVG code
            - Use appropriate colors and styling
            - Ensure text is readable
            - Make it scalable and responsive
            - Include proper spacing and alignment
            - Use modern design principles
            
            Return only the SVG code without any explanation.
            `;

            const aiResponse = await this.aiService.generateResponse({
                prompt,
                userId: 'svg-service'
            });

            // Extract SVG content from AI response
            let svgContent = this.extractSVGFromResponse(aiResponse.response);

            // If AI doesn't return valid SVG, generate a fallback
            if (!svgContent.includes('<svg')) {
                svgContent = this.generateFallbackDiagram(spec, style);
            }

            return {
                type: 'diagram',
                content: svgContent,
                title: spec.title,
                description: `${spec.type} diagram for ${spec.title}`,
                dimensions: { width: 800, height: 600 },
                colorScheme: this.extractColors(svgContent),
                metadata: {
                    generatedAt: new Date(),
                    prompt,
                    style
                }
            };

        } catch (error) {
            logger.error('Error generating SVG diagram:', error);
            // Return fallback diagram
            return {
                type: 'diagram',
                content: this.generateFallbackDiagram(spec, style),
                title: spec.title,
                description: `${spec.type} diagram for ${spec.title}`,
                dimensions: { width: 800, height: 600 },
                colorScheme: ['#3B82F6', '#10B981', '#F59E0B'],
                metadata: {
                    generatedAt: new Date(),
                    prompt: 'Fallback diagram generation',
                    style
                }
            };
        }
    }

    /**
     * Generate SVG icons
     */
    async generateIcon(request: IconRequest): Promise<SVGElement> {
        try {
            const iconSVG = this.generateIconSVG(request);

            return {
                type: 'icon',
                content: iconSVG,
                title: `${request.category} Icon`,
                description: `${request.style} style ${request.category} icon`,
                dimensions: { width: request.size, height: request.size },
                colorScheme: [request.color],
                metadata: {
                    generatedAt: new Date(),
                    prompt: `Generate ${request.category} icon in ${request.style} style`,
                    style: request.style
                }
            };

        } catch (error) {
            logger.error('Error generating SVG icon:', error);
            throw new Error('Failed to generate SVG icon');
        }
    }

    /**
     * Generate comprehensive slide visuals (combination of charts, diagrams, and icons)
     */
    async generateSlideVisuals(
        slideType: string,
        content: string,
        data?: any
    ): Promise<{
        charts: SVGElement[];
        diagrams: SVGElement[];
        icons: SVGElement[];
        recommendations: string[];
    }> {
        const charts: SVGElement[] = [];
        const diagrams: SVGElement[] = [];
        const icons: SVGElement[] = [];
        const recommendations: string[] = [];

        try {
            // Generate visuals based on slide type
            switch (slideType) {
                case 'market':
                    if (data?.marketData) {
                        charts.push(await this.generateChart({
                            type: 'pie',
                            data: data.marketData,
                            title: 'Market Size Breakdown'
                        }));
                    }
                    diagrams.push(await this.generateDiagram({
                        type: 'comparison',
                        title: 'Market Opportunity',
                        elements: [
                            { id: 'tam', label: 'TAM', type: 'circle' },
                            { id: 'sam', label: 'SAM', type: 'circle' },
                            { id: 'som', label: 'SOM', type: 'circle' }
                        ]
                    }));
                    break;

                case 'business-model':
                    diagrams.push(await this.generateDiagram({
                        type: 'flowchart',
                        title: 'Revenue Streams',
                        elements: [
                            { id: 'customer', label: 'Customer', type: 'box' },
                            { id: 'product', label: 'Product/Service', type: 'box' },
                            { id: 'revenue', label: 'Revenue', type: 'box' },
                            { id: 'profit', label: 'Profit', type: 'box' }
                        ]
                    }));
                    break;

                case 'financials':
                    if (data?.financialData) {
                        charts.push(await this.generateChart({
                            type: 'line',
                            data: data.financialData,
                            title: 'Revenue Projections'
                        }));
                    }
                    break;

                case 'team':
                    diagrams.push(await this.generateDiagram({
                        type: 'org-chart',
                        title: 'Team Structure',
                        elements: [
                            { id: 'ceo', label: 'CEO', type: 'box' },
                            { id: 'cto', label: 'CTO', type: 'box' },
                            { id: 'cfo', label: 'CFO', type: 'box' }
                        ]
                    }));
                    break;

                case 'traction':
                    if (data?.tractionData) {
                        charts.push(await this.generateChart({
                            type: 'bar',
                            data: data.tractionData,
                            title: 'Growth Metrics'
                        }));
                    }
                    break;
            }

            // Generate relevant icons
            const iconCategories = this.getIconCategoriesForSlide(slideType);
            for (const category of iconCategories) {
                icons.push(await this.generateIcon({
                    category: category as any,
                    style: 'outline',
                    size: 48,
                    color: '#3B82F6',
                    theme: 'professional'
                }));
            }

            recommendations.push(`Generated ${charts.length} charts, ${diagrams.length} diagrams, and ${icons.length} icons for ${slideType} slide`);

        } catch (error) {
            logger.error('Error generating slide visuals:', error);
            recommendations.push('Some visuals could not be generated due to an error');
        }

        return { charts, diagrams, icons, recommendations };
    }

    /**
     * Generate pie chart SVG
     */
    private generatePieChart(data: ChartData, style: string): string {
        const { data: chartData, title, subtitle } = data;
        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        const centerX = 400;
        const centerY = 200;
        const radius = 120;

        let currentAngle = 0;
        const slices = chartData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const color = item.color || this.getColorFromPalette(index);

            currentAngle += angle;

            return `
                <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                      fill="${color}" 
                      stroke="#fff" 
                      stroke-width="2"/>
                <text x="${centerX + (radius * 0.7) * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}"
                      y="${centerY + (radius * 0.7) * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}"
                      text-anchor="middle" 
                      font-family="Arial, sans-serif" 
                      font-size="12" 
                      fill="#333">
                    ${percentage.toFixed(1)}%
                </text>
            `;
        });

        return `
            <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                <title>${title}</title>
                <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
                    ${title}
                </text>
                ${subtitle ? `<text x="400" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">${subtitle}</text>` : ''}
                <g>
                    ${slices.join('')}
                </g>
                <g transform="translate(550, 80)">
                    ${chartData.map((item, index) => `
                        <g transform="translate(0, ${index * 25})">
                            <rect x="0" y="0" width="15" height="15" fill="${item.color || this.getColorFromPalette(index)}"/>
                            <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#333">
                                ${item.label}: ${item.value}${data.units || ''}
                            </text>
                        </g>
                    `).join('')}
                </g>
            </svg>
        `;
    }

    /**
     * Generate bar chart SVG
     */
    private generateBarChart(data: ChartData, style: string): string {
        const { data: chartData, title, subtitle } = data;
        const maxValue = Math.max(...chartData.map(item => item.value));
        const barWidth = 60;
        const barSpacing = 20;
        const chartHeight = 250;
        const chartTop = 80;

        const bars = chartData.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = 100 + index * (barWidth + barSpacing);
            const y = chartTop + chartHeight - barHeight;
            const color = item.color || this.getColorFromPalette(index);

            return `
                <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                      fill="${color}" rx="4" ry="4"/>
                <text x="${x + barWidth / 2}" y="${chartTop + chartHeight + 20}" 
                      text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">
                    ${item.label}
                </text>
                <text x="${x + barWidth / 2}" y="${y - 5}" 
                      text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#333">
                    ${item.value}${data.units || ''}
                </text>
            `;
        });

        return `
            <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                <title>${title}</title>
                <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
                    ${title}
                </text>
                ${subtitle ? `<text x="400" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">${subtitle}</text>` : ''}
                <g>
                    ${bars.join('')}
                </g>
                <!-- Y-axis -->
                <line x1="90" y1="${chartTop}" x2="90" y2="${chartTop + chartHeight}" stroke="#ccc" stroke-width="1"/>
                <!-- X-axis -->
                <line x1="90" y1="${chartTop + chartHeight}" x2="${90 + chartData.length * (barWidth + barSpacing)}" y2="${chartTop + chartHeight}" stroke="#ccc" stroke-width="1"/>
            </svg>
        `;
    }

    /**
     * Generate line chart SVG
     */
    private generateLineChart(data: ChartData, style: string): string {
        const { data: chartData, title, subtitle } = data;
        const maxValue = Math.max(...chartData.map(item => item.value));
        const minValue = Math.min(...chartData.map(item => item.value));
        const chartWidth = 600;
        const chartHeight = 250;
        const chartLeft = 100;
        const chartTop = 80;

        const points = chartData.map((item, index) => {
            const x = chartLeft + (index / (chartData.length - 1)) * chartWidth;
            const y = chartTop + chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
            return { x, y, label: item.label, value: item.value };
        });

        const pathData = points.map((point, index) =>
            index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
        ).join(' ');

        return `
            <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                <title>${title}</title>
                <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
                    ${title}
                </text>
                ${subtitle ? `<text x="400" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">${subtitle}</text>` : ''}
                
                <!-- Grid lines -->
                ${Array.from({ length: 5 }, (_, i) => {
            const y = chartTop + (i * chartHeight / 4);
            return `<line x1="${chartLeft}" y1="${y}" x2="${chartLeft + chartWidth}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
        }).join('')}
                
                <!-- Line -->
                <path d="${pathData}" fill="none" stroke="#3B82F6" stroke-width="3"/>
                
                <!-- Points -->
                ${points.map(point => `
                    <circle cx="${point.x}" cy="${point.y}" r="4" fill="#3B82F6"/>
                    <text x="${point.x}" y="${chartTop + chartHeight + 20}" text-anchor="middle" 
                          font-family="Arial, sans-serif" font-size="12" fill="#333">
                        ${point.label}
                    </text>
                `).join('')}
                
                <!-- Axes -->
                <line x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartTop + chartHeight}" stroke="#ccc" stroke-width="1"/>
                <line x1="${chartLeft}" y1="${chartTop + chartHeight}" x2="${chartLeft + chartWidth}" y2="${chartTop + chartHeight}" stroke="#ccc" stroke-width="1"/>
            </svg>
        `;
    }

    /**
     * Generate doughnut chart SVG
     */
    private generateDoughnutChart(data: ChartData, style: string): string {
        const pieChart = this.generatePieChart(data, style);
        // Add inner circle to make it a doughnut
        return pieChart.replace(
            '<g>',
            '<g><circle cx="400" cy="200" r="60" fill="white"/>'
        );
    }

    /**
     * Generate timeline chart SVG
     */
    private generateTimelineChart(data: ChartData, style: string): string {
        const { data: chartData, title } = data;
        const itemHeight = 60;
        const startY = 100;

        const timelineItems = chartData.map((item, index) => {
            const y = startY + index * itemHeight;
            const color = item.color || this.getColorFromPalette(index);

            return `
                <g transform="translate(0, ${y})">
                    <circle cx="100" cy="20" r="8" fill="${color}"/>
                    <line x1="100" y1="28" x2="100" y2="${index < chartData.length - 1 ? itemHeight - 12 : 28}" 
                          stroke="#ddd" stroke-width="2"/>
                    <rect x="120" y="10" width="400" height="20" fill="${color}" opacity="0.1" rx="10"/>
                    <text x="130" y="24" font-family="Arial, sans-serif" font-size="14" fill="#333">
                        ${item.label}: ${item.value}${data.units || ''}
                    </text>
                </g>
            `;
        });

        return `
            <svg viewBox="0 0 800 ${startY + chartData.length * itemHeight}" xmlns="http://www.w3.org/2000/svg">
                <title>${title}</title>
                <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
                    ${title}
                </text>
                ${timelineItems.join('')}
            </svg>
        `;
    }

    /**
     * Generate funnel chart SVG
     */
    private generateFunnelChart(data: ChartData, style: string): string {
        const { data: chartData, title } = data;
        const maxWidth = 400;
        const stepHeight = 50;
        const startY = 100;

        const funnelSteps = chartData.map((item, index) => {
            const width = maxWidth * (item.value / chartData[0].value);
            const x = 400 - width / 2;
            const y = startY + index * stepHeight;
            const color = item.color || this.getColorFromPalette(index);

            return `
                <g transform="translate(0, ${y})">
                    <rect x="${x}" y="0" width="${width}" height="40" fill="${color}" rx="5"/>
                    <text x="400" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">
                        ${item.label}: ${item.value}${data.units || ''}
                    </text>
                </g>
            `;
        });

        return `
            <svg viewBox="0 0 800 ${startY + chartData.length * stepHeight + 50}" xmlns="http://www.w3.org/2000/svg">
                <title>${title}</title>
                <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
                    ${title}
                </text>
                ${funnelSteps.join('')}
            </svg>
        `;
    }

    /**
     * Generate fallback diagram
     */
    private generateFallbackDiagram(spec: DiagramSpec, style: string): string {
        const { elements, title, type } = spec;

        return `
            <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                <title>${title}</title>
                <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
                    ${title}
                </text>
                <text x="400" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
                    ${type} diagram placeholder
                </text>
                <rect x="300" y="250" width="200" height="100" fill="#f0f0f0" stroke="#ccc" rx="10"/>
            </svg>
        `;
    }

    /**
     * Generate icon SVG
     */
    private generateIconSVG(request: IconRequest): string {
        const { category, style, size, color } = request;

        // Simple icon templates - in a real implementation, you'd have a comprehensive icon library
        const iconPaths: { [key: string]: string } = {
            business: 'M3 21v-4a4 4 0 1 1 8 0v4h2V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h2V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v15h1v2H2v-2h1z',
            technology: 'M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z',
            finance: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
            marketing: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
            team: 'M16 7c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 13c2.67 0 8 1.34 8 4v3H4v-3c0-2.66 5.33-4 8-4z',
            growth: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z'
        };

        const path = iconPaths[category] || iconPaths.business;

        return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="${path}" fill="${color}" stroke="${style === 'outline' ? color : 'none'}" 
                      stroke-width="${style === 'outline' ? '2' : '0'}" 
                      fill="${style === 'outline' ? 'none' : color}"/>
            </svg>
        `;
    }

    /**
     * Get color from palette
     */
    private getColorFromPalette(index: number): string {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        return colors[index % colors.length];
    }

    /**
     * Extract colors from SVG content
     */
    private extractColors(svgContent: string): string[] {
        const colorRegex = /fill="([^"]+)"|stroke="([^"]+)"/g;
        const colors = new Set<string>();
        let match;

        while ((match = colorRegex.exec(svgContent)) !== null) {
            const color = match[1] || match[2];
            if (color && color !== 'none' && color !== 'white' && color !== '#fff') {
                colors.add(color);
            }
        }

        return Array.from(colors);
    }

    /**
     * Extract SVG from AI response
     */
    private extractSVGFromResponse(response: string): string {
        const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/i);
        return svgMatch ? svgMatch[0] : '';
    }

    /**
     * Get icon categories for slide type
     */
    private getIconCategoriesForSlide(slideType: string): string[] {
        const iconMapping: { [key: string]: string[] } = {
            'title': ['business'],
            'problem': ['business', 'technology'],
            'solution': ['technology', 'growth'],
            'market': ['finance', 'marketing'],
            'product': ['technology'],
            'business-model': ['finance', 'business'],
            'traction': ['growth', 'marketing'],
            'competition': ['business', 'marketing'],
            'marketing': ['marketing', 'growth'],
            'financials': ['finance', 'growth'],
            'team': ['team', 'business'],
            'funding': ['finance', 'growth']
        };

        return iconMapping[slideType] || ['business'];
    }
}

export { SVGService, SVGElement, ChartData, DiagramSpec, IconRequest };
export default new SVGService();
