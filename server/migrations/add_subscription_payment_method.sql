-- How a subscription was paid for.
--
-- subscriptions already records WHO was granted a tier, WHEN, and under which
-- `source` — signup, manual, payment or trial. What it cannot record is the
-- instrument: bKash, Nagad or a card. On this market that distinction is the
-- interesting one. A Bangladeshi user choosing bKash over a card is the single
-- most useful signal the project can collect about whether anyone would
-- actually pay, and `source = 'signup'` throws it away.
--
-- Deliberately NOT a foreign key to a payment_methods table, and deliberately
-- not constrained to the three values the form offers today. A CHECK here would
-- have to be migrated every time a provider is added, and the column is
-- descriptive rather than authoritative — nothing is entitled by it.
--
-- WHAT IS NOT STORED, AND WILL NOT BE
--
-- No account number, no card number, no expiry, no CVC, no token. The
-- registration form collects a bKash or Nagad number and card details, and
-- none of it reaches the server: the client sends only the method name. There
-- is no gateway connected, so there is nothing to reconcile against, and
-- storing an unverified card number to reconcile against nothing is how a
-- student project ends up holding regulated data by accident.
--
-- When a real gateway is integrated, the thing to add is the provider's own
-- reference in payment_ref, not the instrument itself.

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(24);

COMMENT ON COLUMN subscriptions.payment_method IS
  'Instrument chosen at signup (bkash, nagad, card). Descriptive only; no account or card details are stored.';
