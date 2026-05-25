---
resume: rashed
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 255.9
  token_count: 1126
  cost_usd: 0.00263712
  duration_seconds: 4.4
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume contains several formatting issues, including the presence of personal demographic information, a declaration section, and a photograph is not present but other issues are significant.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "National ID numbers should never appear on a resume — they create a privacy and identity theft risk. However, in this case, NID number is not present.",
        "suggestion": "Not applicable in this case."
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
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Non-standard heading that some ATS systems may fail to parse.",
        "suggestion": "Use 'Professional Summary' instead of 'CAREER OBJECTIVE'."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading that some ATS systems may fail to parse.",
        "suggestion": "Use 'Education' instead of 'EDUCATIONAL QUALIFICATION'."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Non-standard heading that some ATS systems may fail to parse.",
        "suggestion": "Use 'Contact Details' instead of 'PERSONAL INFORMATION'."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The resume contains relevant experience and skills, but some sections could be improved with more specific details and quantification.",
    "strengths": [
      "Relevant project experience",
      "Technical skills",
      "Co-curricular activities"
    ],
    "weaknesses": [
      "Lack of specific details in some project descriptions",
      "No clear career progression or achievements"
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is generally good, but there are a few minor errors and areas for improvement.",
    "issues": [
      {
        "original": "Session: 2018-2019",
        "corrected": "Session: 2018-2022 (or the actual session duration)",
        "type": "minor error"
      }
    ]
  },
  "action_items": [
    "Remove personal demographic information from the resume",
    "Rewrite the career objective to focus on specific skills and qualifications",
    "Add more specific details and quantification to project descriptions",
    "Consider adding relevant certifications or training programs"
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer",
    "inferred_industry": "Construction or Infrastructure",
    "keyword_hits": [
      "Structural analysis",
      "Foundation design",
      "Project coordination",
      "AutoCAD",
      "ETABS",
      "SAP2000"
    ],
    "keyword_gaps": [
      "Building information modeling (BIM)",
      "Sustainability or green building practices",
      "Construction management software"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Use a standard font and formatting throughout the resume",
      "Remove personal demographic information to avoid bias",
      "Tailor the resume to the specific job description and requirements"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 75
}
```