// Groq context limit headroom: 12,000 chars ≈ ~3,000 tokens, leaving room for the system prompt.
const MAX_CHARS = 12000;

// Phrases that attempt to override the AI system prompt.
// Patterns are kept specific to avoid false positives on legitimate resume language
// (e.g. "act as a team player" would match a naive /act as/ pattern, so we require
// the phrase to be followed by a role-like noun rather than matching it blindly).
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/gi,
  /disregard\s+(your\s+)?(previous|above|prior|all)/gi,
  /forget\s+(your\s+)?(previous|prior|all)/gi,
  /you\s+are\s+now\s+(a|an)\s+\w+/gi,
  /new\s+(role|persona|instructions?)/gi,
  /\[system\]/gi,
  /<<SYS>>/gi,
];

/**
 * Sanitises extracted resume text before it is passed to the AI.
 * Removes HTML, embedded scripts, and prompt injection patterns.
 *
 * Architecture reference: AI Architecture Doc §4.1.2 Step 1
 * Security reference: AI Architecture Doc §5 — "Prompt injection via resume"
 *
 * @param {string} rawText - Raw extracted text from the file parser
 * @returns {string} - Cleaned plain text safe to include in an AI prompt
 */
export function sanitiseResumeText(rawText) {
  let text = rawText;

  // 1. Strip script/style blocks first (before stripping tags, to remove their content too)
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 2. Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // 3. Redact prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, '[REDACTED]');
  }

  // 4. Collapse runs of 3+ whitespace/newline characters down to a blank line
  text = text.replace(/\s{3,}/g, '\n\n');
  text = text.trim();

  // 5. Truncate to character limit
  if (text.length > MAX_CHARS) {
    console.warn(`[sanitise] Text truncated from ${text.length} to ${MAX_CHARS} chars.`);
    text = text.slice(0, MAX_CHARS);
  }

  return text;
}
