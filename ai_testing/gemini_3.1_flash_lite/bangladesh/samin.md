---
resume: samin
mode: bangladesh
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 208.3
  token_count: 1000
  cost_usd: 0.002493
  duration_seconds: 4.8
---

## Analysis Output

{
  "formatting": {
    "score": 70,
    "feedback": "The resume is clean and logically structured. However, it lacks several standard sections expected by Bangladeshi employers, which impacts the overall score. Please note that for modern digital applications, the inclusion of specific personal details and a declaration is standard in the Bangladesh market.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Missing mandatory personal details (Father's name, Mother's name, NID, etc.)",
        "suggestion": "Add a 'Personal Details' section containing Father's Name, Mother's Name, Date of Birth, Marital Status, and NID/Passport number."
      },
      {
        "section": "References",
        "issue": "No References section provided.",
        "suggestion": "A References section with at least two named referees including their designation, organisation, and contact details is expected by most Bangladesh employers."
      },
      {
        "section": "Declaration",
        "issue": "Missing formal declaration.",
        "suggestion": "Add a 'Declaration' section at the end of the CV stating that you are responsible for the accuracy of the information provided."
      }
    ]
  },
  "content_quality": {
    "score": 85,
    "feedback": "The content is technically strong and well-quantified in terms of research impact. However, it lacks a Career Objective, which is a standard expectation in the Bangladesh job market.",
    "strengths": [
      "Excellent quantification of research impact (e.g., acceptance rates, specific tool outcomes).",
      "Clear and logical progression of professional experience.",
      "Strong technical skills section tailored to security research."
    ],
    "weaknesses": [
      "Missing a Career Objective section.",
      "The 'Experience' section for KONA uses vague verbs like 'Develop' and 'Design' without specific metrics or outcomes.",
      "Missing SSC and HSC results (required for candidates with less than 5 years of work experience in the Bangladesh market)."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and academic. No major grammatical errors found.",
    "issues": [
      {
        "original": "softwares",
        "corrected": "software",
        "type": "Grammar"
      },
      {
        "original": "industry graded tools",
        "corrected": "industry-grade tools",
        "type": "Grammar"
      }
    ]
  },
  "action_items": [
    "Add a 'Career Objective' section that highlights your expertise in systems security and your goal to contribute to a leading organization in Bangladesh.",
    "Include a 'References' section with at least two professional contacts (Name, Designation, Organization, Phone, Email).",
    "Expand the 'Education' section to include SSC and HSC details (Board, Year, GPA/5.00) as per local recruitment standards.",
    "Rewrite the KONA experience bullet points to include specific outcomes (e.g., 'Reduced API latency by X%' or 'Successfully deployed Y number of USSD services').",
    "Add a 'Declaration' section at the bottom of the resume."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer",
    "inferred_industry": "Cybersecurity / Software Development",
    "keyword_hits": [
      "Java",
      "Python",
      "Reverse Engineering",
      "Android",
      "iOS",
      "Security",
      "Privacy",
      "API",
      "Static Analysis",
      "Fuzzing"
    ],
    "keyword_gaps": [
      "Cloud Security",
      "Incident Response",
      "Risk Assessment"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Ensure your contact information is in the header and not in a text box, as some older ATS parsers struggle with text boxes.",
      "Use standard headings like 'Work Experience' instead of just 'Experience' to ensure better parsing.",
      "Include a 'Skills' section near the top of the resume to ensure key technical competencies are indexed immediately."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 82
}