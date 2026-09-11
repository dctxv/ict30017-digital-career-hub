-- Migration: trusted devices table + OAuth provider columns
-- Run once against your PostgreSQL database.

-- Trusted devices: when a user checks "Trust this device for 30 days" after
-- completing 2FA, a hashed token is stored here. On subsequent logins from
-- the same device the token is verified and 2FA is skipped.
CREATE TABLE IF NOT EXISTS trusted_devices (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash   TEXT    NOT NULL UNIQUE,
  device_label TEXT,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires ON trusted_devices(expires_at);

-- OAuth provider IDs — nullable; NULL means the user uses password auth only.
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_github_id TEXT UNIQUE;

-- OAuth users are created with email already confirmed by the provider.
-- They have no local password, so password_hash may be NULL for them.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
