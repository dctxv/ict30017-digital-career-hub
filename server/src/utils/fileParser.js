import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded resume file.
 * Supports PDF and DOCX only.
 *
 * @param {string} filePath - Absolute path to the temp file on disk
 * @returns {Promise<string>} - Extracted plain text
 * @throws {Error} - If the file type is unsupported or extraction fails
 */
export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractFromPDF(filePath);
  } else if (ext === '.docx') {
    return extractFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Extract text from a PDF using pdf-parse.
 * Only the text layer is read — the binary file is never executed or rendered.
 * Security reference: AI Architecture Doc §5 — "Resume file abuse (malware)"
 */
async function extractFromPDF(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length === 0) {
    throw new Error(
      'PDF appears to be empty or is a scanned image with no text layer. Only text-based PDFs are supported.'
    );
  }

  return data.text;
}

/**
 * Extract text from a DOCX using mammoth.
 * extractRawText() strips all formatting — returns plain text only.
 */
async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });

  if (result.messages.length > 0) {
    // Log warnings (e.g. unsupported formatting elements) but do not throw —
    // partial extraction is better than rejecting a valid resume.
    console.warn('[fileParser] DOCX extraction warnings:', result.messages);
  }

  if (!result.value || result.value.trim().length === 0) {
    throw new Error('DOCX file appears to be empty.');
  }

  return result.value;
}
