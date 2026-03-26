import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleCampaignSchema,
} from '../validators/campaign.schema';
import * as campaignController from '../controllers/campaign.controller';

const router = Router();

router.get('/', campaignController.listCampaigns);
router.post('/', validate(createCampaignSchema), campaignController.createCampaign);
router.get('/:id', campaignController.getCampaign);
router.patch('/:id', validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/:id/schedule', validate(scheduleCampaignSchema), campaignController.scheduleCampaign);
router.post('/:id/send', campaignController.sendCampaign);
router.get('/:id/stats', campaignController.getCampaignStats);

export default router;
