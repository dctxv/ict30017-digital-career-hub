---
resume: sharmin
mode: bangladesh
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 224
  token_count: 1165
  cost_usd: 0.0025685
  duration_seconds: 5.2
---

## Analysis Output

{
  "formatting": {
    "score": 70,
    "feedback": "The resume follows a clear, logical structure suitable for the Bangladeshi market. However, it is subject to a score ceiling of 75 due to the inclusion of multiple standard local conventions (Personal Information, Declaration, Photograph/Objective).",
    "issues": [
      {
        "section": "WORK EXPERIANCE",
        "issue": "Typographical error in the section heading.",
        "suggestion": "Correct the spelling to 'WORK EXPERIENCE'."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Grammatical error in the section heading.",
        "suggestion": "Change to 'PERSONAL INFORMATION'."
      },
      {
        "section": "General",
        "issue": "Inconsistent bullet point indentation and spacing.",
        "suggestion": "Ensure all bullet points are aligned with uniform margins for a cleaner professional look."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "The resume provides a solid foundation but lacks the depth and quantification required to stand out in competitive HR/Admin roles. The objective is generic, and the work experience bullet points rely on passive language.",
    "strengths": [
      "Clear chronological progression of education and work history.",
      "Relevant internship and administrative experience included.",
      "Inclusion of essential academic details (SSC/HSC/BBA)."
    ],
    "weaknesses": [
      "The Career Objective is generic and lacks a value proposition.",
      "Work experience bullet points use weak verbs like 'helping', 'assisting', and 'doing', which fail to highlight impact.",
      "Missing a References section, which is a standard requirement for Bangladeshi employers.",
      "Missing extracurricular or co-curricular activities, which are vital for a recent graduate to demonstrate leadership."
    ]
  },
  "language_grammar": {
    "score": 65,
    "feedback": "The language is generally understandable but contains several grammatical errors and weak phrasing.",
    "issues": [
      {
        "original": "I am hereby declared that all the informations given above is correct",
        "corrected": "I hereby declare that all the information provided above is correct",
        "type": "Grammar"
      },
      {
        "original": "Helping HR team in recruitment",
        "corrected": "Assisted the HR team in the recruitment",
        "type": "Grammar"
      },
      {
        "original": "Support in managing office supplies",
        "corrected": "Supported the management of office supplies",
        "type": "Grammar"
      }
    ]
  },
  "action_items": [
    "Rewrite the Career Objective: 'Aspiring HR professional with a BBA in HRM and 2+ years of experience in administrative and HR support. Seeking to leverage expertise in leave management, recruitment coordination, and office operations to contribute to the growth of [Company Name].'",
    "Add a 'References' section at the end with at least two professional contacts (Name, Designation, Organization, Phone, Email).",
    "Quantify your work experience: Instead of 'Maintaining employee attendance', use 'Managed attendance records for 100+ employees, ensuring 100% accuracy in monthly payroll inputs.'",
    "Add an 'Extracurricular Activities' section highlighting any club memberships, volunteer work, or university event organizing to showcase leadership potential.",
    "Correct the section headings 'WORK EXPERIANCE' and 'PERSONAL INFORMATIONS' to 'WORK EXPERIENCE' and 'PERSONAL INFORMATION'."
  ],
  "ats_analysis": {
    "inferred_role": "HR/Administrative Assistant",
    "inferred_industry": "Corporate/Manufacturing",
    "keyword_hits": [
      "Human Resource Management",
      "Recruitment",
      "Leave management",
      "Attendance record",
      "Office correspondence",
      "Inventory records"
    ],
    "keyword_gaps": [
      "HRIS (Human Resource Information System)",
      "Payroll processing",
      "Compliance"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Personal Details"
      },
      {
        "original": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Pluralized heading can sometimes cause parsing issues.",
        "recommended": "Education"
      }
    ],
    "ats_tips": [
      "Replace generic skills like 'Good communication skill' with specific tools or methodologies (e.g., 'HRIS software proficiency', 'Conflict Resolution', 'Data Entry').",
      "Use standard section headings like 'Experience' instead of 'WORK EXPERIANCE' to ensure the ATS correctly categorizes your history.",
      "Ensure your contact information is in the header and not buried in a 'Personal Information' block, as some ATS parsers struggle to extract data from the bottom of the page."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 62
}