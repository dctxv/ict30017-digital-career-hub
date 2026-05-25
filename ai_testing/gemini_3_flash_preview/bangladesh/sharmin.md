---
resume: sharmin
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 141.4
  token_count: 1372
  cost_usd: 0.005757
  duration_seconds: 9.7
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows traditional Bangladeshi formatting standards, which is appropriate for local corporate roles. However, the score is capped at 75 due to the inclusion of multiple local conventions (Personal Information, Declaration, etc.) which may hinder performance in modern digital or multinational ATS systems. There are minor alignment issues in the Skills and Personal Information sections.",
    "issues": [
      {
        "section": "WORK EXPERIANCE",
        "issue": "Spelling error in the section heading.",
        "suggestion": "Change 'WORK EXPERIANCE' to 'WORK EXPERIENCE'."
      },
      {
        "section": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Missing GPA denominators for SSC and HSC.",
        "suggestion": "Update to 'GPA: 3.75/5.00' and 'GPA: 3.50/5.00' to ensure clarity for automated systems."
      },
      {
        "section": "SKILLS",
        "issue": "Inconsistent colon alignment.",
        "suggestion": "Align the colons vertically to create a cleaner, more professional look."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "The resume provides a clear educational and professional timeline, but the descriptions are passive and lack quantification. The Career Objective is generic and does not highlight a unique value proposition.",
    "strengths": [
      "Includes relevant internships and work experience in reputable Bangladeshi conglomerates (Partex, Bengal Group).",
      "Clearly lists educational background including SSC and HSC as expected in the local market.",
      "Includes all necessary personal details and declarations required by traditional Bangladeshi employers."
    ],
    "weaknesses": [
      "The Career Objective is generic: 'I want to get a good job... where I can work hard'. It lacks a specific value proposition.",
      "Work experience bullets use passive language like 'Helping', 'Assisting', and 'Doing' without mentioning results or scale (e.g., number of employees managed).",
      "Missing a References section with named referees, which is a standard expectation for HR/Admin roles in Bangladesh.",
      "No mention of a final year project or thesis, which is expected for a BBA graduate from 2020.",
      "Extracurricular activities are missing, which are important for candidates with early-career profiles to demonstrate leadership."
    ]
  },
  "language_grammar": {
    "score": 65,
    "feedback": "There are several grammatical errors, particularly in the use of pluralization and verb tenses in the work experience and declaration sections.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "spelling"
      },
      {
        "original": "Helping HR team in recruitment and selection process",
        "corrected": "Assisted the HR team with the recruitment and selection process",
        "type": "tense/grammar"
      },
      {
        "original": "Doing photocopying and scanning works as required",
        "corrected": "Managed document reproduction and digital archiving tasks",
        "type": "vocabulary"
      },
      {
        "original": "I am hereby declared that all the informations given above is correct",
        "corrected": "I hereby declare that all the information provided above is correct",
        "type": "grammar"
      },
      {
        "original": "stationary and inventory records",
        "corrected": "stationery and inventory records",
        "type": "spelling"
      }
    ]
  },
  "action_items": [
    "Rewrite the Career Objective: 'BBA graduate in HRM with 2+ years of experience in administrative support and HR operations at leading industrial groups, seeking to leverage expertise in employee record management and office coordination to drive efficiency at [Company Name].'",
    "Quantify Work Experience: In the Bengal Group role, specify how many employees you supported or the volume of correspondence handled (e.g., 'Managed daily correspondence for a department of 50+ staff').",
    "Add a References Section: Include at least two professional referees (e.g., your Manager from Bengal Group and a Professor from DIU) with their full names, designations, and contact numbers.",
    "Include Academic Project: Add your BBA internship report or thesis title under the Education section to demonstrate your specialized knowledge in HRM.",
    "Fix Section Headings: Correct the spelling of 'EXPERIENCE' and ensure all headings are consistently formatted."
  ],
  "ats_analysis": {
    "inferred_role": "HR & Administrative Assistant",
    "inferred_industry": "Corporate/Manufacturing",
    "keyword_hits": [
      "Human Resource Management",
      "Recruitment",
      "Selection",
      "Attendance record",
      "Leave management",
      "Office correspondence",
      "Inventory records",
      "MS Excel",
      "MS Word"
    ],
    "keyword_gaps": [
      "HRIS",
      "Payroll Processing",
      "Employee Relations"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "Non-standard pluralization and content often ignored by Western ATS.",
        "recommended": "Personal Details"
      }
    ],
    "ats_tips": [
      "Use standard past-tense action verbs to start every bullet point (e.g., 'Coordinated', 'Maintained', 'Administered') instead of present continuous forms like 'Doing' or 'Helping'.",
      "Remove the 'Declaration' and 'Signature' lines if applying to international or tech-forward companies in Bangladesh, as these are not machine-readable and waste space.",
      "Ensure your contact information is in the header only; repeating it in a 'Personal Information' section can confuse some ATS parsers."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 65
}