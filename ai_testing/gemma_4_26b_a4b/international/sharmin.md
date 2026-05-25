---
resume: sharmin
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 49.9
  token_count: 1617
  cost_usd: 0.0007905
  duration_seconds: 32.4
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several outdated Bangladeshi CV conventions that are inappropriate for international or multinational applications. The presence of extensive personal demographic information and a declaration section significantly reduces the professional standard and wastes valuable space.",
    "issues": [
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Heading risk: 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Professional Summary'."
      },
      {
        "section": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Heading risk: 'Educational Qualifications' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Education'."
      },
      {
        "section": "WORK EXPERIANCE",
        "issue": "Spelling error in heading: 'EXPERIANCE' should be 'EXPERIENCE'.",
        "suggestion": "Correct the spelling to 'Work Experience'."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Heading risk: 'Personal Information' is non-standard for international ATS systems.",
        "suggestion": "Replace with 'Contact Details' or remove the section entirely."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 40,
    "feedback": "The content is highly descriptive of tasks but lacks impact. Most bullet points describe duties rather than achievements and fail to use quantification (numbers, percentages, or scale) to demonstrate effectiveness.",
    "strengths": [
      "Relevant educational background in Human Resource Management.",
      "Directly related internship experience in a large group (Partex Group)."
    ],
    "weaknesses": [
      "Vague language: 'Helping HR team', 'Assisting in', 'Support in', and 'Doing photocopying' lack professional weight.",
      "Lack of quantification: There are no metrics regarding how many employees were managed, how many documents were processed, or the scale of events organized.",
      "Weak objective: The objective is self-centered ('I want to get a good job') rather than value-driven ('To leverage HR expertise to support [Company Name] goals')."
    ]
  },
  "language_grammar": {
    "score": 65,
    "feedback": "The language is generally understandable but contains spelling errors in headings and lacks the strong action verbs required for professional resumes.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "spelling"
      },
      {
        "original": "all the informations given above is correct",
        "corrected": "all the information provided above is correct",
        "type": "grammar"
      },
      {
        "original": "Helping HR team in recruitment",
        "corrected": "Supported the HR team during the recruitment and selection process",
        "type": "weak verb"
      },
      {
        "original": "Doing photocopying and scanning works",
        "corrected": "Managed document digitization and administrative filing tasks",
        "type": "unprofessional phrasing"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic data (Religion, Blood Group, Marital Status, Parents' names, DOB) to meet international standards.",
    "Rewrite the 'Career Objective' into a 'Professional Summary' that highlights your HR skills and what you can offer the employer.",
    "Quantify your experience in the 'Work Experience' section (e.g., 'Managed attendance for 100+ employees' instead of 'Maintaining employee attendance record').",
    "Replace passive/weak verbs like 'Helping', 'Assisting', and 'Doing' with strong action verbs like 'Coordinated', 'Facilitated', 'Executed', or 'Administered'."
  ],
  "ats_analysis": {
    "inferred_role": "HR Assistant / Administrative Assistant",
    "inferred_industry": "Human Resources / Administration",
    "keyword_hits": [
      "Human Resource Management",
      "Recruitment",
      "Selection process",
      "Attendance record",
      "Leave management",
      "Employee engagement",
      "Office correspondence",
      "Filing system",
      "Inventory records"
    ],
    "keyword_gaps": [
      "HRIS (Human Resources Information Systems)",
      "Onboarding",
      "Compliance"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "Non-standard heading and contains prohibited demographic data.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove personal demographic information; international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Incorporate specific HR software or tools (e.g., SAP, Oracle, or specific HRIS) if you have used them, as these are high-value keywords.",
      "Standardize section headings to ensure the parser correctly identifies your experience and education."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 53
}
```