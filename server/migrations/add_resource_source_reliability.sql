-- Module: add_resource_source_reliability  [DRAFT — NOT YET APPLIED TO ANY DATABASE]
--
-- Adds a `source_reliability` column to resources, so the Resources page
-- can show students a simple "Verified source" / "Unverified source" badge
-- per the client's request: know whether a resource's source is authentic,
-- and acknowledge where it's coming from.
--
-- Defaults to 'unverified' — including for any resource added later through
-- the Admin panel — so a resource only shows as verified once someone has
-- actually checked it, rather than looking trustworthy by default.
--
-- THIS IS A DRAFT FOR REVIEW. Not yet added to migrationOrder.js — add it
-- after fix_tier1_resource_links.sql.

BEGIN;

ALTER TABLE resources
  ADD COLUMN source_reliability VARCHAR(20) NOT NULL DEFAULT 'unverified';

ALTER TABLE resources
  ADD CONSTRAINT resources_source_reliability_check
  CHECK (source_reliability IN ('verified', 'unverified'));

COMMIT;
