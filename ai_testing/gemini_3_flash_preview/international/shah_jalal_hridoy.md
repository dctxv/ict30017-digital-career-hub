---
resume: shah_jalal_hridoy
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 143.8
  token_count: 1467
  cost_usd: 0.0062405
  duration_seconds: 10.2
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume heavily utilizes Bangladeshi CV conventions that are considered unprofessional or discriminatory in international markets. The layout is overly segmented with redundant sections like 'Why Me' and 'Declaration'.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
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
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Headings",
        "issue": "The heading 'Scholastic Status' is non-standard for international ATS systems.",
        "suggestion": "Change 'Scholastic Status' to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 50,
    "feedback": "While the technical stack is diverse, the professional experience section is extremely weak. It lists only titles and dates without describing responsibilities, achievements, or technologies used in those specific roles.",
    "strengths": [
      "Strong list of completed projects across various domains (ERP, POS, Library Management).",
      "Clear educational background from a reputable institution.",
      "Active professional involvement (GDG Campus Ambassador, BCS Member)."
    ],
    "weaknesses": [
      "Professional experience lacks bullet points describing 'what' was achieved or 'how' it was done.",
      "The 'Why Me' section contains generic soft skills that should be demonstrated through experience rather than listed as claims.",
      "Lack of quantification (e.g., 'Improved system efficiency by 20%' or 'Managed a database of 50k+ records')."
    ]
  },
  "language_grammar": {
    "score": 82,
    "feedback": "The language is generally clear, but there are instances of weak phrasing and inconsistent capitalization in the 'Why Me' section.",
    "issues": [
      {
        "original": "Work in C#, ASP.Net, OOP, Java...",
        "corrected": "Proficient in C#, ASP.NET, OOP, Java...",
        "type": "Grammar/Style"
      },
      {
        "original": "Strong interpersonal, team building",
        "corrected": "Strong interpersonal and team-building skills.",
        "type": "Grammar"
      },
      {
        "original": "Ability to Self-Manage",
        "corrected": "Ability to self-manage",
        "type": "Capitalization"
      }
    ]
  },
  "action_items": [
    "Professional Experience: Add 3-4 bullet points for each role using the STAR method (Situation, Task, Action, Result). For example: 'Developed a Purchase Module for an ERP system using CodeIgniter, reducing procurement processing time by 15%.'",
    "Personal Information: Delete the entire 'Personal Information' section except for your Location, LinkedIn URL, and Portfolio link. Remove Father's name, Religion, DOB, and Marital Status immediately.",
    "Career Summary: Rewrite the 'Career Objectives' and 'Career Summary' into a single 'Professional Summary' that highlights your 7+ years of experience and core tech stack (PHP, .NET, SQL).",
    "Project Section: Move the 'Software Development Experience' projects under their respective companies in the 'Professional Experience' section to provide context.",
    "Formatting: Remove the 'Declaration' and 'Why Me' sections to make room for more detailed descriptions of your Senior Software Engineer responsibilities."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Software Engineer",
    "inferred_industry": "Information Technology / Software Development",
    "keyword_hits": [
      "C#",
      "ASP.Net",
      "PHP",
      "Codeigniter",
      "MySQL",
      "SQL Server",
      "JavaScript",
      "Bootstrap",
      "Android",
      "ERP"
    ],
    "keyword_gaps": [
      "RESTful APIs",
      "Git/GitHub",
      "Unit Testing"
    ],
    "heading_risks": [
      {
        "original": "Scholastic Status",
        "issue": "Non-standard heading; ATS may fail to categorize education history.",
        "recommended": "Education"
      },
      {
        "original": "Career Objectives",
        "issue": "Outdated terminology; modern ATS looks for summaries.",
        "recommended": "Professional Summary"
      },
      {
        "original": "Personal Information",
        "issue": "Contains sensitive data that international recruiters/ATS are programmed to filter out to avoid bias.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion or marital status to comply with labor laws.",
      "Replace the 'Why Me' list with a 'Skills' section categorized by 'Languages', 'Frameworks', and 'Tools' to help the ATS parse your technical proficiency more accurately.",
      "Ensure your dates of employment are in a standard MM/YYYY format; the current '11-December-2016' format is readable but less standard for some older parsers."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 58
}