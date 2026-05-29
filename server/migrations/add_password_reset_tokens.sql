-- Module: add_password_reset_tokens
-- Adds columns needed for the timed password-reset flow.
-- Reset tokens are stored as a bcrypt hash — never plain text.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token_hash  TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
