---
resume: raisa
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 158
  token_count: 1943
  cost_usd: 0.00294215
  duration_seconds: 12.3
---

## Analysis Output

{
  "formatting": {
    "score": 62,
    "feedback": "The resume is readable and reasonably structured, but it uses several Bangladeshi/region-style headings (e.g., “CURRICULUM VITAE”, “EDUCATION AND QUALIFICATIONS”, “RECORD OF EMPLOYMENT”) and has inconsistent section styling (dates/roles are not aligned in a consistent layout). The line “Last Updated October 2022” is non-standard for international CVs and adds noise. Bullets are used only for extracurricular activities, while experience and publications are not presented consistently (job entries are not bulletized, and publications are not formatted for ATS).",
    "issues": [
      {
        "section": "Overall",
        "issue": "Use of non-standard/ATS-awkward headings and layout conventions (e.g., “CURRICULUM VITAE”, “RECORD OF EMPLOYMENT”).",
        "suggestion": "Rename headings to ATS-friendly, internationally standard labels (e.g., “Professional Summary”, “Education”, “Experience”, “Publications”/“Research Output”, “Leadership & Activities”)."
      },
      {
        "section": "Header",
        "issue": "“Last Updated October 2022” is included as a standalone line.",
        "suggestion": "Remove the ‘Last Updated’ line; it is not used in international applications."
      },
      {
        "section": "Experience",
        "issue": "Dates and titles are presented as separate lines without consistent formatting (no bullets for responsibilities/impact).",
        "suggestion": "Use a consistent block format for each role (Company — Location | Dates) and add 3–5 bullets per role describing tasks and measurable outcomes."
      },
      {
        "section": "Publications",
        "issue": "Publications are not formatted with consistent separators (journal vs academic work) and may not be ATS-friendly.",
        "suggestion": "Use consistent publication entries (e.g., “Journal Article — Title, Journal, Year, DOI”) and consider separating peer-reviewed vs thesis/term papers."
      },
      {
        "section": "Language / typography",
        "issue": "All-caps “CURRICULUM VITAE” and inconsistent capitalization across headings can look dated.",
        "suggestion": "Use title case headings consistently and avoid unnecessary all-caps for the main title."
      }
    ]
  },
  "content_quality": {
    "score": 58,
    "feedback": "You have relevant experience for a research-focused economics/impact research pathway (UNDP internship, BIGD/BIGD roles, research output with a peer-reviewed publication). However, the resume is missing the core content international recruiters expect: specific responsibilities, methods, datasets/software, study design, and quantified outcomes. Most experience entries currently list only titles and dates, with no bullets describing what you did. This will significantly reduce job-match effectiveness and ATS keyword relevance for research associate roles (e.g., data analysis, econometrics, statistical software, research methods).",
    "strengths": [
      "Relevant employment history in research (BIGD BRAC Institute of Governance and Development; Research Associate/Trainee Research Associate).",
      "International organization exposure via UNDP internship.",
      "A peer-reviewed journal publication with DOI (strong credibility signal).",
      "Research topics align with economics/development and health-related COVID-19 analysis."
    ],
    "weaknesses": [
      "Experience section lacks impact statements: “Research Associate / Trainee Research Associate / Intern / Research Assistant” entries do not include any responsibilities or outcomes.",
      "No evidence of tools/skills typically required for research roles (e.g., Stata/R/Python/SPSS/Excel, econometrics methods, survey methods, data cleaning, regression/path analysis workflow).",
      "Publications are present but not leveraged: there is no ‘contribution’ description (e.g., role in analysis, data collection, literature review, model building).",
      "Extracurricular leadership is listed but not connected to research/technical skills (no transferable skills stated).",
      "No “Professional Summary” to quickly position your research focus, methods, and strengths for international screening."
    ]
  },
  "language_grammar": {
    "score": 82,
    "feedback": "Language is clear and largely error-free. Minor formatting/consistency issues exist in capitalization and punctuation (e.g., inconsistent use of “Front. Public Health” and missing spacing after commas in author lists is typical but inconsistent). No major grammar errors were found.",
    "issues": [
      {
        "original": "Goswami GG, Mahapatro M, Ali ARMM and Rahman R (2021) Do Old Age and Comorbidity via Non-Communicable Diseases Matter for COVID-19 Mortality? A Path Analysis.",
        "corrected": "Goswami GG, Mahapatro M, Ali ARMM, and Rahman R (2021) “Do Old Age and Comorbidity via Non-Communicable Diseases Matter for COVID-19 Mortality? A Path Analysis”. Frontiers in Public Health, 9:736347. https://doi.org/10.3389/fpubh.2021.736347.",
        "type": "Punctuation/format consistency"
      }
    ]
  },
  "action_items": [
    "Experience section: Convert each role under “RECORD OF EMPLOYMENT” into 3–5 bullet points with specific research tasks and measurable outputs. Example target rewrite for “Research Associate — Economics Cluster, BRAC Institute of Governance and Development (BIGD)” (Dec 2022–Present): add bullets like data cleaning/analysis, model type (e.g., regression/path analysis), dataset size, deliverables (policy briefs, reports), and any tool(s) used.",
    "Add a “Professional Summary” at the top (replace the need for “CURRICULUM VITAE” dominance): 3–4 lines stating your research focus (economics/development/health impacts), methods, and key tools—based on what you actually used in your UNDP/BIGD roles and your publication.",
    "Publications section: Standardize citation formatting and ensure ATS-friendly punctuation. Keep DOI as a clickable URL and ensure journal name is spelled out consistently (e.g., “Frontiers in Public Health”).",
    "Skills section (currently missing): Add a dedicated “Skills” section listing analytics tools and research methods you used (e.g., Stata/R/Python, Excel, econometrics, survey/data management, literature review, report writing). Match wording to what your target research role/job ad typically requests."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Research Analyst (Economics & Development Research)",
    "inferred_industry": "Economics research, development, think-tank/research institute",
    "keyword_hits": [
      "Research Associate",
      "Research Assistant",
      "Trainee Research Associate",
      "Economics",
      "Journal Article",
      "Path Analysis",
      "COVID-19 Mortality",
      "Foreign Direct Investment (FDI)"
    ],
    "keyword_gaps": [
      "Stata",
      "R",
      "data analysis",
      "econometrics",
      "regression analysis",
      "survey methodology"
    ],
    "heading_risks": [
      {
        "original": "CURRICULUM VITAE",
        "issue": "Non-standard header; some ATS parsers treat it as text noise rather than structure.",
        "recommended": "Replace with no title or use “Resume” / “CV” as a simple header."
      },
      {
        "original": "EDUCATION AND QUALIFICATIONS",
        "issue": "Long/variable heading may parse inconsistently across ATS; “Education” is the standard.",
        "recommended": "Use “Education”."
      },
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Non-standard heading; ATS commonly expects “Experience”.",
        "recommended": "Use “Experience”."
      },
      {
        "original": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "ATS may parse this as a text block; standard “Publications” is more predictable.",
        "recommended": "Use “Publications & Research Output”."
      }
    ],
    "ats_tips": [
      "Add a “Skills” section with explicit tool/method keywords (e.g., Stata/R, regression, econometrics, data cleaning). Right now, only “Path Analysis” appears, which is unlikely to cover ATS screening for analytics tools.",
      "Under each job in “RECORD OF EMPLOYMENT”, add bullet points that include method + deliverable + (if possible) scale (e.g., “cleaned dataset of N observations”, “ran regression/path models”, “produced X reports”). ATS scoring heavily depends on term occurrence in the experience section.",
      "Standardize publication formatting (use a consistent template and include DOI as a full URL). This reduces parsing errors and improves keyword capture (journal name, year, DOI)."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 63
}