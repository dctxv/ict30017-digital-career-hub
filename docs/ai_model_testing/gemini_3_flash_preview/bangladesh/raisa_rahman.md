---
resume: raisa_rahman
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 169.8
  token_count: 1029
  cost_usd: 0.0055582
  duration_seconds: 6.1
---

## Analysis Output

```json
{
  "formatting": {
    "score": 72,
    "feedback": "The CV follows a clean, academic layout suitable for research roles. However, the use of '---' as dividers and the lack of bulleted descriptions under employment entries make it appear more like a list than a professional resume. The score reflects a ceiling due to the academic CV style which, while standard in research, lacks the density expected by corporate ATS.",
    "issues": [
      {
        "section": "RECORD OF EMPLOYMENT",
        "issue": "Employment entries lack descriptions of responsibilities or achievements.",
        "suggestion": "Add 3-4 bullet points under each role (Research Associate, Intern) detailing specific projects, methodologies used, and outcomes."
      },
      {
        "section": "EDUCATION AND QUALIFICATIONS",
        "issue": "Missing CGPA/GPA for all degrees and missing the GPA denominator (/4.00 or /5.00).",
        "suggestion": "Include your CGPA for NSU and GPA for HSC/SSC, as these are mandatory for early-career roles in Bangladesh."
      }
    ]
  },
  "content_quality": {
    "score": 78,
    "feedback": "The candidate has an impressive academic and research profile, including a peer-reviewed publication in a reputable journal (Frontiers in Public Health). However, the professional experience section is currently just a list of titles, which fails to showcase the candidate's technical skills in data analysis or field research.",
    "strengths": [
      "Peer-reviewed publication in an international journal, which is rare for a recent graduate.",
      "Experience at top-tier organizations like BIGD and UNDP.",
      "Strong leadership history in extracurricular activities (Yearly In-Charge, Vice President)."
    ],
    "weaknesses": [
      "Complete absence of job descriptions. Recruiters cannot see if you used Stata, R, Python, or conducted qualitative interviews.",
      "Missing SSC and HSC results (GPA and Board), which are standard requirements for Bangladeshi employers to verify academic consistency.",
      "No 'Technical Skills' section to highlight proficiency in econometric software or data visualization tools."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is formal and academic. No significant grammatical errors were found, though the document is currently very sparse on descriptive text.",
    "issues": []
  },
  "action_items": [
    "Employment Section: Add detailed bullet points for your role at BIGD and UNDP. Mention specific datasets analyzed, software used (e.g., Stata, R), and any reports authored.",
    "Education Section: Add your CGPA for your Bachelor's degree and GPA for HSC/SSC. Also, specify the Education Board (e.g., Dhaka Board) for your school/college entries.",
    "Skills Section: Create a 'Technical Skills' section. List software like Stata, SPSS, R, LaTeX, or any data collection tools like SurveyCTO or KoboToolbox.",
    "References: Add a References section with at least two named referees (e.g., your supervisor at BIGD and your thesis supervisor from NSU) including their full contact details."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Research & Development / International Organizations",
    "keyword_hits": [
      "Research Associate",
      "Economics",
      "UNDP",
      "BIGD",
      "Journal Article",
      "Labor Force Participation",
      "FDI"
    ],
    "keyword_gaps": [
      "Stata",
      "Data Analysis",
      "Econometrics",
      "Policy Analysis"
    ],
    "heading_risks": [
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Non-standard heading for many ATS.",
        "recommended": "PROFESSIONAL EXPERIENCE"
      }
    ],
    "ats_tips": [
      "Include specific software names (Stata, R, Python) in your job descriptions; these are the most common keywords for Research Associate filters.",
      "Ensure your LinkedIn URL is a live hyperlink or clearly formatted to be clickable in PDF format.",
      "Add a 'Summary' or 'Career Objective' to include keywords like 'Quantitative Research' and 'Policy Evaluation' at the top of the document."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 80
}
```
