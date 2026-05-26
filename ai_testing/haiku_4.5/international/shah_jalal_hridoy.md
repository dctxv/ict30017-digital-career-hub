---
resume: shah_jalal_hridoy
mode: international
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 120.9
  token_count: 3568
  cost_usd: 0.021712
  duration_seconds: 29.5
---

## Analysis Output

```json
{
  "formatting": {
    "score": 48,
    "feedback": "The resume contains multiple Bangladeshi CV conventions that are inappropriate for international applications and significantly reduce its competitiveness in Western hiring contexts. These include: father's name, mother's name, date of birth, religion, marital status, gender, and a declaration section. Additionally, section headings like 'CAREER OBJECTIVES', 'SCHOLASTIC STATUS', and 'PERSONAL INFORMATION' are non-standard for international ATS systems. The layout is dense with inconsistent spacing between sections. The professional experience section has a critical chronological error (dates overlap: 01-January-2017 To 10-December-2016 is impossible). Overall visual presentation is acceptable but content structure violates international norms.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including father's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Including mother's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Information",
        "issue": "Religion disclosure on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
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
        "section": "Section Headings",
        "issue": "'CAREER OBJECTIVES' is non-standard for international ATS systems and may not be parsed correctly.",
        "suggestion": "Rename to 'Professional Summary'."
      },
      {
        "section": "Section Headings",
        "issue": "'SCHOLASTIC STATUS' is non-standard for international ATS systems and may not be parsed correctly.",
        "suggestion": "Rename to 'Education'."
      },
      {
        "section": "Section Headings",
        "issue": "'PERSONAL INFORMATION' heading should be removed entirely; contact details belong in the header only.",
        "suggestion": "Delete this section after removing personal demographic data."
      },
      {
        "section": "Professional Experience",
        "issue": "Chronological error: 'Softrithm IT Limited' shows 'Duration: 01-January-2017 To 10-December-2016' which is impossible (end date before start date).",
        "suggestion": "Correct the dates. Verify the actual employment period and reorder positions chronologically."
      },
      {
        "section": "Professional Experience",
        "issue": "No job descriptions or achievements listed under each role—only company name and dates. Bullet points with quantified outcomes are missing.",
        "suggestion": "Add 3–4 achievement-focused bullet points under each position describing projects delivered, impact, or technologies mastered."
      },
      {
        "section": "Technical Knowledge",
        "issue": "Bullet points use weak phrasing: 'Have good knowledge', 'Work in', 'Working experience'. This is vague and not action-oriented.",
        "suggestion": "Rewrite as: 'Proficient in C, C#, ASP.NET, Java, PHP (Codeigniter)' and 'Experienced in SQL Server, MySQL database design and optimization'."
      }
    ]
  },
  "content_quality": {
    "score": 52,
    "feedback": "The resume demonstrates technical breadth but lacks depth, quantification, and impact. The Career Summary is generic and does not differentiate the candidate. The Technical Knowledge section lists tools without demonstrating mastery or context. The Software Development Experience section is a bare list of projects with no metrics, outcomes, or business impact. Professional Experience lacks any bullet points describing achievements, responsibilities, or results—a critical weakness for a mid-level engineer. The 'Why Me' section uses clichéd soft skills without evidence. Achievements section is underdeveloped. The resume reads as a feature list rather than a narrative of professional growth and impact.",
    "strengths": [
      "Demonstrates breadth of technical stack: C, C#, ASP.NET, PHP, Java, Android, multiple databases.",
      "Shows project diversity across multiple domains: ERP, library management, POS, hotel systems, Android apps.",
      "Includes relevant training certifications (DOT NET, Android Development) aligned with technical skills.",
      "Professional memberships and volunteer work demonstrate community engagement.",
      "Education credentials from recognized institution (Jagannath University)."
    ],
    "weaknesses": [
      "Career Summary is generic and does not articulate unique value proposition or career trajectory.",
      "Professional Experience section contains no bullet points, achievements, or quantified outcomes—only dates and titles.",
      "Software Development Experience is a bare project list with no context on team size, budget, user impact, or business outcomes.",
      "Technical Knowledge section uses weak phrasing ('Have good knowledge', 'Work in') instead of demonstrating proficiency levels.",
      "No metrics: no mention of performance improvements, code quality, deployment scale, or user adoption.",
      "Chronological error in employment dates (Softrithm IT: 01-January-2017 To 10-December-2016) undermines credibility.",
      "'Why Me' section lists generic soft skills without supporting evidence or examples.",
      "No mention of methodologies (Agile, Scrum), version control (Git), CI/CD, or modern development practices.",
      "Achievements section is underdeveloped; volunteer work description is verbose and not role-relevant.",
      "No quantification of project scale: team size, lines of code, number of users, deployment environments, or business value."
    ]
  },
  "language_grammar": {
    "score": 68,
    "feedback": "The resume contains several grammatical and stylistic errors that reduce professionalism. Tense inconsistency is present throughout (mix of present and past tense in project descriptions). Some phrases are awkwardly constructed or use non-standard English. Capitalization is inconsistent in section headings and project names. Action verbs are weak in places ('Have good knowledge', 'Work in'). However, there are no major spelling errors and overall readability is acceptable.",
    "issues": [
      {
        "original": "I worked in number of companies",
        "corrected": "I have worked in a number of companies",
        "type": "Grammar: missing article and tense inconsistency"
      },
      {
        "original": "I found myself as an energetic, hardworking and persistent person",
        "corrected": "I have proven myself to be an energetic, hardworking, and persistent professional",
        "type": "Phrasing: awkward construction and weak self-description"
      },
      {
        "original": "Have good knowledge in structured programming language C",
        "corrected": "Proficient in structured programming language C",
        "type": "Grammar: incomplete sentence; weak verb"
      },
      {
        "original": "Work in C#, ASP.Net, OOP, Java, PHP Framework - Codeigniter",
        "corrected": "Experienced in C#, ASP.NET, object-oriented programming, Java, and PHP (Codeigniter framework)",
        "type": "Grammar: incomplete sentence; inconsistent capitalization (ASP.Net vs ASP.NET); weak verb"
      },
      {
        "original": "Working experience in Android platform and Firefox OS",
        "corrected": "Developed applications for Android and Firefox OS platforms",
        "type": "Phrasing: weak verb; passive construction"
      },
      {
        "original": "Duration: 01-January-2017 To 10-December-2016",
        "corrected": "Duration: January 2017 – December 2016 [verify actual dates—end date cannot precede start date]",
        "type": "Logic error: chronologically impossible date range"
      },
      {
        "original": "Able to work under pressure and challenging environment",
        "corrected": "Thrive in high-pressure and challenging environments",
        "type": "Phrasing: weak verb; clichéd soft skill"
      },
      {
        "original": "Strong interpersonal, team building",
        "corrected": "Strong interpersonal and team-building skills",
        "type": "Grammar: incomplete phrase; missing article"
      },
      {
        "original": "Organised and self-motivated",
        "corrected": "Highly organized and self-motivated",
        "type": "Phrasing: weak adjective; could be strengthened"
      },
      {
        "original": "Create some Websites for local clients, using PHP, MySQL, HTML Report",
        "corrected": "Developed websites for local clients using PHP, MySQL, and HTML reporting",
        "type": "Grammar: tense inconsistency (Create vs past tense context); weak verb"
      }
    ]
  },
  "action_items": [
    "URGENT: Remove all personal demographic information (father's name, mother's name, date of birth, religion, marital status, gender) and the Declaration section. These are inappropriate for international applications and create privacy and bias risks. Retain only: name, address, phone, email in the header.",
    "Rewrite the Professional Experience section immediately. Add 3–4 achievement-focused bullet points under each role (RRMSense, Softrithm, Vintage IT) describing: projects delivered, technologies used, team size, business impact, or performance metrics. Example: 'Developed ERP Purchase Module using PHP/Codeigniter for RRM Group, reducing procurement cycle time by 25% and serving 50+ internal users.' Also correct the chronological error in Softrithm IT dates.",
    "Restructure the Software Development Experience section to include quantified outcomes. For each project, add 1–2 lines describing: business problem solved, team size, user base, or measurable result. Example: 'Bangabandhu Library Management System (C#, MS SQL Server): Designed and deployed system for Bangladesh Army library, managing 10,000+ book records and serving 200+ users.'",
    "Rename section headings to international standards: 'CAREER OBJECTIVES' → 'Professional Summary', 'SCHOLASTIC STATUS' → 'Education', 'TECHNICAL KNOWLEDGE' → 'Technical Skills'. Delete the 'PERSONAL INFORMATION' section heading entirely.",
    "Rewrite the Career Summary and Technical Knowledge sections to use strong action verbs and demonstrate proficiency levels. Replace 'Have good knowledge in' with 'Proficient in' or 'Expert in'. Replace 'Work in' with 'Experienced in' or 'Skilled in'. Add context: e.g., 'Proficient in full-stack web development using PHP, MySQL, and JavaScript; 5+ years of experience building scalable ERP and management systems.'"
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer / Full-Stack Developer",
    "inferred_industry": "Software Development / IT Services",
    "keyword_hits": [
      "PHP",
      "C#",
      "ASP.NET",
      "Java",
      "MySQL",
      "SQL Server",
      "HTML",
      "CSS",
      "JavaScript",
      "Angular",
      "Bootstrap",
      "Android",
      "ERP",
      "Database Design",
      "Web Development",
      "Software Development",
      "Codeigniter"
    ],
    "keyword_gaps": [
      "Git / Version Control",
      "Agile / Scrum",
      "REST API / Web Services",
      "CI/CD / DevOps",
      "Unit Testing / Test-Driven Development"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Non-standard heading; international ATS systems expect 'Professional Summary' or 'Summary'.",
        "recommended": "Professional Summary"
      },
      {
        "original": "SCHOLASTIC STATUS",
        "issue": "Non-standard heading; international ATS systems expect 'Education'.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading; international ATS systems do not parse demographic sections. This section should be deleted entirely.",
        "recommended": "Delete section; retain only contact details in header."
      },
      {
        "original": "WHY ME",
        "issue": "Non-standard heading; international ATS systems may not recognize this as a skills or competencies section.",
        "recommended": "Core Competencies or Key Skills"
      },
      {
        "original": "SOFTWARE DEVELOPMENT EXPERIENCE",
        "issue": "Non-standard heading; international ATS systems expect 'Projects' or 'Professional Projects'.",
        "recommended": "Projects"
      }
    ],
    "ats_tips": [
      "Add missing modern development keywords to the Technical Skills section: explicitly mention 'Git', 'GitHub', 'Agile', 'Scrum', 'REST API', 'CI/CD', and 'Unit Testing' if applicable. International ATS systems heavily weight these terms for software engineering roles. Currently absent from resume.",
      "Expand the Professional Experience section with quantified metrics and business outcomes. ATS systems score higher when bullet points contain numbers (e.g., 'reduced processing time by 30%', 'managed 50+ concurrent users', 'deployed to 5 production environments'). Current resume lists only dates and titles with no metrics.",
      "Standardize section headings to match international ATS parsing conventions. Replace 'CAREER OBJECTIVES' with 'Professional Summary', 'SCHOLASTIC STATUS' with 'Education', and delete 'PERSONAL INFORMATION' entirely. Non-standard headings may cause ATS systems to skip or misclassify sections. International ATS systems will likely remove or discount resumes containing personal demographic information (date of birth, religion, marital status, parent names), so deletion is critical for ATS compatibility."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 56
}
```