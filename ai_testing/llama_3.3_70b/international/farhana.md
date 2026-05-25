---
resume: farhana
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 323.8
  token_count: 1101
  cost_usd: 0.00260852
  duration_seconds: 3.4
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume contains several formatting issues, including the presence of personal demographic information, a declaration section, and a photograph is not present but other issues are.",
    "issues": [
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "National ID numbers should never appear on a resume — they create a privacy and identity theft risk. However, in this case, NID number is not present.",
        "suggestion": "Not applicable"
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
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
        "issue": "Non-standard heading that may not be parsed by some ATS systems.",
        "suggestion": "Use 'Professional Summary' instead of 'CAREER OBJECTIVE'."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading that may not be parsed by some ATS systems.",
        "suggestion": "Use 'Education' instead of 'EDUCATIONAL QUALIFICATION'."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Non-standard heading that may not be parsed by some ATS systems.",
        "suggestion": "Use 'Contact Details' instead of 'PERSONAL INFORMATION'."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The resume contains relevant experience and qualifications, but some sections could be improved with more specific details and metrics.",
    "strengths": [
      "Relevant experience in trade marketing and consumer insights",
      "Specific metrics and achievements in professional experience"
    ],
    "weaknesses": [
      "Lack of specific details in some bullet points",
      "No clear career progression or promotion"
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The resume is well-written with minimal errors.",
    "issues": [
      {
        "original": "Did data collection work for a consumer preference survey",
        "corrected": "Conducted data collection for a consumer preference survey",
        "type": "weak action verb"
      }
    ]
  },
  "action_items": [
    "Remove personal demographic information from the resume",
    "Use standard headings and formatting conventions",
    "Add more specific details and metrics to bullet points",
    "Consider adding relevant certifications or training programs",
    "Proofread the resume for grammar and spelling errors"
  ],
  "ats_analysis": {
    "inferred_role": "Marketing Manager",
    "inferred_industry": "FMCG",
    "keyword_hits": [
      "trade marketing",
      "consumer insights",
      "brand management",
      "marketing communications"
    ],
    "keyword_gaps": [
      "digital marketing",
      "social media marketing",
      "market research"
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
      "Use relevant keywords from the job description in the resume",
      "Add specific metrics and achievements to bullet points",
      "Remove personal demographic information to avoid bias"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 85
}
```