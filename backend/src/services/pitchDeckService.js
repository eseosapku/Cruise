const aiService = require('./aiService');

class PitchDeckService {
  async generateDeck(ideaData, marketData, businessModel) {
    try {
      const slides = await this.generateSlides(ideaData, marketData, businessModel);
      const deckId = `deck_${Date.now()}`;
      
      return {
        id: deckId,
        title: `${ideaData.name} Pitch Deck`,
        slides,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Pitch deck generation failed: ${error.message}`);
    }
  }

  async generateSlides(ideaData, marketData, businessModel) {
    const slideTemplates = [
      { type: 'title', title: 'Problem Statement' },
      { type: 'content', title: 'Solution' },
      { type: 'market', title: 'Market Opportunity' },
      { type: 'business', title: 'Business Model' },
      { type: 'competition', title: 'Competitive Analysis' },
      { type: 'traction', title: 'Traction & Validation' },
      { type: 'team', title: 'Team' },
      { type: 'financial', title: 'Financial Projections' },
      { type: 'funding', title: 'Funding Ask' },
      { type: 'contact', title: 'Contact Information' }
    ];

    const slides = [];
    
    for (const template of slideTemplates) {
      const content = await this.generateSlideContent(template, ideaData, marketData, businessModel);
      slides.push({
        id: `slide_${slides.length + 1}`,
        type: template.type,
        title: template.title,
        content,
        layout: this.getSlideLayout(template.type)
      });
    }

    return slides;
  }

  async generateSlideContent(template, ideaData, marketData, businessModel) {
    const prompt = `Generate content for a ${template.title} slide in a pitch deck:
    
    Idea: ${JSON.stringify(ideaData)}
    Market Data: ${JSON.stringify(marketData)}
    Business Model: ${JSON.stringify(businessModel)}
    
    Generate content appropriate for a ${template.type} slide that is:
    - Concise and impactful
    - Visually friendly
    - Investor-focused
    - Data-driven where possible`;

    const content = await aiService.callOpenAI(prompt);
    return this.structureSlideContent(content, template.type);
  }

  structureSlideContent(content, slideType) {
    const lines = content.split('\n').filter(line => line.trim());
    
    switch (slideType) {
      case 'title':
        return {
          headline: lines[0],
          subheadline: lines[1] || '',
          bullets: lines.slice(2)
        };
      case 'market':
        return {
          marketSize: this.extractMarketSize(content),
          growth: this.extractGrowthRate(content),
          trends: lines.filter(line => line.includes('trend') || line.includes('growing'))
        };
      case 'financial':
        return {
          revenue: this.extractFinancials(content, 'revenue'),
          costs: this.extractFinancials(content, 'cost'),
          projections: lines.filter(line => line.includes('$') || line.includes('%'))
        };
      default:
        return {
          mainPoints: lines.slice(0, 5),
          supportingData: lines.slice(5)
        };
    }
  }

  getSlideLayout(slideType) {
    const layouts = {
      title: 'centered',
      content: 'bullets',
      market: 'chart',
      business: 'diagram',
      competition: 'table',
      traction: 'metrics',
      team: 'profiles',
      financial: 'charts',
      funding: 'centered',
      contact: 'contact'
    };
    
    return layouts[slideType] || 'bullets';
  }

  async updateSlide(deckId, slideIndex, content) {
    // In a real implementation, this would update the slide in a database
    return {
      deckId,
      slideIndex,
      content,
      lastModified: new Date().toISOString()
    };
  }

  async addStatistics(deckId, dataType, statistics) {
    const formattedStats = await this.formatStatistics(dataType, statistics);
    
    return {
      deckId,
      dataType,
      statistics: formattedStats,
      addedAt: new Date().toISOString()
    };
  }

  async formatStatistics(dataType, statistics) {
    const prompt = `Format these statistics for a pitch deck slide:
    
    Data Type: ${dataType}
    Statistics: ${JSON.stringify(statistics)}
    
    Make them investor-friendly, visually appealing, and impactful.`;

    const formatted = await aiService.callOpenAI(prompt);
    return formatted;
  }

  async exportDeck(deckId, format) {
    const supportedFormats = ['pdf', 'pptx', 'json'];
    
    if (!supportedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Mock export - in reality, this would generate the actual file
    return {
      deckId,
      format,
      downloadUrl: `https://api.cruise-platform.com/downloads/${deckId}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async getTemplates() {
    return [
      {
        id: 'startup_standard',
        name: 'Standard Startup Pitch',
        description: 'Classic 10-slide startup pitch deck',
        slides: 10,
        category: 'startup'
      },
      {
        id: 'tech_product',
        name: 'Tech Product Pitch',
        description: 'Technology-focused product pitch',
        slides: 12,
        category: 'technology'
      },
      {
        id: 'saas_model',
        name: 'SaaS Business Model',
        description: 'Software-as-a-Service focused pitch',
        slides: 11,
        category: 'saas'
      }
    ];
  }

  extractMarketSize(content) {
    const sizeMatch = content.match(/\$[\d.]+[BMK]|\$[\d,]+|\d+\s*billion|\d+\s*million/i);
    return sizeMatch ? sizeMatch[0] : null;
  }

  extractGrowthRate(content) {
    const growthMatch = content.match(/\d+%\s*growth|\d+%\s*annually|\d+%\s*CAGR/i);
    return growthMatch ? growthMatch[0] : null;
  }

  extractFinancials(content, type) {
    const financialLines = content.split('\n').filter(line => 
      line.toLowerCase().includes(type) && (line.includes('$') || line.includes('%'))
    );
    return financialLines;
  }
}

module.exports = new PitchDeckService();
