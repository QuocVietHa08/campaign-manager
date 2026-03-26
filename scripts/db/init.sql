-- =============================================================================
-- init.sql — Creates tables, indexes, and seed data for Campaign Manager
-- This file can be run standalone: psql -U campaign_user -d campaign_manager -f scripts/db/init.sql
-- It is also auto-loaded by Docker via docker-compose volume mount
-- =============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sending', 'scheduled', 'sent')),
  scheduled_at TIMESTAMP,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipients (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE ON UPDATE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES recipients(id) ON DELETE CASCADE ON UPDATE CASCADE,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  PRIMARY KEY (campaign_id, recipient_id)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS campaigns_created_by_idx ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_scheduled_at_idx ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS campaign_recipients_recipient_id_idx ON campaign_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON campaign_recipients(status);

-- ── Sequelize migration tracking table ──────────────────────────────────────
-- This prevents sequelize-cli from trying to re-run migrations after init.sql

CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
  name VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY
);

INSERT INTO "SequelizeMeta" (name) VALUES
  ('001-create-users.js'),
  ('002-create-campaigns.js'),
  ('003-create-recipients.js'),
  ('004-create-campaign-recipients.js')
ON CONFLICT DO NOTHING;

-- ── Seed Data ───────────────────────────────────────────────────────────────

-- Users (password: "password123" hashed with bcrypt 10 rounds)
-- Hash: $2a$10$brOvOI4zEUvzCkyb497EUuDXidf4h0g1WshoykfcW/MNZuv6lm69O
INSERT INTO users (id, email, name, password, created_at) VALUES
  (1, 'admin@example.com', 'Admin User', '$2a$10$brOvOI4zEUvzCkyb497EUuDXidf4h0g1WshoykfcW/MNZuv6lm69O', NOW()),
  (2, 'marketer@example.com', 'Marketing Manager', '$2a$10$brOvOI4zEUvzCkyb497EUuDXidf4h0g1WshoykfcW/MNZuv6lm69O', NOW())
ON CONFLICT (email) DO NOTHING;

-- Recipients
INSERT INTO recipients (id, email, name, created_at) VALUES
  (1,  'john@example.com',    'John Doe',         NOW()),
  (2,  'jane@example.com',    'Jane Smith',        NOW()),
  (3,  'bob@example.com',     'Bob Wilson',        NOW()),
  (4,  'alice@example.com',   'Alice Brown',       NOW()),
  (5,  'charlie@example.com', 'Charlie Davis',     NOW()),
  (6,  'diana@example.com',   'Diana Miller',      NOW()),
  (7,  'eve@example.com',     'Eve Garcia',        NOW()),
  (8,  'frank@example.com',   'Frank Martinez',    NOW()),
  (9,  'grace@example.com',   'Grace Lee',         NOW()),
  (10, 'henry@example.com',   'Henry Taylor',      NOW())
ON CONFLICT (email) DO NOTHING;

-- Campaigns
INSERT INTO campaigns (id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at) VALUES
  (1, 'Spring Sale Announcement',
      'Don''t Miss Our Spring Sale!',
      'Hello! We are excited to announce our biggest spring sale ever. Get up to 50% off on all products. Shop now before items run out!',
      'draft', NULL, 1, NOW(), NOW()),

  (2, 'Product Launch Newsletter',
      'Introducing Our New Product Line',
      'We are thrilled to introduce our latest product line. Be the first to explore our innovative new offerings that will transform the way you work.',
      'scheduled', NOW() + INTERVAL '7 days', 1, NOW(), NOW()),

  (3, 'Holiday Promo',
      'Holiday Special: Exclusive Deals Inside',
      'This holiday season, we have prepared exclusive deals just for you. Open this email for surprise discounts on our most popular items!',
      'sent', NULL, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

  (4, 'Weekly Digest',
      'Your Weekly Digest - Top Stories',
      'Here is a summary of the top stories from this week. Stay informed with our curated content covering the latest trends and insights.',
      'draft', NULL, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Campaign Recipients
INSERT INTO campaign_recipients (campaign_id, recipient_id, sent_at, opened_at, status) VALUES
  -- Campaign 1 (draft) → 3 recipients, all pending
  (1, 1, NULL, NULL, 'pending'),
  (1, 2, NULL, NULL, 'pending'),
  (1, 3, NULL, NULL, 'pending'),

  -- Campaign 2 (scheduled) → 5 recipients, all pending
  (2, 1, NULL, NULL, 'pending'),
  (2, 4, NULL, NULL, 'pending'),
  (2, 5, NULL, NULL, 'pending'),
  (2, 6, NULL, NULL, 'pending'),
  (2, 7, NULL, NULL, 'pending'),

  -- Campaign 3 (sent) → 8 recipients, mixed statuses
  (3, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'sent'),
  (3, 2, NOW() - INTERVAL '2 days', NULL,                       'sent'),
  (3, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'sent'),
  (3, 4, NOW() - INTERVAL '2 days', NULL,                       'sent'),
  (3, 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',  'sent'),
  (3, 6, NULL,                       NULL,                       'failed'),
  (3, 7, NOW() - INTERVAL '2 days', NULL,                       'sent'),
  (3, 8, NULL,                       NULL,                       'failed'),

  -- Campaign 4 (draft) → 4 recipients, all pending
  (4, 5,  NULL, NULL, 'pending'),
  (4, 6,  NULL, NULL, 'pending'),
  (4, 9,  NULL, NULL, 'pending'),
  (4, 10, NULL, NULL, 'pending')
ON CONFLICT DO NOTHING;

-- Reset sequences so next INSERT gets correct id
SELECT setval('users_id_seq',      (SELECT COALESCE(MAX(id), 0) FROM users)      + 1, false);
SELECT setval('campaigns_id_seq',  (SELECT COALESCE(MAX(id), 0) FROM campaigns)  + 1, false);
SELECT setval('recipients_id_seq', (SELECT COALESCE(MAX(id), 0) FROM recipients) + 1, false);
