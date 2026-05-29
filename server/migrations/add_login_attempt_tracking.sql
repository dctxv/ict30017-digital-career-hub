-- Module: add_login_attempt_tracking
-- Adds columns for per-account failed-login counting and lockout.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lockout_until          TIMESTAMPTZ;
