-- Module: backfill_resource_reliability  [DRAFT — NOT YET APPLIED TO ANY DATABASE]
--
-- Marks every resource that exists as of this migration as 'verified'.
-- This is safe specifically at this point in the migration history because,
-- by now, every one of the 54 resources in the table has actually been
-- checked by hand (not assumed):
--   - the 12 new-sector resources were verified when they were written
--     (add_new_sector_resources.sql)
--   - 32 resources had their links fixed and re-verified by
--     fix_tier1_resource_links.sql, run just before this one
--   - the remaining 10 were audited and confirmed genuinely live and
--     on-topic without needing a link change
--
-- A resource added after this point through the Admin panel will default to
-- 'unverified' (see add_resource_source_reliability.sql) until someone
-- checks it and flips it to verified.
--
-- THIS IS A DRAFT FOR REVIEW. Not yet added to migrationOrder.js — add it
-- after add_resource_source_reliability.sql.

BEGIN;

UPDATE resources SET source_reliability = 'verified';

COMMIT;
