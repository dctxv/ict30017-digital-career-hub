---
resume: tanvir
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 358.5
  token_count: 932
  cost_usd: 0.00056224
  duration_seconds: 2.6
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume contains several formatting issues, including the presence of personal demographic information and non-standard headings.",
    "issues": [
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATION",
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
        "issue": "Non-standard heading that may not be parsed correctly by ATS systems.",
        "suggestion": "Use a standard heading such as 'Professional Summary' instead."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading that may not be parsed correctly by ATS systems.",
        "suggestion": "Use a standard heading such as 'Education' instead."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "The resume contains some relevant experience and skills, but could be improved with more specific examples and quantification.",
    "strengths": [
      "Relevant internship experience in customer service",
      "Basic computer skills listed"
    ],
    "weaknesses": [
      "Lack of specific examples and metrics in work experience",
      "Limited skills listed"
    ]
  },
  "language_grammar": {
    "score": 80,
    "feedback": "The resume is generally well-written, but could benefit from some minor corrections.",
    "issues": [
      {
        "original": "Fairly good in reading and writing",
        "corrected": "Proficient in reading and writing",
        "type": "minor correction"
      }
    ]
  },
  "action_items": [
    "Remove personal demographic information from the resume",
    "Use standard headings and formatting",
    "Add more specific examples and metrics to work experience",
    "Expand skills section to include more relevant technical skills"
  ],
  "ats_analysis": {
    "inferred_role": "Customer Service Representative",
    "inferred_industry": "Banking/Finance",
    "keyword_hits": [
      "customer service",
      "banking",
      "finance"
    ],
    "keyword_gaps": [
      "customer relationship management",
      "financial analysis",
      "data entry software"
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
      }
    ],
    "ats_tips": [
      "Use a standard font and formatting throughout the resume",
      "Remove the declaration section to save space",
      "Use keywords from the job posting in the resume, especially in the work experience section"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 60
}
```