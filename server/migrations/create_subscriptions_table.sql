-- Subscription records behind the premium tier.
--
-- users.tier is a bare VARCHAR with no start date, end date, price or payment
-- reference. Premium therefore never expires: whoever holds it holds it
-- forever, and there is no record of why they got it or who granted it. The
-- register form writes the value straight from a radio button, so an account
-- can also grant itself premium with one click and no payment.
--
-- This table does not change that on its own, and is not meant to. It gives
-- the tier a provenance so the entitlement can eventually be derived from a
-- fact rather than asserted by a column.
--
-- HOW IT RELATES TO users.tier
--
-- users.tier stays the effective value the application reads — nothing has to
-- join to resolve a request, and the existing quota code keeps working
-- untouched. This table records WHY it holds that value: who granted it, from
-- when, until when, and against which payment if any.
--
-- The intended direction is that resolving a tier consults the active
-- subscription and writes the answer back to users.tier, so an expired
-- subscription silently returns the account to free. That belongs in a change
-- that can be tested end to end, not in a migration.
--
-- `source` distinguishes a real payment from a manual grant. On a university
-- project most premium accounts will be manual, and pretending otherwise makes
-- the data useless for judging whether anyone would actually pay.

BEGIN;

CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  user_id         INTEGER      NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tier            VARCHAR(16)  NOT NULL,
  status          VARCHAR(16)  NOT NULL DEFAULT 'active',
  source          VARCHAR(24)  NOT NULL DEFAULT 'manual',

  started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- NULL means it does not expire. That is the honest representation of every
  -- premium account granted so far, rather than inventing an end date.
  expires_at      TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,

  -- Money, if any changed hands. amount_bdt is stored in whole taka: the
  -- currency's subunit (poisha) is not used in practice, and an integer avoids
  -- the rounding errors a float would introduce.
  amount_bdt      INTEGER,
  payment_ref     VARCHAR(128),

  -- Which admin granted a manual subscription. SET NULL rather than CASCADE:
  -- removing an administrator must not delete the record of what they granted.
  granted_by      INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  note            TEXT,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT subscriptions_tier_check   CHECK (tier IN ('free', 'premium')),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'expired', 'cancelled')),
  CONSTRAINT subscriptions_source_check CHECK (source IN ('manual', 'payment', 'signup', 'trial'))
);

-- Answers "is this account entitled right now" without scanning history.
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON subscriptions (user_id, status);

-- Lets an expiry sweep find just the rows that have lapsed.
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry
  ON subscriptions (expires_at)
  WHERE status = 'active' AND expires_at IS NOT NULL;

-- Backfill: every premium account that already exists got there through the
-- signup form, with no payment and no end date. Recording that is more useful
-- than leaving the table empty and pretending the history starts now.
INSERT INTO subscriptions (user_id, tier, status, source, started_at, note)
SELECT user_id, 'premium', 'active', 'signup', created_at,
       'Backfilled: tier was set at registration before subscriptions existed.'
  FROM users u
 WHERE u.tier = 'premium'
   AND NOT EXISTS (
     SELECT 1 FROM subscriptions s WHERE s.user_id = u.user_id
   );

COMMIT;
