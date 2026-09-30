-- FlareAgent Marketplace — PostgreSQL schema
-- Design: offchain mirror of onchain state. Every settlement row keys to
-- (chain_id, tx_hash, log_index) for idempotent Flashblocks backfill.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address CHAR(42) UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('human','agent')),
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  basename TEXT,
  verified_identity BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text),1,8),
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id BIGINT UNIQUE,
  wallet_address CHAR(42) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  price_per_task NUMERIC(20,6) NOT NULL DEFAULT 1.0,
  price_per_request NUMERIC(20,6) DEFAULT 0.02,
  currency CHAR(42) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  total_jobs INT DEFAULT 0,
  total_earned NUMERIC(30,6) DEFAULT 0,
  trust_score INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_agents_category ON agents(category) WHERE is_active;
CREATE INDEX idx_agents_trust ON agents(trust_score DESC);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(20,6) NOT NULL,
  x402_endpoint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  title TEXT NOT NULL,
  requirements TEXT NOT NULL DEFAULT '',
  budget NUMERIC(20,6) NOT NULL,
  currency CHAR(42) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','funded','in_progress','submitted','completed','disputed','cancelled','refunded')),
  escrow_id BIGINT,
  payment_hash CHAR(66),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_agent ON jobs(agent_id);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(20,6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','funded','released','voided')),
  release_tx CHAR(66),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent settlement ledger: one row per onchain escrow event.
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  payment_hash CHAR(66) NOT NULL,
  chain_id BIGINT NOT NULL,
  tx_hash CHAR(66) NOT NULL,
  log_index INT NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('PaymentAuthorized','PaymentCharged','PaymentCaptured','PaymentVoided','PaymentReclaimed','PaymentRefunded','PayoutSent')),
  amount NUMERIC(30,6) NOT NULL,
  fee NUMERIC(30,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (chain_id, tx_hash, log_index)
);
CREATE INDEX idx_settlements_job ON settlements(job_id);
CREATE INDEX idx_settlements_hash ON settlements(payment_hash);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID NOT NULL REFERENCES agents(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (job_id, reviewer_id)
);

CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE spend_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_wallet CHAR(42) NOT NULL,
  token CHAR(42) NOT NULL,
  allowance_per_request NUMERIC(30,6) NOT NULL,
  allowance_per_session NUMERIC(30,6) NOT NULL,
  spent_session NUMERIC(30,6) DEFAULT 0,
  session_id TEXT NOT NULL DEFAULT 'default',
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE x402_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer CHAR(42) NOT NULL,
  receiver CHAR(42) NOT NULL,
  amount NUMERIC(30,6) NOT NULL,
  max_amount NUMERIC(30,6) NOT NULL,
  scheme TEXT NOT NULL DEFAULT 'exact' CHECK (scheme IN ('exact','upto','batch-settlement')),
  endpoint TEXT NOT NULL,
  tx_hash CHAR(66),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','settled','blocked','failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referee_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  reward_paid NUMERIC(20,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE indexer_cursor (
  chain_id BIGINT PRIMARY KEY,
  last_block BIGINT NOT NULL DEFAULT 0
);
