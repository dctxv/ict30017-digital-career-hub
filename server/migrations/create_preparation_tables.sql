-- Mock interview and preparation.
--
-- Preparation is not a third feature beside the resume review and the chatbot.
-- It is the shared output layer of the review and the mock interview: the review
-- produces action items, the interview produces identified weaknesses, and both
-- convert into the same Gap record. That is why there is one gap table fed by
-- two sources rather than a table per feature.
--
-- WHY GAPS ARE KEYED PER USER, NOT PER RESUME
--
-- The point of storing a gap at all is to show it closing. A gap stored against
-- a resume can only ever be a list; a gap stored against a person, matched on
-- gap_key across every analysis they run, is progress. So the unique key is
-- (user_id, gap_key) and a second analysis updates the row rather than inserting
-- beside it.
--
-- gap_key is the load-bearing column and the reason this table can work at all.
-- The model returns it from a constrained vocabulary — 'skill:sql',
-- 'evidence:work-experience' — and ai-service normalises it before it arrives
-- here, because free-text descriptions never match across runs and a store keyed
-- on prose accumulates duplicates it can never close.
--
-- THREE STATUSES, NOT TWO
--
-- open, closed and dismissed. Closed means an earlier analysis found it and the
-- latest one did not, which is the thing worth celebrating. Dismissed means the
-- user said it does not apply. Collapsing the two would let somebody clear their
-- board by disagreeing with it and be congratulated for improving, so the
-- progress figure counts closed and ignores dismissed. It is also weighted by
-- severity rather than counted — see GAP_SEVERITY_WEIGHT in ai-service — or
-- three trivial fixes would outrank the qualification the job actually required.
--
-- WHAT IS STORED, AND WHAT DELIBERATELY IS NOT
--
-- The resume text is not here, for the same reason it is not in `resumes`:
-- uploads are deleted from disk after analysis (SPR-10, FR-13) and storing the
-- extracted text would undo that. An interview reads the resume in memory and
-- keeps nothing but the questions it produced.
--
-- The job advertisement IS stored with the interview, matching resumes.job_ad_text.
-- It is what makes the comparison reproducible and lets the profile say which
-- role an analysis was run against, which is what turns a score history into
-- something meaningful rather than a number over time. It is also the open
-- question for the client: whether that text is retained indefinitely or purged
-- after analysis is a privacy decision, and it should be answered before launch
-- rather than after. There is deliberately no cleanup job here — an unadvertised
-- one would quietly delete history someone is relying on.
--
-- Interview answers are the sensitive column. They are free text about the
-- user's own career, the same category as chat_messages.content, and they carry
-- the same protections: guests are never stored, and deleting a user destroys
-- them outright rather than anonymising them.

BEGIN;

-- ── user_gaps ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_gaps (
  gap_id       SERIAL PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  -- 'category:subject', normalised in ai-service before it reaches here.
  gap_key      TEXT        NOT NULL,

  source       VARCHAR(20) NOT NULL,
  category     VARCHAR(20) NOT NULL,
  description  TEXT        NOT NULL,
  severity     VARCHAR(20) NOT NULL,
  closeable    VARCHAR(20) NOT NULL,

  -- { steps: [], resource_query: '', effort: '', alternative_role: null }.
  -- JSONB rather than four columns: steps is a list, and the shape differs by
  -- category — a credential gap carries a cost and a duration, an experience gap
  -- carries the adjacent role instead.
  remediation  JSONB       NOT NULL DEFAULT '{}'::jsonb,

  status       VARCHAR(16) NOT NULL DEFAULT 'open',

  -- The role the gap was found against, so a gap raised for one application is
  -- readable months later rather than being an unexplained line on a board.
  target_role  TEXT,
  -- The language the description was written in. A Bangla user who switches to
  -- English keeps their gaps; the interface says which language each was written
  -- in rather than silently showing the wrong one.
  language     VARCHAR(10),

  first_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at    TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  CONSTRAINT user_gaps_source_check
    CHECK (source IN ('resume', 'interview', 'role_comparison')),
  CONSTRAINT user_gaps_category_check
    CHECK (category IN ('skill', 'credential', 'evidence', 'experience')),
  CONSTRAINT user_gaps_severity_check
    CHECK (severity IN ('blocking', 'significant', 'minor')),
  CONSTRAINT user_gaps_closeable_check
    CHECK (closeable IN ('now', 'months', 'not_short_term')),
  CONSTRAINT user_gaps_status_check
    CHECK (status IN ('open', 'closed', 'dismissed'))
);

-- The constraint the whole feature rests on. Without it a re-run inserts beside
-- the previous detection instead of updating it, and nothing ever closes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_gaps_identity
  ON user_gaps (user_id, gap_key);

-- The board's own query: this user's gaps, worst first.
CREATE INDEX IF NOT EXISTS idx_user_gaps_user_status
  ON user_gaps (user_id, status, severity);

-- ── mock_interviews ────────────────────────────────────────────────────────
-- One row per interview, holding both halves of it. The questions are written
-- on creation and the answers and evaluation on submission, which is why
-- everything after `questions` is nullable: an interview a user starts and
-- abandons is a real state, and it should read as abandoned rather than as
-- corrupt.
--
-- resume_id is intentionally absent. An interview may be run against a resume
-- that was never saved as a review — the upload is parsed in memory and deleted
-- — so a foreign key here would be null on most rows and would imply a link the
-- feature does not actually have.
CREATE TABLE IF NOT EXISTS mock_interviews (
  interview_id    SERIAL PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  -- 1 role only, 2 with a resume, 3 with a resume and an advertisement. Stored
  -- so a low score is readable against how much the model was actually given.
  tier_level      SMALLINT    NOT NULL DEFAULT 1,

  target_role     TEXT,
  candidate_stage VARCHAR(32),
  resume_file_name TEXT,
  job_ad_text     TEXT,

  questions       JSONB       NOT NULL,
  answers         JSONB,
  evaluation      JSONB,
  overall_score   INTEGER,

  status          VARCHAR(16) NOT NULL DEFAULT 'in_progress',

  -- Provenance, matching ai_reviews: which model, under which tier, in which
  -- language — so a score stays interpretable months later and the effect of
  -- changing any of them is measurable rather than anecdotal.
  model           TEXT,
  tier            VARCHAR(16),
  language        VARCHAR(10),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,

  CONSTRAINT mock_interviews_status_check
    CHECK (status IN ('in_progress', 'complete', 'abandoned')),
  CONSTRAINT mock_interviews_tier_level_check
    CHECK (tier_level BETWEEN 1 AND 3)
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_created
  ON mock_interviews (user_id, created_at DESC);

-- ── quota counters ─────────────────────────────────────────────────────────
-- Same shape as resume_review_count and chat_message_count: a counter plus the
-- date it belongs to, reset by comparison rather than by a scheduled job, so a
-- server that was switched off overnight still hands out a fresh allowance.
ALTER TABLE users ADD COLUMN IF NOT EXISTS mock_interview_count      INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mock_interview_reset_date DATE;

COMMIT;
