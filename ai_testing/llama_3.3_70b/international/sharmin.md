---
resume: sharmin
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 320.3
  token_count: 1089
  cost_usd: 0.00245567
  duration_seconds: 3.4
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume contains several formatting issues, including the presence of personal demographic information, a declaration section, and non-standard headings.",
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
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Informations",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Non-standard heading that may not be parsed by some ATS systems.",
        "suggestion": "Use a standard heading such as 'Professional Summary' instead."
      },
      {
        "section": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Non-standard heading that may not be parsed by some ATS systems.",
        "suggestion": "Use a standard heading such as 'Education' instead."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Non-standard heading that may not be parsed by some ATS systems.",
        "suggestion": "Use a standard heading such as 'Contact Details' instead."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "The resume contains some relevant work experience and skills, but could be improved with more specific examples and quantification of achievements.",
    "strengths": [
      "Relevant work experience in HR and administration",
      "Basic computer skills and language proficiency"
    ],
    "weaknesses": [
      "Lack of specific examples and metrics to demonstrate achievements",
      "Limited skills section"
    ]
  },
  "language_grammar": {
    "score": 80,
    "feedback": "The resume is generally well-written, but contains some minor grammatical errors and inconsistencies in formatting.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "typo"
      },
      {
        "original": "I am hereby declared that all the informations given above is correct to my knowledge.",
        "corrected": "I hereby declare that all the information provided above is accurate to the best of my knowledge.",
        "type": "grammar"
      }
    ]
  },
  "action_items": [
    "Remove personal demographic information from the resume",
    "Use standard headings and formatting throughout the resume",
    "Add more specific examples and metrics to demonstrate achievements in the work experience section",
    "Expand the skills section to include more relevant technical and soft skills"
  ],
  "ats_analysis": {
    "inferred_role": "HR or Administration",
    "inferred_industry": "General",
    "keyword_hits": [
      "HR",
      "administration",
      "MS Word",
      "MS Excel",
      "MS PowerPoint"
    ],
    "keyword_gaps": [
      "recruitment",
      "talent management",
      "employee engagement"
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
        "issue": "Non-standard heading",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Use a standard font and formatting throughout the resume",
      "Remove personal demographic information to avoid bias",
      "Use keywords from the job description to demonstrate relevance"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 60
}
```