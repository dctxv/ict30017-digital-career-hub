---
resume: shah_jalal_hridoy
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 321.9
  token_count: 869
  cost_usd: 0.00276036
  duration_seconds: 2.7
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume contains several formatting issues, including the presence of a father's name, mother's name, date of birth, religion, marital status, and a declaration section. These elements are not expected in international applications and can introduce unconscious bias.",
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
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 70,
    "feedback": "The resume contains a good amount of relevant technical knowledge and experience, but some sections, such as the career objectives and career summary, could be more concise and focused.",
    "strengths": [
      "Relevant technical knowledge",
      "Experience in software development and database management"
    ],
    "weaknesses": [
      "Career objectives and career summary could be more concise and focused",
      "Some bullet points in the technical knowledge section could be more specific and detailed"
    ]
  },
  "language_grammar": {
    "score": 80,
    "feedback": "The language and grammar are generally good, but there are some minor errors and inconsistencies in formatting and punctuation.",
    "issues": [
      {
        "original": "CAREER OBJECTIVES",
        "corrected": "Professional Summary",
        "type": "heading"
      },
      {
        "original": "SCHOLASTIC STATUS",
        "corrected": "Education",
        "type": "heading"
      }
    ]
  },
  "action_items": [
    "Remove unnecessary personal information from the resume",
    "Reformat the technical knowledge section to make it more concise and easy to read",
    "Use more specific and detailed language in the bullet points"
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer",
    "inferred_industry": "IT and Telecommunication",
    "keyword_hits": [
      "C#",
      "ASP.Net",
      "Java",
      "PHP",
      "SQL Server",
      "MySQL"
    ],
    "keyword_gaps": [
      "Cloud computing",
      "Artificial intelligence",
      "Machine learning"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Non-standard heading",
        "recommended": "Professional Summary"
      },
      {
        "original": "SCHOLASTIC STATUS",
        "issue": "Non-standard heading",
        "recommended": "Education"
      }
    ],
    "ats_tips": [
      "Use more specific and detailed language in the bullet points",
      "Include relevant keywords from the job description in the resume",
      "Use a standard font and formatting throughout the resume"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 65
}
```