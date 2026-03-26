import request from 'supertest';
import { createApp } from '../src/app';
import { sequelize, User, Campaign, CampaignRecipient, Recipient } from '../src/models';

const app = createApp();
let token: string;
let testUser: User;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register a test user via API
  const res = await request(app).post('/auth/register').send({
    email: 'routetest@test.com',
    name: 'Route Test User',
    password: 'password123',
  });
  token = res.body.token;
  testUser = res.body.user;
});

beforeEach(async () => {
  await CampaignRecipient.destroy({ where: {} });
  await Campaign.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /campaigns/:id/schedule', () => {
  it('should schedule a draft campaign with a future date', async () => {
    // Create a campaign first
    const createRes = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', subject: 'Subject', body: 'Body' });

    const campaignId = createRes.body.campaign.id;
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const res = await request(app)
      .post(`/campaigns/${campaignId}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ scheduledAt: futureDate });

    expect(res.status).toBe(200);
    expect(res.body.campaign.status).toBe('scheduled');
  });

  it('should reject scheduling with a past date', async () => {
    const createRes = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', subject: 'Subject', body: 'Body' });

    const campaignId = createRes.body.campaign.id;
    const pastDate = new Date(Date.now() - 86400000).toISOString();

    const res = await request(app)
      .post(`/campaigns/${campaignId}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ scheduledAt: pastDate });

    expect(res.status).toBe(400);
  });

  it('should reject scheduling a non-draft campaign', async () => {
    // Create and send a campaign to make it non-draft
    const campaign = await Campaign.create({
      name: 'Sent Campaign',
      subject: 'Subject',
      body: 'Body',
      status: 'sent',
      createdBy: testUser.id,
    });

    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const res = await request(app)
      .post(`/campaigns/${campaign.id}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ scheduledAt: futureDate });

    expect(res.status).toBe(409);
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/campaigns/1/schedule')
      .send({ scheduledAt: new Date().toISOString() });

    expect(res.status).toBe(401);
  });
});

describe('Campaign CRUD via API', () => {
  it('should create a campaign', async () => {
    const res = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Campaign', subject: 'Subject', body: 'Body content' });

    expect(res.status).toBe(201);
    expect(res.body.campaign.name).toBe('New Campaign');
    expect(res.body.campaign.status).toBe('draft');
  });

  it('should list campaigns for authenticated user', async () => {
    await Campaign.create({
      name: 'Listed Campaign',
      subject: 'Subject',
      body: 'Body',
      createdBy: testUser.id,
    });

    const res = await request(app).get('/campaigns').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.campaigns.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it('should delete a draft campaign', async () => {
    const createRes = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete', subject: 'Subject', body: 'Body' });

    const res = await request(app)
      .delete(`/campaigns/${createRes.body.campaign.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('should reject deleting a non-draft campaign', async () => {
    const campaign = await Campaign.create({
      name: 'Cannot Delete',
      subject: 'Subject',
      body: 'Body',
      status: 'sent',
      createdBy: testUser.id,
    });

    const res = await request(app)
      .delete(`/campaigns/${campaign.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });
});
