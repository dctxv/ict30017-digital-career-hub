---
resume: rashed
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 149
  token_count: 2191
  cost_usd: 0.00332155
  duration_seconds: 14.7
---

## Analysis Output

{
  "formatting": {
    "score": 58,
    "feedback": "The resume is clear and mostly readable, with logical section ordering for a civil/structural background. However, it includes multiple Bangladeshi CV conventions and personal demographic fields that are discouraged for international applications. Formatting is also inconsistent in indentation (e.g., bullets under PROJECT EXPERIENCE), and some sections use non-standard headings (e.g., 'CAREER OBJECTIVE', 'PERSONAL INFORMATION', 'DECLARATION') which can reduce ATS parsing reliability. Address/contact placement is fine for readability, but personal details should be limited for international ATS screening.",
    "issues": [
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Heading is non-standard for international ATS systems and may be hard to interpret.",
        "suggestion": "Replace 'CAREER OBJECTIVE' with 'PROFESSIONAL SUMMARY' (1–3 lines focused on skills + role target)."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Heading is a Bangladeshi-style section title and may reduce ATS consistency.",
        "suggestion": "Use 'EDUCATION' as the section heading."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Contains multiple fields that are not expected in international resumes and can trigger bias/privacy filtering.",
        "suggestion": "Remove the entire personal information block and keep only 'Contact Details' (name + email + phone + location optional)."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 64,
    "feedback": "Strong foundation for structural engineering: relevant education, capstone structural design, and credible technical skills (AutoCAD, ETABS, SAP2000, STAAD Pro). The project bullets are generally specific and reference standards (ACI 318-19, ACI loading/element sizing). However, several bullets are not quantified (e.g., drawings scale, project size, loads range, number of beams/columns designed, design checks, model details, deliverables). Internships/work experience is not shown—only academic projects and co-curricular work—so the resume may look junior for international consultancy roles unless you emphasise model-building and design checks with measurable outcomes.",
    "strengths": [
      "Capstone project includes relevant structural engineering tasks: structural drawings, reinforcement planning, load calculations, element sizing using ACI 318-19, and client-facing BOQ/cost estimate.",
      "Technical skills list includes mainstream structural analysis tools (ETABS, SAP2000, STAAD Pro) and project management software (MS Project).",
      "Research/thesis topic aligns with structural vulnerability/seismic assessment, indicating technical depth."
    ],
    "weaknesses": [
      "No professional work experience/internship section is provided; this may limit competitiveness for consulting roles unless project outcomes are made more concrete.",
      "Several project bullets lack measurable details (e.g., 'Developed structural drawings' and 'Performed gravity load calculations' without stating building size, number of storeys/frames, load values, or design scope).",
      "Under 'Lab and Field Projects', bullets are descriptive but not tied to results (e.g., bearing capacity range/soil parameters obtained; traffic volume/PCU findings and how they were used).",
      "Technical skills list includes standards (BNBC 2020, ACI 318, AASHTO LRFD) but does not clarify proficiency (e.g., 'used BNBC 2020 for seismic provisions' or 'applied AASHTO LRFD for X module')."
    ]
  },
  "language_grammar": {
    "score": 84,
    "feedback": "Language is professional and largely grammatically correct. Minor consistency issues exist (e.g., spacing in bullet indentation and inconsistent punctuation). No major spelling errors found. A couple of phrases can be tightened for clarity and ATS keyword alignment.",
    "issues": [
      {
        "original": "Capstone Design Project – Structural Design of a G+7 Commercial Building (Group)",
        "corrected": "Capstone Design Project — Structural Design of a G+7 Commercial Building (Group)",
        "type": "Punctuation/format consistency"
      },
      {
        "original": "Prepared bill of quantities and preliminary cost estimate for client presentation",
        "corrected": "Prepared bill of quantities (BOQ) and preliminary cost estimate for client presentation.",
        "type": "Clarity/consistency"
      },
      {
        "original": "Delivered final report and 10-minute defence to faculty panel",
        "corrected": "Delivered the final report and a 10-minute presentation to the faculty panel.",
        "type": "Word choice"
      }
    ]
  },
  "action_items": [
    "Replace 'CAREER OBJECTIVE' with a 'PROFESSIONAL SUMMARY' (3–4 lines) that emphasises structural analysis, seismic design/vulnerability knowledge, and tools (ETABS/SAP2000/STAAD Pro/AutoCAD) rather than focusing on 'begin a career'.",
    "Remove the entire 'PERSONAL INFORMATION' section and re-create a 'CONTACT DETAILS' section; do not include parent's names, date of birth, religion, marital status, or blood group.",
    "Under 'PROJECT EXPERIENCE', rewrite each bullet to include at least one measurable detail or specific output (e.g., building dimensions/storey count confirmation, number of frames/columns designed, load values or design checks performed, soil parameters/bearing capacity result, traffic volume/PCU totals).",
    "Remove the 'DECLARATION' section completely and replace that space with either an 'INTERNSHIP / PROFESSIONAL EXPERIENCE' heading (if applicable) or a 'RELEVANT COURSES' / 'ACHIEVEMENTS' section.",
    "Rename 'EDUCATIONAL QUALIFICATION' to 'EDUCATION' and standardize list spacing/indentation so ATS and recruiters parse bullets consistently."
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer (Entry-level / Graduate)",
    "inferred_industry": "Construction / Infrastructure Consulting (Structural Design & Analysis)",
    "keyword_hits": [
      "Structural analysis",
      "foundation design",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "STAAD Pro",
      "MS Project",
      "MATLAB",
      "ACI 318",
      "AASHTO LRFD",
      "BNBC 2020",
      "Seismic Vulnerability Assessment",
      "reinforcement plans",
      "bill of quantities"
    ],
    "keyword_gaps": [
      "AutoCAD Civil 3D",
      "Revit",
      "Structural design checks (e.g., ULS/SLS, load combinations) explicitly stated"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading for ATS; some systems expect 'Professional Summary' instead.",
        "recommended": "Use 'PROFESSIONAL SUMMARY'."
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard ATS heading; can reduce parsing consistency.",
        "recommended": "Use 'EDUCATION'."
      },
      {
        "original": "PROJECT EXPERIENCE",
        "issue": "Could be parsed, but some ATS configurations perform better with 'PROJECTS' when it’s purely academic.",
        "recommended": "Use 'PROJECTS' (or 'ACADEMIC PROJECTS')."
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "ATS may parse demographic fields as signals for bias filtering and may reduce recruiter review quality.",
        "recommended": "Replace with 'CONTACT DETAILS' containing only email, phone, and city/region."
      },
      {
        "original": "DECLARATION",
        "issue": "Non-standard for international ATS and wastes space; may be treated as extra content.",
        "recommended": "Remove entirely."
      }
    ],
    "ats_tips": [
      "Remove personal demographic information in 'PERSONAL INFORMATION' (parents' names, date of birth, religion, marital status, blood group). International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Increase explicit ATS keyword coverage in 'TECHNICAL SKILLS' and 'PROJECT EXPERIENCE' by adding exact structural workflow terms already implied (e.g., 'load combinations', 'ULS/SLS checks', 'reinforced concrete frame design', 'seismic provisions') where you actually used them.",
      "Standardize section headings and bullet spacing (e.g., replace 'EDUCATIONAL QUALIFICATION' with 'EDUCATION' and make all project bullets same indentation) to improve ATS parsing reliability."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 68
}