---
resume: rashed
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 146
  token_count: 1372
  cost_usd: 0.0056775
  duration_seconds: 9.4
---

## Analysis Output

{
  "formatting": {
    "score": 50,
    "feedback": "The resume follows a traditional Bangladeshi layout which is highly incompatible with international and multinational standards. It contains significant personal demographic data that introduces bias and uses non-standard section headings that hinder ATS readability.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The academic foundation is strong, particularly the thesis and capstone project. However, the descriptions are task-oriented rather than achievement-oriented. The technical skills section is well-categorized but lacks depth in terms of specific application.",
    "strengths": [
      "Strong academic background with a competitive CGPA from a reputable engineering university.",
      "Relevant thesis topic (Seismic Vulnerability) which is highly applicable to the Bangladesh context.",
      "Clear listing of industry-standard software like ETABS and SAP2000."
    ],
    "weaknesses": [
      "Project descriptions lack quantification (e.g., dimensions of the building, specific load values, or percentage of accuracy in seismic models).",
      "The 'Career Objective' is passive; it focuses on what the candidate wants rather than what they offer.",
      "Language proficiency is vague; 'Good command' is subjective compared to standardized scores like IELTS/TOEFL."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The language is generally professional and clear. There are minor inconsistencies in punctuation and a lack of strong action verbs in some project descriptions.",
    "issues": [
      {
        "original": "Good command in reading, writing and speaking",
        "corrected": "Proficient in written and spoken English",
        "type": "Grammar/Style"
      },
      {
        "original": "Developed structural drawings",
        "corrected": "Engineered detailed structural drawings",
        "type": "Vocabulary"
      }
    ]
  },
  "action_items": [
    "Replace 'Career Objective' with a 'Professional Summary' that highlights your expertise in seismic assessment and proficiency in ETABS/SAP2000.",
    "Delete the entire 'Personal Information' section (except for location) and the 'Declaration' section to align with international standards.",
    "Quantify the Capstone Design Project: Mention the total square footage of the G+7 building and the specific BNBC 2020 parameters used.",
    "Rename 'Educational Qualification' to 'Education' and move the Thesis details to a more prominent position under the degree.",
    "Update 'Technical Skills' to include specific modules or types of analysis performed (e.g., 'Non-linear static analysis' or 'Foundation design')."
  ],
  "ats_analysis": {
    "inferred_role": "Graduate Structural Engineer",
    "inferred_industry": "Civil Engineering / Construction",
    "keyword_hits": [
      "Structural analysis",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "BNBC 2020",
      "ACI 318",
      "Seismic Vulnerability Assessment",
      "Reinforcement plans"
    ],
    "keyword_gaps": [
      "Finite Element Analysis (FEA)",
      "Reinforced Concrete (RC) Design",
      "Foundation Engineering"
    ],
    "heading_risks": [
      {
        "original": "Career Objective",
        "issue": "Non-standard for international ATS; may be ignored.",
        "recommended": "Professional Summary"
      },
      {
        "original": "Educational Qualification",
        "issue": "Redundant phrasing; ATS systems look for 'Education'.",
        "recommended": "Education"
      },
      {
        "original": "Personal Information",
        "issue": "Contains sensitive data that international ATS systems are often programmed to redact or flag as a compliance risk.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion, age, or marital status due to labor law compliance.",
      "Use standard headings like 'Education' and 'Experience' to ensure the parser correctly categorizes your background.",
      "Avoid using tables or multi-column layouts for personal data; use simple text strings for contact information."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 66
}