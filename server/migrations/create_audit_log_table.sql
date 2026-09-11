-- Record of administrative writes (content create/update/delete by admins).
--
-- The security-events audit log (login, OTP, etc.) is created separately by
-- add_audit_log.sql with a different schema. This table is for admin content
-- changes only and is created only if it doesn't already exist.

BEGIN;

CREATE TABLE IF NOT EXISTS admin_audit_log (
  audit_id     BIGSERIAL PRIMARY KEY,

  actor_id     INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  actor_email  VARCHAR(255),

  action       VARCHAR(16)  NOT NULL,
  entity       VARCHAR(40)  NOT NULL,
  entity_id    INTEGER,

  -- Row state before the change: NULL for a create, the previous row for an
  -- update, the whole row for a delete.
  before       JSONB,
  -- Row state after: the new row for a create or update, NULL for a delete.
  after        JSONB,

  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT admin_audit_log_action_check CHECK (action IN ('create', 'update', 'delete'))
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created  ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity   ON admin_audit_log (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor    ON admin_audit_log (actor_id, created_at DESC);

COMMIT;
