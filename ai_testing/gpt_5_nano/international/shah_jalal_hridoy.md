---
resume: shah_jalal_hridoy
mode: international
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 111.8
  token_count: 7722
  cost_usd: 0.00326175
  duration_seconds: 69.1
---

## Analysis Output

{
  "formatting": {
    "score": 60,
    "feedback": "The resume relies on Bangladeshi CV conventions (Personal Information block, Declaration, Career Objectives) that reduce ATS compatibility. The layout is dense with long blocks and some inconsistent formatting (dates, capitalization) and unclear section headings. Actionable improvements include standardizing headings (Professional Summary, Education, Experience, Skills, Projects), moving or removing non-essential personal data, and ensuring consistent bullet formatting and date presentation.",
    "issues": [
      {
        "section": "Personal Information (Bangladeshi convention)",
        "issue": "Including sensitive parental data and demographic details in an international resume can trigger bias and privacy concerns.",
        "suggestion": "Remove Father's Name, Mother's Name, Date of Birth, Religion, Marital Status, Gender, and Nationality from the Personal Information section; retain only name (if appropriate), city, email, and phone in a concise 'Contact Details' block."
      },
      {
        "section": "Personal Information - Date of Birth",
        "issue": "Date of Birth is inappropriate for international applications and can invite age bias.",
        "suggestion": "Delete Date of Birth and focus on experience and qualifications."
      },
      {
        "section": "Personal Information - Religion",
        "issue": "Religion is not relevant to job qualifications in international contexts.",
        "suggestion": "Remove Religion from the Personal Information section."
      },
      {
        "section": "Personal Information - Marital Status",
        "issue": "Marital Status is personal data that can bias shortlisting.",
        "suggestion": "Remove Marital Status from the Personal Information section."
      },
      {
        "section": "Personal Information - Father's/Mother's Name",
        "issue": "Parent names are not standard in international CVs and may introduce bias.",
        "suggestion": "Remove both parents' names from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration is a Bangladeshi CV convention not used in international resumes and wastes space.",
        "suggestion": "Remove the Declaration section entirely."
      },
      {
        "section": "CAREER OBJECTIVES heading",
        "issue": "Heading risks: 'CAREER OBJECTIVES' is non-standard for international ATS.",
        "suggestion": "Replace with 'Professional Summary' and condense into a 3–4 line profile."
      },
      {
        "section": "PERSONAL INFORMATION heading",
        "issue": "Heading risks: 'Personal Information' is non-standard for international ATS.",
        "suggestion": "Rename to 'Contact Details' and relocate minimal contact info there."
      }
    ]
  },
  "content_quality": {
    "score": 58,
    "feedback": "Strengths: broad technical background across languages (C, C#, Java, PHP), databases (SQL Server, MySQL), and UI (HTML/JS/Angular). Projects cover ERP, library, and hospitality domains, showing real-world application. Weaknesses: lack of quantified achievements, inconsistent chronology (illogical date ranges), no dedicated skills section, and overly long, undifferentiated bullets in experience. Internship/early-career validation is weak; job targets are not clearly aligned to a single role or market.",
    "strengths": [
      "Diverse technical stack (C, C#, Java, PHP, SQL, HTML/JS, Angular, Bootstrap).",
      "Experience across ERP, HR, library, and restaurant management systems.",
      "Projects demonstrate end-to-end development (modules, reporting, web/mobile)."
    ],
    "weaknesses": [
      "No quantified outcomes (e.g., reduced processing time by X%, increased users by Y).",
      "Inconsistent or illogical dates in Professional Experience (e.g., 01-Jan-2017 to 10-Dec-2016).",
      "No dedicated 'Skills' or 'Projects' sections with concise bullets and outcomes.",
      "Objective and summary are vague and not tailored to a target role."
    ]
  },
  "language_grammar": {
    "score": 55,
    "feedback": "Several wording and grammar issues reduce clarity. Correcting tense, prepositions, and capitalization will improve professionalism. Below are representative examples with corrected versions.",
    "issues": [
      {
        "original": "I have extensive knowledge in computers, which include Software Development, Database Management and MIS.",
        "corrected": "I have extensive knowledge of computers, including software development, database management, and MIS.",
        "type": "grammar"
      },
      {
        "original": "I am enthusiastic in seeking new things",
        "corrected": "I am enthusiastic about seeking new things.",
        "type": "grammar"
      },
      {
        "original": "I worked in number of companies where I found myself as an energetic, hardworking and persistent person.",
        "corrected": "I have worked in a number of companies where I was energetic, hardworking, and persistent.",
        "type": "grammar"
      },
      {
        "original": "Have good knowledge in structured programming language C",
        "corrected": "I have a good knowledge of structured programming languages, such as C.",
        "type": "grammar"
      },
      {
        "original": "Codeigniter",
        "corrected": "CodeIgniter",
        "type": "spelling"
      },
      {
        "original": "HTML Report",
        "corrected": "HTML reports",
        "type": "consistency"
      },
      {
        "original": "DOM Pdf Report",
        "corrected": "DOMPDF reports",
        "type": "consistency"
      }
    ]
  },
  "action_items": [
    "Section: Personal Information -> Remove Father's Name, Mother's Name, Date of Birth, Religion, Marital Status, Gender (if included), and Nationality. Consolidate essential contact details into a new 'Contact Details' section.",
    "Section: Career Objectives -> Replace heading with 'Professional Summary' and craft a concise 3–4 line value proposition tailored to a software engineer role.",
    "Section: Professional Experience -> Correct inconsistent date ranges (ensure chronological order) and rewrite bullets to include quantified outcomes where possible (e.g., 'Led a team of 4 developers to deliver ERP modules on time, reducing delivery cycle by 20%).",
    "Section: Add Sections -> Create a new 'Skills' section listing core competencies and tools (e.g., languages, frameworks, databases, version control, CI/CD). Add an optional 'Projects' or 'Selected Projects' section with brief outcomes and technologies used.",
    "Section: Formatting -> Normalize bullet style, ensure consistent capitalization (CodeIgniter, ASP.NET, HTML, SQL), and reformat sections as: Professional Summary, Education, Experience, Skills, Projects, Certifications, References (optional)."
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer / Developer",
    "inferred_industry": "Information Technology / Software Development",
    "keyword_hits": [
      "Software Engineer",
      "Sr Software Engineer",
      "C#",
      "ASP.Net",
      "Java",
      "PHP",
      "CodeIgniter",
      "MySQL",
      "MS SQL Server",
      "Crystal Report",
      "Jasper Report",
      "Android",
      "HTML",
      "JavaScript",
      "Angular JS",
      "Bootstrap",
      "ERP",
      "Web service"
    ],
    "keyword_gaps": [
      "Git (version control)",
      "RESTful API / Web API",
      "Agile/Scrum or CI/CD"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Professional Summary"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Contact Details"
      },
      {
        "original": "DECLARATION",
        "issue": "Not parsed by most international ATS; wastes space.",
        "recommended": "Remove"
      }
    ],
    "ats_tips": [
      "Add a concise 'Professional Summary' at top with 3–4 lines highlighting core competencies and target role.",
      "Introduce a distinct 'Skills' section listing technical proficiencies and tools with keywords matching common ATS queries.",
      "Standardize section headings (Professional Summary, Education, Experience, Skills, Projects) and ensure dates are in a consistent format (e.g., MMM YYYY – MMM YYYY)."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 57
}