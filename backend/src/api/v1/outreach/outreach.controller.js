const outreachService = require('../../../services/outreachService');

class OutreachController {
  async findCoFounders(req, res) {
    try {
      const { skills, industry, location } = req.body;
      const candidates = await outreachService.findCoFounderCandidates(skills, industry, location);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendLinkedInMessage(req, res) {
    try {
      const { profileId, message, templateType } = req.body;
      const result = await outreachService.sendLinkedInOutreach(profileId, message, templateType);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async trackOutreachCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const status = await outreachService.trackCampaign(campaignId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateOutreachMessage(req, res) {
    try {
      const { profileData, context, tone } = req.body;
      const message = await outreachService.generatePersonalizedMessage(profileData, context, tone);
      res.json({ message });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OutreachController();
