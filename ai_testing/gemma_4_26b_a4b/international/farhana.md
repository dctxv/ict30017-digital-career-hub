---
resume: farhana
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 63.4
  token_count: 1490
  cost_usd: 0.0007791
  duration_seconds: 23.5
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several traditional Bangladeshi CV conventions that are inappropriate for international or multinational applications. These elements introduce bias and waste space. A formatting score ceiling of 55 has been applied due to the high number of demographic inclusions.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Heading Risks",
        "issue": "The heading 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Professional Summary'."
      },
      {
        "section": "Heading Risks",
        "issue": "The heading 'Educational Qualification' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Education'."
      },
      {
        "section": "Heading Risks",
        "issue": "The heading 'Personal Information' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Contact Details' or remove the section entirely if it only contains demographic data."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The candidate has strong foundational experience in trade marketing with some good quantification in the most recent role. However, the junior role is significantly under-developed and relies on weak, non-impactful verbs.",
    "strengths": [
      "Good use of metrics in the ACI Limited role (94% activation, 17% increase in offtake).",
      "Clear progression from Junior Executive to Executive.",
      "Strong educational background from reputable institutions."
    ],
    "weaknesses": [
      "The 'Junior Executive' role uses vague language: 'Helped in planning', 'Assisted the team', and 'Did data collection work'.",
      "Lack of specific outcomes or metrics in the Pran-RFL Group section.",
      "The 'Professional Experience' section for ACI Limited could benefit from more emphasis on 'how' results were achieved (e.g., specific tools or strategies used)."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally professional and clear. There are no major spelling errors, but some bullet points in the junior role lack professional vigor.",
    "issues": [
      {
        "original": "Did data collection work for a consumer preference survey",
        "corrected": "Executed data collection for a consumer preference survey to identify market trends",
        "type": "Weak Action Verb"
      },
      {
        "original": "Helped in planning below-the-line (BTL) activities",
        "corrected": "Coordinated the planning and execution of below-the-line (BTL) activities",
        "type": "Weak Action Verb"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information (Religion, Marital Status, Blood Group, Parents' names, DOB) to align with international standards.",
    "Rewrite the 'Junior Executive' bullet points using strong action verbs (e.g., 'Executed', 'Analyzed', 'Coordinated') and attempt to add any available metrics.",
    "Replace 'Career Objective' with a 'Professional Summary' that highlights your years of experience and key achievements.",
    "Remove the 'Declaration' and 'Signature' section to save space for more impactful professional content."
  ],
  "ats_analysis": {
    "inferred_role": "Trade Marketing Executive",
    "inferred_industry": "FMCG (Fast-Moving Consumer Goods)",
    "keyword_hits": [
      "Trade Marketing",
      "Consumer Insights",
      "Brand Management",
      "BTL activities",
      "Distribution",
      "POSM",
      "Market Research"
    ],
    "keyword_gaps": [
      "Channel Management",
      "Market Share Analysis",
      "Sales Forecasting"
    ],
    "heading_risks": [
      {
        "original": "Career Objective",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Professional Summary"
      },
      {
        "original": "Educational Qualification",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Education"
      },
      {
        "original": "Personal Information",
        "issue": "Non-standard heading; often contains irrelevant data that can confuse parsing.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove personal demographic information; international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Quantify the 'Junior Executive' role with specific numbers or percentages to ensure the ATS recognizes the depth of your experience.",
      "Incorporate more specific technical skills related to FMCG, such as 'Channel Strategy' or 'Category Management', to increase keyword density."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 68
}
```