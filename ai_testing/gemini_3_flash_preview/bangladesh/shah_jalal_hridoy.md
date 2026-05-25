---
resume: shah_jalal_hridoy
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 145.3
  token_count: 1337
  cost_usd: 0.0060785
  duration_seconds: 9.2
---

## Analysis Output

{
  "formatting": {
    "score": 72,
    "feedback": "The resume follows traditional Bangladeshi formatting standards but suffers from inconsistent date alignment and dense text blocks in the experience section. The score is capped due to the inclusion of multiple local conventions (Personal Details, Declaration, etc.) which, while standard in Bangladesh, can hinder digital parsing.",
    "issues": [
      {
        "section": "Professional Experience",
        "issue": "Inconsistent date formatting and overlapping timelines.",
        "suggestion": "Align all dates to the right margin and ensure the timeline for Softrithm IT Limited is corrected (currently shows Jan 2017 to Dec 2016)."
      },
      {
        "section": "Scholastic Status",
        "issue": "Missing GPA denominators for SSC and HSC.",
        "suggestion": "Change 'Result: 5.00 (GPA)' to 'Result: 5.00/5.00 (GPA)' for both SSC and HSC entries."
      },
      {
        "section": "Software Development Experience",
        "issue": "Lack of bullet points and visual hierarchy.",
        "suggestion": "Use bullet points for each project and bold the project titles to distinguish them from the technologies used."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The resume lists a significant number of projects, which is a strength, but the professional experience section is extremely thin on details. It lacks descriptions of responsibilities and achievements for specific roles.",
    "strengths": [
      "Strong academic background with consistent results (SSC/HSC 5.00).",
      "Extensive list of diverse software projects across multiple platforms (Web, Desktop, Mobile).",
      "Active professional engagement through memberships (BCS, GDG Bangla)."
    ],
    "weaknesses": [
      "The Career Objective is generic: 'To merge innovative ideas... where my conceptual, analytical and technical skills can be utilised'.",
      "Professional Experience lacks bullet points describing specific contributions or technologies used in each role.",
      "No mention of a final year thesis or project title within the Scholastic Status section despite being a CSE graduate.",
      "The 'Why Me' section contains soft skills that are not backed by evidence or metrics."
    ]
  },
  "language_grammar": {
    "score": 82,
    "feedback": "The language is generally clear, but there are several instances of missing articles and awkward phrasing in the summary and project descriptions.",
    "issues": [
      {
        "original": "I worked in number of companies",
        "corrected": "I have worked in a number of companies",
        "type": "Grammar"
      },
      {
        "original": "Create some Websites for local clients",
        "corrected": "Developed multiple websites for local clients",
        "type": "Tense/Vocabulary"
      },
      {
        "original": "Work in C#, ASP.Net",
        "corrected": "Proficient in C#, ASP.Net",
        "type": "Grammar"
      }
    ]
  },
  "action_items": [
    "Career Objective: Rewrite to: 'Senior Software Engineer with over 7 years of experience in PHP (Codeigniter) and .NET frameworks, seeking to leverage expertise in ERP development and database management to drive technical excellence at [Company Name].'",
    "Professional Experience: Add 3-4 bullet points under each role (Sr Software Engineer, Software Engineer) describing specific modules developed and the impact (e.g., 'Reduced processing time by 20%').",
    "Scholastic Status: Add your B.Sc. Thesis/Project title and a brief description (e.g., 'Thesis: [Title] - Researched [Topic] using [Tech]').",
    "Software Development Experience: Quantify the ERP projects. Instead of just listing them, mention the scale (e.g., 'ERP Solution for RRM Group serving 500+ employees').",
    "Formatting: Correct the date error for Softrithm IT Limited (01-January-2017 To 10-December-2016 is chronologically impossible)."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Software Engineer",
    "inferred_industry": "Information Technology / Software Development",
    "keyword_hits": [
      "PHP",
      "Codeigniter",
      "MySQL",
      "C#",
      "ASP.Net",
      "SQL Server",
      "JavaScript",
      "Bootstrap",
      "Android",
      "ERP",
      "Software Development"
    ],
    "keyword_gaps": [
      "Git/GitHub",
      "RESTful APIs",
      "Unit Testing"
    ],
    "heading_risks": [
      {
        "original": "Scholastic Status",
        "issue": "Non-standard heading for global ATS.",
        "recommended": "Education"
      },
      {
        "original": "Why Me",
        "issue": "Vague heading that may not be parsed correctly.",
        "recommended": "Core Competencies"
      }
    ],
    "ats_tips": [
      "Replace the 'Why Me' section with a 'Skills' or 'Core Competencies' section that uses industry-standard keywords like 'Agile Methodologies' or 'System Architecture'.",
      "Ensure the 'Professional Experience' section includes the technologies used in each specific job, as ATS often links skills to years of experience based on the section they appear in.",
      "Remove the 'Declaration' and 'Personal Information' sections when applying to international/multinational companies to save space for more technical content."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 73
}