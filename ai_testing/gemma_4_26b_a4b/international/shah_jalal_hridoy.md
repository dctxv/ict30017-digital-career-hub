---
resume: shah_jalal_hridoy
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 46.6
  token_count: 1593
  cost_usd: 0.0008946
  duration_seconds: 34.2
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several outdated Bangladeshi CV conventions that are inappropriate for international or multinational applications. The presence of extensive personal demographic data and a declaration section significantly reduces the professional standard required for Western markets. Additionally, the structure lacks a clear hierarchy, with a long list of projects disconnected from the professional experience section.",
    "issues": [
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Religion is personal information that can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
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
        "section": "CAREER OBJECTIVES",
        "issue": "Heading risk: 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Professional Summary'."
      },
      {
        "section": "SCHOLASTIC STATUS",
        "issue": "Heading risk: 'Scholastic Status' is non-standard.",
        "suggestion": "Replace with 'Education'."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Heading risk: 'Personal Information' is non-standard.",
        "suggestion": "Replace with 'Contact Details' or remove the section entirely after removing sensitive data."
      }
    ]
  },
  "content_quality": {
    "score": 40,
    "feedback": "The resume lists a significant amount of technical work, but it fails to connect projects to specific roles. The 'Software Development Experience' section is a massive list of tasks without context regarding where or when they were performed. Most importantly, there is a complete lack of quantification; you describe *what* you built, but not the *impact* (e.g., improved efficiency by X%, reduced load time by Y%).",
    "strengths": [
      "Extensive list of technical tools and frameworks (PHP, C#, SQL, etc.).",
      "Strong academic background in Computer Science.",
      "Diverse project portfolio ranging from ERP to Android apps."
    ],
    "weaknesses": [
      "Lack of quantification: Bullet points like 'ERP Solution (Purchase Module)... using PHP' describe a task, not an achievement.",
      "Disconnected Experience: The 'Professional Experience' section contains only company names and dates, while the actual work is buried in a separate 'Software Development Experience' list.",
      "Vague language: Use of 'Have good knowledge in' and 'Work in' is passive and weak.",
      "Missing impact metrics: No mention of user count, system performance improvements, or business value delivered."
    ]
  },
  "language_grammar": {
    "score": 65,
    "feedback": "The language is generally understandable but lacks the professional punch required for a Senior Engineer. There is a heavy reliance on passive phrasing and inconsistent verb tenses.",
    "issues": [
      {
        "original": "Have good knowledge in structured programming language C",
        "corrected": "Proficient in structured programming using C",
        "type": "Weak phrasing"
      },
      {
        "original": "Work in C#, ASP.Net, OOP, Java, PHP Framework - Codeigniter",
        "corrected": "Experienced in C#, ASP.NET, OOP, Java, and the CodeIgniter PHP framework",
        "type": "Grammar/Incomplete sentence"
      },
      {
        "original": "I have extensive knowledge in computers, which include Software Development...",
        "corrected": "Extensive expertise in software development, database management, and MIS.",
        "type": "Wordiness/First-person usage"
      }
    ]
  },
  "action_items": [
    "Integrate the 'Software Development Experience' bullet points directly under the corresponding 'Professional Experience' roles to show career progression.",
    "Quantify all project achievements using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
    "Remove all personal demographic information (Religion, Marital Status, Father's Name, DOB) to meet international professional standards.",
    "Replace passive phrases like 'Work in' or 'Have good knowledge' with strong action verbs like 'Developed', 'Architected', 'Optimised', or 'Implemented'."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Software Engineer",
    "inferred_industry": "Information Technology / Software Development",
    "keyword_hits": [
      "PHP",
      "Codeigniter",
      "MySQL",
      "C#",
      "SQL Server",
      "ASP.Net",
      "JavaScript",
      "Angular JS",
      "Bootstrap",
      "Android"
    ],
    "keyword_gaps": [
      "Agile/Scrum",
      "CI/CD",
      "RESTful APIs"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Professional Summary"
      },
      {
        "original": "SCHOLASTIC STATUS",
        "issue": "Non-standard heading.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading and contains high-risk demographic data.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove personal demographic information; international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Standardize section headings to ensure the parser correctly identifies your Education and Experience.",
      "Incorporate more industry-standard methodology keywords (e.g., SDLC, Agile, Unit Testing) to improve ranking for Senior roles."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 51
}
```