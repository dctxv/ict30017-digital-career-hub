---
resume: tasneem
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 332.9
  token_count: 1032
  cost_usd: 0.00265431
  duration_seconds: 3.1
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume contains several formatting issues, including the presence of personal demographic information, non-standard headings, and a declaration section.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "National ID numbers should never appear on a resume — they create a privacy and identity theft risk.",
        "suggestion": "Remove the NID number from the resume (not present but potential issue)."
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
        "issue": "Non-standard heading",
        "suggestion": "Use 'Professional Summary' instead."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading",
        "suggestion": "Use 'Education' instead."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The resume demonstrates a clear and relevant work experience, with specific accomplishments and skills. However, some sections could be improved with more quantifiable results and specific examples.",
    "strengths": [
      "Relevant work experience in the development sector",
      "Specific skills and training listed"
    ],
    "weaknesses": [
      "Some bullet points lack specific metrics or outcomes",
      "Limited use of action verbs"
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The resume is well-written, with minimal grammatical errors. However, some sentences could be improved for clarity and concision.",
    "issues": [
      {
        "original": "Assisted in conducting training sessions for community women groups on prevention of gender-based violence across 3 upazilas in Manikganj district",
        "corrected": "Conducted training sessions for community women groups on preventing gender-based violence across 3 upazilas in Manikganj district",
        "type": "weak action verb"
      }
    ]
  },
  "action_items": [
    "Remove personal demographic information from the resume",
    "Use standard headings and formatting",
    "Add more quantifiable results and specific examples to work experience bullet points",
    "Use stronger action verbs in bullet points"
  ],
  "ats_analysis": {
    "inferred_role": "Programme Officer",
    "inferred_industry": "Development sector",
    "keyword_hits": [
      "programme management",
      "livelihood programme",
      "urban resilience",
      "community development"
    ],
    "keyword_gaps": [
      "project planning",
      "stakeholder engagement",
      "monitoring and evaluation"
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
      "Remove personal demographic information to avoid bias",
      "Use standard headings and formatting to improve ATS parsing",
      "Add relevant keywords from the job posting to the resume"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 75
}
```