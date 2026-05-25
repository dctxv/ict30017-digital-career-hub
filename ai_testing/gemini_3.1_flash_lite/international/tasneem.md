---
resume: tasneem
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 230.6
  token_count: 1245
  cost_usd: 0.00267875
  duration_seconds: 5.4
---

## Analysis Output

{
  "formatting": {
    "score": 55,
    "feedback": "The resume follows a traditional Bangladeshi format which is unsuitable for international applications. It contains multiple non-standard sections and personal details that are discouraged in global recruitment to prevent bias and ensure privacy.",
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
        "section": "Personal Information",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
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
    "feedback": "The professional experience section shows strong domain knowledge, but the earlier roles (Programme Assistant and Research Assistant) rely on passive language that diminishes your impact.",
    "strengths": [
      "Clear progression in the development sector.",
      "Strong technical toolset (KoBoToolbox, ODK, SPSS).",
      "Relevant academic background for the target industry."
    ],
    "weaknesses": [
      "The 'Programme Assistant' role uses weak verbs like 'Assisted in', 'Helped in', and 'Did data entry'.",
      "Lack of quantifiable outcomes in the earlier roles (e.g., how many people were trained, what was the scale of the data entry).",
      "The 'Career Objective' is generic; it should be replaced with a 'Professional Summary' that highlights your specific value proposition."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and clear. The use of British English (e.g., 'programme', 'utilising') is appropriate for international development organizations.",
    "issues": []
  },
  "action_items": [
    "Delete the 'Personal Information' section entirely, keeping only your name, phone, email, and LinkedIn profile (if available).",
    "Replace 'Career Objective' with a 'Professional Summary' that summarizes your 4+ years of experience in urban resilience and livelihood programming.",
    "Rewrite bullet points for 'Programme Assistant' to focus on results. Instead of 'Assisted in conducting training', use 'Facilitated training sessions for 150+ community members, resulting in a 20% increase in awareness of gender-based violence protocols'.",
    "Remove the 'Declaration' and 'References' sections. References should be provided only upon request."
  ],
  "ats_analysis": {
    "inferred_role": "Programme Officer (Development/NGO)",
    "inferred_industry": "International Development / NGO",
    "keyword_hits": [
      "Development Studies",
      "Livelihood",
      "Urban Resilience",
      "Participatory Rural Appraisal",
      "Donor reporting",
      "SPSS",
      "KoBoToolbox",
      "Monitoring and Evaluation"
    ],
    "keyword_gaps": [
      "Stakeholder Engagement",
      "Budget Management",
      "Grant Writing"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading; ATS systems prefer professional summaries.",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading; contains data that should be removed.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems often automatically parse and discard resumes containing demographic data (religion, marital status, etc.). Remove these to ensure your resume is not filtered out.",
      "Use standard section headings like 'Professional Experience', 'Education', and 'Skills' to ensure the ATS correctly categorizes your information.",
      "Quantify your achievements in the 'Programme Assistant' role to ensure you pass keyword-based screening for 'Project Management' or 'Impact Assessment' criteria."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 68
}