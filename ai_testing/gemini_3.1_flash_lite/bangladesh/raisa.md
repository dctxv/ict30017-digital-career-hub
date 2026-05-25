---
resume: raisa
mode: bangladesh
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 210
  token_count: 987
  cost_usd: 0.0023115
  duration_seconds: 4.7
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume is clean and logically structured. However, it is subject to a score ceiling of 75 due to the inclusion of multiple standard Bangladeshi CV conventions (Personal Details/Photograph/References/etc. are common, but the layout is currently quite sparse).",
    "issues": [
      {
        "section": "Education and Qualifications",
        "issue": "Missing GPA/CGPA for Bachelor's, HSC, and SSC.",
        "suggestion": "Include your CGPA for your Bachelor's degree and GPA for HSC and SSC (e.g., 3.85/4.00 or 5.00/5.00) to provide a complete academic profile."
      },
      {
        "section": "Education and Qualifications",
        "issue": "Missing Education Board for SSC and HSC.",
        "suggestion": "Add the relevant Education Board (e.g., Dhaka Board) next to your institution name for both SSC and HSC."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The resume demonstrates strong research experience but lacks depth in describing the impact of your roles. Many entries are purely chronological without highlighting specific achievements or technical skills used.",
    "strengths": [
      "Strong academic research background with a published journal article.",
      "Clear progression from intern to Research Associate.",
      "Relevant extracurricular leadership roles."
    ],
    "weaknesses": [
      "Missing Career Objective: A professional summary is needed to frame your research expertise.",
      "Missing References: No professional references provided.",
      "Under-quantified experience: Roles like 'Research Assistant' and 'Intern' lack descriptions of specific tasks, tools (e.g., Stata, R, Python), or outcomes."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and clear. No significant grammatical errors found.",
    "issues": []
  },
  "action_items": [
    "Add a 'Career Objective' section at the top that highlights your research focus in Economics and your proficiency in data analysis tools.",
    "Expand bullet points for your 'Research Associate' and 'Intern' roles to include specific methodologies, software used (e.g., Stata, SPSS, R), and the impact of your research.",
    "Include a 'References' section at the end with at least two professional contacts, including their full name, designation, organization, phone number, and email.",
    "Update the 'Education' section to include your CGPA/GPA and the specific Education Board for your SSC and HSC qualifications.",
    "Ensure your 'Extracurricular Activities' section includes a brief description of your key responsibilities for each role to demonstrate leadership impact."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Development Research / Academia",
    "keyword_hits": [
      "Economics",
      "Research",
      "Data Analysis",
      "Journal Article",
      "Undergraduate thesis",
      "Public Health"
    ],
    "keyword_gaps": [
      "Stata",
      "Econometrics",
      "Quantitative Analysis"
    ],
    "heading_risks": [
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Some ATS systems prefer standard headings.",
        "recommended": "Professional Experience"
      },
      {
        "original": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "Non-standard heading may be missed by some parsers.",
        "recommended": "Publications and Research"
      }
    ],
    "ats_tips": [
      "Explicitly list your technical skills (e.g., Stata, R, Python, Excel) in a dedicated 'Technical Skills' section.",
      "Use standard headings like 'Professional Experience' and 'Education' to ensure better parsing by international ATS.",
      "Quantify your research impact (e.g., 'Analyzed datasets of 5,000+ respondents' or 'Used Stata to perform regression analysis')."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}