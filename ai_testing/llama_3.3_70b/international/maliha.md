---
resume: maliha
mode: international
model: llama_3.3_70b
date: 2026-05-15
metadata:
  tokens_per_second: 322.8
  token_count: 807
  cost_usd: 0.00258689
  duration_seconds: 2.5
---

## Analysis Output

```json
{
  "formatting": {
    "score": 40,
    "feedback": "The resume has several formatting issues, including the presence of personal details such as father's name, mother's name, date of birth, blood group, marital status, and religion, which are not expected in international applications.",
    "issues": [
      {
        "section": "PERSONAL PROFILE",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL PROFILE",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "PERSONAL PROFILE",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "PERSONAL PROFILE",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "PERSONAL PROFILE",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The resume has a clear and concise format, with relevant sections and information. However, some sections, such as the 'AREA OF INTERESTS' section, could be more detailed and specific.",
    "strengths": [
      "Clear and concise format",
      "Relevant sections and information"
    ],
    "weaknesses": [
      "Lack of detail in some sections",
      "Could benefit from more specific examples and achievements"
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language and grammar used in the resume are excellent, with no noticeable errors.",
    "issues": []
  },
  "action_items": [
    "Remove personal details such as father's name, mother's name, date of birth, blood group, marital status, and religion from the resume.",
    "Add more specific examples and achievements to the 'AREA OF INTERESTS' section.",
    "Consider adding a 'Professional Summary' section to the top of the resume to highlight key skills and experience."
  ],
  "ats_analysis": {
    "inferred_role": "Physics Lecturer/Researcher",
    "inferred_industry": "Education/Research",
    "keyword_hits": [
      "Physics",
      "Research",
      "Lecturer",
      "Condensed Matter Physics"
    ],
    "keyword_gaps": [
      "Teaching",
      "Curriculum Development",
      "Student Assessment"
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC DETAILS",
        "issue": "Non-standard heading",
        "recommended": "Education"
      }
    ],
    "ats_tips": [
      "Use a standard font and formatting throughout the resume.",
      "Use keywords from the job posting in the resume, especially in the 'Professional Summary' and 'SKILLS' sections.",
      "Consider adding a 'Teaching Experience' section to the resume to highlight relevant experience."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 75
}
```