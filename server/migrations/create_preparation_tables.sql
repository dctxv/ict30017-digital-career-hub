-- Preparation tables: user_gaps and mock_interviews.
-- All DDL is idempotent: IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout.

CREATE TABLE IF NOT EXISTS user_gaps (
  gap_id       SERIAL PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  gap_key      TEXT        NOT NULL,
  source       VARCHAR(20) NOT NULL,
  category     VARCHAR(20) NOT NULL,
  description  TEXT        NOT NULL,
  severity     VARCHAR(20) NOT NULL,
  closeable    VARCHAR(20) NOT NULL,
  remediation  JSONB       NOT NULL DEFAULT '{}'::jsonb,
  status       VARCHAR(16) NOT NULL DEFAULT 'open',
  target_role  TEXT,
  language     VARCHAR(10),
  first_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at    TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

ALTER TABLE user_gaps ADD COLUMN IF NOT EXISTS remediation  JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_gaps ADD COLUMN IF NOT EXISTS status       VARCHAR(16) DEFAULT 'open';
ALTER TABLE user_gaps ADD COLUMN IF NOT EXISTS target_role  TEXT;
ALTER TABLE user_gaps ADD COLUMN IF NOT EXISTS language     VARCHAR(10);
ALTER TABLE user_gaps ADD COLUMN IF NOT EXISTS closed_at    TIMESTAMPTZ;
ALTER TABLE user_gaps ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_gaps_identity    ON user_gaps (user_id, gap_key);
CREATE INDEX        IF NOT EXISTS idx_user_gaps_user_status ON user_gaps (user_id, status, severity);

CREATE TABLE IF NOT EXISTS mock_interviews (
  interview_id     SERIAL PRIMARY KEY,
  user_id          INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tier_level       SMALLINT    NOT NULL DEFAULT 1,
  target_role      TEXT,
  candidate_stage  VARCHAR(32),
  resume_file_name TEXT,
  job_ad_text      TEXT,
  questions        JSONB       NOT NULL,
  answers          JSONB,
  evaluation       JSONB,
  overall_score    INTEGER,
  status           VARCHAR(16) NOT NULL DEFAULT 'in_progress',
  model            TEXT,
  tier             VARCHAR(16),
  language         VARCHAR(10),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS status          VARCHAR(16) DEFAULT 'in_progress';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS tier_level      SMALLINT DEFAULT 1;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS candidate_stage VARCHAR(32);
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS resume_file_name TEXT;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS job_ad_text     TEXT;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS evaluation      JSONB;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS overall_score   INTEGER;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS model           TEXT;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS tier            VARCHAR(16);
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS language        VARCHAR(10);
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_created
  ON mock_interviews (user_id, created_at DESC);

ALTER TABLE users ADD COLUMN IF NOT EXISTS mock_interview_count      INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mock_interview_reset_date DATE;
