---
resume: tanvir
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 159.2
  token_count: 1321
  cost_usd: 0.005348
  duration_seconds: 8.3
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume heavily relies on outdated regional conventions that are unsuitable for international or multinational applications. The inclusion of extensive personal data and a declaration section significantly reduces the professional impact and creates privacy risks.",
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
    "feedback": "The content is very generic and lacks the quantification required for competitive roles. The internship descriptions focus on tasks rather than achievements, and the objective is self-centered rather than value-oriented.",
    "strengths": [
      "Clear educational background with relevant major (Finance).",
      "Direct internship experience in a reputable financial institution (Mutual Trust Bank)."
    ],
    "weaknesses": [
      "Vague action verbs like 'Assisted', 'Helped', and 'Supported' without specific outcomes.",
      "Lack of quantification (e.g., number of accounts processed, volume of transactions handled).",
      "The 'Career Objective' focuses on what the candidate wants from the company rather than what they offer.",
      "Computer skills are listed too broadly; lacks specific proficiency levels or advanced tools (e.g., Financial Modeling, Pivot Tables)."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally clear and free of major spelling errors, but the phrasing is passive and lacks professional 'punch'.",
    "issues": [
      {
        "original": "Did data entry work",
        "corrected": "Executed data entry and digital record management",
        "type": "weak phrasing"
      },
      {
        "original": "Fairly good in reading and writing",
        "corrected": "Professional Working Proficiency",
        "type": "informal phrasing"
      }
    ]
  },
  "action_items": [
    "Replace 'CAREER OBJECTIVE' with a 'PROFESSIONAL SUMMARY' that highlights your Finance degree and banking internship experience in 3 lines.",
    "Quantify the 'Professional Experience' section; for example, 'Processed 50+ daily customer transactions' or 'Verified KYC documents for 200+ new accounts'.",
    "Delete the entire 'PERSONAL INFORMATION' section except for your location, and remove the 'DECLARATION' and 'Signature' lines.",
    "Upgrade the 'COMPUTER SKILLS' section by specifying advanced Excel functions (VLOOKUP, Pivot Tables) relevant to banking.",
    "Rename 'EDUCATIONAL QUALIFICATION' to 'EDUCATION' and 'PROFESSIONAL EXPERIENCE' to 'WORK EXPERIENCE' for better ATS compatibility."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Bank Officer / Financial Associate",
    "inferred_industry": "Banking & Finance",
    "keyword_hits": [
      "Finance",
      "Customer Service",
      "KYC",
      "Transaction processing",
      "Data entry",
      "BBA"
    ],
    "keyword_gaps": [
      "Financial Analysis",
      "AML (Anti-Money Laundering)",
      "Risk Management"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard for international ATS systems.",
        "recommended": "PROFESSIONAL SUMMARY"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard for international ATS systems.",
        "recommended": "EDUCATION"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Contains demographic data that international ATS/recruiters may filter out to avoid bias.",
        "recommended": "CONTACT DETAILS"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion, age, or marital status.",
      "Remove the 'Signature' and 'Declaration' sections as they are not machine-readable and are considered obsolete in digital hiring.",
      "Use standard headings like 'Education' and 'Experience' to ensure the ATS correctly maps your history to the right database fields."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 56
}