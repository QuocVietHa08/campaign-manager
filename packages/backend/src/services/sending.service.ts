import { Campaign, CampaignRecipient } from '../models';
import { BusinessRuleError, NotFoundError } from '../types';

export async function sendCampaign(campaignId: number) {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  if (!['draft', 'scheduled'].includes(campaign.status)) {
    throw new BusinessRuleError('Campaign cannot be sent in its current status');
  }

  // Transition to 'sending'
  await campaign.update({ status: 'sending' });

  const recipients = await CampaignRecipient.findAll({
    where: { campaignId, status: 'pending' },
  });

  // Simulate async sending with random delays
  const sendPromises = recipients.map(async (cr) => {
    // Random delay 100-500ms to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 100));

    // 85% success rate
    const succeeded = Math.random() < 0.85;

    if (succeeded) {
      await cr.update({
        status: 'sent',
        sentAt: new Date(),
        // 40% chance of being "opened" (for demo purposes)
        openedAt: Math.random() < 0.4 ? new Date() : null,
      });
    } else {
      await cr.update({ status: 'failed' });
    }
  });

  await Promise.all(sendPromises);

  // Transition to 'sent' (irreversible)
  await campaign.update({ status: 'sent' });

  return campaign.reload();
}
