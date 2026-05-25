---
resume: tanvir
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 59.4
  token_count: 1490
  cost_usd: 0.00067158
  duration_seconds: 25.1
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows a traditional Bangladeshi CV format which is highly inappropriate for international or multinational applications. It contains numerous personal demographic fields that introduce bias and waste space. Additionally, the use of non-standard headings will hinder ATS parsing.",
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
        "issue": "The heading 'Career Objective' is non-standard for international ATS systems.",
        "suggestion": "Replace 'Career Objective' with 'Professional Summary'."
      },
      {
        "section": "Heading",
        "issue": "The heading 'Educational Qualification' is non-standard for international ATS systems.",
        "suggestion": "Replace 'Educational Qualification' with 'Education'."
      },
      {
        "section": "Heading",
        "issue": "The heading 'Personal Information' is non-standard for international ATS systems.",
        "suggestion": "Replace 'Personal Information' with 'Contact Details' or remove it entirely if details are already at the top."
      }
    ]
  },
  "content_quality": {
    "score": 35,
    "feedback": "The content is extremely thin and lacks the professional depth required for banking or finance roles. The internship experience is described using passive, non-impactful language that fails to demonstrate any specific achievements or technical proficiency.",
    "strengths": [
      "Relevant educational background in Finance."
    ],
    "weaknesses": [
      "The internship bullet points use vague language like 'Assisted in', 'Helped with', 'Supported', and 'Did data entry work' without any measurable outcomes or specific tools used.",
      "The 'Computer Skills' section is too generic; it lacks mention of specific financial software or advanced Excel functions (e.g., VLOOKUP, Pivot Tables) which are critical for banking.",
      "The 'Career Objective' is a cliché and does not communicate unique value to a recruiter.",
      "Lack of quantification: There are no numbers to indicate the volume of transactions processed or the scale of documentation handled."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The grammar is generally correct, but the vocabulary is weak and repetitive, which diminishes the professional tone.",
    "issues": [
      {
        "original": "Did data entry work for new account registration",
        "corrected": "Executed accurate data entry for new account registrations to ensure database integrity.",
        "type": "Weak Verb"
      },
      {
        "original": "Fairly good in reading and writing",
        "corrected": "Proficient in written and verbal English.",
        "type": "Unprofessional Phrasing"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information (Religion, Marital Status, Parents' names, Blood Group, DOB) to align with international standards.",
    "Rewrite the Professional Experience section using the STAR method (Situation, Task, Action, Result) and replace vague verbs like 'Assisted' with strong action verbs like 'Processed', 'Verified', or 'Managed'.",
    "Upgrade the Computer Skills section to include specific technical competencies relevant to finance, such as 'Advanced MS Excel (Pivot Tables, VLOOKUP)' or any banking software encountered during the internship.",
    "Replace the 'Career Objective' with a 'Professional Summary' that highlights your BBA in Finance and your practical experience in customer service/KYC."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Banking Professional / Customer Service Officer",
    "inferred_industry": "Banking & Financial Services",
    "keyword_hits": [
      "Finance",
      "KYC",
      "Customer Service",
      "Account opening",
      "Data entry"
    ],
    "keyword_gaps": [
      "Financial Analysis",
      "Compliance",
      "Risk Management"
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
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove personal demographic information; international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Quantify internship achievements (e.g., 'Processed 20+ customer transactions daily') to improve keyword relevance and impact.",
      "Expand the skills section to include industry-specific keywords like 'Compliance', 'KYC Verification', and 'Financial Reporting'."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 51
}
```