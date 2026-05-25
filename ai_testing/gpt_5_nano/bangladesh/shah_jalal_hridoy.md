---
resume: shah_jalal_hridoy
mode: bangladesh
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 116.1
  token_count: 7952
  cost_usd: 0.00337715
  duration_seconds: 68.5
---

## Analysis Output

{
  "formatting": {
    "score": 66,
    "feedback": "The resume uses Bangladeshi conventions (Personal Information, References, Declaration, etc.) which triggers a formatting ceiling. Layout is basic with "---" separators and long blocks of text. Chronology in Experience is inconsistent (a later role shows an impossible date range) and bullets are sparse. Overall readability is hampered by dense paragraphs and a lack of scannable bullet points. Consider standardizing section headings, using bullets for each project/role, and ensuring reverse-chronological order with uniform date formats.",
    "issues": [
      {
        "section": "PROFESSIONAL EXPERIENCE",
        "issue": "Inconsistent and infeasible date ranges (e.g., 'Softrithm IT Limited Duration: 01-January-2017 To 10-December-2016').",
        "suggestion": "Correct to proper chronological order and valid ranges, e.g., '01 Jan 2016 – 10 Dec 2016' and place the most recent role first."
      },
      {
        "section": "PROFESSIONAL EXPERIENCE",
        "issue": "Lack of bullet-driven, outcome-focused detail for each role.",
        "suggestion": "Convert each position into 3–5 bulleted achievements with quantified results where possible (e.g., 'Reduced ERP report generation time by 20%')."
      },
      {
        "section": "MULTI-SECTION STRUCTURE",
        "issue": "Heavy blocks of text with minimal bullet formatting across sections.",
        "suggestion": "Use consistent bullet points for Career Summary, Technical Knowledge, and Project List; align spacing and margins; avoid long paragraphs."
      },
      {
        "section": "EDUCATION / SCHOLASTIC STATUS",
        "issue": "Nonstandard heading ('SCHOLASTIC STATUS') and mixed detail (Session, CGPA, etc.).",
        "suggestion": "Rename to 'Education' and present in reverse-chronological order with degree, institution, year, GPA, and board where relevant."
      },
      {
        "section": "REFERENCES",
        "issue": "No issues flagged; however ensure readability and avoid long contact blocks in plain text.",
        "suggestion": "Keep full referees as currently provided, but consider a compact formatting style to improve ATS parsing."
      }
    ]
  },
  "content_quality": {
    "score": 58,
    "feedback": "Strengths: broad technical exposure across languages and frameworks; extensive project list; active professional memberships and volunteer work; references provided. Weaknesses: objective is generic; work history bullets lack outcomes or metrics; inconsistent project descriptions; MSc admission status is unclear in a resume focused on applying roles; Education section could be tightened for readability.",
    "strengths": [
      "Breadth of technical skills across C, C#, ASP.NET, Java, PHP (CodeIgniter), SQL Server, MySQL, HTML/CSS/JavaScript, AngularJS, and Android.",
      "Multiple ERP/CRM-type projects and a clear focus on software development across platforms (web, desktop, mobile).",
      "Active professional affiliations and volunteer experience (Bangladesh Computer Society, GDG Bangla, Duke of Edinburgh’s Award) indicating engagement with the tech community.",
      "References section with two named referees and contact details, aligned with local expectations.",
      "Concrete project portfolio (ERP modules, Library Management, Restaurant/Inventory/Hotel systems) shows practical experience."
    ],
    "weaknesses": [
      "Career Objective is generic and not tailored to a target role or industry.",
      "Professional Experience bullets lack measurable outcomes and use broad phrases (e.g., 'ERP Solution - for RRM Group' without results).",
      "Education details are cluttered and could be streamlined (dates mixed, session, boards, CGPA formatting).",
      "Projects under 'SOFTWARE DEVELOPMENT EXPERIENCE' are listed without concise per-project impact or technologies used per bullet.",
      "MSc status ('M.Sc. in Computer Science & Engineering ... Status: Ongoing') may require clarity on expected completion date."
    ]
  },
  "language_grammar": {
    "score": 62,
    "feedback": "Several sentences are awkward or grammatically off; some tense consistency is missing. Below are flagged phrases with corrected versions.",
    "issues": [
      {
        "original": "To merge innovative ideas, techniques, knowledge and experience for positive contribution towards the IT, Telecommunication and Software industry where my conceptual, analytical and technical skills can be utilised and to further enhance my knowledge.",
        "corrected": "To contribute to the IT, telecommunications, and software industry by applying my conceptual, analytical, and technical skills and by expanding my knowledge."
      },
      {
        "original": "I have extensive knowledge in computers, which include Software Development, Database Management and MIS. I am enthusiastic in seeking new things and interested in innovation.",
        "corrected": "I have extensive knowledge in computers, including software development, database management, and MIS. I am enthusiastic about learning new things and pursuing innovation."
      },
      {
        "original": "I worked in number of companies where I found myself as an energetic, hardworking and persistent person.",
        "corrected": "I have worked in a number of companies where I demonstrated energy, hard work, and persistence."
      },
      {
        "original": "Softrithm IT Limited",
        "corrected": "Softrithm IT Limited"
      }
    ]
  },
  "action_items": [
    "Revise CAREER OBJECTIVES into a tailored, role-specific statement. Include target role (e.g., 'Software Engineer' or 'Senior Software Developer') and a concrete strength drawn from your experience.",
    "Rework PROFESSIONAL EXPERIENCE into reverse-chronological bullets with quantified outcomes for each role (e.g., 'Led the development of X module, reducing processing time by Y%,' and fix the date ranges to valid periods).",
    "Streamline EDUCATION details: rename SCHOLASTIC STATUS to EDUCATION, present each degree with degree, institution, year, GPA/CGPA, and board where applicable; ensure MSc status is clearly defined with expected completion if ongoing.",
    "Enhance the PROJECT/TECHNICAL EXPERIENCE section by listing key projects with technologies used and one line describing impact or result; align with ATS-friendly bullet formatting.",
    "Improve overall formatting: convert dense paragraphs to bullets, ensure consistent date formats and spacing, and consider standard headings (OBJECTIVE, PROFESSIONAL SUMMARY, EXPERIENCE, SKILLS, EDUCATION, REFERENCES) for better ATS readability."
  ],
  "ats_analysis": {
    "inferred_role": "Software Engineer / Developer",
    "inferred_industry": "Information Technology / Software Development",
    "keyword_hits": [
      "Sr Software Engineer",
      "Software Engineer",
      "C#",
      "ASP.Net",
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
      "ERP",
      "Library Management System",
      "Restaurant Management System",
      "Inventory System",
      "Education Management System"
    ],
    "keyword_gaps": [
      "Git (version control)",
      "RESTful API / API development",
      "Agile/Scrum experience"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVES",
        "issue": "Non-standard ATS heading; may be misread or ignored by some parsers.",
        "recommended": "OBJECTIVE"
      },
      {
        "original": "CAREER SUMMARY",
        "issue": "Non-standard for many international ATS; may be treated as an unstructured summary.",
        "recommended": "PROFESSIONAL SUMMARY"
      },
      {
        "original": "SCHOLASTIC STATUS",
        "issue": "Non-standard heading that could confuse ATS.",
        "recommended": "EDUCATION"
      },
      {
        "original": "WHY ME",
        "issue": "Non-standard heading; ATS may skip or misinterpret.",
        "recommended": "KEY STRENGTHS"
      },
      {
        "original": "REFERENCES",
        "issue": "Typically acceptable, but ensure all contact details are in a consistent, parse-friendly format.",
        "recommended": "REFERENCES"
      },
      {
        "original": "DECLARATION",
        "issue": "Non-essential for ATS parsing; may introduce noise.",
        "recommended": "REMOVE"
      }
    ],
    "ats_tips": [
      "Add a near-the-top OBJECTIVE/PROFESSIONAL SUMMARY that mirrors the target role and includes a key strength (e.g., 'Software Engineer with 6+ years in full-stack web and ERP systems').",
      "Create a concise SKILLS/TECHNICAL SKILLS section listing core technologies (e.g., languages, frameworks, databases, tools) with bullets and avoid long paragraphs.",
      "Standardize dates and ensure reverse-chronological ordering for EXPERIENCE; use YYYY-MM format (e.g., 2016-12 to Present) for consistency."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 61
}