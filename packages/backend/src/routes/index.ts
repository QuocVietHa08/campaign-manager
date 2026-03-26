import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import recipientRoutes from './recipient.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/campaigns', authMiddleware, campaignRoutes);
router.use('/recipients', authMiddleware, recipientRoutes);

// Also mount singular /recipient for POST as per spec
router.post('/recipient', authMiddleware, (req, res, next) => {
  // Forward to the recipients router's create handler
  req.url = '/';
  recipientRoutes(req, res, next);
});

export default router;
