const webScrapingService = require('../../../services/webScrapingService');
const aiService = require('../../../services/aiService');

class ResearchController {
  async conductWebResearch(req, res) {
    try {
      const { query, domain } = req.body;
      const researchData = await webScrapingService.scrapeWebData(query, domain);
      const analysis = await aiService.analyzeResearchData(researchData);
      res.json({ data: researchData, analysis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMarketInsights(req, res) {
    try {
      const { industry, targetMarket } = req.body;
      const insights = await webScrapingService.getMarketData(industry, targetMarket);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateIdeaValidation(req, res) {
    try {
      const { idea, targetAudience } = req.body;
      const validation = await aiService.validateIdea(idea, targetAudience);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCompetitorAnalysis(req, res) {
    try {
      const { industry, competitors } = req.body;
      const analysis = await webScrapingService.analyzeCompetitors(industry, competitors);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ResearchController();
