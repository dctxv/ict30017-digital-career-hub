-- Module: add_audit_log
-- Central table for security-relevant events (login success/failure, registration,
-- email verification, OTP verification, password reset, lockouts, role changes, etc).
--
-- user_id is nullable because some events happen before a user is identified
-- (e.g. a login attempt against an email that doesn't exist).

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id    BIGSERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  event_type  VARCHAR(50) NOT NULL,
  email       VARCHAR(255),
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
