import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRequest, AIResponse } from '../types/ai.types';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: environment.GEMINI_MODEL });
    }

    async generateResponse(request: AIRequest): Promise<AIResponse> {
        try {
            const prompt = request.prompt;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            logger.info('Gemini AI response generated successfully');

            return {
                response: text,
                usage: {
                    promptTokens: 0, // Gemini doesn't provide token counts in the same way
                    completionTokens: 0,
                    totalTokens: 0
                }
            };
        } catch (error) {
            logger.error('Error generating AI response:', error);
            throw new Error('Failed to generate AI response');
        }
    }

    async generateWithContext(request: AIRequest): Promise<AIResponse> {
        try {
            const contextualPrompt = request.context
                ? `Context: ${request.context}\n\nUser Query: ${request.prompt}`
                : request.prompt;

            const result = await this.model.generateContent(contextualPrompt);
            const response = await result.response;
            const text = response.text();

            logger.info('Contextual Gemini AI response generated successfully');

            return {
                response: text,
                usage: {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0
                }
            };
        } catch (error) {
            logger.error('Error generating contextual AI response:', error);
            throw new Error('Failed to generate contextual AI response');
        }
    }
}

export default new AIService();