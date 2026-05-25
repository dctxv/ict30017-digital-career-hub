---
resume: tanvir
mode: international
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 142.5
  token_count: 8720
  cost_usd: 0.0036179
  duration_seconds: 61.2
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume uses a clear structure but relies on several Bangladeshi CV conventions that are not aligned with Western/ATS-friendly norms (e.g., Personal Information with sensitive details, Declaration, and older headings). This lowers ATS adaptability. Remove sensitive personal data, modernize headings, and trim address details to improve readability and compatibility.",
    "issues": [
      {
        "section": "Personal Information - Father's Name",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information - Mother's Name",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information - Date of Birth",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Information - Religion",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information - Marital Status",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Information - Blood Group",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "Strengths: relevant banking internship, finance degree, clear job focus, and basic computer and language skills. Weaknesses: lacks quantified achievements, no modern professional summary, heavy reliance on Bangladeshi personal information, and limited evidence of transferable banking competencies (CRM/software, core banking systems). The Education section could be condensed; consider emphasizing relevant coursework. Bullet points under Professional Experience are vague and could show impact with numbers.",
    "strengths": [
      "Banking internship experience (customer service focus) indicates exposure to branch operations.",
      "Finance/Business background aligns with banking roles.",
      "Basic computer skills and English proficiency are present."
    ],
    "weaknesses": [
      "Bullets under Professional Experience are vague and lack outcomes or metrics.",
      "Personal Information contains sensitive data unnecessary for international applications.",
      "No Professional Summary to quickly convey value proposition and key skills.",
      "Limited evidence of banking software, CRM, or core banking system familiarity."
    ]
  },
  "language_grammar": {
    "score": 68,
    "feedback": "Some language inconsistencies and opportunities for stronger, more concise wording. Improve professional tone and precision; incorporate standard banking terminology where appropriate.",
    "issues": [
      {
        "original": "To get a challenging job in a reputed bank or financial institution where I can utilize my knowledge and skills and build a bright career for myself.",
        "corrected": "To secure a challenging position at a reputable bank or financial institution where I can apply my knowledge and skills to contribute to the organization and advance my career.",
        "type": "grammar/style"
      },
      {
        "original": "Assisted in daily customer transaction processing at the branch counter",
        "corrected": "Assisted with daily customer transaction processing at the branch counter.",
        "type": "grammar"
      },
      {
        "original": "English  : Fairly good in reading and writing",
        "corrected": "English: Fairly proficient in reading and writing.",
        "type": "grammar/style"
      },
      {
        "original": "MS Word, MS Excel, MS PowerPoint, Internet Browsing",
        "corrected": "MS Word, MS Excel, MS PowerPoint; Internet browsing.",
        "type": "punctuation/consistency"
      }
    ]
  },
  "action_items": [
    "Personal Information: Remove Father's Name, Mother's Name, Date of Birth, Religion, Marital Status, and Blood Group from the resume; replace with a concise 'Contact Details' section (e.g., phone, email, LinkedIn URL) under the 'Professional Summary' heading.",
    "Professional Summary: Replace the 'CAREER OBJECTIVE' heading with a 'Professional Summary' and add 3–4 lines that highlight banking competencies, value proposition, and key skills tailored to entry-level banking roles.",
    "Education: Rename 'Educational Qualification' to 'Education' and format as: Degree, Institution, Location, Year, GPA (e.g., BBA in Finance, Southeast University, Dhaka, 2017–2018, CGPA 3.12/4.00).",
    "Experience: Expand each bullet under 'Professional Experience' with quantified outcomes (e.g., 'processed X transactions daily with Y% accuracy' or 'assisted Z clients in account openings with 100% documentation compliance'), and add a brief line on any notable processes learned (e.g., KYC checks, reporting).",
    "ATS-ready formatting: Convert headings to standard terms (Education, Experience, Skills, Languages, Certifications) and remove the 'Declaration' and 'References' sections or relocate references to a note at the end."
  ],
  "ats_analysis": {
    "inferred_role": "Entry-level Banking / Customer Service Operations",
    "inferred_industry": "Banking / Financial Services",
    "keyword_hits": [
      "customer service",
      "KYC verification",
      "account opening documentation",
      "data entry",
      "reports",
      "branch counter",
      "MS Excel"
    ],
    "keyword_gaps": [
      "CRM software (e.g., Salesforce) or banking CRM tools",
      "Core banking system familiarity (e.g., Finacle, Temenos)",
      "Advanced Excel functions (PivotTables, VLOOKUP) or data analytics"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Heading may be non-standard for international ATS; can hinder parsing and ranking.",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading for ATS; may affect parsing.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Contains sensitive demographic data; many ATS/parsers treat as extraneous data.",
        "recommended": "Contact Details"
      },
      {
        "original": "DECLARATION",
        "issue": "Non-standard for international resumes and wastes space.",
        "recommended": "Remove"
      }
    ],
    "ats_tips": [
      "Add a Professional Summary at the top with 4–6 targeted banking keywords (e.g., customer service, KYC, onboarding, data entry, reporting, risk awareness).",
      "Standardize headings to 'Education', 'Experience', 'Skills', and 'Languages'; remove 'Personal Information' and place only essential contact details in a 'Contact Details' line.",
      "Remove all sensitive demographic data (DOB, religion, marital status, etc.) and ensure only name, phone, email, and LinkedIn are present in contact details."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 67
}