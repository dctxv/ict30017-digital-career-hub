-- Module: add_email_verification_and_2fa
-- Adds columns required for:
--   1. Email address verification at registration (users cannot log in until verified).
--   2. Mandatory two-factor authentication via a one-time code emailed at login.
--
-- Security notes:
--   - Verification and OTP codes are NEVER stored in plain text, only as bcrypt hashes,
--     matching the existing pattern used for password reset tokens.
--   - otp_attempts guards against brute-forcing a 6-digit code within its validity window.
--   - last_login_at / last_login_ip support the "new device" alert email and audit trail.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified            BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_token_hash    TEXT,
  ADD COLUMN IF NOT EXISTS verification_token_expiry  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_code_hash              TEXT,
  ADD COLUMN IF NOT EXISTS otp_expiry                 TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otp_attempts               INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip              VARCHAR(45);

-- Existing rows (created before this migration) are treated as already verified so
-- current dev/test accounts are not locked out. New registrations default to FALSE.
UPDATE users SET email_verified = TRUE WHERE created_at < NOW();
