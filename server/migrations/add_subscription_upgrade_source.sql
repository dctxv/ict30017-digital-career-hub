-- Let a subscription record say it came from an in-app upgrade.
--
-- subscriptions.source is constrained to manual, payment, signup and trial.
-- None of those describes what actually happens when someone on a free account
-- presses Upgrade on their own profile:
--
--   'signup'  is a lie about when it happened, and the account page renders it
--             as "Chosen at registration", which would be visibly wrong.
--   'manual'  means an administrator granted it, which misattributes the action
--             to a member of staff who did nothing.
--   'payment' claims money changed hands. No gateway is connected.
--   'trial'   implies an end date, and nothing sets or sweeps one.
--
-- So the set gains a value rather than one of the existing four being stretched
-- to cover a case it does not describe. The whole point of this table is that a
-- tier becomes a fact with a provenance instead of a column somebody set; a
-- provenance that is wrong is worse than no table at all.
--
-- Dropping and recreating the constraint is the only way to widen a CHECK in
-- Postgres. It is guarded so the migration stays idempotent, and it widens the
-- set rather than narrowing it, so no existing row can fail it.

BEGIN;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_source_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_source_check
  CHECK (source IN ('manual', 'payment', 'signup', 'trial', 'upgrade'));

COMMIT;
