---
resume: samin
mode: international
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 94
  token_count: 1880
  cost_usd: 0.012997
  duration_seconds: 20
---

## Analysis Output

```json
{
  "formatting": {
    "score": 92,
    "feedback": "The resume demonstrates excellent structural clarity with well-organized sections, consistent spacing, and professional typography. Section headings are clear and hierarchical. Bullet points are used effectively in the experience section. The layout is clean and scannable. Minor spacing inconsistencies exist between sections, but overall presentation is strong and suitable for international applications.",
    "issues": []
  },
  "content_quality": {
    "score": 78,
    "feedback": "The resume demonstrates strong technical depth and impressive credentials, with clear evidence of research impact through peer-reviewed publications at top-tier venues. However, several experience bullets lack quantification and specificity. The KONA section uses vague language that undermines the candidate's contributions. Research project descriptions are outcome-focused but could benefit from clearer metrics. The resume effectively showcases a PhD candidate with strong security research credentials, but junior-level work descriptions need strengthening.",
    "strengths": [
      "Strong publication record at top-tier security conferences (USENIX Security, ACSAC) with competitive acceptance rates cited",
      "Clear research focus and dissertation topic directly aligned with professional experience",
      "Diverse internship experience across major tech companies (Meta, PayPal, Samsung) in security-relevant roles",
      "Technical depth demonstrated through specific tools and frameworks listed",
      "Academic research projects show concrete deliverables (tools built, findings reported)"
    ],
    "weaknesses": [
      "KONA section uses weak action verbs and vague descriptions: 'Develop front end payment apps' lacks specifics on scale, impact, or technologies used; 'Design and implement UI/UX' provides no measurable outcome",
      "Samsung internship bullet is underdeveloped: 'Research how hardware security features might meet payment card industry's security standard goals' lacks clarity on what was actually delivered or discovered",
      "Wolfpack Research Assistant description is narrative rather than achievement-focused; no metrics on tools built, vulnerabilities disclosed, or research output",
      "PayPal internship lacks quantification: 'Identified and measured several ways' should specify the number of misuse patterns found and their severity or impact",
      "Meta internship bullets lack context: 'Improved crash triaging process' provides no baseline or improvement metric; 'Designed and implemented a recursive structure' is too technical without business or security impact",
      "Academic research projects lack publication status or dissemination details for AARDroid and Cardpliance (though Cardpliance appears in publications, the project description doesn't reference this)"
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The resume demonstrates strong professional writing with correct grammar and appropriate technical terminology. Tense usage is generally consistent. However, several minor issues reduce clarity: inconsistent capitalization in section headings, mixed use of active and passive voice, and one grammatical error. The writing is clear and professional overall, suitable for international audiences.",
    "issues": [
      {
        "original": "Our findings report saving unencrypted credit card information",
        "corrected": "Our findings report instances of unencrypted credit card information being saved",
        "type": "Grammar/Clarity"
      },
      {
        "original": "Our study indicate the compliance landscape",
        "corrected": "Our study indicates the compliance landscape",
        "type": "Subject-verb agreement"
      },
      {
        "original": "Utilised industry graded tools",
        "corrected": "Utilised industry-grade tools",
        "type": "Hyphenation (minor)"
      },
      {
        "original": "Reverse engineered iOS apps on jail-broken device",
        "corrected": "Reverse engineered iOS apps on jailbroken devices",
        "type": "Hyphenation and pluralization"
      }
    ]
  },
  "action_items": [
    "Strengthen the KONA section (Full-Stack Software Engineer) by replacing vague descriptions with specific metrics: replace 'Develop front end payment apps in Android and iOS' with concrete examples such as 'Developed 3 production payment applications for Android and iOS, serving [X] users' or 'Implemented payment UI components used in [specific product]'; quantify the scope of backend work (e.g., 'Designed and deployed REST APIs serving [X] requests/day using Spring Boot').",
    "Expand the Samsung internship bullet to clarify deliverables: replace 'Research how hardware security features might meet payment card industry's security standard goals' with a specific outcome such as 'Evaluated 5 hardware security features against PCI DSS requirements and authored recommendations for [specific outcome]' or 'Authored technical report comparing hardware vs. software implementations for payment security compliance'.",
    "Add quantification to the PayPal internship bullet: replace 'Identified and measured several ways PayPal's in house mobile Payment SDKs could be misused' with 'Identified and measured 8+ SDK misuse patterns across Android and iOS, affecting [X]% of apps in the wild' or similar concrete metric.",
    "Revise the Wolfpack Research Assistant description from narrative to achievement-focused format: replace the current paragraph with 2–3 bullet points such as 'Disclosed [X] security vulnerabilities to software vendors with [X]% remediation rate' and 'Built [specific tool name] to identify [specific vulnerability class] in [X] applications'.",
    "Clarify the Meta internship bullets with baseline and impact metrics: for 'Improved crash triaging process', specify 'Reduced crash triage time by [X]% by integrating stacktrace information into fuzzing tool reports'; for the ACL policy work, add context such as 'Designed recursive data structure for secure ACL policy storage, enabling [specific capability or security improvement]'."
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer (PhD-level)",
    "inferred_industry": "Cybersecurity / Software Security / Privacy",
    "keyword_hits": [
      "Android",
      "iOS",
      "security",
      "privacy",
      "reverse engineering",
      "static analysis",
      "vulnerability",
      "compliance",
      "PCI DSS",
      "payment security",
      "Java",
      "Python",
      "C++",
      "Linux",
      "Git",
      "API",
      "REST",
      "Spring Boot",
      "cryptography",
      "WebView",
      "SDK",
      "fuzzing",
      "ACL",
      "NLP",
      "entity extraction"
    ],
    "keyword_gaps": [
      "Machine learning / deep learning (if applying to AI security roles; NLP mentioned but not explicitly labeled)",
      "Penetration testing / ethical hacking (common in security roles; reverse engineering is present but not this explicit term)",
      "OWASP / CWE (industry-standard vulnerability classification frameworks not mentioned)"
    ],
    "heading_risks": [],
    "ats_tips": [
      "Add explicit mention of 'vulnerability disclosure' or 'responsible disclosure' in the Wolfpack Research Assistant section, as this is a high-value keyword for security researcher roles and is currently only implied through 'disclose vulnerability reports'.",
      "Include specific tool names and frameworks already present (Amandroid, Flowdroid, CodeQL, Ghidra) in the experience section bullets where relevant, rather than only in the Skills Summary. For example, in the AARDroid project description, specify 'Built static analysis tool using Amandroid framework to analyse 50 payment SDKs' to improve keyword matching.",
      "Add 'threat modeling' or 'security assessment' as explicit terms if applicable to your research; these are common ATS keywords for security roles and may improve matching even if the concept is present in your work."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 86
}
```