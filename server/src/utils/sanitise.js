/**
 * Module: sanitise
 * Responsibility: Clean extracted resume text before sending to the AI.
 *
 * Defences:
 *  1. Repair PDF-parser line-break artefacts
 *  2. Strip <script>/<style> block content
 *  3. Strip remaining HTML tags
 *  4. Decode common HTML entities (prevents entity-encoded injection)
 *  5. Strip Unicode symbol ranges mangled by PDF parsers
 *  6. Redact prompt-injection patterns
 *  7. Redact PII patterns (NID, phone numbers, passport numbers)
 *  8. Collapse excess whitespace
 *  9. Truncate to character limit
 *
 * Architecture reference: AI Architecture Doc §4.1.2 Step 1
 * Security reference:     AI Architecture Doc §5 — "Prompt injection via resume"
 */

// Groq context limit headroom: 12,000 chars ≈ ~3,000 tokens
const MAX_CHARS = 12000;

// Prompt-injection patterns — kept specific to avoid false positives on
// legitimate resume language (e.g. "act as a team player").
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/gi,
  /disregard\s+(your\s+)?(previous|above|prior|all)/gi,
  /forget\s+(your\s+)?(previous|prior|all)/gi,
  /you\s+are\s+now\s+(a|an)\s+\w+/gi,
  /new\s+(role|persona|instructions?)/gi,
  /\[system\]/gi,
  /<<SYS>>/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /###\s*(system|instruction|prompt)/gi,
  /\[INST\]/gi,
  /\/\*.*?\*\//gs,   // C-style block comments sometimes used to hide injections
];

// PII patterns: Bangladesh NID (13-17 digits), phone numbers, passport
const PII_PATTERNS = [
  /\b\d{13,17}\b/g,                                           // NID
  /(?<!\d)(\+8801[3-9]\d{8}|8801[3-9]\d{8}|01[3-9]\d{8})(?!\d)/g, // BD phone
  /\b[A-Z]{1,2}[0-9]{7}\b/gi,                                // Passport
];

// Unicode symbol ranges PDF parsers mangle into garbage
const SYMBOL_RANGE = /[\u2000-\u27FF\uFF00-\uFFEF]/g;

// Simple HTML entity map for decoding (prevents entity-encoded injections)
const HTML_ENTITIES = {
  '&lt;':   '<',
  '&gt;':   '>',
  '&amp;':  '&',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;':  "'",
  '&nbsp;': ' ',
};

function decodeHtmlEntities(text) {
  return text.replace(
    /&(?:lt|gt|amp|quot|#x27|#39|nbsp);/gi,
    match => HTML_ENTITIES[match.toLowerCase()] ?? match
  );
}

/**
 * Sanitises extracted resume text before it is passed to the AI.
 *
 * @param {string} rawText - Raw extracted text from the file parser
 * @returns {string} - Cleaned plain text safe to include in an AI prompt
 */
export function sanitiseResumeText(rawText) {
  let text = rawText;

  // 1. Repair line breaks inserted mid-word or mid-sentence by PDF parsers
  text = text.replace(/(\w)-\n(\w)/g, '$1$2');  // rejoin hyphenated breaks
  text = text.replace(/(\w)\n(\w)/g, '$1 $2');   // rejoin bare mid-word breaks
  text = text.replace(/ {2,}/g, ' ');            // collapse extra spaces

  // 2. Strip script/style block content before tag stripping
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 3. Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // 4. Decode HTML entities (entity-encoded injections survive step 3)
  text = decodeHtmlEntities(text);

  // 5. Replace mangled Unicode symbols with spaces
  text = text.replace(SYMBOL_RANGE, ' ');

  // 6. Redact prompt-injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, '[REDACTED]');
  }

  // 7. Redact PII patterns
  for (const pattern of PII_PATTERNS) {
    text = text.replace(pattern, '[REDACTED]');
  }

  // 8. Collapse runs of 3+ whitespace/newline characters
  text = text.replace(/\s{3,}/g, '\n\n');
  text = text.trim();

  // 9. Truncate to character limit
  if (text.length > MAX_CHARS) {
    console.warn(`[sanitise] Text truncated from ${text.length} to ${MAX_CHARS} chars.`);
    text = text.slice(0, MAX_CHARS);
  }

  return text;
}
