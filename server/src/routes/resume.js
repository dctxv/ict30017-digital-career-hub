import express from 'express';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import upload from '../middleware/upload.js';
import { extractText } from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { redactPiiDeepWithFindings, createStreamRedactor } from '../utils/piiRedactor.js';
import { analyzeResume, analyzeResumeStream } from 'ai-service';
import { optionalAuth } from '../middleware/auth.js';
import { attachReviewContext } from '../middleware/reviewContext.js';
import {
  enforceDailyReviewLimit,
  readReviewQuota,
  FREE_DAILY_REVIEW_LIMIT,
} from '../middleware/reviewQuota.js';

const router = express.Router();

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
    const feedback = await analyzeResume(cleanText, {
      jobRole, jobAd, marketMode,
      tier: resolveTier(res),
      context: resolveReviewContext(res),
    });

    if (feedback.code === 'RATE_LIMIT') {
      return res.status(429).json({ error: feedback.error });
    }

    // Step 4 — Strip any candidate PII the model echoed back, before the
    // response leaves the server. Two models in the May 2026 feasibility study
    // echoed contact details despite the prompt forbidding it, so this runs
    // deterministically regardless of which model is configured. See
    // utils/piiRedactor.js.
    const { value: safeFeedback, findings } = redactPiiDeepWithFindings(feedback);
    logPiiFindings('analysis response', findings);

    // Step 5 — Return structured feedback
    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      feedback: safeFeedback,
    });

  } catch (err) {
    console.error('[resume] Error during analysis:', err);
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
 *   data: {"error":"RATE_LIMIT"|"INTERNAL","message":"..."}\n\n
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
      tier: resolveTier(res),
      context: resolveReviewContext(res),
    });

    if (feedback?.code === 'RATE_LIMIT') {
      writeFrame({ error: 'RATE_LIMIT', message: feedback.error });
      res.end();
      return;
    }

    // Release the withheld tail now no more tokens can arrive.
    const tail = streamRedactor.flush();
    if (tail) writeFrame({ t: tail });

    // The authoritative payload is the parsed object, redacted per string
    // value rather than over serialised JSON so structure cannot be corrupted.
    const { value: safeFeedback, findings } = redactPiiDeepWithFindings(feedback);
    logPiiFindings('stream response', findings);

    writeFrame({ done: true, filename: req.file.originalname, feedback: safeFeedback });
    res.end();

  } catch (err) {
    console.error('[resume-stream] Error during analysis:', err);
    if (res.headersSent) {
      writeFrame({ error: 'INTERNAL', message: 'Analysis failed.' });
      res.end();
    } else {
      res.status(500).json({ error: 'Analysis failed.' });
    }

  } finally {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
      console.log(`[resume-stream] Temp file deleted: ${uploadedFilePath}`);
    }
  }
});

export default router;
