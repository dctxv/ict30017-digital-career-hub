import express from 'express';
import fs from 'fs';
import upload from '../middleware/upload.js';
import { extractText } from '../utils/fileParser.js';
import { sanitiseResumeText } from '../utils/sanitise.js';
import { analyzeResume } from '../../../ai-service/index.js';

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
    const feedback = await analyzeResume(cleanText);

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

export default router;
