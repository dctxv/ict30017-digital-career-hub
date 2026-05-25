---
resume: shahriar
mode: bangladesh
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 109.6
  token_count: 1754
  cost_usd: 0.0028995
  duration_seconds: 16
---

## Analysis Output

{
  "formatting": {
    "score": 78,
    "feedback": "Overall structure is clear with standard section headings and strong use of bullets in the experience sections. Minor formatting issues (inconsistent spacing/line breaks and a couple of abbreviation/format inconsistencies) reduce polish slightly. You included multiple Bangladesh CV conventions (including Personal Details, Photograph not provided, Career Objective heading, Educational Qualification heading, Technical Skills heading, Declaration), which modern ATS systems can still parse well as text, but the visual formatting would benefit from slightly tighter spacing.",
    "issues": [
      {
        "section": "Educational Qualification",
        "issue": "Uses mixed session/year formatting and CGPA line breaks; also BUET entry shows \"Session: 2009-2010\" which may confuse readers expecting year of passing.",
        "suggestion": "Use a consistent pattern per qualification: \"Year of passing\" (or \"Graduation year\"), institution, board (if applicable), GPA/CGPA format."
      },
      {
        "section": "Language Proficiency",
        "issue": "Capitalisation/spacing varies (e.g., \"reading, writing and technical communication\" in one line; overall alignment is slightly inconsistent with other sections).",
        "suggestion": "Keep the same punctuation style across languages (e.g., \"Reading, writing, and technical communication\"), and align value text to one line or a consistent two-line wrap."
      },
      {
        "section": "Professional Experience",
        "issue": "Bullets include long wrapped lines that slightly affect readability (indentation/line breaks differ per bullet).",
        "suggestion": "Ensure uniform bullet formatting: same indentation, line wrap width, and one consistent punctuation style (e.g., end all bullets with periods or none consistently)."
      }
    ]
  },
  "content_quality": {
    "score": 88,
    "feedback": "Strong, highly relevant experience for power systems, HV/MV substation engineering, SCADA/IEC 61850, procurement/evaluation, and reliability improvements. You also quantified outcomes (budget/schedule, response time reduction, fault isolation reduction, cost savings, outage reduction), which is excellent for Bangladesh employers. The main content weaknesses are: missing named references with contact details (common expectation in Bangladesh), and the certifications section lists \"PMP in progress\" without a credential/issuing body completion status clarity (acceptable, but tighten wording). Career Objective content is strong and specific—no change needed beyond minor tightening.",
    "strengths": [
      "Career Objective is targeted and specific to Senior Electrical Engineer in power systems/industrial automation, referencing your exact experience areas (132 kV substations, SCADA, team leadership).",
      "Professional experience bullets are outcome/metric-driven (e.g., completed ahead of schedule, 40% response time reduction, 8% cost saving, 23% outage reduction).",
      "Technical alignment: IEC 61850, HV/MV substation design, SCADA systems, relay coordination, power system studies.",
      "Experience includes both engineering delivery (design, studies, commissioning) and organisational responsibilities (team leadership, bid evaluation, mentoring, training)."
    ],
    "weaknesses": [
      "References section only states: \"References available upon request.\" Bangladesh employers typically expect 2–3 named referees with designation, organisation, and contact details.",
      "One educational line may be unclear to recruiters: \"Session: 2009-2010\" for BUET could be interpreted as an incomplete timeframe rather than graduation year.",
      "Some technical-scope specificity is slightly broad without context (e.g., FAT scope is clear, but results like defects reduced/acceptance criteria passed could further strengthen impact)."
    ]
  },
  "language_grammar": {
    "score": 92,
    "feedback": "Language is professional and largely error-free. A few punctuation/consistency issues appear (hyphen spacing and serial comma style). No spelling errors that would be problematic in common English usage.",
    "issues": [
      {
        "original": "Duration: April 2019 – Present",
        "corrected": "Duration: April 2019 – Present (or April 2019 – Current)",
        "type": "Style consistency"
      },
      {
        "original": "To lead high-impact power systems and industrial automation projects as a Senior\nElectrical Engineer, drawing on over eight years of experience in 132 kV substation\ndesign, SCADA implementation, and cross-functional team leadership in Bangladesh's\nenergy sector to deliver infrastructure that improves national grid reliability.",
        "corrected": "To lead high-impact power systems and industrial automation projects as a Senior Electrical Engineer, drawing on 8+ years of experience in 132 kV substation design, SCADA implementation, and cross-functional team leadership in Bangladesh’s energy sector to deliver infrastructure that improves national grid reliability.",
        "type": "Clarity/consistency"
      },
      {
        "original": "Marital Status: Married",
        "corrected": "Marital status: Married",
        "type": "Capitalisation consistency"
      }
    ]
  },
  "action_items": [
    "Replace the References section content from \"References available upon request.\" to include 2–3 named referees with designation, organisation, phone, and email (most expected in the Bangladesh market).",
    "In Educational Qualification, revise the BUET line from \"Session: 2009-2010\" to a consistent \"Year of passing\" (or \"Graduation year\") so screening recruiters can verify your academic timeline quickly.",
    "In Professional Experience (Power Grid Company of Bangladesh), tighten one bullet by adding a short specification of the substations/SCADA scope (e.g., number/type of bays, whether engineering included IEC 61850 IED mapping, GOOSE/MMS specifics) to strengthen keyword match and technical credibility.",
    "In Technical Skills, consider formatting \"Software\" and \"Standards\" as single-line entries per item (ETAP 20, AutoCAD Electrical, etc.) to improve scan-ability without changing content."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer (Power Systems / Substation & SCADA)",
    "inferred_industry": "Power transmission & distribution / Grid modernization (utilities, EPC, power generation)",
    "keyword_hits": [
      "132 kV",
      "SCADA",
      "IEC 61850",
      "Protection and Relay Coordination",
      "DGA",
      "Dissolved gas analysis",
      "Substation",
      "Single line diagrams",
      "Short circuit studies",
      "Cable sizing",
      "FAT",
      "Medium-voltage switchgear",
      "EPC",
      "Project Management",
      "MS Project",
      "AutoCAD Electrical",
      "ETAP",
      "DIgSILENT PowerFactory",
      "MATLAB/Simulink",
      "BNBC 2020",
      "IEC 60909",
      "IEEE C37",
      "PMP"
    ],
    "keyword_gaps": [
      "IEC 60870-5",
      "RTU",
      "GIS (if applicable to your substations)"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL INFORMATION",
        "issue": "International ATS systems typically do not parse personal-details fields into structured data reliably; it may still be ingested as text but is sometimes ignored during screening.",
        "recommended": "Keep it as-is, but ensure the ATS can still find core sections (Experience/Education/Skills) clearly with standard wording."
      }
    ],
    "ats_tips": [
      "Add a small (1–2 line) summary within Professional Experience that states the core responsibilities for the Senior Electrical Engineer role (substation design + SCADA/IEC 61850) so ATS match improves for summary-based keyword extraction.",
      "Replace \"References available upon request.\" with named referees so ATS captures contact text and avoids missing a frequently searched section in some workflows.",
      "Ensure consistent use of abbreviations: if you use \"kV\" and \"kV\" formatting is consistent, also standardise spacing (e.g., \"132 kV\" everywhere)."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 87
}