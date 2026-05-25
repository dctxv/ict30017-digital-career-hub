---
resume: sharmin_sultana
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 166.9
  token_count: 1236
  cost_usd: 0.0107835
  duration_seconds: 7.4
---

## Analysis Output

```json
{
  "formatting": {
    "score": 65,
    "feedback": "The resume follows a traditional Bangladeshi layout but suffers from several visual and structural inconsistencies. The use of 'EXPERIANCE' and 'INFORMATIONS' (plural) are noticeable errors. The score is capped due to the inclusion of extensive personal details and a declaration, which are standard in Bangladesh but less effective for digital/international applications.",
    "issues": [
      {
        "section": "WORK EXPERIANCE",
        "issue": "Spelling error in the section heading and inconsistent bullet point styles.",
        "suggestion": "Correct 'EXPERIANCE' to 'EXPERIENCE' and ensure all bullet points are perfectly aligned."
      },
      {
        "section": "Header",
        "issue": "The contact information is not visually separated from the name, making it look cluttered.",
        "suggestion": "Use bolding for your name and a slightly larger font size, then use a horizontal line to separate the header from the content."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "The resume lacks quantification and specific achievements. Most bullet points describe tasks ('Doing photocopying') rather than contributions or outcomes. As a candidate with over 2 years of experience, the content needs to move beyond 'assisting' and 'helping'.",
    "strengths": [
      "Relevant academic background (BBA in HRM) for the target roles.",
      "Experience in reputable local conglomerates (Partex, Bengal Group).",
      "Inclusion of both SSC and HSC details as expected by local employers."
    ],
    "weaknesses": [
      "The Career Objective is generic and lacks a value proposition. It uses phrases like 'get a good job' and 'work hard' which do not specify what you offer the employer.",
      "The 'Administrative Assistant' role lists very basic tasks like 'photocopying' which diminishes the professional level of the resume. It should focus on coordination and efficiency.",
      "Missing a References section. Bangladeshi employers, especially in large groups like Partex or Bengal, expect 2-3 named referees with full contact details.",
      "Missing an Extracurricular Activities section. For a 2020 graduate, listing club memberships or volunteer work is important to show leadership potential."
    ]
  },
  "language_grammar": {
    "score": 60,
    "feedback": "There are several spelling and grammatical errors that undermine professional credibility. Tense usage is inconsistent in the experience section.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "spelling"
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "corrected": "PERSONAL INFORMATION",
        "type": "grammar"
      },
      {
        "original": "I am hereby declared that all the informations",
        "corrected": "I hereby declare that all the information",
        "type": "grammar"
      },
      {
        "original": "Doing photocopying and scanning works",
        "corrected": "Managed document reproduction and digital archiving for the department.",
        "type": "phrasing"
      }
    ]
  },
  "action_items": [
    "Career Objective: Rewrite to focus on your skills. Suggested: 'BBA graduate in HRM with over 2 years of experience in administrative support and HR operations at leading industrial groups, seeking to leverage expertise in recruitment coordination and office management to drive efficiency.'",
    "Work Experience: Quantify your impact. Instead of 'Handling all office correspondence', use 'Managed daily correspondence for a department of 50+ employees, ensuring 100% timely delivery of official documents.'",
    "References: Add a References section with at least two named referees (e.g., your manager from Bengal Group and a professor from Daffodil University) including their designation, organization, and phone number.",
    "Education: Add the GPA denominator for SSC and HSC (e.g., 'GPA: 3.75/5.00') and include the Education Board (e.g., Dhaka Board) for both."
  ],
  "ats_analysis": {
    "inferred_role": "HR & Admin Officer",
    "inferred_industry": "Corporate / Manufacturing",
    "keyword_hits": [
      "HRM",
      "Recruitment",
      "Selection",
      "Attendance record",
      "Leave management",
      "Office correspondence",
      "MS Excel"
    ],
    "keyword_gaps": [
      "Payroll Processing",
      "Employee Relations",
      "HRIS"
    ],
    "heading_risks": [
      {
        "original": "WORK EXPERIANCE",
        "issue": "Spelling error may prevent ATS from identifying this as the experience section.",
        "recommended": "WORK EXPERIENCE"
      }
    ],
    "ats_tips": [
      "Correct all spelling errors in headings immediately, as these are the primary anchors for ATS parsing.",
      "Expand the 'Computer' skills to include specific tasks, such as 'Data Analysis in Excel' or 'Presentation Design in PowerPoint'.",
      "Use standard bullet points (circles or squares) rather than the small dots used, which can sometimes be misread by older OCR software."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 60
}
```
