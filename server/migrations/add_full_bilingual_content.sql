-- Full bilingual coverage for career_paths (title/skills/progression) and
-- alumni (name/institution/role), per an explicit project decision to run
-- this project strictly in Bangla, overriding the earlier 'job titles and
-- skills stay English because job seekers search them that way' rule from
-- add_bilingual_content.sql. Software/tool/platform/certification product
-- names (Excel, PostgreSQL, React, AWS, AutoCAD, CFA, GMP...) are still kept
-- in Latin script -- those are brand names, not vocabulary, and the same
-- exception the rest of the codebase already makes for them.
--
-- Idempotent: safe to run more than once.

BEGIN;

ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS title_bn        TEXT;
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS skills_bn       JSONB;
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS progression_bn  JSONB;

ALTER TABLE alumni ADD COLUMN IF NOT EXISTS full_name_bn    TEXT;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS institution_bn  TEXT;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS current_role_bn TEXT;

COMMIT;
