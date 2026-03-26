import { Recipient } from '../models';

export async function listRecipients() {
  return Recipient.findAll({
    order: [['createdAt', 'DESC']],
  });
}

export async function createRecipient(email: string, name: string) {
  const existing = await Recipient.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Recipient with this email already exists');
    error.name = 'ConflictError';
    throw error;
  }

  return Recipient.create({ email, name });
}
