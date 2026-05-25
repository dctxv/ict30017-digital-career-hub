---
resume: rashed
mode: bangladesh
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 115.4
  token_count: 9449
  cost_usd: 0.0039487
  duration_seconds: 81.9
---

## Analysis Output

{
  "formatting": {
    "score": 72,
    "feedback": "The resume follows many Bangladeshi conventions (e.g., Career Objective, Educational Qualification, Technical Skills, and References). However, it would benefit from improved formatting consistency and section organization to perform better with both local and international ATS. Key quick wins include standardizing line breaks, bullet styles, and horizontal spacing, and avoiding overly dense lines in some bullets. Note: Bangladeshi conventions trigger a formatting ceiling; the current draft already aligns with those norms but could be made cleaner for readability and ATS parsing.",
    "issues": [
      {
        "section": "Technical Skills",
        "issue": "Inconsistent spacing around the colon in the Software line and mixed spacing in language lines (e.g., 'Software   : AutoCAD' and 'Bengali : Native').",
        "suggestion": "Standardize to 'Software: AutoCAD, ETABS, SAP2000 (Intermediate), STAAD.Pro (Basic), MS Project' and 'Bengali: Native; English: Good command in reading, writing and speaking.'"
      },
      {
        "section": "Document layout",
        "issue": "Bullet points and section breaks vary in length and indentation, causing a slightly uneven visual rhythm.",
        "suggestion": "Use uniform bullet style and consistent 1–2 line bullets per item; ensure consistent left alignment across sections."
      },
      {
        "section": "Section headings",
        "issue": "Some headings appear in mixed formats (e.g., uppercase vs title case) and long section titles can crowd the page.",
        "suggestion": "Choose a consistent heading style (e.g., Title Case for major sections: Career Objective, Educational Qualification, Project Experience, Technical Skills, Co-Curricular Activities, References)."
      },
      {
        "section": "Content density",
        "issue": "Some bullets are dense and could be split for readability.",
        "suggestion": "Break long bullets into 1–2 concise lines; add a short result or metric where possible."
      }
    ]
  },
  "content_quality": {
    "score": 68,
    "feedback": "Strengths: clear target role as a structural engineer; relevant thesis and capstone work; solid CAD/analysis toolset; leadership and extracurricular involvement; strong academic record with 5.00/5.00 SSC/HSC and a CUET BSc. References are provided with full contact details. Weaknesses: limited quantified outcomes in project bullets; no internship or formal work experience beyond academic projects; objective is decent but could be more outcome-focused and role-specific. Also, a few bullets could be strengthened with numbers or impact statements.",
    "strengths": [
      "Targeted role: Career Objective explicitly aims for a structural engineer position in Bangladesh.",
      "Education: CUET degree with a demonstrated thesis on seismic vulnerability (relevant to structural design).",
      "Project experience: Capstone design with concrete tasks (gravity loads, reinforcement sizing, cost estimation, and defence).",
      "Technical proficiency: AutoCAD, ETABS, SAP2000, BNBC 2020, ACI 318, MATLAB (basic).",
      "Co-curricular leadership and volunteering: General Secretary role and earthquake preparedness activity.",
      "References: Two full referees with names, positions, affiliations, and contact details."
    ],
    "weaknesses": [
      "Objective could be sharper with a concrete value proposition and target sector (e.g., mid-to-large infrastructure projects).",
      "Limited internship/work experience; bullets under Capstone/Projects lack quantified outcomes (e.g., project size, capacity, savings, or performance metrics).",
      "Bullet phrasing could be strengthened to show outcomes (instead of 'developed drawings', specify scope or impact).",
      "English proficiency description is vague; consider specifying level (e.g., professional working proficiency).",
      "Consider adding a brief summary or profile at the top to consolidate key strengths and keywords for ATS."
    ],
    "improvement_quote_and_rewrite": {
      "section": "CAREER OBJECTIVE",
      "original": "To begin a career as a structural engineer at a reputable construction or infrastructure consultancy firm in Bangladesh, applying knowledge in structural analysis, foundation design, and project coordination developed during undergraduate studies at CUET.",
      "rewrite": "To secure a structural engineer role in a mid-to-large construction consultancy in Bangladesh, applying hands-on experience in seismic design and reinforced-concrete detailing gained during my BSc at CUET to deliver safe, cost-effective buildings on time."
    }
  },
  "language_grammar": {
    "score": 82,
    "feedback": "Strong overall language quality with minor consistency and punctuation issues. Correct a few spacing and formatting quirks to improve professionalism.",
    "issues": [
      {
        "original": "Software   : AutoCAD, ETABS, SAP2000 (Intermediate), STAAD Pro (Basic), MS Project",
        "corrected": "Software: AutoCAD, ETABS, SAP2000 (Intermediate), STAAD.Pro (Basic), MS Project",
        "type": "typo/formatting"
      },
      {
        "original": "Bengali : Native",
        "corrected": "Bengali: Native",
        "type": "spacing"
      },
      {
        "original": "English  : Good command in reading, writing and speaking",
        "corrected": "English: Good command in reading, writing and speaking",
        "type": "spacing"
      }
    ]
  },
  "action_items": [
    "Revise CAREER OBJECTIVE (Section: CAREER OBJECTIVE) to include a specific target role, industry segment, and one quantifiable strength; use the provided rewritten version as a baseline.",
    "Enhance PROJECT EXPERIENCE bullets (Capstone and Lab/Field Projects) with measurable outcomes (e.g., project scale, load capacities, reinforcement quantities, cost/schedule impact) to replace or augment generic statements.",
    "Standardize formatting across sections (Section: Formatting) by fixing spacing in the Software line and English proficiency line, and ensure consistent bullet style and capitalization for improved readability and ATS compatibility."
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer",
    "inferred_industry": "Construction/Infrastructure Engineering",
    "keyword_hits": [
      "structural engineer",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "STAAD Pro",
      "ACI 318-19",
      "BNBC 2020",
      "AASHTO LRFD",
      "Thesis",
      "Seismic",
      "reinforcement",
      "design",
      "project coordination",
      "G+7 Building",
      "cost estimate",
      "defence"
    ],
    "keyword_gaps": [
      "Revit",
      "reinforcement detailing (shop drawings) using Rebar/CSI",
      "finite element analysis (FEA) / advanced modeling"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading for international ATS parsing; may cause parsing issues for foreign recruiters.",
        "recommended": "Contact Information"
      },
      {
        "original": "DECLARATION",
        "issue": "Declaration section is uncommon in Western multinational ATS parsing and may be ignored.",
        "recommended": "Remove or replace with a brief Professional Statement or remove entirely"
      }
    ],
    "ats_tips": [
      "Replace non-standard headings (Personal Information, Declaration) with standard sections (Contact Information, Professional Profile) to improve ATS compatibility in international settings.",
      "Add a brief Professional Summary at the top (2–3 lines) incorporating target role keywords (structural engineer, seismic design, BNBC, ETABS, reinforcement) to boost keyword density.",
      "Quantify achievements in project bullets (e.g., 'designed X m tall building; reduced material cost by Y%; completed design within Z weeks') to improve scannability and impact."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 72
}