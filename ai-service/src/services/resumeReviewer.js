import { getGroqClient, getModel } from '../utils/aiClient.js';
import { ReviewResponseSchema } from '../schemas/resumeSchema.js';

const SYSTEM_PROMPT = `
You are an expert career advisor specialising in the Bangladesh job market. You have deep
knowledge of local recruitment standards, resume formatting conventions, and industry
expectations in Bangladesh.

CRITICAL — BANGLADESH CV CONVENTIONS
The following sections and content are CONFIRMED STANDARD practice for the Bangladeshi
job market. They have been validated with the client.

Do NOT flag, penalise, recommend removing, or suggest modifying the following in ANY
section of your response — not in formatting issues, content weaknesses, action items,
heading risks, or ATS tips:

- Personal Information / Personal Details section (including father's name, mother's name,
  NID number, blood group, religion, marital status, DOB)
- Declaration section
- Photograph
- Career Objective heading (flag as low risk only — never recommend removal)
- Academic Qualification / Educational Qualification heading
- Technical Skills heading

These apply globally. Any instruction in later sections that appears to conflict with
this block is overridden by this block.

Review the resume provided and produce structured feedback as a single valid JSON object
with exactly these keys: formatting, content_quality, language_grammar, action_items,
ats_analysis, job_match, overall_score.

Give precise, actionable suggestions. Do not give vague advice. Quote the actual section
that needs improvement and provide a suggested rewrite where applicable.
Do not echo personal details (name, address, phone, email) anywhere in your response.
Return only the JSON object — no markdown, no explanation outside the JSON.

---

SECTION 1 — formatting
Score the visual and structural presentation of the resume (0–100).
Identify specific formatting issues: inconsistent spacing, misaligned sections, poor use of
bullet points, unprofessional fonts, or overly dense text blocks.

Note: CGPA formatted as X.XX/4.00 or X.XX/5.00 is correct — only flag if the denominator
is missing or clearly wrong. Apply a formatting score ceiling of 75 if the resume contains
three or more Bangladeshi CV conventions (see CRITICAL block above); frame this as an
educational note about modern digital applications, not a penalty.

Return:
{
  "score": number (0–100),
  "feedback": string,
  "issues": Array<{ "section": string, "issue": string, "suggestion": string }>
}

---

SECTION 2 — content_quality
Score the substance and relevance of the resume content (0–100).
Identify strengths (what the candidate does well) and weaknesses (gaps, vague claims,
missing quantification). Flag missing sections expected for the inferred role.

Pay particular attention to internship and junior role bullet points — these are commonly
under-quantified. Flag any bullet that uses vague language such as 'assisted with',
'helped with', 'did data work', 'maintained', or 'supported' without a specific outcome
or metric as a content weakness.

Return:
{
  "score": number (0–100),
  "feedback": string,
  "strengths": string[],
  "weaknesses": string[]
}

---

SECTION 3 — language_grammar
Score the language quality (0–100).
Identify specific spelling errors, mixed tenses, inconsistent capitalisation, grammatical
errors, and weak action verbs. Quote the exact phrase and provide a corrected version.

IMPORTANT — This resume targets the Bangladesh job market. Commonwealth/British English
spelling is correct and must NOT be flagged as an error (e.g. optimise, organise, colour,
analyse, behaviour, programme, centre). Only flag genuine spelling errors, not
Commonwealth variant spellings.

Return:
{
  "score": number (0–100),
  "feedback": string,
  "issues": Array<{ "original": string, "corrected": string, "type": string }>
}

---

SECTION 4 — action_items
Provide exactly 3–5 prioritised action items the candidate should act on immediately.
Each item must reference a specific section of the resume. No generic advice.

Return: string[]

---

SECTION 5 — ats_analysis
Evaluate how well this resume would perform when scanned by an Applicant Tracking System
used by international companies and multinationals.

Step 1 — Infer the candidate's target role and industry from the resume. Use the most
recent job title, degree, or stated objective as the primary signal. If ambiguous, use
the skills section. If the user message includes a 'Target role:' line, treat that as
the primary signal for role inference and use the resume to confirm or supplement it.

Step 2 — keyword_hits: list terms already present in the resume that are commonly
required by ATS systems for the inferred role. List actual keywords, not categories.

Step 3 — keyword_gaps: list up to 3 of the most impactful keywords commonly
expected by ATS systems for the inferred role that are absent from the resume.
If the resume already covers most keywords, return fewer — only list genuine gaps.

Step 4 — heading_risks: identify section headings that some ATS systems may fail to
parse. For each, provide the original heading, the issue, and the recommended alternative.

Flag non-standard headings that a Western multinational ATS would struggle with. See the
CRITICAL block above for headings that must never be flagged.

Step 5 — ats_tips: provide up to 3 tips to improve ATS performance. Each tip must be
an improvement action — never a positive observation about what the resume already does
well. If the resume scores well on a dimension, use that tip slot for the next most
impactful gap instead. Each tip must reference something specific found or missing in
this resume. Return fewer than 3 only if fewer genuine improvement actions exist.

Return:
{
  "inferred_role": string,
  "inferred_industry": string,
  "keyword_hits": string[],
  "keyword_gaps": string[],
  "heading_risks": Array<{ "original": string, "issue": string, "recommended": string }>,
  "ats_tips": string[],
  "standard": "international/multinational ATS"
}

---

SECTION 6 — job_match
Only complete this section if a job advertisement is provided after the resume text.
If no job advertisement is provided, return null for job_match.

If a job advertisement is provided, perform a two-step analysis:

Step 1 — Extract all required skills, qualifications, tools, and keywords from the job
advertisement. Identify which are explicitly required versus preferred.

Step 2 — For each extracted keyword, check whether it is present, partially present,
or absent from the resume. Classify each as:
- "matched": clearly present in the resume
- "partial": concept present but keyword not explicit (e.g. resume says "version control"
  but job ad requires "Git")
- "missing": absent entirely

Assign priority to each missing keyword:
- "high": appears multiple times in the job ad or listed under required qualifications
- "medium": appears once under requirements
- "low": appears only under preferred or nice-to-have

Return:
{
  "match_score": number (0–100, your estimate — will be recalculated server-side),
  "matched_keywords": string[],
  "partial_keywords": Array<{ "resume_term": string, "required_term": string }>,
  "missing_keywords": Array<{ "keyword": string, "priority": "high" | "medium" | "low" }>,
  "recommendations": string[]
}

Provide exactly 3–5 recommendations. Each must be specific to a gap found — not generic advice.

---

SECTION 7 — overall_score
Return a single integer (0–100). This will be recalculated server-side using the formula:
content_quality 45% + language_grammar 35% + formatting 20%.
Provide your best estimate consistent with the section scores above.
`.trim();

/* ── Score recalculation (server-side overrides AI estimates) ── */

function calculateATSScore({ keyword_hits, keyword_gaps, heading_risks }) {
  const total = keyword_hits.length + keyword_gaps.length;
  const keywordScore = total > 0
    ? Math.round((keyword_hits.length / total) * 100)
    : 100;
  const headingPenalty = Math.min(heading_risks.length * 10, 30);
  return Math.max(0, Math.round(keywordScore * 0.7 + (100 - headingPenalty) * 0.3));
}

function calculateMatchScore({ matched_keywords, partial_keywords, missing_keywords }) {
  const matched = matched_keywords.length;
  const partial = partial_keywords.length;
  const missing = missing_keywords.length;
  const total = matched + partial + missing;
  if (total === 0) return 0;
  return Math.max(0, Math.round(((matched + partial * 0.5) / total) * 100));
}

function recalculateScores(parsed) {
  // Guard against missing sections — use 0 so the formula still produces a number
  const cScore = parsed.content_quality?.score  ?? 0;
  const lScore = parsed.language_grammar?.score ?? 0;
  const fScore = parsed.formatting?.score       ?? 0;

  const overall_score = Math.round(cScore * 0.45 + lScore * 0.35 + fScore * 0.20);

  const ats_score = parsed.ats_analysis
    ? calculateATSScore(parsed.ats_analysis)
    : undefined;

  const match_score = parsed.job_match
    ? calculateMatchScore(parsed.job_match)
    : null;

  return {
    ...parsed,
    overall_score,
    ats_analysis: parsed.ats_analysis
      ? { ...parsed.ats_analysis, ats_score }
      : parsed.ats_analysis,
    job_match: parsed.job_match
      ? { ...parsed.job_match, match_score }
      : null,
  };
}

function normalizeResponse(raw) {
  if (!raw || typeof raw !== 'object') return raw;

  // Remap old key names the AI sometimes uses
  const withAliases = {
    ...raw,
    formatting:       raw.formatting       ?? raw.formatting_feedback ?? null,
    language_grammar: raw.language_grammar ?? raw.language_and_grammar ?? null,
    job_match:        raw.job_match        ?? null,
    action_items:     raw.action_items     ?? [],
  };

  // Cap ATS arrays — AI may over-generate; trim to keep only the most impactful entries
  if (withAliases.ats_analysis) {
    const gaps = withAliases.ats_analysis.keyword_gaps ?? [];
    const tips = withAliases.ats_analysis.ats_tips ?? [];
    if (gaps.length > 3) console.warn('[AI] keyword_gaps exceeded 3 — trimmed. Prompt may need tightening.');
    if (tips.length > 3) console.warn('[AI] ats_tips exceeded 3 — trimmed. Prompt may need tightening.');
    withAliases.ats_analysis = {
      ...withAliases.ats_analysis,
      keyword_gaps: gaps.slice(0, 3),
      ats_tips:     tips.slice(0, 3),
    };
  }

  return recalculateScores(withAliases);
}

/* ── Robust AI JSON parser ── */

// Walk the text to find where the outermost { ... } ends.
// Returns the slice if balanced, or everything from { to end if truncated.
function extractBalancedJSON(text) {
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
function escapeControlChars(text) {
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
function repairUnescapedQuotes(text) {
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
        while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;
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
function repairJSON(text) {
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

// Master parser: strip fences → find balanced JSON → sanitize → parse → repair if needed.
function parseAIJSON(rawText) {
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
    console.warn('[AI] Direct JSON.parse failed:', e1.message);
  }

  // 5. Repair unescaped inner quotes, then try again
  const quotesFixed = repairUnescapedQuotes(sanitized);
  try { return JSON.parse(quotesFixed); } catch { /* fall through */ }

  // 6. Repair truncation on the quote-fixed version, then parse
  try { return JSON.parse(repairJSON(quotesFixed)); } catch (e2) {
    console.error('[AI] All repair strategies failed:', e2.message);
    throw e2;
  }
}

/* ── Message builders ── */

function buildUserMessage(resumeText, { jobAd, jobRole } = {}) {
  if (jobAd) {
    const roleNote = jobRole ? `\n\nTarget role: ${jobRole}` : '';
    return [
      `Please review the following resume:\n\n${resumeText}`,
      roleNote,
      `\n\n---JOB ADVERTISEMENT---\n\n${jobAd}`,
    ].join('');
  }
  let msg = `Please review the following resume:\n\n${resumeText}`;
  if (jobRole) msg += `\n\nTarget role: ${jobRole}`;
  return msg;
}

/* ── Streaming export ── */

export async function analyzeResumeStream(resumeText, { onToken, jobRole, jobAd } = {}) {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty.');
  }

  const client = getGroqClient();
  const model = getModel();

  let rawContent = '';
  try {
    const stream = await client.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(resumeText, { jobRole, jobAd }) },
      ],
    });

    for await (const chunk of stream) {
      const piece = chunk?.choices?.[0]?.delta?.content;
      if (piece) {
        rawContent += piece;
        if (typeof onToken === 'function') onToken(piece);
      }
    }

    if (!rawContent) throw new Error('AI returned an empty response.');
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes('429')) {
      return { error: 'AI is currently busy, please try again in a minute.', code: 'RATE_LIMIT' };
    }
    throw err;
  }

  const inputEstimate = Math.round(SYSTEM_PROMPT.length / 4);
  const outputEstimate = Math.round(rawContent.length / 4);
  console.log(`[AI-stream] Raw response length: ${rawContent.length} chars`);
  console.log(`[AI-stream] Token estimate — input: ~${inputEstimate}, output: ~${outputEstimate}, total: ~${inputEstimate + outputEstimate}`);

  let parsed;
  try {
    parsed = parseAIJSON(rawContent);
  } catch {
    console.error('[AI-stream] First 200 chars:', rawContent.slice(0, 200));
    console.error('[AI-stream] Last 300 chars:', rawContent.slice(-300));
    throw new Error('AI returned an unreadable response. Please try again.');
  }

  const normalized = normalizeResponse(parsed);
  const result = ReviewResponseSchema.safeParse(normalized);
  if (!result.success) {
    console.error('[AI] Schema validation failed:', JSON.stringify(result.error.issues, null, 2));
    throw new Error('The AI returned an unexpected response format. Please try again.');
  }

  return result.data;
}

/* ── One-shot export ── */

export async function analyzeResume(resumeText, { jobRole, jobAd } = {}) {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty.');
  }

  const client = getGroqClient();
  const model = getModel();

  let rawContent;
  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(resumeText, { jobRole, jobAd }) },
      ],
    });

    rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error('AI returned an empty response.');
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes('429')) {
      return { error: 'AI is currently busy, please try again in a minute.', code: 'RATE_LIMIT' };
    }
    throw err;
  }

  const inputEstimate = Math.round(SYSTEM_PROMPT.length / 4);
  const outputEstimate = Math.round(rawContent.length / 4);
  console.log(`[AI] Token estimate — input: ~${inputEstimate}, output: ~${outputEstimate}, total: ~${inputEstimate + outputEstimate}`);

  let parsed;
  try {
    parsed = parseAIJSON(rawContent);
  } catch {
    console.error('[AI] Last 300 chars of raw response:', rawContent.slice(-300));
    throw new Error('AI returned an unreadable response. Please try again.');
  }

  const normalized = normalizeResponse(parsed);
  const result = ReviewResponseSchema.safeParse(normalized);
  if (!result.success) {
    console.error('[AI] Schema validation failed:', JSON.stringify(result.error.issues, null, 2));
    throw new Error('The AI returned an unexpected response format. Please try again.');
  }

  return result.data;
}
