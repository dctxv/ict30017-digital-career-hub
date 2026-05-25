---
resume: sharmin
mode: bangladesh
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 114.5
  token_count: 2599
  cost_usd: 0.01647
  duration_seconds: 22.7
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows standard Bangladeshi CV conventions correctly, including Personal Information, Declaration, and appropriate section headings. However, there are structural inconsistencies and spacing issues that reduce visual clarity. The formatting score is capped at 75 due to the presence of three or more Bangladeshi CV conventions (Personal Information section, Declaration section, and Career Objective heading), which reflects modern digital application standards rather than a penalty. For international ATS systems, these conventions may reduce parseability.",
    "issues": [
      {
        "section": "WORK EXPERIANCE",
        "issue": "Heading contains spelling error: 'EXPERIANCE' should be 'EXPERIENCE'",
        "suggestion": "Change heading to 'WORK EXPERIENCE'"
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Heading uses plural 'INFORMATIONS' which is grammatically incorrect in English",
        "suggestion": "Change heading to 'PERSONAL INFORMATION'"
      },
      {
        "section": "Educational Qualifications",
        "issue": "HSC entry missing GPA denominator (/5.00). Shows 'GPA: 3.75' without denominator",
        "suggestion": "Change to 'GPA: 3.75/5.00' for consistency with SSC entry and international clarity"
      },
      {
        "section": "Work Experience bullets",
        "issue": "Inconsistent bullet point formatting and density. Some bullets are long and wrap awkwardly",
        "suggestion": "Break longer bullets into two lines or condense to one clear action per bullet"
      }
    ]
  },
  "content_quality": {
    "score": 58,
    "feedback": "The resume demonstrates relevant experience in HR and administration aligned with the stated objective, but suffers from significant quantification gaps and vague language throughout the work experience section. Most bullet points lack metrics, outcomes, or specific achievements. The Career Objective uses generic language without specifying a target role or concrete value proposition. For a fresh graduate (2020) with limited work experience, the absence of an extracurricular activities section is a notable gap, as Bangladeshi employers value this for assessing leadership and initiative.",
    "strengths": [
      "Relevant educational background (BBA in HRM) directly aligned with HR/Admin roles",
      "Dual work experience in both HR and Administration departments shows breadth",
      "Clear progression from internship to full-time role demonstrates career continuity",
      "Includes both SSC and HSC qualifications as expected by Bangladesh employers",
      "Language skills (Bangla and English) are explicitly stated"
    ],
    "weaknesses": [
      "Career Objective is generic: 'I want to get a good job in HR or admin department in any reputed company or organisation where I can work hard and prove myself and make a good future' — lacks specific target role, industry, or concrete value proposition",
      "Work experience bullets use vague language without quantification: 'Maintaining employee attendance record' (no metrics on volume or system used), 'Helping HR team in recruitment' (no number of candidates processed or positions filled), 'Assisting in the induction programme' (no number of employees inducted)",
      "Administrative Assistant role lacks outcome-focused language: 'Handling all office correspondence' (no volume or efficiency improvement), 'Maintaining proper filing system' (no system type or impact), 'Support in managing office supplies' (no cost savings or inventory accuracy metrics)",
      "No extracurricular activities, volunteer work, club memberships, or co-curricular involvement listed — expected for fresh graduates in Bangladesh market",
      "Skills section lists only software tools and generic traits ('Good communication skill, team player, honest and hardworking person') without proficiency levels or context",
      "No final year project or thesis entry despite BBA degree — expected for recent graduates in Bangladesh"
    ]
  },
  "language_grammar": {
    "score": 72,
    "feedback": "The resume contains multiple spelling and grammatical errors that reduce professionalism. The most critical issue is the heading 'WORK EXPERIANCE' which is a clear spelling error. There are also grammatical inconsistencies in the Personal Information section and weak action verbs throughout the work experience bullets. Tense usage is generally consistent (past tense for completed roles), but phrasing is often passive or vague.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "spelling error"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "corrected": "PERSONAL INFORMATION",
        "type": "grammatical error — incorrect plural form"
      },
      {
        "original": "I am hereby declared that all the informations given above is correct to my knowledge.",
        "corrected": "I hereby declare that all the information given above is correct to the best of my knowledge.",
        "type": "grammatical error — mixed tense, incorrect subject-verb agreement, and awkward phrasing"
      },
      {
        "original": "Maintaining employee attendance record and leave management",
        "corrected": "Maintained employee attendance records and processed leave requests",
        "type": "weak action verb — 'maintaining' is passive; 'maintained' is stronger and more specific"
      },
      {
        "original": "Helping HR team in recruitment and selection process",
        "corrected": "Assisted the HR team in recruitment and candidate selection",
        "type": "weak action verb — 'helping' is vague; 'assisted' is more professional, though 'led' or 'coordinated' would be stronger"
      },
      {
        "original": "Also helped in organising company events and employee engagement activities",
        "corrected": "Organised company events and employee engagement activities",
        "type": "weak action verb — 'also helped in' is redundant and passive; 'organised' is direct and active"
      },
      {
        "original": "Support in managing office supplies, stationary and inventory records",
        "corrected": "Managed office supplies, stationery, and inventory records",
        "type": "weak action verb — 'support in managing' is passive; 'managed' is active. Also note: 'stationary' (adjective, meaning not moving) should be 'stationery' (noun, office supplies)"
      }
    ]
  },
  "action_items": [
    "Rewrite the Career Objective to specify your target role (e.g., 'HR Coordinator' or 'HR Specialist'), the industry or company type you prefer, and one concrete strength. Example: 'To secure an HR Coordinator position in a multinational FMCG or banking organisation where I can leverage my recruitment and employee engagement experience to support talent acquisition and retention initiatives.'",
    "Quantify all work experience bullets with specific metrics or outcomes. For example, change 'Maintaining employee attendance record and leave management' to 'Maintained attendance records for 150+ employees and processed 200+ leave requests using [system name], achieving 98% accuracy' and 'Helping HR team in recruitment' to 'Assisted in recruitment for 8 positions, screening 120+ CVs and coordinating interviews for 25+ shortlisted candidates.'",
    "Add a section titled 'Extracurricular Activities' or 'Co-Curricular Involvement' listing any club memberships, volunteer work, academic competitions, or community activities during your university years (2016–2020). Include role and duration for each entry. If none exist, consider adding relevant volunteer or community work undertaken since graduation.",
    "Correct the spelling error in the heading 'WORK EXPERIANCE' to 'WORK EXPERIENCE' and change 'PERSONAL INFORMATIONS' to 'PERSONAL INFORMATION'. Also add the denominator to the HSC GPA: change 'GPA: 3.75' to 'GPA: 3.75/5.00'.",
    "Replace weak action verbs throughout the work experience section. Change 'Maintaining' to 'Maintained', 'Helping' to 'Coordinated' or 'Led', 'Assisting' to 'Facilitated', and 'Support in managing' to 'Managed'. Ensure each bullet begins with a strong past-tense action verb."
  ],
  "ats_analysis": {
    "inferred_role": "HR Coordinator / HR Administrator",
    "inferred_industry": "Human Resources / Administration",
    "keyword_hits": [
      "HR",
      "Human Resources",
      "recruitment",
      "employee engagement",
      "attendance",
      "leave management",
      "administrative",
      "office management",
      "MS Excel",
      "MS Word",
      "communication"
    ],
    "keyword_gaps": [
      "HRIS (Human Resource Information System) or HR software — commonly required for HR roles but not mentioned",
      "Payroll or compensation — relevant to HR but absent from resume",
      "Performance management or appraisal — standard HR function not explicitly covered"
    ],
    "heading_risks": [
      {
        "original": "WORK EXPERIANCE",
        "issue": "Spelling error may cause ATS parsing issues or keyword matching failures if the system searches for 'WORK EXPERIENCE'",
        "recommended": "WORK EXPERIENCE"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "Non-standard heading; international ATS systems may not recognise this section or may fail to parse it correctly",
        "recommended": "PERSONAL INFORMATION (or omit entirely for international applications, as this section is not standard in Western CVs)"
      },
      {
        "original": "EDUCATIONAL QUALIFICATIONS",
        "issue": "While acceptable in Bangladesh, international ATS systems typically expect 'EDUCATION' or 'ACADEMIC BACKGROUND'",
        "recommended": "EDUCATION (for international ATS compatibility)"
      }
    ],
    "ats_tips": [
      "Add HRIS or HR software keywords to the Skills section or work experience bullets. For example, add 'HRIS platforms' or name specific systems used (e.g., 'BambooHR', 'Workday', 'SAP SuccessFactors') if applicable. This is a high-value keyword gap for HR roles.",
      "Expand the Skills section to include HR-specific competencies such as 'Recruitment', 'Employee Relations', 'Payroll Administration', or 'Performance Management' as separate line items, not just software tools. ATS systems search for these functional keywords.",
      "Correct the spelling of 'WORK EXPERIANCE' to 'WORK EXPERIENCE' immediately — this is a critical parsing issue that may cause the entire section to be missed by some ATS systems."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 66
}
```