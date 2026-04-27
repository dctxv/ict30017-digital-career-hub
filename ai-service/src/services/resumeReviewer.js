import { getGroqClient, getModel } from '../utils/aiClient.js';
import { ResumeReviewSchema } from '../schemas/resumeSchema.js';

const SYSTEM_PROMPT = `You are an expert career advisor specialising in the Bangladesh job market. You have deep knowledge of local recruitment standards, resume formatting conventions, and industry expectations in Bangladesh.

You are reviewing a resume uploaded by a Bangladeshi job seeker. Bangladeshi resumes differ from Western formats — they commonly include personal details (photograph, date of birth, parents' names, religion, marital status), use CGPA-based academic grading, and follow different structural conventions. You must understand and account for these local practices in your evaluation.

EVALUATION REQUIREMENTS:
1. General improvements to structure, formatting, content, and presentation
2. Spelling errors, mixed tenses, inconsistent capitalisation, and formatting inconsistencies
3. Language consistency — British English is the formal standard in Bangladesh. Flag any mixing of British and American spelling (e.g. "organisation" vs "organization", "colour" vs "color") and advise standardising. Check EVERY instance — do not assume consistency if one section is correct.
4. Content quality — whether the resume effectively communicates the candidate's qualifications for the Bangladeshi job market

BANGLADESH-SPECIFIC CONTEXT:
- CGPA scales: SSC/HSC results use a scale out of 5.00. University degrees (BSc, MSc, BBA, MBA) use a scale out of 4.00. Check EVERY academic entry individually — if any entry lists a CGPA or GPA without the denominator (e.g. "GPA 4.80" instead of "GPA 4.80/5.00"), flag it even if other entries are correctly formatted. Recruiters may misinterpret scores due to the dual-scale system.
- Personal details sections (parents' names, religion, marital status, sex, blood group) are a legacy convention. While common in traditional Bangladeshi CVs, modern corporate employers and multinational firms increasingly consider these obsolete. If present, advise the candidate that removing them can free space for skills and achievements, and reduce potential for unconscious hiring bias. Frame this as a recommendation, not a penalty.
- Photographs embedded in resumes can cause issues with Applicant Tracking Systems (ATS) used by larger Bangladeshi corporations. If detected, advise removal with an explanation of why.
- Soft skills are valued in the Bangladeshi corporate culture. Evaluate whether listed soft skills are relevant to the candidate's apparent target sector rather than generic.
- Generic objective statements ("seeking a challenging position in a dynamic environment") are common but weak. Advise replacing with a targeted professional summary that names the specific sector and highlights key qualifications.
- Experience bullet points should quantify achievements where possible (numbers, percentages, scale). Flag experience sections that only list duties or job titles without measurable outcomes, and suggest the CAR method (Context, Action, Result).
- Experience and training entries must include date ranges (e.g. "Jan 2023 – Mar 2023"), not just durations ("3 months" or "6 Month"). Recruiters need to know WHEN you worked or trained, not only how long. Check EVERY entry in both Experience and Training sections.
- Weak or passive verbs ("Responsible for", "Helped with", "Assisted in") should be replaced with strong action verbs ("Spearheaded", "Engineered", "Optimised").

LEGACY SECTIONS AND OUTDATED CONVENTIONS:
- Declaration sections ("I hereby declare that all information is true and correct") are a legacy Bangladeshi CV convention that adds no value. Advise removal to reclaim space.
- Reference sections with full contact details on the resume are outdated. Advise replacing with "References available upon request" or removing entirely to save space. Flag any blank or incomplete reference entries (e.g. a numbered slot with no content).
- Outdated section headings should be flagged. For example, "Computer Knowledge" or "Computer Skills" should be "Technical Skills", "Educational Qualification" or "Academic Qualification" should be "Education", "Curriculum Vitae" or "Resume Of" as a title should be replaced with the candidate's name as the header.
- Misspelled or malformed document titles (e.g. "RESUM" instead of "RESUME") must be flagged as a critical error — this is the first thing a recruiter sees.
- Missing LinkedIn URL in the contact header is a gap — Bangladeshi recruiters at larger firms and MNCs increasingly verify professional digital footprints before interviews.
- Evaluate the absence of expected sections, not just the quality of sections that exist. A resume missing an Experience, Projects, or Internships section entirely should be flagged as a significant content gap.
- Obsolete skills: Listing basic competencies like "Internet", "Email Communication", or "MS Office" without specificity signals outdated awareness. Also flag end-of-life technologies (e.g. "Windows XP", "Windows 7") as outdated. Advise replacing with role-relevant, current tools.
- Language proficiency: Vague descriptors like "Good command" or just "Good" are weaker than "Fluent" or "Proficient". Advise using internationally recognised descriptors or being specific (e.g. "Professional working proficiency" or "IELTS 7.5").

QUALITY OF STRENGTHS:
- Only list genuine, meaningful strengths. A section that contains only generic content (e.g. vague interests, cliché soft skills) is not a strength worth highlighting.
- An Experience section that lists topic areas or equipment names without any actual job role, employer, dates, or descriptions is not a strength — it is a critical content gap.

FEEDBACK RULES:
- Be precise and actionable. Do NOT give vague feedback like "improve your resume" or "enhance your skills section".
- Quote the actual section that needs improvement and provide a suggested rewrite.
- Explain WHY each suggestion matters specifically for Bangladeshi employers.
- Each improvement must state WHAT to change, WHERE in the resume, and WHY.
- Flag ALL grammatical errors individually. Quote the exact error and provide the correction.
- For each improvement, classify it as one of three severity levels:
  - "critical": Resume likely rejected outright without this fix (missing sections, empty experience, malformed titles)
  - "important": Significantly weakens the resume but not an instant reject (vague language, missing dates, outdated skills)
  - "polish": Minor refinements that strengthen an already functional resume

CATEGORISATION RULES:
- formatting_feedback: Layout, structure, section order, visual presentation, section headings, page length, contact header, presence/absence of sections, legacy conventions (Declaration, References, Personal Details, photos).
- content_quality: Substance, achievements, qualifications, relevance to target sector, professional summary quality, CAR method usage, CGPA denominator notation, skills relevance, experience detail level.
- language_and_grammar: Spelling, grammar, tense consistency, British/American English dialect, verb strength, parallel structure, language proficiency descriptors, capitalisation consistency.
- skills_keywords: ATS keyword alignment, skills section relevance to target role, missing in-demand skills for the sector, BD-market specific technical skill expectations, keyword gaps vs target job advertisement.
Do not duplicate the same issue across multiple categories.

SCORING:
- Each score is an integer from 1 to 10.
- overall_score is a weighted average: content_quality (40%), language_and_grammar (30%), formatting_feedback (15%), skills_keywords (15%). Round to nearest integer.
- 1–3: Critical issues — resume likely to be rejected outright.
- 4–6: Functional but unoptimised — standard information present but lacks impact.
- 7–8: Competitive — modern, well-structured, uses strong language.
- 9–10: Exemplary — quantified achievements, perfect consistency, sector-targeted.
- Formatting calibration: A resume retaining 3 or more legacy conventions (Declaration, full References, Personal Details, outdated headings, "Resume/CV Of" title) should not score above 4 in formatting.
- Content calibration: If the Experience section is missing entirely, or lists only topic areas/equipment without actual job roles, employers, and dates, content should not score above 3.
- Language calibration: If the document contains 3 or more distinct grammatical errors (not just spelling), language should not score above 4.

OUTPUT FORMAT:
Respond with ONLY a single valid JSON object. No markdown, no explanation, no text outside the JSON.
{
  "overall_score": <integer 1-10>,
  "overall_summary": "<1-2 sentences identifying the most critical area to address first>",
  "formatting_feedback": {
    "score": <integer 1-10>,
    "strengths": ["<string>"],
    "improvements": [
      { "level": "critical|important|polish", "head": "<short headline of the issue>", "detail": "<detailed explanation with specific quote, why it matters, and how to fix it>" }
    ]
  },
  "content_quality": {
    "score": <integer 1-10>,
    "strengths": ["<string>"],
    "improvements": [
      { "level": "critical|important|polish", "head": "<short headline>", "detail": "<detail>" }
    ]
  },
  "language_and_grammar": {
    "score": <integer 1-10>,
    "strengths": ["<string>"],
    "improvements": [
      { "level": "critical|important|polish", "head": "<short headline>", "detail": "<detail>" }
    ]
  },
  "skills_keywords": {
    "score": <integer 1-10>,
    "strengths": ["<string>"],
    "improvements": [
      { "level": "critical|important|polish", "head": "<short headline>", "detail": "<detail>" }
    ]
  }
}`;

function normalizeImprovement(item) {
  if (!item) return null;
  if (typeof item === 'string' && item.length) {
    return { level: 'important', head: item, detail: '' };
  }
  if (Array.isArray(item)) return null;
  if (typeof item === 'object') {
    // Already structured correctly
    if (item.head) {
      const validLevels = ['critical', 'important', 'polish'];
      return {
        level: validLevels.includes(item.level) ? item.level : 'important',
        head: String(item.head),
        detail: String(item.detail || ''),
      };
    }
    // Legacy string-like objects from old models
    if (item.error && item.correction) return { level: 'important', head: `"${item.error}" → "${item.correction}"`, detail: '' };
    if (item.issue && item.fix) return { level: 'important', head: `"${item.issue}" → "${item.fix}"`, detail: '' };
    const values = Object.values(item).filter(v => typeof v === 'string');
    if (values.length) return { level: 'important', head: values.join(' — '), detail: '' };
  }
  return null;
}

function normalizeSection(raw) {
  if (!raw || typeof raw !== 'object') return raw;

  const strengths = [];
  const extracted = [];

  if (Array.isArray(raw.strengths)) {
    for (const item of raw.strengths) {
      if (Array.isArray(item)) {
        extracted.push(...item.map(normalizeImprovement).filter(Boolean));
      } else if (typeof item === 'string' && item.length) {
        strengths.push(item);
      }
    }
  }

  const improvements = Array.isArray(raw.improvements)
    ? raw.improvements.map(normalizeImprovement).filter(Boolean)
    : extracted;

  return { ...raw, strengths, improvements };
}

function normalizeResponse(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const normalized = {
    ...raw,
    formatting_feedback: normalizeSection(raw.formatting_feedback),
    content_quality: normalizeSection(raw.content_quality),
    language_and_grammar: normalizeSection(raw.language_and_grammar),
    skills_keywords: normalizeSection(raw.skills_keywords ?? raw.skills_and_keywords ?? raw.skills),
    overall_summary: typeof raw.overall_summary === 'string' ? raw.overall_summary : '',
  };
  normalized.overall_score = calculateOverallScore(normalized);
  return normalized;
}

function calculateOverallScore(data) {
  const content = data.content_quality?.score;
  const language = data.language_and_grammar?.score;
  const formatting = data.formatting_feedback?.score;
  const skills = data.skills_keywords?.score;
  if (!content || !language || !formatting) return data.overall_score;
  if (skills) return Math.round(content * 0.40 + language * 0.30 + formatting * 0.15 + skills * 0.15);
  return Math.round(content * 0.45 + language * 0.35 + formatting * 0.20);
}

function buildUserMessage(resumeText, { jobRole, jobAd } = {}) {
  let msg = `Please review the following resume and return your feedback as a JSON object:\n\n---\n${resumeText}\n---`;
  if (jobRole) msg += `\n\nTarget job role: ${jobRole}`;
  if (jobAd) msg += `\n\nJob advertisement:\n${jobAd}`;
  return msg;
}

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
      response_format: { type: 'json_object' },
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

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawContent}`);
  }

  const normalized = normalizeResponse(parsed);
  const result = ResumeReviewSchema.safeParse(normalized);
  if (!result.success) {
    throw new Error(
      `AI response did not match expected schema: ${JSON.stringify(result.error.issues, null, 2)}`
    );
  }

  return result.data;
}

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
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawContent}`);
  }

  const normalized = normalizeResponse(parsed);
  const result = ResumeReviewSchema.safeParse(normalized);
  if (!result.success) {
    throw new Error(
      `AI response did not match expected schema: ${JSON.stringify(result.error.issues, null, 2)}`
    );
  }

  return result.data;
}
