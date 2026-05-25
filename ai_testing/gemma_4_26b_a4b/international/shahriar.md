---
resume: shahriar
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 75.7
  token_count: 1355
  cost_usd: 0.0007584
  duration_seconds: 17.9
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume contains several traditional Bangladeshi CV conventions that are inappropriate for international or multinational applications. These elements occupy valuable space and can introduce unconscious bias. A formatting ceiling has been applied due to the high number of these elements.",
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
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Heading Risk",
        "issue": "The heading 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Replace 'Career Objective' with 'Professional Summary'."
      },
      {
        "section": "Heading Risk",
        "issue": "The heading 'Educational Qualification' is non-standard for international ATS systems.",
        "suggestion": "Replace 'Educational Qualification' with 'Education'."
      },
      {
        "section": "Heading Risk",
        "issue": "The heading 'Personal Information' is non-standard for international ATS systems.",
        "suggestion": "Replace 'Personal Information' with 'Contact Details' or remove it if details are already at the top."
      }
    ]
  },
  "content_quality": {
    "score": 92,
    "feedback": "The content is exceptionally strong for a senior engineering role. The candidate uses excellent quantification (MW, BDT, percentages, time reductions) which provides concrete evidence of impact.",
    "strengths": [
      "Excellent use of metrics and KPIs (e.g., 'reducing remote monitoring response time by 40%').",
      "Strong technical depth shown through specific standards (IEC 61850) and software (ETAP, DIgSILENT).",
      "Clear progression from Junior to Senior Engineer roles.",
      "Demonstrated leadership and project management experience."
    ],
    "weaknesses": [
      "The 'Professional Summary' (currently Objective) could be more punchy by focusing on achievements rather than what the candidate 'wants' to do.",
      "The 'Junior Electrical Engineer' section is slightly less quantified compared to the Senior role, though still acceptable."
    ]
  },
  "language_grammar": {
    "score": 98,
    "feedback": "The language is professional, technical, and uses strong action verbs. No significant grammatical errors were found. British English spelling is used correctly.",
    "issues": []
  },
  "action_items": [
    "Remove all personal demographic information (Parents' names, DOB, Religion, Marital Status) to align with international standards.",
    "Delete the 'Declaration' and 'References available upon request' sections to save space for more technical content.",
    "Rename 'Career Objective' to 'Professional Summary' and rewrite it to highlight your 8+ years of expertise rather than your goals.",
    "Rename 'Educational Qualification' to 'Education' and 'Personal Information' to 'Contact Details' to improve ATS parsing."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer",
    "inferred_industry": "Power & Energy / Electrical Engineering",
    "keyword_hits": [
      "132 kV substation",
      "SCADA",
      "IEC 61850",
      "ETAP",
      "AutoCAD Electrical",
      "DIgSILENT PowerFactory",
      "Protection and Relay Coordination",
      "EPC Project Management",
      "Power System Studies"
    ],
    "keyword_gaps": [
      "Grid Stability",
      "Load Flow Analysis",
      "Substation Automation Systems (SAS)"
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
      "Ensure technical skills like 'ETAP' and 'DIgSILENT' are not just in a list but are also mentioned within the context of your professional experience bullet points.",
      "Standardize section headings to ensure the parser correctly identifies your education and experience blocks."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 85
}
```