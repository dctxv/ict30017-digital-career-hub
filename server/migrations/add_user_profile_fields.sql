-- Profile and lifecycle columns on users.
--
-- The table has carried authentication, two quota counters, lockout state and
-- reset tokens, but almost nothing about the person. Two costs follow.
--
-- Every content table filters by discipline, and the site does not know the
-- user's — so a Computer Science student and an Accounting student see the same
-- unfiltered 42 resources and 70 career paths, and the platform cannot
-- personalise anything it is built to personalise.
--
-- And with only created_at, an active account and a dead one are
-- indistinguishable. There is no way to answer "is anyone using this", which is
-- a question the client will ask.
--
-- Every column is nullable or defaulted, so existing rows stay valid.
--
-- NOT INCLUDED, DELIBERATELY: email_verified. Registration verifies nothing
-- today and there is no mail provider configured, so the column would be set by
-- nobody and read by nobody — decorative schema, which this project already has
-- one example of in preferred_language. It belongs in the same change as the
-- verification flow, not before it.

BEGIN;

-- ── profile ────────────────────────────────────────────────────────────────
-- discipline is the English name from disciplines.name, matching how
-- career_paths, resources and alumni already reference it. No foreign key, for
-- the same reason resources.discipline has none: 'All disciplines' is a
-- sentinel with no row behind it.
ALTER TABLE users ADD COLUMN IF NOT EXISTS discipline      VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution     VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Bangladeshi users frequently treat a mobile number as their primary
-- identity. Stored as text: it is an identifier, not a quantity, and leading
-- zeros and +880 both matter.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- ── lifecycle ──────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Soft delete. Without it, honouring "delete my account" means either losing
-- the row and cascading away its reviews, or keeping data the user asked to be
-- rid of. deleted_at lets the account stop working while the decision about
-- its history stays reversible.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_discipline ON users (discipline);

-- ── updated_at ─────────────────────────────────────────────────────────────
-- Maintained by a trigger rather than by each UPDATE. Seven routes write to
-- users; relying on all of them to remember would guarantee the column is
-- wrong somewhere, and wrong is worse than absent.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
