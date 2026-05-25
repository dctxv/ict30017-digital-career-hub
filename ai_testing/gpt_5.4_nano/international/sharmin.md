---
resume: sharmin
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 140.3
  token_count: 2049
  cost_usd: 0.00276849
  duration_seconds: 14.6
---

## Analysis Output

{
  "formatting": {
    "score": 48,
    "feedback": "The resume is readable, but it uses multiple non-standard Bangladeshi CV conventions and ATS-unfriendly headings. Spacing and alignment are inconsistent (e.g., indentation under experience bullets, and varying label formatting such as “Year:” vs “Duration:” vs free text). The experience section has section-name typos (“WORK EXPERIANCE”) and weak typographic structure (bullets start with varying indentation and one line uses a sentence fragment “Also helped…”). Contact and address blocks are presented in a resume style that international ATS systems often cannot reliably parse due to line breaks and labels.",
    "issues": [
      {
        "section": "CAREER OBJECTIVE",
        "issue": "Heading risk: “CAREER OBJECTIVE” is non-standard for international ATS and can reduce parsing reliability.",
        "suggestion": "Replace with “PROFESSIONAL SUMMARY” (2–3 lines) tailored to HR/admin roles."
      },
      {
        "section": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Heading risk: “EDUCATIONAL QUALIFICATIONS” is non-standard; ATS systems may mis-parse or treat it as a non-generic education block.",
        "suggestion": "Use “EDUCATION”."
      },
      {
        "section": "WORK EXPERIANCE",
        "issue": "Typo in section heading: “EXPERIANCE” (spelling) reduces professionalism.",
        "suggestion": "Rename section to “WORK EXPERIENCE”."
      },
      {
        "section": "PERSONAL INFORMATIONS",
        "issue": "Multiple non-standard personal demographic items are included, and the heading itself is ATS-unfriendly.",
        "suggestion": "Remove all demographic/personal fields (parent names, DOB, religion, marital status, blood group) and keep only “Contact Details”."
      },
      {
        "section": "DECLARATION",
        "issue": "Bangladeshi convention; declaration blocks are not used in international resumes and waste space.",
        "suggestion": "Remove the entire declaration section."
      },
      {
        "section": "WORK EXPERIANCE (HR Intern bullets)",
        "issue": "One bullet is a sentence fragment and not aligned with the rest (“Also helped…”).",
        "suggestion": "Rewrite all bullets as parallel, metric-focused statements starting with action verbs."
      },
      {
        "section": "Overall layout",
        "issue": "Inconsistent label styling and spacing (e.g., “Mobile:” vs “Email:” lines; “Year:”/“CGPA:” lines).",
        "suggestion": "Use consistent formatting for all labeled items (same punctuation style, consistent spacing, and consistent use of commas where needed)."
      }
    ]
  },
  "content_quality": {
    "score": 52,
    "feedback": "You have relevant internships and an administrative assistant role, and you list practical HR/admin tasks. However, most bullets are generic and lack measurable outcomes (no metrics, volumes, timelines, systems/tools used, or specific results). The HR internship bullet points mix administrative activities with HR support, but it’s unclear what you actually owned vs assisted with. Skills are basic; international HR/admin roles typically expect specific HR/admin systems knowledge and clearer competency mapping (e.g., HRIS, payroll support, document control, recruitment coordination, onboarding process ownership).",
    "strengths": [
      "Relevant experience aligned to HR support and administrative coordination (attendance/leave tracking, recruitment support, documentation, onboarding support).",
      "Clear education with CGPA and grading information.",
      "Basic office tools listed (MS Word, Excel, PowerPoint, internet)."
    ],
    "weaknesses": [
      "Under-quantified experience bullets: multiple statements describe tasks without impact or scale (e.g., no number of employees, documents processed, letters handled, or event counts).",
      "Vague language reduces strength: “Helping HR team…”, “Assisting…”, “Support in managing…” are not backed with specific outcomes.",
      "Skills section is not HR/administration specific enough for international screening (no HR processes phrased as competencies, no ATS-friendly system keywords like HRIS, recruitment tracking, document control).",
      "No “Professional Summary” tailored to HR/admin; the objective is generic and not structured for ATS or recruiters."
    ]
  },
  "language_grammar": {
    "score": 60,
    "feedback": "Grammar is mostly understandable, but there are several professionalism issues: “WORK EXPERIANCE” typo, declaration sentence has incorrect word form (“informations”), and the objective contains run-on phrasing. Also, some bullets start with inconsistent capitalization/formatting.",
    "issues": [
      {
        "original": "WORK EXPERIANCE",
        "corrected": "WORK EXPERIENCE",
        "type": "Spelling/Typo"
      },
      {
        "original": "Also helped in organising company events and employee engagement activities",
        "corrected": "Organised company events and supported employee engagement activities",
        "type": "Style/Parallel structure"
      },
      {
        "original": "I am hereby declared that all the informations given above is correct to my knowledge.",
        "corrected": "I hereby declare that all the information given above is true to the best of my knowledge.",
        "type": "Grammar"
      },
      {
        "original": "I want to get a good job in HR or admin department in any reputed company or organisation where I can work hard and prove myself and make a good future.",
        "corrected": "To secure an HR or Administration role in a reputable organisation where I can apply my HR support and administrative experience and grow my career.",
        "type": "Clarity/Grammar"
      }
    ]
  },
  "action_items": [
    "Replace the “CAREER OBJECTIVE” section with a “PROFESSIONAL SUMMARY” (2–3 lines) focused on HR internship + administration assistant experience and include 2–3 core strengths (e.g., attendance/leave tracking, recruitment coordination support, document handling).",
    "Remove the entire “DECLARATION” section and all items in “PERSONAL INFORMATIONS” that are non-standard for international applications (parent names, date of birth, religion, blood group, marital status, addresses). Keep only “Contact Details” (phone + email).",
    "Rewrite each bullet under “HR Intern” and “Administrative Assistant” to include measurable scope and clearer ownership (e.g., number of employees covered, number of letters/documents prepared per month, volume of calls/emails processed, number of onboarding sessions/events supported).",
    "Rename “WORK EXPERIANCE” to “WORK EXPERIENCE” and standardise bullet formatting to start each bullet with an action verb and keep consistent indentation and punctuation.",
    "Upgrade “SKILLS” to be HR/admin relevant and ATS-friendly by adding specific HR-admin competencies (e.g., leave/attendance tracking, onboarding support, recruitment coordination, document filing & contract tracking, meeting coordination). If you used any HRIS or tools, add them explicitly."
  ],
  "ats_analysis": {
    "inferred_role": "HR Intern / HR Assistant (with administrative support responsibilities)",
    "inferred_industry": "Human Resources / Corporate Administration (cross-industry)",
    "keyword_hits": [
      "Human Resources",
      "HR",
      "recruitment",
      "selection",
      "leave management",
      "employee attendance",
      "induction programme",
      "office correspondence",
      "filing",
      "contracts",
      "meeting coordination",
      "office supplies",
      "inventory records",
      "MS Word",
      "MS Excel",
      "MS PowerPoint",
      "documentation",
      "employee engagement"
    ],
    "keyword_gaps": [
      "HRIS",
      "onboarding",
      "document control"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard heading; international ATS systems may not map it to a professional summary field.",
        "recommended": "Use “PROFESSIONAL SUMMARY”."
      },
      {
        "original": "EDUCATIONAL QUALIFICATIONS",
        "issue": "Non-generic heading; may reduce parsing accuracy versus standard “Education”.",
        "recommended": "Use “EDUCATION”."
      },
      {
        "original": "PERSONAL INFORMATIONS",
        "issue": "International ATS systems usually expect a “Contact Details” block only; this section includes demographic data that is commonly removed/ignored.",
        "recommended": "Remove the section entirely; replace with a small “CONTACT DETAILS” section."
      },
      {
        "original": "DECLARATION",
        "issue": "Bangladeshi CV convention; ATS parsers often ignore it but it wastes space and can interfere with content extraction.",
        "recommended": "Remove the section entirely."
      }
    ],
    "ats_tips": [
      "Remove personal demographic information from the resume (parent names, date of birth, religion, blood group, marital status). International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Replace “CAREER OBJECTIVE” with “PROFESSIONAL SUMMARY” and ensure it contains HR/admin keywords that appear in your experience (attendance/leave management, recruitment coordination support, documentation, onboarding).",
      "Expand bullet points in both experience roles with explicit scope keywords (e.g., “onboarding support”, “document control/filing accuracy”, and the systems/tools used) and avoid vague phrasing like “helping/assisting/support” without outcomes."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 54
}