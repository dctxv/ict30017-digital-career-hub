-- Record of administrative writes.
--
-- The admin dashboard can create, edit and delete resources, career paths,
-- alumni and disciplines. None of it is recorded. On a team of six sharing
-- admin access — and now sharing one database — the first time content
-- disappears there is no way to establish what was removed, by whom, or what
-- it contained before.
--
-- That last part is why `before` exists. Knowing a row was deleted is of
-- limited use; being able to restore it is the point. The snapshot is taken at
-- write time, so a delete is recoverable from this table alone.
--
-- Scope is deliberately narrow: administrative writes to content. Reads are not
-- logged (they are public data), and neither are user actions like running a
-- review, which have their own tables.
--
-- The actor is kept even after their account is removed. SET NULL on the
-- foreign key preserves the row, and actor_email records who it was in plain
-- text at the time — an audit trail that erases itself when someone leaves the
-- project is not an audit trail.

BEGIN;

CREATE TABLE IF NOT EXISTS audit_log (
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

  CONSTRAINT audit_log_action_check CHECK (action IN ('create', 'update', 'delete'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created  ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity   ON audit_log (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor    ON audit_log (actor_id, created_at DESC);

COMMIT;
