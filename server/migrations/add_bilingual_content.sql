-- Bilingual columns for the remaining content tables.
--
-- resources has carried title_bn/description_bn since create_content_tables.sql,
-- and the resources API already resolves them per request with a COALESCE
-- fallback to English. career_paths, alumni and disciplines never got the same
-- treatment, so switching the site to Bangla translated the page furniture and
-- left every card, bio and career description in English — a half-Bangla site,
-- which reads worse than an English one.
--
-- WHAT IS AND IS NOT TRANSLATED
--
-- Only prose gets a _bn column. Job titles, employer names, institutions and
-- skills stay in the single existing column, in English, on purpose: a
-- Bangladeshi job seeker writes "Financial Analyst", "Excel" and "AutoCAD" in
-- English, searches Bdjobs for them in English, and puts them on an English CV.
-- Translating them would produce formally correct Bangla that nobody uses and
-- would break the match against real job adverts. This mirrors the rule the
-- chatbot and the resume reviewer already follow.
--
-- So: descriptions and bios are translated; titles, roles and skills are not.
-- The one exception is discipline names, which are navigation labels rather
-- than search terms, and read as labels in Bangla.
--
-- Every column is nullable with no default. A NULL means "not translated yet"
-- and the API falls back to English for that row and that field alone, so a
-- partial translation is safe to deploy.
--
-- Idempotent: safe to run more than once.

BEGIN;

-- ── disciplines ────────────────────────────────────────────────────────────
-- name_bn is a display label only. The English `name` remains the key that
-- career_paths.discipline, resources.discipline and alumni.discipline join on,
-- and the frontend filters on, so it must not change.
ALTER TABLE disciplines ADD COLUMN IF NOT EXISTS name_bn        TEXT;
ALTER TABLE disciplines ADD COLUMN IF NOT EXISTS description_bn TEXT;

-- ── career_paths ───────────────────────────────────────────────────────────
-- description_bn is the prose. industry_bn is the sector label shown as a tag.
-- title, skills and progression are deliberately absent: they are the terms a
-- user carries to a job advert.
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS description_bn TEXT;
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS industry_bn    TEXT;

-- ── alumni ─────────────────────────────────────────────────────────────────
-- bio_bn is the prose. industry_bn matches career_paths. full_name,
-- institution and current_role are proper nouns and job titles: they stay as
-- entered, in one column, for the same reason a person's name is not
-- translated on their business card.
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS bio_bn      TEXT;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS industry_bn TEXT;

COMMIT;
