---
resume: raisa
mode: international
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 112.2
  token_count: 9065
  cost_usd: 0.00366795
  duration_seconds: 80.8
---

## Analysis Output

{
  "formatting": {
    "score": 70,
    "feedback": "Overall clean layout with clear sections, but it uses non-standard headings for international ATS and includes a metadata line that is not typically needed in Western resumes. Standardizing headings and removing non-essential metadata will improve ATS compatibility.",
    "issues": [
      {
        "section": "EDUCATION AND QUALIFICATIONS",
        "issue": "Heading is non-standard for international applications; may hinder quick parsing by ATS.",
        "suggestion": "Replace with 'Education' and list degree, institution, year, and key achievements in bullet style."
      },
      {
        "section": "RECORD OF EMPLOYMENT",
        "issue": "Heading is non-standard for international applications; may not map cleanly in ATS.",
        "suggestion": "Replace with 'Professional Experience' and present roles as bullet-driven achievements with outcomes."
      },
      {
        "section": "Document metadata (Last Updated line)",
        "issue": "Date stamp is considered non-essential in Western resumes and can confuse ATS.",
        "suggestion": "Remove 'Last Updated' line; rely on dates within each entry for recency."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "Solid foundation with relevant international experience (UNDP, BIGD) and a publication. However, the resume lacks quantified achievements, a dedicated skills section, and a concise professional summary. Could benefit from explicit impact metrics and targeted capabilities for an economics/research role.",
    "strengths": [
      "International exposure through UNDP and BIGD",
      "Published research output (Frontiers in Public Health article)",
      "Strong academic background in economics with NSU and BRAC ecosystem",
      "Leadership roles in extracurricular activities demonstrating teamwork and initiative"
    ],
    "weaknesses": [
      "No Skills section to showcase econometrics/tools (e.g., Stata, R, Python)",
      "Bullet points under roles are descriptive rather than outcome-focused; lacks quantification",
      "Absence of a Professional Summary or Profile at the top to frame target role"
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "Generally strong, professional tone with minor editorial improvements possible. No evident spelling or tense inconsistencies. Consider minor rephrasing for consistency and ATS friendliness.",
    "issues": []
  },
  "action_items": [
    "Section: Education and Qualifications -> Replace with a standard 'Education' heading and format each degree as: Degree | Major | Institution | Year | (GPA if strong).",
    "Section: RECORD OF EMPLOYMENT -> Replace with 'Professional Experience'; convert entries into 2–4 concise bullet points each that quantify impact (e.g., datasets analyzed, findings, recommendations).",
    "Section: Add a Skills section (Section: Skills) after Education; list econometrics/software/tools (e.g., Stata, R, Python, Excel) and languages with proficiency levels where applicable.",
    "Section: Add a Professional Summary at the top (after name/contact) that succinctly states target role, key strengths, and 2–3 measurable achievements."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Economics research / Development / International organizations",
    "keyword_hits": [
      "Research Associate",
      "Trainee Research Associate",
      "Research Assistant",
      "UNDP",
      "BIGD",
      "BRAC Institute of Governance and Development",
      "Economics",
      "Public Health",
      "Path Analysis",
      "COVID-19"
    ],
    "keyword_gaps": [
      { "keyword": "Stata", "priority": "high" },
      { "keyword": "R", "priority": "high" },
      { "keyword": "Python", "priority": "high" }
    ],
    "heading_risks": [
      {
        "original": "EDUCATION AND QUALIFICATIONS",
        "issue": "Non-standard heading for international ATS",
        "recommended": "Education"
      },
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Non-standard heading for international ATS",
        "recommended": "Professional Experience"
      }
    ],
    "ats_tips": [
      "Standardize headings to 'Education' and 'Professional Experience' to ensure clean ATS parsing.",
      "Add a Skills section with explicit tools (Stata, R, Python) and capabilities relevant to economics research.",
      "Keep formatting simple (no tables, graphics, or overly complex layouts) and use a single-file PDF or Word document."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}