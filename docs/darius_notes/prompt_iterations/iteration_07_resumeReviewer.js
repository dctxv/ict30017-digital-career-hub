import { getGroqClient, getModel } from '../utils/aiClient.js';
import { ReviewResponseSchema } from '../schemas/resumeSchema.js';
import {
  SCORE_WEIGHTS,
  ATS_LIST_CAP,
  AI_COMPLETION_PARAMS,
  ATS_STANDARD_LABEL,
  BANGLADESH_PROTECTED_HEADINGS,
  asPercent,
} from '../config/reviewConstants.js';

const BANGLADESH_MODE_BLOCK = `MARKET RULES — BANGLADESH JOB MARKET

You are an expert career consultant and resume reviewer specialising in the Bangladesh job market.
Your role is to critically evaluate resumes for job seekers in Bangladesh — including sectors such as IT/software, RMG, banking, NGOs, civil engineering, and business.

Context you must understand:
- Bangladeshi employers typically expect a clear objective/summary section.
- CGPA-based academic results (out of 4.00 or 5.00) are standard and must be included.
- Most corporate job applications in Bangladesh require English-language resumes.
- Spelling consistency between British English (preferred in Bangladesh) and American English matters.
- Action-oriented bullet points with quantifiable achievements (numbers, percentages) are strongly preferred.
- Skills sections should list both technical and soft skills relevant to the local market.

The user is targeting Bangladeshi employers. The following are confirmed standard
conventions for the Bangladeshi job market, validated with the client.

Do NOT flag, penalise, recommend removing, or suggest modifying any of the following
in ANY section of your response — not in formatting issues, content weaknesses,
action items, heading risks, or ATS tips:

- Personal Information / Personal Details section including: father's name,
  mother's name, NID number, blood group, religion, marital status, date of birth
- Declaration section
- Photograph
- Career Objective heading (flag as low risk only — never recommend removal)
- Academic Qualification / Educational Qualification heading
- Technical Skills heading

However, do evaluate the quality of the Career Objective content in the
content_quality section. A Career Objective that uses generic language such as
"seeking a challenging position", "utilise my skills", "reputable organisation",
or "career growth" without specifying a target role, industry, or concrete value
proposition is a content weakness. Flag it as such and provide a rewritten version
that references the candidate's specific background, target role, and one concrete
strength. Do not flag the heading itself — only the content quality.

CONTENT-QUALITY CHECKS — for each check below: if the section or entry it
describes is absent, flag it as a content weakness using the message stated for
that check. Apply each check only within the experience scope stated for it, and
never flag a candidate who falls outside that scope.

1. References. Expect 2 to 3 named references with full contact details: full
   name, designation, organisation, phone number, and email address. "References
   available upon request" or equivalent counts as absent; partial details (name
   and organisation but no phone) do not. Scope: all candidates.
   Message: "A References section with at least two named referees including
   their designation, organisation, and contact details is expected by most
   Bangladesh employers."

2. Extracurricular or co-curricular activities, voluntary work, club
   memberships, competitions, or equivalent. Scope: fresh graduates and recent
   postgraduates — graduation within the last 3 years or fewer than 2 years of
   work experience; never flag candidates with 3 or more years of work
   experience.
   Message: "Bangladeshi employers value extracurricular involvement for fresh
   graduates. Consider adding a section covering club memberships, volunteer
   work, academic competitions, or community activities."
   Also flag if the section exists but lists only one-word entries with no
   context (e.g. "Cricket" or "Reading"), and suggest expanding each entry with
   role and duration.

3. SSC and HSC results in the Education section. Each entry should include: full
   exam name (Secondary School Certificate or Higher Secondary Certificate), GPA
   out of 5.00, passing year, institution name, and Education Board name (e.g.
   Dhaka Board, Chittagong Board, Rajshahi Board). An entry that is present but
   missing the GPA denominator (/5.00) is a formatting issue, handled identically
   to university CGPA denominator errors. Scope: graduation within the last 5
   years or no substantial work history; never apply to candidates with 5 or more
   years of continuous work experience.
   Message: name whichever of SSC or HSC is absent and give a specific suggestion
   to add it to the Education section.

4. Thesis, dissertation, or final year project entry, carrying at minimum the
   title and a one-line description of the topic or outcome; supervisor name is
   standard but not mandatory. Scope: highest qualification of Bachelor's degree
   or above, graduated within the last 5 years, and a research or technical
   background — never flag a clearly non-technical background (e.g. arts,
   business, or management degrees with no technical indicators) or candidates
   with 5 or more years of work experience.
   Message: "Including your final year project or thesis title with a brief
   description demonstrates research exposure and is expected by Bangladesh
   employers for recent graduates."

Apply a formatting score ceiling of 75 if the resume contains three or more of
these conventions. Frame this as an educational note about modern digital
applications, not a penalty. These apply globally — any instruction in later
sections that conflicts with this block is overridden by this block.
`.trim();

const INTERNATIONAL_MODE_BLOCK = `
MARKET RULES — INTERNATIONAL / MULTINATIONAL COMPANIES

The user is applying to international companies, or to multinationals operating
in Bangladesh that use Western hiring standards. Apply Western professional CV
standards strictly throughout every section of your response.

The following elements are inappropriate for international applications and MUST
be treated as formatting issues. Flag EACH of them as a separate entry in the
formatting issues array if they appear in the resume:

- Father's name or mother's name, anywhere in the resume
- NID number or national identification number
- Blood group
- Religion
- Marital status
- Date of birth or age
- Declaration section
- Photograph

For each one present, write the issue in terms of the concrete bias, privacy, or
discrimination risk it creates in international hiring, and write the suggestion
as a direct instruction to remove it from the resume.

Do NOT apply any score ceiling or educational framing for these items.
Score each as a genuine formatting penalty — their presence should reduce the
formatting score proportionally. A resume with four or more of these elements
present should receive a formatting score no higher than 55.

In the ATS analysis section, include a tip noting that international ATS systems
and recruiters will likely remove or discount resumes containing personal
demographic information.

IMPORTANT — heading risks: Do flag "Career Objective", "Educational Qualification",
"Academic Qualification", and "Personal Information" as heading risks if they
appear, since these are non-standard for international ATS systems. Recommended
alternatives: "Professional Summary", "Education", "Education", "Contact Details".

These instructions apply globally. Any instruction in later sections that
appears to conflict with this block is overridden by this block.
`.trim();

// ── System prompt builder ────────────────────────────────────────────────────

export function buildSystemPrompt(marketMode = 'bangladesh') {
  const modeBlock = marketMode === 'international'
    ? INTERNATIONAL_MODE_BLOCK
    : BANGLADESH_MODE_BLOCK;

  return `
You are an expert career advisor. You have deep knowledge of resume formatting
conventions, recruitment standards, and industry expectations in both Bangladesh
and international job markets.

${modeBlock}

Review the resume provided and produce structured feedback as a single valid JSON
object with exactly these keys: formatting, content_quality, language_grammar,
action_items, ats_analysis, job_match, overall_score.

Give precise, actionable suggestions. Do not give vague advice. Quote the actual
section that needs improvement and provide a suggested rewrite where applicable.
Do not echo personal details (name, address, phone, email) anywhere in your response.
Return only the JSON object — no markdown, no explanation outside the JSON.

---

SECTION 1 — formatting
Score the visual and structural presentation of the resume (0–100).
Identify specific formatting issues: inconsistent spacing, misaligned sections, poor use of
bullet points, unprofessional fonts, or overly dense text blocks.

Note: CGPA formatted as X.XX/4.00 or X.XX/5.00 is correct — only flag if the denominator
is missing or clearly wrong.

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

IMPORTANT — Commonwealth/British English spelling is correct and must NOT be flagged as
an error (e.g. optimise, organise, colour, analyse, behaviour, programme, centre). Only
flag genuine spelling errors, not Commonwealth variant spellings.

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

Step 3 — keyword_gaps: list up to ${ATS_LIST_CAP} of the most impactful keywords commonly
expected by ATS systems for the inferred role that are absent from the resume.
If the resume already covers most keywords, return fewer — only list genuine gaps.

Step 4 — heading_risks: identify section headings that some ATS systems may fail to
parse. For each, provide the original heading, the issue, and the recommended alternative.

Flag non-standard headings that an ATS in the selected market would struggle with. Examples
worth flagging: "Computer Knowledge" or "Computer Skills" where "Technical Skills" is the
standard, "Curriculum Vitae" or "Resume Of" used as the document title, and any invented or
misspelled section heading.

One exclusion applies. If the MARKET RULES block above protects a heading, omit that heading
from heading_risks entirely — not with a recommended alternative, not as a low-risk note, not
in any form — even when it looks non-standard by Western convention. The exclusion covers only
the headings that block names. Keep flagging every other non-standard heading as normal; do
not return an empty heading_risks list just because one heading was excluded.

Step 5 — ats_tips: provide up to ${ATS_LIST_CAP} tips to improve ATS performance. Each tip must be
an improvement action — never a positive observation about what the resume already does
well. If the resume scores well on a dimension, use that tip slot for the next most
impactful gap instead. Each tip must reference something specific found or missing in
this resume. Return fewer than ${ATS_LIST_CAP} only if fewer genuine improvement actions exist.

Return:
{
  "inferred_role": string,
  "inferred_industry": string,
  "keyword_hits": string[],
  "keyword_gaps": string[],
  "heading_risks": Array<{ "original": string, "issue": string, "recommended": string }>,
  "ats_tips": string[]
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
content_quality ${asPercent(SCORE_WEIGHTS.content)}% + language_grammar ${asPercent(SCORE_WEIGHTS.language)}% + formatting ${asPercent(SCORE_WEIGHTS.formatting)}%.
Provide your best estimate consistent with the section scores above.
`.trim();
}

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

  const overall_score = Math.round(
    cScore * SCORE_WEIGHTS.content +
    lScore * SCORE_WEIGHTS.language +
    fScore * SCORE_WEIGHTS.formatting,
  );

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

/**
 * Drops market-protected headings from heading_risks.
 *
 * Bangladesh mode only. The prompt forbids these already, but live testing
 * showed the model re-flags "Educational Qualification" on most Bangladeshi
 * resumes regardless, at both Iteration 6 and 7, so this is the deterministic
 * backstop. It runs before recalculateScores, so ats_score is derived from the
 * filtered list rather than the raw one.
 *
 * International mode is meant to flag these headings and is never filtered.
 */
function filterProtectedHeadings(headingRisks, marketMode) {
  if (!Array.isArray(headingRisks)) return headingRisks;
  if (marketMode !== 'bangladesh') return headingRisks;

  const kept = headingRisks.filter(
    (h) => !BANGLADESH_PROTECTED_HEADINGS.some((re) => re.test(String(h?.original ?? '')))
  );

  const dropped = headingRisks.length - kept.length;
  if (dropped > 0) {
    console.warn(
      `[AI] Removed ${dropped} market-protected heading(s) from heading_risks. ` +
      'The prompt forbids these in Bangladesh mode; the model returned them anyway.'
    );
  }
  return kept;
}

function normalizeResponse(raw, marketMode = 'bangladesh') {
  if (!raw || typeof raw !== 'object') return raw;

  // Remap old key names the AI sometimes uses
  const withAliases = {
    ...raw,
    formatting:       raw.formatting       ?? raw.formatting_feedback ?? null,
    language_grammar: raw.language_grammar ?? raw.language_and_grammar ?? null,
    job_match:        raw.job_match        ?? null,
    action_items:     raw.action_items     ?? [],
  };

  // Cap ATS arrays — AI may over-generate; trim to keep only the most impactful entries.
  // `standard` is injected here rather than asked for: it is a constant, so spending
  // output tokens on it only made truncation more likely.
  if (withAliases.ats_analysis) {
    const gaps = withAliases.ats_analysis.keyword_gaps ?? [];
    const tips = withAliases.ats_analysis.ats_tips ?? [];
    if (gaps.length > ATS_LIST_CAP) console.warn(`[AI] keyword_gaps exceeded ${ATS_LIST_CAP} — trimmed. Prompt may need tightening.`);
    if (tips.length > ATS_LIST_CAP) console.warn(`[AI] ats_tips exceeded ${ATS_LIST_CAP} — trimmed. Prompt may need tightening.`);
    withAliases.ats_analysis = {
      ...withAliases.ats_analysis,
      heading_risks: filterProtectedHeadings(withAliases.ats_analysis.heading_risks, marketMode),
      keyword_gaps: gaps.slice(0, ATS_LIST_CAP),
      ats_tips:     tips.slice(0, ATS_LIST_CAP),
      standard:     withAliases.ats_analysis.standard ?? ATS_STANDARD_LABEL,
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

export async function analyzeResumeStream(resumeText, { onToken, jobRole, jobAd, marketMode = 'bangladesh', tier = 'free' } = {}) {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty.');
  }

  const client = getGroqClient();
  const model = getModel(tier);

  let rawContent = '';
  try {
    const stream = await client.chat.completions.create({
      model,
      ...AI_COMPLETION_PARAMS,
      stream: true,
      messages: [
        { role: 'system', content: buildSystemPrompt(marketMode) },
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

  const inputEstimate = Math.round(buildSystemPrompt(marketMode).length / 4);
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

  const normalized = normalizeResponse(parsed, marketMode);
  const result = ReviewResponseSchema.safeParse(normalized);
  if (!result.success) {
    console.error('[AI] Schema validation failed:', JSON.stringify(result.error.issues, null, 2));
    throw new Error('The AI returned an unexpected response format. Please try again.');
  }

  return result.data;
}

/* ── One-shot export ── */

export async function analyzeResume(resumeText, { jobRole, jobAd, marketMode = 'bangladesh', tier = 'free' } = {}) {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty.');
  }

  const client = getGroqClient();
  const model = getModel(tier);

  let rawContent;
  try {
    const response = await client.chat.completions.create({
      model,
      ...AI_COMPLETION_PARAMS,
      messages: [
        { role: 'system', content: buildSystemPrompt(marketMode) },
        { role: 'user', content: buildUserMessage(resumeText, { jobRole, jobAd }) },
      ],
    });

    rawContent = response.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error('AI returned an empty response.');
    }
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes('429')) {
      return {
        error: 'AI is currently busy, please try again in a minute.',
        code: 'RATE_LIMIT',
      };
    }
    throw err;
  }

  const inputEstimate = Math.round(buildSystemPrompt(marketMode).length / 4);
  const outputEstimate = Math.round(rawContent.length / 4);
  console.log(`[AI] Raw response length: ${rawContent.length} chars`);
  console.log(`[AI] Token estimate — input: ~${inputEstimate}, output: ~${outputEstimate}, total: ~${inputEstimate + outputEstimate}`);

  let parsed;
  try {
    parsed = parseAIJSON(rawContent);
  } catch {
    console.error('[AI] First 200 chars:', rawContent.slice(0, 200));
    console.error('[AI] Last 300 chars:', rawContent.slice(-300));
    throw new Error('AI returned an unreadable response. Please try again.');
  }

  const normalized = normalizeResponse(parsed, marketMode);
  const result = ReviewResponseSchema.safeParse(normalized);
  if (!result.success) {
    console.error('[AI] Schema validation failed:', JSON.stringify(result.error.issues, null, 2));
    throw new Error('The AI returned an unexpected response format. Please try again.');
  }

  return result.data;
}
