---
resume: raisa
mode: bangladesh
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 115.6
  token_count: 1456
  cost_usd: 0.00210444
  duration_seconds: 12.6
---

## Analysis Output

{
  "formatting": {
    "score": 70,
    "feedback": "Overall the CV is clean and readable with logical sectioning and consistent chronological employment history. However, spacing and heading hierarchy are slightly inconsistent, and date formatting varies by section (e.g., 'October 2022' while last update is shown separately). Also, some items are presented as paragraphs (publications list) without visual separation that improves scanability.",
    "issues": [
      {
        "section": "CURRICULUM VITAE / Header",
        "issue": "Header uses a plain layout with 'Last Updated October 2022' separate from the main name line; spacing/typography hierarchy is not clear.",
        "suggestion": "Align header elements consistently (e.g., name, then one line for location/status, then one line for last updated). Keep the 'Last Updated' line directly under the name with consistent spacing."
      },
      {
        "section": "Education and Qualifications",
        "issue": "Dates and qualifications are stacked without clear delimiter punctuation; '2015 - 2017' and '2005 - 2015' appear without consistent visual separation.",
        "suggestion": "Use a consistent pattern: Degree/Qualification (with board/institution) then 'Year range' below, or 'Year range — Qualification, Institution' on one line."
      },
      {
        "section": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "Journal article and academic work are listed together but not consistently formatted (journal has full citation; academic work uses different labels).",
        "suggestion": "Use the same bullet structure for both: 'Title — Type — Date/Period — Venue/Course — Outcome (if any)'. Keep journal citation as one bullet and thesis/term paper as separate bullets."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "The CV demonstrates strong academic alignment for research roles (Economics degree, research employment at BIGD/UNDP exposure, and publications/thesis). However, most employment entries lack concrete responsibilities and measurable outputs, which is critical for research-associate recruiting. The publications section is a strong differentiator, but the CV needs clearer links between your roles and research methods, deliverables, datasets, and impact.",
    "strengths": [
      "Relevant research-focused experience: Research Associate and Trainee Research Associate at BRAC BIGD (Economics Cluster).",
      "International exposure: Internship at UNDP, Bangladesh (good credibility for many Bangladesh and multinational employers).",
      "Academic outputs included: one peer-reviewed journal article and clearly titled thesis/term paper topics."
    ],
    "weaknesses": [
      "Employment bullets are missing entirely—each role lists only the title, dates, and organisation. Without responsibilities/deliverables, recruiters cannot evaluate your fit.",
      "No quantification: there are no metrics such as number of reports produced, datasets used, study scope, interviews conducted, coding/software used, literature review volume, or contribution description.",
      "Research methods/tools are not mentioned (e.g., econometrics, qualitative methods, Stata/R/Python, survey tools). This is a common gap for ATS and hiring panels for research roles."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "Language is clear and professional with no major grammar issues. Minor consistency improvements could be made to punctuation and phrasing.",
    "issues": [
      {
        "original": "Last Updated October 2022",
        "corrected": "Last Updated: October 2022",
        "type": "Punctuation/format consistency"
      },
      {
        "original": "Academic Work Undergrad thesis titled",
        "corrected": "Academic Work: Undergraduate thesis titled",
        "type": "Capitalisation/label formatting"
      }
    ]
  },
  "action_items": [
    "Add bullet points under each employment role in 'RECORD OF EMPLOYMENT' (Research Associate, Trainee Research Associate, Intern, Research Assistant) describing 4–6 responsibilities and 2–3 concrete outputs (e.g., reports, data cleaning, analysis, presentations).",
    "In 'RECORD OF EMPLOYMENT', explicitly list research methods and tools used (e.g., econometrics/quant methods, survey/qual methods, and software like Stata/R/Python/Excel).",
    "Expand 'SELECTED PUBLICATIONS AND OUTPUTS' by adding the date/period for the journal article (or submission/publication year if known) and one-line contribution for the journal article (e.g., research question, analysis, writing).",
    "In 'EDUCATION AND QUALIFICATIONS', consider adding CGPA (if available) or at least include GPA/grade details if your university provides them, to strengthen screening for graduate-level research hiring."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Research Analyst (Economics Research)",
    "inferred_industry": "Research & Development / Economic Research (NGO/Think-tank, development sector)",
    "keyword_hits": [
      "Research Associate",
      "Research Assistant",
      "Trainee Research Associate",
      "Economics",
      "Economics Cluster",
      "United Nations Development Programme",
      "Intern",
      "Journal Article",
      "Path Analysis",
      "COVID-19 Mortality",
      "Undergraduate thesis",
      "Term Paper",
      "Foreign Direct Investment (FDI)",
      "Labor Force Participation"
    ],
    "keyword_gaps": [
      "econometrics",
      "Stata",
      "data analysis"
    ],
    "heading_risks": [
      {
        "original": "CURRICULUM VITAE",
        "issue": "Some ATS parsers may treat the title as a separate field rather than a standard document header, which can slightly reduce parsing accuracy.",
        "recommended": "Keep it, but ensure all subsequent headings use standard ATS-friendly labels like 'Summary' or 'Education' (which you already do)."
      }
    ],
    "ats_tips": [
      "Add a 'Skills' section (or expand 'Technical Skills' if you plan to add later) and include explicit tools/methods (e.g., Stata/R/Python, regression/econometrics terms, literature review, survey analysis) because current keywords are too general for ATS screening.",
      "Convert 'RECORD OF EMPLOYMENT' entries into bullet lists with action + deliverable + method (e.g., 'Cleaned dataset in Stata; ran regression; drafted results for report') to increase both ATS keyword matching and human readability.",
      "Include publication metadata consistently (month/year or publication year, and whether it is peer-reviewed) to improve ATS extraction and recruiter confidence."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 78
}