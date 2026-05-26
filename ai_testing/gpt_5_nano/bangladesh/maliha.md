---
resume: maliha
mode: bangladesh
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 147.2
  token_count: 9830
  cost_usd: 0.00400746
  duration_seconds: 66.8
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows several Bangladesh-specific conventions (personal details block, references section, extracurricular activities). Readability can be improved with a cleaner header and more scannable bullet points. Minor consistency issues reduce quick readability for both BD and international recruiters.",
    "issues": [
      {
        "section": "Header / Contact Details",
        "issue": "Contact block is dense and not easily skimmable; no compact professional header.",
        "suggestion": "Create a concise header: Maliha Nishat • Pabna, Bangladesh • malihanishat@... (redact) • +88XXXXXXXXXX; align consistently."
      },
      {
        "section": "Education details",
        "issue": "Inconsistent formatting across education items (Year of Passing, GPA phrasing).",
        "suggestion": "Standardize as: M.Sc. (Thesis), Jahangirnagar University, 2017, GPA 3.93/4.00; B.Sc. (Honours), Jahangirnagar University, 2016, GPA 3.83/4.00; etc."
      },
      {
        "section": "Research Experience",
        "issue": "A long descriptive paragraph instead of bullet points.",
        "suggestion": "Convert to 2–3 bullets highlighting title, role, tools, and key findings."
      },
      {
        "section": "Job Experience",
        "issue": "Only a single line for teaching role; no responsibilities or achievements.",
        "suggestion": "Add 3–5 bullets detailing courses taught, class size, assessments, student outcomes, and any curriculum improvements."
      },
      {
        "section": "Professional summary / objective",
        "issue": "No professional summary or objective at the top.",
        "suggestion": "Add a 2–3 line professional summary targeted at academic positions in Physics, highlighting teaching, research, and technical strengths."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "Strong academic background, clear research focus, and solid references. Gaps include quantified teaching/mentoring outcomes and more explicit teaching/research achievements. A few sections would benefit from reformatting for scannability and impact.",
    "strengths": [
      "Strong academic credentials (M.Sc. with thesis, GPA 3.93/4.00; B.Sc. GPA 3.83/4.00).",
      "Active teaching role since 2020 with a reputable institution.",
      "Clear research focus in Condensed Matter Physics and perovskite materials.",
      "Two named references with full contact details, as expected in Bangladesh."
    ],
    "weaknesses": [
      "Job Experience lacks quantified teaching responsibilities and outcomes.",
      "Research Experience presented as a paragraph rather than concise bullets with tools and results.",
      "Skills could be reformatted into a scannable, capability-driven list (software, lab techniques) with levels.",
      "No professional summary to establish value proposition for recruiters."
    ]
  },
  "language_grammar": {
    "score": 68,
    "feedback": "Several grammar and phrasing issues affect polish. Correcting sentence structure and standardizing capitalization will improve readability and professionalism.",
    "issues": [
      {
        "original": "Lecturer at the department of Physics in Pabna University of Science & Technology from February 2020 to till now.",
        "corrected": "Lecturer, Department of Physics, Pabna University of Science & Technology, February 2020 – Present.",
        "type": "grammar"
      },
      {
        "original": "- Using of electrical, thermal, mechanical and optical laboratory equipment from the laboratory courses",
        "corrected": "- Experience using electrical, thermal, mechanical, and optical laboratory equipment.",
        "type": "grammar"
      },
      {
        "original": "Programming language: C, C++ and Matlab (learned in undergraduate)",
        "corrected": "Programming languages: C, C++, and MATLAB (learned during undergraduate studies).",
        "type": "grammar"
      },
      {
        "original": "AREA OF INTERESTS",
        "corrected": "Areas of Interest",
        "type": "grammar"
      },
      {
        "original": "Using of electrical, thermal, mechanical and optical laboratory equipment from the laboratory courses",
        "corrected": "Experience using electrical, thermal, mechanical, and optical laboratory equipment.",
        "type": "grammar"
      }
    ]
  },
  "action_items": [
    "Rework JOB EXPERIENCE: Add 3–5 bullets under 'Lecturer, Department of Physics, Pabna University of Science & Technology' detailing courses taught, class size, assessment methods, and any notable student outcomes.",
    "Reformat RESEARCH EXPERIENCE: Break the paragraph into 2–3 concise bullets (project title, your role/tools, and key findings or outcomes).",
    "Revisit SKILLS: Convert into a tidy bullet list with subcategories (Programming: C, C++, MATLAB; Software: LaTeX, Origin, Gaussian, Material Studio; Lab techniques: XRD, FTIR, UV-Vis, impedance analyzer).",
    "Standardize EDUCATION formatting: Present each credential in a uniform line (degree, field, institution, year, GPA).",
    "Add a Professional Summary at the top: 2–3 lines targeting an academic role in Physics with emphasis on teaching and condensed matter research."
  ],
  "ats_analysis": {
    "inferred_role": "Lecturer / Assistant Professor (Physics)",
    "inferred_industry": "Education / Academia (Higher Education)",
    "keyword_hits": [
      "Lecturer",
      "Physics",
      "M.Sc.",
      "GPA",
      "Thesis",
      "Jahangirnagar University",
      "Pabna University of Science & Technology",
      "Research Experience",
      "Condensed Matter Physics",
      "Perovskite",
      "DFT",
      "Gaussian",
      "Material Studio",
      "LaTeX",
      " Matlab",
      "XRD",
      "FTIR",
      "UV spectroscopy",
      "Impedance Analyzer"
    ],
    "keyword_gaps": [
      { "keyword": "Teaching experience details (courses, class size)", "priority": "high" },
      { "keyword": "Publications / conference presentations", "priority": "high" },
      { "keyword": "Curriculum development / course design", "priority": "medium" }
    ],
    "heading_risks": [
      {
        "original": "AREA OF INTERESTS",
        "issue": "Heading uses plural 'Interests' with an 's' and spacing; ATS may misinterpret",
        "recommended": "Areas of Interest"
      },
      {
        "original": "MAJOR ACADEMIC COURSES",
        "issue": "Long course list; potential parsing gaps",
        "recommended": "Education / Courses Taught (bullet list) or 'Major Academic Courses'"
      }
    ],
    "ats_tips": [
      "Add a dedicated 'Teaching Experience' subsection under PROFESSIONAL EXPERIENCE with course codes, years, and student impact.",
      "Include a 'Publications / Conferences' subsection if any; even abstracts or presentations boost ATS signals for academia.",
      "Use uniform headings such as 'Education', 'Research Experience', 'Teaching Experience' to improve ATS parsing and readability."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 71
}