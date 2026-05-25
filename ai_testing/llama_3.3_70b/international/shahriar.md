---
resume: shahriar
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 298.6
  token_count: 836
  cost_usd: 0.00250714
  duration_seconds: 2.8
---

## Analysis Output

```json
{
  "formatting": {
    "score": 55,
    "feedback": "The resume contains several formatting issues that are not suitable for international applications, including the inclusion of personal information such as father's name, mother's name, date of birth, religion, and marital status. The declaration section is also not necessary and takes up valuable space.",
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
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The resume provides a clear and concise overview of the candidate's experience and qualifications. However, some sections could be improved with more specific examples and metrics.",
    "strengths": [
      "Clear career objective",
      "Relevant work experience",
      "Technical skills and certifications"
    ],
    "weaknesses": [
      "Lack of specific metrics in some bullet points",
      "Limited information on achievements and impact"
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language and grammar used in the resume are generally good, with only a few minor errors.",
    "issues": [
      {
        "original": "Session: 2009-2010",
        "corrected": "Graduation date: 2010",
        "type": "minor error"
      }
    ]
  },
  "action_items": [
    "Remove personal information from the resume",
    "Add more specific metrics and examples to bullet points",
    "Consider adding a summary or professional summary section",
    "Remove the declaration section"
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer",
    "inferred_industry": "Energy and Power",
    "keyword_hits": [
      "SCADA",
      "IEC 61850",
      "power systems",
      "project management"
    ],
    "keyword_gaps": [
      "renewable energy",
      "energy efficiency",
      "smart grid"
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
      "Use a professional summary instead of a career objective",
      "Add relevant keywords from the job description to the resume",
      "Use a standard format for headings and sections"
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 85
}
```