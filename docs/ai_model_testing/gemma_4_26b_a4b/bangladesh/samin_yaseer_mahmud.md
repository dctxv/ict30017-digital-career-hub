---
resume: samin_yaseer_mahmud
mode: bangladesh
model: gemma_4_26b_a4b
date: 2026-05-15
metadata:
  tokens_per_second: 8.5
  token_count: 920
  cost_usd: 0.00127428
  duration_seconds: 108.2
---

## Analysis Output

```json
{
  "formatting": {
    "score": 95,
    "feedback": "The resume is exceptionally well-formatted for a high-level technical/research role. It uses a clean, professional structure that prioritizes impact and technical depth. The use of whitespace and clear sectioning makes it highly readable for both human recruiters and ATS.",
    "issues": [
      {
        "section": "Experience",
        "issue": "The 'Research Assistant' role at Wolfpack Lab is written as a paragraph rather than bullet points.",
        "suggestion": "Convert the paragraph into 3-4 concise bullet points starting with strong action verbs (e.g., 'Develop tools...', 'Disclose vulnerabilities...') to match the style of your other roles and improve scannability."
      }
    ]
  },
  "content_quality": {
    "score": 98,
    "feedback": "This is an elite-level technical resume. The candidate demonstrates a perfect blend of academic rigor (top-tier publications at USENIX/ACSAC) and industry relevance (internships at Meta, Samsung, PayPal). The quantification of impact and the specificity of technical tools are outstanding.",
    "strengths": [
      "Exceptional publication record with highly competitive acceptance rates (16.2% - 24.1%) clearly stated.",
      "Directly links research interests to high-value industry problems (Payment SDK security, AI privacy).",
      "Excellent technical depth in the 'Skills Summary', categorizing tools by functional area (Analysis, Reverse Engineering).",
      "Strong evidence of full-stack engineering capability alongside specialized security research."
    ],
    "weaknesses": []
  },
  "language_grammar": {
    "score": 96,
    "feedback": "The language is professional, technical, and precise. There are very minor stylistic inconsistencies in verb tense usage in the 'Experience' section.",
    "issues": [
      {
        "original": "I build tools to identify vulnerabilities and security weaknesses in softwares and systems.",
        "corrected": "Build tools to identify vulnerabilities and security weaknesses in software and systems.",
        "type": "Grammatical error ('software' is uncountable) and stylistic inconsistency (removing 'I' for bullet-point style)."
      },
      {
        "original": "I disclose vulnerability reports to software vendors...",
        "corrected": "Disclose vulnerability reports to software vendors...",
        "type": "Stylistic inconsistency (removing first-person pronouns)."
      }
    ]
  },
  "action_items": [
    "Convert the 'Research Assistant' paragraph into bullet points to ensure consistency with the rest of your experience section.",
    "Remove first-person pronouns ('I', 'My') from the Wolfpack Lab description to maintain a professional, objective tone.",
    "Correct the word 'softwares' to 'software' in the Wolfpack Lab section.",
    "Consider adding a 'Selected Impact' or 'Key Metrics' line to your Meta or Samsung internships if you can quantify the scale of the AI assets or the efficiency of the fuzzing improvement."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer",
    "inferred_industry": "Cybersecurity / Big Tech",
    "keyword_hits": [
      "Software Security",
      "Reverse Engineering",
      "Program Analysis",
      "Fuzzing",
      "Payment Security",
      "Android/iOS",
      "CodeQL",
      "Ghidra",
      "Frida",
      "PCI DSS"
    ],
    "keyword_gaps": [
      "Machine Learning Security",
      "Threat Modeling",
      "Cloud Security"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Your skills are already very well-optimized. To further improve, ensure that the specific programming languages used in your research (e.g., Python for automation) are explicitly linked to your research tasks.",
      "Since you are targeting high-end security roles, ensure 'Threat Modeling' or 'Vulnerability Management' is mentioned if those were part of your disclosure process.",
      "The current structure is highly ATS-friendly; avoid adding any complex graphics or multi-column layouts that might disrupt the parsing of your publication list."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 97
}
```
