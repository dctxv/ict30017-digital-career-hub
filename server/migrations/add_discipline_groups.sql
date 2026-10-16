-- Module: add_discipline_groups
--
-- Client feedback (P83 client meeting, 2026-09-17): the discipline filter on
-- Career Paths and Resources reads as near-duplicates — "science, IT,
-- engineering... three categories kind of sounds similar" — and asked for
-- them grouped under a shared umbrella label, broken down underneath.
--
-- This adds group_name / group_name_bn to disciplines, purely as a
-- presentation-layer grouping for the filter bar. `disciplines.name` stays
-- untouched and keeps being the join key into career_paths, resources and
-- alumni (see create_content_tables.sql) — nothing about how existing content
-- is tagged changes, so no career path, resource or alumni row needs
-- re-tagging for this to take effect.
--
-- A discipline with no group recorded (any added later without filling the
-- field in) falls back to its own name as its group, both in the UI and in
-- the UPDATE below — so nothing silently disappears from the filter bar for
-- lacking a group.

ALTER TABLE disciplines ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE disciplines ADD COLUMN IF NOT EXISTS group_name_bn TEXT;

UPDATE disciplines SET group_name = 'Technology', group_name_bn = 'প্রযুক্তি ও বিজ্ঞান'
  WHERE name IN ('IT', 'Engineering', 'Science');

UPDATE disciplines SET group_name = 'Business & Finance', group_name_bn = 'ব্যবসা ও অর্থনীতি'
  WHERE name IN ('Finance', 'Business');

UPDATE disciplines SET group_name = 'Humanities & Education', group_name_bn = 'মানবিক ও শিক্ষা'
  WHERE name IN ('Arts', 'Education');

-- Anything added before this migration that the three groups above do not
-- name falls back to being its own group, so it still renders as a top-level
-- pill rather than vanishing from the filter bar.
UPDATE disciplines SET group_name = name WHERE group_name IS NULL;
