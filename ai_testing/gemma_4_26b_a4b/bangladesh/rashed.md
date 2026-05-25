---
resume: rashed
mode: bangladesh
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 50.7
  token_count: 846
  cost_usd: 0.0006353
  duration_seconds: 16.7
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume is well-structured and follows a logical flow. However, the score is capped due to the inclusion of several traditional Bangladeshi CV conventions (Personal Details, Declaration, and Photograph placeholder/style) which, while standard locally, are less common in modern digital-first international formats.",
    "issues": [
      {
        "section": "Overall Layout",
        "issue": "The use of traditional sections like 'Declaration' and extensive 'Personal Information' is standard for Bangladesh but may be viewed as unnecessary in international digital applications.",
        "suggestion": "For international roles, consider condensing the Personal Information section to only essential contact details to save space for technical content."
      }
    ]
  },
  "content_quality": {
    "score": 88,
    "feedback": "The resume is strong for a fresh graduate, particularly with the inclusion of a thesis title and specific project details. The technical skills are well-categorised. To improve, the 'Lab and Field Projects' could be more descriptive regarding the tools or specific outcomes achieved.",
    "strengths": [
      "Clear inclusion of thesis title and supervisor, which is vital for engineering roles.",
      "Strong co-curricular section demonstrating leadership (General Secretary).",
      "Good use of technical standards (BNBC, ACI, AASHTO) which adds credibility."
    ],
    "weaknesses": [
      "The 'Lab and Field Projects' section lacks specific outcomes or methodologies used (e.g., which software or specific testing equipment was used for soil investigation).",
      "The Career Objective is slightly generic."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional and uses appropriate technical terminology. No major grammatical errors were detected.",
    "issues": []
  },
  "action_items": [
    "In the 'Career Objective', replace generic phrases with a more specific value proposition, such as: 'Aspiring Structural Engineer seeking to leverage expertise in seismic vulnerability assessment and ACI 318-19 standards to contribute to high-rise infrastructure projects at [Company Name].'",
    "Expand the 'Lab and Field Projects' bullet points to include specific tools or results (e.g., 'Conducted soil investigation using Standard Penetration Test (SPT) to determine bearing capacity...').",
    "Ensure the 'Technical Skills' section includes the specific version of software if applicable, or more clearly defines the proficiency level for all listed tools."
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer",
    "inferred_industry": "Civil Engineering / Construction",
    "keyword_hits": [
      "Structural Analysis",
      "Foundation Design",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "STAAD Pro",
      "ACI 318",
      "BNBC 2020",
      "Seismic Vulnerability",
      "Reinforcement plans"
    ],
    "keyword_gaps": [
      "Revit",
      "Finite Element Analysis (FEA)",
      "RISA-3D"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Incorporate more specific engineering methodologies (e.g., 'Finite Element Method' or 'Load Path Analysis') into the Project Experience section.",
      "Ensure that the distinction between 'Software' and 'Standards' is maintained, as ATS often look for specific tool names as primary keywords."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 89
}
```