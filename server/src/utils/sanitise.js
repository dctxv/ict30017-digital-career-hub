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
// Covers: General Punctuation → Dingbats (U+2000–U+27FF)
//       + Halfwidth/Fullwidth Forms (U+FF00–U+FFEF)
// Bangla script (U+0980–U+09FF) and Latin Extended are outside these ranges — preserved.
const SYMBOL_RANGE = /[ -⟿＀-￯]/g;

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

  // 1. Repair line breaks inserted mid-word or mid-sentence by PyMuPDF during PDF extraction.
  //    Must run before any other pass so rejoined characters aren't stripped prematurely.
  text = text.replace(/(\w)-\n(\w)/g, '$1$2');  // rejoin hyphenated line breaks (e.g. "opti-\nmisation" → "optimisation")
  text = text.replace(/(\w)\n(\w)/g, '$1 $2');   // rejoin bare mid-word breaks with a space
  text = text.replace(/ {2,}/g, ' ');             // collapse multiple spaces from above joins

  // 2. Strip script/style blocks first (before stripping tags, to remove their content too)
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 3. Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // 4. Replace Unicode symbol/pictograph characters that PDF parsers mangle.
  //    Replaces with a space so word boundaries are preserved (e.g. "John✉gmail" → "John gmail").
  text = text.replace(SYMBOL_RANGE, ' ');

  // 5. Redact prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, '[REDACTED]');
  }

  // 6. Collapse runs of 3+ whitespace/newline characters down to a blank line
  text = text.replace(/\s{3,}/g, '\n\n');
  text = text.trim();

  // 7. Truncate to character limit
  if (text.length > MAX_CHARS) {
    console.warn(`[sanitise] Text truncated from ${text.length} to ${MAX_CHARS} chars.`);
    text = text.slice(0, MAX_CHARS);
  }

  return text;
}
