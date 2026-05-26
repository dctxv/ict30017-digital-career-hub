---
resume: maliha
mode: bangladesh
model: gemini_2.5_flash
date: 2026-05-15
metadata:
  tokens_per_second: 163
  token_count: 2282
  cost_usd: 0.0069248
  duration_seconds: 14
---

## Analysis Output

```json
{
  "formatting": {
    "score": 65,
    "feedback": "The resume presents a clear structure with distinct sections, which aids readability. However, the use of 'ACADEMIC DETAILS' and 'OTHER EDUCATIONAL ACHIEVEMENTS' as separate sections, along with 'MAJOR ACADEMIC COURSES', leads to some redundancy and could be streamlined. The lack of bullet points for the 'JOB EXPERIENCE' section makes it less impactful. The inclusion of personal details and references with full contact information, while standard in Bangladesh, contributes to a lower score in an international context due to modern digital application standards.",
    "issues": [
      {
        "section": "Overall",
        "issue": "The resume includes several conventions (Personal Information, Declaration, Photograph, full References) that, while standard in Bangladesh, are not aligned with modern digital application standards and can impact ATS parsing and international recruiter perception.",
        "suggestion": "For international applications, consider creating a separate version that omits personal details like father's name, mother's name, NID, blood group, religion, marital status, and date of birth. Also, replace full reference details with 'References available upon request' or provide them only when specifically asked."
      },
      {
        "section": "JOB EXPERIENCE",
        "issue": "The job experience is presented as a single sentence without bullet points, which makes it difficult to quickly grasp responsibilities and achievements.",
        "suggestion": "Rewrite the 'JOB EXPERIENCE' section using 3-5 bullet points to describe key responsibilities, contributions, and any quantifiable achievements in the role of Lecturer. For example: 'Delivered lectures and conducted practical sessions for undergraduate physics courses,' 'Developed and updated course materials to align with curriculum standards,' or 'Mentored students on academic projects and research initiatives.'"
      },
      {
        "section": "MAJOR ACADEMIC COURSES",
        "issue": "This section lists numerous course titles, which is generally not necessary for a candidate with a Master's degree and work experience. It adds significant length without highlighting specific skills or achievements.",
        "suggestion": "Consider removing the 'MAJOR ACADEMIC COURSES' section entirely. Relevant skills gained from these courses should be integrated into the 'SKILLS' section or demonstrated through 'RESEARCH EXPERIENCE' and 'JOB EXPERIENCE'."
      },
      {
        "section": "ACADEMIC DETAILS",
        "issue": "The 'Year of Passing' for M.Sc. and B.Sc. includes 'Held in (year)', which is unnecessary and can be confusing.",
        "suggestion": "Simplify the 'Year of Passing' to just the year the degree was awarded. For example, 'Year of Passing: 2018' for M.Sc. and 'Year of Passing: 2017' for B.Sc."
      }
    ]
  },
  "content_quality": {
    "score": 70,
    "feedback": "The resume effectively highlights strong academic achievements and relevant research experience. The inclusion of SSC and HSC results, along with the GPA denominator, is appropriate for the Bangladeshi context. The 'OTHER EDUCATIONAL ACHIEVEMENTS' section is a strong point, showcasing consistent academic excellence. However, the 'JOB EXPERIENCE' section lacks detail and quantification, which is a significant weakness for a candidate with professional experience. The 'EXTRA CURRICULUM ACTIVITIES' section is present but could be expanded for better impact.",
    "strengths": [
      "Strong academic record with high GPAs and multiple scholarships.",
      "Detailed research experience with a specific thesis title and supervisor information.",
      "Comprehensive 'SKILLS' section listing relevant software, programming languages, and laboratory equipment.",
      "Inclusion of SSC and HSC results with GPA out of 5.00, as expected in Bangladesh.",
      "Presence of a 'References' section with full contact details, meeting Bangladeshi employer expectations."
    ],
    "weaknesses": [
      "The 'JOB EXPERIENCE' section is very brief and lacks specific responsibilities, achievements, or quantifiable outcomes. It reads more like a job title and duration than a description of professional contributions.",
      "The 'EXTRA CURRICULUM ACTIVITIES' section lists memberships and sports but lacks context, roles, or duration, which could demonstrate leadership or initiative.",
      "The 'RESEARCH FIELD' section is redundant as the information is covered in 'RESEARCH EXPERIENCE' and 'AREA OF INTERESTS'.",
      "The 'OTHER EDUCATIONAL ACHIEVEMENTS' section is strong but could be integrated more smoothly into the 'ACADEMIC DETAILS' or a dedicated 'Awards and Honors' section for better flow."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The resume is generally well-written with good grammar and clear language. There are no significant spelling errors or grammatical mistakes. The use of British English spelling is consistent and appropriate. A few minor phrasing improvements could enhance conciseness.",
    "issues": [
      {
        "original": "from February 2020 to till now.",
        "corrected": "from February 2020 to Present.",
        "type": "phrasing"
      },
      {
        "original": "Excellent command over reading, writing, speaking and listening as a mother tongue",
        "corrected": "Native proficiency in reading, writing, speaking, and listening.",
        "type": "phrasing"
      },
      {
        "original": "Fluent in reading, writing and speaking",
        "corrected": "Fluent in reading, writing, and speaking.",
        "type": "punctuation"
      }
    ]
  },
  "action_items": [
    "Expand the 'JOB EXPERIENCE' section: Add 3-5 bullet points under 'Lecturer' detailing specific responsibilities, teaching methodologies, curriculum development, student mentorship, or any departmental contributions. Quantify achievements where possible (e.g., 'Taught X courses to Y students').",
    "Refine 'EXTRA CURRICULUM ACTIVITIES': For each activity, briefly describe your role, duration, and any specific contributions or skills developed (e.g., 'Member: Badhan (A Voluntary Blood Donors' Organization) - Participated in X blood donation drives and Y awareness campaigns from [Start Date] to [End Date]').",
    "Streamline 'ACADEMIC DETAILS' and 'OTHER EDUCATIONAL ACHIEVEMENTS': Consider combining 'OTHER EDUCATIONAL ACHIEVEMENTS' into the 'ACADEMIC DETAILS' section under each degree or creating a separate 'Awards and Honors' section. Remove 'Held in (year)' from the 'Year of Passing' entries.",
    "Remove 'MAJOR ACADEMIC COURSES' section: This section adds unnecessary length. Integrate relevant skills gained from these courses into your 'SKILLS' section or demonstrate them through your 'RESEARCH EXPERIENCE' and 'JOB EXPERIENCE'."
  ],
  "ats_analysis": {
    "inferred_role": "Lecturer / Research Scientist (Physics)",
    "inferred_industry": "Academia / Research / Material Science",
    "keyword_hits": [
      "Physics",
      "Lecturer",
      "Research",
      "Condensed Matter Physics",
      "Perovskite",
      "Ab Initio Study",
      "Gaussian",
      "Material Studio",
      "Matlab",
      "C++",
      "XRD",
      "FTIR",
      "UV spectroscopy",
      "Impedance Analyzer",
      "Solar Cell",
      "DFT",
      "Material Science",
      "Nanotechnology",
      "Nano materials",
      "Jahangirnagar University",
      "Pabna University of Science & Technology"
    ],
    "keyword_gaps": [
      "Curriculum Development",
      "Student Mentorship",
      "Grant Writing"
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC DETAILS",
        "issue": "While understandable, 'ACADEMIC DETAILS' is less common than 'Education' or 'Educational Background' in international ATS.",
        "recommended": "Education"
      },
      {
        "original": "OTHER EDUCATIONAL ACHIEVEMENTS",
        "issue": "This is a non-standard heading that ATS might struggle to categorize. Content could be better integrated.",
        "recommended": "Awards and Honors"
      },
      {
        "original": "JOB EXPERIENCE",
        "issue": "While 'JOB EXPERIENCE' is generally understood, 'Work Experience' or 'Professional Experience' are more standard and widely recognized by ATS.",
        "recommended": "Work Experience"
      },
      {
        "original": "MAJOR ACADEMIC COURSES",
        "issue": "This is a non-standard heading and the content is generally not expected in a professional resume.",
        "recommended": "Remove section"
      },
      {
        "original": "AREA OF INTERESTS",
        "issue": "While clear, 'Research Interests' or 'Technical Interests' might be more precise for a scientific role.",
        "recommended": "Research Interests"
      },
      {
        "original": "EXTRA CURRICULUM ACTIVITIES",
        "issue": "This is a non-standard heading. 'Extracurricular Activities' or 'Volunteer Experience' are more common.",
        "recommended": "Extracurricular Activities"
      },
      {
        "original": "PERSONAL PROFILE",
        "issue": "This section contains personal information not typically included in international resumes and can be flagged by ATS or recruiters.",
        "recommended": "Remove section for international applications"
      }
    ],
    "ats_tips": [
      "Integrate specific teaching methodologies, curriculum development, or student mentorship experiences into the 'Work Experience' section using action verbs and quantifiable outcomes to align with academic and research roles.",
      "Consider adding a 'Research Interests' section (if not already present) and populate it with keywords relevant to target research positions, ensuring alignment with the 'AREA OF INTERESTS' but using a more ATS-friendly heading.",
      "For international applications, remove the 'PERSONAL PROFILE' section entirely and replace the 'REFERENCES' section with 'References available upon request' to comply with privacy standards and ATS expectations."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 75
}
```