/**
 * Module: resume route
 * Responsibility: Accept PDF/DOCX uploads, extract text, return AI feedback.
 *
 * Security:
 *  - requireAuth: only logged-in users can upload (slot in before upload.single)
 *  - resumeRateLimit: 5 requests/IP/hour to protect AI quota
 *  - Magic-byte validation: fileParser.js rejects disguised file types
 *  - Temp file always deleted in finally block (data minimisation)
 *  - No internal error details leak to clients
 */

import express      from 'express';
import fs           from 'fs';
import rateLimit    from 'express-rate-limit';
import upload       from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { extractText }        from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { analyzeResume, analyzeResumeStream } from '../../../ai-service/index.js';

const router = express.Router();

const resumeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many resume analysis requests. Please try again in an hour.' },
});

// ── POST /api/resume/analyze ──────────────────────────────────────
router.post(
  '/analyze',
  resumeRateLimit,
  requireAuth,           // ← auth guard now active
  upload.single('resume'),
  async (req, res) => {
    const uploadedFilePath = req.file?.path ?? null;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded. Please attach a PDF or DOCX resume.',
        });
      }

      console.log(`[resume] Extracting text from: ${req.file.originalname} (user ${req.user.id})`);
      const rawText   = await extractText(uploadedFilePath);
      const cleanText = sanitiseResumeText(rawText);
      console.log(`[resume] Sanitised text length: ${cleanText.length} chars`);

      const jobRole   = typeof req.body?.jobRole   === 'string' ? req.body.jobRole.slice(0, 200)  : undefined;
      const jobAd     = typeof req.body?.jobAd     === 'string' ? req.body.jobAd.slice(0, 4000)   : undefined;
      const marketMode = req.body?.marketMode === 'international' ? 'international' : 'bangladesh';

      const feedback = await analyzeResume(cleanText, { jobRole, jobAd, marketMode });

      if (feedback.code === 'RATE_LIMIT') {
        return res.status(429).json({ error: feedback.error });
      }

      return res.status(200).json({
        success: true,
        filename: req.file.originalname,
        feedback,
      });
    } catch (err) {
      console.error('[resume] Error during analysis:', err);
      return res.status(500).json({ error: 'An error occurred during resume analysis.' });
    } finally {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
        console.log(`[resume] Temp file deleted: ${uploadedFilePath}`);
      }
    }
  }
);

// ── POST /api/resume/analyze-stream ──────────────────────────────
router.post(
  '/analyze-stream',
  resumeRateLimit,
  requireAuth,           // ← auth guard now active
  upload.single('resume'),
  async (req, res) => {
    const uploadedFilePath = req.file?.path ?? null;

    const writeFrame = (obj) => {
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded. Please attach a PDF or DOCX resume.',
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      console.log(`[resume-stream] Extracting text from: ${req.file.originalname} (user ${req.user.id})`);
      const rawText   = await extractText(uploadedFilePath);
      const cleanText = sanitiseResumeText(rawText);

      const jobRole   = typeof req.body?.jobRole   === 'string' ? req.body.jobRole.slice(0, 200)  : undefined;
      const jobAd     = typeof req.body?.jobAd     === 'string' ? req.body.jobAd.slice(0, 4000)   : undefined;
      const marketMode = req.body?.marketMode === 'international' ? 'international' : 'bangladesh';

      const feedback = await analyzeResumeStream(cleanText, {
        onToken: (t) => writeFrame({ t }),
        jobRole,
        jobAd,
        marketMode,
      });

      if (feedback?.code === 'RATE_LIMIT') {
        writeFrame({ error: 'RATE_LIMIT', message: feedback.error });
        res.end();
        return;
      }

      writeFrame({ done: true, filename: req.file.originalname, feedback });
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
  }
);

export default router;
