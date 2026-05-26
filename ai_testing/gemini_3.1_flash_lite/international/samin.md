---
resume: samin
mode: international
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 209
  token_count: 1003
  cost_usd: 0.0023835
  duration_seconds: 4.8
---

## Analysis Output

{
  "formatting": {
    "score": 75,
    "feedback": "The resume is clean and well-structured. However, the use of 'Academic Research Projects' as a primary section is less common in industry-focused resumes; these should be integrated into 'Experience' or 'Projects'. The document is professional but needs minor adjustments to align with international standards.",
    "issues": [
      {
        "section": "Academic Research Projects",
        "issue": "This section is often overlooked by recruiters who prefer to see project outcomes integrated into professional experience.",
        "suggestion": "Rename to 'Key Projects' and ensure each bullet point follows the STAR method (Situation, Task, Action, Result)."
      }
    ]
  },
  "content_quality": {
    "score": 85,
    "feedback": "The content is strong, particularly the technical depth in security and reverse engineering. The publication list is impressive. However, some bullet points in the 'Experience' section are slightly vague and could benefit from more quantitative impact.",
    "strengths": [
      "Strong technical stack (Reverse Engineering, Analysis Frameworks).",
      "High-impact publications in top-tier security conferences.",
      "Clear progression from software engineering to specialized security research."
    ],
    "weaknesses": [
      "The 'KONA' experience section uses vague verbs like 'Develop' and 'Implement' without quantifying the scale of the impact (e.g., number of users, performance improvements, or efficiency gains).",
      "The 'Research Assistant' section lacks specific metrics regarding the tools built (e.g., 'reduced analysis time by X%')."
    ]
  },
  "language_grammar": {
    "score": 90,
    "feedback": "The language is professional and technical. There are minor tense inconsistencies in the 'KONA' section.",
    "issues": [
      {
        "original": "Front end development: Develop front end payment apps",
        "corrected": "Front-end Development: Developed front-end payment applications",
        "type": "tense consistency"
      },
      {
        "original": "Back end Development: Implement backend infrastructure",
        "corrected": "Back-end Development: Implemented back-end infrastructure",
        "type": "tense consistency"
      }
    ]
  },
  "action_items": [
    "Update the 'KONA' experience section to use past tense consistently and add metrics (e.g., 'Improved API response time by 20%').",
    "Rename 'Academic Research Projects' to 'Key Projects' and move it above 'Selected Publications' to highlight practical application.",
    "Quantify the impact of the tools built in the 'Research Assistant' role (e.g., 'Identified 15+ critical vulnerabilities in top-tier apps').",
    "Ensure all bullet points start with strong action verbs (e.g., 'Architected', 'Engineered', 'Optimized') rather than descriptive nouns."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer",
    "inferred_industry": "Cybersecurity / Software Development",
    "keyword_hits": [
      "Java",
      "Python",
      "Reverse Engineering",
      "Android",
      "iOS",
      "Static Analysis",
      "PCI DSS",
      "Fuzzing",
      "Ghidra",
      "IDA Pro"
    ],
    "keyword_gaps": [
      "Cloud Security (AWS/GCP/Azure)",
      "CI/CD Pipeline Security",
      "Threat Modeling"
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC RESEARCH PROJECTS",
        "issue": "ATS systems may categorize this as non-professional experience.",
        "recommended": "PROJECTS"
      }
    ],
    "ats_tips": [
      "International ATS systems often parse 'Skills Summary' better if categorized by proficiency (e.g., 'Languages: Proficient in Java, Python').",
      "Avoid using special characters or symbols in bullet points; use standard round or square bullets to ensure 100% parsing accuracy.",
      "Note: International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information if added."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 83
}