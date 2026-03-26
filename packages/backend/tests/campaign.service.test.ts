import { sequelize, User, Campaign, CampaignRecipient, Recipient } from '../src/models';
import * as campaignService from '../src/services/campaign.service';

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

async function createCampaignInDb(overrides: Partial<{ status: string }> = {}) {
  return Campaign.create({
    name: 'Test Campaign',
    subject: 'Test Subject',
    body: 'Test body content',
    status: overrides.status || 'draft',
    createdBy: testUser.id,
  });
}

describe('Campaign Service - Draft Only Rules', () => {
  it('should allow updating a draft campaign', async () => {
    const campaign = await createCampaignInDb({ status: 'draft' });
    const result = await campaignService.updateCampaign(campaign.id, { name: 'Updated Name' });
    expect(result.name).toBe('Updated Name');
  });

  it('should reject updating a sent campaign', async () => {
    const campaign = await createCampaignInDb({ status: 'sent' });
    await expect(campaignService.updateCampaign(campaign.id, { name: 'Updated' })).rejects.toThrow(
      'Campaign can only be edited when in draft status'
    );
  });

  it('should reject updating a scheduled campaign', async () => {
    const campaign = await createCampaignInDb({ status: 'scheduled' });
    await expect(campaignService.updateCampaign(campaign.id, { name: 'Updated' })).rejects.toThrow(
      'Campaign can only be edited when in draft status'
    );
  });

  it('should allow deleting a draft campaign', async () => {
    const campaign = await createCampaignInDb({ status: 'draft' });
    await campaignService.deleteCampaign(campaign.id);
    const found = await Campaign.findByPk(campaign.id);
    expect(found).toBeNull();
  });

  it('should reject deleting a non-draft campaign', async () => {
    const campaign = await createCampaignInDb({ status: 'sent' });
    await expect(campaignService.deleteCampaign(campaign.id)).rejects.toThrow(
      'Campaign can only be deleted when in draft status'
    );
  });
});

describe('Campaign Service - Schedule', () => {
  it('should schedule a draft campaign with a future date', async () => {
    const campaign = await createCampaignInDb({ status: 'draft' });
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const result = await campaignService.scheduleCampaign(campaign.id, futureDate);
    expect(result.status).toBe('scheduled');
    expect(result.scheduledAt).not.toBeNull();
  });

  it('should reject scheduling with a past date', async () => {
    const campaign = await createCampaignInDb({ status: 'draft' });
    const pastDate = new Date(Date.now() - 86400000).toISOString();

    await expect(campaignService.scheduleCampaign(campaign.id, pastDate)).rejects.toThrow(
      'scheduled_at must be a future date'
    );
  });

  it('should reject scheduling a non-draft campaign', async () => {
    const campaign = await createCampaignInDb({ status: 'sent' });
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    await expect(campaignService.scheduleCampaign(campaign.id, futureDate)).rejects.toThrow(
      'Only draft campaigns can be scheduled'
    );
  });
});
