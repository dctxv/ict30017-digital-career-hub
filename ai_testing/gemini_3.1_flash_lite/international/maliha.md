---
resume: maliha
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 255.3
  token_count: 1200
  cost_usd: 0.002703
  duration_seconds: 4.7
---

## Analysis Output

{
  "formatting": {
    "score": 50,
    "feedback": "The resume follows a traditional Bangladeshi CV structure which is unsuitable for international applications. It contains excessive personal data and non-standard headings that detract from professional impact.",
    "issues": [
      {
        "section": "Personal Profile",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Profile",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Profile",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Personal Profile",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Profile",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Academic Details",
        "issue": "Heading 'Academic Details' is non-standard.",
        "suggestion": "Rename to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "The content is academically strong but lacks professional impact. The 'Job Experience' section is too brief and fails to highlight achievements or specific responsibilities beyond a job title.",
    "strengths": [
      "Strong academic background with high GPA.",
      "Clear research focus in Condensed Matter Physics.",
      "Relevant technical software skills (Gaussian, Material Studio, LaTeX)."
    ],
    "weaknesses": [
      "The 'Job Experience' section lacks bullet points detailing specific teaching or administrative accomplishments.",
      "The 'Major Academic Courses' section is far too long and occupies space that should be used for professional achievements.",
      "Lack of quantification in research and teaching roles."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally clear, though some phrasing is slightly non-standard for professional English.",
    "issues": [
      {
        "original": "from February 2020 to till now",
        "corrected": "from February 2020 to Present",
        "type": "Grammar/Style"
      },
      {
        "original": "Using of electrical, thermal, mechanical and optical laboratory equipment",
        "corrected": "Experience with electrical, thermal, mechanical, and optical laboratory equipment",
        "type": "Grammar"
      }
    ]
  },
  "action_items": [
    "Remove the entire 'Personal Profile' section, including parent names, religion, marital status, and blood group.",
    "Replace the 'Major Academic Courses' list with a concise 'Technical Skills' or 'Core Competencies' section; remove the list of individual course names.",
    "Expand the 'Job Experience' section by adding 3-4 bullet points per role, focusing on specific teaching outcomes, research contributions, or administrative responsibilities.",
    "Rename 'Academic Details' to 'Education' and 'Other Educational Achievements' to 'Awards & Honors'."
  ],
  "ats_analysis": {
    "inferred_role": "Physics Lecturer / Research Scientist",
    "inferred_industry": "Higher Education / Research",
    "keyword_hits": [
      "Physics",
      "Condensed Matter Physics",
      "LaTeX",
      "Matlab",
      "C++",
      "DFT",
      "Material Science",
      "Nanotechnology"
    ],
    "keyword_gaps": [
      "Curriculum Development",
      "Grant Writing",
      "Academic Mentorship"
    ],
    "heading_risks": [
      {
        "original": "Academic Details",
        "issue": "Non-standard heading for ATS parsing.",
        "recommended": "Education"
      },
      {
        "original": "Personal Profile",
        "issue": "ATS systems often flag or discard resumes containing demographic data.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove the 'Major Academic Courses' section; it creates keyword noise and dilutes the relevance of your core technical skills.",
      "Ensure your contact information is at the very top; remove all personal demographic data to prevent ATS filtering based on protected characteristics.",
      "Use standard headings like 'Professional Experience', 'Education', and 'Skills' to ensure the ATS correctly categorizes your data."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 62
}