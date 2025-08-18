const pitchDeckService = require('../../../services/pitchDeckService');

class PitchDeckController {
  async generatePitchDeck(req, res) {
    try {
      const { ideaData, marketData, businessModel } = req.body;
      const pitchDeck = await pitchDeckService.generateDeck(ideaData, marketData, businessModel);
      res.json(pitchDeck);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSlide(req, res) {
    try {
      const { deckId, slideIndex, content } = req.body;
      const updatedSlide = await pitchDeckService.updateSlide(deckId, slideIndex, content);
      res.json(updatedSlide);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addDataPoints(req, res) {
    try {
      const { deckId, dataType, statistics } = req.body;
      const result = await pitchDeckService.addStatistics(deckId, dataType, statistics);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportDeck(req, res) {
    try {
      const { deckId, format } = req.params;
      const exportedDeck = await pitchDeckService.exportDeck(deckId, format);
      res.json(exportedDeck);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDeckTemplates(req, res) {
    try {
      const templates = await pitchDeckService.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PitchDeckController();
