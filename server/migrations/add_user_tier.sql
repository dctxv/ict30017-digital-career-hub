-- Module: add_user_tier
-- Responsibility: Persist the subscription tier chosen at registration so the
-- AI model can be resolved per tier instead of always falling back to free.
--
-- The May 2026 model feasibility study pairs the free tier with Gemini 3.1
-- Flash Lite and the premium tier with Claude Haiku 4.5. Neither recommendation
-- can activate until a tier value is stored against the user, which is what
-- this column provides. The model IDs themselves stay in the environment
-- (AI_MODEL_FREE and AI_MODEL_PREMIUM); nothing here names a model.
--
-- Existing rows default to 'free', which matches the behaviour they already had.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tier VARCHAR(16) NOT NULL DEFAULT 'free';

-- Constrain to the two supported tiers. Added separately and guarded so the
-- whole migration stays idempotent alongside ADD COLUMN IF NOT EXISTS.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_tier_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_tier_check CHECK (tier IN ('free', 'premium'));
  END IF;
END
$$;
