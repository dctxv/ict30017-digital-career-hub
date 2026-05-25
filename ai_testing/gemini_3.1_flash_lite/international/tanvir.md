---
resume: tanvir
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 229.5
  token_count: 1354
  cost_usd: 0.002724
  duration_seconds: 5.9
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows traditional Bangladeshi CV conventions which are unsuitable for international or multinational applications. The inclusion of extensive personal data and a declaration section significantly detracts from professional standards and consumes space that should be used for professional achievements.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
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
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
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
        "section": "Educational Qualification",
        "issue": "The heading 'Educational Qualification' is non-standard for international ATS systems.",
        "suggestion": "Rename to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 40,
    "feedback": "The content is overly passive and lacks the quantification required for competitive roles. The experience section relies on vague verbs that do not demonstrate impact or specific technical proficiency.",
    "strengths": [
      "Clear educational background with relevant degree for the finance sector.",
      "Direct internship experience in a banking environment."
    ],
    "weaknesses": [
      "Bullet points use weak, passive language such as 'Assisted in', 'Helped with', 'Supported', and 'Did data entry'.",
      "Lack of metrics (e.g., number of customers served daily, accuracy rates, or specific software tools used for reporting).",
      "The 'Career Objective' is generic and focuses on what the candidate wants rather than what they offer the employer."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally clear, though the phrasing is somewhat dated. No major grammatical errors were found.",
    "issues": [
      {
        "original": "Fairly good in reading and writing",
        "corrected": "Professional proficiency in reading and writing",
        "type": "Style"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information (Parents' names, DOB, Religion, Marital Status, Blood Group) and the Declaration section to align with international standards.",
    "Rewrite the 'Professional Summary' to focus on your value proposition (e.g., 'Detail-oriented Finance graduate with internship experience in customer service and transaction processing at a leading commercial bank').",
    "Quantify your internship experience: instead of 'Assisted in daily customer transaction processing', use 'Processed 50+ daily customer transactions with 100% accuracy, ensuring compliance with bank KYC protocols'.",
    "Replace the 'Computer Skills' section with a 'Technical Skills' section that highlights specific software proficiency (e.g., 'Advanced MS Excel: VLOOKUP, Pivot Tables, Data Analysis')."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Banking Associate / Customer Service Representative",
    "inferred_industry": "Banking and Financial Services",
    "keyword_hits": [
      "Finance",
      "Customer Service",
      "KYC",
      "Data Entry",
      "Reporting",
      "MS Excel"
    ],
    "keyword_gaps": [
      "Financial Analysis",
      "Risk Management",
      "Banking Regulations"
    ],
    "heading_risks": [
      {
        "original": "Career Objective",
        "issue": "Non-standard heading for ATS parsing.",
        "recommended": "Professional Summary"
      },
      {
        "original": "Educational Qualification",
        "issue": "Non-standard heading for ATS parsing.",
        "recommended": "Education"
      },
      {
        "original": "Personal Information",
        "issue": "Contains non-professional data that may cause ATS to flag the resume as 'non-compliant' or 'personal'.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems often automatically discard resumes containing personal demographic data; remove all non-professional details immediately.",
      "Use standard headings like 'Professional Summary', 'Experience', and 'Education' to ensure the ATS correctly categorizes your data.",
      "Incorporate industry-specific keywords like 'Financial Reporting' or 'Compliance' into your bullet points to improve ranking."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 46
}