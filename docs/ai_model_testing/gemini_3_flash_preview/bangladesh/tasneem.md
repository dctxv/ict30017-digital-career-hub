---
resume: tasneem
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 174.9
  token_count: 1183
  cost_usd: 0.00499395
  duration_seconds: 6.8
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows the standard Bangladeshi 'CV' format, which is highly effective for national NGOs and government-affiliated projects. It includes all expected sections such as Personal Information, Declaration, and References. The score is capped at 75 as an educational note because the inclusion of a signature line and extensive personal data can hinder parsing in international ATS systems used by global NGOs (e.g., UNDP, Save the Children).",
    "issues": [
      {
        "section": "Professional Experience",
        "issue": "The bullet points for the 'Programme Assistant' role use inconsistent indentation compared to the 'Programme Officer' role.",
        "suggestion": "Align all bullet points to the same left margin (e.g., 0.25\") to ensure a clean visual flow."
      }
    ]
  },
  "content_quality": {
    "score": 82,
    "feedback": "The content is strong, showing a clear progression from research assistant to programme officer within reputable organisations (CARE, ActionAid, BIGD). The inclusion of specific donor names (EU) and technical tools (PRA, ODK) adds significant value. However, the Career Objective is generic and the earlier roles lack quantified impact.",
    "strengths": [
      "Strong academic background from University of Dhaka in relevant fields (Economics/Development Studies).",
      "Specific mention of high-demand technical tools in the NGO sector like ODK, KoBoToolbox, and PRA.",
      "Clear evidence of field management experience (managing 8 enumerators)."
    ],
    "weaknesses": [
      "The Career Objective uses generic language ('challenging role', 'reputed organisation', 'grow professionally') without specifying a thematic focus like Urban Resilience or Gender Justice.",
      "The 'Programme Assistant' role uses passive language: 'Assisted in conducting', 'Helped in documentation', and 'Did data entry' without stating the scale or outcome of these tasks.",
      "The 'Research Assistant' role is under-described; it doesn't mention the number of FGDs conducted or the specific software used for data management."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and appropriate for the development sector. There are a few instances of weak phrasing in the earlier career sections.",
    "issues": [
      {
        "original": "Did data entry and basic analysis",
        "corrected": "Managed data entry and performed basic statistical analysis for quarterly M&E reports.",
        "type": "weak action verb"
      },
      {
        "original": "Helped in documentation of case studies",
        "corrected": "Documented 10+ case studies and field stories for donor narrative reports.",
        "type": "weak action verb"
      }
    ]
  },
  "action_items": [
    "Career Objective: Rewrite to be more specific. Suggested: 'Development professional with 4+ years of experience in urban resilience and gender justice, seeking a Programme Officer role to implement EU and USAID-funded livelihood projects using data-driven M&E tools.'",
    "Professional Experience: Quantify the 'Programme Assistant' role. Instead of 'Assisted in training', use 'Facilitated 15+ training sessions on GBV prevention for 300+ community members.'",
    "Training Section: Highlight the 'ODK and KoBoToolbox' training more prominently, as digital data collection is a high-priority skill for international NGOs.",
    "References: Ensure you include the mobile numbers for both referees, as Bangladeshi NGO recruiters often prefer a quick phone check over email."
  ],
  "ats_analysis": {
    "inferred_role": "Programme Officer / Development Practitioner",
    "inferred_industry": "NGO / International Development",
    "keyword_hits": [
      "Urban Resilience",
      "Livelihood",
      "Needs Assessment",
      "Participatory Rural Appraisal",
      "PRA",
      "M&E",
      "KoBoToolbox",
      "ODK",
      "Gender-based violence",
      "Donor reporting"
    ],
    "keyword_gaps": [
      "Project Cycle Management",
      "Grant Management",
      "Stakeholder Engagement"
    ],
    "heading_risks": [
      {
        "original": "Personal Information",
        "issue": "International ATS may flag this section for containing sensitive data not required in Western markets.",
        "recommended": "Keep for local NGOs; remove for UN/International HQ applications."
      }
    ],
    "ats_tips": [
      "Spell out 'Monitoring and Evaluation' alongside 'M&E' to ensure the ATS catches both versions of this critical keyword.",
      "Include the specific donor names (e.g., European Union, USAID) in the skills or summary section, as these are often used as search filters by recruiters.",
      "Ensure the 'Training' section uses the full name of the awarding body (e.g., 'NGO Affairs Bureau' instead of 'NGOAB') for better keyword recognition."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 81
}
```
