---
resume: sharmin
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 257.1
  token_count: 1414
  cost_usd: 0.002828
  duration_seconds: 5.5
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume currently follows traditional Bangladeshi CV conventions which are detrimental to international applications. It contains excessive personal data and non-standard headings that hinder ATS parsing and professional presentation.",
    "issues": [
      {
        "section": "Personal Informations",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Informations",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Informations",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Informations",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Personal Informations",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Career Objective",
        "issue": "The heading 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Rename to 'Professional Summary'."
      },
      {
        "section": "Educational Qualifications",
        "issue": "The heading 'Educational Qualifications' is non-standard for international ATS systems.",
        "suggestion": "Rename to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 40,
    "feedback": "The content is overly passive and lacks the impact required for competitive roles. It relies on vague verbs that do not demonstrate the scale or success of your contributions.",
    "strengths": [
      "Clear chronological progression of work experience.",
      "Relevant educational background in Human Resource Management."
    ],
    "weaknesses": [
      "Use of weak, passive language such as 'Helping', 'Assisting', 'Support in', and 'Doing'.",
      "Lack of metrics (e.g., how many employees were in the database, how many recruitment cycles were supported).",
      "The 'Career Objective' is generic and focuses on what you want rather than what you offer the employer.",
      "Skills section is too basic; 'Internet' and 'Honest' are not professional skills."
    ]
  },
  "language_grammar": {
    "score": 65,
    "feedback": "The language is generally understandable but contains grammatical errors and inconsistent verb tenses.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "Spelling"
      },
      {
        "original": "I am hereby declared that all the informations given above is correct",
        "corrected": "I hereby declare that all the information provided above is accurate.",
        "type": "Grammar"
      },
      {
        "original": "Support in managing office supplies, stationary",
        "corrected": "Supported the management of office supplies and stationery",
        "type": "Grammar/Spelling"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information (Parents' names, Religion, Blood group, Marital status, DOB) to comply with international standards.",
    "Replace the 'Career Objective' with a 'Professional Summary' that highlights your specific HR/Admin achievements and value proposition.",
    "Quantify your bullet points. Instead of 'Helping HR team', use 'Supported the end-to-end recruitment process for 10+ monthly hires'.",
    "Delete the 'Declaration' section and the signature block entirely.",
    "Upgrade the 'Skills' section to include industry-specific software (e.g., HRIS, ATS, or specific ERP systems) rather than generic 'Internet' or 'MS Word'."
  ],
  "ats_analysis": {
    "inferred_role": "HR/Administrative Assistant",
    "inferred_industry": "Human Resources / Administration",
    "keyword_hits": [
      "Human Resource Management",
      "Recruitment",
      "Attendance record",
      "Leave management",
      "Office correspondence",
      "Filing system"
    ],
    "keyword_gaps": [
      "HRIS (Human Resource Information System)",
      "Onboarding",
      "Performance Management"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Non-standard heading",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "Non-standard heading and contains prohibited content",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems will automatically flag or discard resumes containing personal demographic data; remove these immediately.",
      "Use standard section headings (Professional Summary, Experience, Education, Skills) to ensure the ATS correctly parses your data.",
      "Incorporate specific HR software names (e.g., SAP, Workday, or Trello) to increase keyword relevance."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 48
}