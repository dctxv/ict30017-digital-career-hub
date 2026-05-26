---
resume: rashed
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 61.6
  token_count: 1399
  cost_usd: 0.0007548
  duration_seconds: 22.7
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several traditional Bangladeshi CV conventions that are inappropriate for international or multinational applications. These elements introduce bias and waste space. A formatting ceiling has been applied due to the high number of non-standard personal information fields.",
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
        "section": "Heading",
        "issue": "Heading risk: 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Professional Summary'."
      },
      {
        "section": "Heading",
        "issue": "Heading risk: 'Educational Qualification' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Education'."
      },
      {
        "section": "Heading",
        "issue": "Heading risk: 'Personal Information' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Contact Details' or remove entirely if information is redundant."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "The content is academically strong and relevant for an entry-level structural engineering role. However, the project experience lacks sufficient quantification of results, and the 'Lab and Field Projects' section is too brief to demonstrate technical competency.",
    "strengths": [
      "Strong academic foundation with a relevant thesis topic (Seismic Vulnerability).",
      "Good technical skill set including industry-standard software like ETABS and AutoCAD.",
      "Relevant co-curricular leadership experience."
    ],
    "weaknesses": [
      "The 'Lab and Field Projects' section uses vague descriptions without mentioning specific tools, standards, or outcomes.",
      "Lack of quantification in the Capstone project (e.g., instead of 'prepared bill of quantities', specify the estimated project value or scale).",
      "The 'Career Objective' is generic and focuses on what the candidate wants rather than the value they bring to the employer."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional and clear. There are no major grammatical errors, though some bullet points could be more punchy.",
    "issues": []
  },
  "action_items": [
    "Remove all personal demographic information (Religion, Marital Status, Father/Mother's name, Blood Group, DOB) to align with international standards.",
    "Rewrite the 'Career Objective' into a 'Professional Summary' that highlights your expertise in structural analysis and software proficiency.",
    "Quantify the 'Lab and Field Projects' by mentioning specific software used or the specific parameters analyzed (e.g., 'Conducted soil investigation using [Specific Test Name] to determine bearing capacity for a [X] sq. ft. site').",
    "Remove the 'Declaration' and 'Signature' sections to save space for more detailed technical descriptions."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Structural Engineer",
    "inferred_industry": "Civil Engineering / Construction",
    "keyword_hits": [
      "Structural analysis",
      "Foundation design",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "ACI 318",
      "BNBC 2020",
      "Seismic Vulnerability",
      "Reinforcement plans"
    ],
    "keyword_gaps": [
      "Structural Modeling",
      "Load Analysis",
      "RCS/FEM"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading; contains demographic data that ATS/recruiters may discount.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove personal demographic information; international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Expand on technical software usage within the project descriptions to increase keyword density.",
      "Ensure all software skills are listed clearly without parenthetical qualifiers like '(Basic)' if possible, or integrate them into experience descriptions."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}
```