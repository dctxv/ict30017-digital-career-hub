---
resume: raisa
mode: bangladesh
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 53.8
  token_count: 985
  cost_usd: 0.0006513
  duration_seconds: 18.3
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows a clean, minimalist structure. However, it contains several traditional Bangladeshi CV conventions (such as the 'Curriculum Vitae' heading and specific academic layouts) which, while standard locally, may be viewed as less optimized for modern digital application systems used by international firms. A score ceiling has been applied to reflect this.",
    "issues": [
      {
        "section": "Education and Qualifications",
        "issue": "Missing GPA/Result denominators.",
        "suggestion": "For the Bachelor of Science, HSC, and SSC entries, ensure the GPA or CGPA is listed with the denominator (e.g., 3.80/4.00 or 5.00/5.00) to provide clear context for evaluators."
      },
      {
        "section": "Education and Qualifications",
        "issue": "Missing Education Board information.",
        "suggestion": "For SSC and HSC entries, include the Education Board name (e.g., Dhaka Board) as is standard practice in the Bangladesh market."
      }
    ]
  },
  "content_quality": {
    "score": 55,
    "feedback": "The candidate has impressive academic credentials and high-quality research outputs, including a journal publication. However, the 'Record of Employment' section is critically under-developed. It lists job titles and organizations but provides zero information regarding responsibilities, tools used, or achievements.",
    "strengths": [
      "Strong academic background from reputable institutions.",
      "Published research in a peer-reviewed journal (Frontiers in Public Health).",
      "Relevant internship experience with a major international organization (UNDP).",
      "Clear evidence of leadership through extracurricular activities."
    ],
    "weaknesses": [
      "Complete absence of bullet points describing duties or accomplishments in the 'Record of Employment' section.",
      "Lack of quantification (e.g., size of datasets handled, number of reports produced, or specific research methodologies applied).",
      "The 'Academic Work' section lists a thesis but lacks a one-line description of the methodology or key findings."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The language is professional and formal. There are no significant grammatical errors or spelling mistakes found.",
    "issues": []
  },
  "action_items": [
    "Expand the 'Record of Employment' section by adding 3-5 bullet points for each role, focusing on specific research tasks, software used (e.g., Stata, R, Python), and measurable outcomes.",
    "Add a brief one-line description to the undergraduate thesis entry in the 'Academic Work' section to explain the research scope or methodology.",
    "Update the 'Education and Qualifications' section to include GPA/CGPA with denominators and the respective Education Boards for SSC and HSC.",
    "Include a 'Skills' section to explicitly list technical competencies such as statistical software, data analysis techniques, and language proficiencies."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Research / Development / Academia",
    "keyword_hits": [
      "Research Associate",
      "Economics",
      "Path Analysis",
      "Labor Force Participation",
      "Foreign Direct Investment"
    ],
    "keyword_gaps": [
      "Quantitative Research",
      "Data Analysis",
      "Statistical Software (e.g., Stata, R, SPSS)"
    ],
    "heading_risks": [
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Slightly non-standard for international ATS which prefer 'Work Experience'.",
        "recommended": "Work Experience"
      }
    ],
    "ats_tips": [
      "Incorporate specific technical tools (e.g., Stata, R, Python, Excel) into your employment descriptions to ensure keyword matching.",
      "Quantify research impact by mentioning the scale of datasets or the specific types of economic models used.",
      "Ensure your skills are listed in a dedicated section to improve keyword density for technical competencies."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 68
}
```