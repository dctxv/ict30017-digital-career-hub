---
resume: sharmin
mode: bangladesh
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 62.4
  token_count: 1210
  cost_usd: 0.0007148
  duration_seconds: 19.4
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows several traditional Bangladeshi CV conventions, such as including detailed personal information and a declaration. However, because it utilizes these local conventions, the score is capped to reflect that modern digital applications for international or multinational companies often prefer a more streamlined, single-page format without extensive personal details.",
    "issues": [
      {
        "section": "WORK EXPERIANCE",
        "issue": "Spelling error in the section heading.",
        "suggestion": "Change 'WORK EXPERIANCE' to 'WORK EXPERIENCE'."
      },
      {
        "section": "SKILLS",
        "issue": "Inconsistent use of colons and spacing in the list.",
        "suggestion": "Ensure uniform spacing, e.g., 'Computer: MS Word...' instead of 'Computer : MS Word...'."
      }
    ]
  },
  "content_quality": {
    "score": 45,
    "feedback": "The resume provides a clear timeline of education and work, but it suffers from generic language and a lack of quantifiable achievements. The Career Objective is highly generic, and the job descriptions use passive, low-impact verbs.",
    "strengths": [
      "Clear chronological work history.",
      "Relevant educational background in Human Resource Management."
    ],
    "weaknesses": [
      "The Career Objective uses generic phrases like 'get a good job' and 'reputed company' without specifying value or a target role.",
      "Bullet points in the HR Intern and Administrative Assistant roles use vague language such as 'Helping', 'Assisting', 'Doing', and 'Support' without mentioning the scale or outcome of these tasks.",
      "Missing a References section, which is expected by most Bangladeshi employers.",
      "Missing SSC and HSC Board names in the Education section.",
      "Missing a section for extracurricular activities or volunteer work, which is important for candidates with under 3 years of experience to demonstrate leadership."
    ]
  },
  "language_grammar": {
    "score": 60,
    "feedback": "There are several grammatical errors, particularly regarding subject-verb agreement and the use of pluralization in the Declaration and Skills sections.",
    "issues": [
      {
        "original": "I want to get a good job in HR or admin department in any reputed company or organisation where I can work hard and prove myself and make a good future.",
        "corrected": "Aspiring HR professional seeking to leverage my BBA in Human Resource Management and administrative experience to contribute to the operational efficiency of a growth-oriented organization.",
        "type": "Weak/Generic Content"
      },
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "Spelling"
      },
      {
        "original": "Assisting in the induction programme of new joining employees",
        "corrected": "Assisted in the induction programme for new employees",
        "type": "Grammar/Tense"
      },
      {
        "original": "Doing photocopying and scanning works as required",
        "corrected": "Managed document digitisation and photocopying tasks as required",
        "type": "Weak Verb/Grammar"
      },
      {
        "original": "all the informations given above is correct",
        "corrected": "all the information provided above is correct",
        "type": "Grammar (Information is uncountable)"
      }
    ]
  },
  "action_items": [
    "Rewrite the Career Objective to be specific to an HR or Admin role, focusing on what you can offer the employer rather than what you want from them.",
    "Quantify your work experience. Instead of 'Maintaining employee attendance', use 'Managed daily attendance records for [Number] employees using [Software/Method].'",
    "Add a References section containing at least two named referees with their designation, organisation, and contact details.",
    "Update the Education section to include the Education Board (e.g., Dhaka Board) for both SSC and HSC entries.",
    "Replace passive verbs like 'Helping', 'Assisting', and 'Doing' with strong action verbs like 'Coordinated', 'Facilitated', 'Managed', or 'Executed'."
  ],
  "ats_analysis": {
    "inferred_role": "HR Assistant / Administrative Assistant",
    "inferred_industry": "Human Resources / Administration",
    "keyword_hits": [
      "Human Resource Management",
      "Recruitment",
      "Selection process",
      "Employee engagement",
      "Office correspondence",
      "Filing system",
      "Inventory records"
    ],
    "keyword_gaps": [
      "HRIS (Human Resource Information System)",
      "Payroll Management",
      "Compliance"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Incorporate specific HR software or tools (e.g., SAP, Oracle, or specific attendance software) if you have used them.",
      "Expand the 'Skills' section to include more industry-standard competencies like 'Employee Relations' or 'Onboarding'.",
      "Ensure the 'Work Experience' section uses standard job titles that match industry norms to improve parsing accuracy."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 55
}
```