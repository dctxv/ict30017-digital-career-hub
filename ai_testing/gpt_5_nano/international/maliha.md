---
resume: maliha
mode: international
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 127.6
  token_count: 11612
  cost_usd: 0.0047199
  duration_seconds: 91
---

## Analysis Output

{
  "formatting": {
    "score": 55,
    "feedback": "The resume contains multiple Bangladeshi CV conventions and sensitive personal details that are not aligned with Western/International hiring standards. This affects ATS readability and candidate privacy. Key issues include: (1) Personal Profile section carrying father's/mother's names and extensive demographic data; (2) Date of birth, blood group, religion, marital status included; (3) Non-standard heading (Personal Profile) that ATS may not parse reliably; (4) Excessive listing of full personal details and a lengthy block of major academic courses. These should be removed or relocated to a professional summary and education section respectively, and sensitive details omitted to improve ATS parsing and privacy. Note: With 6+ Bangladesh-specific conventions present, the formatting score is capped to 55 to reflect modern digital application expectations.",
    "issues": [
      {
        "section": "Personal Profile / Personal Information",
        "issue": "Inclusion of father's name.",
        "suggestion": "Remove father's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Profile / Personal Information",
        "issue": "Inclusion of mother's name.",
        "suggestion": "Remove mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Profile / Personal Information",
        "issue": "Date of birth present.",
        "suggestion": "Remove Date of Birth; focus on experience and qualifications instead."
      },
      {
        "section": "Personal Profile / Personal Information",
        "issue": "Blood group present.",
        "suggestion": "Remove Blood Group."
      },
      {
        "section": "Personal Profile / Personal Information",
        "issue": "Religion present.",
        "suggestion": "Remove Religion."
      },
      {
        "section": "Personal Profile / Personal Information",
        "issue": "Marital status present.",
        "suggestion": "Remove Marital Status."
      },
      {
        "section": "Heading risk",
        "issue": "Heading 'Personal Profile' is non-standard for international ATS.",
        "suggestion": "Replace with 'Professional Summary' and place under a standard 'Contact Details' / 'Education' structure."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "Strong academic credentials and a clear focus on physics/condensed matter. Strengths include a high GPA, a defined research field, teaching experience, and relevant technical skills. Weaknesses include a lack of quantified achievements in roles, no explicit teaching/research outcomes, and an overly long list of coursework. The resume would benefit from a concise Education/Experience narrative, quantified accomplishments, and a compact Skills section aligned to target roles.",
    "strengths": [
      "High GPA in MSc and BSc Physics indicating strong academic ability.",
      "Defined research area (Condensed Matter Physics) and a named research project.",
      "Lecturer experience demonstrates teaching capability.",
      "Relevant technical skills (LaTeX, Gaussian, MATLAB, Origin, XRD/FTIR/UV, etc.).",
      "Languages and extracurriculars show well-rounded profile."
    ],
    "weaknesses": [
      "Lack of quantified outcomes in research and teaching roles (no numbers, results, or impact).",
      "No explicit teaching responsibilities or student supervision details in the lecturer role.",
      "Overly long list of coursework; could be condensed to select coursework relevant to target roles.",
      "References provided directly in resume; international practice often prefers 'References available upon request'."
    ]
  },
  "language_grammar": {
    "score": 58,
    "feedback": "Some grammar and capitalization inconsistencies and awkward phrasing reduce readability. Common issues include non-parallel bullet phrasing, inconsistent capitalization for section headers, and minor grammar errors in sentences describing roles and tools.",
    "issues": [
      {
        "original": "[redacted] Lecturer position sentence with 'from February 2020 to till now'.",
        "corrected": "Lecturer, Department of Physics, Pabna University of Science & Technology, February 2020–Present.",
        "type": "grammar"
      },
      {
        "original": "[redacted] 'Using of electrical, thermal, mechanical and optical laboratory equipment'.",
        "corrected": "Experience with electrical, thermal, mechanical, and optical laboratory equipment.",
        "type": "grammar"
      },
      {
        "original": "[redacted] 'Latex' in skills list.",
        "corrected": "LaTeX",
        "type": "spelling/terminology"
      },
      {
        "original": "[redacted] 'Intd. Ckt' in major courses.",
        "corrected": "Industrial Circuit",
        "type": "spelling/terminology"
      },
      {
        "original": "[redacted] 'Major Academic Courses' formatting (caps consistency).",
        "corrected": "Selected Coursework",
        "type": "style"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic details (father/mother names, date of birth, blood group, religion, marital status) and replace 'PERSONAL PROFILE' with a concise 'Professional Summary' at the top.",
    "Restructure Education and Experience into standard sections: 'Education' (with degree, institution, year, GPA) and 'Teaching Experience' / 'Research Experience' with bullet points including outcomes and metrics.",
    "Rewrite the Research Experience and Lecturer role into quantified bullet points (e.g., number of courses taught, student outcomes, research contributions, publications).",
    "Replace the long 'Major Academic Courses' block with a concise 'Selected Coursework' (6–8 relevant courses) and ensure consistent formatting (date formats, capitalization).",
    "Convert References to 'References available upon request' or place them in a separate document; ensure the resume remains ATS-friendly."
  ],
  "ats_analysis": {
    "inferred_role": "Lecturer / Assistant Professor in Physics (Condensed Matter / Materials Science)",
    "inferred_industry": "Academia / Higher Education / Research",
    "keyword_hits": [
      "Lecturer",
      "Department of Physics",
      "M.Sc.",
      "B.Sc.",
      "GPA",
      "LaTeX",
      "Origin",
      "MATLAB",
      "Gaussian",
      "C",
      "C++",
      "DFT",
      "XRD",
      "FTIR",
      "UV",
      "Impedance",
      "Condensed Matter Physics",
      "Perovskite",
      "Nanotechnology"
    ],
    "keyword_gaps": [
      "Publications",
      "Teaching Experience details",
      "Student Supervision / Mentorship",
      "Grants / Fellowships specifics"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL PROFILE",
        "issue": "Non-standard heading that may confuse ATS and recruiters; includes demographic data.",
        "recommended": "Replace with 'Professional Summary' and place under standard 'Contact Details' header."
      },
      {
        "original": "EXTRA CURRICULUM ACTIVITIES",
        "issue": "Non-standard heading for some international ATS; may be parsed inconsistently.",
        "recommended": "Use 'Extra-Curricular Activities' or integrate relevant activities under 'Activities'."
      }
    ],
    "ats_tips": [
      "Add a 2–3 sentence 'Professional Summary' at the top using target-role keywords (Teaching, Physics, Research, Condensed Matter).",
      "Rename 'MAJOR ACADEMIC COURSES' to 'Selected Coursework' with 6–8 relevant items only.",
      "Keep the resume as plain text or simple bulleted format; avoid complex tables to ensure high ATS readability."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 59
}