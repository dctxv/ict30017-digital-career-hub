---
resume: farhana
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 174.3
  token_count: 1260
  cost_usd: 0.005551
  duration_seconds: 7.2
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows traditional Bangladeshi formatting standards which are excellent for local corporate and banking sectors. However, the inclusion of a photograph placeholder, personal details, and a declaration section—while standard in Bangladesh—can trigger parsing issues in modern international ATS platforms. The score reflects a ceiling applied for these conventions in a digital context.",
    "issues": [
      {
        "section": "Professional Experience",
        "issue": "Inconsistent bullet point alignment and indentation between the ACI Limited and Pran-RFL entries.",
        "suggestion": "Ensure all bullet points are left-aligned with a consistent 0.25\" indentation from the margin."
      },
      {
        "section": "Personal Information",
        "issue": "The use of a colon-aligned list with varying tab spaces creates a jagged visual appearance.",
        "suggestion": "Use a two-column table (with invisible borders) to perfectly align the labels and the data."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "The resume shows a strong academic background from top-tier institutions (IBA, DU) and solid experience at a reputable local conglomerate. However, the descriptions for the 'Junior Executive' role are weak and lack impact, and the co-curricular section is underdeveloped for a candidate with an MBA from IBA.",
    "strengths": [
      "Strong academic pedigree with both BBA and MBA from University of Dhaka/IBA.",
      "Quantified achievements in the current role (e.g., 94% activation compliance, 17% increase in offtake).",
      "Clear career objective that specifies the target industry (FMCG) and role (Brand Management)."
    ],
    "weaknesses": [
      "The Junior Executive role uses passive language: 'Helped in planning', 'Assisted the team', and 'Did data collection work' without stating the outcome of these tasks.",
      "The Co-curricular Activities section is very thin. For an IBA graduate, employers expect to see specific roles, event organization, or competition participation (e.g., Battle of Minds).",
      "The 'Computer Skills' section lacks depth; 'MS Office Suite' is too generic for a marketing professional—mentioning Advanced Excel (VLOOKUPs, Pivot Tables) would be more effective."
    ]
  },
  "language_grammar": {
    "score": 92,
    "feedback": "The language is professional and generally error-free. The use of action verbs in the most recent role is good, but the previous role relies on 'weak' verbs that diminish the candidate's perceived authority.",
    "issues": [
      {
        "original": "Did data collection work for a consumer preference survey",
        "corrected": "Executed data collection for a consumer preference survey involving [X] respondents to identify market trends.",
        "type": "weak action verb"
      },
      {
        "original": "Helped in planning below-the-line (BTL) activities",
        "corrected": "Supported the planning and execution of below-the-line (BTL) activations for the Pran Juice product line.",
        "type": "weak action verb"
      }
    ]
  },
  "action_items": [
    "Professional Experience: Rewrite the Pran-RFL Group bullet points to include specific outcomes. Instead of 'Assisted with reports', use 'Analyzed competitor pricing and promotion strategies across Dhaka North to inform weekly sales tactics.'",
    "Co-curricular Activities: Expand this section. List specific responsibilities held at the Marketing Club or any case competitions/workshops attended during your MBA at IBA.",
    "Computer Skills: Specify your proficiency level in Excel. Mention specific functions like 'Pivot Tables, Data Visualization, and VLOOKUP' as these are critical for Trade Marketing and Brand Management.",
    "References: Add a phone number for both referees. While email is provided, Bangladeshi HR departments frequently prefer initial contact via mobile/telephone."
  ],
  "ats_analysis": {
    "inferred_role": "Brand Manager / Marketing Executive",
    "inferred_industry": "FMCG",
    "keyword_hits": [
      "Trade Marketing",
      "Consumer Insights",
      "Brand Management",
      "BTL",
      "Market Research",
      "Google Analytics",
      "SPSS",
      "Retail",
      "Campaign execution"
    ],
    "keyword_gaps": [
      "Brand Equity",
      "Market Share Analysis",
      "Digital Marketing Strategy"
    ],
    "heading_risks": [
      {
        "original": "Personal Information",
        "issue": "International ATS may misinterpret these fields as core resume content or flag for bias.",
        "recommended": "Keep for BD market; remove for international/remote roles."
      }
    ],
    "ats_tips": [
      "Quantify the 'consumer preference survey' in the Pran-RFL section (e.g., 'Surveyed 500+ consumers') to help the ATS identify data-handling capabilities.",
      "Ensure the 'Computer Skills' are listed as individual keywords rather than a string (e.g., 'Microsoft Excel' instead of just 'MS Office Suite') to hit specific software requirements.",
      "Move 'Technical Skills' or 'Computer Skills' higher up the resume, as ATS algorithms often prioritize keywords found in the top half of the document."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 77
}
```
