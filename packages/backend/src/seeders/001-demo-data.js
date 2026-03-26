'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users (ignoreDuplicates for idempotency with init.sql)
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: 1,
          email: 'admin@example.com',
          name: 'Admin User',
          password: hashedPassword,
          created_at: new Date(),
        },
        {
          id: 2,
          email: 'marketer@example.com',
          name: 'Marketing Manager',
          password: hashedPassword,
          created_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );

    // Create recipients
    await queryInterface.bulkInsert(
      'recipients',
      [
        { id: 1, email: 'john@example.com', name: 'John Doe', created_at: new Date() },
        { id: 2, email: 'jane@example.com', name: 'Jane Smith', created_at: new Date() },
        { id: 3, email: 'bob@example.com', name: 'Bob Wilson', created_at: new Date() },
        { id: 4, email: 'alice@example.com', name: 'Alice Brown', created_at: new Date() },
        { id: 5, email: 'charlie@example.com', name: 'Charlie Davis', created_at: new Date() },
        { id: 6, email: 'diana@example.com', name: 'Diana Miller', created_at: new Date() },
        { id: 7, email: 'eve@example.com', name: 'Eve Garcia', created_at: new Date() },
        { id: 8, email: 'frank@example.com', name: 'Frank Martinez', created_at: new Date() },
        { id: 9, email: 'grace@example.com', name: 'Grace Lee', created_at: new Date() },
        { id: 10, email: 'henry@example.com', name: 'Henry Taylor', created_at: new Date() },
      ],
      { ignoreDuplicates: true }
    );

    // Create campaigns
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert(
      'campaigns',
      [
        {
          id: 1,
          name: 'Spring Sale Announcement',
          subject: "Don't Miss Our Spring Sale!",
          body: 'Hello! We are excited to announce our biggest spring sale ever. Get up to 50% off on all products.',
          status: 'draft',
          scheduled_at: null,
          created_by: 1,
          created_at: now,
          updated_at: now,
        },
        {
          id: 2,
          name: 'Product Launch Newsletter',
          subject: 'Introducing Our New Product Line',
          body: 'We are thrilled to introduce our latest product line. Be the first to explore our innovative new offerings.',
          status: 'scheduled',
          scheduled_at: oneWeekFromNow,
          created_by: 1,
          created_at: now,
          updated_at: now,
        },
        {
          id: 3,
          name: 'Holiday Promo',
          subject: 'Holiday Special: Exclusive Deals Inside',
          body: 'This holiday season, we have prepared exclusive deals just for you. Open this email for surprise discounts!',
          status: 'sent',
          scheduled_at: null,
          created_by: 2,
          created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 4,
          name: 'Weekly Digest',
          subject: 'Your Weekly Digest - Top Stories',
          body: 'Here is a summary of the top stories from this week. Stay informed with our curated content.',
          status: 'draft',
          scheduled_at: null,
          created_by: 2,
          created_at: now,
          updated_at: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    // Create campaign recipients
    const sentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert(
      'campaign_recipients',
      [
        // Campaign 1 (draft) - 3 recipients, all pending
        { campaign_id: 1, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 1, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 1, recipient_id: 3, sent_at: null, opened_at: null, status: 'pending' },

        // Campaign 2 (scheduled) - 5 recipients, all pending
        { campaign_id: 2, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 2, recipient_id: 4, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 2, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 2, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 2, recipient_id: 7, sent_at: null, opened_at: null, status: 'pending' },

        // Campaign 3 (sent) - 8 recipients, mixed statuses
        { campaign_id: 3, recipient_id: 1, sent_at: sentDate, opened_at: sentDate, status: 'sent' },
        { campaign_id: 3, recipient_id: 2, sent_at: sentDate, opened_at: null, status: 'sent' },
        { campaign_id: 3, recipient_id: 3, sent_at: sentDate, opened_at: sentDate, status: 'sent' },
        { campaign_id: 3, recipient_id: 4, sent_at: sentDate, opened_at: null, status: 'sent' },
        { campaign_id: 3, recipient_id: 5, sent_at: sentDate, opened_at: sentDate, status: 'sent' },
        { campaign_id: 3, recipient_id: 6, sent_at: null, opened_at: null, status: 'failed' },
        { campaign_id: 3, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },
        { campaign_id: 3, recipient_id: 8, sent_at: null, opened_at: null, status: 'failed' },

        // Campaign 4 (draft) - 4 recipients, all pending
        { campaign_id: 4, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 4, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 4, recipient_id: 9, sent_at: null, opened_at: null, status: 'pending' },
        { campaign_id: 4, recipient_id: 10, sent_at: null, opened_at: null, status: 'pending' },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('campaign_recipients', null, {});
    await queryInterface.bulkDelete('campaigns', null, {});
    await queryInterface.bulkDelete('recipients', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
