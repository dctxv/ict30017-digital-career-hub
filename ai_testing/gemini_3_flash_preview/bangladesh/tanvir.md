---
resume: tanvir
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 134.5
  token_count: 1130
  cost_usd: 0.005003
  duration_seconds: 8.4
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows traditional Bangladeshi formatting standards. However, the score is capped at 75 due to the inclusion of multiple local conventions (Personal Details, Declaration, Father/Mother names) which, while standard in Bangladesh, are often filtered or flagged by modern digital ATS systems used by multinationals.",
    "issues": [
      {
        "section": "Educational Qualification",
        "issue": "Missing GPA denominators for SSC and HSC.",
        "suggestion": "Update results to 'GPA 4.50/5.00' and 'GPA 4.25/5.00' to ensure clarity and consistency with the university CGPA format."
      },
      {
        "section": "Professional Experience",
        "issue": "Inconsistent bullet point alignment and spacing.",
        "suggestion": "Ensure all bullet points are left-aligned with the section header and use consistent 1.15 line spacing to improve readability."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "The resume provides a clear educational history but the professional experience and objective sections are generic and lack impact. The internship descriptions focus on tasks rather than achievements.",
    "strengths": [
      "Includes complete educational timeline (SSC, HSC, BBA) as expected for fresh graduates.",
      "Clear identification of the internship duration and branch location."
    ],
    "weaknesses": [
      "The Career Objective is generic. Suggested rewrite: 'Aspiring Finance professional with a BBA from Southeast University and internship experience at Mutual Trust Bank. Seeking a Junior Officer role in Banking to leverage my expertise in KYC verification and customer service to enhance branch operational efficiency.'",
      "The Professional Experience section uses weak verbs like 'Assisted', 'Helped', and 'Did data entry'.",
      "A References section exists but only contains 'available upon request'. Bangladeshi employers expect 2-3 named referees with full contact details.",
      "No extracurricular activities or club memberships listed, which are vital for fresh graduates to demonstrate leadership.",
      "Missing a final year project or thesis title, which is expected for a BBA graduate in Finance."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally clear, but the use of 'Fairly good' in language proficiency sounds hesitant and unprofessional.",
    "issues": [
      {
        "original": "English : Fairly good in reading and writing",
        "corrected": "English : Proficient in reading and writing",
        "type": "vocabulary"
      },
      {
        "original": "Did data entry work",
        "corrected": "Executed data entry for new account registrations with 100% accuracy",
        "type": "weak action verb"
      }
    ]
  },
  "action_items": [
    "Professional Experience: Rewrite internship bullets to include metrics. For example: 'Processed 20+ daily customer transactions' or 'Verified KYC documents for 100+ new accounts ensuring compliance with bank policy.'",
    "References: Replace 'Available upon request' with two professional references, including their Name, Designation, Organization, and Phone Number.",
    "Education: Add your BBA Internship Report or Thesis title and a brief description of the findings under the Southeast University entry.",
    "Extracurricular: Add a section for 'Co-curricular Activities' listing any club memberships, volunteer work, or sports participation during university.",
    "Computer Skills: Be more specific about MS Excel skills (e.g., VLOOKUP, Pivot Tables, Data Validation) as these are highly valued in banking."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Officer / Management Trainee",
    "inferred_industry": "Banking and Finance",
    "keyword_hits": [
      "Finance",
      "Customer Service",
      "KYC verification",
      "Account opening",
      "Data entry",
      "BBA"
    ],
    "keyword_gaps": [
      "Compliance",
      "Financial Analysis",
      "AML (Anti-Money Laundering)"
    ],
    "heading_risks": [
      {
        "original": "COMPUTER SKILLS",
        "issue": "Generic heading",
        "recommended": "TECHNICAL SKILLS"
      }
    ],
    "ats_tips": [
      "Quantify your internship experience. ATS systems and recruiters look for numbers (e.g., 'Managed 50+ files daily') to rank candidates.",
      "Remove the 'Declaration' and 'Signature' lines for international/multinational applications to save space for more relevant skills.",
      "Use a standard reverse-chronological layout and avoid using tables for personal information, as some ATS struggle to parse data inside table cells."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 65
}