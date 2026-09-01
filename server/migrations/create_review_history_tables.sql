-- Resume review history.
--
-- routes/resume.js has been inserting into `resumes` and `ai_reviews` since
-- 2026-08-26, but no migration ever created them: they existed only in the
-- database of whoever typed the CREATE TABLE by hand. Because saveReviewToDb
-- wraps its insert in a try/catch that logs and returns null, the failure was
-- silent — every user still got their feedback, nothing looked broken, and the
-- review simply never saved. This is that migration.
--
-- SHAPE
--
-- Column names follow the existing INSERT statements exactly, so the running
-- code needs no change to keep working. That means resume_id and review_id
-- rather than the plain `id` the content tables use. The inconsistency is
-- deliberate here — matching live code beats matching a convention — but it is
-- worth settling before more tables copy it.
--
-- Every column is added with ADD COLUMN IF NOT EXISTS after the CREATE, not
-- just declared inside it. A hand-made table already exists on at least one
-- machine, and CREATE TABLE IF NOT EXISTS would silently skip it and leave that
-- database missing the columns added below. This way both converge.
--
-- WHAT IS STORED, AND WHY feedback MATTERS
--
-- The scores alone cannot rebuild a review. `feedback` holds the whole
-- validated object the user actually saw, which is what makes history worth
-- having: showing a past review, comparing a re-written CV against an earlier
-- one, and having real output to test prompt changes against.
--
-- It is safe to store because it is the REDACTED copy. routes/resume.js runs
-- redactPiiDeepWithFindings before saving, so candidate contact details are
-- already stripped. Never write the raw model response here.
--
-- The resume text itself is deliberately NOT stored. Uploads are deleted from
-- disk after analysis (SPR-10, FR-13) and keeping the text would undo that.

BEGIN;

-- ── resumes ────────────────────────────────────────────────────────────────
-- One row per analysed upload. file_path stays nullable: the temp file is
-- deleted in the route's finally block, so there is usually nothing to point at.
CREATE TABLE IF NOT EXISTS resumes (
  resume_id      SERIAL PRIMARY KEY,
  user_id        INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  career_path_id INTEGER,
  file_name      TEXT        NOT NULL,
  file_path      TEXT,
  job_ad_text    TEXT,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS career_path_id INTEGER;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS job_ad_text    TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_resumes_user_uploaded
  ON resumes (user_id, uploaded_at DESC);

-- ── ai_reviews ─────────────────────────────────────────────────────────────
-- user_id is denormalised from resumes on purpose: "my last five reviews" is
-- the query this table exists to answer, and it should not need a join.
CREATE TABLE IF NOT EXISTS ai_reviews (
  review_id      SERIAL PRIMARY KEY,
  resume_id      INTEGER     NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
  user_id        INTEGER     NOT NULL REFERENCES users(user_id)     ON DELETE CASCADE,
  overall_score  INTEGER,
  ats_score      INTEGER,
  grammar_score  INTEGER,
  format_score   INTEGER,
  review_summary TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- content_score was missing from the original insert even though the results
-- page renders it beside the other three.
ALTER TABLE ai_reviews ADD COLUMN IF NOT EXISTS content_score INTEGER;

-- The full redacted feedback object. Without it the row is a set of numbers
-- with no way back to what the user read.
ALTER TABLE ai_reviews ADD COLUMN IF NOT EXISTS feedback JSONB;

-- Provenance. Which model produced this, under which tier, in which language
-- and for which market — so a score is interpretable months later, and so the
-- effect of changing any of them is measurable rather than anecdotal.
ALTER TABLE ai_reviews ADD COLUMN IF NOT EXISTS model       TEXT;
ALTER TABLE ai_reviews ADD COLUMN IF NOT EXISTS tier        VARCHAR(16);
ALTER TABLE ai_reviews ADD COLUMN IF NOT EXISTS language    VARCHAR(10);
ALTER TABLE ai_reviews ADD COLUMN IF NOT EXISTS market_mode VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_ai_reviews_user_created
  ON ai_reviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_resume
  ON ai_reviews (resume_id);

COMMIT;
