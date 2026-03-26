import { Campaign, CampaignRecipient, Recipient, User } from '../models';
import { BusinessRuleError, NotFoundError } from '../types';
import { computeStats } from '../utils/stats';

export async function listCampaigns(userId: number, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const { rows, count } = await Campaign.findAndCountAll({
    where: { createdBy: userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    campaigns: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getCampaignById(id: number) {
  const campaign = await Campaign.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: CampaignRecipient,
        as: 'campaignRecipients',
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['id', 'email', 'name'],
          },
        ],
      },
    ],
  });

  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  const campaignRecipients = (campaign as any).campaignRecipients || [];
  const stats = computeStats(campaignRecipients);

  const recipients = campaignRecipients.map((cr: any) => ({
    id: cr.recipient?.id,
    email: cr.recipient?.email,
    name: cr.recipient?.name,
    status: cr.status,
    sentAt: cr.sentAt,
    openedAt: cr.openedAt,
  }));

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body,
      status: campaign.status,
      scheduledAt: campaign.scheduledAt,
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      creator: (campaign as any).creator,
      recipients,
      stats,
    },
  };
}

export async function createCampaign(
  data: { name: string; subject: string; body: string; recipientIds?: number[] },
  userId: number
) {
  const campaign = await Campaign.create({
    name: data.name,
    subject: data.subject,
    body: data.body,
    createdBy: userId,
  });

  if (data.recipientIds && data.recipientIds.length > 0) {
    const campaignRecipients = data.recipientIds.map((recipientId) => ({
      campaignId: campaign.id,
      recipientId,
      status: 'pending' as const,
    }));
    await CampaignRecipient.bulkCreate(campaignRecipients);
  }

  return campaign;
}

export async function updateCampaign(
  id: number,
  data: { name?: string; subject?: string; body?: string; recipientIds?: number[] }
) {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  if (campaign.status !== 'draft') {
    throw new BusinessRuleError('Campaign can only be edited when in draft status');
  }

  const { recipientIds, ...updateData } = data;
  await campaign.update(updateData);

  if (recipientIds !== undefined) {
    await CampaignRecipient.destroy({ where: { campaignId: id } });
    if (recipientIds.length > 0) {
      const campaignRecipients = recipientIds.map((recipientId) => ({
        campaignId: id,
        recipientId,
        status: 'pending' as const,
      }));
      await CampaignRecipient.bulkCreate(campaignRecipients);
    }
  }

  return campaign.reload();
}

export async function deleteCampaign(id: number) {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  if (campaign.status !== 'draft') {
    throw new BusinessRuleError('Campaign can only be deleted when in draft status');
  }

  await CampaignRecipient.destroy({ where: { campaignId: id } });
  await campaign.destroy();
}

export async function scheduleCampaign(id: number, scheduledAt: string) {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) {
    throw new NotFoundError('Campaign not found');
  }

  if (campaign.status !== 'draft') {
    throw new BusinessRuleError('Only draft campaigns can be scheduled');
  }

  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    throw new BusinessRuleError('scheduled_at must be a future date');
  }

  await campaign.update({
    status: 'scheduled',
    scheduledAt: scheduledDate,
  });

  return campaign.reload();
}
