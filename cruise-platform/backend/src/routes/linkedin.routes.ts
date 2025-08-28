// LINKEDIN ROUTES TEMPORARILY DISABLED
// TODO: Implement LinkedIn functionality

/*
import { Router } from 'express';
import { 
    createCampaign, 
    getCampaigns, 
    updateCampaign, 
    deleteCampaign, 
    searchProfiles 
} from '../controllers/linkedin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { campaignValidationSchema } from '../utils/validation';

const router = Router();

// Route to create a new LinkedIn campaign
router.post('/campaigns', authMiddleware, validationMiddleware(campaignValidationSchema), createCampaign);

// Route to get all LinkedIn campaigns
router.get('/campaigns', authMiddleware, getCampaigns);

// Route to update a LinkedIn campaign
router.put('/campaigns/:id', authMiddleware, validationMiddleware(campaignValidationSchema), updateCampaign);

// Route to delete a LinkedIn campaign
router.delete('/campaigns/:id', authMiddleware, deleteCampaign);

// Route to search LinkedIn profiles
router.get('/profiles/search', authMiddleware, searchProfiles);

export default router;
*/

import { Router } from 'express';
const router = Router();

// LinkedIn functionality temporarily disabled
router.get('/status', (req, res) => {
    res.json({ message: 'LinkedIn functionality is temporarily disabled' });
});

export default router;