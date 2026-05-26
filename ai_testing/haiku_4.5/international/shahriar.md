---
resume: shahriar
mode: international
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 113.3
  token_count: 2401
  cost_usd: 0.015478
  duration_seconds: 21.2
---

## Analysis Output

```json
{
  "formatting": {
    "score": 52,
    "feedback": "The resume contains multiple Bangladeshi CV conventions that are inappropriate for international applications and create significant formatting issues. Six personal demographic fields (father's name, mother's name, date of birth, gender, religion, marital status) are present, along with a declaration section and non-standard section headings. These elements collectively reduce the resume's suitability for Western ATS systems and multinational recruiters. The visual structure itself is clean and well-organised, but the content violations are substantial. Section headings like 'CAREER OBJECTIVE' and 'EDUCATIONAL QUALIFICATION' are non-standard for international resumes. The resume would score 75+ if these elements were removed.",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Information",
        "issue": "Religion is personal information that can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Section Headings",
        "issue": "'CAREER OBJECTIVE' is a non-standard heading for international ATS systems.",
        "suggestion": "Rename to 'PROFESSIONAL SUMMARY' for better ATS compatibility."
      },
      {
        "section": "Section Headings",
        "issue": "'EDUCATIONAL QUALIFICATION' is a non-standard heading for international ATS systems.",
        "suggestion": "Rename to 'EDUCATION' for better ATS compatibility."
      },
      {
        "section": "Personal Information",
        "issue": "The 'Personal Information' section heading itself is non-standard; international resumes use 'Contact Details' or omit this section entirely.",
        "suggestion": "Rename to 'CONTACT DETAILS' or remove the section header and integrate contact information at the top of the resume."
      }
    ]
  },
  "content_quality": {
    "score": 82,
    "feedback": "The resume demonstrates strong technical depth and quantification across all professional roles. Bullet points are specific, outcome-focused, and include measurable results. The progression from Junior to Senior Engineer is clear, and the candidate's impact is well-documented. However, there are minor gaps: the HSC and SSC sections are excessive for a candidate with a bachelor's degree and 8+ years of experience, and the 'Gender' field in Personal Information adds no professional value. The technical skills section is well-structured and relevant. The PMP certification is listed as 'in progress' with a future completion date (December 2026), which is appropriate transparency but should be monitored for relevance.",
    "strengths": [
      "Excellent quantification across all roles: specific MW loads, percentage improvements (40% monitoring response, 23% outage reduction), team sizes, and budget figures (BDT 450 million).",
      "Clear progression and scope expansion from Junior to Senior Engineer, with leadership and mentoring responsibilities demonstrated.",
      "Strong technical specificity: IEC 61850, SCADA, DGA, protection relay coordination, and EPC project management are all concrete and relevant.",
      "Bullet points focus on outcomes and impact rather than task descriptions (e.g., 'reducing response time by 40%' rather than 'worked on SCADA').",
      "Professional certifications are relevant and recent (2020–2021), with one in progress."
    ],
    "weaknesses": [
      "HSC and SSC qualifications are unnecessary for a senior engineer with a bachelor's degree and 8+ years of experience; they consume valuable space.",
      "The 'Gender' field in Personal Information is not professionally relevant and should be removed.",
      "No mention of publications, conference presentations, or thought leadership activities that might strengthen a senior-level profile.",
      "The 'References available upon request' line is standard but adds no value; it can be omitted.",
      "No explicit mention of budget management or P&L responsibility, which would strengthen the senior engineer positioning."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The resume is well-written with professional language, consistent tense usage, and strong action verbs. British/Commonwealth English spelling conventions are correctly applied throughout (e.g., 'organisation', 'optimise' would be appropriate if used). There are no significant grammatical errors. Minor observations: the phrase 'reaching 28 operations staff' in the mentoring bullet is slightly awkward phrasing; 'training 28 operations staff' would be clearer. The technical terminology is accurate and appropriately used. Overall, the language quality is professional and suitable for international applications.",
    "issues": [
      {
        "original": "conducted 6 in-house training sessions on IEC 61850 protection relay coordination reaching 28 operations staff",
        "corrected": "conducted 6 in-house training sessions on IEC 61850 protection relay coordination, training 28 operations staff",
        "type": "Phrasing clarity"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information immediately: father's name, mother's name, date of birth, gender, religion, and marital status. These fields create discrimination risks and are not expected in international applications. Retain only: name, address, phone, email, and nationality (if required by the specific job posting).",
    "Delete the 'DECLARATION' section and signature line entirely. This is a Bangladeshi CV convention that wastes space and is not used by international recruiters or ATS systems.",
    "Rename 'CAREER OBJECTIVE' to 'PROFESSIONAL SUMMARY' and 'EDUCATIONAL QUALIFICATION' to 'EDUCATION'. Update 'PERSONAL INFORMATION' to 'CONTACT DETAILS' or remove the section header. These changes will improve ATS parsing and align with international resume standards.",
    "Remove the HSC and SSC qualifications from the Education section. For a senior engineer with 8+ years of experience and a bachelor's degree from a top-tier institution (BUET), secondary school qualifications are not relevant and consume valuable space.",
    "Add a quantified statement about budget or P&L responsibility in the Senior Electrical Engineer role to strengthen senior-level positioning. For example, add a bullet about total project value managed or cost savings achieved across the portfolio."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer (Power Systems / Grid Infrastructure)",
    "inferred_industry": "Energy / Power Generation / Utilities",
    "keyword_hits": [
      "132 kV substation design",
      "SCADA implementation",
      "power systems",
      "protection relay coordination",
      "IEC 61850",
      "grid modernisation",
      "predictive maintenance",
      "dissolved gas analysis",
      "EPC project management",
      "ETAP",
      "AutoCAD Electrical",
      "DIgSILENT PowerFactory",
      "short circuit studies",
      "medium-voltage switchgear",
      "factory acceptance testing"
    ],
    "keyword_gaps": [
      "Asset management or asset lifecycle management (commonly required for senior utility roles)",
      "Regulatory compliance or grid code compliance (increasingly important for power sector roles)",
      "Risk assessment or failure mode analysis (expected for senior engineering roles)"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading; many international ATS systems expect 'PROFESSIONAL SUMMARY' or 'SUMMARY' and may fail to parse 'CAREER OBJECTIVE' correctly.",
        "recommended": "PROFESSIONAL SUMMARY"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading; international ATS systems expect 'EDUCATION' and may not recognise 'EDUCATIONAL QUALIFICATION'.",
        "recommended": "EDUCATION"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "Non-standard heading; international ATS systems expect 'CONTACT DETAILS' or do not expect this section at all. The presence of demographic fields here will likely trigger filtering or removal by international recruiters.",
        "recommended": "CONTACT DETAILS (or omit section header and place contact info at resume top)"
      }
    ],
    "ats_tips": [
      "Remove all personal demographic fields (father's name, mother's name, date of birth, religion, marital status) from the resume. International ATS systems and recruiters will likely remove or discount resumes containing this information, and it may trigger automated filtering in compliance-conscious organisations.",
      "Add explicit keywords for regulatory and compliance frameworks relevant to power systems: include terms such as 'grid code compliance', 'regulatory standards', 'asset management', or 'risk assessment' in a revised bullet or skills section to improve matching with senior utility and multinational energy sector roles.",
      "Expand the Technical Skills section to include any experience with enterprise resource planning (ERP) systems, geographic information systems (GIS), or condition monitoring platforms. These are commonly searched keywords in ATS systems for senior power systems roles and are currently absent."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 74
}
```