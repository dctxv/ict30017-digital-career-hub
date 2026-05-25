---
resume: raisa
mode: bangladesh
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 162.5
  token_count: 8615
  cost_usd: 0.00348831
  duration_seconds: 53
---

## Analysis Output

{
  "formatting": {
    "score": 70,
    "feedback": "Overall structure is readable but could be modernised for scan-ability. Sections are clearly separated but the experience section lacks bullet-based achievements, and the dated, heavy separators reduce readability. The header includes 'CURRICULUM VITAE' and 'Last Updated October 2022' which makes the document feel dated. Date formatting is inconsistent across sections (month-year vs year ranges). Consider standardising to Month Year for all dates, and replace the heavy '---' dividers with clean section lines. Update the Last Updated line or remove it after refreshing the content.",
    "issues": [
      {
        "section": "Experience (RECORD OF EMPLOYMENT)",
        "issue": "Entries list only job titles and dates with no bullet points describing responsibilities or achievements.",
        "suggestion": "Convert each role to a bulleted list of 3–5 achievement-oriented bullets starting with strong action verbs; include any quantifiable outcomes where possible."
      },
      {
        "section": "Header/date format",
        "issue": "Last Updated line is outdated and the document uses inconsistent date formatting.",
        "suggestion": "Update to a current date or remove the line; standardise date formatting to Month Year (e.g., December 2022 – Present)."
      },
      {
        "section": "Section dividers",
        "issue": "Use of heavy '---' dividers and all-caps headings creates a dense blocky appearance.",
        "suggestion": "Replace with clean horizontal lines or subtle formatting and use consistent heading casing (e.g., Title Case) for all sections."
      },
      {
        "section": "Education and Qualifications",
        "issue": "Date ranges are year-year for education rather than Month Year, which slightly reduces consistency with employment dates.",
        "suggestion": "Standardise to Month Year e.g., 2018–2021; ensure a consistent format across all education entries."
      },
      {
        "section": "References",
        "issue": "No References section present; Bangladesh practice commonly expects named referees.",
        "suggestion": "Add a References section with 2–3 named referees (name, designation, organisation, phone, email)."
      }
    ]
  },
  "content_quality": {
    "score": 78,
    "feedback": "Strengths: strong academic background with a current development-economics focus; relevant internships and research roles; published journal article and a clear academic project portfolio; active extracurricula demonstrate leadership potential. \"Undergraduate thesis titled \\\"Labor Force Participation of Educated Females in Bangladesh\\\" (June - September, 2021)\" and the course paper on FDI show applied research. Weaknesses: the resume lacks bulleted responsibilities for each role, making it hard to gauge impact; no quantified outcomes; no dedicated references section; the tone is descriptive but not outcome-driven. Quotes from the resume illustrate these gaps: 'December 2022 - PRESENT Research Associate Economics Cluster, BRAC Institute of Governance and Development (BIGD), Bangladesh' lacks context of deliverables; and 'Intern United Nations Development Programme (UNDP), Bangladesh' lacks specifics.",
    "strengths": [
      "Solid mapping of education to the economics/research track",
      "Early-career research exposure at BIGD and UNDP",
      "Publication and explicit final-year project demonstrate research capability",
      "Active leadership in student clubs and events"
    ],
    "weaknesses": [
      "Experience sections are not bullet-pointed with outcomes or metrics",
      "No References section (Bangladesh market expectation)",
      "Limited explicit technical skills or tools (e.g., econometrics software)",
      "Dates are not uniformly presented (some month-year ranges, others year-only)"
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "Mostly clear and formal; a few punctuation and formatting tweaks will improve polish. Example issues: inconsistent dash usage and minor punctuation. Quoted phrases are generally correct. Corrected versions are provided for clarity.",
    "issues": [
      {
        "original": "Last Updated October 2022",
        "corrected": "Last Updated: October 2022",
        "type": "punctuation"
      },
      {
        "original": "Undergraduate thesis titled \"Labor Force Participation of Educated Females in Bangladesh\" (June - September, 2021)",
        "corrected": "Undergraduate thesis titled “Labor Force Participation of Educated Females in Bangladesh” (June–September 2021)",
        "type": "punctuation"
      },
      {
        "original": "\"Eco-415\" Course Term Paper",
        "corrected": "\"Eco-415\" course term paper",
        "type": "capitalisation"
      }
    ]
  },
  "action_items": [
    "Add a References section with 2–3 named referees (name, designation, organisation, phone, email). This addresses the missing Bangladesh-expected references requirement.",
    "Rewrite the Experience section into bulleted, outcome-oriented statements for each role (3–5 bullets per role). Include any quantifiable results or deliverables (e.g., policy briefs produced, datasets cleaned, reports submitted).",
    "Update the resume format to a clean, modern template: standardise date formats (Month Year – Month Year), replace the heavy dividers with simple lines, and convert all headings to consistent title-case. Remove or refresh the 'Last Updated' line."
  ],
  "ats_analysis": {
    "inferred_role": "Research Economist / Development Economist",
    "inferred_industry": "Development economics / International development (NGO/UN) / Academia",
    "keyword_hits": [
      "Research Associate",
      "Economics",
      "BRAC Institute of Governance and Development",
      "BIGD",
      "United Nations Development Programme",
      "UNDP",
      "thesis",
      "course term paper",
      "FDI",
      "Labor Force Participation",
      "Public Health",
      "COVID-19",
      "Journal Article",
      "North South University",
      "Bangladesh"
    ],
    "keyword_gaps": [
      "Stata (or R)", 
      "Python (or SQL)", 
      "econometrics" 
    ],
    "heading_risks": [
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Non-standard heading for international ATS; could be parsed but not widely used.",
        "recommended": "Professional Experience"
      },
      {
        "original": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "Uncommon ATS heading; may hinder parsing of publications and outputs.",
        "recommended": "Selected Publications"
      }
    ],
    "ats_tips": [
      "Rename 'RECORD OF EMPLOYMENT' to 'Professional Experience' and 'SELECTED PUBLICATIONS AND OUTPUTS' to 'Selected Publications' to improve ATS parsing.",
      "Add a dedicated Skills section listing econometrics tools (e.g., Stata, R, Python) and key software (e.g., Excel, SQL) to boost keyword matches.",
      "Expand each work entry with bullet-point achievements and include at least one quantifiable outcome to improve ATS relevance and readability."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 81
}