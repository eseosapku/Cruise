const meetingService = require('../../../services/meetingService');

class MeetingsController {
  async createMeeting(req, res) {
    try {
      const meetingData = req.body;
      const meeting = await meetingService.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMeetings(req, res) {
    try {
      const meetings = await meetingService.getMeetings(req.user.id);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const meeting = await meetingService.updateMeeting(id, updates);
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async assistMeeting(req, res) {
    try {
      const { id } = req.params;
      const assistance = await meetingService.provideMeetingAssistance(id);
      res.json(assistance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MeetingsController();
