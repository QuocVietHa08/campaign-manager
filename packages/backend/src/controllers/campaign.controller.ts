import { Request, Response, NextFunction } from 'express';
import * as campaignService from '../services/campaign.service';
import * as sendingService from '../services/sending.service';

export async function listCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await campaignService.listCampaigns(req.user!.id, page, limit);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const result = await campaignService.getCampaignById(id);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.createCampaign(req.body, req.user!.id);
    return res.status(201).json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const campaign = await campaignService.updateCampaign(id, req.body);
    return res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    await campaignService.deleteCampaign(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function scheduleCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const { scheduledAt } = req.body;
    const campaign = await campaignService.scheduleCampaign(id, scheduledAt);
    return res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function sendCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const campaign = await sendingService.sendCampaign(id);
    return res.json({ campaign });
  } catch (err) {
    next(err);
  }
}
