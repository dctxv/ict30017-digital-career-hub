---
resume: rashed
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 139.9
  token_count: 1119
  cost_usd: 0.0051465
  duration_seconds: 8
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows traditional Bangladeshi formatting standards which are excellent for local corporate and government roles. However, the inclusion of personal details, a declaration, and a signature line creates a score ceiling for modern digital/international applications.",
    "issues": [
      {
        "section": "Header",
        "issue": "Inconsistent spacing in the mobile number format.",
        "suggestion": "Use a consistent format like +880 1956-374512."
      },
      {
        "section": "Educational Qualification",
        "issue": "Missing Education Board names for SSC and HSC entries.",
        "suggestion": "Add 'Board: Chittagong' to both the HSC and SSC sections as per local recruitment standards."
      }
    ]
  },
  "content_quality": {
    "score": 82,
    "feedback": "The resume is strong for a fresh graduate, featuring a relevant thesis and capstone project. The inclusion of specific codes (BNBC 2020, ACI 318) is excellent. However, the project descriptions lack specific quantitative outcomes.",
    "strengths": [
      "Includes a specific thesis title and supervisor, which is highly valued in Bangladeshi engineering roles.",
      "Strong academic record with clear CGPA/GPA denominators.",
      "Excellent co-curricular section showing leadership (General Secretary) and industry engagement."
    ],
    "weaknesses": [
      "The Career Objective is slightly generic regarding the 'value proposition'.",
      "Project descriptions use 'Developed' and 'Prepared' without mentioning the scale or complexity of the results (e.g., total area of the G+7 building).",
      "Language proficiency uses 'Good command' which is subjective compared to standardized levels."
    ]
  },
  "language_grammar": {
    "score": 92,
    "feedback": "The language is professional and clear. Only minor inconsistencies in punctuation and phrasing were noted.",
    "issues": [
      {
        "original": "Good command in reading, writing and speaking",
        "corrected": "Proficient in reading, writing, and speaking",
        "type": "Grammar/Style"
      },
      {
        "original": "Organised Annual Civil Engineering Week",
        "corrected": "Organized Annual Civil Engineering Week",
        "type": "Note: Commonwealth spelling is accepted; no change required."
      }
    ]
  },
  "action_items": [
    "Educational Qualification: Add the 'Education Board' (e.g., Chittagong Board) to the SSC and HSC entries to meet standard Bangladeshi application requirements.",
    "Project Experience: Quantify the 'Capstone Design Project' by adding the total square footage or specific structural challenges overcome (e.g., 'Designed for wind speeds of 250km/h per BNBC 2020').",
    "Career Objective: Rewrite to highlight your specific thesis expertise. Suggested: 'Aspiring Structural Engineer with a strong foundation in seismic vulnerability assessment and BNBC 2020 compliance, seeking to contribute technical design skills to a leading infrastructure firm.'",
    "Technical Skills: Specify your level of proficiency for AutoCAD (e.g., 2D & 3D Drafting) to distinguish from basic users."
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer (Entry Level)",
    "inferred_industry": "Civil Engineering / Construction",
    "keyword_hits": [
      "Structural Analysis",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "BNBC 2020",
      "ACI 318",
      "Seismic Vulnerability",
      "Foundation Design",
      "Bill of Quantities"
    ],
    "keyword_gaps": [
      "Reinforced Concrete (RC) Design",
      "Steel Structure Design",
      "Site Supervision"
    ],
    "heading_risks": [
      {
        "original": "Personal Information",
        "issue": "ATS systems in Western markets may flag this for bias/privacy; however, it is standard in Bangladesh.",
        "recommended": "Keep for local roles; remove for international/remote roles."
      }
    ],
    "ats_tips": [
      "Ensure the 'Technical Skills' section uses a simple list format rather than a table or complex colon-spacing to ensure all software names are parsed correctly.",
      "Add 'Civil Engineering' as a keyword in your skills or summary, as some ATS filters look for the degree name as a skill keyword.",
      "Remove the 'Signature' and 'Declaration' lines if applying to multinational firms via online portals, as these are often read as 'junk' text by parsers."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 85
}