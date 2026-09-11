-- Migration: add Google OAuth support
-- Run once against your database before starting the server.
--
-- Adds:
--   users.google_id     — Google's unique user ID (sub field from ID token)
--   users.avatar_url    — profile picture URL from Google (optional)
--   users.password_hash — made nullable so Google-only accounts need no password

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url  TEXT;

-- Allow NULL password_hash for accounts created via Google OAuth.
-- Existing rows are unaffected; password-based accounts still store a hash.
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

-- Index so the Google callback lookup is fast.
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);
