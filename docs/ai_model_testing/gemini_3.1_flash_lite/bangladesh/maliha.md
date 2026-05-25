---
resume: maliha
mode: bangladesh
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 313.8
  token_count: 919
  cost_usd: 0.00275075
  duration_seconds: 2.9
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume is well-organized and clear. Note: As this resume includes multiple traditional sections (Personal Profile, References, etc.), it is capped at 75 to reflect that these elements are often parsed differently by international digital ATS platforms compared to modern, minimalist formats.",
    "issues": [
      {
        "section": "Academic Details",
        "issue": "The GPA denominator is missing for the SSC and HSC results.",
        "suggestion": "Update to 'GPA: 5.00/5.00' for both SSC and HSC to maintain consistency with your university GPA format."
      }
    ]
  },
  "content_quality": {
    "score": 80,
    "feedback": "The content is highly academic and well-suited for a research or teaching role. The inclusion of specific software and laboratory equipment is a major strength.",
    "strengths": [
      "Excellent technical detail regarding research software (Gaussian, Material Studio) and laboratory instrumentation.",
      "Clear articulation of the thesis topic and research field.",
      "Strong academic record with relevant scholarships."
    ],
    "weaknesses": [
      "The 'Major Academic Courses' section is overly long and takes up significant space without adding much value for a professional role; it should be condensed.",
      "The 'Extra Curriculum Activities' section lists memberships but lacks context regarding your specific contributions, roles, or duration of involvement."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is formal and appropriate for an academic profile.",
    "issues": [
      {
        "original": "from February 2020 to till now",
        "corrected": "from February 2020 to present",
        "type": "Redundancy"
      },
      {
        "original": "Using of electrical",
        "corrected": "Practical experience with electrical",
        "type": "Grammar"
      }
    ]
  },
  "action_items": [
    "Condense the 'Major Academic Courses' section into a small 'Relevant Coursework' list (e.g., 'Advanced Solid State Physics, Quantum Mechanics, Material Science') to save space.",
    "Expand the 'Extra Curriculum Activities' entries by adding the duration of your membership and any specific roles held (e.g., 'Volunteer, Badhan, 2015–2017').",
    "Update the SSC and HSC GPA entries to include the '/5.00' denominator.",
    "Add a 'Career Objective' section at the top to clearly state your intent to pursue a research-focused or academic career."
  ],
  "ats_analysis": {
    "inferred_role": "Physics Lecturer / Researcher",
    "inferred_industry": "Higher Education / Research",
    "keyword_hits": [
      "Condensed Matter Physics",
      "Material Science",
      "DFT",
      "Gaussian",
      "Material Studio",
      "XRD",
      "FTIR",
      "UV spectroscopy"
    ],
    "keyword_gaps": [
      "Grant Writing",
      "Curriculum Development",
      "Scientific Publication"
    ],
    "heading_risks": [
      {
        "original": "OTHER EDUCATIONAL ACHIEVEMENTS",
        "issue": "Non-standard heading for ATS parsing.",
        "recommended": "Awards and Honors"
      }
    ],
    "ats_tips": [
      "If you have published any papers, create a 'Publications' section; this is a high-impact keyword for academic roles.",
      "Ensure your contact details are in a simple text format at the top, not inside a table or text box.",
      "Use standard headings like 'Research Experience' and 'Teaching Experience' to ensure the ATS correctly categorizes your work history."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 83
}
```
