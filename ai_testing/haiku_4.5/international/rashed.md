---
resume: rashed
mode: international
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 110.6
  token_count: 2864
  cost_usd: 0.017612
  duration_seconds: 25.9
---

## Analysis Output

```json
{
  "formatting": {
    "score": 48,
    "feedback": "The resume contains multiple Bangladeshi CV conventions that are inappropriate for international applications. Six critical personal demographic elements are present (father's name, mother's name, date of birth, religion, marital status, blood group), plus a declaration section and non-standard section headings. These elements collectively reduce the formatting score significantly. The visual structure itself is clean and well-organised, but the content violations are severe for international ATS systems and multinational recruiters. The resume would be rejected or heavily discounted by Western hiring processes before content is even evaluated.",
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
        "section": "Personal Information",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      },
      {
        "section": "Section Headings",
        "issue": "'Career Objective' is a non-standard heading for international ATS systems.",
        "suggestion": "Rename to 'Professional Summary' for better ATS compatibility."
      },
      {
        "section": "Section Headings",
        "issue": "'Educational Qualification' is a non-standard heading for international ATS systems.",
        "suggestion": "Rename to 'Education' for better ATS compatibility."
      },
      {
        "section": "Section Headings",
        "issue": "'Personal Information' should be removed entirely for international applications.",
        "suggestion": "Delete this section and retain only Contact Details at the top of the resume."
      }
    ]
  },
  "content_quality": {
    "score": 62,
    "feedback": "The resume demonstrates solid academic credentials and relevant project experience, but suffers from significant under-quantification in project and activity descriptions. Most bullet points lack specific outcomes, metrics, or impact statements. The capstone project section is reasonably detailed, but co-curricular activities and lab projects are vague. For a fresh graduate applying to structural engineering roles, the resume needs stronger evidence of technical competency and measurable contributions. The thesis title is relevant but no abstract or key findings are mentioned. Skills section is present but lacks proficiency levels for most tools.",
    "strengths": [
      "Strong academic performance (3.52/4.00 CGPA) with perfect secondary school grades",
      "Relevant capstone project with specific deliverables (structural drawings, load calculations, cost estimates)",
      "Thesis on seismic vulnerability assessment directly aligns with structural engineering specialisation",
      "Technical skills section includes industry-standard software (AutoCAD, ETABS, SAP2000) and relevant codes (BNBC 2020, ACI 318)",
      "Leadership experience as General Secretary demonstrates initiative and organisational capability",
      "Supervisor and industry reference contacts provided"
    ],
    "weaknesses": [
      "Career Objective is generic and does not differentiate the candidate or highlight unique value proposition",
      "Project Experience bullets lack quantification: 'Developed structural drawings' does not specify number of drawings, building complexity, or design outcomes",
      "Lab and Field Projects section is severely under-detailed — no metrics, findings, or outcomes provided (e.g., 'bearing capacity estimation' should include the calculated value or key insight)",
      "Co-curricular Activities lack impact metrics: '400+ students' is mentioned for the event but no personal contribution or outcome is quantified",
      "No internship or professional work experience listed — critical gap for a fresh graduate applying to consultancy firms",
      "Language Proficiency section uses vague descriptor 'Good command' instead of standardised proficiency levels (e.g., CEFR B2, TOEFL score)",
      "No mention of awards, scholarships, or academic distinctions despite perfect secondary school grades",
      "References section is present but no context given for why these individuals are qualified to recommend the candidate"
    ]
  },
  "language_grammar": {
    "score": 78,
    "feedback": "The resume is generally well-written with correct grammar and professional tone. However, there are inconsistencies in tense usage, weak action verbs in some sections, and one spelling error. The language is clear and readable, but some bullet points use passive or vague constructions that weaken impact. Capitalisation is mostly consistent, though there are minor inconsistencies in section headings.",
    "issues": [
      {
        "original": "Organised Annual Civil Engineering Week attended by 400+ students and 12 industry guests",
        "corrected": "Organised Annual Civil Engineering Week, which attracted 400+ students and 12 industry guests",
        "type": "Weak construction — passive voice reduces impact of personal contribution"
      },
      {
        "original": "Soil investigation and bearing capacity estimation for a residential site in Hathazari, Chittagong",
        "corrected": "Conducted soil investigation and estimated bearing capacity for a residential site in Hathazari, Chittagong",
        "type": "Vague action verb — 'investigation' and 'estimation' are nouns; use active verbs"
      },
      {
        "original": "Traffic volume count and PCU analysis for an intersection study at Muradpur, Chittagong",
        "corrected": "Performed traffic volume count and PCU analysis for an intersection study at Muradpur, Chittagong",
        "type": "Vague action verb — 'count' and 'analysis' are nouns; use active verbs"
      },
      {
        "original": "Good command in reading, writing and speaking",
        "corrected": "Fluent in reading, writing, and speaking",
        "type": "Weak descriptor — 'good command' is vague; use standardised proficiency level"
      },
      {
        "original": "I hereby solemnly declare that all information provided above is true and correct to the best of my knowledge.",
        "corrected": "[Remove entirely — not used in international resumes]",
        "type": "Inappropriate section for international applications"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information immediately: delete the entire 'Personal Information' section, and remove father's name, mother's name, date of birth, religion, marital status, and blood group. Retain only Contact Details (address, phone, email) at the top. This is critical for international ATS compatibility and prevents discrimination-based filtering.",
    "Rename section headings to international standards: change 'Career Objective' to 'Professional Summary', 'Educational Qualification' to 'Education', and delete the 'Declaration' section entirely. These non-standard headings will not be parsed correctly by Western ATS systems.",
    "Quantify all project and activity outcomes with specific metrics: rewrite 'Soil investigation and bearing capacity estimation' to include the calculated bearing capacity value (e.g., 'Estimated bearing capacity of 180 kPa for residential site'); rewrite 'Organised Annual Civil Engineering Week' to specify your personal role (e.g., 'Coordinated logistics and speaker recruitment for Annual Civil Engineering Week, resulting in 400+ attendees and 12 industry partnerships'); add findings or impact to the traffic study.",
    "Add a brief professional summary (3–4 lines) that highlights your structural engineering specialisation, key technical skills (ETABS, SAP2000, ACI 318), and career goal. Replace the generic Career Objective with a statement like: 'Structural engineer with expertise in seismic analysis and RC frame design. Proficient in ETABS, SAP2000, and ACI 318 standards. Seeking a junior structural engineer role at a consultancy firm to contribute to building design and analysis projects.'",
    "Add a 'Professional Experience' or 'Internships' section if any exist, or create a 'Certifications & Achievements' section to highlight any awards, scholarships, or professional certifications (e.g., BNBC 2020 training, AutoCAD certification). If none exist, prioritise securing an internship before applying to multinational firms, as fresh graduates without work experience are at a significant disadvantage."
  ],
  "ats_analysis": {
    "inferred_role": "Junior Structural Engineer / Graduate Structural Engineer",
    "inferred_industry": "Construction / Infrastructure / Structural Consultancy",
    "keyword_hits": [
      "structural engineer",
      "structural analysis",
      "foundation design",
      "AutoCAD",
      "ETABS",
      "SAP2000",
      "STAAD Pro",
      "ACI 318",
      "BNBC 2020",
      "AASHTO LRFD",
      "reinforcement design",
      "load calculations",
      "seismic analysis",
      "RC frame",
      "civil engineering",
      "project coordination"
    ],
    "keyword_gaps": [
      "BIM (Building Information Modelling) — increasingly required for junior structural roles at multinationals",
      "Revit — widely used in international consultancies for structural design documentation",
      "internship or professional experience — critical gap; no work history listed despite being a fresh graduate"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading; international ATS systems expect 'Professional Summary' or 'Objective'",
        "recommended": "Professional Summary"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading; international ATS systems expect 'Education'",
        "recommended": "Education"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "This entire section should be removed for international applications; personal demographic data will cause ATS rejection or manual filtering",
        "recommended": "[Delete section entirely; retain only Contact Details at resume header]"
      }
    ],
    "ats_tips": [
      "Remove all personal demographic information (father's name, date of birth, religion, marital status, blood group) immediately. International ATS systems and recruiters will flag or discard resumes containing these fields, and they introduce unconscious bias in shortlisting. This is a critical compliance issue for multinationals.",
      "Add BIM and Revit to the Technical Skills section if you have any experience with these tools. These are high-frequency keywords in international structural engineering job postings and their absence signals a gap in modern design practices.",
      "Create a 'Professional Experience' section with at least one internship or graduate trainee role. The absence of any work history is a major ATS red flag for junior structural engineer positions at multinationals. If no internship exists, add a 'Certifications' section or expand the 'Project Experience' section with more quantified outcomes to compensate."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 62
}
```