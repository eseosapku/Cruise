const Meeting = require('../models/Meeting');
const aiService = require('./aiService');

class MeetingService {
  async createMeeting(meetingData) {
    const meeting = await Meeting.create(meetingData);
    return meeting;
  }

  async getMeetings(userId) {
    const meetings = await Meeting.findByUserId(userId);
    return meetings;
  }

  async updateMeeting(meetingId, updates) {
    const meeting = await Meeting.update(meetingId, updates);
    return meeting;
  }

  async provideMeetingAssistance(meetingId) {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Generate AI-powered meeting assistance
    const assistance = await aiService.generateMeetingAssistance({
      agenda: meeting.agenda,
      participants: meeting.participants,
      context: meeting.context
    });

    return {
      meetingId,
      suggestions: assistance.suggestions,
      talking_points: assistance.talkingPoints,
      questions: assistance.questions,
      follow_up_actions: assistance.followUpActions
    };
  }

  async recordMeetingNotes(meetingId, notes) {
    const meeting = await Meeting.update(meetingId, { notes });
    return meeting;
  }
}

module.exports = new MeetingService();
