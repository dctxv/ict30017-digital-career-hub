---
resume: samin
mode: international
model: gpt_5_nano
date: 2026-05-15
metadata:
  tokens_per_second: 103.3
  token_count: 11377
  cost_usd: 0.0047091
  duration_seconds: 110.1
---

## Analysis Output

{
  "formatting": {
    "score": 72,
    "feedback": "Solid overall structure with clear sections, but several formatting inconsistencies reduce ATS readability. Correct CGPA formatting, standardize dates, and tighten section styling to align with Western resume norms.",
    "issues": [
      {
        "section": "EDUCATION",
        "issue": "CGPA formatting missing denominator",
        "suggestion": "Rewrite as 'CGPA 3.89/4.00' for the NCSU entry."
      },
      {
        "section": "EDUCATION",
        "issue": "CGPA formatting missing denominator",
        "suggestion": "Rewrite as 'CGPA 3.75/4.00' for the BUET entry."
      },
      {
        "section": "EXPERIENCE",
        "issue": "Inconsistent date formatting and narrative style",
        "suggestion": "Standardize to bullet points with consistent date ranges (e.g., 'May 2018 – Present' or 'Summer 2023') and convert long sentences into concise bullets."
      },
      {
        "section": "ACADEMIC RESEARCH PROJECTS",
        "issue": "Lack of uniform bullet formatting",
        "suggestion": "Use parallel bullet points starting with strong action verbs and keep each item to 1–2 lines with a measurable outcome where possible."
      },
      {
        "section": "SKILLS SUMMARY",
        "issue": "Parenthetical qualifier and mixed terminology",
        "suggestion": "Remove '(Preferred)' after Java and present languages in a single clean list (e.g., 'Languages: Java, Python, C++, PHP, Hack, Scala, SQL, Thrift, Swift')."
      },
      {
        "section": "HEADER & NON-ESSENTIAL LINES",
        "issue": "Header and separators feel dated (CURRICULUM VITAE, --- separators)",
        "suggestion": "Adopt a modern, streamlined header (no 'CURRICULUM VITAE' line) and replace visual separators with clean section dividers."
      }
    ]
  },
  "content_quality": {
    "score": 78,
    "feedback": "Strong technical and research content with high-impact internships and publications. However, several bullets lack quantified outcomes and some sentences are lengthy. Consider adding measurable results and reformatting bullets for clarity.",
    "strengths": [
      "Excellent academic credentials (PhD track record, high CGPA overall) and strong research focus areas (security, privacy, payment security).",
      "Diverse, high-profile internship experience (Samsung, Meta, PayPal) demonstrating applied security work across Android/iOS and AI/privacy domains.",
      "Robust publications portfolio in reputable venues (ACSAC, USENIX) indicating peer-acknowledged contributions.",
      "Hands-on technical toolkit for Android security, reverse engineering, static analysis, and vulnerability disclosure."
    ],
    "weaknesses": [
      "Many responsibilities are described as broad activities rather than quantified outcomes; add metrics (e.g., vulnerabilities identified, volume of SDKs analyzed, time-to-disclosure).",
      "Bullet formatting is not fully uniform across sections (some long prose lines in Experience; Academic Projects could be concise bullets).",
      "Lacks a concise Professional Summary at the top to frame value proposition for international employers."
    ]
  },
  "language_grammar": {
    "score": 68,
    "feedback": "Several minor grammar and consistency issues affect polish. Correct hyphenation, tense consistency, and subject-verb agreement in a few bullets; align British/American spelling choices where appropriate.",
    "issues": [
      {
        "original": "Ph.D in Computer Science (CGPA 3.89)",
        "corrected": "Ph.D. in Computer Science (CGPA 3.89/4.00)",
        "type": "Spelling/formatting"
      },
      {
        "original": "Area: My research broadly falls within the areas of systems security and privacy.",
        "corrected": "Area: My research broadly falls within systems security and privacy.",
        "type": "Grammar/style"
      },
      {
        "original": "in house mobile Payment SDKs (i.e., Braintree, PayPal) could be misused",
        "corrected": "in-house mobile payment SDKs (i.e., Braintree, PayPal) could be misused",
        "type": "Hyphenation/capitalization"
      },
      {
        "original": "Mobile payment SDK misuse: Identified and measured several ways PayPal's in house mobile Payment SDKs (i.e., Braintree, PayPal) could be misused in both Android and iOS.",
        "corrected": "Mobile payment SDK misuse: Identified and measured several ways PayPal's in-house mobile payment SDKs (i.e., Braintree, PayPal) could be misused in both Android and iOS.",
        "type": "Punctuation/capitalization"
      },
      {
        "original": "Our study indicate the compliance landscape of popular consumer applications",
        "corrected": "Our study indicates the compliance landscape of popular consumer applications",
        "type": "Subject-verb agreement"
      },
      {
        "original": "analyse",
        "corrected": "analyze",
        "type": "Spelling/usage"
      }
    ]
  },
  "action_items": [
    "Add a Professional Summary after the header to frame the candidate's value proposition for international roles and replace the 'CURRICULUM VITAE' header.",
    "Reformat Education CGPAs to include denominators (e.g., 'CGPA 3.89/4.00' for NCSU and 'CGPA 3.75/4.00' for BUET).",
    "Transform EXPERIENCE and ACADEMIC RESEARCH PROJECTS bullets into concise, outcome-focused bullets with quantifiable metrics (e.g., number of vulnerabilities identified, tooling improvements, or time saved).",
    "Standardize dating across all roles (use consistent month/year ranges) and convert long sentences into bullets with strong action verbs.",
    "Clean up Skills Summary: remove '(Preferred)', ensure a single, ATS-friendly list of languages and tools (e.g., separate 'Programming Languages' and 'Tools & Frameworks')."
  ],
  " ats_analysis": {
    "inferred_role": "Security Researcher / Security Engineer with a focus on Android/security, payment security, and privacy",
    "inferred_industry": "Cybersecurity / FinTech / Tech R&D",
    "keyword_hits": [
      "Android",
      "PCI DSS",
      "Mobile payment SDK",
      "Fuzzing",
      "CodeQL",
      "Ghidra",
      "IDA Pro",
      "Frida",
      "Reverse Engineering",
      "Static Analysis",
      "Security",
      "Privacy",
      "KNOX Security",
      "USENIX",
      "ACSAC"
    ],
    "keyword_gaps": [
      { "keyword": "Docker", "priority": "high" },
      { "keyword": "CI/CD", "priority": "medium" },
      { "keyword": "AWS/Azure (Cloud)", "priority": "high" }
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC RESEARCH PROJECTS",
        "issue": "Non-standard heading that some ATS parsers may misread",
        "recommended": "Projects & Research or Projects"
      }
      ],
    "ats_tips": [
      "Add an 'Professional Summary' and a dedicated 'Skills' section with ATS-friendly keywords (e.g., 'vulnerability assessment', 'threat modeling', 'Git', 'CI/CD', 'Docker', 'AWS').",
      "Convert all Experience bullets to bullet-point format starting with strong action verbs and include at least one quantifiable outcome per role.",
      "Ensure EducationCGPAs use denominators (e.g., '/4.00') and standardize date formatting to MM/YYYY – MM/YYYY or Month Year ranges for consistency."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 73
}