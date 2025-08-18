const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async analyzeResearchData(researchData) {
    try {
      const prompt = `Analyze the following research data and provide insights:
      ${JSON.stringify(researchData, null, 2)}
      
      Please provide:
      1. Key insights and trends
      2. Market opportunities
      3. Potential challenges
      4. Recommendations for entrepreneurs`;

      const response = await this.callOpenAI(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  async validateIdea(idea, targetAudience) {
    try {
      const prompt = `Validate this business idea for the given target audience:
      
      Idea: ${idea}
      Target Audience: ${targetAudience}
      
      Please provide:
      1. Market viability score (1-10)
      2. Strengths and weaknesses
      3. Market size estimation
      4. Competitive landscape
      5. Recommended next steps`;

      const response = await this.callOpenAI(prompt);
      return this.parseValidationResponse(response);
    } catch (error) {
      throw new Error(`Idea validation failed: ${error.message}`);
    }
  }

  async generateMeetingAssistance(meetingData) {
    try {
      const prompt = `Generate meeting assistance for this meeting:
      
      Agenda: ${meetingData.agenda}
      Participants: ${meetingData.participants.join(', ')}
      Context: ${meetingData.context}
      
      Please provide:
      1. Key talking points
      2. Potential questions to ask
      3. Follow-up actions
      4. Meeting strategies`;

      const response = await this.callOpenAI(prompt);
      return this.parseMeetingAssistanceResponse(response);
    } catch (error) {
      throw new Error(`Meeting assistance generation failed: ${error.message}`);
    }
  }

  async generateConversationalResponse(userInput, context) {
    try {
      const prompt = `You are an AI assistant helping entrepreneurs. 
      User input: ${userInput}
      Context: ${context}
      
      Provide a helpful, conversational response that guides the user toward their entrepreneurial goals.`;

      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      throw new Error(`Conversational response generation failed: ${error.message}`);
    }
  }

  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for entrepreneurs.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  parseAnalysisResponse(response) {
    // Parse structured response from AI
    return {
      insights: this.extractSection(response, 'insights'),
      opportunities: this.extractSection(response, 'opportunities'),
      challenges: this.extractSection(response, 'challenges'),
      recommendations: this.extractSection(response, 'recommendations')
    };
  }

  parseValidationResponse(response) {
    return {
      viabilityScore: this.extractScore(response),
      strengths: this.extractSection(response, 'strengths'),
      weaknesses: this.extractSection(response, 'weaknesses'),
      marketSize: this.extractSection(response, 'market size'),
      competitive: this.extractSection(response, 'competitive'),
      nextSteps: this.extractSection(response, 'next steps')
    };
  }

  parseMeetingAssistanceResponse(response) {
    return {
      talkingPoints: this.extractSection(response, 'talking points'),
      questions: this.extractSection(response, 'questions'),
      followUpActions: this.extractSection(response, 'follow-up'),
      suggestions: this.extractSection(response, 'strategies')
    };
  }

  extractSection(text, sectionName) {
    // Simple text extraction - can be improved with more sophisticated parsing
    const lines = text.split('\n');
    const sectionLines = lines.filter(line => 
      line.toLowerCase().includes(sectionName.toLowerCase())
    );
    return sectionLines.join('\n');
  }

  extractScore(text) {
    const scoreMatch = text.match(/(\d+)\/10|\b(\d+)\s*out\s*of\s*10/i);
    return scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : null;
  }
}

module.exports = new AIService();
