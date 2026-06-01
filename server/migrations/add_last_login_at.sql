-- Module: add_last_login_at
-- Adds last_login_at timestamp and a performance index on email lookups.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Performance index: all auth queries filter by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Partial index: quickly find locked-out accounts
CREATE INDEX IF NOT EXISTS idx_users_lockout ON users (lockout_until)
  WHERE lockout_until IS NOT NULL;
