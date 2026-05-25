---
resume: rashed
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 187.0
  token_count: 1050
  cost_usd: 0.007225
  duration_seconds: 5.6
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows the standard Bangladeshi engineering format, which is highly effective for local firms like DDC or Sheltech. It includes all expected sections (Personal Details, Declaration, References). The score is capped at 75 as an educational note because the inclusion of a signature line, declaration, and extensive personal data can hinder parsing in international ATS systems used by multinational consultants.",
    "issues": [
      {
        "section": "Technical Skills",
        "issue": "The use of colons to separate categories (Software, Standards) is clear, but the alignment is slightly inconsistent with the rest of the document.",
        "suggestion": "Use a consistent tab stop for all skill categories to ensure the software list and standards list start at the same horizontal position."
      }
    ]
  },
  "content_quality": {
    "score": 88,
    "feedback": "This is an excellent entry-level engineering resume. It highlights a strong CGPA from a top engineering university (CUET) and includes a specific thesis title and capstone project, which are critical for structural engineering roles in Bangladesh.",
    "strengths": [
      "Specific mention of the BNBC 2020 and ACI 318 codes, which are essential for structural design in Bangladesh.",
      "Quantified co-curricular achievements (e.g., 'Organised Annual Civil Engineering Week attended by 400+ students').",
      "Clear inclusion of both SSC and HSC results with full details as expected by local employers."
    ],
    "weaknesses": [
      "The 'Lab and Field Projects' section is a bit brief. It mentions 'Soil investigation' but doesn't specify the methods used (e.g., SPT, Borehole logging).",
      "The Career Objective is good but could be more specific about the type of structures (e.g., high-rise, bridges, or industrial) the candidate is interested in."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is precise and technically sound. Action verbs like 'Developed', 'Performed', and 'Organised' are used correctly.",
    "issues": [
      {
        "original": "Good command in reading, writing and speaking",
        "corrected": "Good command of reading, writing, and speaking",
        "type": "preposition error"
      }
    ]
  },
  "action_items": [
    "Project Experience: In the 'Lab and Field Projects' section, add the specific tools or methods used for the soil investigation (e.g., 'Conducted Standard Penetration Test (SPT) and laboratory testing to determine bearing capacity').",
    "Technical Skills: Move 'ETABS' and 'SAP2000' to the front of the software list if applying for structural roles, as these are the most sought-after keywords in the industry.",
    "Career Objective: Refine the objective to mention a specific interest. Example: 'To begin a career as a structural engineer... with a focus on seismic-resistant design and high-rise structures.'",
    "Academic Qualification: Ensure the Education Board (e.g., Chittagong Board) is explicitly mentioned for both SSC and HSC to meet standard local requirements."
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
      "Finite Element Analysis (FEA)"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Include the full name of the codes alongside the abbreviations (e.g., 'Bangladesh National Building Code (BNBC) 2020') to ensure the ATS catches both variations.",
      "Add 'Civil Engineering' as a standalone keyword in a 'Core Competencies' section to improve searchability for general engineering roles.",
      "Ensure the 'Project Experience' section uses standard bullet points rather than the current indentation style to ensure the text is parsed correctly as 'Experience'."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 88
}
```
