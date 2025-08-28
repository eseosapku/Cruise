import { Request, Response } from 'express';
import LinkedInService from '../services/linkedin.service';
import { AuthenticatedRequest } from '../types/api.types';

class LinkedInController {
    public async searchProfiles(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { query } = req.body;
            const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';

            if (!accessToken) {
                res.status(401).json({ message: 'LinkedIn access token required' });
                return;
            }

            const linkedinService = new LinkedInService(accessToken);
            const profiles = await linkedinService.searchProfiles(query);
            res.status(200).json(profiles);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error searching profiles', error: errorMessage });
        }
    }

    public async createCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const campaignData = req.body;
            const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';

            if (!accessToken) {
                res.status(401).json({ message: 'LinkedIn access token required' });
                return;
            }

            const linkedinService = new LinkedInService(accessToken);
            const campaign = await linkedinService.createCampaign(campaignData);
            res.status(201).json(campaign);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error creating campaign', error: errorMessage });
        }
    }

    public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';

            if (!accessToken) {
                res.status(401).json({ message: 'LinkedIn access token required' });
                return;
            }

            const linkedinService = new LinkedInService(accessToken);
            const profile = await linkedinService.getProfile();
            res.status(200).json(profile);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            res.status(500).json({ message: 'Error fetching profile', error: errorMessage });
        }
    }
}

export const linkedInController = new LinkedInController();

export const linkedinController = new LinkedInController();