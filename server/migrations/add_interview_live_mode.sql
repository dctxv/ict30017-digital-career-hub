-- The live interview mode.
--
-- The mock interview gains a second way of being conducted: questions delivered
-- one at a time, answered out loud through the browser's own speech
-- recognition, on a running clock. It is a PRESENTATION of the same interview,
-- not a second feature — the same generator writes the questions, the same
-- evaluator marks them, and the same gap board receives what they reveal — so
-- it reuses mock_interviews rather than getting a table of its own.
--
-- WHY THE MODE IS STORED AT ALL
--
-- Because a score is not comparable across the two without it. Answering out
-- loud, one question at a time, unable to go back and revise, is a harder
-- exercise than typing five answers on one page at leisure. A 62 in each is not
-- the same finding, and a history that could not tell them apart would show a
-- candidate getting worse at the moment they started practising properly.
--
-- Same reasoning as the model, tier and language columns beside it: provenance
-- that keeps an old score interpretable.
--
-- WHY THE FOLLOW-UP COUNTER IS A COLUMN AND NOT A COUNT
--
-- A live interview may ask up to LIVE_FOLLOW_UP_CAP reactive questions, each
-- costing a model call. Counting the follow_up entries in `questions` would
-- work right up until a call succeeds at the provider and fails on the way
-- back, at which point the cap has been spent and nothing records it. The
-- counter is incremented when the call is MADE, for the same reason the
-- interview allowance is claimed when questions are generated rather than when
-- answers are submitted.
--
-- WHAT IS NOT ADDED HERE
--
-- No audio, and no column that could hold any. Speech recognition runs entirely
-- in the candidate's browser; what reaches this server is the text they saw,
-- reviewed and chose to submit. There is no recording to store, which is the
-- strongest version of the promise the rest of this feature already makes about
-- uploads.
--
-- Per-answer timing and whether an answer was spoken or typed live inside the
-- existing `answers` JSONB, as extra keys on each entry. A written interview
-- writes neither, and its rows are byte-identical to the ones written before
-- this migration existed.

BEGIN;

ALTER TABLE mock_interviews
  ADD COLUMN IF NOT EXISTS mode VARCHAR(16) NOT NULL DEFAULT 'written';

ALTER TABLE mock_interviews
  ADD COLUMN IF NOT EXISTS follow_up_count SMALLINT NOT NULL DEFAULT 0;

-- Added separately and guarded, because ADD CONSTRAINT has no IF NOT EXISTS and
-- this migration must be safe to re-run on a database that already has it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mock_interviews_mode_check'
  ) THEN
    ALTER TABLE mock_interviews
      ADD CONSTRAINT mock_interviews_mode_check CHECK (mode IN ('written', 'live'));
  END IF;
END $$;

COMMIT;
