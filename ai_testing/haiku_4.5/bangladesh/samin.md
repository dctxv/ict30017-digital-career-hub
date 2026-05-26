---
resume: samin
mode: bangladesh
model: haiku_4.5
date: 2026-05-15
metadata:
  tokens_per_second: 97.9
  token_count: 2437
  cost_usd: 0.016262
  duration_seconds: 24.9
---

## Analysis Output

```json
{
  "formatting": {
    "score": 75,
    "feedback": "The resume follows a clean, professional structure with clear section headings and consistent spacing. However, it contains three or more Bangladeshi CV conventions (Personal Information section is absent, no Declaration section, no Photograph, no References section with named referees). This is appropriate for an international academic/research audience but represents a departure from Bangladesh employer expectations. The formatting itself is sound for a Western/international context. Note: CGPA denominators are missing for both degrees (should be /4.00 for NCSU and /5.00 for BUET). This is a formatting issue that should be corrected.",
    "issues": [
      {
        "section": "Education - North Carolina State University",
        "issue": "CGPA denominator missing",
        "suggestion": "Change 'CGPA 3.89' to 'CGPA 3.89/4.00'"
      },
      {
        "section": "Education - BUET",
        "issue": "CGPA denominator missing",
        "suggestion": "Change 'CGPA 3.75' to 'CGPA 3.75/5.00'"
      },
      {
        "section": "Overall structure",
        "issue": "No References section with named referees and contact details",
        "suggestion": "Add a References section with at least two named referees including their designation, organisation, phone number, and email address (standard for Bangladesh employers, though less critical for international academic roles)"
      }
    ]
  },
  "content_quality": {
    "score": 82,
    "feedback": "The resume demonstrates strong research credentials, clear technical depth, and quantifiable outcomes across internships and academic projects. The candidate's progression from full-stack engineer to research-focused roles is well-documented. However, several bullet points lack specificity or quantification, and the Career Objective is absent entirely. The Academic Research Projects section is well-structured but could benefit from more explicit outcome metrics. Overall, this is a strong research-focused resume with minor gaps in specificity.",
    "strengths": [
      "Strong publication record in top-tier security conferences (USENIX Security, ACSAC) with competitive acceptance rates clearly stated",
      "Clear research focus and progression: from full-stack development to security research with a coherent narrative",
      "Quantified outcomes in internships: 'Identified and measured several ways PayPal's SDKs could be misused', 'analysed 50 payment SDKs', 'study of popular consumer applications'",
      "Diverse technical toolkit across static analysis, reverse engineering, and program analysis",
      "Dissertation title and research interests clearly stated, demonstrating research maturity"
    ],
    "weaknesses": [
      "Career Objective section is missing entirely. For a Ph.D. candidate transitioning to industry or postdoctoral roles, a brief objective stating target role (e.g., 'Security Researcher', 'Software Security Engineer') and value proposition would strengthen positioning.",
      "KONA role (2016–2018) lacks quantification: 'Develop front end payment apps' and 'Implement backend infrastructure' are vague. Suggest: 'Developed and deployed 3 production Android/iOS payment applications serving X users' or 'Implemented REST API services using Spring Boot, handling X requests/day'",
      "Samsung internship bullet is underdeveloped: 'Research how hardware security features might meet payment card industry's security standard goals' lacks outcome. Did this result in a paper, tool, or recommendation? Suggest: 'Evaluated hardware security features against PCI DSS standards, identifying 3 key compliance gaps and proposing mitigation strategies'",
      "Meta internship fuzzing bullet lacks context: 'Improved crash triaging process by including stacktrace information' — improved by how much? Suggest: 'Enhanced crash triaging accuracy by 40% through stacktrace integration, reducing triage time from X to Y hours'",
      "Academic Research Projects section lacks publication status or impact metrics. For AARDroid and Cardpliance, are these published? If so, link to the publications section. If not, state 'Under review' or 'In preparation'.",
      "No extracurricular activities or volunteer experience beyond the single workshop lead entry. The resume lists only one volunteer role with minimal detail. For a Ph.D. candidate, additional community engagement, mentoring, or leadership roles would strengthen candidacy."
    ]
  },
  "language_grammar": {
    "score": 88,
    "feedback": "The resume is well-written with strong technical vocabulary and clear communication. Grammar and spelling are generally accurate. However, there are minor inconsistencies in tense usage (mixing present and past tense in the same section) and one instance of informal phrasing. Commonwealth English spelling is correctly used throughout (e.g., 'analyse'). Overall, language quality is professional and appropriate for an academic/research audience.",
    "issues": [
      {
        "original": "Area: My research broadly falls within the areas of systems security and privacy.",
        "corrected": "My research focuses on systems security and privacy.",
        "type": "Wordiness and informal phrasing"
      },
      {
        "original": "I apply program analysis and reverse engineering techniques to solve security problems. I build tools to identify vulnerabilities and security weaknesses in softwares and systems.",
        "corrected": "I apply program analysis and reverse engineering techniques to identify vulnerabilities and security weaknesses in software and systems, developing tools to automate detection.",
        "type": "Tense consistency and redundancy"
      },
      {
        "original": "softwares",
        "corrected": "software",
        "type": "Spelling/Grammar (software is uncountable)"
      },
      {
        "original": "Utilised industry graded tools to find SDK version usage in Android apps.",
        "corrected": "Utilised industry-standard tools to identify SDK version usage across Android apps.",
        "type": "Phrasing clarity"
      },
      {
        "original": "Our study indicate the compliance landscape",
        "corrected": "Our study indicates the compliance landscape",
        "type": "Subject-verb agreement"
      }
    ]
  },
  "action_items": [
    "Add CGPA denominators to both Education entries: change 'CGPA 3.89' to 'CGPA 3.89/4.00' (NCSU) and 'CGPA 3.75' to 'CGPA 3.75/5.00' (BUET). This is a standard formatting requirement for international applications.",
    "Rewrite the Wolfpack Security Lab description to remove first-person narrative and vague phrasing. Replace 'Area: My research broadly falls within...' with a concise bullet-point format: 'Developed static analysis tools to identify security vulnerabilities in software systems; disclosed findings to vendors and provided remediation recommendations.'",
    "Quantify the KONA full-stack role (2016–2018): specify number of applications deployed, user base, API throughput, or team size. Example: 'Developed and deployed 5 production Android/iOS payment applications; implemented REST APIs using Spring Boot handling 10K+ daily transactions.'",
    "Expand the Samsung internship outcome: clarify whether research resulted in a publication, tool, or formal recommendation. Example: 'Evaluated hardware security features against PCI DSS standards, identifying 3 compliance gaps and proposing hardware-software co-design improvements documented in internal technical report.'",
    "Add quantification to the Meta fuzzing bullet: specify improvement metrics. Example: 'Enhanced crash triaging accuracy by 35% through stacktrace integration, reducing manual triage time by 2 hours per day across 50+ fuzzing campaigns.'"
  ],
  "ats_analysis": {
    "inferred_role": "Security Researcher / Software Security Engineer",
    "inferred_industry": "Cybersecurity / Software Security / Research",
    "keyword_hits": [
      "Android",
      "iOS",
      "security",
      "privacy",
      "static analysis",
      "reverse engineering",
      "vulnerability",
      "compliance",
      "PCI DSS",
      "payment",
      "Java",
      "Python",
      "C++",
      "Linux",
      "Git",
      "USENIX",
      "research",
      "Ph.D"
    ],
    "keyword_gaps": [
      "Machine learning / AI security (implied by Meta role but not explicitly stated in skills)",
      "Threat modeling / risk assessment",
      "Secure coding practices / OWASP"
    ],
    "heading_risks": [
      {
        "original": "ACADEMIC RESEARCH PROJECTS",
        "issue": "Some ATS systems may not recognise this as a standard section heading and may fail to parse project titles and descriptions correctly.",
        "recommended": "RESEARCH PROJECTS"
      },
      {
        "original": "SKILLS SUMMARY",
        "issue": "Non-standard heading; some ATS systems expect 'TECHNICAL SKILLS' or 'SKILLS'.",
        "recommended": "TECHNICAL SKILLS"
      }
    ],
    "ats_tips": [
      "Add explicit keywords for machine learning and AI security to the Skills Summary. The Meta internship mentions 'AI Security and Privacy' but the skills section does not list ML frameworks (TensorFlow, PyTorch) or AI-related tools. Add a line: 'Machine Learning: TensorFlow, PyTorch, scikit-learn' if applicable, or clarify the nature of AI security work in the Meta bullet point.",
      "Expand the 'Others' skills category to include security-specific methodologies. Add keywords such as 'threat modeling', 'secure code review', 'OWASP Top 10', or 'security testing' if these are part of your toolkit. This will improve matching for security-focused job postings.",
      "Ensure publication titles in the Selected Publications section match exactly with how they appear in academic databases (Google Scholar, DBLP). ATS systems used by research institutions and tech companies often cross-reference publication records; exact title matching improves verification and credibility scoring."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 82
}
```