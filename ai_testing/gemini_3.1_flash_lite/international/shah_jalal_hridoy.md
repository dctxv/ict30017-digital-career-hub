---
resume: shah_jalal_hridoy
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 256.3
  token_count: 1384
  cost_usd: 0.00306125
  duration_seconds: 5.4
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several outdated local conventions that hinder its effectiveness for international applications. The layout is cluttered with non-essential personal data, and the section ordering is non-standard.",
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
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Heading Risks",
        "issue": "The heading 'CAREER OBJECTIVES' is outdated; 'Professional Summary' is the modern standard.",
        "suggestion": "Rename to 'Professional Summary'."
      },
      {
        "section": "Heading Risks",
        "issue": "The heading 'SCHOLASTIC STATUS' is non-standard.",
        "suggestion": "Rename to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "While you have a strong technical background, the experience section lacks impact. You list projects but fail to describe your specific contributions or the business outcomes of your work.",
    "strengths": [
      "Strong list of technical skills and frameworks.",
      "Clear progression in software engineering roles.",
      "Relevant professional memberships and certifications."
    ],
    "weaknesses": [
      "Professional experience lacks bullet points detailing achievements or metrics (e.g., 'improved performance by X%').",
      "The 'Why Me' section is subjective and uses filler phrases; these traits should be demonstrated through your experience bullet points instead.",
      "The 'Software Development Experience' section is a list of projects without context on your specific role or the scale of the impact."
    ]
  },
  "language_grammar": {
    "score": 70,
    "feedback": "The language is generally understandable but contains several grammatical awkwardnesses and inconsistent verb tenses.",
    "issues": [
      {
        "original": "I worked in number of companies",
        "corrected": "I have worked at a number of companies",
        "type": "Grammar"
      },
      {
        "original": "Create some Websites for local clients",
        "corrected": "Developed several websites for local clients",
        "type": "Tense/Grammar"
      },
      {
        "original": "I am enthusiastic in seeking new things",
        "corrected": "I am enthusiastic about learning new technologies",
        "type": "Phrasing"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information (Religion, Marital Status, Parents' names, DOB) to align with international standards.",
    "Rewrite the 'Professional Experience' section using bullet points that focus on achievements (e.g., 'Optimized database queries, reducing load time by 20%') rather than just listing duties.",
    "Delete the 'Why Me' and 'Declaration' sections; replace the 'Career Objectives' with a concise 'Professional Summary' that highlights your years of experience and core technical stack.",
    "Consolidate the 'Software Development Experience' into your 'Professional Experience' section to show how these projects were part of your employment history."
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer",
    "inferred_industry": "IT & Software Development",
    "keyword_hits": [
      "C#",
      "ASP.Net",
      "PHP",
      "Codeigniter",
      "SQL Server",
      "MySQL",
      "JavaScript",
      "Android"
    ],
    "keyword_gaps": [
      "Agile/Scrum",
      "RESTful APIs",
      "Git/Version Control"
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
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Contains sensitive/unnecessary data",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove all personal demographic data; many international ATS systems are programmed to flag or discard resumes containing these fields to ensure compliance with anti-discrimination laws.",
      "Use standard section headings (e.g., 'Experience', 'Education', 'Skills') to ensure the ATS correctly parses your career history.",
      "Include a 'Technical Skills' section with specific keywords like 'Git', 'REST APIs', and 'Agile' if you have experience with them, as these are high-frequency search terms for software roles."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 55
}