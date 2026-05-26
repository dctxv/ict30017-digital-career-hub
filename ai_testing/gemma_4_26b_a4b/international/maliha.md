---
resume: maliha
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 66.2
  token_count: 1457
  cost_usd: 0.0008209
  duration_seconds: 22
---

## Analysis Output

```json
{
  "formatting": {
    "score": 45,
    "feedback": "The resume follows several traditional Bangladeshi CV conventions that are inappropriate for international or multinational applications. The presence of extensive personal demographic information and non-standard headings significantly reduces the professional formatting score for a Western-standard application.",
    "issues": [
      {
        "section": "Personal Profile",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Profile",
        "issue": "National ID numbers should never appear on a resume — they create a privacy and identity theft risk.",
        "suggestion": "Remove the NID number from the resume."
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
        "section": "Personal Profile",
        "issue": "Including a photograph is strongly discouraged for international applications as it can introduce unconscious appearance-based bias.",
        "suggestion": "Remove the photograph from the resume."
      },
      {
        "section": "Academic Details",
        "issue": "Heading risk: 'Academic Details' is non-standard for international ATS systems.",
        "suggestion": "Use 'Education' instead."
      },
      {
        "section": "Personal Profile",
        "issue": "Heading risk: 'Personal Profile' is non-standard for international ATS systems.",
        "suggestion": "Use 'Contact Details' or remove this section entirely in favor of a 'Professional Summary'."
      }
    ]
  },
  "content_quality": {
    "score": 50,
    "feedback": "The resume demonstrates strong academic credentials and specialized research knowledge. However, the professional experience section is extremely weak and lacks any detail regarding responsibilities, teaching methodologies, or achievements in the Lecturer role. The research experience is described as a single paragraph without specific technical contributions or outcomes.",
    "strengths": [
      "Strong academic record with high CGPAs.",
      "Clear identification of specialized research niche (Condensed Matter Physics/Perovskites).",
      "Good list of technical software and laboratory instrumentation skills."
    ],
    "weaknesses": [
      "The 'Job Experience' section is a single line and provides no insight into actual work performed.",
      "Research experience lacks quantification or specific mention of methodologies used (e.g., specific DFT functionals or software workflows).",
      "The 'Major Academic Courses' section is overly long and takes up valuable space that should be used for professional achievements.",
      "Lack of a Professional Summary to frame the candidate's expertise."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "The language is generally clear, but there are minor issues with phrasing and consistency in the experience sections.",
    "issues": [
      {
        "original": "from February 2020 to till now",
        "corrected": "from February 2020 to Present",
        "type": "Grammar/Style"
      },
      {
        "original": "Using of electrical, thermal, mechanical and optical laboratory equipment",
        "corrected": "Proficient in operating electrical, thermal, mechanical, and optical laboratory equipment",
        "type": "Weak phrasing"
      }
    ]
  },
  "action_items": [
    "Expand the 'Job Experience' section by adding 3-5 bullet points describing your teaching responsibilities, curriculum development, or student mentorship at Pabna University.",
    "Transform the 'Research Experience' section into a detailed technical summary, highlighting specific computational methods, software used, and the significance of your findings.",
    "Remove all personal demographic information (Religion, Marital Status, Father's Name, Blood Group, etc.) to align with international professional standards.",
    "Replace the 'Major Academic Courses' list with a concise 'Core Competencies' or 'Technical Expertise' section to save space for professional impact."
  ],
  "ats_analysis": {
    "inferred_role": "Physics Lecturer / Research Scientist",
    "inferred_industry": "Academia / Materials Science Research",
    "keyword_hits": [
      "Condensed Matter Physics",
      "Perovskite",
      "DFT",
      "Material Science",
      "Latex",
      "Matlab",
      "Quantum Mechanics",
      "Solid State Physics"
    ],
    "keyword_gaps": [
      "Computational Modeling",
      "Data Analysis",
      "Scientific Writing"
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC DETAILS",
        "issue": "Non-standard heading for international ATS.",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL PROFILE",
        "issue": "Non-standard heading and contains prohibited demographic data.",
        "recommended": "Contact Details"
      }
    ],
    "ats_tips": [
      "Remove personal demographic information; international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Quantify research and teaching achievements to ensure the ATS identifies 'impact' keywords.",
      "Standardize section headings to ensure the parser correctly categorizes your education and experience."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 61
}
```