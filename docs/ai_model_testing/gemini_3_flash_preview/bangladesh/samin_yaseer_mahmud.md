---
resume: samin_yaseer_mahmud
mode: bangladesh
model: gemini_3_flash_preview
date: 2026-05-15
metadata:
  tokens_per_second: 178.1
  token_count: 1037
  cost_usd: 0.012153
  duration_seconds: 5.8
---

## Analysis Output

```json
{
  "formatting": {
    "score": 85,
    "feedback": "The resume follows a clean, academic-professional hybrid layout suitable for high-level research roles in the US and multinational R&D centers in Bangladesh. It uses clear section headers and consistent dating. The score is high because it avoids the dense personal data blocks typical of local BD resumes, making it highly readable for international ATS.",
    "issues": [
      {
        "section": "Experience",
        "issue": "The descriptions for the 'Research Assistant' and 'Full-Stack Software Engineer' roles use paragraph blocks rather than bullet points.",
        "suggestion": "Convert these paragraphs into 3-5 high-impact bullet points starting with strong action verbs to improve scannability."
      }
    ]
  },
  "content_quality": {
    "score": 95,
    "feedback": "This is an elite-level resume. The candidate demonstrates a rare combination of top-tier academic publishing (USENIX Security, ACSAC) and industry experience at global tech giants (Meta, Samsung, PayPal). The technical depth in software security and reverse engineering is exceptionally well-documented.",
    "strengths": [
      "Inclusion of acceptance rates for publications, which provides immediate context for the prestige of the venues.",
      "Strong quantification of research impact, such as disclosing vulnerability reports to vendors.",
      "Clear bridge between academic research (PhD) and industry application (Internships)."
    ],
    "weaknesses": [
      "The 'KONA' experience in Bangladesh is slightly less detailed than the US roles; adding specific project names or scale (e.g., number of users) would strengthen it.",
      "Missing a 'References' section which, while often 'available upon request' in the US, is expected to be listed with full details for senior/specialized roles in the Bangladesh market."
    ]
  },
  "language_grammar": {
    "score": 92,
    "feedback": "The language is technically precise and professional. There are minor instances of inconsistent tense and pluralization.",
    "issues": [
      {
        "original": "identify vulnerabilities and security weaknesses in softwares and systems",
        "corrected": "identify vulnerabilities and security weaknesses in software and systems",
        "type": "grammar"
      },
      {
        "original": "Our study indicate the compliance landscape",
        "corrected": "Our study indicates the compliance landscape",
        "type": "grammar"
      }
    ]
  },
  "action_items": [
    "Experience Section: Rewrite the 'Research Assistant' and 'Full-Stack Software Engineer' sections using bullet points. For KONA, specify the scale of the payment apps developed.",
    "References: For applications within Bangladesh (e.g., Samsung R&D Institute Bangladesh or top universities), add a References section with 2-3 named referees, including your PhD supervisor and a manager from your internships.",
    "Skills Summary: Categorize the 'Languages' section by proficiency (e.g., 'Expert: Java, Python; Familiar: Scala, Swift') to give recruiters a clearer picture of your core strengths.",
    "Website: Ensure the link to 'saminmahmud.com' is a live hyperlink in the PDF version of the resume."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Senior Software Engineer (Security)",
    "inferred_industry": "Cybersecurity / Tech / R&D",
    "keyword_hits": [
      "Software Security",
      "Reverse Engineering",
      "Static Analysis",
      "Fuzzing",
      "PCI DSS",
      "Android",
      "iOS",
      "Java",
      "Python",
      "Ghidra",
      "Frida",
      "CodeQL"
    ],
    "keyword_gaps": [
      "Cloud Security",
      "Kubernetes",
      "CI/CD Security"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Ensure that 'PhD' is written as both 'Ph.D' and 'Doctor of Philosophy' somewhere in the text to capture all variations of educational filters.",
      "Add 'Cybersecurity' as a keyword in your research interest or summary to hit broad industry searches.",
      "List 'USENIX Security' and 'ACSAC' in a way that emphasizes they are top-tier conferences, as some ATS use conference rankings as a filter for R&D roles."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 92
}
```
