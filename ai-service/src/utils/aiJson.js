/**
 * Module: utils/aiJson
 * Responsibility: Turn whatever the model actually returned into a JavaScript
 * object, including when what it returned is not quite JSON.
 *
 * This machinery was written for the resume reviewer and lived inside it. It is
 * not specific to reviews: every call in this service asks for one JSON object
 * and every one of them can be handed a markdown fence, a literal newline
 * inside a string, an unescaped quote around text lifted from the input, or a
 * response cut off at the token ceiling. The mock interview and the gap engine
 * hit the same four failures for the same reasons, and a second copy of the
 * repair chain would drift from this one the first time either was fixed.
 *
 * Moved here unchanged. resumeReviewer.js imports parseAIJSON from this file
 * and behaves exactly as it did.
 */

// Walk the text to find where the outermost { ... } ends.
// Returns the slice if balanced, or everything from { to end if truncated.
export function extractBalancedJSON(text) {
  const start = text.indexOf('{');
  if (start === -1) return text;

  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (esc)       { esc = false; continue; }
    if (ch === '\\') { esc = true;  continue; }
    if (ch === '"')  { inStr = !inStr; continue; }
    if (inStr)       continue;
    if (ch === '{')  depth++;
    if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return text.slice(start); // truncated — caller will repair
}

// Escape literal control characters (e.g. real newlines) inside JSON strings.
export function escapeControlChars(text) {
  let inStr = false, esc = false, out = '';
  for (const ch of text) {
    if (esc) {
      esc = false;
      // If a backslash was followed by a literal control char (e.g. model outputs \<LF>),
      // the backslash we already wrote is wrong — replace the pair with a proper escape.
      if (inStr && ch.charCodeAt(0) < 0x20) {
        out = out.slice(0, -1); // remove the \ already written
        out += ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t'
             : `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
      } else {
        out += ch;
      }
      continue;
    }
    if (ch === '\\') { esc = true;  out += ch; continue; }
    if (ch === '"')  { inStr = !inStr; out += ch; continue; }
    if (inStr) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        out += ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t'
             : `\\u${code.toString(16).padStart(4, '0')}`;
        continue;
      }
    }
    out += ch;
  }
  return out;
}

// Escape unescaped double quotes inside JSON string values.
// Handles the case where the model quotes resume text verbatim, e.g.:
//   "issue": "The bullet "assisted with" lacks quantification"
// Strategy: when inside a string, a " that is NOT followed (after optional whitespace)
// by a JSON structural character (: , } ]) is an inner quote and must be escaped.
export function repairUnescapedQuotes(text) {
  let inStr = false, esc = false, out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; out += ch; continue; }
    if (ch === '\\') { esc = true; out += ch; continue; }
    if (ch === '"') {
      if (!inStr) {
        inStr = true;
        out += ch;
      } else {
        // Peek past whitespace to see what follows this quote
        let j = i + 1;
        while (j < text.length && (text[j] === ' ' || text[j] === '\t' || text[j] === '\n' || text[j] === '\r')) j++;
        const next = text[j];
        if (next === ':' || next === ',' || next === '}' || next === ']' || j >= text.length) {
          inStr = false; // closing quote
          out += ch;
        } else {
          out += '\\"'; // inner unescaped quote — escape it
        }
      }
      continue;
    }
    out += ch;
  }
  return out;
}

// Close any unclosed braces/brackets left by truncation.
export function repairJSON(text) {
  const stack = [];
  let inStr = false, esc = false, out = '';
  for (const ch of text) {
    out += ch;
    if (esc)         { esc = false; continue; }
    if (ch === '\\') { esc = true;  continue; }
    if (ch === '"')  { inStr = !inStr; continue; }
    if (inStr)       continue;
    if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
    if (ch === '}' || ch === ']') stack.pop();
  }
  if (inStr) out += '"';
  out = out.replace(/,\s*$/, '');
  while (stack.length) out += stack.pop();
  return out;
}

/**
 * Master parser: strip fences → find balanced JSON → sanitize → parse → repair
 * if needed.
 *
 * @param {string} rawText the raw completion
 * @param {string} [label] prefix for the warning lines, so a failed parse names
 *   the caller it came from rather than reporting every one as [AI]
 * @returns {object}
 * @throws {Error} when every repair strategy has failed
 */
export function parseAIJSON(rawText, label = 'AI') {
  const text = rawText?.trim() ?? '';
  if (!text) throw new Error('empty response');

  // 1. Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/s);
  const unwrapped  = fenceMatch ? fenceMatch[1].trim() : text;

  // 2. Extract the outermost JSON object (handles trailing model commentary)
  const slice     = extractBalancedJSON(unwrapped);

  // 3. Escape any literal control characters inside string values
  const sanitized = escapeControlChars(slice);

  // 4. Direct parse (happy path)
  try { return JSON.parse(sanitized); } catch (e1) {
    console.warn(`[${label}] Direct JSON.parse failed:`, e1.message);
  }

  // 5. Repair unescaped inner quotes, then try again
  const quotesFixed = repairUnescapedQuotes(sanitized);
  try { return JSON.parse(quotesFixed); } catch { /* fall through */ }

  // 6. Repair truncation on the quote-fixed version, then parse
  try { return JSON.parse(repairJSON(quotesFixed)); } catch (e2) {
    console.error(`[${label}] All repair strategies failed:`, e2.message);
    throw e2;
  }
}
