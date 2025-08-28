import apiService from './api.service';
import { ENDPOINTS } from '../utils/constants';

// AI Service interfaces
export interface AIRequest {
    prompt: string;
    context?: string;
    conversationId?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface AIResponse {
    response: string;
    conversationId?: string;
    tokensUsed?: number;
    model?: string;
    timestamp: string;
}

export interface AIContextRequest {
    conversationId: string;
    messages?: AIMessage[];
}

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface AIContextResponse {
    conversationId: string;
    messages: AIMessage[];
    summary?: string;
}

class AIService {

    /**
     * Get AI response for a prompt
     */
    async getAIResponse(request: AIRequest): Promise<AIResponse> {
        try {
            const response = await apiService.post<AIResponse>(
                ENDPOINTS.AI.RESPONSE,
                request
            );

            console.log('AI response generated successfully');
            return response;
        } catch (error) {
            console.error('Failed to get AI response:', error);
            throw error;
        }
    }

    /**
     * Generate AI response with context
     */
    async generateWithContext(request: AIContextRequest): Promise<AIResponse> {
        try {
            const response = await apiService.post<AIResponse>(
                ENDPOINTS.AI.CONTEXT,
                request
            );

            console.log('AI response with context generated successfully');
            return response;
        } catch (error) {
            console.error('Failed to generate AI response with context:', error);
            throw error;
        }
    }

    /**
     * Get conversation context
     */
    async getContext(conversationId: string): Promise<AIContextResponse> {
        try {
            const response = await apiService.get<AIContextResponse>(
                `${ENDPOINTS.AI.CONTEXT}/${conversationId}`
            );

            return response;
        } catch (error) {
            console.error('Failed to get AI context:', error);
            throw error;
        }
    }

    /**
     * Simple AI query (backward compatibility)
     */
    async query(prompt: string): Promise<string> {
        try {
            const response = await this.getAIResponse({ prompt });
            return response.response;
        } catch (error) {
            console.error('AI query failed:', error);
            throw error;
        }
    }

    /**
     * Chat with AI (maintains conversation context)
     */
    async chat(message: string, conversationId?: string): Promise<AIResponse> {
        try {
            const request: AIRequest = {
                prompt: message,
                conversationId,
            };

            return await this.getAIResponse(request);
        } catch (error) {
            console.error('AI chat failed:', error);
            throw error;
        }
    }

    /**
     * Generate content for specific purposes
     */
    async generateContent(type: 'pitch-deck' | 'presentation' | 'analysis', data: any): Promise<AIResponse> {
        try {
            const prompt = this.buildPromptForType(type, data);
            const response = await this.getAIResponse({ prompt });

            console.log(`AI ${type} content generated successfully`);
            return response;
        } catch (error) {
            console.error(`Failed to generate AI ${type} content:`, error);
            throw error;
        }
    }

    /**
     * Build prompts for different content types
     */
    private buildPromptForType(type: string, data: any): string {
        switch (type) {
            case 'pitch-deck':
                return `Create a pitch deck for ${data.companyName} in the ${data.industry} industry. 
                       Target audience: ${data.targetAudience}. 
                       Include: ${data.specificTopics?.join(', ') || 'standard pitch deck sections'}.`;

            case 'presentation':
                return `Create a presentation about ${data.topic}. 
                       Focus on: ${data.focus || 'comprehensive overview'}.
                       Audience level: ${data.level || 'professional'}.`;

            case 'analysis':
                return `Analyze the following data and provide insights: ${JSON.stringify(data)}`;

            default:
                return `Please help with: ${JSON.stringify(data)}`;
        }
    }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;
export { aiService };