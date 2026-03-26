import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, password } = req.body;
    const result = await authService.register(email, name, password);
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.name === 'ConflictError') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err: any) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
}
