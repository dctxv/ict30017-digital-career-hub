import express from 'express';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import upload from '../middleware/upload.js';
import { extractText } from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { resolveLanguage, translateMessage } from '../i18n/index.js';
import { redactPiiDeepWithFindings, createStreamRedactor } from '../utils/piiRedactor.js';
import { analyzeResume, analyzeResumeStream, getModel, extractGapsFromReview } from 'ai-service';
import { statusForAiErrorCode, isAiErrorCode } from '../utils/aiStatus.js';
import { reconcileGaps } from '../services/gapStore.js';
import pool from  '../db.js'; 
import { optionalAuth, requireAuth, requireActiveAccount } from '../middleware/auth.js';
import { attachReviewContext } from '../middleware/reviewContext.js';
import {
  enforceDailyReviewLimit,
  readReviewQuota,
  refundReview,
  FREE_DAILY_REVIEW_LIMIT,
} from '../middleware/reviewQuota.js';

const router = express.Router();

/**
 * Saves a completed review to the database for logged-in users.
 *
 * Guests (req.user.id === 'guest') are skipped entirely — nothing to attach
 * the review to. A DB failure here is logged but never breaks the response:
 * the user should still get their feedback even if saving history fails.
 *
 * Writes to resumes + ai_reviews. The full redacted feedback object goes in
 * with the scores: without it the row is a set of numbers with no way back to
 * what the user read, which defeats the point of keeping history at all.
 *
 * Provenance (model, tier, language, market mode) is recorded alongside so a
 * score stays interpretable months later, and so the effect of changing any of
 * them is measurable rather than anecdotal.
 *
 * Schema: server/migrations/create_review_history_tables.sql.
 */
async function saveReviewToDb({ userId, filename, jobAd, feedback, model, tier, language, marketMode }) {
  if (!userId || userId === 'guest') return null;

  try {
    const resumeResult = await pool.query(
      `INSERT INTO resumes (user_id, career_path_id, file_name, file_path, job_ad_text, uploaded_at)
       VALUES ($1, NULL, $2, NULL, $3, NOW())
       RETURNING resume_id`,
      [userId, filename, jobAd ?? null]
    );
    const resumeId = resumeResult.rows[0].resume_id;

    const summary = Array.isArray(feedback.action_items)
      ? feedback.action_items.join(' ')
      : null;

    const reviewResult = await pool.query(
      `INSERT INTO ai_reviews
         (resume_id, user_id, overall_score, ats_score, grammar_score, format_score,
          content_score, review_summary, feedback, model, tier, language, market_mode, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING review_id`,
      [
        resumeId,
        userId,
        feedback.overall_score ?? null,
        feedback.ats_analysis?.ats_score ?? null,
        feedback.language_grammar?.score ?? null,
        feedback.formatting?.score ?? null,
        feedback.content_quality?.score ?? null,
        summary,
        // The whole redacted object. Scores alone cannot rebuild the review the
        // user actually read, which is the thing history is for. Safe to store
        // because redactPiiDeepWithFindings has already run — never write the
        // raw model response here.
        JSON.stringify(feedback),
        model ?? null,
        tier ?? null,
        language ?? null,
        marketMode ?? null,
      ]
    );

    return reviewResult.rows[0].review_id;
  } catch (err) {
    console.error('[resume] Failed to save review to database:', err.message);
    return null;
  }
}

/**
 * Converts a finished review into the gaps behind it, after the user has their
 * feedback.
 *
 * A review already tells someone what is wrong with their resume. What it does
 * not do is say what they are missing for the role and how they close it, in a
 * form that can be tracked from one week to the next — that is the preparation
 * layer, and this is the review half of its input. The interview half emits the
 * same structure from its own evaluation call.
 *
 * Three deliberate choices here.
 *
 * It is fired and not awaited. It is a second model call, and a user watching a
 * spinner should not wait on work that is for the next time they visit their
 * plan. Both call sites invoke it after the response has been written.
 *
 * It is skipped for guests. A gap is stored against a person across analyses,
 * and there is no person to store it against — spending a call to produce
 * something that cannot be kept would be worse than not offering it.
 *
 * It never throws into anything. Like saveReviewToDb, a failure is logged and
 * swallowed: the user has already received their review, and there is no longer
 * a response to fail.
 */
function extractGapsInBackground({ userId, feedback, jobAd, jobRole, context, language, tier }) {
  if (!userId || userId === 'guest') return;

  Promise.resolve()
    .then(() => extractGapsFromReview(feedback, {
      jobAd,
      targetRole: jobRole ?? context?.targetRole,
      candidateStage: context?.candidateStage,
      language,
      tier,
    }))
    .then((result) => {
      if (!result.ok) {
        console.warn(`[gaps] Extraction skipped for user ${userId}: ${result.code}`);
        return null;
      }
      // Even an empty list is reconciled. A review that found nothing is exactly
      // when the previous analysis's gaps should close, and skipping the write
      // would leave a user who has fixed everything looking at a full board.
      return reconcileGaps({
        userId,
        gaps: result.gaps,
        source: result.source,
        targetRole: jobRole ?? context?.targetRole ?? null,
        language,
      });
    })
    .catch((err) => {
      console.error('[gaps] Background extraction failed:', err.message);
    });
}

/**
 * Logs which redaction rules fired, never what they matched.
 *
 * Medium-confidence rules are called out so a run of them is visible rather
 * than silent — see the precision/recall note in piiRedactor.js.
 */
function logPiiFindings(label, findings) {
  if (findings.length === 0) return;
  const summary = findings
    .map((f) => `${f.rule} x${f.count}${f.confidence === 'medium' ? ' (low confidence)' : ''}`)
    .join(', ');
  console.warn(`[resume] PII redacted from ${label}: ${summary}`);
}

/*
 * Burst guard, keyed on identity once we have one.
 *
 * This used to be a flat 5 per hour keyed on IP, which a single shared
 * university or NAT connection exhausted for everyone behind it. Signed-in
 * callers are now counted individually, so two users on the same IP no longer
 * consume each other's allowance. Guests keep an IP bucket, loosened for the
 * same shared-connection reason.
 *
 * This is only the burst guard. The real free tier allowance is the daily
 * per-user cap in middleware/reviewQuota.js.
 */
const AUTHENTICATED_HOURLY_BURST = 30;
const GUEST_HOURLY_BURST_PER_IP = 20;

/*
 * The AI model is chosen per tier inside ai-service (AI_MODEL_FREE vs
 * AI_MODEL_PREMIUM). Until this was threaded through, every request resolved
 * to the free model no matter what the account had, so the premium half of the
 * feasibility study could never activate. The tier is read from the database by
 * the quota middleware, never from the client.
 */
function resolveTier(res) {
  return res.locals.reviewQuota?.tier === 'premium' ? 'premium' : 'free';
}

/*
 * The validated review context, or all-unknown when none was supplied. The AI
 * service routes its channel, employer, stage and sector rules off this; without
 * it every field resolves to unknown and the routing does nothing.
 */
function resolveReviewContext(res) {
  return res.locals.reviewContext ?? {};
}

/*
 * Gives a claimed review back when the analysis did not happen. A no-op for
 * guests and unlimited accounts, which never claimed one.
 */
async function refundIfClaimed(req, res, reason) {
  if (res.locals.reviewQuota?.claimed === true) {
    await refundReview(req.user.id, reason);
  }
}

function isIdentified(req) {
  return Boolean(req.user) && req.user.id !== 'guest' && req.user.role !== 'guest';
}

const resumeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (isIdentified(req) ? AUTHENTICATED_HOURLY_BURST : GUEST_HOURLY_BURST_PER_IP),
  // express-rate-limit 7.5 exports no IPv6 normaliser, so the guest branch uses
  // req.ip as Express normalised it. The guest bucket is a coarse burst guard,
  // not a precise per-device quota, so that is accurate enough.
  keyGenerator: (req) => (isIdentified(req) ? `user:${req.user.id}` : `ip:${req.ip}`),
  standardHeaders: true,
  legacyHeaders: false,
  // The third gate. Without this line an hourly-burst rejection and a spent
  // daily allowance were both just a 429 in the log with nothing to tell them
  // apart — and the two need completely different responses.
  handler: (req, res, _next, options) => {
    console.log(`[quota] decision=reject user=${req.user?.id ?? 'guest'} reason=ip_hourly_burst key=${isIdentified(req) ? `user:${req.user.id}` : `ip:${req.ip}`} status=429`);
    res.status(options.statusCode).json(options.message);
  },
  message: { error: 'Too many resume analysis requests. Please try again in an hour.' },
});

/**
 * GET /api/resume/quota
 *
 * Reports the caller's remaining free reviews for today. The review page binds
 * its counter to this instead of the static text it used to render. Guests get
 * a null remaining count, which the page renders as a prompt to sign in.
 */
router.get('/quota', optionalAuth, async (req, res) => {
  if (!req.user || req.user.id === 'guest' || req.user.role === 'guest') {
    return res.json({
      authenticated: false,
      limit: FREE_DAILY_REVIEW_LIMIT,
      remaining: null,
      unlimited: false,
    });
  }

  try {
    const quota = await readReviewQuota(req.user.id);
    if (quota === null) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    return res.json({
      authenticated: true,
      tier: quota.tier,
      limit: quota.limit,
      used: quota.used,
      remaining: quota.remaining,
      unlimited: quota.unlimited,
    });
  } catch (err) {
    console.error('[resume] Quota lookup failed:', err.message);
    return res.status(500).json({ error: 'Could not read your review allowance.' });
  }
});

/**
 * POST /api/resume/analyze
 *
 * Accepts a PDF or DOCX resume file, extracts and sanitises the text,
 * and returns structured AI feedback.
 *
 * Auth middleware is not attached yet — slot it in before upload.single('resume')
 * once Pubuditha's JWT auth module is ready:
 *   router.post('/analyze', authMiddleware, upload.single('resume'), ...)
 *
 * Testing (no frontend):
 *   curl -X POST http://localhost:3000/api/resume/analyze \
 *     -F "resume=@/path/to/your/resume.pdf"
 */
// enforceDailyReviewLimit runs after the upload so a rejected file does not
// burn one of the caller's daily reviews.
router.post('/analyze', optionalAuth, resumeRateLimit, upload.single('resume'), attachReviewContext, enforceDailyReviewLimit, async (req, res) => {
  const uploadedFilePath = req.file?.path ?? null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Please attach a PDF or DOCX resume.',
      });
    }

    // Step 1 — Extract text from the uploaded file
    console.log(`[resume] Extracting text from: ${req.file.originalname}`);
    const rawText = await extractText(uploadedFilePath);

    // Step 2 — Sanitise extracted text
    const cleanText = sanitiseResumeText(rawText);
    console.log(`[resume] Sanitised text length: ${cleanText.length} chars`);

    // Step 3 — Call AI service
    console.log('[resume] Sending to AI service...');
    const jobRole = typeof req.body?.jobRole === 'string' ? req.body.jobRole.slice(0, 200) : undefined;
    const jobAd = typeof req.body?.jobAd === 'string' ? req.body.jobAd.slice(0, 4000) : undefined;
    const marketMode = req.body?.marketMode === 'international' ? 'international' : 'bangladesh';
    // Bound rather than inlined: the same value is recorded against the saved
    // review, so it has to be readable further down this handler.
    const language = req.body?.language === 'bn' ? 'bn' : resolveLanguage(req);
    const feedback = await analyzeResume(cleanText, {
      jobRole, jobAd, marketMode,
      language,
      tier: resolveTier(res),
      context: resolveReviewContext(res),
    });

    // A provider failure comes back as a code, already logged by ai-service
    // with the fix. Never 429: that is indistinguishable at the client from the
    // caller's own allowance being spent, which is what once made a throttled
    // provider surface as a review-limit message.
    if (isAiErrorCode(feedback.code)) {
      const status = statusForAiErrorCode(feedback.code);
      console.log(`[quota] decision=reject user=${req.user?.id ?? 'guest'} reason=${feedback.code} tier=${resolveTier(res)} status=${status}`);
      // The user got nothing, so the slot goes back. Without this a
      // misconfigured server spent all three daily reviews in a minute.
      await refundIfClaimed(req, res, feedback.code);
      return res.status(status).json({ error: feedback.error, code: feedback.code });
    }

    // Step 4 — Strip any candidate PII the model echoed back, before the
    // response leaves the server. Two models in the May 2026 feasibility study
    // echoed contact details despite the prompt forbidding it, so this runs
    // deterministically regardless of which model is configured. See
    // utils/piiRedactor.js.
    const { value: safeFeedback, findings } = redactPiiDeepWithFindings(feedback);
    logPiiFindings('analysis response', findings);

    // Step 5 — Save to history for logged-in users (skipped for guests)
    const reviewId = await saveReviewToDb({
      userId: req.user?.id,
      filename: req.file.originalname,
      jobAd,
      feedback: safeFeedback,
      model: getModel(resolveTier(res)),
      tier: resolveTier(res),
      language,
      marketMode,
    });

    // Step 6 — Return structured feedback
    res.status(200).json({
      success: true,
      filename: req.file.originalname,
      feedback: safeFeedback,
      reviewId,
    });

    // Step 7 — Turn the review into gaps, after the user has their feedback.
    extractGapsInBackground({
      userId: req.user?.id,
      feedback: safeFeedback,
      jobAd,
      jobRole,
      context: resolveReviewContext(res),
      language,
      tier: resolveTier(res),
    });

    return undefined;

  } catch (err) {
    console.error('[resume] Error during analysis:', err.message);
    await refundIfClaimed(req, res, 'analysis_failed');
    return res.status(500).json({
      error: 'An error occurred during resume analysis.',
    });

  } finally {
    // Always delete the temp file — success or failure.
    // Data minimisation requirement: SPR-10, FR-13.
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
      console.log(`[resume] Temp file deleted: ${uploadedFilePath}`);
    }
  }
});

/**
 * POST /api/resume/analyze-stream
 *
 * Same contract as /analyze but streams the AI output token-by-token as SSE.
 * The client accumulates tokens, tolerant-parses partial JSON, and renders
 * feedback cards progressively.
 *
 * Frames:
 *   data: {"t":"<token piece>"}\n\n
 *   data: {"done":true,"feedback":{...validated object...}}\n\n
 *   data: {"error":"<AI_* code>"|"INTERNAL","message":"..."}\n\n
 *
 * The AI_* codes are the provider-failure vocabulary in ai-service
 * (utils/aiErrors.js): AI_AUTH, AI_MODEL, AI_QUOTA, AI_BUSY, AI_UNAVAILABLE,
 * AI_UNREACHABLE, AI_BAD_REQUEST, AI_ERROR.
 */
// Same ordering as /analyze: the file must be accepted before quota is claimed.
router.post('/analyze-stream', optionalAuth, resumeRateLimit, upload.single('resume'), attachReviewContext, enforceDailyReviewLimit, async (req, res) => {
  const uploadedFilePath = req.file?.path ?? null;

  const writeFrame = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  try {
    if (!req.file) {
      res.status(400).json({
        error: 'No file uploaded. Please attach a PDF or DOCX resume.',
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    console.log(`[resume-stream] Extracting text from: ${req.file.originalname}`);
    const rawText = await extractText(uploadedFilePath);
    const cleanText = sanitiseResumeText(rawText);
    console.log(`[resume-stream] Sanitised text length: ${cleanText.length} chars`);

    console.log('[resume-stream] Streaming from AI service...');
    const jobRole = typeof req.body?.jobRole === 'string' ? req.body.jobRole.slice(0, 200) : undefined;
    const jobAd = typeof req.body?.jobAd === 'string' ? req.body.jobAd.slice(0, 4000) : undefined;
    const marketMode = req.body?.marketMode === 'international' ? 'international' : 'bangladesh';
    // The language the narrative feedback is written in. The form field wins so
    // an explicit choice on the upload panel is honoured; otherwise it falls
    // back to the same cookie the rest of the API reads.
    const language = req.body?.language === 'bn' ? 'bn' : resolveLanguage(req);
    // Tokens arrive a few characters at a time, so a phone number or email can
    // straddle a chunk boundary. The stream redactor buffers a trailing window
    // and only releases text once it is far enough from the write head to be
    // final — redacting each token in isolation would emit both halves intact.
    const streamRedactor = createStreamRedactor();

    const feedback = await analyzeResumeStream(cleanText, {
      onToken: (t) => {
        const safe = streamRedactor.push(t);
        if (safe) writeFrame({ t: safe });
      },
      jobRole,
      jobAd,
      marketMode,
      language,
      tier: resolveTier(res),
      context: resolveReviewContext(res),
    });

    if (isAiErrorCode(feedback?.code)) {
      // Same shape as the [quota] lines so one grep covers the whole chain.
      // This is the provider refusing us, not the caller running out. The
      // code travels in the frame so the error screen can name the cause.
      console.log(`[quota] decision=reject user=${req.user?.id ?? 'guest'} reason=${feedback.code} tier=${resolveTier(res)} status=${statusForAiErrorCode(feedback.code)}`);
      // SSE frames bypass res.json, so the localising middleware never sees
      // them. These two sites translate explicitly for that reason.
      writeFrame({ error: feedback.code, message: translateMessage(feedback.error, language) });
      res.end();
      await refundIfClaimed(req, res, feedback.code);
      return;
    }

    // Release the withheld tail now no more tokens can arrive.
    const tail = streamRedactor.flush();
    if (tail) writeFrame({ t: tail });

    // The authoritative payload is the parsed object, redacted per string
    // value rather than over serialised JSON so structure cannot be corrupted.
    const { value: safeFeedback, findings } = redactPiiDeepWithFindings(feedback);
    logPiiFindings('stream response', findings);

    const reviewId = await saveReviewToDb({
      userId: req.user?.id,
      filename: req.file.originalname,
      jobAd,
      feedback: safeFeedback,
      model: getModel(resolveTier(res)),
      tier: resolveTier(res),
      language,
      marketMode,
    });

    writeFrame({ done: true, filename: req.file.originalname, feedback: safeFeedback, reviewId });
    res.end();

    // The stream is closed, so this cannot delay anything the user is waiting
    // for. See extractGapsInBackground.
    extractGapsInBackground({
      userId: req.user?.id,
      feedback: safeFeedback,
      jobAd,
      jobRole,
      context: resolveReviewContext(res),
      language,
      tier: resolveTier(res),
    });

  } catch (err) {
    // Provider failures never reach here any more — ai-service returns them
    // as codes — so whatever lands in this block is ours: a file that would
    // not parse, a database write, a bug. The message is enough to find it;
    // the full object was forty lines of SDK internals.
    console.error('[resume-stream] Error during analysis:', err.message);
    if (res.headersSent) {
      writeFrame({ error: 'INTERNAL', message: translateMessage('Analysis failed.', resolveLanguage(req)) });
      res.end();
    } else {
      res.status(500).json({ error: 'Analysis failed.' });
    }
    await refundIfClaimed(req, res, 'analysis_failed');

  } finally {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
      console.log(`[resume-stream] Temp file deleted: ${uploadedFilePath}`);
    }
  }
});


/**
 * GET /api/resume/history
 *
 * Past reviews for the signed-in account, newest first.
 *
 * The feedback object is deliberately NOT returned here. It is by far the
 * largest column in the table, and a list of twenty reviews would carry twenty
 * full analyses across the wire to render twenty score chips. The account page
 * shows the score, the filename and the date; /history/:id fetches the analysis
 * itself when one is actually opened.
 *
 * Guests get 401 rather than an empty list. An empty list reads as "you have no
 * reviews" to someone who has run several and has simply lost their session.
 */
router.get('/history', requireAuth, requireActiveAccount, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.review_id, r.overall_score, r.ats_score, r.grammar_score,
              r.format_score, r.content_score, r.language, r.market_mode,
              r.created_at, res.file_name
         FROM ai_reviews r
         JOIN resumes res ON res.resume_id = r.resume_id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
        LIMIT 50`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[resume] History read failed:', err.message);
    return res.status(500).json({ error: 'Could not load your review history.' });
  }
});

/**
 * GET /api/resume/history/:id
 *
 * One past review in full, including the feedback the user actually read.
 *
 * user_id is in the WHERE clause rather than compared after the row is
 * fetched. Both refuse the request; only one of them cannot be undone by a
 * later edit that forgets the check, and the difference between the two is
 * somebody reading another account's resume analysis.
 *
 * A review belonging to someone else is 404, not 403. Confirming that a review
 * exists but is not yours is an answer nobody outside the account is owed.
 */
router.get('/history/:id', requireAuth, requireActiveAccount, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid review id.' });
  }

  try {
    const result = await pool.query(
      `SELECT r.review_id, r.overall_score, r.feedback, r.model, r.tier,
              r.language, r.market_mode, r.created_at, res.file_name
         FROM ai_reviews r
         JOIN resumes res ON res.resume_id = r.resume_id
        WHERE r.review_id = $1 AND r.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[resume] Review read failed:', err.message);
    return res.status(500).json({ error: 'Could not load that review.' });
  }
});

export default router;
