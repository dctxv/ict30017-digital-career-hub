---
resume: maliha
mode: international
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 141.9
  token_count: 1348
  cost_usd: 0.005753
  duration_seconds: 9.5
---

## Analysis Output

{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows a traditional academic CV format common in Bangladesh but fails significantly against international multinational standards. It contains excessive personal data and non-standard headings that hinder ATS readability.",
    "issues": [
      {
        "section": "Personal Profile",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Profile",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Personal Profile",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Profile",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Profile",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Academic Details",
        "issue": "The heading 'Academic Details' is non-standard for international ATS systems.",
        "suggestion": "Change heading to 'Education'."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "The academic credentials are exceptionally strong (high CGPA, NST Fellowship), but the professional experience section is very thin. As a Lecturer since 2020, there is no mention of specific subjects taught, student impact, or administrative contributions.",
    "strengths": [
      "Outstanding academic record with high CGPAs across all levels.",
      "Prestigious National Science & Technology (NST) fellowship.",
      "Specific technical skills in Density Functional Theory (DFT) and material characterization tools (XRD, FTIR)."
    ],
    "weaknesses": [
      "Job experience lacks detail; it only lists the title and duration without bullet points describing responsibilities.",
      "Research experience is written as a passive narrative rather than achievement-oriented bullet points.",
      "The 'Major Academic Courses' section is overly dense and takes up too much space that should be used for professional achievements."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally clear and professional, though it relies heavily on passive voice in the research and experience sections.",
    "issues": [
      {
        "original": "Performed research work on...",
        "corrected": "Conducted ab initio research on the role of intrinsic defects in Organometal Trihalide Perovskite...",
        "type": "weak action verb"
      },
      {
        "original": "from February 2020 to till now",
        "corrected": "February 2020 – Present",
        "type": "phrasing"
      }
    ]
  },
  "action_items": [
    "Professional Experience: Add 3-4 bullet points under your Lecturer role detailing specific courses taught, number of students mentored, and any curriculum development or departmental committees.",
    "Research Section: Quantify your research. Mention if the thesis led to any publications, conference presentations, or specific computational findings.",
    "Personal Profile: Delete the entire 'Personal Profile' section. Move your Nationality and Contact details to the header and remove all other demographic data (Religion, Marital Status, Parents' names).",
    "Skills & Tools: Group your skills into categories (e.g., 'Computational Modeling', 'Characterization Techniques', 'Programming') to make them more readable for recruiters.",
    "Education: Remove S.S.C and H.S.C details for international applications; focus on your M.Sc. and B.Sc. as they are the most relevant."
  ],
  "ats_analysis": {
    "inferred_role": "Research Scientist / Physics Lecturer",
    "inferred_industry": "Academia / Research & Development",
    "keyword_hits": [
      "Physics",
      "Condensed Matter Physics",
      "Ab Initio",
      "Perovskite",
      "DFT",
      "Matlab",
      "C++",
      "Material Science",
      "Latex"
    ],
    "keyword_gaps": [
      "Data Analysis",
      "Python",
      "Scientific Writing"
    ],
    "heading_risks": [
      {
        "original": "Academic Details",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Education"
      },
      {
        "original": "Personal Profile",
        "issue": "Contains sensitive demographic data that many international ATS are programmed to flag or redact.",
        "recommended": "Remove section entirely"
      }
    ],
    "ats_tips": [
      "International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information like religion or marital status to avoid compliance risks.",
      "Replace the 'Major Academic Courses' block with a 'Relevant Coursework' section that only lists 5-6 advanced courses relevant to the specific job you are applying for.",
      "Use standard headers like 'Work Experience' instead of 'Job Experience' to ensure the ATS correctly categorizes your professional history."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 65
}