import { Request, Response, NextFunction } from 'express';
import * as recipientService from '../services/recipient.service';

export async function listRecipients(_req: Request, res: Response, next: NextFunction) {
  try {
    const recipients = await recipientService.listRecipients();
    return res.json({ recipients });
  } catch (err) {
    next(err);
  }
}

export async function createRecipient(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name } = req.body;
    const recipient = await recipientService.createRecipient(email, name);
    return res.status(201).json({ recipient });
  } catch (err: any) {
    if (err.name === 'ConflictError') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}
