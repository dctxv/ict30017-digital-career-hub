import express from 'express';
import fs from 'fs';
import upload from '../middleware/upload.js';
import { extractText } from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { analyzeResume, analyzeResumeStream } from '../../../ai-service/index.js';

const router = express.Router();

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
router.post('/analyze', upload.single('resume'), async (req, res) => {
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
    const feedback = await analyzeResume(cleanText, { jobRole, jobAd, marketMode });

    if (feedback.code === 'RATE_LIMIT') {
      return res.status(429).json({ error: feedback.error });
    }

    // Step 4 — Return structured feedback
    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      feedback,
    });

  } catch (err) {
    console.error('[resume] Error during analysis:', err.message);
    // Never expose internal stack traces to the client
    return res.status(500).json({
      error: err.message || 'An error occurred during resume analysis.',
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
router.post('/analyze-stream', upload.single('resume'), async (req, res) => {
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
    console.error('[resume-stream] Error during analysis:', err.message);
    if (res.headersSent) {
      writeFrame({ error: 'INTERNAL', message: err.message || 'Analysis failed.' });
      res.end();
    } else {
      res.status(500).json({ error: err.message || 'Analysis failed.' });
    }

  } finally {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
      console.log(`[resume-stream] Temp file deleted: ${uploadedFilePath}`);
    }
  }
});

export default router;
