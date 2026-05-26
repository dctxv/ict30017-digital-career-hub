---
resume: shahriar
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 139.2
  token_count: 1267
  cost_usd: 0.0054465
  duration_seconds: 9.1
---

## Analysis Output

{
  "formatting": {
    "score": 52,
    "feedback": "The resume follows a traditional Bangladeshi layout which is incompatible with international multinational standards. It contains several demographic disclosures that introduce bias risks and uses non-standard headings that hinder ATS parsing.",
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
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Career Objective",
        "issue": "The heading 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Change heading to 'Professional Summary'."
      },
      {
        "section": "Educational Qualification",
        "issue": "The heading 'Educational Qualification' is non-standard for international ATS systems.",
        "suggestion": "Change heading to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 88,
    "feedback": "The professional experience section is exceptionally strong, featuring quantified achievements and specific technical contributions. The candidate demonstrates clear progression and leadership.",
    "strengths": [
      "Excellent use of metrics (e.g., 'reducing remote monitoring response time by 40%').",
      "Strong technical depth mentioning specific standards like IEC 61850 and tools like ETAP.",
      "Clear evidence of budgetary responsibility and project management (BDT 450 million procurement)."
    ],
    "weaknesses": [
      "The 'Personal Information' and 'Declaration' sections occupy nearly 20% of the page with irrelevant data.",
      "High school (SSC/HSC) details are unnecessary for a professional with 8+ years of experience.",
      "The 'Professional Summary' (Objective) is slightly wordy; it could be more punchy."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional, technical, and error-free. Action verbs are used effectively to start bullet points.",
    "issues": []
  },
  "action_items": [
    "Delete the 'Personal Information', 'Declaration', and 'Signature' sections entirely to comply with international privacy and anti-bias standards.",
    "Remove the SSC and HSC entries from the Education section; at this career stage, only your BUET degree is relevant.",
    "Rename 'Career Objective' to 'Professional Summary' and 'Educational Qualification' to 'Education' to improve ATS compatibility.",
    "Move 'Technical Skills' and 'Professional Certifications' higher up (below the Summary) to immediately highlight your specialized expertise to recruiters."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer",
    "inferred_industry": "Energy & Power Utilities",
    "keyword_hits": [
      "SCADA",
      "Substation Design",
      "IEC 61850",
      "ETAP",
      "AutoCAD Electrical",
      "Project Management",
      "Relay Coordination",
      "EPC",
      "MATLAB"
    ],
    "keyword_gaps": [
      "Grid Stability Analysis",
      "Renewable Energy Integration",
      "Smart Grid"
    ],
    "heading_risks": [
      {
        "original": "Educational Qualification",
        "issue": "Non-standard phrasing may cause ATS to miss degree details.",
        "recommended": "Education"
      },
      {
        "original": "Career Objective",
        "issue": "Outdated terminology; modern systems look for 'Summary'.",
        "recommended": "Professional Summary"
      },
      {
        "original": "Personal Information",
        "issue": "Contains data fields that international ATS systems are programmed to redact or flag as compliance risks.",
        "recommended": "Remove section"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion, marital status, or age to avoid legal liability.",
      "Remove the 'Signature' and 'Declaration' text; these are non-searchable and can confuse parsing algorithms looking for 'Skills' or 'Experience'.",
      "Ensure your LinkedIn profile URL is included in the contact header, as international recruiters use this to verify professional history."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 78
}