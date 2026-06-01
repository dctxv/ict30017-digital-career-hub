-- Module: add_email_verification
-- Adds email-verification support to the users table.
--
-- is_email_verified  : false until the user clicks their verification link
-- email_verify_token_hash : bcrypt hash of the one-time token (never stored plain)
-- email_verify_expiry     : token expires 24 hours after issue
-- email_verified_at       : timestamp of successful verification (audit trail)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_email_verified       BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verify_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verify_expiry     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified_at       TIMESTAMPTZ;

-- Index: quickly find unverified accounts (useful for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_users_unverified
  ON users (created_at)
  WHERE is_email_verified = false;
