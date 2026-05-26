---
resume: rashed
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 246
  token_count: 1230
  cost_usd: 0.00262625
  duration_seconds: 5
---

## Analysis Output

{
  "formatting": {
    "score": 50,
    "feedback": "The resume follows a traditional Bangladeshi format which is unsuitable for international applications. It contains excessive personal data that violates privacy standards and occupies space better used for professional achievements.",
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
        "issue": "Religion is inappropriate for international resumes and can lead to discrimination.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
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
        "issue": "The heading 'Career Objective' is outdated.",
        "suggestion": "Change to 'Professional Summary'."
      },
      {
        "section": "Heading",
        "issue": "The heading 'Educational Qualification' is non-standard.",
        "suggestion": "Change to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The content is technically sound but lacks impact. It focuses on duties rather than outcomes. Quantifying the impact of your projects would significantly improve your profile.",
    "strengths": [
      "Clear technical skill set relevant to structural engineering.",
      "Strong academic background with a relevant thesis topic.",
      "Good inclusion of project-based experience."
    ],
    "weaknesses": [
      "Bullet points are descriptive rather than achievement-oriented.",
      "Lack of metrics (e.g., 'reduced design time by X%', 'managed a budget of Y').",
      "The 'Career Objective' is too narrow and focuses on what you want rather than what you offer the employer."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and clear. No major grammatical errors found.",
    "issues": []
  },
  "action_items": [
    "Remove all personal demographic information (Religion, Marital Status, Blood Group, Parents' names, DOB) to align with international standards.",
    "Replace 'Career Objective' with a 'Professional Summary' that highlights your technical proficiency in structural analysis and your ability to contribute to complex engineering projects.",
    "Quantify your project experience: instead of 'Developed structural drawings', use 'Produced structural drawings for a G+7 building, reducing design iteration time by 15% through efficient AutoCAD workflows'.",
    "Remove the 'Declaration' and 'References' sections; references should be provided only upon request."
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer",
    "inferred_industry": "Civil Engineering / Construction",
    "keyword_hits": [
      "Structural analysis",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "ACI 318",
      "Reinforcement plans",
      "Gravity load calculations"
    ],
    "keyword_gaps": [
      "Project Management",
      "BIM (Building Information Modeling)",
      "Quality Assurance"
    ],
    "heading_risks": [
      {
        "original": "Career Objective",
        "issue": "Outdated format for ATS.",
        "recommended": "Professional Summary"
      },
      {
        "original": "Educational Qualification",
        "issue": "Non-standard heading.",
        "recommended": "Education"
      },
      {
        "original": "Personal Information",
        "issue": "Contains non-professional data that can cause parsing errors.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems often discard resumes containing personal demographic data; remove all non-professional details to ensure your resume is not filtered out.",
      "Use standard headings like 'Education', 'Experience', and 'Skills' to ensure the ATS correctly parses your data.",
      "Incorporate industry-standard keywords like 'BIM' or 'Project Management' if you have relevant experience, as these are high-value search terms for recruiters."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 67
}