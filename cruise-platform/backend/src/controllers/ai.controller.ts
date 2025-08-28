import { Response } from 'express';
import aiService from '../services/ai.service';
import { AIRequest } from '../types/ai.types';
import { AuthenticatedRequest } from '../types/api.types';
import { logger } from '../utils/logger';

class AIController {
    public async generateResponse(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { prompt, context } = req.body;
            const userId = req.user?.id || 'anonymous';

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const aiRequest: AIRequest = {
                prompt,
                context,
                userId
            };

            const response = await aiService.generateResponse(aiRequest);

            logger.info(`AI response generated for user ${userId}`);
            return res.status(200).json({ response });
        } catch (error) {
            logger.error('Error in AI controller:', error);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
    }

    public async generateWithContext(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { prompt, context } = req.body;
            const userId = req.user?.id || 'anonymous';

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const aiRequest: AIRequest = {
                prompt,
                context,
                userId
            };

            const response = await aiService.generateWithContext(aiRequest);

            logger.info(`Contextual AI response generated for user ${userId}`);
            return res.status(200).json({ response });
        } catch (error) {
            logger.error('Error in AI controller with context:', error);
            return res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
    }
} export const aiController = new AIController();