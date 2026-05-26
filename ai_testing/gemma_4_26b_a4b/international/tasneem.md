---
resume: tasneem
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 109.3
  token_count: 1454
  cost_usd: 0.0007833
  duration_seconds: 13.3
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several traditional Bangladeshi CV conventions that are inappropriate for international or multinational applications. These elements consume significant space and introduce potential bias. A formatting ceiling has been applied due to the high number of non-standard personal information fields.",
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
        "issue": "Non-standard heading for international ATS.",
        "suggestion": "Change 'CAREER OBJECTIVE' to 'PROFESSIONAL SUMMARY'."
      },
      {
        "section": "Heading Risks",
        "issue": "Non-standard heading for international ATS.",
        "suggestion": "Change 'EDUCATIONAL QUALIFICATION' to 'EDUCATION'."
      },
      {
        "section": "Heading Risks",
        "issue": "Non-standard heading for international ATS.",
        "suggestion": "Change 'PERSONAL INFORMATION' to 'CONTACT DETAILS' (and remove the sensitive fields)."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "The candidate has strong, relevant experience in the development sector with reputable organizations. However, several bullet points in the junior roles are under-quantified and use passive language.",
    "strengths": [
      "Direct experience with major NGOs (CARE, ActionAid, BRAC).",
      "Specific mention of donor-funded projects (EU-funded).",
      "Relevant technical training (KoBoToolbox, LFA, M&E)."
    ],
    "weaknesses": [
      "Vague language in the Programme Assistant role: 'Assisted in conducting', 'Helped in documentation', 'Supported the project coordinator'.",
      "Lack of quantifiable impact in the Research Assistant role.",
      "The 'Career Objective' is generic and does not highlight specific value propositions."
    ]
  },
  "language_grammar": {
    "score": 92,
    "feedback": "The language is generally professional and clear. There are no major grammatical errors, though some action verbs could be strengthened.",
    "issues": [
      {
        "original": "Did data entry and basic analysis",
        "corrected": "Performed data entry and conducted basic statistical analysis",
        "type": "Weak Verb"
      },
      {
        "original": "Helped in documentation of case studies",
        "corrected": "Documented case studies and field stories",
        "type": "Weak Verb"
      }
    ]
  },
  "action_items": [
    "Remove all sensitive personal information (Religion, Marital Status, Parents' names, Blood Group, DOB) to align with international standards.",
    "Rewrite the 'Career Objective' into a 'Professional Summary' that highlights your years of experience and core expertise in livelihood and urban resilience.",
    "Quantify achievements in the 'Programme Assistant' role; for example, instead of 'Helped in documentation', use 'Documented X number of case studies for donor reports'.",
    "Replace passive verbs like 'Assisted with' or 'Supported' with strong action verbs like 'Facilitated', 'Coordinated', or 'Executed'."
  ],
  "ats_analysis": {
    "inferred_role": "Programme Officer / Development Professional",
    "inferred_industry": "Non-Profit / International Development",
    "keyword_hits": [
      "Livelihood",
      "Urban Resilience",
      "Participatory Rural Appraisal (PRA)",
      "Monitoring and Evaluation",
      "KoBoToolbox",
      "Logical Framework Analysis",
      "Gender-based violence"
    ],
    "keyword_gaps": [
      "Project Management Lifecycle",
      "Stakeholder Engagement",
      "Grant Management"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "PROFESSIONAL SUMMARY"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "EDUCATION"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "CONTACT DETAILS"
      }
    ],
    "ats_tips": [
      "Remove demographic information (Religion, Marital Status, etc.) as international ATS and recruiters may automatically discount resumes containing these fields to avoid bias.",
      "Incorporate more specific project management terminology to match high-level NGO job descriptions.",
      "Ensure the 'Skills' section is categorized (e.g., 'Technical Skills', 'Software', 'Languages') to improve parsing accuracy."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}
```