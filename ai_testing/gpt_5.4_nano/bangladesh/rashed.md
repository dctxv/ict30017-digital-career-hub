---
resume: rashed
mode: bangladesh
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 114.7
  token_count: 1640
  cost_usd: 0.0027264
  duration_seconds: 14.3
---

## Analysis Output

{
  "formatting": {
    "score": 78,
    "feedback": "Overall structure is clear with conventional Bangladeshi headings, good spacing, and readable sections. Minor alignment/typography inconsistencies (bullets with mixed indentation) and a few formatting choices (e.g., long header lines and inconsistent use of punctuation) slightly reduce polish. ATS-wise, the resume is mostly parseable.",
    "issues": [
      {
        "section": "PROJECT EXPERIENCE",
        "issue": "Bullet indentation and spacing are inconsistent (some bullets are aligned with extra spaces, and line breaks interrupt the bullet flow).",
        "suggestion": "Use a single bullet indentation style across all projects (e.g., • at the same left margin) and keep each bullet to 1–2 lines with controlled wrapping."
      },
      {
        "section": "EDUCATIONAL QUALIFICATION",
        "issue": "Inconsistent punctuation/spacing within entries (e.g., 'Session: 2018-2019', 'Year of Passing: 2016', CGPA line formatting varies).",
        "suggestion": "Standardise the pattern for all education lines: e.g., 'Session/Year of Passing: 2018–2019' and keep 'CGPA: 3.52/4.00' on one line."
      },
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Line breaks break the sentence flow, which can look less professional.",
        "suggestion": "Rewrite as 2–3 clean lines with consistent sentence spacing (still keeping ATS-friendly text)."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "Strong alignment with structural engineering: clear education in civil engineering, relevant thesis topic, and a capstone project with specific tasks and codes/standards. Technical skills include core tools for structural analysis and design. Weaknesses are mainly quantification gaps in project bullets (some outcomes are not measurable) and limited detail for lab/field work results. References are properly included with full contact details (good for Bangladesh). Co-curricular activities are present, which is beneficial for a recent graduate.",
    "strengths": [
      "Career Objective is role-specific (structural engineer) and ties to structural analysis, foundation design, and coordination.",
      "Education includes both SSC and HSC with GPA clearly stated, plus thesis title relevant to structural engineering.",
      "Capstone project bullets reference relevant design activities and standards (ACI 318-19) and include deliverables (reinforcement plans, drawings, BoQ, final defence).",
      "Technical Skills include ETABS, SAP2000, STAAD Pro, AutoCAD and standards (BNBC 2020, ACI 318, AASHTO LRFD).",
      "References section includes two named referees with email and mobile numbers."
    ],
    "weaknesses": [
      "Project bullets are sometimes activity-focused without results/metrics (e.g., 'Developed structural drawings' and 'Prepared bill of quantities' are stated, but scope, structure type details, or performance outcomes are not quantified).",
      "Lab and Field Projects lack outcomes (e.g., soil investigation: no bearing capacity estimate value/range, foundation recommendation, or key findings; traffic volume count: no computed peak-hour/PCU summary or conclusion).",
      "Technical Skills list 'Intermediate'/'Basic' but does not specify evidence (e.g., which courses or project components used ETABS/SAP2000/STAAD Pro)."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "Language is clear and generally error-free. Minor grammar/wording improvements are possible for consistency and professionalism.",
    "issues": [
      {
        "original": "To begin a career as a structural engineer at a reputable construction or infrastructure consultancy firm in Bangladesh, applying knowledge in structural analysis, foundation design, and project coordination developed during undergraduate studies at CUET.",
        "corrected": "To begin my career as a structural engineer in a construction or infrastructure consultancy in Bangladesh, applying my knowledge of structural analysis, foundation design, and project coordination developed during my undergraduate studies at CUET.",
        "type": "wording/clarity"
      },
      {
        "original": "Capstone Design Project – Structural Design of a G+7 Commercial Building (Group)",
        "corrected": "Capstone Design Project: Structural Design of a G+7 Commercial Building (Group)",
        "type": "punctuation consistency"
      },
      {
        "original": "Delivered final report and 10-minute defence to faculty panel",
        "corrected": "Delivered the final report and a 10-minute presentation to the faculty panel",
        "type": "word choice"
      }
    ]
  },
  "action_items": [
    "Update PROJECT EXPERIENCE (Capstone Design Project) bullets to include at least 1 measurable detail per bullet (e.g., building elements analysed/design assumptions, number of load cases, storeys considered, reinforcement output scale, or any key results).",
    "Expand LAB AND FIELD PROJECTS with specific outcomes (e.g., bearing capacity range and foundation recommendation for the soil investigation; key traffic/PCU findings and the conclusion/implication for the intersection study).",
    "In TECHNICAL SKILLS, convert the current proficiency labels into evidence by adding brief context (e.g., 'ETABS: used for load combinations and frame analysis in capstone project' / 'MS Project: used for project scheduling').",
    "Refine CAREER OBJECTIVE to be even more compelling by adding one concrete strength from your resume (e.g., seismic vulnerability/thesis + design under ACI/ETABS/AutoCAD)."
  ],
  "ats_analysis": {
    "inferred_role": "Structural Engineer (Entry-level / Graduate)",
    "inferred_industry": "Construction / Infrastructure Consultancy / Structural Engineering",
    "keyword_hits": [
      "structural engineer",
      "structural analysis",
      "foundation design",
      "project coordination",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "STAAD Pro",
      "MS Project",
      "MATLAB",
      "BNBC 2020",
      "ACI 318",
      "AASHTO LRFD",
      "Civil Engineering",
      "reinforcement plans",
      "bill of quantities",
      "load calculations",
      "column and beam sizing",
      "ACI 318-19",
      "soil investigation",
      "bearing capacity estimation",
      "seismic vulnerability assessment",
      "RC Frame Structures"
    ],
    "keyword_gaps": [
      "Eurocode",
      "reinforced concrete (RC)",
      "load combinations"
    ],
    "heading_risks": [
      {
        "original": "CO-CURRICULAR ACTIVITIES",
        "issue": "Some ATS parsers are inconsistent with hyphenated headings and long separators; it may still parse, but not always reliably.",
        "recommended": "Use 'CO CURRICULAR ACTIVITIES' (without hyphen) or 'Extracurricular Activities'."
      }
    ],
    "ats_tips": [
      "Add a 'Load combinations' mention explicitly in PROJECT EXPERIENCE (e.g., in the capstone bullet describing analysis/design) so ATS keyword matching improves.",
      "In TECHNICAL SKILLS and/or PROJECT EXPERIENCE, include explicit wording for 'reinforced concrete (RC)' and how it relates to your design/thesis.",
      "Add a short 'Thesis/Final Year Project' one-liner in EDUCATION that includes your methods/tools (e.g., analysis method/software used) if applicable."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 77
}