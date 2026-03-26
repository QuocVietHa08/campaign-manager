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

    // Create campaigns — enough for 3 pages (10 per page)
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    const oneWeekFromNow = new Date(now.getTime() + 7 * day);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * day);

    const campaigns = [
      // --- User 1 (admin): 25 campaigns → 3 pages ---
      {
        id: 1,
        name: 'Spring Sale Announcement',
        subject: "Don't Miss Our Spring Sale!",
        body: 'Hello! We are excited to announce our biggest spring sale ever. Get up to 50% off on all products.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 25 * day),
        updated_at: new Date(now.getTime() - 25 * day),
      },
      {
        id: 2,
        name: 'Product Launch Newsletter',
        subject: 'Introducing Our New Product Line',
        body: 'We are thrilled to introduce our latest product line. Be the first to explore our innovative new offerings.',
        status: 'scheduled',
        scheduled_at: oneWeekFromNow,
        created_by: 1,
        created_at: new Date(now.getTime() - 24 * day),
        updated_at: new Date(now.getTime() - 24 * day),
      },
      {
        id: 3,
        name: 'Holiday Promo',
        subject: 'Holiday Special: Exclusive Deals Inside',
        body: 'This holiday season, we have prepared exclusive deals just for you. Open this email for surprise discounts!',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 23 * day),
        updated_at: new Date(now.getTime() - 22 * day),
      },
      {
        id: 4,
        name: 'Weekly Digest',
        subject: 'Your Weekly Digest - Top Stories',
        body: 'Here is a summary of the top stories from this week. Stay informed with our curated content.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 21 * day),
        updated_at: new Date(now.getTime() - 21 * day),
      },
      {
        id: 5,
        name: 'Customer Feedback Survey',
        subject: 'We Want to Hear From You!',
        body: 'Your opinion matters! Please take 2 minutes to complete our customer satisfaction survey.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 20 * day),
        updated_at: new Date(now.getTime() - 19 * day),
      },
      {
        id: 6,
        name: 'New Feature Announcement',
        subject: 'Exciting New Features Just Launched',
        body: 'We have been working hard and are thrilled to share three new features that will transform your workflow.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 18 * day),
        updated_at: new Date(now.getTime() - 17 * day),
      },
      {
        id: 7,
        name: 'Back to School Campaign',
        subject: 'Back to School Savings Start Now',
        body: 'Get ready for the new school year with our exclusive back-to-school discounts on supplies and gear.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 16 * day),
        updated_at: new Date(now.getTime() - 16 * day),
      },
      {
        id: 8,
        name: 'Referral Program Launch',
        subject: 'Refer a Friend, Earn Rewards',
        body: 'Introducing our new referral program! Share the love and earn credits for every friend who signs up.',
        status: 'scheduled',
        scheduled_at: twoWeeksFromNow,
        created_by: 1,
        created_at: new Date(now.getTime() - 15 * day),
        updated_at: new Date(now.getTime() - 15 * day),
      },
      {
        id: 9,
        name: 'Summer Collection Preview',
        subject: 'Sneak Peek: Summer Collection 2026',
        body: 'Be the first to preview our stunning summer collection. Fresh styles, bold colors, limited editions.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 14 * day),
        updated_at: new Date(now.getTime() - 13 * day),
      },
      {
        id: 10,
        name: 'Flash Sale Alert',
        subject: '24-Hour Flash Sale — Up to 70% Off',
        body: 'FLASH SALE! For the next 24 hours only, enjoy up to 70% off on select items. Do not miss out!',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 12 * day),
        updated_at: new Date(now.getTime() - 11 * day),
      },
      {
        id: 11,
        name: 'Monthly Product Update',
        subject: 'March Product Updates & Improvements',
        body: 'Here is what we shipped this month: performance improvements, new integrations, and bug fixes.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 10 * day),
        updated_at: new Date(now.getTime() - 10 * day),
      },
      {
        id: 12,
        name: 'VIP Early Access',
        subject: 'VIP Only: Early Access to New Collection',
        body: 'As a valued VIP member, you get exclusive early access to our new collection before anyone else.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 9 * day),
        updated_at: new Date(now.getTime() - 8 * day),
      },
      {
        id: 13,
        name: 'Webinar Invitation',
        subject: 'Join Our Free Marketing Webinar',
        body: 'Learn the latest marketing strategies from industry experts in our free live webinar this Thursday.',
        status: 'scheduled',
        scheduled_at: oneWeekFromNow,
        created_by: 1,
        created_at: new Date(now.getTime() - 8 * day),
        updated_at: new Date(now.getTime() - 8 * day),
      },
      {
        id: 14,
        name: 'End of Season Clearance',
        subject: 'Final Clearance — Everything Must Go',
        body: 'Last chance to grab amazing deals! Our end-of-season clearance event ends this weekend.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 7 * day),
        updated_at: new Date(now.getTime() - 6 * day),
      },
      {
        id: 15,
        name: 'Partnership Announcement',
        subject: 'Exciting Partnership with TechCorp',
        body: 'We are proud to announce our new strategic partnership with TechCorp, bringing you even better products.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 6 * day),
        updated_at: new Date(now.getTime() - 6 * day),
      },
      {
        id: 16,
        name: 'Customer Appreciation Week',
        subject: 'Thank You! Customer Appreciation Deals',
        body: 'To show our gratitude, we are offering exclusive deals all week long. Thank you for being a loyal customer!',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 5 * day),
        updated_at: new Date(now.getTime() - 4 * day),
      },
      {
        id: 17,
        name: 'Security Update Notice',
        subject: 'Important Security Update for Your Account',
        body: 'We have enhanced our security measures. Please review the changes and update your password if needed.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 4 * day),
        updated_at: new Date(now.getTime() - 3 * day),
      },
      {
        id: 18,
        name: 'Weekend Special Offers',
        subject: 'This Weekend Only: Special Offers Inside',
        body: 'Make your weekend special with our exclusive offers. Valid Saturday and Sunday only!',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 3 * day),
        updated_at: new Date(now.getTime() - 3 * day),
      },
      {
        id: 19,
        name: 'App Update Announcement',
        subject: 'New App Version Available Now',
        body: 'Version 3.0 is here! Featuring a redesigned interface, faster performance, and brand new features.',
        status: 'scheduled',
        scheduled_at: twoWeeksFromNow,
        created_by: 1,
        created_at: new Date(now.getTime() - 2 * day),
        updated_at: new Date(now.getTime() - 2 * day),
      },
      {
        id: 20,
        name: 'Earth Day Campaign',
        subject: 'Celebrate Earth Day With Us',
        body: 'Join us in making a difference! For every purchase this week, we plant a tree. Go green with us.',
        status: 'sent',
        scheduled_at: null,
        created_by: 1,
        created_at: new Date(now.getTime() - 1 * day),
        updated_at: new Date(now.getTime() - 1 * day),
      },
      {
        id: 21,
        name: 'Loyalty Program Update',
        subject: 'Your Loyalty Points Just Got Better',
        body: 'Great news! We have revamped our loyalty program. Your points are now worth even more.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 22,
        name: 'Seasonal Recipe Collection',
        subject: 'Spring Recipes You Will Love',
        body: 'Discover delicious spring recipes curated by our team. Perfect for the season!',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 23,
        name: 'Free Shipping Weekend',
        subject: 'Free Shipping on All Orders This Weekend',
        body: 'No minimum purchase required! Enjoy free shipping on every order placed this Saturday and Sunday.',
        status: 'scheduled',
        scheduled_at: oneWeekFromNow,
        created_by: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 24,
        name: 'Company Milestone',
        subject: 'We Just Hit 100K Customers!',
        body: 'Thank you for being part of our journey! To celebrate 100,000 customers, here is a special gift for you.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 25,
        name: 'Q2 Goals Newsletter',
        subject: 'Our Q2 Roadmap and What is Coming',
        body: 'A look at what we are building in Q2: new features, improvements, and community initiatives.',
        status: 'draft',
        scheduled_at: null,
        created_by: 1,
        created_at: now,
        updated_at: now,
      },

      // --- User 2 (marketer): 8 campaigns → 1 page ---
      {
        id: 26,
        name: 'Welcome Email Series',
        subject: 'Welcome to Our Community!',
        body: 'Welcome aboard! Here is everything you need to get started and make the most of your membership.',
        status: 'sent',
        scheduled_at: null,
        created_by: 2,
        created_at: new Date(now.getTime() - 20 * day),
        updated_at: new Date(now.getTime() - 19 * day),
      },
      {
        id: 27,
        name: 'Re-engagement Campaign',
        subject: 'We Miss You! Come Back for 20% Off',
        body: 'It has been a while since your last visit. Here is a special 20% discount to welcome you back.',
        status: 'sent',
        scheduled_at: null,
        created_by: 2,
        created_at: new Date(now.getTime() - 15 * day),
        updated_at: new Date(now.getTime() - 14 * day),
      },
      {
        id: 28,
        name: 'Birthday Rewards',
        subject: 'Happy Birthday! A Gift Awaits You',
        body: 'Happy birthday from all of us! Enjoy this exclusive birthday reward — just for you.',
        status: 'draft',
        scheduled_at: null,
        created_by: 2,
        created_at: new Date(now.getTime() - 10 * day),
        updated_at: new Date(now.getTime() - 10 * day),
      },
      {
        id: 29,
        name: 'Event Registration',
        subject: 'You Are Invited: Annual Marketing Summit',
        body: 'Join us for the Annual Marketing Summit. Register today to secure your spot!',
        status: 'scheduled',
        scheduled_at: twoWeeksFromNow,
        created_by: 2,
        created_at: new Date(now.getTime() - 7 * day),
        updated_at: new Date(now.getTime() - 7 * day),
      },
      {
        id: 30,
        name: 'Black Friday Preview',
        subject: 'Black Friday Deals: Sneak Peek',
        body: 'Get a first look at our incredible Black Friday deals. Mark your calendar and prepare to save big!',
        status: 'draft',
        scheduled_at: null,
        created_by: 2,
        created_at: new Date(now.getTime() - 5 * day),
        updated_at: new Date(now.getTime() - 5 * day),
      },
      {
        id: 31,
        name: 'Social Media Contest',
        subject: 'Enter to Win: Share & Win Big',
        body: 'Participate in our social media contest for a chance to win amazing prizes! Share this email to enter.',
        status: 'sent',
        scheduled_at: null,
        created_by: 2,
        created_at: new Date(now.getTime() - 3 * day),
        updated_at: new Date(now.getTime() - 2 * day),
      },
      {
        id: 32,
        name: 'Product Tutorial Series',
        subject: 'Master Our Product in 5 Easy Steps',
        body: 'New to our product? Follow this step-by-step tutorial to become a pro in no time.',
        status: 'draft',
        scheduled_at: null,
        created_by: 2,
        created_at: new Date(now.getTime() - 1 * day),
        updated_at: new Date(now.getTime() - 1 * day),
      },
      {
        id: 33,
        name: 'Feedback Follow-Up',
        subject: 'Thank You for Your Feedback',
        body: 'We read every piece of feedback. Here is what we changed based on your suggestions.',
        status: 'scheduled',
        scheduled_at: oneWeekFromNow,
        created_by: 2,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('campaigns', campaigns, { ignoreDuplicates: true });

    // Create campaign recipients
    const sentDate = new Date(now.getTime() - 2 * day);
    const openedDate = new Date(now.getTime() - 1 * day);

    const campaignRecipients = [
      // Campaign 1 (draft) - 3 recipients
      { campaign_id: 1, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 1, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 1, recipient_id: 3, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 2 (scheduled) - 5 recipients
      { campaign_id: 2, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 2, recipient_id: 4, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 2, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 2, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 2, recipient_id: 7, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 3 (sent) - 8 recipients, mixed
      { campaign_id: 3, recipient_id: 1, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 3, recipient_id: 2, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 3, recipient_id: 3, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 3, recipient_id: 4, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 3, recipient_id: 5, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 3, recipient_id: 6, sent_at: null, opened_at: null, status: 'failed' },
      { campaign_id: 3, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 3, recipient_id: 8, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 4 (draft) - 4 recipients
      { campaign_id: 4, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 4, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 4, recipient_id: 9, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 4, recipient_id: 10, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 5 (sent) - 6 recipients
      { campaign_id: 5, recipient_id: 1, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 5, recipient_id: 2, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 5, recipient_id: 3, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 5, recipient_id: 4, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 5, recipient_id: 5, sent_at: null, opened_at: null, status: 'failed' },
      { campaign_id: 5, recipient_id: 6, sent_at: sentDate, opened_at: openedDate, status: 'sent' },

      // Campaign 6 (sent) - 4 recipients
      { campaign_id: 6, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 6, recipient_id: 8, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 6, recipient_id: 9, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 6, recipient_id: 10, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 7 (draft) - 2 recipients
      { campaign_id: 7, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 7, recipient_id: 4, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 8 (scheduled) - 3 recipients
      { campaign_id: 8, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 8, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 8, recipient_id: 8, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 9 (sent) - 5 recipients
      { campaign_id: 9, recipient_id: 1, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 9, recipient_id: 3, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 9, recipient_id: 5, sent_at: sentDate, opened_at: openedDate, status: 'sent' },
      { campaign_id: 9, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 9, recipient_id: 9, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 10 (sent) - 7 recipients
      {
        campaign_id: 10,
        recipient_id: 1,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 10, recipient_id: 2, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 10,
        recipient_id: 3,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      {
        campaign_id: 10,
        recipient_id: 4,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 10, recipient_id: 5, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 10, recipient_id: 6, sent_at: null, opened_at: null, status: 'failed' },
      { campaign_id: 10, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },

      // Campaign 11 (draft) - 2 recipients
      { campaign_id: 11, recipient_id: 3, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 11, recipient_id: 7, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 12 (sent) - 3 recipients
      {
        campaign_id: 12,
        recipient_id: 1,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 12, recipient_id: 4, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 12, recipient_id: 9, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 13 (scheduled) - 4 recipients
      { campaign_id: 13, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 13, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 13, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 13, recipient_id: 10, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 14 (sent) - 5 recipients
      {
        campaign_id: 14,
        recipient_id: 2,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 14, recipient_id: 4, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 14,
        recipient_id: 6,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 14, recipient_id: 8, sent_at: null, opened_at: null, status: 'failed' },
      { campaign_id: 14, recipient_id: 10, sent_at: sentDate, opened_at: null, status: 'sent' },

      // Campaign 15 (draft) - 3 recipients
      { campaign_id: 15, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 15, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 15, recipient_id: 8, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 16 (sent) - 4 recipients
      {
        campaign_id: 16,
        recipient_id: 2,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 16, recipient_id: 3, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 16,
        recipient_id: 7,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 16, recipient_id: 10, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 17 (sent) - 5 recipients
      { campaign_id: 17, recipient_id: 1, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 17,
        recipient_id: 3,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 17, recipient_id: 5, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 17,
        recipient_id: 8,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 17, recipient_id: 9, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 18 (draft) - 2 recipients
      { campaign_id: 18, recipient_id: 4, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 18, recipient_id: 10, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 19 (scheduled) - 3 recipients
      { campaign_id: 19, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 19, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 19, recipient_id: 9, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 20 (sent) - 6 recipients
      {
        campaign_id: 20,
        recipient_id: 2,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 20, recipient_id: 4, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 20,
        recipient_id: 5,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 20, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },
      { campaign_id: 20, recipient_id: 8, sent_at: null, opened_at: null, status: 'failed' },
      {
        campaign_id: 20,
        recipient_id: 10,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },

      // Campaign 21 (draft) - 2 recipients
      { campaign_id: 21, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 21, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 22 (draft) - 1 recipient
      { campaign_id: 22, recipient_id: 3, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 23 (scheduled) - 4 recipients
      { campaign_id: 23, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 23, recipient_id: 4, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 23, recipient_id: 7, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 23, recipient_id: 10, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 24 (draft) - 3 recipients
      { campaign_id: 24, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 24, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 24, recipient_id: 9, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 25 (draft) - 2 recipients
      { campaign_id: 25, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 25, recipient_id: 8, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 26 (sent, user 2) - 4 recipients
      {
        campaign_id: 26,
        recipient_id: 1,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 26, recipient_id: 2, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 26,
        recipient_id: 3,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 26, recipient_id: 4, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 27 (sent, user 2) - 5 recipients
      { campaign_id: 27, recipient_id: 5, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 27,
        recipient_id: 6,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 27, recipient_id: 7, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 27,
        recipient_id: 8,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 27, recipient_id: 9, sent_at: null, opened_at: null, status: 'failed' },

      // Campaign 28 (draft, user 2) - 2 recipients
      { campaign_id: 28, recipient_id: 3, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 28, recipient_id: 7, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 29 (scheduled, user 2) - 3 recipients
      { campaign_id: 29, recipient_id: 1, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 29, recipient_id: 5, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 29, recipient_id: 10, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 30 (draft, user 2) - 2 recipients
      { campaign_id: 30, recipient_id: 2, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 30, recipient_id: 8, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 31 (sent, user 2) - 3 recipients
      {
        campaign_id: 31,
        recipient_id: 1,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },
      { campaign_id: 31, recipient_id: 5, sent_at: sentDate, opened_at: null, status: 'sent' },
      {
        campaign_id: 31,
        recipient_id: 10,
        sent_at: sentDate,
        opened_at: openedDate,
        status: 'sent',
      },

      // Campaign 32 (draft, user 2) - 1 recipient
      { campaign_id: 32, recipient_id: 4, sent_at: null, opened_at: null, status: 'pending' },

      // Campaign 33 (scheduled, user 2) - 2 recipients
      { campaign_id: 33, recipient_id: 6, sent_at: null, opened_at: null, status: 'pending' },
      { campaign_id: 33, recipient_id: 9, sent_at: null, opened_at: null, status: 'pending' },
    ];

    await queryInterface.bulkInsert('campaign_recipients', campaignRecipients, {
      ignoreDuplicates: true,
    });

    // Reset auto-increment sequences to avoid duplicate key errors on new inserts
    await queryInterface.sequelize.query(
      `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`
    );
    await queryInterface.sequelize.query(
      `SELECT setval('recipients_id_seq', (SELECT MAX(id) FROM recipients));`
    );
    await queryInterface.sequelize.query(
      `SELECT setval('campaigns_id_seq', (SELECT MAX(id) FROM campaigns));`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('campaign_recipients', null, {});
    await queryInterface.bulkDelete('campaigns', null, {});
    await queryInterface.bulkDelete('recipients', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
