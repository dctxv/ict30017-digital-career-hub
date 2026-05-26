---
resume: shahriar
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 122.7
  token_count: 1129
  cost_usd: 0.0052605
  duration_seconds: 9.2
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows a clean, professional structure typical of the Bangladeshi engineering sector. However, the score is capped at 75 due to the inclusion of multiple local conventions (Personal Information, Declaration, and Career Objective) which, while standard in Bangladesh, are often filtered or flagged by international digital systems.",
    "issues": [
      {
        "section": "Header",
        "issue": "The mobile number uses a local format (01711-...) without a country code.",
        "suggestion": "Add the country code (+880) to ensure the number is dialable by international recruiters or automated systems."
      },
      {
        "section": "Professional Experience",
        "issue": "The use of 'Duration:' before dates is redundant and adds unnecessary text density.",
        "suggestion": "Remove 'Duration:' and simply list the dates (e.g., April 2019 – Present) right-aligned on the same line as the job title."
      }
    ]
  },
  "content_quality": {
    "score": 88,
    "feedback": "This is a high-quality resume with excellent quantification of achievements. The candidate uses specific metrics (MW, BDT, percentages, and timeframes) which provide clear evidence of impact. The educational background from BUET is a significant strength for the local market.",
    "strengths": [
      "Strong use of metrics, such as 'reducing remote monitoring response time by 40%' and '8% cost saving'.",
      "Clear progression of responsibility from Junior Engineer to Senior Engineer in reputable organisations (PGCB, Energypac, Summit).",
      "Specific technical details provided, such as 'IEC 61850 protection relay coordination' and 'dissolved gas analysis (DGA)'."
    ],
    "weaknesses": [
      "The References section is non-compliant with Bangladeshi recruitment standards for the energy and government sectors.",
      "A References section with at least two named referees including their designation, organisation, and contact details is expected by most Bangladesh employers.",
      "The 'PMP in progress' entry lacks a current status or specific milestones achieved."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional, technical, and error-free. Action verbs are used effectively to start bullet points.",
    "issues": [
      {
        "original": "English : Professional working proficiency (reading, writing and technical communication)",
        "corrected": "English: Professional working proficiency (reading, writing, and technical communication)",
        "type": "Punctuation"
      }
    ]
  },
  "action_items": [
    "REFERENCES: Replace 'Available upon request' with at least two professional references, including their Name, Designation, Organisation, and Phone/Email.",
    "PROFESSIONAL CERTIFICATIONS: Update the PMP entry to include 'Expected Exam Date: December 2024' (or relevant year) to show immediate commitment.",
    "TECHNICAL SKILLS: Group software and standards more clearly using bullet points rather than colons to improve ATS readability.",
    "PROFESSIONAL EXPERIENCE: In the Energypac section, specify the types of industrial plants (e.g., Textile, Pharmaceutical, or Cement) to show industry versatility."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer",
    "inferred_industry": "Power & Energy / Utilities",
    "keyword_hits": [
      "SCADA",
      "Substation Design",
      "IEC 61850",
      "ETAP",
      "AutoCAD Electrical",
      "Protection and Relay Coordination",
      "EPC Project Management",
      "Power System Studies"
    ],
    "keyword_gaps": [
      "Load Flow Analysis",
      "Grid Stability",
      "Renewable Energy Integration"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL INFORMATION",
        "issue": "International ATS systems may flag this for data privacy (GDPR) or bias reasons.",
        "recommended": "Remove for international roles; keep for local Bangladeshi roles."
      }
    ],
    "ats_tips": [
      "The 'PMP in progress' should be moved to a 'Professional Development' section if not completed, as some ATS filters only look for 'PMP' in a 'Certifications' section and may flag it as a mismatch if it sees 'in progress'.",
      "Ensure the 'Technical Skills' are not inside a table or complex columns, as some older ATS parsers struggle with the colon-separated list format used here.",
      "Add 'Electrical Engineering' as a keyword in the skills section, even though it is in the degree, to increase keyword density for that specific phrase."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 89
}