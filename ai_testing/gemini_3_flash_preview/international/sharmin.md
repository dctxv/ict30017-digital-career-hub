---
resume: sharmin
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 156.6
  token_count: 1425
  cost_usd: 0.005688
  duration_seconds: 9.1
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows a traditional Bangladeshi layout which is highly incompatible with international and multinational standards. It contains significant personal demographic data that introduces bias and violates privacy standards in Western hiring.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 50,
    "feedback": "The content is descriptive but lacks the quantification and achievement-oriented language required for multinational roles. Responsibilities are listed as tasks rather than accomplishments.",
    "strengths": [
      "Relevant educational background in HRM for the target roles.",
      "Experience in reputable local conglomerates (Partex, Bengal Group).",
      "Clear progression from internship to a full-time administrative role."
    ],
    "weaknesses": [
      "Vague language in bullet points (e.g., 'Helping HR team', 'Assisting manager').",
      "Lack of metrics or KPIs (e.g., number of employees managed, volume of recruitment handled).",
      "The 'Skills' section includes soft traits like 'honest' and 'hardworking' which are subjective and should be demonstrated through experience instead."
    ]
  },
  "language_grammar": {
    "score": 65,
    "feedback": "There are several grammatical errors, particularly in tense consistency and pluralization, which detract from professional credibility.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "Spelling"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "corrected": "PERSONAL INFORMATION",
        "type": "Grammar"
      },
      {
        "original": "all the informations given above is correct",
        "corrected": "all the information provided above is correct",
        "type": "Grammar"
      },
      {
        "original": "Doing photocopying and scanning works",
        "corrected": "Managed high-volume document digitization and reproduction",
        "type": "Style"
      }
    ]
  },
  "action_items": [
    "Replace the 'CAREER OBJECTIVE' with a 'PROFESSIONAL SUMMARY' that highlights your 2+ years of experience in HR and Admin rather than what you 'want' from a company.",
    "Rewrite the 'WORK EXPERIENCE' section using the STAR method (Situation, Task, Action, Result). For example, instead of 'Helping HR team', use 'Coordinated the end-to-end recruitment process for 10+ junior-level positions'.",
    "Delete the entire 'PERSONAL INFORMATIONS' and 'DECLARATION' sections to align with international privacy and formatting standards.",
    "Upgrade the 'SKILLS' section by removing generic traits like 'honest' and adding specific HR software or advanced Excel functions (e.g., VLOOKUP, Pivot Tables) if applicable.",
    "Correct the spelling of 'EXPERIENCE' in the main heading."
  ],
  "ats_analysis": {
    "inferred_role": "HR & Administrative Assistant",
    "inferred_industry": "Human Resources / Corporate Administration",
    "keyword_hits": [
      "Human Resource Management",
      "Recruitment",
      "Selection",
      "Attendance record",
      "Leave management",
      "Filing system",
      "Office supplies"
    ],
    "keyword_gaps": [
      "HRIS",
      "Payroll processing",
      "Onboarding",
      "Vendor management"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard for international ATS; focuses on candidate needs rather than value.",
        "recommended": "PROFESSIONAL SUMMARY"
      },
      {
        "original": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Wordy; international ATS systems prefer standard single-word headings.",
        "recommended": "EDUCATION"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "Contains high-risk demographic data that international recruiters often filter out to avoid bias.",
        "recommended": "CONTACT DETAILS"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion, age, or marital status to comply with anti-discrimination laws.",
      "Use standard headings like 'Experience' and 'Education' to ensure the ATS parses your history correctly into its database.",
      "Avoid using tables or columns for personal data; use a simple vertical layout which is more readable for older ATS parsers."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 54
}