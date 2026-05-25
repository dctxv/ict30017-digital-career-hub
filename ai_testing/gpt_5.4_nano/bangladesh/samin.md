---
resume: samin
mode: bangladesh
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 108.3
  token_count: 1614
  cost_usd: 0.00242174
  duration_seconds: 14.9
---

## Analysis Output

{
  "formatting": {
    "score": 78,
    "feedback": "Overall the resume is clean and easy to scan, with clear section headings and consistent chronology. Minor issues include inconsistent use of punctuation/capitalisation and a couple of dense description blocks that could reduce readability.",
    "issues": [
      {
        "section": "Experience (Wolfpack Security and Privacy Research Lab)",
        "issue": "A long paragraph is used for responsibilities, making the section harder to skim versus the later internship bullets.",
        "suggestion": "Split the paragraph into 3–5 bullet points (e.g., Methods/tools used; deliverables; disclosure/community impact; security recommendations) to match the readability of other entries."
      },
      {
        "section": "Education",
        "issue": "CGPA appears without a “/scale” format (e.g., “Ph.D in Computer Science (CGPA 3.89)”).",
        "suggestion": "Format as “CGPA 3.89/4.00” (or the correct scale) for consistency with common resume conventions."
      },
      {
        "section": "Skills Summary",
        "issue": "Skills are listed as comma-separated items; some ATS systems prefer line items for better keyword capture and human scanning.",
        "suggestion": "Convert “Languages/Analysis Frameworks/Reverse Engineering/Others” into separate bullet lists (one tool/skill per line)."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "Strong technical and research signal: relevant PhD topic, multiple security-focused research internships, and security/privacy publications. However, experience bullets are occasionally vague or methodology-heavy without concrete impact/metrics (especially for the core roles). The most significant gap is that references and an extracurricular/leadership section for early-career signals are not fully covered (volunteering exists, but there’s no broader leadership/activities section).",
    "strengths": [
      "PhD and dissertation topic directly align with software security/payment security/compliance.",
      "Multiple security/privacy research internships with relevant domains (Android payment SDKs, AI security, mobile payment misuse, Knox security).",
      "Academic research projects and publications provide credibility and measurable outcomes (e.g., analysis tool over 50 SDKs; acceptance rates).",
      "Skills section includes both static analysis and reverse-engineering tooling commonly expected for security roles."
    ],
    "weaknesses": [
      "Content is sometimes generic about outcomes (e.g., “provide security recommendations” / “build tools” without stating what was produced, evaluated, or improved).",
      "Several internship bullets lack measurable results (e.g., “Improved crash triaging process” does not state the reduction in crashes triaged time, accuracy lift, volume handled, etc.).",
      "“KONA” responsibilities use broad verbs (“Develop front end… Implement… Design…”) with limited measurable impact (adoption, performance, security improvements, scale of apps/APIs).",
      "No explicit “References” section with named referees and contact details (commonly expected in Bangladesh for many employer types).",
      "No extracurricular/club/community leadership section beyond one workshop lead entry; this can be valuable for early-career screening signals."
    ]
  },
  "language_grammar": {
    "score": 70,
    "feedback": "Language is understandable and mostly professional. A few sentences have grammar/clarity issues and minor tense consistency problems (especially in describing research outcomes).",
    "issues": [
      {
        "original": "Compliance of Android Payment Applications to Industry Security Standards",
        "corrected": "Compliance of Android Payment Applications with Industry Security Standards",
        "type": "phrase clarity"
      },
      {
        "original": "I disclose vulnerability reports to software vendors and provide security recommendations",
        "corrected": "I disclose vulnerability reports to software vendors and provide security recommendations.",
        "type": "punctuation/style"
      },
      {
        "original": "Utilised industry graded tools to find SDK version usage in Android apps.",
        "corrected": "Used industry-standard tools to identify SDK version usage in Android apps.",
        "type": "word choice"
      },
      {
        "original": "Mobile payment SDK misuse: Identified and measured several ways PayPal's in house mobile Payment SDKs (i.e., Braintree, PayPal) could be misused in both Android and iOS.",
        "corrected": "Mobile payment SDK misuse: Identified and measured several ways PayPal’s in-house mobile payment SDKs (e.g., Braintree and PayPal) could be misused on both Android and iOS.",
        "type": "grammar/consistency"
      },
      {
        "original": "Conducted a workshop on Android application development at DiamondHacks 2021 March 2021",
        "corrected": "Conducted a workshop on Android application development at DiamondHacks 2021 (March 2021).",
        "type": "formatting/grammar"
      }
    ]
  },
  "action_items": [
    "Add a “References” section with at least two named referees including designation, organisation, phone number, and email (required for many Bangladesh employer screens).",
    "Rewrite the Wolfpack Research Assistant section into 3–5 bullet points with concrete outputs (e.g., tool names/components, evaluation method, measurable results like number of apps/SDKs analysed, detection improvements, or vendor response outcomes).",
    "Improve internship bullet impact by adding at least one metric/quantified outcome per internship (e.g., % crash triage time reduction, number of apps studied, precision/coverage of findings, scale of data stored).",
    "Update Education CGPA formatting to include the denominator/scale (e.g., “3.89/4.00”) for each degree where the scale is known."
  ],
  "ats_analysis": {
    "inferred_role": "Software Security Researcher / Security Engineer (Android, Payment & AppSec)",
    "inferred_industry": "Cybersecurity / Software Security Research",
    "keyword_hits": [
      "Android",
      "payment security",
      "software security",
      "privacy",
      "program analysis",
      "reverse engineering",
      "vulnerability reports",
      "static analysis",
      "fuzzing",
      "Android apps",
      "iOS",
      "PCI DSS",
      "NLP",
      "dataflow analysis",
      "NER",
      "Wireshark",
      "Ghidra",
      "IDA Pro",
      "Frida",
      "JEB",
      "Ghidra",
      "QARK",
      "CodeQL",
      "Androguard",
      "Linux",
      "Git",
      "Java",
      "Python",
      "SQL",
      "Spring Boot",
      "API services"
    ],
    "keyword_gaps": [
      "threat modeling",
      "secure coding",
      "security assessment"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Convert “Skills Summary” lists from comma-separated strings into one-item-per-line bullets to improve keyword extraction and readability.",
      "Ensure every internship and full-time role uses consistent bullet structure (label + action + outcome), since ATS benefits from parallel phrasing and clear deliverables.",
      "Add a short “Technical Projects/Selected Tools” sub-section (or extend the projects) with explicit tool/method names and what you produced (e.g., datasets, evaluation metrics, release artifacts) to strengthen keyword context."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 73
}