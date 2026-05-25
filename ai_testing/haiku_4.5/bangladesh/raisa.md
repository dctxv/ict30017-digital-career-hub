---
resume: raisa
mode: bangladesh
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 112.3
  token_count: 2325
  cost_usd: 0.014993
  duration_seconds: 20.7
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows standard Bangladeshi CV conventions with clear section headings, consistent spacing, and professional layout. However, the formatting score is capped at 75 due to the presence of three or more Bangladeshi CV conventions (Personal Details section is absent but implied by email/LinkedIn; Declaration section absent; Career Objective absent; Academic Qualification heading present; Extracurricular Activities section present). This is not a penalty but reflects that modern digital ATS systems may struggle with some traditional elements. The resume is well-structured for Bangladeshi employers but may require minor adjustments for international digital applications.",
    "issues": [
      {
        "section": "Education and Qualifications",
        "issue": "HSC and SSC entries lack GPA/marks information and Education Board name",
        "suggestion": "Add GPA out of 5.00 and Education Board for each entry. Example: 'Higher School Certificate (HSC) — GPA: 4.50/5.00, Dhaka Board, 2017' and 'Secondary School Certificate (SSC) — GPA: 4.75/5.00, Dhaka Board, 2015'"
      },
      {
        "section": "Record of Employment",
        "issue": "Job titles and dates lack consistent formatting; current role shows 'PRESENT' in all caps while others use standard date format",
        "suggestion": "Standardise date formatting. Use 'December 2022 – Present' (consistent capitalisation) for the current role to match the style of other entries"
      },
      {
        "section": "Overall",
        "issue": "Resume lacks a References section with named referees and contact details",
        "suggestion": "Add a References section with at least two named referees including their full name, designation, organisation, phone number, and email address — this is standard practice for Bangladeshi employers"
      }
    ]
  },
  "content_quality": {
    "score": 62,
    "feedback": "The resume demonstrates strong academic credentials and relevant research experience, but lacks quantified impact and specific outcomes in job descriptions. Bullet points for employment roles are either absent or vague, making it difficult to assess concrete contributions. The publications section is a significant strength, but the employment section needs substantial expansion with metrics, deliverables, and measurable results. For a recent graduate with research focus, the extracurricular section is well-developed, but employment descriptions require immediate strengthening.",
    "strengths": [
      "Published research in a peer-reviewed international journal (Frontiers in Public Health) demonstrates strong academic credibility",
      "Clear progression from intern to trainee to full Research Associate role shows career development",
      "Relevant thesis and coursework directly aligned with current research role in economics",
      "Strong extracurricular leadership history (club officer, house captain) shows initiative and responsibility",
      "Diverse experience across UN, university, and research institute settings"
    ],
    "weaknesses": [
      "Employment section lacks bullet points describing specific responsibilities and outcomes — each role is listed with only title, dates, and organisation",
      "No quantified impact or metrics for any research role (e.g., 'analysed X datasets', 'contributed to Y publications', 'supported Z research projects')",
      "Current Research Associate role (December 2022–Present) has no description of duties or achievements",
      "UNDP internship (October 2021–March 2022) lacks any detail on projects, deliverables, or skills applied",
      "Research Assistant role description missing — unclear what specific research was conducted or what the candidate's contribution was",
      "No Technical Skills section despite research background — unclear what software, statistical tools, or programming languages the candidate uses",
      "Career Objective section is absent — no stated target role or career direction for employers to understand fit",
      "Trainee Research Associate role (June–November 2022) lacks description of transition activities or learning outcomes"
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The resume is well-written with correct grammar, proper punctuation, and professional tone throughout. Spelling is accurate and consistent. The use of Commonwealth English conventions (e.g., 'Comorbidity') is appropriate. However, there are minor inconsistencies in capitalisation and one instance of weak phrasing that could be strengthened.",
    "issues": [
      {
        "original": "Yearly In-Charge, North South University Art & Photography Club (2020-2021)",
        "corrected": "Yearly In-Charge, North South University Art & Photography Club (2020–2021)",
        "type": "Punctuation: Use en-dash (–) instead of hyphen (-) for date ranges"
      },
      {
        "original": "Vice President of Department of Events and Workshop, Viqarunnisa Noon Earth Club (2019-2021)",
        "corrected": "Vice President of Department of Events and Workshop, Viqarunnisa Noon Earth Club (2019–2021)",
        "type": "Punctuation: Use en-dash (–) instead of hyphen (-) for date ranges"
      },
      {
        "original": "House Captain, Viqarunnisa Noon School and College (2016-2017)",
        "corrected": "House Captain, Viqarunnisa Noon School and College (2016–2017)",
        "type": "Punctuation: Use en-dash (–) instead of hyphen (-) for date ranges"
      },
      {
        "original": "Vice-Captain, Viqarunnisa Noon School and College (2014-2015)",
        "corrected": "Vice-Captain, Viqarunnisa Noon School and College (2014–2015)",
        "type": "Punctuation: Use en-dash (–) instead of hyphen (-) for date ranges"
      }
    ]
  },
  "action_items": [
    "Add a Technical Skills section listing statistical software, programming languages, and research tools (e.g., STATA, R, Python, SPSS, Excel, qualitative analysis software). This is critical for research roles and will improve both ATS parsing and employer assessment.",
    "Expand the Record of Employment section with 2–3 bullet points per role describing specific projects, deliverables, and quantified outcomes. For example, under Research Associate: 'Conducted econometric analysis on [topic] using STATA, contributing to [X] publications' or 'Supported data collection for [project name] involving [Y] respondents across [Z] regions'.",
    "Add Education Board names and GPA/marks (out of 5.00) to HSC and SSC entries. Example: 'Higher School Certificate (HSC) — GPA: [X]/5.00, Dhaka Board, 2017'. This is standard for Bangladeshi employers and required for government/banking roles.",
    "Create a References section with at least two named referees including full name, designation, organisation, phone number, and email address. Bangladeshi employers expect this; 'available upon request' is not standard practice.",
    "Add a Career Objective section (2–3 sentences) specifying your target role (e.g., 'Research Economist', 'Development Economist', 'Policy Analyst') and one concrete strength. Example: 'Seeking a Research Economist or Policy Analyst role in development economics where I can apply my econometric expertise and published research experience to inform evidence-based policy in South Asia.'"
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Research Economist",
    "inferred_industry": "Development / Economics Research / International Development",
    "keyword_hits": [
      "Research Associate",
      "Economics",
      "BRAC",
      "UNDP",
      "econometric",
      "data analysis",
      "journal publication",
      "thesis",
      "labour force participation",
      "foreign direct investment",
      "COVID-19",
      "path analysis"
    ],
    "keyword_gaps": [
      "Statistical software (STATA, R, Python, SPSS) — not mentioned despite research role",
      "Data collection / fieldwork — no mention of primary or secondary data methods",
      "Policy analysis / policy brief — no evidence of policy-facing outputs or recommendations"
    ],
    "heading_risks": [
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "Some international ATS systems expect 'Work Experience' or 'Professional Experience' rather than 'Record of Employment'",
        "recommended": "Work Experience"
      },
      {
        "original": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "Non-standard heading; ATS may not recognise this as a publications section",
        "recommended": "Publications and Research Outputs"
      }
    ],
    "ats_tips": [
      "Add a Technical Skills section explicitly listing statistical software (STATA, R, Python, SPSS, Excel) and research methodologies (econometric analysis, qualitative research, survey design). Many ATS systems for research roles scan for these keywords.",
      "Expand job descriptions with specific project names, datasets, and methodologies. For example, instead of 'Research Associate', use 'Research Associate — COVID-19 Mortality Analysis' or 'Research Associate — Labour Force Participation Study'. This improves keyword matching for role-specific ATS queries.",
      "Add quantified metrics to employment bullet points (e.g., 'analysed data from 5,000+ respondents', 'contributed to 3 peer-reviewed publications', 'supported 2 policy briefs'). ATS systems for research roles often search for numeric indicators of scale and impact."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 75
}
```