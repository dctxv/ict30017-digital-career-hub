---
resume: shahriar
mode: bangladesh
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 91.8
  token_count: 1753
  cost_usd: 0.012718
  duration_seconds: 19.1
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows standard Bangladeshi CV conventions with clear section organisation, consistent spacing, and professional layout. However, the formatting score is capped at 75 due to the presence of three or more Bangladeshi CV conventions (Personal Information, Declaration, and References sections). This is an educational note about modern digital applications: many international ATS systems and Western recruiters do not parse these sections effectively, and they consume valuable space. For international applications, consider a dual-format approach.",
    "issues": [
      {
        "section": "References",
        "issue": "Section contains only 'References available upon request' without named referees and contact details",
        "suggestion": "Add at least two named references with full contact details (name, designation, organisation, phone, email) as expected by Bangladesh employers. Example format: 'Mr. Kamal Hossain, Chief Engineer, PGCB, Dhaka | Phone: 01712-XXXXXX | Email: kamal.hossain@pgcb.gov.bd'"
      }
    ]
  },
  "content_quality": {
    "score": 88,
    "feedback": "The resume demonstrates strong technical depth, quantified achievements, and clear career progression. The Career Objective is specific and role-focused. Professional experience bullets are well-structured with measurable outcomes. However, one content weakness has been identified regarding the References section.",
    "strengths": [
      "Career Objective is specific, role-targeted, and references concrete background (8 years, 132 kV substation design, SCADA, team leadership)",
      "All professional experience bullets are quantified with metrics: 180 MW load, 40% response time reduction, 23% outage reduction, BDT 450 million procurement, 8% cost saving",
      "Clear career progression from Junior (2014) to Senior (2019) with increasing scope and leadership responsibility",
      "Technical Skills section is comprehensive and industry-relevant, including standards (IEC 61850, IEEE C37) and specialisations",
      "Professional certifications demonstrate continuous learning and commitment to industry standards",
      "Educational qualifications include both university CGPA and SSC/HSC results with GPA denominators correctly formatted"
    ],
    "weaknesses": [
      "References section contains only 'available upon request' instead of named referees with contact details. Bangladesh employers, particularly in banking, government, and large corporates, expect 2–3 named references with full contact details (name, designation, organisation, phone, email). Add specific referees immediately."
    ]
  },
  "language_grammar": {
    "score": 94,
    "feedback": "The resume demonstrates excellent language quality with professional terminology, consistent tense usage, and clear technical communication. No spelling errors detected. Commonwealth English spelling conventions are correctly applied throughout (e.g. 'organisation', 'programme'). Minor observations noted below.",
    "issues": [
      {
        "original": "Mentored 4 junior engineers and conducted 6 in-house training sessions on IEC 61850 protection relay coordination reaching 28 operations staff",
        "corrected": "Mentored 4 junior engineers and conducted 6 in-house training sessions on IEC 61850 protection relay coordination, reaching 28 operations staff",
        "type": "punctuation/clarity — comma before 'reaching' improves readability"
      }
    ]
  },
  "action_items": [
    "Add a References section with at least two named referees including full name, designation, organisation, phone number, and email address. Replace 'References available upon request' immediately — this is not standard practice for Bangladesh employers and signals incomplete preparation.",
    "Expand the Junior Electrical Engineer role bullets to include quantified outcomes. Currently, bullets such as 'Performed scheduled and corrective maintenance' and 'Prepared daily and weekly plant operations reports' lack specific impact metrics. Rewrite as: 'Performed scheduled and corrective maintenance on 11 kV and 33 kV distribution feeders, achieving 98% uptime across 4 industrial zones in Narayanganj' or similar.",
    "Add a Final Year Project or Thesis entry under Educational Qualification. As a BUET graduate in Electrical Engineering (2010), include your thesis/project title and a one-line description of the topic or outcome. This is expected by Bangladesh employers for recent engineering graduates and demonstrates research exposure.",
    "For international ATS applications, create a second version of this resume without the Personal Information, Declaration, and References sections. These conventions reduce ATS parsing accuracy and consume space that could highlight additional technical skills or certifications relevant to multinational employers.",
    "Verify and add the PMP certification completion date once finalised. Currently listed as 'expected completion December 2026' — update this to actual completion date and certification number once obtained, as this strengthens credentials for senior-level roles."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer / Power Systems Engineer",
    "inferred_industry": "Energy / Power Generation / Utilities",
    "keyword_hits": [
      "132 kV substation design",
      "SCADA implementation",
      "power systems",
      "protection relay coordination",
      "IEC 61850",
      "ETAP",
      "AutoCAD Electrical",
      "DIgSILENT PowerFactory",
      "HV/MV substation",
      "power transformers",
      "short circuit studies",
      "load flow analysis",
      "EPC project management",
      "grid modernisation",
      "predictive maintenance"
    ],
    "keyword_gaps": [
      "Load flow analysis / Power flow studies (implied in 'Power System Studies' but not explicitly named)",
      "Fault analysis / Transient stability (core competency for senior power systems roles, not explicitly mentioned)",
      "Renewable energy integration / Grid integration (increasingly required for modern power sector roles)"
    ],
    "heading_risks": [
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Some international ATS systems expect 'Education' or 'Academic Background' rather than 'Educational Qualification'",
        "recommended": "Education (or retain current heading for Bangladesh-focused applications)"
      },
      {
        "original": "PROFESSIONAL CERTIFICATIONS",
        "issue": "Some ATS systems parse 'Certifications' or 'Credentials' more reliably than 'Professional Certifications'",
        "recommended": "Certifications (or retain current heading for Bangladesh-focused applications)"
      }
    ],
    "ats_tips": [
      "Add explicit mention of 'load flow analysis' and 'fault analysis' in the Technical Skills section or within a Professional Experience bullet. These are high-frequency keywords in international power systems job postings and are currently implied but not named.",
      "Include 'grid integration' or 'renewable energy' in a bullet point if you have relevant experience. Modern power sector ATS systems increasingly screen for these keywords due to global energy transition priorities.",
      "Expand the Software section to include any additional tools used: if you have experience with PSSE (PSS/E), POWERWORLD, or NEPLAN, add these explicitly. These are common ATS keywords for senior power systems roles in multinational utilities."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 89
}
```