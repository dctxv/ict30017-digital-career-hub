---
resume: shahriar
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 139.5
  token_count: 2204
  cost_usd: 0.00304584
  duration_seconds: 15.8
---

## Analysis Output

{
  "formatting": {
    "score": 68,
    "feedback": "Overall structure is clear (Experience → Skills → Certifications), with mostly consistent spacing and strong use of bullet points. However, several international-CV formatting conventions appear (e.g., “CAREER OBJECTIVE”, “EDUCATIONAL QUALIFICATION”, and a “DECLARATION” block), plus the Personal Information section contains multiple items that are inappropriate for international applications and also create ATS parsing risk. Minor alignment/consistency issues also appear: some bullets span multiple lines with irregular indentation, and contact details are formatted as address/mobile/email without a dedicated “Contact Details” heading.",
    "issues": [
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Heading is non-standard for international ATS/recruiter parsing (western recruiters typically prefer a “Professional Summary”).",
        "suggestion": "Rename to “Professional Summary” and convert to 3–4 achievement-focused lines."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading for international ATS (some ATS systems treat it as less reliably parsed).",
        "suggestion": "Rename to “Education”."
      },
      {
        "section": "PROFESSIONAL EXPERIENCE",
        "issue": "Bullets contain inconsistent indentation and line wrapping, which can reduce readability on mobile/ATS text extraction.",
        "suggestion": "Ensure every bullet starts at the same indentation level and keep line lengths consistent (e.g., use single-line bullets with wrapping, not uneven hanging indents)."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Includes multiple items that are inappropriate for international applications (parents’ names, DOB, religion, marital status).",
        "suggestion": "Remove all of these fields from the resume entirely; keep only “Contact Details” (name + phone + email are fine; location is optional)."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Gender and nationality are personal demographic data that can introduce bias and are commonly removed in international resumes.",
        "suggestion": "Remove Gender and Nationality from the resume; rely on experience/skills."
      },
      {
        "section": "DECLARATION",
        "issue": "Declaration section is a Bangladeshi CV convention and wastes page space for international applications.",
        "suggestion": "Remove the “DECLARATION” section entirely."
      },
      {
        "section": "TECHNICAL SKILLS",
        "issue": "Technical Skills section mixes tools, standards, and specialisation into a single block; could be clearer for ATS and recruiters.",
        "suggestion": "Split into separate lines like: “Tools”, “Standards & Frameworks”, “Competencies”."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The resume is strong for a Senior Electrical Engineer / Power Systems / Substation & SCADA direction: experience is directly relevant, bullets are action-oriented, and many achievements are quantified (MW served, team size, budget, response time reduction, fault isolation time reduction, DGA outage reduction, cost savings). The main content weakness is that some early-career bullets are less measurable and use softer phrasing. Also, the resume would benefit from a clearer “scope” statement for the Senior role (e.g., responsibilities across design/standards/commissioning, typical deliverables, and regulatory/contract frameworks) and a tighter mapping of skills to outcomes.",
    "strengths": [
      "Highly relevant experience in HV/MV substations, SCADA integration, and protection relay coordination (IEC 61850 noted).",
      "Strong quantification in the current role (18 substations, 40% faster monitoring response, fault isolation reduced from 45 to 12 minutes).",
      "Cost and reliability impact are clearly stated (8% cost saving; 23% reduction in unplanned outages over 24 months).",
      "Project procurement and FAT exposure add credibility for EPC/substation lifecycle work.",
      "Technical tool list includes widely used engineering software (ETAP, AutoCAD Electrical, PowerFactory, MATLAB/Simulink)."
    ],
    "weaknesses": [
      "Junior role bullets are not sufficiently quantified and some are outcome-light (e.g., “Prepared daily and weekly plant operations reports”, “Participated in commissioning…”). Add specific results, KPIs, or what you verified/achieved.",
      "Some bullets use broad responsibility verbs without specifying deliverables or measurable outcomes (e.g., “Performed scheduled and corrective maintenance…”—add failure rate reduction, availability improvement, or key system/asset types).",
      "Professional Summary would be more aligned for international hiring than “CAREER OBJECTIVE”, and could better position seniority and scope in 3–4 lines.",
      "Certifications section could include dates more consistently (some have years; keep formatting uniform) and clarify “PMP in progress” status (month/year started if available)."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "Language is professional and mostly grammatically correct. The main issues are minor punctuation/consistency (e.g., “22 January, 1991” style, comma placement), and one couple of places where capitalization/parallel structure could be slightly tightened.",
    "issues": [
      {
        "original": "Reducing remote monitoring response time by 40% and cutting fault isolation time from 45 to 12 minutes",
        "corrected": "Reducing remote monitoring response time by 40% and cutting fault isolation time from 45 minutes to 12 minutes",
        "type": "grammar/parallel structure"
      },
      {
        "original": "reducing unplanned outages by 23% over 24 months",
        "corrected": "reducing unplanned outages by 23% over a 24-month period",
        "type": "clarity/style"
      },
      {
        "original": "Project Management Professional (PMP) in progress, expected completion December 2026",
        "corrected": "Project Management Professional (PMP) — in progress; expected completion: December 2026",
        "type": "punctuation/format consistency"
      },
      {
        "original": "English  : Professional working proficiency (reading, writing and technical communication)",
        "corrected": "English: Professional working proficiency (reading, writing, and technical communication)",
        "type": "punctuation/oxford comma consistency"
      }
    ]
  },
  "action_items": [
    "Replace the heading “CAREER OBJECTIVE” with “Professional Summary” and rewrite it into 3–4 lines focused on measurable senior-level outcomes (use your SCADA/132 kV/substation and reliability achievements).",
    "Remove the entire “PERSONAL INFORMATION” block and re-create “Contact Details” containing only phone/email (location optional). Specifically remove: parents’ names, date of birth, religion, marital status, gender, and nationality.",
    "Remove the “DECLARATION” section completely (signature can be omitted for international applications).",
    "Strengthen the “Junior Electrical Engineer” bullets by adding 1–2 measurable outcomes or specific deliverables per bullet (e.g., availability/MTTR improvement, number of panels tested, specific interlocks/relays verified, or KPI improvements).",
    "Re-structure “TECHNICAL SKILLS” into clearer ATS-friendly lines: “Tools”, “Standards”, and “Competencies” (so ATS and recruiters can extract keywords more reliably)."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer (Power Systems / HV Substation Design / SCADA & IEC 61850 / Protection & Relay Coordination)",
    "inferred_industry": "Electric power transmission & grid infrastructure (Utilities / EPC / Power Systems)",
    "keyword_hits": [
      "132 kV",
      "substation design",
      "SCADA",
      "IEC 61850",
      "protection relay coordination",
      "power transformer",
      "dissolved gas analysis (DGA)",
      "fault isolation",
      "remote monitoring",
      "EPC",
      "FAT (factory acceptance testing)",
      "ETAP 20",
      "AutoCAD Electrical",
      "DIgSILENT PowerFactory",
      "MATLAB/Simulink",
      "MS Project",
      "IEC 60909",
      "IEEE C37",
      "BNBC 2020",
      "project management"
    ],
    "keyword_gaps": [
      "AC substation commissioning",
      "GIS (Gas Insulated Switchgear) / GIS substations (if applicable)",
      "SLD (single line diagram) deliverables / design documentation standards"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading for international ATS; some systems may treat it as unstructured text and lose context.",
        "recommended": "Use “Professional Summary”."
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading for ATS parsing consistency across multinational companies.",
        "recommended": "Use “Education”."
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Demographic/disclosure-heavy section increases ATS noise and is likely to be stripped/penalized during screening.",
        "recommended": "Replace with “Contact Details” containing only phone and email (and optionally city/country)."
      }
    ],
    "ats_tips": [
      "Remove the entire “PERSONAL INFORMATION” section because international ATS systems and recruiters will likely remove or discount resumes containing personal demographic information (parents’ names, DOB, religion, marital status, gender, nationality).",
      "Change “CAREER OBJECTIVE” to “Professional Summary” and place the most relevant keywords in the first 2–3 lines (e.g., “132 kV substation design”, “SCADA”, “IEC 61850”, “protection relay coordination”).",
      "Make the “TECHNICAL SKILLS” section more extractable by splitting it into separate keyword lines (“Tools”, “Standards”, “Competencies”) instead of mixing tools, standards, and specialisation in one paragraph."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}