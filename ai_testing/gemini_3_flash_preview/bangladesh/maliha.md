---
resume: maliha
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 136.3
  token_count: 1295
  cost_usd: 0.005822
  duration_seconds: 9.5
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows traditional Bangladeshi academic standards but uses a text-heavy layout that lacks modern visual hierarchy. The score is capped at 75 due to the inclusion of extensive personal details, a declaration-style profile, and specific local conventions which, while standard in Bangladesh, can hinder digital parsing in international contexts.",
    "issues": [
      {
        "section": "ACADEMIC DETAILS",
        "issue": "Missing GPA denominator for H.S.C and S.S.C.",
        "suggestion": "Change 'GPA: 5 out of 5.00' to 'GPA: 5.00/5.00' for consistency with university formatting."
      },
      {
        "section": "JOB EXPERIENCE",
        "issue": "Dense paragraph format for professional experience.",
        "suggestion": "Use bullet points to separate your role, responsibilities, and achievements at Pabna University of Science & Technology."
      },
      {
        "section": "MAJOR ACADEMIC COURSES",
        "issue": "Extremely dense text block that is difficult to scan.",
        "suggestion": "Remove the exhaustive list of every course taken. Instead, list only 5-6 'Relevant Coursework' items that align with your research interests."
      }
    ]
  },
  "content_quality": {
    "score": 82,
    "feedback": "The academic credentials and research background are exceptionally strong. However, the 'Job Experience' section is significantly underdeveloped for someone who has been a Lecturer since 2020. It lacks details on subjects taught, student mentorship, or administrative contributions.",
    "strengths": [
      "Outstanding academic record with consistent top-tier GPAs and prestigious fellowships (NST).",
      "Clear and specific research focus on Perovskite materials and DFT.",
      "Strong technical skill set including specialized software like Gaussian and Material Studio."
    ],
    "weaknesses": [
      "The Job Experience section is a single sentence; it fails to demonstrate teaching efficacy or professional growth over 4 years.",
      "The 'Research Experience' section describes the 'what' but not the 'how' or the 'result' (e.g., publications, conference presentations, or specific findings).",
      "Extracurricular activities like 'Chess' and 'Badminton' lack context regarding participation level or achievements."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and clear. There are minor phrasing inconsistencies and a slight mix of tenses in the skills section.",
    "issues": [
      {
        "original": "from February 2020 to till now",
        "corrected": "February 2020 – Present",
        "type": "grammar"
      },
      {
        "original": "Using of electrical, thermal...",
        "corrected": "Proficient in using electrical, thermal...",
        "type": "grammar"
      },
      {
        "original": "learned in undergraduate",
        "corrected": "acquired during undergraduate studies",
        "type": "phrasing"
      }
    ]
  },
  "action_items": [
    "JOB EXPERIENCE: Expand this section into 3-4 bullet points detailing the courses you teach, any labs you manage, and your involvement in departmental committees or student advising.",
    "RESEARCH EXPERIENCE: Add a 'Key Findings' or 'Publications' subsection under your Master's thesis to highlight the impact of your Ab Initio study.",
    "SKILLS: Categorize skills into 'Computational/Software', 'Programming', and 'Laboratory Instrumentation' for better readability.",
    "MAJOR ACADEMIC COURSES: Significantly prune this section; keep only the M.Sc. courses and highly specialized B.Sc. electives to save space for professional achievements.",
    "EXTRA CURRICULUM ACTIVITIES: Add your role and duration for 'Badhan' and 'JUPC' (e.g., 'Active Member, 2014–2018') to demonstrate long-term commitment."
  ],
  "ats_analysis": {
    "inferred_role": "Assistant Professor / Researcher in Physics",
    "inferred_industry": "Academia / Scientific Research",
    "keyword_hits": [
      "Physics",
      "Condensed Matter Physics",
      "Ab Initio",
      "DFT",
      "Material Science",
      "Nanotechnology",
      "Latex",
      "Matlab",
      "Gaussian",
      "Material Studio",
      "XRD",
      "FTIR"
    ],
    "keyword_gaps": [
      "Curriculum Development",
      "Peer-reviewed Publications",
      "Python (Data Analysis)"
    ],
    "heading_risks": [
      {
        "original": "PERSONAL PROFILE",
        "recommended": "ADDITIONAL INFORMATION",
        "issue": "Contains sensitive data that international ATS/HR might flag for bias compliance."
      }
    ],
    "ats_tips": [
      "Replace the 'Major Academic Courses' block with a 'Technical Expertise' section. ATS systems struggle to extract value from long comma-separated lists of course titles.",
      "Quantify your teaching experience. Instead of 'Lecturer', use 'Lecturer (Physics) | Managed 3+ undergraduate lab sections and delivered lectures to classes of 60+ students.'",
      "Ensure your contact information is in the header. Some ATS systems stop reading the body of the text if they cannot find a clear header with contact details."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 87
}