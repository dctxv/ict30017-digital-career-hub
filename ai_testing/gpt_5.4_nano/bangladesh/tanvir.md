---
resume: tanvir
mode: bangladesh
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 117.4
  token_count: 1479
  cost_usd: 0.00246195
  duration_seconds: 12.6
---

## Analysis Output

{
  "formatting": {
    "score": 82,
    "feedback": "Overall the resume is clean and easy to follow, with clear section headings and consistent use of bullets in the experience section. Spacing/indentation is mostly consistent, but a few lines are wrapped in a way that can look dense and reduce ATS readability (e.g., objective text and declaration/signature block).",
    "issues": [
      {
        "section": "Career Objective",
        "issue": "The objective is wrapped across multiple lines and uses line breaks that may appear uneven in different templates.",
        "suggestion": "Rewrite as 2–3 lines max in a single paragraph (no manual line breaks), keeping the same content."
      },
      {
        "section": "Declaration",
        "issue": "Signature and Date are separated without clear formatting alignment; may appear inconsistent when converted to PDF/ATS text.",
        "suggestion": "Use a simple two-line block: 'Signature: ________' and 'Date: ________' (single line each)."
      }
    ]
  },
  "content_quality": {
    "score": 58,
    "feedback": "You have the right overall structure for a banking/customer-service track and your internship at Mutual Trust Bank is relevant. However, the experience bullets use broad, non-quantified phrasing (e.g., 'assisted', 'helped', 'did data entry') without outcomes, volumes, turnaround time, or accuracy metrics—this weakens impact. The Career Objective content is also generic and doesn’t specify a target position or one concrete value you bring. References are listed only as 'available upon request', which is typically not sufficient in Bangladesh.",
    "strengths": [
      "Relevant internship experience in a bank (customer service) including customer transaction processing, KYC/account opening documentation, and record handling.",
      "Education is clearly presented with CGPA/GPA and passing years.",
      "Basic proficiency with MS Office tools and relevant language skills (Bengali native; English reading/writing)."
    ],
    "weaknesses": [
      "Career Objective is generic: it does not specify the exact role (e.g., Customer Service Officer, Branch Operations, Relationship Officer) or a concrete strength.",
      "Professional Experience bullets are mostly vague ('Assisted', 'Helped', 'Supported', 'Did data entry work') and lack measurable results (e.g., number of customers, accuracy/quality checks, turnaround time).",
      "References section is not in the expected Bangladesh format; it only says 'available upon request'.",
      "No extracurricular/voluntary activities section is included (often expected for candidates who are relatively recent graduates/interns).",
      "English proficiency is not specific (e.g., reading/writing only); customer-facing banking roles often require clearer communication capability."
    ]
  },
  "language_grammar": {
    "score": 74,
    "feedback": "Language is clear overall, with minor phrasing that can be tightened for professionalism. Most grammar is correct; a few bullet phrases are slightly informal or imprecise for a banking CV.",
    "issues": [
      {
        "original": "To get a challenging job in a reputed bank or financial institution where I can utilize my knowledge and skills and build a bright career for myself.",
        "corrected": "To obtain a Customer Service/Branch Operations role in a bank where I can apply my BBA Finance background and my internship experience to support efficient customer onboarding and accurate documentation.",
        "type": "content_quality_style"
      },
      {
        "original": "Did data entry work for new account registration",
        "corrected": "Completed data entry for new account registrations",
        "type": "word_choice"
      },
      {
        "original": "Supported the branch team in filing and organising customer records",
        "corrected": "Assisted the branch team with filing and organising customer records",
        "type": "word_choice"
      },
      {
        "original": "Assisted manager in preparation of daily and monthly reports",
        "corrected": "Assisted the manager with preparation of daily and monthly reports",
        "type": "grammar"
      }
    ]
  },
  "action_items": [
    "Update the CAREER OBJECTIVE to name a specific target role in banking/financial services and include one concrete strength from your internship (section: CAREER OBJECTIVE).",
    "Rewrite 4–5 internship bullets in PROFESSIONAL EXPERIENCE to include measurable outcomes or more precise responsibilities (e.g., approximate daily customer count, documentation checks performed, accuracy/quality control, report types) (section: PROFESSIONAL EXPERIENCE).",
    "Replace 'References available upon request' with 2–3 named referees and include designation, organisation, phone number, and email (section: REFERENCES).",
    "Add an EXTRACURRICULAR / VOLUNTEERING / CLUB ACTIVITIES section (use one subheading and 3–5 entries) to strengthen your profile as a recent graduate with limited work history (new section).",
    "Add a short 'Education Project/Thesis' entry only if you completed a final-year project (title + 1-line outcome); otherwise ensure your finance coursework highlights are reflected under EDUCATIONAL QUALIFICATION (section: EDUCATIONAL QUALIFICATION)."
  ],
  "ats_analysis": {
    "inferred_role": "Customer Service / Branch Operations Intern or Junior Executive (Banking)",
    "inferred_industry": "Banking / Financial Services",
    "keyword_hits": [
      "Customer Service",
      "Customer transaction processing",
      "account opening",
      "KYC",
      "data entry",
      "customer records",
      "daily and monthly reports",
      "MS Word",
      "MS Excel",
      "MS PowerPoint",
      "Internet Browsing"
    ],
    "keyword_gaps": [
      "AML",
      "compliance",
      "CRM"
    ],
    "heading_risks": [
      {
        "original": "COMPUTER SKILLS",
        "issue": "Some ATS parsers expect standard phrasing like 'Technical Skills' and may treat 'Computer Skills' inconsistently.",
        "recommended": "Use 'Technical Skills' as the heading (content can remain the same)."
      }
    ],
    "ats_tips": [
      "Add explicit banking/compliance keywords commonly used in ATS filters for customer onboarding (e.g., AML screening, compliance checks) if you performed them during internship; otherwise, remove any inaccurate claims and focus only on what you actually did.",
      "In PROFESSIONAL EXPERIENCE, replace vague verbs ('Assisted', 'Helped', 'Supported', 'Did') with quantified/explicit outcomes (e.g., number of accounts processed per day/week, types of reports prepared).",
      "Keep all contact information in a consistent plain-text format and avoid manual line breaks in paragraphs so ATS text extraction stays clean (sections: CAREER OBJECTIVE and DECLARATION)."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 64
}