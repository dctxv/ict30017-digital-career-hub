/**
 * A complete, schema-valid review response.
 *
 * Shaped to satisfy ai-service/src/schemas/resumeSchema.js in full rather than
 * to the minimum the results page happens to read today. A partial object here
 * would surface as the "feedback may be incomplete" banner, which is a state
 * the suite explicitly asserts against — so the fake has to return the whole
 * thing, not a stub.
 *
 * Deterministic on purpose: the scores are fixed so an assertion about a
 * rendered number is stable across runs.
 */
export const FAKE_FEEDBACK = {
  overall_score: 78,

  formatting: {
    score: 82,
    feedback:
      'The layout is clean and reads well in a single column, which is what an ' +
      'automated parser handles most reliably. Section order is conventional.',
    issues: [
      {
        section: 'Header',
        issue: 'Contact details are set in a text box.',
        suggestion: 'Move them into the body text so a parser can read them.',
      },
      {
        section: 'Experience',
        issue: 'Dates are right-aligned with tab stops.',
        suggestion: 'Place dates inline after the role title.',
      },
    ],
  },

  content_quality: {
    score: 74,
    feedback:
      'Responsibilities are described clearly, but most bullets stop at what ' +
      'was done rather than what changed as a result.',
    strengths: [
      'Relevant coursework is tied to concrete projects.',
      'Technical skills are grouped rather than listed as one block.',
    ],
    weaknesses: [
      'Few quantified outcomes.',
      'The summary repeats the skills section.',
    ],
  },

  language_grammar: {
    score: 80,
    feedback: 'Generally correct. A few tense inconsistencies in past roles.',
    issues: [
      {
        original: 'Responsible for managing the team',
        corrected: 'Managed a team of four',
        type: 'passive voice',
      },
      {
        original: 'Have completed the migration',
        corrected: 'Completed the migration',
        type: 'tense',
      },
    ],
  },

  ats_analysis: {
    inferred_role: 'Junior Software Engineer',
    inferred_industry: 'Software',
    keyword_hits: ['JavaScript', 'React', 'SQL', 'Git'],
    keyword_gaps: ['REST API', 'unit testing', 'CI/CD'],
    heading_risks: [
      {
        original: 'What I have done',
        issue: 'Non-standard heading an ATS may not map to Experience.',
        recommended: 'Experience',
      },
    ],
    ats_tips: [
      'Use a standard "Experience" heading.',
      'Avoid tables and text boxes for contact details.',
      'Save as PDF exported from a word processor, not a scan.',
    ],
    standard: 'general',
    ats_score: 76,
  },

  job_match: {
    match_score: 71,
    matched_keywords: ['JavaScript', 'React', 'Git'],
    partial_keywords: [
      { resume_term: 'database work', required_term: 'PostgreSQL' },
    ],
    missing_keywords: [
      { keyword: 'REST API', priority: 'high' },
      { keyword: 'unit testing', priority: 'medium' },
      { keyword: 'Docker', priority: 'low' },
    ],
    recommendations: [
      'Name the specific database you used instead of "database work".',
      'Add a bullet describing an API you built or consumed.',
      'Mention any testing you wrote, even at coursework scale.',
    ],
  },

  action_items: [
    'Quantify at least three experience bullets with a number or outcome.',
    'Rename "What I have done" to "Experience".',
    'Move contact details out of the header text box.',
    'Add REST API experience if you have it.',
  ],
};
