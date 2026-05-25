---
resume: maliha
mode: international
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 8.8
  token_count: 1064
  cost_usd: 0.00067956
  duration_seconds: 120.5
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume is clean and easy to read, but the score is capped at 75 because it follows several traditional Bangladeshi CV conventions (Personal Profile with father's/mother's name, religion, blood group, etc.) which are not standard for modern digital or international applications.",
    "issues": [
      {
        "section": "Academic Details",
        "issue": "Missing GPA denominators for SSC and HSC.",
        "suggestion": "Format the GPA as '5.00/5.00' instead of '5 out of 5.00' to maintain consistency with the university entries and professional standards."
      },
      {
        "section": "Job Experience",
        "issue": "The section is extremely sparse and lacks detail.",
        "suggestion": "Use bullet points to describe your responsibilities as a Lecturer, such as teaching specific modules, supervising lab sessions, or curriculum development."
      }
    ]
  },
  "content_quality": {
    "score": 65,
    "feedback": "The candidate has an impressive academic record and strong technical skills relevant to Physics research. However, the professional experience section is critically underdeveloped, and the research section could be more impactful.",
    "strengths": [
      "Excellent academic achievements and prestigious scholarships (National Science & Technology fellowship).",
      "Strong technical skill set including specialized software (Gaussian, Material Studio) and laboratory equipment (XRD, FTIR).",
      "Clear research focus in Condensed Matter Physics."
    ],
    "weaknesses": [
      "The 'Job Experience' section only contains a single sentence. It fails to describe duties, teaching load, or any academic contributions at Pabna University.",
      "The 'Research Experience' section is written as a narrative paragraph. It should be broken down into a structured format highlighting the methodology and specific findings.",
      "The 'Major Academic Courses' section is overly long and takes up significant space that could be used to expand on professional or research achievements."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The language is formal and appropriate for an academic profile. There are minor phrasing issues in the skills and experience sections.",
    "issues": [
      {
        "original": "Lecturer at the department of Physics in Pabna University of Science & Technology from February 2020 to till now.",
        "corrected": "Lecturer, Department of Physics, Pabna University of Science & Technology (February 2020 – Present)",
        "type": "Grammatical phrasing"
      },
      {
        "original": "Using of electrical, thermal, mechanical and optical laboratory equipment",
        "corrected": "Proficient in operating electrical, thermal, mechanical, and optical laboratory equipment",
        "type": "Awkward phrasing"
      }
    ]
  },
  "action_items": [
    "Expand the 'Job Experience' section by adding 3-5 bullet points detailing your teaching responsibilities, lab supervision, and any administrative roles at Pabna University.",
    "Restructure the 'Research Experience' section to include: Thesis Title, Supervisor, Methodology (e.g., DFT/Ab Initio), and a brief summary of key results or outcomes.",
    "Condense the 'Major Academic Courses' section. Instead of listing every course, group them into 'Core Competencies' (e.g., Quantum Mechanics, Solid State Physics, Thermodynamics) to save space.",
    "Refine the 'Skills' section by categorising them clearly (e.g., Computational Tools, Laboratory Techniques, Programming)."
  ],
  "ats_analysis": {
    "inferred_role": "Research Scientist / Physics Lecturer",
    "inferred_industry": "Academia / Scientific Research",
    "keyword_hits": [
      "Condensed Matter Physics",
      "DFT",
      "Material Science",
      "Perovskite",
      "Quantum Mechanics",
      "Latex",
      "Matlab",
      "XRD",
      "FTIR"
    ],
    "keyword_gaps": [
      "Data Analysis",
      "Scientific Writing",
      "Computational Modeling"
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC DETAILS",
        "issue": "Slightly non-standard for international research roles.",
        "recommended": "Education"
      }
    ],
    "ats_tips": [
      "Convert the narrative 'Research Experience' into a bulleted list to ensure ATS can parse specific methodologies and tools used.",
      "Incorporate more 'action-oriented' keywords related to research, such as 'Investigated', 'Modeled', 'Analyzed', or 'Synthesized'.",
      "Ensure that the specific software (Gaussian, Material Studio) is mentioned in close proximity to the research tasks to establish context."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 73
}
```
