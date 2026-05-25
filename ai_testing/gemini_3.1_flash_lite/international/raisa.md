---
resume: raisa
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 209.5
  token_count: 922
  cost_usd: 0.0021
  duration_seconds: 4.4
---

## Analysis Output

{
  "formatting": {
    "score": 55,
    "feedback": "The resume follows a clean, chronological structure but includes several non-standard elements that are discouraged in international hiring. The use of 'Curriculum Vitae' as a title is outdated; a simple name header is preferred. The layout is readable, but the inclusion of secondary school details and the lack of a professional summary hinder its impact.",
    "issues": [
      {
        "section": "Education and Qualifications",
        "issue": "Including SSC and HSC details is unnecessary for a university graduate and consumes space that should be used for professional achievements.",
        "suggestion": "Remove SSC and HSC entries. Focus exclusively on your Bachelor's degree."
      },
      {
        "section": "Heading",
        "issue": "The heading 'Education and Qualifications' is non-standard.",
        "suggestion": "Rename to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "The resume lists relevant roles but lacks impact. It reads more like a list of duties than a record of achievements. There is a significant lack of quantification (e.g., project sizes, data sets analyzed, or specific outcomes).",
    "strengths": [
      "Strong academic and research-focused background.",
      "Clear chronological progression from internship to Research Associate.",
      "Inclusion of relevant publications adds significant credibility."
    ],
    "weaknesses": [
      "Lack of a 'Professional Summary' to frame your expertise.",
      "Bullet points are entirely missing; the current format is a list of titles without context.",
      "No mention of technical skills (e.g., Stata, R, Python, SPSS) which are critical for an Economics Research Associate."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and clear. No significant spelling or grammatical errors were found.",
    "issues": []
  },
  "action_items": [
    "Add a 'Professional Summary' section at the top highlighting your research experience, technical proficiency (e.g., Stata/R), and key areas of interest.",
    "Convert your employment history into bulleted lists. For each role, use action verbs and quantify your impact (e.g., 'Analyzed a dataset of 5,000+ households using Stata to identify trends in labor force participation').",
    "Create a 'Technical Skills' section to explicitly list software, programming languages, and research methodologies you are proficient in.",
    "Remove the SSC and HSC entries to prioritize space for professional experience and technical skills."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate (Economics)",
    "inferred_industry": "Development Economics / Research",
    "keyword_hits": [
      "Research Associate",
      "Economics",
      "Data Analysis",
      "UNDP",
      "Journal Article",
      "Path Analysis"
    ],
    "keyword_gaps": [
      "Stata",
      "Econometrics",
      "Quantitative Research"
    ],
    "heading_risks": [
      {
        "original": "Education and Qualifications",
        "issue": "Non-standard heading.",
        "recommended": "Education"
      },
      {
        "original": "Record of Employment",
        "issue": "Non-standard heading.",
        "recommended": "Professional Experience"
      }
    ],
    "ats_tips": [
      "International ATS systems often discard resumes that include personal demographic data; ensure your final version is strictly professional.",
      "Use standard headings like 'Professional Experience' and 'Education' to ensure the ATS correctly parses your career timeline.",
      "Integrate technical keywords (e.g., 'Econometric Modeling', 'Survey Design', 'Data Cleaning') directly into your bullet points to improve ranking."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 65
}