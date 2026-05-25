---
resume: raisa
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 141
  token_count: 1114
  cost_usd: 0.00473
  duration_seconds: 7.9
---

## Analysis Output

{
  "formatting": {
    "score": 65,
    "feedback": "The resume follows a clean, chronological structure but uses non-standard headings and lacks a professional summary. The use of 'CURRICULUM VITAE' at the top is redundant and wastes space.",
    "issues": [
      {
        "section": "Header",
        "issue": "The title 'CURRICULUM VITAE' is unnecessary and takes up valuable vertical space.",
        "suggestion": "Remove 'CURRICULUM VITAE' and ensure your name is the largest text at the top."
      },
      {
        "section": "Education and Qualifications",
        "issue": "Heading risk: 'Education and Qualifications' is non-standard for international ATS systems.",
        "suggestion": "Rename this section to 'Education'."
      },
      {
        "section": "Record of Employment",
        "issue": "Heading risk: 'Record of Employment' is a regional convention; international ATS systems prefer standard headers.",
        "suggestion": "Rename this section to 'Professional Experience' or 'Work Experience'."
      },
      {
        "section": "Dates",
        "issue": "The 'Last Updated' line is not used in professional international resumes.",
        "suggestion": "Remove 'Last Updated October 2022' entirely."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "While the candidate has impressive institutional affiliations (UNDP, BIGD), the resume is almost entirely a list of titles. There are no bullet points describing responsibilities, achievements, or tools used in any of the roles.",
    "strengths": [
      "Strong academic background from reputable institutions.",
      "High-quality research experience with a peer-reviewed publication in a reputable journal (Frontiers in Public Health).",
      "Experience with international organizations (UNDP)."
    ],
    "weaknesses": [
      "Complete lack of job descriptions or bullet points for all roles.",
      "No mention of technical skills (e.g., Stata, R, Python, SPSS) which are critical for Economics research.",
      "Missing a Professional Summary to frame the candidate's research interests and expertise."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language used is formal and correct, though the lack of descriptive content limits the opportunity for assessment.",
    "issues": [
      {
        "original": "Undergraduate thesis titled \"Labor Force Participation...\"",
        "corrected": "Undergraduate Thesis: \"Labor Force Participation...\"",
        "type": "Punctuation/Style"
      }
    ]
  },
  "action_items": [
    "Professional Experience: Add 3-4 bullet points for each role (BIGD, UNDP, NSU) using action verbs. Quantify your impact (e.g., 'Analyzed datasets of 5,000+ households using Stata').",
    "Skills Section: Create a dedicated 'Skills' section listing technical proficiencies (Stata, R, LaTeX, GIS), languages, and research methodologies.",
    "Professional Summary: Add a 3-line summary at the top highlighting your years of experience in economic research and your specific areas of interest (e.g., Public Health, Labor Economics).",
    "Education: Include your CGPA for your Bachelor of Science in Economics, as this is standard for junior research roles."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Research & International Development",
    "keyword_hits": [
      "Economics",
      "Research Associate",
      "Research Assistant",
      "Public Health",
      "Path Analysis",
      "Foreign Direct Investment"
    ],
    "keyword_gaps": [
      "Stata",
      "Data Analysis",
      "Econometrics"
    ],
    "heading_risks": [
      {
        "original": "Education and Qualifications",
        "issue": "Non-standard phrasing may confuse some ATS parsers.",
        "recommended": "Education"
      },
      {
        "original": "Record of Employment",
        "issue": "Less common than standard professional headers.",
        "recommended": "Professional Experience"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely discount resumes that lack specific task descriptions; ensure every job has bullet points starting with action verbs.",
      "Include a 'Skills' section. ATS systems for research roles specifically look for software names like 'Stata', 'R', or 'Python'.",
      "Ensure your LinkedIn URL is hyperlinked and clean to allow recruiters to easily verify your publication record."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 65
}