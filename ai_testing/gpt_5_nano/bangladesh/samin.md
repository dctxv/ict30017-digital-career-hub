---
resume: samin
mode: bangladesh
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 156.5
  token_count: 11676
  cost_usd: 0.00474266
  duration_seconds: 74.6
---

## Analysis Output

{
  "formatting": {
    "score": 60,
    "feedback": "Readable but cluttered; section headers and content formatting reduce scan readability. The header starts with CURRICULUM VITAE, followed by dense blocks instead of skimmable bullets. Experience sections are paragraphs rather than concise bullet points, and there are inconsistent separators. Align dates consistently and prefer bullet lists over long paragraphs for readability.",
    "issues": [
      {
        "section": "Header",
        "issue": "Non-standard document heading ('CURRICULUM VITAE') and compact header format.",
        "suggestion": "Replace with a clean header: Name | City | Email | Website. Remove 'CURRICULUM VITAE' line."
      },
      {
        "section": "Experience",
        "issue": "Experience is presented as dense paragraphs rather than bullet-point summaries.",
        "suggestion": "Convert each role into 3–6 bulleted achievements with action verbs and metrics where possible."
      },
      {
        "section": "Date formatting",
        "issue": "Inconsistent tense and formatting (e.g., 'May 2018 - present' vs 'Summer 2023').",
        "suggestion": "Standardize to 'Month Year – Present' for ongoing roles and 'Month Year – Month Year' for others; use past tense for completed roles."
      },
      {
        "section": "Separators",
        "issue": "Decorative separators ('---') create visual noise.",
        "suggestion": "Use minimal spacing or a single clean divider between sections."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "Strong technical foundation, robust research track, and notable internships/publications. However, the resume lacks quantified outcomes in many bullets and a dedicated References section. It could benefit from a concise professional summary and more explicit impact metrics tied to projects and internships.",
    "strengths": [
      "PhD-level research plus multiple high-profile internships (Samsung, Meta, PayPal) demonstrating applied security expertise.",
      "Extensive tool-building and static analysis experience (AARDroid, PCI-DSS related tooling) with concrete project outcomes.",
      "Selected publications in top security venues and a clear focus on Android security, payment security, and privacy.",
      "Wide range of technical skills (Java, Python, C++, Swift, SQL) and reverse-engineering/tools knowledge (Ghidra, IDA Pro, Frida, CodeQL).",
      "Active involvement beyond academics (volunteer leadership, workshop facilitation)."
    ],
    "weaknesses": [
      "No References section with named referees (expected in Bangladeshi market context).",
      "Bullet points in Experience lack quantified outcomes or concrete metrics.",
      "No concise professional summary or target-role alignment at the top."
    ]
  },
  "language_grammar": {
    "score": 68,
    "feedback": "Several phrasing and tense issues affect readability. Correcting tense and punctuation will improve professionalism and ATS readability.",
    "issues": [
      {
        "original": "Ph.D in Computer Science (CGPA 3.89)",
        "corrected": "Ph.D. in Computer Science (CGPA 3.89).",
        "type": "punctuation/formatting"
      },
      {
        "original": "August 2018 - August 2023 (Expected)",
        "corrected": "August 2018 – August 2023",
        "type": "date/tense"
      },
      {
        "original": "Area: My research broadly falls within the areas of systems security and privacy.",
        "corrected": "Area: My research falls within systems security and privacy.",
        "type": "awkward phrasing"
      },
      {
        "original": "Payment SDK compliance: Research how hardware security features might meet payment card industry's security standard goals more effectively compared to software implementations.",
        "corrected": "Payment SDK compliance: Researched how hardware security features could meet the Payment Card Industry's security standard goals more effectively than software implementations.",
        "type": "tense/wording"
      },
      {
        "original": "Mobile payment SDK misuse: Identified and measured several ways PayPal's in house mobile Payment SDKs (i.e., Braintree, PayPal) could be misused in both Android and iOS. Utilised industry graded tools to find SDK version usage in Android apps. Reverse engineered iOS apps on jail-broken device to pinpoint iOS payment SDK usage.",
        "corrected": "Mobile payment SDK misuse: Identified and quantified several ways PayPal's in-house mobile payment SDKs (e.g., Braintree, PayPal) could be misused in Android and iOS. Utilised industry-grade tools to identify SDK version usage in Android apps. Reverse engineered iOS apps on jailbroken devices to pinpoint iOS payment SDK usage.",
        "type": "grammar"
      },
      {
        "original": "Front end development: Develop front end payment apps in Android and iOS.",
        "corrected": "Front-end development: Developed front-end payment apps for Android and iOS.",
        "type": "grammar"
      },
      {
        "original": "Back end Development: Implement backend infrastructure and expose API services using Spring Boot framework.",
        "corrected": "Back-end development: Implemented backend infrastructure and exposed API services using the Spring Boot framework.",
        "type": "grammar"
      },
      {
        "original": "AARDroid (Investigating security weaknesses in Android Payment SDKs) Built a static analysis tool to analyse 50 payment SDKs in Android.",
        "corrected": "AARDroid (Investigating security weaknesses in Android Payment SDKs): Built a static analysis tool to analyse 50 payment SDKs in Android.",
        "type": "punctuation/formatting"
      }
    ]
  },
  "action_items": [
    "Add a References section with 2–3 named referees including full name, designation, organisation, phone number, and email address.",
    "Reformat Experience into 3–6 concise bullet points per role with quantified outcomes (e.g., metrics, numbers, percentages) to demonstrate impact.",
    "Add a concise Professional Summary at the top linking target role (Security Researcher / Software Security Engineer) with 2–3 core strengths.",
    "Standardize formatting across Education/Experience (consistent bullet points, past/present tense, and date formatting)."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer",
    "inferred_industry": "Technology / Cybersecurity / FinTech",
    "keyword_hits": [
      "Java",
      "Python",
      "C++",
      "SQL",
      "Swift",
      "Android",
      "iOS",
      "Ghidra",
      "IDA Pro",
      "Frida",
      "JEB",
      "dex2Jar",
      "JADX",
      "CodeQL",
      "QARK",
      "Androguard",
      "LibScout",
      "Wireshark",
      "Linux",
      "Git",
      "Spring Boot",
      "NodeJS",
      "PCI DSS",
      "PCI-DSS",
      "Fuzzing",
      "static analysis",
      "reverse engineering"
    ],
    "keyword_gaps": [
      "CI/CD tooling (e.g., GitHub Actions / GitLab CI)",
      "Cloud security (AWS/Azure/GCP)",
      "Threat modeling / secure SDLC"
    ],
    "heading_risks": [
      {
        "original": "CURRICULUM VITAE",
        "issue": "Non-standard top-level heading; ATS may misinterpret as section title.",
        "recommended": "Replace with a simple header: 'Name | City | Email | Website' and remove 'CURRICULUM VITAE'."
      }
    ],
    "ats_tips": [
      "Add a short Executive Summary at the top with target role keywords (Security Researcher / Software Security Engineer) to improve initial keyword capture.",
      "Convert Experience into bullet-point achievements with quantifiable results to improve keyword density and ATS parsing.",
      "Add a References section with 2–3 named referees including full contact details to align with Bangladeshi employer expectations."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 68
}