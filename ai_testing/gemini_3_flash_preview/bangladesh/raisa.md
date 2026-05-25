---
resume: raisa
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 134
  token_count: 1085
  cost_usd: 0.004871
  duration_seconds: 8.1
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows a clean, chronological structure suitable for academic and research roles. However, it contains several Bangladeshi-specific conventions (such as the 'Curriculum Vitae' title and specific school board mentions) which, while standard locally, trigger a score ceiling for international digital applications. There is also a lack of clear distinction between job titles and organizations.",
    "issues": [
      {
        "section": "Education",
        "issue": "Missing GPA/CGPA denominators and Board names for SSC/HSC.",
        "suggestion": "Update education entries to include 'GPA 5.00/5.00' and specify the Education Board (e.g., Dhaka Board) as per Bangladesh standards."
      },
      {
        "section": "Employment",
        "issue": "Lack of bullet points for job responsibilities.",
        "suggestion": "Under each role, add 3-4 bullet points describing your specific contributions and the tools used (e.g., Stata, R, Python)."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The resume highlights strong academic foundations and prestigious affiliations (BIGD, UNDP). However, the 'Record of Employment' is currently just a list of titles and dates with zero description of duties or achievements. This is a significant weakness for both local and international employers.",
    "strengths": [
      "Strong institutional pedigree (NSU, BIGD, UNDP).",
      "Peer-reviewed publication in a reputable journal (Frontiers in Public Health).",
      "Clear progression from Intern to Research Associate."
    ],
    "weaknesses": [
      "The 'Record of Employment' lacks any description of tasks, methodologies, or outcomes.",
      "Missing a 'References' section which is mandatory for Bangladeshi banking and research sectors.",
      "The 'Extracurricular Activities' section lists roles but does not describe the impact or scale of the events managed.",
      "Missing a 'Technical Skills' section to highlight proficiency in statistical software (Stata, SPSS, R) or data visualization."
    ]
  },
  "language_grammar": {
    "score": 92,
    "feedback": "The language is professional and formal. No major grammatical errors were detected, though the use of 'PRESENT' in all caps is inconsistent with the rest of the casing.",
    "issues": [
      {
        "original": "December 2022 - PRESENT",
        "corrected": "December 2022 – Present",
        "type": "Inconsistent Capitalization"
      }
    ]
  },
  "action_items": [
    "Add a 'References' section including at least two referees (e.g., a supervisor from BIGD and a professor from NSU) with their full contact details.",
    "Expand the 'Record of Employment' by adding 3-5 bullet points per role. For the Research Associate role, specify the datasets analyzed and the research methodologies applied.",
    "Create a 'Technical Skills' section to explicitly list software like Stata, R, LaTeX, or Microsoft Excel, which are critical for Economics roles.",
    "Update the Education section to include the GPA for SSC, HSC, and Bachelor's degree, ensuring the denominator (e.g., /5.00 or /4.00) is present."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Research & Development / International Development",
    "keyword_hits": [
      "Research Associate",
      "Economics",
      "Path Analysis",
      "Public Health",
      "Labor Force Participation",
      "Foreign Direct Investment"
    ],
    "keyword_gaps": [
      "Data Analysis",
      "Stata",
      "Econometrics",
      "Policy Analysis"
    ],
    "heading_risks": [
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Non-standard heading for some global ATS.",
        "recommended": "WORK EXPERIENCE"
      }
    ],
    "ats_tips": [
      "Include specific software names (e.g., Stata, R, SPSS) within your job descriptions, as these are primary keywords for research roles.",
      "Quantify your research impact. Instead of just listing a publication, mention the scope of data handled (e.g., 'Analyzed a dataset of 10,000+ observations').",
      "Remove the 'Last Updated' line at the top; it is unnecessary and takes up valuable space."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 73
}