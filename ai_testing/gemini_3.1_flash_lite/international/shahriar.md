---
resume: shahriar
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 240.8
  token_count: 1156
  cost_usd: 0.00255725
  duration_seconds: 4.8
---

## Analysis Output

{
  "formatting": {
    "score": 55,
    "feedback": "The resume follows a clear chronological structure but is heavily burdened by outdated Bangladeshi CV conventions that are detrimental to international applications. The inclusion of personal demographic data and a declaration section consumes space that should be dedicated to professional achievements.",
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
      }
    ]
  },
  "content_quality": {
    "score": 85,
    "feedback": "The content is strong, particularly the quantification of engineering achievements. The use of metrics (MW, %, time reduction) is excellent. However, the 'Junior Electrical Engineer' section relies on slightly passive language.",
    "strengths": [
      "Strong use of metrics to demonstrate impact (e.g., 'reducing remote monitoring response time by 40%').",
      "Clear progression of responsibility from junior to senior roles.",
      "Relevant technical skills and standards are well-highlighted."
    ],
    "weaknesses": [
      "The 'Junior Electrical Engineer' section uses 'Performed' and 'Prepared', which are somewhat generic. These should be upgraded to more active verbs like 'Executed' or 'Optimized'.",
      "The 'References' section is unnecessary; international recruiters assume references are available upon request."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional and technically accurate. Commonwealth English spelling (e.g., 'programme', 'modernisation') is correctly applied.",
    "issues": []
  },
  "action_items": [
    "Delete the entire 'Personal Information' section (except for contact details) and the 'Declaration' section to align with international standards.",
    "Remove the 'References' section; this is standard practice and does not need to be stated.",
    "Rename 'Educational Qualification' to 'Education' and 'Career Objective' to 'Professional Summary' to improve ATS compatibility.",
    "Refine the 'Junior Electrical Engineer' bullet points to focus on outcomes rather than tasks (e.g., instead of 'Prepared reports', use 'Streamlined reporting processes to improve management visibility')."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer",
    "inferred_industry": "Power and Energy",
    "keyword_hits": [
      "132 kV substation",
      "SCADA",
      "IEC 61850",
      "ETAP",
      "AutoCAD Electrical",
      "Power System Studies",
      "EPC Project Management"
    ],
    "keyword_gaps": [
      "Grid Integration",
      "Renewable Energy",
      "Safety Compliance"
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
        "issue": "Contains non-standard, potentially biasing data.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove all personal demographic data (Religion, Marital Status, Parents' names). International ATS systems often flag or filter out resumes containing these fields to avoid compliance risks.",
      "Ensure your contact details are at the top; remove the full physical address, keeping only City and Country to protect privacy.",
      "Use standard section headings (Education, Professional Experience, Skills) to ensure the ATS correctly parses your career history."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 78
}