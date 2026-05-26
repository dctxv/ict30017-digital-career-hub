---
resume: shah_jalal_hridoy
mode: bangladesh
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 130.3
  token_count: 2032
  cost_usd: 0.0033254
  duration_seconds: 15.6
---

## Analysis Output

{
  "formatting": {
    "score": 74,
    "feedback": "Structure is clear with standard Bangladeshi section headings and good use of whitespace. However, some blocks reduce readability: the “Career Summary” is a paragraph, “Professional Experience” lacks bullet points for achievements (creates large empty space and ATS ambiguity), and dates/titles are not consistently aligned with other entries. Also, inconsistent dash styles and occasional spacing/punctuation issues appear across sections.",
    "issues": [
      {
        "section": "PROFESSIONAL EXPERIENCE",
        "issue": "No achievement bullets under each role; only designation and date range are provided, which makes the experience section look sparse and harder to scan.",
        "suggestion": "Add 3–5 bullets per role under each designation with outcomes and technologies used (e.g., ERP modules delivered, reporting/reporting tools used, impact metrics)."
      },
      {
        "section": "SCHOLASTIC STATUS",
        "issue": "Education is missing the Education Board/Board for university entries (often expected in Bangladesh CVs is not required, but consistent institution naming and “Session” format should be uniform). Also “Session: 2015-2016” for ongoing M.Sc. is unclear without “Year” or “Expected” date.",
        "suggestion": "Use a consistent date format (e.g., “2015–Present” for ongoing) and keep university fields consistently formatted across both degrees."
      },
      {
        "section": "CAREER OBJECTIVES",
        "issue": "Long sentence without line breaks; it becomes harder to read quickly.",
        "suggestion": "Split into 2 lines and make it role-specific (target job title + one concrete strength)."
      },
      {
        "section": "SOFTWARE DEVELOPMENT EXPERIENCE",
        "issue": "Project list is mostly unstructured lines; technologies are repeated but there are no bullets describing scope/impact. ATS may treat this as low-signal unstructured content.",
        "suggestion": "For each system, add 1 short bullet with (1) your role, (2) key features you built, and (3) tools/DB/reporting used."
      },
      {
        "section": "Technical Knowledge",
        "issue": "Inconsistent phrasing/terminology (e.g., “Web service” vs “Web Services”, “Angular JS” capitalization consistency).",
        "suggestion": "Standardise tool names and capitalisation (e.g., “ASP.NET”, “AngularJS”, “Web Services”)."
      }
    ]
  },
  "content_quality": {
    "score": 56,
    "feedback": "You have relevant technical tools (C#, ASP.NET, PHP/CodeIgniter, SQL Server/MySQL, HTML/CSS/JS, reporting tools) and multiple domain projects (ERP modules, library/restaurant/hotel systems, POS, inventory). However, the resume lacks measurable impact and role clarity in professional experience, and several statements are generic (e.g., “extensive knowledge”, “hardworking”). The career objective is broad and not role-targeted. Some entries are missing useful detail for recruiters (e.g., whether you developed, implemented, integrated, maintained; and any performance/security/usage outcomes). Also, one professional experience date range appears inconsistent (Software Engineer duration shows 01-January-2017 to 10-December-2016, which is reversed).",
    "strengths": [
      "Strong technical stack coverage: C, C#, ASP.NET, PHP (CodeIgniter), SQL Server, MySQL, HTML/CSS/JavaScript, AngularJS, Bootstrap",
      "Relevant reporting tools listed: Crystal Reports and Jasper Reports",
      "Multiple system/project themes that match enterprise use cases (ERP modules, HR/Sales/Purchase, inventory, hotel/restaurant management, library system)",
      "References include full names, designations/organisations, and contact details",
      "Education includes SSC and HSC with GPA on a /5.00 basis"
    ],
    "weaknesses": [
      "Career Objective is generic and not specific to a target role (IT/software engineer competencies are listed, but the objective doesn’t name the exact role you want or a concrete value proposition).",
      "Professional Experience section lacks bullets with responsibilities and outcomes; recruiters cannot assess what you achieved at each company.",
      "Date inconsistency: “Softrithm IT Limited … Duration: 01-January-2017 To 10-December-2016” appears reversed.",
      "Projects in “SOFTWARE DEVELOPMENT EXPERIENCE” are technology-stated but not outcome-stated (no scope, modules delivered, user count, performance improvements, or your specific contribution).",
      "Career Summary and “WHY ME” include broad personal traits without linking to results or concrete examples (e.g., “hardworking”, “persistent”, “target oriented”)."
    ]
  },
  "language_grammar": {
    "score": 63,
    "feedback": "Overall grammar is understandable, but there are multiple issues with article use, verb forms, and consistency (“enthusiastic in”/“interested in” phrasing; pluralisation; some punctuation). There are also a few formatting inconsistencies that affect professionalism (e.g., inconsistent spacing around separators and missing periods).",
    "issues": [
      {
        "original": "To merge innovative ideas, techniques, knowledge and experience for positive contribution towards the IT, Telecommunication and Software industry where my conceptual, analytical and technical skills can be utilised",
        "corrected": "To contribute to the IT, telecommunication, and software industry by applying my conceptual, analytical, and technical skills in a software engineering role and further strengthening my expertise.",
        "type": "grammar/style"
      },
      {
        "original": "I am enthusiastic in seeking new things",
        "corrected": "I am enthusiastic about learning new things.",
        "type": "grammar"
      },
      {
        "original": "I worked in number of companies",
        "corrected": "I worked in a number of companies.",
        "type": "grammar"
      },
      {
        "original": "I found myself as an energetic, hardworking and persistent person.",
        "corrected": "I have developed myself as an energetic, hardworking, and persistent person.",
        "type": "grammar"
      },
      {
        "original": "Web service",
        "corrected": "Web Services",
        "type": "capitalisation/terminology"
      },
      {
        "original": "Angular JS",
        "corrected": "AngularJS",
        "type": "capitalisation/terminology"
      }
    ]
  },
  "action_items": [
    "Update “PROFESSIONAL EXPERIENCE” by adding 3–5 achievement bullets under each role (Sr Software Engineer / Software Engineer / Junior Software Engineer) including your specific contribution (features implemented, modules delivered) and the key tech used.",
    "Fix the date error in “PROFESSIONAL EXPERIENCE”: change “01-January-2017 To 10-December-2016” to the correct start/end dates (currently reversed).",
    "Rewrite “CAREER OBJECTIVES” to be role-specific and value-driven (name a target role such as Software Engineer/.NET Developer/PHP Developer and include one concrete strength from your experience/projects).",
    "Upgrade “SOFTWARE DEVELOPMENT EXPERIENCE” entries by adding one-line outcomes per system (what you built/integrated + any measurable result, even approximate).",
    "Improve “CAREER SUMMARY” / “WHY ME” by replacing generic traits with 2–3 proof-based statements tied to your projects/ERP modules (e.g., reporting automation, system delivery, module ownership)."
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer (ERP/Web Applications; PHP/.NET)",
    "inferred_industry": "IT Services / Software Development",
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
      "MIS",
      "Reporting"
    ],
    "keyword_gaps": [
      "REST API",
      "Entity Framework",
      "Git"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Some multinational ATS parsers treat “objectives” as non-structured narrative; it’s usually fine, but could be less scannable than “Professional Summary”.",
        "recommended": "Keep the heading, but ensure the first 1–2 lines are keyword-dense (e.g., target role + core stack) so parsing captures relevant terms."
      }
    ],
    "ats_tips": [
      "Add keyword-rich bullets under “PROFESSIONAL EXPERIENCE” (e.g., “developed”, “implemented”, “integrated”) and explicitly repeat your primary stack (C#/.NET or PHP/CodeIgniter, SQL Server/MySQL, Crystal/Jasper).",
      "In “SOFTWARE DEVELOPMENT EXPERIENCE”, convert each system line into a consistent mini-format: System Name → Role/Module → Tech Stack → Outcome. This improves ATS signal over unstructured lists.",
      "Correct inconsistent date formatting (and any punctuation inconsistencies) to reduce parsing errors in timeline extraction."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 63
}