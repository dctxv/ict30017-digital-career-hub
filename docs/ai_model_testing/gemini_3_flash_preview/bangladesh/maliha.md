---
resume: maliha
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 179.3
  token_count: 1263
  cost_usd: 0.006785
  duration_seconds: 7.0
---

## Analysis Output

```json
{
  "formatting": {
    "score": 70,
    "feedback": "The resume follows a traditional academic layout suitable for the Bangladeshi public sector. However, the use of '---' as section dividers and the block-text listing of courses make it look like a plain-text document rather than a professionally formatted CV. The score is capped due to the inclusion of extensive personal details and a non-standard layout for digital applications.",
    "issues": [
      {
        "section": "Major Academic Courses",
        "issue": "The courses are listed in dense paragraph blocks which are difficult to scan.",
        "suggestion": "Use a multi-column list or a table to categorize key courses (e.g., Core Physics, Mathematics, Labs) to improve readability."
      },
      {
        "section": "Job Experience",
        "issue": "The entry is a single line and lacks bullet points or a description of responsibilities.",
        "suggestion": "Use a standard format: Job Title, Institution, Dates, followed by bullet points detailing teaching load, subjects taught, and administrative duties."
      }
    ]
  },
  "content_quality": {
    "score": 68,
    "feedback": "The academic credentials and research background are excellent (High GPA, NST Fellowship). However, the professional experience section is severely underdeveloped for someone who has been a Lecturer since 2020. The resume lacks a 'Career Objective' or 'Research Statement' which is standard for academic roles.",
    "strengths": [
      "Outstanding academic record with high CGPAs from Jahangirnagar University.",
      "Specific research experience in a high-impact field (Perovskite/DFT).",
      "Inclusion of specialized technical skills like Gaussian, Material Studio, and XRD."
    ],
    "weaknesses": [
      "The Job Experience section for the Lecturer role is missing details. It should list specific courses taught, number of students mentored, and any departmental committee work.",
      "The 'Extra Curriculum Activities' section lists memberships but lacks context on roles or contributions (e.g., 'Active donor and organizer for blood drives' for Badhan).",
      "Missing a Career Objective: While the heading is allowed, the content is absent. A researcher/academic should state their research goals and teaching philosophy."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The language is formal and appropriate for an academic CV. There are minor phrasing issues in the experience and skills sections.",
    "issues": [
      {
        "original": "Lecturer at the department of Physics... from February 2020 to till now.",
        "corrected": "Lecturer, Department of Physics, Pabna University of Science & Technology (February 2020 – Present).",
        "type": "phrasing"
      },
      {
        "original": "Using of electrical, thermal, mechanical and optical laboratory equipment",
        "corrected": "Proficient in operating electrical, thermal, mechanical, and optical laboratory equipment.",
        "type": "grammar"
      }
    ]
  },
  "action_items": [
    "Job Experience: Expand the Lecturer role at PUST. Add 3-4 bullet points describing your teaching portfolio (e.g., 'Conducting theory and lab courses for 100+ undergraduate students in Quantum Mechanics and Solid State Physics').",
    "Research Experience: Since you are in academia, expand the Master's thesis section to include 2-3 key findings or the specific computational methods used (e.g., 'Utilized Density Functional Theory (DFT) via Gaussian software').",
    "Career Objective: Add a Career Objective section. Example: 'Dedicated Physics Lecturer and Researcher with a strong background in Condensed Matter Physics, seeking to contribute to advanced material science research and excellence in higher education.'",
    "Formatting: Replace the '---' dividers with bold horizontal lines or shaded section headers to give the document a more professional, structured appearance."
  ],
  "ats_analysis": {
    "inferred_role": "Lecturer / Researcher in Physics",
    "inferred_industry": "Academia / Research",
    "keyword_hits": [
      "Physics",
      "Condensed Matter Physics",
      "Lecturer",
      "Research",
      "DFT",
      "Perovskite",
      "Gaussian",
      "Matlab",
      "C++",
      "XRD"
    ],
    "keyword_gaps": [
      "Curriculum Development",
      "Scientific Writing",
      "Data Analysis"
    ],
    "heading_risks": [
      {
        "original": "Major Academic Courses",
        "issue": "Non-standard heading; ATS may not know how to categorize this data.",
        "recommended": "Relevant Coursework"
      },
      {
        "original": "Other Educational Achievements",
        "issue": "Vague heading.",
        "recommended": "Honors and Awards"
      }
    ],
    "ats_tips": [
      "Convert the 'Major Academic Courses' from a paragraph into a comma-separated list or bullet points to ensure the ATS can identify individual subjects as keywords.",
      "Include the word 'Present' instead of 'till now' in your date ranges, as most ATS software is programmed to recognize 'Present' for current roles.",
      "Add a 'Publications' section if any research has been published or is under review; this is a primary keyword for academic ATS filters."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}
```
