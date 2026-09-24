/**
 * Module: preparation route
 * Responsibility: The gap board, and the calls a mock interview is made of.
 *
 * TWO MODES, ONE INTERVIEW
 *
 * An interview runs written (five questions on a page, typed, submitted
 * together) or live (one question at a time, dictated in the browser, on a
 * clock). Both are created by POST /interviews and assessed by
 * POST /interviews/:id/answers — the same two calls, the same generator, the
 * same evaluator, the same gap reconciliation. The mode is a column, not a
 * branch: nothing below forks on it except the transcript annotation and one
 * prompt block, both of which live in ai-service.
 *
 * POST /interviews/:id/next is the live mode's only addition, and it does two
 * things: it saves the answers so far, so an interview answered over several
 * minutes survives a closed tab, and for premium accounts it may spend one
 * small model call on a question that reacts to what was just said. It never
 * fails the caller — see its own note.
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
  generateFollowUpQuestion,
  orderQuestions,
  JOB_AD_MAX_CHARS,
  ANSWER_MAX_CHARS,
  ROLE_MAX_CHARS,
  CANDIDATE_STAGES,
  INTERVIEW_MODES,
  LIVE_FOLLOW_UP_CAP,
  inspectMaskedPii,
  resumeMaskContext,
} from 'ai-service';
import pool from '../db.js';
import upload from '../middleware/upload.js';
import { extractResume } from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { redactPiiDeepWithFindings } from '../utils/piiRedactor.js';
import { readAccountIdentity } from '../utils/accountIdentity.js';
import { withNameHint } from '../utils/maskIdentity.js';
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

/**
 * Which mode the interview is being conducted in.
 *
 * Anything unrecognised is 'written'. That is the mode every interview ran in
 * before live mode existed and the one that needs nothing from the browser, so
 * it is the safe answer to a value this server does not understand.
 *
 * Bangla is forced to written. Speech recognition here is English-only — agreed
 * with the client, because Bengali speech models are a paid API this project
 * has no budget for — and a live interview whose microphone cannot be used is a
 * worse experience than the written one it replaced. The client hides the
 * option in Bangla; this is what makes that true rather than merely displayed.
 */
function readMode(value, language) {
  const mode = INTERVIEW_MODES.includes(value) ? value : 'written';
  if (mode === 'live' && language === 'bn') {
    console.log('[interview] Live mode requested in Bangla; running written. Speech is English-only.');
    return 'written';
  }
  return mode;
}

/** Longest a single answer may be recorded as having taken, in seconds. */
const ANSWER_SECONDS_CAP = 3600;

/** How an answer was produced. Recorded only when the client actually says. */
const ANSWER_SOURCES = new Set(['speech', 'typed']);

/**
 * Reads the answers off a request.
 *
 * `seconds` and `source` are the live mode's additions and are omitted entirely
 * rather than defaulted when they are absent, which is what keeps a written
 * interview's stored answers byte-identical to the ones written before live
 * mode existed. A defaulted `seconds: 0` would be a claim that somebody
 * answered instantly.
 *
 * The clamp is not about storage. The duration reaches the evaluation prompt,
 * and a tab left open over lunch would otherwise tell the model an answer took
 * nine hours — which is not a fact about the candidate.
 */
function readAnswers(submitted) {
  return submitted
    .map((entry) => {
      const seconds = Number(entry?.seconds);
      const source = typeof entry?.source === 'string' ? entry.source : null;
      return {
        index: Number(entry?.index),
        answer: typeof entry?.answer === 'string' ? entry.answer.slice(0, ANSWER_MAX_CHARS) : '',
        ...(Number.isFinite(seconds) && seconds >= 0
          ? { seconds: Math.min(Math.round(seconds), ANSWER_SECONDS_CAP) }
          : {}),
        ...(ANSWER_SOURCES.has(source) ? { source } : {}),
      };
    })
    .filter((entry) => Number.isInteger(entry.index));
}

/**
 * Whether this account's live interviews may ask reactive follow-up questions.
 *
 * Follow-ups are the one part of this feature that costs a model call per turn,
 * so they are premium. That is not a paywall around the live mode — a free
 * account gets the whole live interview, one question at a time, dictated,
 * timed and marked, for exactly the two calls a written interview has always
 * cost. What premium buys is the interview reacting to what was just said.
 *
 * `unlimited` is accepted alongside the tier so an admin demonstrating the
 * feature sees it work. Their allowance is already unlimited for the same
 * reason.
 */
function canAskFollowUps(quota) {
  return Boolean(quota) && (quota.unlimited === true || quota.tier === 'premium');
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
      const mode = readMode(req.body?.mode, language);

      let resumeText;
      let nameHint = null;
      if (uploadedFilePath) {
        // nameHint is the name read off the CV's largest type, for the PII mask.
        const extracted = await extractResume(uploadedFilePath);
        resumeText = sanitiseResumeText(extracted.text);
        nameHint = extracted.nameHint;
        console.log(`[interview] Resume supplied: ${req.file.originalname}, ${resumeText.length} chars`);
      }

      // The gaps the resume review already found. This is what lets one of the
      // five questions aim at a real, previously identified weakness, which is
      // the thing that proves the two features are connected rather than sitting
      // beside each other.
      const [knownGaps, profile, accountIdentity, quota] = await Promise.all([
        readOpenGapsForPrompt(req.user.id),
        readCandidateProfile(req.user.id),
        // The known strings the outbound mask uses on top of its patterns.
        readAccountIdentity(req.user.id),
        // Read rather than taken from res.locals, which holds what the limiter
        // claimed and not the account's standing. Follow-ups are a tier
        // question, not an allowance question.
        readInterviewQuota(req.user.id),
      ]);
      const identity = withNameHint(accountIdentity, nameHint);
      // Exactly what the mask removes from the CV, so the redactor can catch
      // any of it quoted back in a question. In memory only.
      const maskedValues = resumeText
        ? inspectMaskedPii(resumeText, resumeMaskContext(resumeText, identity), { collectValues: true }).values
        : [];

      const result = await generateInterviewQuestions({
        targetRole,
        candidateStage,
        resumeText,
        jobAd,
        knownGaps,
        profile,
        language,
        tier: res.locals.interviewQuota?.tier === 'premium' ? 'premium' : 'free',
        identity,
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
      const { value: safeQuestions } = redactPiiDeepWithFindings(result.questions, identity, maskedValues);

      const inserted = await pool.query(
        `INSERT INTO mock_interviews
           (user_id, tier_level, target_role, candidate_stage, resume_file_name,
            job_ad_text, questions, status, model, tier, language, mode, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress', $8, $9, $10, $11, NOW())
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
          mode,
        ]
      );

      return res.status(201).json({
        interviewId: inserted.rows[0].interview_id,
        tierLevel: result.tier,
        role: result.inferredRole || targetRole,
        focus: result.focus,
        questions: safeQuestions,
        profileUsed: profile !== null,
        mode,
        // Whether this interview may ask reactive questions, decided here and
        // not in the browser. The client uses it to know whether asking for a
        // next question is worth a round trip; the /next route enforces it
        // regardless of what the client believes.
        followUpsAvailable: mode === 'live' && canAskFollowUps(quota),
        followUpsRemaining: mode === 'live' && canAskFollowUps(quota) ? LIVE_FOLLOW_UP_CAP : 0,
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

/* ── POST /api/preparation/interviews/:id/next ─────────────────────── */

/*
 * The live mode's reactive turn: save what has been answered so far, and decide
 * whether to ask a follow-up before the next planned question.
 *
 * ALWAYS 200, EVEN WHEN NOTHING IS ASKED
 *
 * Declining to ask is the normal outcome, not an error — a free account never
 * asks, a complete answer does not need probing, and the cap runs out after
 * two. So is a provider failure: the candidate is mid-interview with the next
 * planned question already written and waiting, and failing this request would
 * strand them in front of a spinner over a question that was optional. Every
 * one of those returns `question: null` with a reason, and the interview walks
 * on. The reason is for the log and for the client's own bookkeeping, not for
 * an error message.
 *
 * THE ANSWERS ARE SAVED HERE, AND THAT IS HALF THE POINT
 *
 * A written interview is typed on one page and submitted in one go, so there is
 * nothing to lose until the end. A live interview is answered over several
 * minutes, one question at a time, and a closed tab at question four used to
 * mean four answers gone. Persisting on every turn is what makes the existing
 * "resume an unfinished interview" path work for a mode that can actually be
 * interrupted.
 *
 * NO ALLOWANCE IS CLAIMED. The interview was paid for when its questions were
 * written. What IS claimed is the follow-up counter, and it is incremented
 * BEFORE the call rather than after it, for the reason the daily quota is
 * claimed at generation: a call that succeeds at the provider and fails on the
 * way back has been spent, and a counter that only counts successes would let a
 * retry loop spend it repeatedly.
 */
router.post('/interviews/:id/next', preparationRateLimit, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid interview id.' });
  }

  const afterIndex = Number(req.body?.afterIndex);
  if (!Number.isInteger(afterIndex)) {
    return res.status(400).json({ error: 'The question just answered is required.' });
  }

  const submitted = Array.isArray(req.body?.answers) ? req.body.answers : null;
  if (!submitted) {
    return res.status(400).json({ error: 'Answers are required.' });
  }

  try {
    const existing = await pool.query(
      `SELECT interview_id, tier_level, target_role, candidate_stage, job_ad_text,
              questions, status, tier, language, mode, follow_up_count
         FROM mock_interviews
        WHERE interview_id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const interview = existing.rows[0];
    if (interview.status === 'complete') {
      return res.status(409).json({ error: 'This interview has already been assessed.' });
    }

    const answers = readAnswers(submitted);

    // Saved first and unconditionally. Whatever this route decides about a
    // follow-up, the answers are the part the candidate actually produced.
    await pool.query(
      'UPDATE mock_interviews SET answers = $2 WHERE interview_id = $1',
      [id, JSON.stringify(answers)]
    );

    const decline = (reason) => res.json({ question: null, reason, followUpsRemaining: 0 });

    // A written interview has no turns to react between.
    if (interview.mode !== 'live') return decline('not_live');

    const questions = Array.isArray(interview.questions) ? interview.questions : [];
    const ordered = orderQuestions(questions);
    const position = ordered.findIndex((item) => Number(item?.index) === afterIndex);
    if (position === -1) {
      return res.status(400).json({ error: 'That question is not part of this interview.' });
    }

    // Nothing follows the last question but the results screen. A probe here
    // would extend an interview the candidate has been told is ending.
    if (position === ordered.length - 1) return decline('interview_ending');

    const used = Number(interview.follow_up_count) || 0;
    if (used >= LIVE_FOLLOW_UP_CAP) return decline('cap_reached');

    const quota = await readInterviewQuota(req.user.id);
    if (!canAskFollowUps(quota)) return decline('premium_only');

    // Claimed before the call. See the note above on why this is not done after.
    await pool.query(
      'UPDATE mock_interviews SET follow_up_count = follow_up_count + 1 WHERE interview_id = $1',
      [id]
    );
    const remaining = Math.max(LIVE_FOLLOW_UP_CAP - (used + 1), 0);

    const refundFollowUp = () => pool.query(
      'UPDATE mock_interviews SET follow_up_count = GREATEST(follow_up_count - 1, 0) WHERE interview_id = $1',
      [id]
    );

    const [profile, identity] = await Promise.all([
      readCandidateProfile(req.user.id),
      readAccountIdentity(req.user.id),
    ]);

    const nextIndex = Math.max(0, ...questions.map((item) => Number(item?.index) || 0)) + 1;
    const language = req.body?.language === 'bn' ? 'bn' : (interview.language ?? resolveLanguage(req));

    let result;
    try {
      result = await generateFollowUpQuestion({
        questions,
        answers,
        currentIndex: afterIndex,
        nextIndex,
        tierLevel: interview.tier_level,
        targetRole: interview.target_role,
        candidateStage: interview.candidate_stage,
        jobAd: interview.job_ad_text,
        profile,
        language,
        tier: interview.tier === 'premium' ? 'premium' : 'free',
        identity,
      });
    } catch (err) {
      // A throw here is a bug in the call, not a provider failure. It still must
      // not end the candidate's interview.
      console.error('[interview-followup] Follow-up threw:', err.message);
      await refundFollowUp();
      return decline('unavailable');
    }

    if (!result.ok) {
      // The provider failed. The next planned question is already written, so
      // this costs the candidate nothing but the counter, which goes back.
      console.error(`[interview-followup] Provider failure (${result.code}); continuing without a follow-up.`);
      await refundFollowUp();
      return decline('unavailable');
    }

    if (!result.question) {
      // The model read the answer and judged it complete. A real outcome, and
      // the reason the counter is NOT refunded: the call was made and spent.
      return res.json({ question: null, reason: 'not_needed', followUpsRemaining: remaining });
    }

    // Same deterministic guard the planned questions get. A probe quotes the
    // candidate's own answer back at them, which is exactly the payload most
    // likely to carry a name.
    const { value: safeQuestion } = redactPiiDeepWithFindings(result.question, identity);

    // Spliced in at the position it was asked, not appended. The stored array
    // is the order of the conversation — a probe about answer 2 belongs after
    // answer 2, and putting it last would hand the evaluator a transcript in an
    // order the interview never had.
    const withFollowUp = ordered.slice();
    withFollowUp.splice(position + 1, 0, safeQuestion);

    await pool.query(
      'UPDATE mock_interviews SET questions = $2 WHERE interview_id = $1',
      [id, JSON.stringify(withFollowUp)]
    );

    return res.json({
      question: safeQuestion,
      reason: 'asked',
      followUpsRemaining: remaining,
    });
  } catch (err) {
    console.error('[interview-followup] Could not decide on a follow-up:', err.message);
    // Even an unexpected failure must not strand the candidate mid-interview.
    return res.json({ question: null, reason: 'unavailable', followUpsRemaining: 0 });
  }
});

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
              questions, status, tier, language, mode
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
    const answers = readAnswers(submitted);

    if (answers.every((entry) => entry.answer.trim() === '')) {
      // Nothing to assess. Refusing costs the user nothing; running would spend
      // a model call to be told, correctly, that they answered nothing.
      return res.status(400).json({ error: 'Answer at least one question before submitting.' });
    }

    const language = req.body?.language === 'bn' ? 'bn' : (interview.language ?? resolveLanguage(req));

    // Read again rather than stored with the interview: the same three fields
    // the questions were written against, as they stand now.
    const [profile, identity] = await Promise.all([
      readCandidateProfile(req.user.id),
      readAccountIdentity(req.user.id),
    ]);

    const result = await evaluateInterview({
      questions,
      answers,
      tierLevel: interview.tier_level,
      // The mode comes out of the database, never off the request. It decides
      // whether the evaluator is told these answers were dictated, and a caller
      // able to set it could ask for transcription leniency on a written
      // interview that never had any.
      mode: interview.mode === 'live' ? 'live' : 'written',
      targetRole: interview.target_role,
      candidateStage: interview.candidate_stage,
      jobAd: interview.job_ad_text,
      profile,
      language,
      tier: interview.tier === 'premium' ? 'premium' : 'free',
      identity,
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

    const { value: safeEvaluation } = redactPiiDeepWithFindings(result.evaluation, identity);
    const { value: safeGaps } = redactPiiDeepWithFindings(result.gaps, identity);

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
              overall_score, status, language, mode, created_at, completed_at,
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
              model, tier, language, mode, follow_up_count, created_at, completed_at
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
