-- Module: add_audit_log
-- Extends the existing audit_log table (created by create_audit_log_table.sql)
-- with security-event columns needed by the auth routes.
--
-- Uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS so it is safe to run on a DB
-- that already has the table (and safe to re-run).

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS user_id     INTEGER REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS event_type  VARCHAR(50);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS email       VARCHAR(255);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS ip_address  VARCHAR(45);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS user_agent  TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS metadata    JSONB;

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id    ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
