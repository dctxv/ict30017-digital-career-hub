/**
 * Module: preparation route
 * Responsibility: The gap board, and the two calls a mock interview is made of.
 *
 * WHY THIS IS ONE ROUTER AND NOT TWO
 *
 * The mock interview and the gap board are the same feature seen from either
 * end. An interview's output is gaps; the board's most useful input is an
 * interview. Splitting them would mean two routers importing the same store, the
 * same vocabulary and the same quota, and the interview's most demonstrable
 * moment — a question aimed at a gap the resume review already found — crossing
 * a module boundary for no reason.
 *
 * WHY EVERYTHING HERE REQUIRES AN ACCOUNT
 *
 * The resume review serves guests, and this deliberately does not. The value of
 * an interview is not the five questions; it is that what they reveal joins what
 * the review found, on one board, for one person, over time. A guest has no row
 * to attach that to, so an anonymous interview would spend two model calls to
 * produce something that is thrown away when the tab closes. Signing in is a
 * smaller ask than that trade.
 *
 * THE UPLOAD IS NEVER STORED
 *
 * A tier 2 or 3 interview reads a resume, and that resume is parsed in memory
 * and deleted in the finally block, exactly as the review does it (SPR-10,
 * FR-13). What persists is the questions it produced and the file's name.
 */

import express from 'express';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import {
  generateInterviewQuestions,
  evaluateInterview,
  JOB_AD_MAX_CHARS,
  ANSWER_MAX_CHARS,
  ROLE_MAX_CHARS,
  CANDIDATE_STAGES,
} from 'ai-service';
import pool from '../db.js';
import upload from '../middleware/upload.js';
import { extractText } from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { redactPiiDeepWithFindings } from '../utils/piiRedactor.js';
import { requireAuth, requireActiveAccount } from '../middleware/auth.js';
import { resolveLanguage } from '../i18n/index.js';
import { statusForAiErrorCode, isAiErrorCode } from '../utils/aiStatus.js';
import {
  enforceDailyInterviewLimit,
  readInterviewQuota,
  refundInterview,
} from '../middleware/interviewQuota.js';
import {
  listGaps,
  attachResources,
  readGapSummary,
  setGapStatus,
  readOpenGapsForPrompt,
  reconcileGaps,
} from '../services/gapStore.js';

const router = express.Router();

/*
 * Burst guard, on top of the daily allowance.
 *
 * Keyed on the user rather than the IP throughout, because every route here is
 * behind requireAuth and a shared university connection would otherwise let one
 * student exhaust the bucket for a lab full of them — the same problem the
 * resume limiter was rekeyed to fix.
 */
const preparationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 40,
  keyGenerator: (req) => `user:${req.user?.id ?? 'anonymous'}`,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    console.log(`[quota] decision=reject feature=interview user=${req.user?.id ?? 'guest'} reason=hourly_burst status=429`);
    res.status(options.statusCode).json(options.message);
  },
  message: { error: 'Too many preparation requests. Please try again in an hour.' },
});

// Every route below belongs to one signed-in person and takes no user id from
// the caller, matching /api/users.
router.use(requireAuth, requireActiveAccount);

/* ── Helpers ───────────────────────────────────────────────────────── */

function readRole(value) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, ROLE_MAX_CHARS) : null;
}

function readStage(value) {
  return CANDIDATE_STAGES.includes(value) ? value : 'unknown';
}

/**
 * Reads the pasted advertisement, capped.
 *
 * Users paste whole pages, navigation and cookie banners included. The cap is
 * the same one the resume review applies to the same field, so the two features
 * cannot disagree about how much of an advertisement counts.
 */
function readJobAd(value) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, JOB_AD_MAX_CHARS) : null;
}

/**
 * The profile facts an interview may use about the person.
 *
 * The account page collects a discipline, an institution and a graduation
 * year, and until this was read the interview knew none of it: a final-year
 * student and a graduate of three years typing the same role got the same five
 * questions. These are the user's own statements about themselves, which is
 * what makes them usable at tier 1 where nothing else about the candidate is.
 *
 * Null when all three are blank, so the prompt composer leaves the profile
 * guidance out rather than announcing a profile above an empty block.
 */
async function readCandidateProfile(userId) {
  const result = await pool.query(
    'SELECT discipline, institution, graduation_year FROM users WHERE user_id = $1',
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;

  const profile = {
    discipline: row.discipline ?? null,
    institution: row.institution ?? null,
    graduationYear: row.graduation_year ?? null,
  };
  return Object.values(profile).some((value) => value !== null && value !== '') ? profile : null;
}

/** Maps an ai-service failure code onto the status the client expects. */
function statusForCode(code) {
  // Provider failures carry an AI_* code and map through the shared table —
  // never to 429, which is indistinguishable at the client from the caller's
  // own allowance being spent and once told a premium account it had reached
  // a limit it does not have. UNREADABLE and INVALID mean the provider
  // answered and the answer was unusable, which is a bad gateway.
  return isAiErrorCode(code) ? statusForAiErrorCode(code) : 502;
}

/* ── GET /api/preparation/gaps ─────────────────────────────────────── */

/*
 * The board. Every gap ever found for this account, with the resource links
 * resolved against the curated library rather than invented by the model.
 */
router.get('/gaps', async (req, res) => {
  const lang = resolveLanguage(req);

  try {
    const gaps = await listGaps(req.user.id);
    const withResources = await attachResources(gaps, lang);
    return res.json(withResources);
  } catch (err) {
    console.error('[preparation] Gap read failed:', err.message);
    return res.status(500).json({ error: 'Could not load your preparation plan.' });
  }
});

/* ── GET /api/preparation/summary ──────────────────────────────────── */

/*
 * The progress figure and what to do next.
 *
 * Separate from /gaps because the profile page wants the headline without
 * carrying every gap and its remediation steps across the wire to render one
 * percentage — the same reasoning that keeps the feedback object out of
 * /api/resume/history.
 */
router.get('/summary', async (req, res) => {
  try {
    return res.json(await readGapSummary(req.user.id));
  } catch (err) {
    console.error('[preparation] Summary read failed:', err.message);
    return res.status(500).json({ error: 'Could not load your progress.' });
  }
});

/* ── PATCH /api/preparation/gaps/:id ───────────────────────────────── */

/*
 * Dismiss a gap, or bring a dismissed one back.
 *
 * Dismissing is not closing, and this is the route where the difference is
 * created rather than merely stored: a dismissed gap leaves the progress figure
 * entirely instead of counting towards it, so nobody can improve their score by
 * disagreeing with the analysis.
 *
 * Whether a dismissal should be permanent is one of the open questions for the
 * client. It is reversible here because the reversible version is the one that
 * can be made permanent later without anyone losing anything.
 */
router.patch('/gaps/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid gap id.' });
  }

  const status = req.body?.status;
  if (status !== 'dismissed' && status !== 'open') {
    // 'closed' is deliberately not accepted. Closing is something an analysis
    // concludes, never something the user asserts — a self-serve close button
    // would make the whole progress figure worthless.
    return res.status(400).json({ error: 'A gap can only be dismissed or restored.' });
  }

  try {
    const updated = await setGapStatus(req.user.id, id, status);
    // Somebody else's gap is 404, not 403. Confirming that a gap exists but is
    // not yours is an answer nobody outside the account is owed.
    if (!updated) return res.status(404).json({ error: 'Gap not found.' });
    return res.json(updated);
  } catch (err) {
    console.error('[preparation] Gap update failed:', err.message);
    return res.status(500).json({ error: 'Could not update that gap.' });
  }
});

/* ── GET /api/preparation/quota ────────────────────────────────────── */

router.get('/quota', async (req, res) => {
  try {
    const quota = await readInterviewQuota(req.user.id);
    if (quota === null) return res.status(401).json({ error: 'Authentication required.' });
    return res.json({
      authenticated: true,
      tier: quota.tier,
      limit: quota.limit,
      used: quota.used,
      remaining: quota.remaining,
      unlimited: quota.unlimited,
    });
  } catch (err) {
    console.error('[preparation] Quota lookup failed:', err.message);
    return res.status(500).json({ error: 'Could not read your interview allowance.' });
  }
});

/* ── POST /api/preparation/interviews ──────────────────────────────── */

/*
 * Starts an interview: one model call, five questions, nothing answered yet.
 *
 * The resume is optional and arrives as a file rather than as an id. There is no
 * id to use — the extracted text of a past upload is deliberately never stored
 * — and asking for the file again is what keeps that true.
 *
 * enforceDailyInterviewLimit runs after the upload so a rejected file does not
 * burn one of the caller's daily interviews, matching the review's ordering.
 */
router.post(
  '/interviews',
  preparationRateLimit,
  upload.single('resume'),
  enforceDailyInterviewLimit,
  async (req, res) => {
    const uploadedFilePath = req.file?.path ?? null;
    const language = req.body?.language === 'bn' ? 'bn' : resolveLanguage(req);
    const claimed = res.locals.interviewQuota?.claimed === true;

    try {
      const targetRole = readRole(req.body?.targetRole);
      const candidateStage = readStage(req.body?.candidateStage);
      const jobAd = readJobAd(req.body?.jobAd);

      let resumeText;
      if (uploadedFilePath) {
        const rawText = await extractText(uploadedFilePath);
        resumeText = sanitiseResumeText(rawText);
        console.log(`[interview] Resume supplied: ${req.file.originalname}, ${resumeText.length} chars`);
      }

      // The gaps the resume review already found. This is what lets one of the
      // five questions aim at a real, previously identified weakness, which is
      // the thing that proves the two features are connected rather than sitting
      // beside each other.
      const [knownGaps, profile] = await Promise.all([
        readOpenGapsForPrompt(req.user.id),
        readCandidateProfile(req.user.id),
      ]);

      const result = await generateInterviewQuestions({
        targetRole,
        candidateStage,
        resumeText,
        jobAd,
        knownGaps,
        profile,
        language,
        tier: res.locals.interviewQuota?.tier === 'premium' ? 'premium' : 'free',
      });

      if (!result.ok) {
        // The user paid an interview for nothing. Give it back before telling
        // them it failed — otherwise the allowance quietly funds our outages.
        if (claimed) await refundInterview(req.user.id);
        return res.status(statusForCode(result.code)).json({ error: result.error, code: result.code });
      }

      // The questions can quote the resume, and two models in the May 2026
      // feasibility study echoed contact details despite the prompt forbidding
      // it. Same deterministic guard the review applies, for the same reason.
      const { value: safeQuestions } = redactPiiDeepWithFindings(result.questions);

      const inserted = await pool.query(
        `INSERT INTO mock_interviews
           (user_id, tier_level, target_role, candidate_stage, resume_file_name,
            job_ad_text, questions, status, model, tier, language, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', $8, $9, $10, NOW())
         RETURNING interview_id, created_at`,
        [
          req.user.id,
          result.tier,
          result.inferredRole || targetRole,
          candidateStage,
          req.file?.originalname ?? null,
          jobAd,
          JSON.stringify(safeQuestions),
          result.model,
          res.locals.interviewQuota?.tier ?? 'free',
          language,
        ]
      );

      return res.status(201).json({
        interviewId: inserted.rows[0].interview_id,
        tierLevel: result.tier,
        role: result.inferredRole || targetRole,
        focus: result.focus,
        questions: safeQuestions,
        profileUsed: profile !== null,
        createdAt: inserted.rows[0].created_at,
      });
    } catch (err) {
      console.error('[interview] Could not start the interview:', err.message);
      if (claimed) await refundInterview(req.user.id);
      return res.status(500).json({ error: 'Could not start the interview.' });
    } finally {
      // Always delete the temp file — success or failure. SPR-10, FR-13.
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
        console.log(`[interview] Temp file deleted: ${uploadedFilePath}`);
      }
    }
  }
);

/* ── POST /api/preparation/interviews/:id/answers ──────────────────── */

/*
 * The second and last model call: mark the transcript, emit gaps, reconcile the
 * board.
 *
 * No allowance is claimed here. It was claimed when the questions were written,
 * because that is the half somebody can trigger repeatedly by reloading, and
 * charging twice for one interview would make the counter mean nothing.
 *
 * The questions come out of the database rather than off the request. They were
 * written by the model, redacted, and stored; taking them back from the client
 * would let a caller mark themselves against five questions of their own
 * invention, and would put unvalidated text into the evaluation prompt.
 */
router.post('/interviews/:id/answers', preparationRateLimit, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid interview id.' });
  }

  const submitted = Array.isArray(req.body?.answers) ? req.body.answers : null;
  if (!submitted) {
    return res.status(400).json({ error: 'Answers are required.' });
  }

  try {
    const existing = await pool.query(
      `SELECT interview_id, tier_level, target_role, candidate_stage, job_ad_text,
              questions, status, tier, language
         FROM mock_interviews
        WHERE interview_id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const interview = existing.rows[0];
    if (interview.status === 'complete') {
      // Re-submitting would spend a second model call to overwrite results the
      // user is already looking at. The finished interview is the answer.
      return res.status(409).json({ error: 'This interview has already been assessed.' });
    }

    const questions = Array.isArray(interview.questions) ? interview.questions : [];
    const answers = submitted
      .map((entry) => ({
        index: Number(entry?.index),
        answer: typeof entry?.answer === 'string' ? entry.answer.slice(0, ANSWER_MAX_CHARS) : '',
      }))
      .filter((entry) => Number.isInteger(entry.index));

    if (answers.every((entry) => entry.answer.trim() === '')) {
      // Nothing to assess. Refusing costs the user nothing; running would spend
      // a model call to be told, correctly, that they answered nothing.
      return res.status(400).json({ error: 'Answer at least one question before submitting.' });
    }

    const language = req.body?.language === 'bn' ? 'bn' : (interview.language ?? resolveLanguage(req));

    // Read again rather than stored with the interview: the same three fields
    // the questions were written against, as they stand now.
    const profile = await readCandidateProfile(req.user.id);

    const result = await evaluateInterview({
      questions,
      answers,
      tierLevel: interview.tier_level,
      targetRole: interview.target_role,
      candidateStage: interview.candidate_stage,
      jobAd: interview.job_ad_text,
      profile,
      language,
      tier: interview.tier === 'premium' ? 'premium' : 'free',
    });

    if (!result.ok) {
      // The answers are kept even though the assessment failed. They are the
      // part the user actually wrote, and losing them to a provider hiccup would
      // mean typing five answers again.
      await pool.query(
        'UPDATE mock_interviews SET answers = $2 WHERE interview_id = $1',
        [id, JSON.stringify(answers)]
      );
      return res.status(statusForCode(result.code)).json({ error: result.error, code: result.code });
    }

    const { value: safeEvaluation } = redactPiiDeepWithFindings(result.evaluation);
    const { value: safeGaps } = redactPiiDeepWithFindings(result.gaps);

    await pool.query(
      `UPDATE mock_interviews
          SET answers = $2, evaluation = $3, overall_score = $4,
              status = 'complete', model = $5, completed_at = NOW()
        WHERE interview_id = $1`,
      [id, JSON.stringify(answers), JSON.stringify(safeEvaluation), safeEvaluation.overall_score, result.model]
    );

    // The half that makes this a feature rather than a quiz. A failure here must
    // not lose the assessment the user is waiting for, so it is logged and the
    // response goes out regardless — the same stance saveReviewToDb takes.
    let reconciled = null;
    try {
      reconciled = await reconcileGaps({
        userId: req.user.id,
        gaps: safeGaps,
        source: 'interview',
        targetRole: interview.target_role,
        language,
      });
    } catch (err) {
      console.error('[interview] Could not reconcile gaps from this interview:', err.message);
    }

    return res.json({
      interviewId: id,
      evaluation: safeEvaluation,
      gaps: safeGaps,
      gapsChanged: reconciled,
    });
  } catch (err) {
    console.error('[interview] Assessment failed:', err.message);
    return res.status(500).json({ error: 'Could not assess this interview.' });
  }
});

/* ── GET /api/preparation/interviews ───────────────────────────────── */

/*
 * Past interviews, newest first.
 *
 * The questions, answers and evaluation are all deliberately absent, for the
 * reason /api/resume/history omits the feedback object: they are by far the
 * largest columns, and a list of twenty interviews would carry twenty full
 * transcripts across the wire to render twenty score chips.
 */
router.get('/interviews', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT interview_id, tier_level, target_role, candidate_stage, resume_file_name,
              overall_score, status, language, created_at, completed_at,
              (job_ad_text IS NOT NULL) AS had_job_ad
         FROM mock_interviews
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[preparation] Interview history read failed:', err.message);
    return res.status(500).json({ error: 'Could not load your interview history.' });
  }
});

/* ── GET /api/preparation/interviews/:id ───────────────────────────── */

/*
 * One interview in full, including whatever state it is in.
 *
 * user_id is in the WHERE clause rather than checked after the row is fetched,
 * and a row belonging to somebody else is 404 rather than 403 — the same two
 * rules the review history route follows, and for the same reasons.
 */
router.get('/interviews/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid interview id.' });
  }

  try {
    const result = await pool.query(
      `SELECT interview_id, tier_level, target_role, candidate_stage, resume_file_name,
              job_ad_text, questions, answers, evaluation, overall_score, status,
              model, tier, language, created_at, completed_at
         FROM mock_interviews
        WHERE interview_id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[preparation] Interview read failed:', err.message);
    return res.status(500).json({ error: 'Could not load that interview.' });
  }
});

export default router;
