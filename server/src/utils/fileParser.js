import fs from 'fs/promises';
import path from 'path';
import { getDocument, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import { itemsToText, nameHintFromItems } from './pdfText.js';

const MAGIC_BYTES = {
  '.pdf': Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]), // %PDF-
  '.docx': Buffer.from([0x50, 0x4B, 0x03, 0x04]),       // PK.. (ZIP)
};

async function validateMagicBytes(filePath, ext) {
  const expectedMagic = MAGIC_BYTES[ext];
  if (!expectedMagic) throw new Error(`Unsupported file type: ${ext}`);

  const handle = await fs.open(filePath, 'r');
  const buf = Buffer.alloc(expectedMagic.length);
  await handle.read(buf, 0, expectedMagic.length, 0);
  await handle.close();

  if (!buf.equals(expectedMagic)) {
    throw new Error(`File content does not match its extension. Expected a valid ${ext.slice(1).toUpperCase()} file.`);
  }
}

/**
 * Extracts plain text from an uploaded resume file.
 * Supports PDF and DOCX only.
 *
 * @param {string} filePath - Absolute path to the temp file on disk
 * @returns {Promise<string>} - Extracted plain text
 * @throws {Error} - If the file type is unsupported or extraction fails
 */
export async function extractText(filePath) {
  return (await extractResume(filePath)).text;
}

/**
 * extractText plus what the file's layout says about who wrote it.
 *
 * `nameHint` is the candidate's name as read from the largest type on page 1
 * of a PDF (null for DOCX, where the mask reads the header lines instead). It
 * is passed to the PII mask as an extra known name — the one reliable signal
 * for a guest, who has no account name, and for an account whose stored name
 * is not the one on the CV.
 *
 * @param {string} filePath
 * @returns {Promise<{text: string, nameHint: string|null}>}
 */
export async function extractResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext !== '.pdf' && ext !== '.docx') {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  await validateMagicBytes(filePath, ext);

  if (ext === '.pdf') {
    return extractFromPDF(filePath);
  }
  return { text: await extractFromDOCX(filePath), nameHint: null };
}

/**
 * Extract text from a PDF using pdfjs-dist (Mozilla, maintained).
 * Only the text layer is read — the binary file is never executed or rendered.
 * Security reference: AI Architecture Doc §5 — "Resume file abuse (malware)"
 */
async function extractFromPDF(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = new Uint8Array(buffer);

  // verbosity: ERRORS suppresses the "standardFontDataUrl" noise — we only
  // read the text layer, so glyph-rendering assets are irrelevant.
  const loadingTask = getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: false,
    verbosity: VerbosityLevel.ERRORS,
  });
  const pdf = await loadingTask.promise;

  // Lines are kept (see pdfText.js): the PII mask scopes what it removes to
  // a line, and reads the header by its lines.
  let fullText = '';
  let nameHint = null;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    if (i === 1) nameHint = nameHintFromItems(content.items);
    fullText += itemsToText(content.items) + '\n\n';
  }
  await pdf.cleanup();
  await pdf.destroy();

  if (!fullText.trim()) {
    throw new Error(
      'PDF appears to be empty or is a scanned image with no text layer. Only text-based PDFs are supported.'
    );
  }

  return { text: fullText, nameHint };
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
