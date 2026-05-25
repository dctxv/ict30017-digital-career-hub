---
resume: shahriar
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 189.0
  token_count: 1092
  cost_usd: 0.0058426
  duration_seconds: 5.8
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows a high-standard professional layout typical for senior engineers in Bangladesh. It is clean, well-structured, and uses consistent indentation. The score is capped at 75 as an educational note because the inclusion of a signature line, declaration, and extensive personal data (Father's/Mother's name, Marital Status) can hinder parsing in international ATS systems used by multinational firms like ABB, Siemens, or GE.",
    "issues": [
      {
        "section": "Technical Skills",
        "issue": "The use of colons and manual spacing for alignment can sometimes be misread by basic ATS parsers.",
        "suggestion": "Ensure these are formatted in a simple bulleted list or a clear table with invisible borders to maintain alignment without using excessive spaces."
      }
    ]
  },
  "content_quality": {
    "score": 94,
    "feedback": "This is an exceptional resume for a senior professional. The content is highly quantified, demonstrating clear impact (e.g., 'reducing fault isolation time from 45 to 12 minutes'). It highlights a strong academic background (BUET) and significant experience with major industry players (PGCB, Energypac, Summit).",
    "strengths": [
      "Excellent quantification of achievements, using metrics like MW load, BDT value, and percentage reductions in outages.",
      "Strong technical depth, specifically mentioning international standards (IEC 61850) and specialized software (ETAP, DIgSILENT).",
      "Clear career progression from Junior Engineer to Senior Engineer with increasing levels of responsibility and leadership."
    ],
    "weaknesses": [
      "The References section uses 'available upon request', which is not the standard expectation for senior roles in the Bangladesh market, especially for government or large corporate sectors.",
      "While the PMP is mentioned as 'in progress', the resume lacks a section for 'Professional Memberships' (e.g., IEB membership number), which is often required for senior engineering roles in Bangladesh."
    ]
  },
  "language_grammar": {
    "score": 98,
    "feedback": "The language is highly professional, technical, and error-free. The use of strong action verbs (Designed, Supervised, Implemented, Mentored) is exemplary.",
    "issues": []
  },
  "action_items": [
    "References: Replace 'available upon request' with 2-3 named referees. Include their full name, designation, organization, and contact details (mobile and email). This is standard practice for senior roles in Bangladesh.",
    "Professional Memberships: Add your Institution of Engineers, Bangladesh (IEB) membership status and number (e.g., MIEB or FIEB), as this is a critical credential for senior engineers in the local market.",
    "Technical Skills: Since you have 8+ years of experience, consider adding a 'Core Competencies' section that highlights high-level strategic skills like 'Grid Modernization Strategy' or 'Regulatory Compliance (BPDB/PGCB)'.",
    "Personal Information: For international applications, consider removing the Father's/Mother's name and Marital Status to save space and align with global privacy standards."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer / Power Systems Manager",
    "inferred_industry": "Energy & Power / Utilities",
    "keyword_hits": [
      "Substation Design",
      "SCADA",
      "IEC 61850",
      "ETAP",
      "Power System Studies",
      "Protection and Relay Coordination",
      "EPC Project Management",
      "PMP",
      "Grid Modernisation",
      "Fault Isolation"
    ],
    "keyword_gaps": [
      "Renewable Energy Integration",
      "Smart Grid Technology",
      "Load Flow Analysis"
    ],
    "heading_risks": [
      {
        "original": "Personal Information",
        "issue": "Contains data that can trigger bias filters in Western ATS systems.",
        "recommended": "Remove for international roles; keep for BD government/banking roles."
      }
    ],
    "ats_tips": [
      "Ensure 'PMP' is listed as a standalone keyword in the Skills or Certifications section to ensure it is picked up by automated filters even if it is 'in progress'.",
      "Spell out 'Bangladesh University of Engineering and Technology' alongside 'BUET' to maximize keyword hits for prestigious institutional filters.",
      "Include the specific versions of software (e.g., 'ETAP 20.0') as some technical filters look for proficiency in the latest versions."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 91
}
```
