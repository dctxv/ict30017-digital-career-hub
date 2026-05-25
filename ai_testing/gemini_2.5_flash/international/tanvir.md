---
resume: tanvir
mode: international
model: gemini_2.5_flash
date: 2026-05-15
metadata:
  tokens_per_second: 160.1
  token_count: 1905
  cost_usd: 0.0055935
  duration_seconds: 11.9
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume contains several formatting elements that are not standard for international applications, significantly impacting its professional presentation. These include personal demographic details, a declaration section, and non-standard headings. While the overall layout is clean, the presence of these elements makes it unsuitable for Western hiring standards. For modern digital applications, it's crucial to present a concise, professional document focused solely on relevant qualifications and experience.",
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
    "score": 60,
    "feedback": "The resume provides a basic overview of academic qualifications and a single internship experience. However, the professional experience section lacks quantification and specific achievements, making it difficult for recruiters to assess the impact of the candidate's work. The career objective is generic and focuses on personal gain rather than value to the employer. There's also a lack of a strong summary or profile section to immediately highlight key skills and career aspirations.",
    "strengths": [
      "Clear chronological order for education and experience.",
      "Relevant academic background for a finance-related role."
    ],
    "weaknesses": [
      "Career objective is generic and self-focused, not tailored to a specific role or company.",
      "Professional experience bullet points are vague and lack quantification (e.g., 'Assisted in daily customer transaction processing' – how many? what was the outcome?).",
      "No 'Professional Summary' or 'About Me' section to quickly introduce the candidate's value proposition.",
      "Skills section is very basic and does not include any finance-specific software or analytical tools.",
      "Language proficiency is not quantified (e.g., 'Fairly good' is subjective).",
      "No mention of projects, extracurricular activities, or volunteer work that could demonstrate transferable skills."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The resume generally has good grammar and spelling. However, there are a few instances of informal phrasing and inconsistent capitalization that could be improved for a more professional tone.",
    "issues": [
      {
        "original": "To get a challenging job in a reputed bank or financial institution where I can utilize my knowledge and skills and build a bright career for myself.",
        "corrected": "To secure a challenging position in a reputable bank or financial institution, leveraging my knowledge and skills to contribute to organizational success.",
        "type": "word choice/professionalism"
      },
      {
        "original": "Result: CGPA 3.12 (out of 4.00)",
        "corrected": "CGPA: 3.12 out of 4.00",
        "type": "formatting/consistency"
      },
      {
        "original": "Result: GPA 4.50",
        "corrected": "GPA: 4.50",
        "type": "formatting/consistency"
      },
      {
        "original": "Result: GPA 4.25",
        "corrected": "GPA: 4.25",
        "type": "formatting/consistency"
      },
      {
        "original": "Bengali : Native",
        "corrected": "Bengali: Native",
        "type": "formatting/spacing"
      },
      {
        "original": "English  : Fairly good in reading and writing",
        "corrected": "English: Proficient in reading and writing",
        "type": "word choice/quantification"
      }
    ]
  },
  "action_items": [
    "Rewrite the 'CAREER OBJECTIVE' into a concise 'Professional Summary' (3-4 lines) that highlights key skills, experience, and career aspirations, focusing on what value you bring to an employer, not just what you want to gain.",
    "Quantify achievements in the 'PROFESSIONAL EXPERIENCE' section. For each bullet point, add numbers, metrics, or specific outcomes (e.g., 'Processed an average of X customer transactions daily, reducing wait times by Y%').",
    "Remove all personal demographic information (Father's Name, Mother's Name, Date of Birth, Gender, Religion, Marital Status, Blood Group) from the 'PERSONAL INFORMATION' section, as these are not standard for international applications and can introduce bias.",
    "Expand the 'COMPUTER SKILLS' section to include any finance-specific software, analytical tools (e.g., Bloomberg Terminal, financial modeling software), or advanced Excel functions relevant to finance roles. Also, consider adding soft skills.",
    "Change the heading 'EDUCATIONAL QUALIFICATION' to 'Education' and 'PERSONAL INFORMATION' to 'Contact Details' to align with international resume standards and improve ATS parsing."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Executive / Customer Service (Banking/Finance)",
    "inferred_industry": "Banking and Financial Services",
    "keyword_hits": [
      "Finance",
      "Customer Service",
      "transaction processing",
      "account opening",
      "KYC verification",
      "data entry",
      "reports",
      "MS Word",
      "MS Excel",
      "MS PowerPoint"
    ],
    "keyword_gaps": [
      "Financial Analysis",
      "Risk Management",
      "Compliance"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "This heading is outdated and less preferred by international ATS systems which look for a 'Professional Summary' or 'Summary'.",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "This heading is less common in international resumes and may not be optimally parsed by some ATS systems.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "This heading is non-standard for international resumes and contains information that should not be included. ATS systems expect 'Contact Details'.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Replace the 'CAREER OBJECTIVE' with a 'Professional Summary' that includes keywords relevant to your target roles (e.g., 'financial analysis', 'client relations', 'data management') to improve keyword matching.",
      "Integrate more specific financial keywords into your 'PROFESSIONAL EXPERIENCE' section by quantifying your achievements and detailing the financial context of your tasks (e.g., 'Assisted in processing X daily transactions, ensuring compliance with Y financial regulations').",
      "Remove all personal demographic information from the 'PERSONAL INFORMATION' section. International ATS systems and recruiters will likely remove or discount resumes containing such personal details, as they are irrelevant and can introduce bias."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 63
}
```