CREATE TABLE IF NOT EXISTS users (
  user_id               SERIAL PRIMARY KEY,
  full_name             TEXT        NOT NULL,
  email                 TEXT        NOT NULL,
  password_hash         TEXT        NOT NULL,
  role                  TEXT        NOT NULL DEFAULT 'student',
  is_email_verified     BOOLEAN     NOT NULL DEFAULT false,
  email_verify_token_hash TEXT,
  email_verify_expiry   TIMESTAMPTZ,
  email_verified_at     TIMESTAMPTZ,
  failed_login_attempts INTEGER     NOT NULL DEFAULT 0,
  lockout_until         TIMESTAMPTZ,
  last_login_at         TIMESTAMPTZ,
  reset_token_hash      TEXT,
  reset_token_expiry    TIMESTAMPTZ,
  chat_message_count    INTEGER     NOT NULL DEFAULT 0,
  chat_count_reset_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
