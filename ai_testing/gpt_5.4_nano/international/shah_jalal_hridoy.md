---
resume: shah_jalal_hridoy
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 148.3
  token_count: 2209
  cost_usd: 0.00313049
  duration_seconds: 14.9
---

## Analysis Output

{
  "formatting": {
    "score": 58,
    "feedback": "The resume is readable and uses clear section blocks, but it mixes international and local conventions and includes dense, unstructured text (especially in “Career Summary”, “Scholastic Status”, and the experience entries). Several entries are missing consistent dates formatting and the experience section is not written in a standard “Company | Title | Dates” single-line format with bullet achievements. Headings like “CAREER OBJECTIVES” and “SCHOLASTIC STATUS” may be parsed inconsistently by international ATS. Address/phone/email appear, which is acceptable for a human but can be a screening/formatting risk for ATS when combined with non-standard personal details. Overall, you’ll get better ATS parsing and recruiter skim-accuracy with tighter structure, consistent date formats, and bullet-based accomplishments under each role.",
    "issues": [
      {
        "section": "CAREER OBJECTIVES",
        "issue": "Non-standard ATS heading and format for international applications.",
        "suggestion": "Replace with “PROFESSIONAL SUMMARY” and convert to 2–3 lines summarising relevant experience/skills for the target role."
      },
      {
        "section": "SCHOLASTIC STATUS",
        "issue": "Heading is non-standard for many international ATS systems.",
        "suggestion": "Rename to “EDUCATION”."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Contains multiple demographic/personal data fields that are not expected in international resumes and may reduce shortlisting.",
        "suggestion": "Remove parent names, date of birth, religion, marital status from this section entirely; keep only name + contact details + (optionally) nationality if you must."
      },
      {
        "section": "PROFESSIONAL EXPERIENCE",
        "issue": "Job entries list company address and duration separately; lacks achievement bullets and standard formatting (company/title/dates in one consistent line).",
        "suggestion": "For each role, use: “Company — Title | Start–End” then 3–5 bullet achievements with outcomes/metrics. Remove company addresses unless required for region targeting."
      },
      {
        "section": "SOFTWARE DEVELOPMENT EXPERIENCE",
        "issue": "Large unstructured list of systems/projects without context (role, duration, outcome/impact).",
        "suggestion": "Convert into grouped bullets under 1–2 lines per project: “Project — Tech stack — Your role — Outcome (e.g., improved reporting time by X%, used by Y users, implemented modules, migrated data)”."
      },
      {
        "section": "DECLARATION",
        "issue": "Declaration section is a Bangladesh CV convention and wastes ATS-relevant space for international applications.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 50,
    "feedback": "You have a relevant technical foundation (C#, ASP.NET, SQL Server/MySQL, JavaScript/Angular/Bootstrap, PHP/CodeIgniter) and you list multiple ERP/module projects and reporting tools (Crystal/Jasper). However, most experience bullets are missing measurable outcomes, scope, and impact. The “Professional Experience” section has no accomplishments at all—only titles and dates—so recruiters can’t verify what you delivered. “Career Summary” and “Why Me” contain subjective soft-skill statements without evidence. The education dates/CGPA formats appear inconsistent (e.g., M.Sc. shows 2015–2016 ongoing, but prior B.Sc. shows 2010–2011 only; unclear timeline). Technical knowledge is written as capability statements rather than evidence (e.g., no mention of versions, frameworks, or deliverables).",
    "strengths": [
      "Technical skill coverage is broad and relevant to software engineering (C#, ASP.NET, PHP/CodeIgniter, SQL Server/MySQL, HTML/CSS/JavaScript, AngularJS, Bootstrap).",
      "Project listing shows hands-on work across ERP modules and reporting (Crystal Report/Jasper Report; DOMPDF).",
      "Android development training and an Android app (Dhakaiya) indicate mobile exposure."
    ],
    "weaknesses": [
      "“PROFESSIONAL EXPERIENCE” lacks achievement bullets; it only states designation and dates/addresses.",
      "Project experience under “SOFTWARE DEVELOPMENT EXPERIENCE” is largely a feature/stack list without outcomes (no scale, users, performance improvements, deadlines, or business impact).",
      "Use of vague/unspecific claims in “CAREER SUMMARY” and “WHY ME” (e.g., energetic, hardworking, organised) without supporting examples.",
      "Education timeline is unclear/inconsistent (e.g., B.Sc. session 2010–2011 but M.Sc. session 2015–2016 ongoing; could confuse reviewers).",
      "Technical knowledge section doesn’t translate to keywords recruiters expect (e.g., ASP.NET (MVC/Web API), REST, Git, CI/CD, unit testing) and may be missing key tooling."
    ]
  },
  "language_grammar": {
    "score": 62,
    "feedback": "Mostly understandable, but there are several grammar and clarity issues (tense consistency, article usage, and run-on sentences). Minor wording improvements will make it sound more professional to international recruiters.",
    "issues": [
      {
        "original": "To merge innovative ideas, techniques, knowledge and experience for positive contribution towards the IT, Telecommunication and Software industry where my conceptual, analytical and technical skills can be utilised and to further enhance my knowledge.",
        "corrected": "To contribute innovative ideas and technical expertise to the IT, telecommunications, and software industry, while continuing to expand my knowledge and skills.",
        "type": "Style/grammar (run-on sentence and awkward phrasing)"
      },
      {
        "original": "I have extensive knowledge in computers, which include Software Development, Database Management and MIS.",
        "corrected": "I have extensive knowledge of computers, including software development, database management, and MIS.",
        "type": "Grammar (preposition and parallel structure)"
      },
      {
        "original": "I am enthusiastic in seeking new things and interested in innovation.",
        "corrected": "I am enthusiastic about learning new things and developing innovative solutions.",
        "type": "Grammar (incorrect preposition/word choice)"
      },
      {
        "original": "Softrithm IT - Website For own using, using PHP, MySQL",
        "corrected": "Softrithm IT — Website for my own use; PHP, MySQL",
        "type": "Grammar (inconsistent phrasing)"
      },
      {
        "original": "Create some Websites for local clients, using PHP, MySQL, HTML Report",
        "corrected": "Created websites for local clients using PHP, MySQL, and HTML reporting.",
        "type": "Tense/clarity (fragmented wording)"
      }
    ]
  },
  "action_items": [
    "Update “PROFESSIONAL EXPERIENCE”: add 3–5 bullet achievements per role (Sr Software Engineer / Software Engineer / Junior Software Engineer) using measurable outcomes (modules delivered, performance, scale, customers/users, bug reduction, time saved).",
    "Replace “CAREER OBJECTIVES” with a “PROFESSIONAL SUMMARY” (2–3 lines) tailored to the role you want (e.g., C#/.NET Software Engineer or Full-Stack Engineer) and remove the generic wording.",
    "Revise “SOFTWARE DEVELOPMENT EXPERIENCE”: for each listed system, add your specific role and one outcome; avoid only stacking technologies (e.g., “implemented Purchase module using CodeIgniter, reduced report generation time by X%”).",
    "Clean “PERSONAL INFORMATION” for international standards: remove father/mother names, date of birth, religion, and marital status; keep only contact details and (optionally) nationality.",
    "Remove “DECLARATION” entirely and rename “SCHOLASTIC STATUS” to “EDUCATION” for better international ATS compatibility."
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer (C# / ASP.NET and PHP/CodeIgniter; likely backend/ERP-focused)",
    "inferred_industry": "Software development / IT services (ERP, web and reporting systems)",
    "keyword_hits": [
      "C",
      "C#",
      "ASP.Net",
      "OOP",
      "Java",
      "PHP",
      "Codeigniter",
      "SQL Server",
      "MySQL",
      "HTML",
      "CSS",
      "JavaScript",
      "Angular JS",
      "Bootstrap",
      "Web service",
      "Android",
      "Crystal Report",
      "Jasper Report",
      "DOM Pdf"
    ],
    "keyword_gaps": [
      "ASP.NET MVC",
      "RESTful APIs / Web API",
      "Git"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Non-standard heading; some ATS/recruiter templates expect “Professional Summary”.",
        "recommended": "Replace with “PROFESSIONAL SUMMARY”."
      },
      {
        "original": "SCHOLASTIC STATUS",
        "issue": "Non-standard education heading and may be inconsistently parsed.",
        "recommended": "Rename to “EDUCATION”."
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "ATS systems may discount or mis-handle demographic content within ATS-fed fields; also non-standard in international contexts.",
        "recommended": "Use “CONTACT DETAILS” and include only email/phone/location; remove demographic details."
      }
    ],
    "ats_tips": [
      "Remove personal demographic information from the resume (including parent names, date of birth, religion, marital status). International ATS systems and recruiters will likely remove or discount resumes containing such information.",
      "Add explicit role-oriented keywords that ATS commonly expects for .NET engineering (e.g., “ASP.NET MVC” or “ASP.NET Web API” and “RESTful APIs”)—you can reflect what you actually used in your ERP/Web service work.",
      "Reformat “PROFESSIONAL EXPERIENCE” into standard international ATS structure: one line per job (Company | Title | Dates) plus bullet achievements; remove company addresses from the experience block."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 53
}