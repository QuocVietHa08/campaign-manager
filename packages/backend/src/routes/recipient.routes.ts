import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createRecipientSchema } from '../validators/recipient.schema';
import * as recipientController from '../controllers/recipient.controller';

const router = Router();

router.get('/', recipientController.listRecipients);
router.post('/', validate(createRecipientSchema), recipientController.createRecipient);

export default router;
