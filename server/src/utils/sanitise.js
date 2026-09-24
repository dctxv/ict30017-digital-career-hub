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

// Unicode symbol ranges that PDF parsers mangle into garbage sequences.
// e.g. ✉ (U+2709) → "%", ☎ (U+260E) → "n", ■ (U+25A0) → ")"
// Covers: General Punctuation → Dingbats (U+2000–U+27FF), except as below
//       + Halfwidth/Fullwidth Forms (U+FF00–U+FFEF)
// Bangla script (U+0980–U+09FF) and Latin Extended are outside these ranges — preserved.
// Punctuation U+2010–U+2027 (hyphens, dashes, curly quotes, bullets) is NOT
// stripped: pdfjs extracts it correctly, and removing it loses meaning — a
// date range "2019 – 2023" becomes two unrelated years, "O’Connor" becomes
// two words, and the dash between a job title and an employer ("Plumber —
// Thompson Plumbing") is the only thing separating them. U+2028/U+2029 are
// line and paragraph separators and become a newline.
const SYMBOL_RANGE = /[\u2000-\u200F\u202A-\u27FF\uFF00-\uFFEF]/g;
const LINE_SEPARATORS = /[\u2028\u2029]/g;

/**
 * Sanitises extracted resume text before it is passed to the AI.
 * Removes HTML, embedded scripts, prompt injection patterns, and PDF symbol artifacts.
 *
 * Architecture reference: AI Architecture Doc §4.1.2 Step 1
 * Security reference: AI Architecture Doc §5 — "Prompt injection via resume"
 *
 * @param {string} rawText - Raw extracted text from the file parser
 * @returns {string} - Cleaned plain text safe to include in an AI prompt
 */
export function sanitiseResumeText(rawText) {
  let text = rawText;

  // 1. Rejoin words hyphenated across a line break (e.g. "opti-\nmisation" → "optimisation").
  //    Must run before any other pass so rejoined characters aren't stripped prematurely.
  //    Plain line breaks are kept: the parser now reports the document's real
  //    lines, and the PII mask depends on them to find a CV's header, its
  //    labelled fields and where an address ends. Joining every "word\nword"
  //    used to flatten each page into a single line.
  //    Lower case on both sides only: a value that ends in a dash ("Blood
  //    Group : AB-") must not be glued to the label on the next line.
  text = text.replace(/(\p{Ll})-\n(\p{Ll})/gu, '$1$2');

  // 2. Strip script/style blocks first (before stripping tags, to remove their content too)
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 3. Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // 4. Replace Unicode symbol/pictograph characters that PDF parsers mangle.
  //    Replaces with a space so word boundaries are preserved (e.g. "John✉gmail" → "John gmail").
  text = text.replace(LINE_SEPARATORS, '\n');
  text = text.replace(SYMBOL_RANGE, ' ');

  // 5. Redact prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, '[REDACTED]');
  }

  // 6. Normalise whitespace. Spaces left by the passes above collapse to one
  //    space and never become a line break: a stripped icon or dash between
  //    two words ("Nurse — ICU") used to leave three spaces, which turned into
  //    a paragraph break in the middle of a line.
  text = text.replace(/[^\S\n]+/g, ' ');
  text = text.replace(/ ?\n ?/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  // 7. Truncate to character limit
  if (text.length > MAX_CHARS) {
    console.warn(`[sanitise] Text truncated from ${text.length} to ${MAX_CHARS} chars.`);
    text = text.slice(0, MAX_CHARS);
  }

  return text;
}
