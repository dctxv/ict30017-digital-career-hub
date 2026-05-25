---
resume: rashed
mode: international
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 115.8
  token_count: 11112
  cost_usd: 0.0045905
  duration_seconds: 96
---

## Analysis Output

{
  "formatting": {
    "score": 68,
    "feedback": "The resume contains several BD-centric conventions (multiple addresses, personal demographics, declaration) that reduce suitability for international ATS. It also uses non-standard headings and dense Personal Information content. Suggested restructuring: keep a single, concise Contact Details block; remove all demographic data (parents, birth date, religion, marital status, blood group); remove Declaration; consolidate addresses; replace non-standard headings with standard ones.",
    "issues": [
      {
        "section": "Personal Information - Father's Name",
        "issue": "Including a parent's name on an international resume introduces bias and is not expected.",
        "suggestion": "Remove father's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information - Mother's Name",
        "issue": "Including a parent's name on an international resume introduces bias and is not expected.",
        "suggestion": "Remove mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information - Date of Birth",
        "issue": "Date of birth can lead to age discrimination in international hiring.",
        "suggestion": "Remove Date of Birth / Age from the resume."
      },
      {
        "section": "Personal Information - Religion",
        "issue": "Disclosing religion on a resume can lead to discrimination in international contexts.",
        "suggestion": "Remove religion from Personal Information."
      },
      {
        "section": "Personal Information - Marital Status",
        "issue": "Marital status is personal information not used in international applications.",
        "suggestion": "Remove marital status from Personal Information."
      },
      {
        "section": "Personal Information - Blood Group",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from Personal Information."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are Bangladeshi conventions not used in international resumes and waste page space.",
        "suggestion": "Remove the Declaration section."
      },
      {
        "section": "Personal Information - Address details",
        "issue": "Present and permanent addresses reflect local conventions; international resumes typically list a city/location only.",
        "suggestion": "Consolidate to a single location line (e.g., City, Country) and remove street-level addresses."
      },
      {
        "section": "Heading risk - Career Objective",
        "issue": "Career Objective is non-standard for international ATS and may be ignored or parsed poorly.",
        "suggestion": "Replace with a Professional Summary."
      },
      {
        "section": "Heading risk - Educational Qualification",
        "issue": "Educational Qualification is non-standard for international ATS and may be misparsed.",
        "suggestion": "Rename to Education."
      },
      {
        "section": "Heading risk - Personal Information",
        "issue": "Personal Information is non-standard for international ATS and may be misparsed.",
        "suggestion": "Rename to Contact Details."
      }
    ]
  },
  "content_quality": {
    "score": 74,
    "feedback": "Strengths: clear objective aligned to civil/structural engineering; solid academic background with a seismic-focused thesis; hands-on capstone project with code references; relevant software exposure; leadership and extracurricular involvement. Weaknesses: lacks quantified outcomes in project bullets; no explicit internship/work experience; heavy emphasis on demographics in a BD format; inconsistent formatting in Education/Projects; no dedicated certifications or professional affiliations.",
    "strengths": [
      "Objective aligned with Civil/Structural Engineering roles",
      "Thesis on seismic vulnerability demonstrates domain interest",
      "Capstone project details structural design, code references (ACI 318-19)",
      "Technical toolkit includes AutoCAD, ETABS, SAP2000, STAAD Pro, MS Project",
      "Co-curricular leadership and industry engagement"
    ],
    "weaknesses": [
      "Bullets in projects lack quantified outcomes (e.g., loads, sizes, time savings, cost impact)",
      "No explicit internship or industry experience listed",
      "Personal Information section contains demographic data not suitable for international apps",
      "Education section could be reorganized with consistent formatting and dates",
      "References and Declaration may be omitted or moved to a separate document"
    ]
  },
  "language_grammar": {
    "score": 72,
    "feedback": "Mostly clear, but several stylistic and punctuation improvements are needed. Avoid long run-on sentences; standardize punctuation and terminology; fix minor typographic inconsistencies.",
    "issues": [
      {
        "original": "To begin a career as a structural engineer at a reputable construction or infrastructure consultancy firm in Bangladesh, applying knowledge in structural analysis, foundation design, and project coordination developed during undergraduate studies at CUET.",
        "corrected": "Professional Summary: Civil Engineer specializing in structural analysis, foundation design, and project coordination, seeking a role in a dynamic construction or infrastructure consultancy.",
        "type": "stylistic/clarity"
      },
      {
        "original": "Capstone Design Project – Structural Design of a G+7 Commercial Building (Group)",
        "corrected": "Capstone Design Project: Structural Design of a G+7 Commercial Building (Group project).",
        "type": "punctuation/formatting"
      },
      {
        "original": "  • Developed structural drawings and detailed reinforcement plans using AutoCAD",
        "corrected": "Developed structural drawings and reinforcement detailing using AutoCAD.",
        "type": "wording"
      },
      {
        "original": "Software   : AutoCAD, ETABS, SAP2000 (Intermediate), STAAD Pro (Basic), MS Project",
        "corrected": "Software: AutoCAD, ETABS, SAP2000 (Intermediate), STAAD.Pro (Basic), MS Project.",
        "type": "typo/consistency"
      },
      {
        "original": "General Secretary, CUET Civil Engineering Association (2021–2022) – Organised Annual Civil Engineering Week attended by 400+ students and 12 industry guests",
        "corrected": "General Secretary, CUET Civil Engineering Association (2021–2022) – Organized the Annual Civil Engineering Week, engaging 400+ students and 12 industry guests.",
        "type": "spelling/consistency"
      },
      {
        "original": "[redacted PII: Personal Information block containing addresses]",
        "corrected": "Location: City, Country",
        "type": "redaction"
      },
      {
        "original": "Present Address  : Road 12, House 7A, Uttara Sector 6, Dhaka-1230",
        "corrected": "Location: Dhaka, Bangladesh",
        "type": "redaction"
      },
      {
        "original": "English  : Good command in reading, writing and speaking",
        "corrected": "English: Good command in reading, writing and speaking.",
        "type": "typo"
      }
    ]
  },
  "action_items": [
    "Replace CAREER OBJECTIVE with a Professional Summary in the Career section and rewrite to highlight key strengths and goals.",
    "Remove all Personal Information demographic data (Father's/Mother's name, Date of Birth, Religion, Marital Status, Blood Group) and consolidate contact details into a single 'Contact Details' line.",
    "Rename 'EDUCATIONAL QUALIFICATION' to 'Education' and standardize its formatting (institution, degree, dates, GPA) with consistent punctuation.",
    "Enhance PROJECT EXPERIENCE bullets by adding measurable outcomes (e.g., load capacities, reinforcement sizes, cost estimates, time savings) and clearly state your role and impact.",
    "Add an Internship/Industry Experience section if applicable, or expand the Capstone/Lab projects with specific results; ensure all section headings use standard, ATS-friendly labels."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Structural Engineer",
    "inferred_industry": "Construction / Civil Engineering / Structural Consultancy",
    "keyword_hits": [
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "STAAD Pro",
      "MS Project",
      "ACI 318-19",
      "BNBC 2020",
      "AASHTO LRFD",
      "Soil investigation",
      "bearing capacity",
      "Seismic Vulnerability",
      "Capstone Design Project",
      "G+7 Building",
      " MATLAB (Basic)"
    ],
    "keyword_gaps": [
      "Revit/BIM",
      "Primavera P6 (or advanced scheduling)",
      "Advanced Excel for cost estimation / BOQ analysis"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading for international ATS; may be ignored or parsed poorly.",
        "recommended": "Replace with 'Professional Summary'."
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading for international ATS; may be misparsed.",
        "recommended": "Rename to 'Education'."
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading for international ATS; may be misparsed.",
        "recommended": "Rename to 'Contact Details'."
      },
      {
        "original": "DECLARATION",
        "issue": "Not used in Western ATS; takes up space.",
        "recommended": "Remove declaration (or place a brief 'References available on request' line)."
      }
    ],
    "ats_tips": [
      "Consolidate all contact information into a single 'Contact Details' section and remove demographic data.",
      "Replace non-standard headings (Career Objective, Educational Qualification, Personal Information) with ATS-friendly equivalents (Professional Summary, Education, Contact Details).",
      "Add a dedicated 'Skills' section with ATS-friendly keywords (e.g., BIM software, scheduling tools, analysis methods) and ensure consistent formatting."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}