---
resume: farhana
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 153.7
  token_count: 1383
  cost_usd: 0.0056955
  duration_seconds: 9
---

## Analysis Output

{
  "formatting": {
    "score": 50,
    "feedback": "The resume heavily relies on traditional Bangladeshi CV conventions that are considered unprofessional and high-risk in international or multinational hiring contexts. The inclusion of extensive personal data and a declaration section significantly detracts from the professional presentation.",
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
    "feedback": "The resume shows a strong educational background (IBA, DU) and relevant FMCG experience, but the bullet points for the most recent role are inconsistent in their impact, and the junior role is significantly under-quantified.",
    "strengths": [
      "Strong academic credentials from top-tier institutions (IBA, University of Dhaka).",
      "Quantified achievement in the ACI role (e.g., 94% activation compliance, 17% increase in offtake)."
    ],
    "weaknesses": [
      "The Pran-RFL experience uses weak, passive language ('Helped in', 'Assisted', 'Did data collection') without stating outcomes.",
      "High school (SSC/HSC) details are unnecessary for a candidate with an MBA and 3 years of experience.",
      "The 'Personal Information' section takes up nearly 20% of the page with irrelevant data."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The language is generally clear and professional, though some action verbs are weak and repetitive.",
    "issues": [
      {
        "original": "Helped in planning below-the-line (BTL) activities",
        "corrected": "Supported the execution of below-the-line (BTL) campaigns",
        "type": "weak action verb"
      },
      {
        "original": "Did data collection work",
        "corrected": "Conducted data collection and analysis",
        "type": "weak action verb"
      }
    ]
  },
  "action_items": [
    "Delete the entire 'Personal Information' and 'Declaration' sections to align with international standards and free up space for professional content.",
    "Rename 'Career Objective' to 'Professional Summary' and rewrite it to focus on your value proposition rather than what you want from the company.",
    "Remove SSC and HSC details from the 'Educational Qualification' section; at this career stage, only university degrees are relevant.",
    "Quantify the Pran-RFL experience: replace 'Helped in planning' with specific metrics, such as the number of campaigns supported or the size of the survey conducted.",
    "Update 'Computer Skills' to 'Technical Skills' and include specific marketing tools or CRM software if applicable."
  ],
  "ats_analysis": {
    "inferred_role": "Brand Manager / Trade Marketing Executive",
    "inferred_industry": "FMCG (Fast-Moving Consumer Goods)",
    "keyword_hits": [
      "Trade Marketing",
      "Consumer Insights",
      "Brand Management",
      "BTL",
      "POSM",
      "Market Visit",
      "Google Analytics",
      "SPSS",
      "Offtake"
    ],
    "keyword_gaps": [
      "Market Share Analysis",
      "Budget Management",
      "Stakeholder Management"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard for international ATS; focuses on candidate needs rather than employer value.",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Redundant phrasing; ATS systems prefer simpler headers.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Contains high-risk demographic data that international recruiters are trained to avoid.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion, age, or marital status to avoid compliance risks.",
      "Replace the 'Signature' and 'Declaration' with a 'Skills' section that highlights core competencies like 'Market Research' or 'Campaign Strategy'.",
      "Ensure your contact information is at the very top; having it inside a 'Personal Information' block at the bottom can confuse some older ATS parsers."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 69
}