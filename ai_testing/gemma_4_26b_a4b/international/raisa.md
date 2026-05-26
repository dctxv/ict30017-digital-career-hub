---
resume: raisa
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 62.3
  token_count: 1090
  cost_usd: 0.0006364
  duration_seconds: 17.5
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows a clean, chronological structure, but it utilizes several non-standard headings and conventions that are more common in local Bangladeshi CVs than in international professional resumes. The use of horizontal dividers is acceptable, but the overall layout lacks the density and impact required for high-level research roles.",
    "issues": [
      {
        "section": "Header",
        "issue": "The title 'CURRICULUM VITAE' is redundant and non-standard for international applications.",
        "suggestion": "Remove 'CURRICULUM VITAE' and simply use your name as the header."
      },
      {
        "section": "EDUCATION AND QUALIFICATIONS",
        "issue": "Heading risk: 'EDUCATION AND QUALIFICATIONS' is non-standard for international ATS systems.",
        "suggestion": "Change to 'Education'."
      },
      {
        "section": "RECORD OF EMPLOYMENT",
        "issue": "Heading risk: 'RECORD OF EMPLOYMENT' is non-standard.",
        "suggestion": "Change to 'Professional Experience' or 'Work Experience'."
      },
      {
        "section": "EXTRACURRICULAR ACTIVITIES",
        "issue": "Heading risk: 'EXTRACURRICULAR ACTIVITIES' is often better categorized for professional roles.",
        "suggestion": "Change to 'Leadership & Activities' or 'Volunteer Experience'."
      }
    ]
  },
  "content_quality": {
    "score": 45,
    "feedback": "While the candidate has impressive credentials (UNDP, BIGD, and a published journal article), the 'Record of Employment' section is critically under-developed. It lists titles and dates but provides zero information regarding responsibilities, methodologies, tools used, or achievements.",
    "strengths": [
      "Strong institutional affiliations (UNDP, BIGD, North South University).",
      "Demonstrated research capability through a peer-reviewed publication.",
      "Clear academic progression."
    ],
    "weaknesses": [
      "Complete lack of bullet points describing duties or accomplishments in the employment section.",
      "Failure to quantify research impact (e.g., size of datasets managed, number of reports produced, or specific software used like Stata, R, or Python).",
      "The 'Academic Work' section lists course papers which are generally considered too junior for a Research Associate role; focus instead on the methodology used in the thesis."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional and clear. There are no significant grammatical errors, though the content is too sparse to evaluate linguistic nuance.",
    "issues": []
  },
  "action_items": [
    "Immediately add 3-5 bullet points under each job title in the 'Record of Employment' section. Use the formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
    "Explicitly list technical skills (e.g., Econometric modeling, Stata, R, Python, LaTeX, SPSS) in a new 'Skills' section to ensure ATS compatibility.",
    "Expand on the 'Undergraduate thesis' by mentioning the specific econometric models or data sources used (e.g., 'Utilized Probit regression analysis on HIES data to...').",
    "Remove the 'Last Updated' line to maintain a standard professional format."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate",
    "inferred_industry": "Economics / International Development",
    "keyword_hits": [
      "Economics",
      "Research Associate",
      "Path Analysis",
      "Journal Article",
      "Labor Force Participation"
    ],
    "keyword_gaps": [
      "Econometrics",
      "Quantitative Research",
      "Data Analysis"
    ],
    "heading_risks": [
      {
        "original": "EDUCATION AND QUALIFICATIONS",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Education"
      },
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Professional Experience"
      }
    ],
    "ats_tips": [
      "Include specific software tools (e.g., Stata, R, Python) as these are primary keywords for research roles.",
      "Expand the employment descriptions; ATS systems scan the text within job roles for skill-based keywords.",
      "Ensure that the publication details include keywords related to the methodology used (e.g., 'Path Analysis')."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 62
}
```