import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { BusinessRuleError, NotFoundError } from '../types';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof BusinessRuleError) {
    return res.status(409).json({ error: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
}
