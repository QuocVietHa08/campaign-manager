import { sequelize, User, Campaign, CampaignRecipient, Recipient } from '../src/models';
import * as sendingService from '../src/services/sending.service';

let testUser: User;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await CampaignRecipient.destroy({ where: {} });
  await Campaign.destroy({ where: {} });
  await Recipient.destroy({ where: {} });
  await User.destroy({ where: {} });

  testUser = await User.create({
    email: 'test@test.com',
    name: 'Test User',
    password: 'hashedpass',
  });
});

afterAll(async () => {
  await sequelize.close();
});

async function createCampaignWithRecipients(status: string, recipientCount: number) {
  const campaign = await Campaign.create({
    name: 'Test Campaign',
    subject: 'Test Subject',
    body: 'Test body',
    status,
    createdBy: testUser.id,
  });

  for (let i = 0; i < recipientCount; i++) {
    const recipient = await Recipient.create({
      email: `recipient${i}@test.com`,
      name: `Recipient ${i}`,
    });
    await CampaignRecipient.create({
      campaignId: campaign.id,
      recipientId: recipient.id,
      status: 'pending',
    });
  }

  return campaign;
}

describe('Sending Service', () => {
  it('should transition campaign from draft to sent after sending', async () => {
    const campaign = await createCampaignWithRecipients('draft', 5);
    await sendingService.sendCampaign(campaign.id);

    const updated = await Campaign.findByPk(campaign.id);
    expect(updated!.status).toBe('sent');
  });

  it('should mark all recipients as sent or failed (none remain pending)', async () => {
    const campaign = await createCampaignWithRecipients('draft', 10);
    await sendingService.sendCampaign(campaign.id);

    const recipients = await CampaignRecipient.findAll({
      where: { campaignId: campaign.id },
    });

    recipients.forEach((r) => {
      expect(['sent', 'failed']).toContain(r.status);
    });
    expect(recipients.filter((r) => r.status === 'pending')).toHaveLength(0);
  });

  it('should set sentAt for successfully sent recipients', async () => {
    const campaign = await createCampaignWithRecipients('draft', 10);
    await sendingService.sendCampaign(campaign.id);

    const sentRecipients = await CampaignRecipient.findAll({
      where: { campaignId: campaign.id, status: 'sent' },
    });

    sentRecipients.forEach((r) => {
      expect(r.sentAt).not.toBeNull();
    });
  });

  it('should reject sending an already-sent campaign', async () => {
    const campaign = await Campaign.create({
      name: 'Sent Campaign',
      subject: 'Subject',
      body: 'Body',
      status: 'sent',
      createdBy: testUser.id,
    });

    await expect(sendingService.sendCampaign(campaign.id)).rejects.toThrow(
      'Campaign cannot be sent in its current status'
    );
  });

  it('should allow sending a scheduled campaign', async () => {
    const campaign = await createCampaignWithRecipients('scheduled', 3);
    await sendingService.sendCampaign(campaign.id);

    const updated = await Campaign.findByPk(campaign.id);
    expect(updated!.status).toBe('sent');
  });
});
