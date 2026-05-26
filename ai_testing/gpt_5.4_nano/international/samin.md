---
resume: samin
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 128.1
  token_count: 1935
  cost_usd: 0.00272939
  duration_seconds: 15.1
---

## Analysis Output

{
  "formatting": {
    "score": 68,
    "feedback": "Overall structure is clear (Education/Experience/Projects/Publications/Skills). However, several ATS-unfriendly and international-CV issues reduce effectiveness: the CV uses a Bangladeshi-style title, includes non-standard section headings, and the Personal Information block lacks “Contact Details” formatting conventions. Content blocks also have inconsistent bullet density and some long narrative paragraphs that will be harder for recruiters to scan quickly. Action verbs are present, but many entries need tighter, metric-led bullets.",
    "issues": [
      {
        "section": "Top / heading",
        "issue": "Bangladeshi CV convention and redundant formatting: “CURRICULUM VITAE” as a standalone title.",
        "suggestion": "Replace with a simple name header only (e.g., Name | Contact Details). Keep the page minimal for international recruiters/ATS."
      },
      {
        "section": "EDUCATION",
        "issue": "Heading risk for ATS parsing: “EDUCATION” appears standard, but the content includes an in-line “(CGPA 3.89)” and “(CGPA 3.75)” which is fine; the bigger risk is the overall education formatting (too much text density per entry).",
        "suggestion": "Use a consistent per-degree layout: Degree, Institution (City, Country), Dates, CGPA, Thesis/Focus (1 line max)."
      },
      {
        "section": "Experience",
        "issue": "Long paragraphs instead of concise bullets (e.g., NCSU Research Assistant; KONA role has two separate narrative blocks).",
        "suggestion": "Convert narrative lines into 3–5 bullets per role, each bullet with an outcome and (where possible) scale/impact."
      },
      {
        "section": "ACADEMIC RESEARCH PROJECTS",
        "issue": "Section uses a mixed/unclear status label; “Built…” sentences are sometimes long and not consistently formatted.",
        "suggestion": "Rename to “Selected Projects” (or keep, but ensure consistent bullet style: Objective | Approach | Result/Impact)."
      }
    ]
  },
  "content_quality": {
    "score": 72,
    "feedback": "Strong alignment to security/privacy and payment/PCI-related research. Publications are credible and acceptance rates are helpful. Experience bullets generally describe meaningful technical work (fuzzing triage, ACL policy storage, SDK misuse discovery, reverse engineering). Main weakness: several bullets are too vague or lack measurable outcomes (counts, performance gains, number of apps tested, precision/coverage, concrete vulnerability categories, or demonstrable results). Another gap: tools/frameworks are listed, but practical engineering deliverables (e.g., prototype name, GitHub/publication artifacts, deployment/availability) are not shown.",
    "strengths": [
      "Clear research focus: software security, payment security, privacy; topic coherence across dissertation, internships, and projects.",
      "Strong technical keyword coverage: static analysis, reverse engineering, fuzzing, Android/iOS security, PCI DSS, program analysis.",
      "Publications include venue credibility and acceptance rates."
    ],
    "weaknesses": [
      "Under-quantified impact in multiple internship and experience bullets (e.g., “Improved crash triaging process” lacks measurable improvement; “Identified and measured several ways” lacks number/scope/impact).",
      "Some bullets read as general descriptions rather than outcomes (e.g., “provide security recommendations” without what was changed/accepted).",
      "Selected Projects descriptions are good but lack concrete outputs (tool availability, evaluation methodology, dataset/app count beyond “50 payment SDKs”).",
      "Target role for international recruiters is not explicitly framed (e.g., “Research Assistant / Security Researcher / Security Engineer”), which may reduce match for non-academic roles."
    ]
  },
  "language_grammar": {
    "score": 81,
    "feedback": "Language is generally clear and professional. A few grammar/wording issues reduce polish: inconsistent verb tense, missing articles, and spelling/capitalisation inconsistencies (e.g., “softwares”, “analyse”). Also, some bullets are missing hyphenation/parallelism for readability.",
    "issues": [
      {
        "original": "Compliance of Android Payment Applications to Industry Security Standards",
        "corrected": "Compliance of Android Payment Applications with Industry Security Standards",
        "type": "wording/grammar"
      },
      {
        "original": "identify vulnerabilities and security weaknesses in softwares and systems",
        "corrected": "identify vulnerabilities and security weaknesses in software and systems",
        "type": "spelling/word form"
      },
      {
        "original": "Utilised industry graded tools",
        "corrected": "Used industry-standard tools",
        "type": "word choice"
      },
      {
        "original": "Utilised industry graded tools to find SDK version usage in Android apps.",
        "corrected": "Used industry-standard tools to determine SDK version usage across Android apps.",
        "type": "clarity/grammar"
      },
      {
        "original": "Our study indicate the compliance landscape",
        "corrected": "Our study indicates the compliance landscape",
        "type": "subject–verb agreement"
      },
      {
        "original": "card asking android applications",
        "corrected": "credit-card input forms in Android applications",
        "type": "clarity"
      }
    ]
  },
  "action_items": [
    "In “Wolfpack Security and Privacy Research Lab — Research Assistant”, replace the two long sentences starting with “Area:” and “I apply…” with 4–6 bullets that each include an outcome (e.g., vulnerability categories found, tool results, and any measurable vendor response or adoption).",
    "In “Meta Platforms — Research Intern (AI Security and Privacy)”, rewrite “Improved crash triaging process…” to include a metric (e.g., % faster triage, number of crashes processed, reduced time-to-root-cause).",
    "In “PayPal Inc. — Research Intern (InfoSec)”, rewrite “Identified and measured several ways…” to specify scope (e.g., number of apps/analyzed SDK versions, Android/iOS counts) and at least one quantified finding.",
    "In “ACADEMIC RESEARCH PROJECTS”, rename “Built…” paragraphs into a consistent format: Objective (1 line) → Approach (1 line) → Results (1 line with dataset/app counts, accuracy, or concrete evaluation).",
    "In “SKILLS SUMMARY”, make the formatting more ATS-friendly by using explicit skill keywords as separate lines (e.g., group by “Languages”, “Static Analysis”, “Reverse Engineering”, “Security Tools”, “OS/Platforms”) and ensure “Latex” is corrected to “LaTeX”."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer (Android/iOS & payment/PCI security research)",
    "inferred_industry": "Cybersecurity (Application security, privacy/security research)",
    "keyword_hits": [
      "software security",
      "privacy",
      "Android",
      "iOS",
      "reverse engineering",
      "fuzzing",
      "static analysis",
      "vulnerability reports",
      "Android Payment",
      "PCI DSS",
      "program analysis",
      "Android security tools",
      "Wireshark",
      "Ghidra",
      "IDA Pro",
      "Frida",
      "CodeQL",
      "Linux",
      "Git",
      "NLP",
      "dataflow analysis"
    ],
    "keyword_gaps": [
      "threat modeling",
      "secure coding",
      "secure SDLC"
    ],
    "heading_risks": [
      {
        "original": "CURRICULUM VITAE",
        "issue": "Non-standard standalone CV title can reduce ATS parsing consistency compared with simple name/contact header formats.",
        "recommended": "Remove this line; use only the name as the header, followed by a “Contact Details” block."
      },
      {
        "original": "ACADEMIC RESEARCH PROJECTS",
        "issue": "Some ATS extractors treat this as a non-standard heading and may misclassify it; it’s safer to use “Projects” or “Selected Projects”.",
        "recommended": "Rename to “Selected Projects”."
      }
    ],
    "ats_tips": [
      "Replace long narrative lines in “Experience” (e.g., the “Area:” paragraph) with bullet points so ATS can extract role scope and accomplishments more reliably.",
      "Add 1–2 explicit security-engineering keywords that ATS often expects for this lane (e.g., include a bullet mentioning “threat modeling” and/or “secure SDLC” if you have done it).",
      "Remove or avoid personal-demographic information where present; international ATS/recruiters often discount resumes containing personal demographic data (e.g., age, religion, marital status, NID, photograph, DOB)."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 72
}