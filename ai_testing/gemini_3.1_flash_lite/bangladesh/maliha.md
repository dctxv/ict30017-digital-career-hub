---
resume: maliha
mode: bangladesh
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 192.8
  token_count: 1041
  cost_usd: 0.0025785
  duration_seconds: 5.4
---

## Analysis Output

{
  "formatting": {
    "score": 70,
    "feedback": "The resume is logically structured and easy to read. However, it contains several Bangladeshi CV conventions (Personal Details, References, etc.) which, while standard for the local market, trigger a formatting score ceiling of 75 for modern digital application standards. Ensure consistent indentation and bullet point styles throughout.",
    "issues": [
      {
        "section": "Job Experience",
        "issue": "Inconsistent date formatting and phrasing.",
        "suggestion": "Use a consistent format like 'February 2020 – Present' instead of 'February 2020 to till now'."
      },
      {
        "section": "Skills",
        "issue": "Mixed list styles and lack of categorization.",
        "suggestion": "Group skills into logical categories (e.g., 'Software & Tools', 'Programming Languages', 'Laboratory Equipment') for better readability."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The resume provides a strong academic foundation but lacks a professional summary and detailed impact in the current role. The 'Major Academic Courses' section is excessively long and occupies space that could be better used for professional achievements.",
    "strengths": [
      "Clear academic progression and strong GPA.",
      "Detailed research experience with specific project titles.",
      "Inclusion of relevant technical laboratory skills."
    ],
    "weaknesses": [
      "Missing a Career Objective or Professional Summary.",
      "The 'Job Experience' section lacks bullet points detailing specific responsibilities, teaching methodologies, or administrative contributions.",
      "The 'Major Academic Courses' section is too granular; it should be condensed or removed to focus on professional experience."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally professional. A few minor phrasing improvements would enhance the impact.",
    "issues": [
      {
        "original": "Using of electrical, thermal, mechanical and optical laboratory equipment",
        "corrected": "Proficient in operating electrical, thermal, mechanical, and optical laboratory equipment",
        "type": "Grammar"
      },
      {
        "original": "to till now",
        "corrected": "to present",
        "type": "Phrasing"
      }
    ]
  },
  "action_items": [
    "Add a Career Objective at the top: 'Dedicated Physics Lecturer with 4+ years of experience in higher education, seeking to leverage expertise in Condensed Matter Physics and DFT research to contribute to [Target Institution Name].'",
    "Expand the 'Job Experience' section with 3-4 bullet points detailing your teaching load, curriculum development, or student mentorship achievements.",
    "Condense the 'Major Academic Courses' section into a single line or remove it entirely to prioritize your professional experience and research impact.",
    "Categorize the 'Skills' section into 'Software', 'Programming', and 'Laboratory Instrumentation' to improve ATS readability."
  ],
  "ats_analysis": {
    "inferred_role": "Physics Lecturer / Researcher",
    "inferred_industry": "Higher Education / Academic Research",
    "keyword_hits": [
      "Physics",
      "Condensed Matter Physics",
      "DFT",
      "Matlab",
      "C++",
      "LaTeX",
      "Material Science",
      "Nanotechnology"
    ],
    "keyword_gaps": [
      "Curriculum Development",
      "Student Mentorship",
      "Academic Administration"
    ],
    "heading_risks": [
      {
        "original": "OTHER EDUCATIONAL ACHIEVEMENTS",
        "issue": "Non-standard heading that may be parsed incorrectly.",
        "recommended": "Awards and Honors"
      },
      {
        "original": "EXTRA CURRICULUM ACTIVITIES",
        "issue": "Non-standard heading.",
        "recommended": "Extracurricular Activities"
      }
    ],
    "ats_tips": [
      "Replace the 'Major Academic Courses' section with a 'Teaching Experience' or 'Key Responsibilities' section to include high-value keywords like 'Curriculum Development'.",
      "Ensure your job title and institution are clearly formatted as 'Lecturer | Pabna University of Science & Technology' to help ATS parsers identify your current role.",
      "Use standard bullet points instead of dashes to ensure better parsing by automated systems."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 72
}