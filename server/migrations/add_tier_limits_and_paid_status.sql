-- Editable daily allowances and an explicit paid-account flag.
-- NULL limits mean unlimited. Existing behaviour is preserved: Free starts at
-- 10 per day and Premium remains unlimited. Basic is introduced at 25 per day.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
ALTER TABLE users
  ADD CONSTRAINT users_tier_check CHECK (tier IN ('free', 'basic', 'premium'));

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_tier_check CHECK (tier IN ('free', 'basic', 'premium'));

CREATE TABLE IF NOT EXISTS tier_limits (
  tier                    VARCHAR(16) PRIMARY KEY,
  resume_reviews_daily    INTEGER,
  mock_interviews_daily   INTEGER,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT tier_limits_tier_check CHECK (tier IN ('free', 'basic', 'premium')),
  CONSTRAINT tier_limits_review_check CHECK (resume_reviews_daily IS NULL OR resume_reviews_daily >= 0),
  CONSTRAINT tier_limits_interview_check CHECK (mock_interviews_daily IS NULL OR mock_interviews_daily >= 0)
);

INSERT INTO tier_limits (tier, resume_reviews_daily, mock_interviews_daily)
VALUES
  ('free', 10, 10),
  ('basic', 25, 25),
  ('premium', NULL, NULL)
ON CONFLICT (tier) DO NOTHING;

COMMENT ON COLUMN users.is_paid IS
  'Administrative payment marker only; it does not grant a tier or process a payment.';

COMMIT;
