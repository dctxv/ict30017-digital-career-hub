-- Module: harden_users_table
-- Responsibility: Add constraints and indexes to harden the users schema.
-- Run AFTER the initial schema is created and all ADD COLUMN migrations.

-- Ensure email is unique and lowercase (enforce at DB level too)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (LOWER(email));

-- Ensure role can only be a known value
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_role'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT chk_users_role
      CHECK (role IN ('student', 'premium', 'admin'));
  END IF;
END $$;

-- Ensure failed_login_attempts cannot go negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_failed_attempts_positive'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT chk_failed_attempts_positive
      CHECK (failed_login_attempts >= 0);
  END IF;
END $$;

-- Ensure chat_message_count cannot go negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_chat_count_positive'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT chk_chat_count_positive
      CHECK (chat_message_count >= 0);
  END IF;
END $$;

-- Index for lockout queries (already in add_last_login_at.sql; safe to repeat)
CREATE INDEX IF NOT EXISTS idx_users_lockout ON users (lockout_until)
  WHERE lockout_until IS NOT NULL;
