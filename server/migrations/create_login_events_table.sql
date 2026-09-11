-- Migration: create_login_events_table
-- Records every successful and failed login attempt for display on the
-- Security & Sessions page and for audit purposes.
--
-- ip_address and user_agent are stored as plain text. No geolocation is
-- performed server-side — the client parses the user_agent for display.

CREATE TABLE IF NOT EXISTS login_events (
  event_id      BIGSERIAL    PRIMARY KEY,
  user_id       INTEGER      REFERENCES users(user_id) ON DELETE SET NULL,
  email         TEXT         NOT NULL,
  event_type    TEXT         NOT NULL CHECK (event_type IN ('login_success', 'login_failure', 'logout')),
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_events_user_id   ON login_events (user_id);
CREATE INDEX IF NOT EXISTS idx_login_events_created_at ON login_events (created_at DESC);
