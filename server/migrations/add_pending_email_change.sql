-- Migration: add_pending_email_change
-- Adds columns required for the secure two-step email change flow.
-- Run once against an existing database that has the users table.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS pending_email              TEXT,
  ADD COLUMN IF NOT EXISTS pending_email_token_hash   TEXT,
  ADD COLUMN IF NOT EXISTS pending_email_token_expiry TIMESTAMPTZ;

-- Index so the confirm step can look up by pending_email efficiently.
CREATE INDEX IF NOT EXISTS idx_users_pending_email ON users (pending_email)
  WHERE pending_email IS NOT NULL;
