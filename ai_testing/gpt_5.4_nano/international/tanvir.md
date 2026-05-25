---
resume: tanvir
mode: international
model: gpt_5.4_nano
date: 2026-05-15
metadata:
  tokens_per_second: 146.6
  token_count: 1979
  cost_usd: 0.00299335
  duration_seconds: 13.5
---

## Analysis Output

{
  "formatting": {
    "score": 40,
    "feedback": "The layout uses multiple Bangladeshi CV conventions and includes personal-demographic fields that are typically removed for international/multinational ATS screening. Section headings like “CAREER OBJECTIVE”, “EDUCATIONAL QUALIFICATION”, and “PERSONAL INFORMATION” are also non-standard for international ATS parsing. Content is generally readable, but spacing/indentation is inconsistent in the Professional Experience bullets (leading whitespace and alignment differ from the surrounding text).",
    "issues": [
      {
        "section": "Personal Information",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "Personal Information",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "Personal Information",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "Personal Information",
        "issue": "Blood group is medically irrelevant to professional employment and is not expected in international resumes.",
        "suggestion": "Remove blood group from the Personal Information section."
      },
      {
        "section": "Resume headings",
        "issue": "“CAREER OBJECTIVE” is a non-standard ATS heading in many international systems and may reduce parsing reliability.",
        "suggestion": "Replace “CAREER OBJECTIVE” with “PROFESSIONAL SUMMARY” and keep it 2–3 lines."
      },
      {
        "section": "Resume headings",
        "issue": "“EDUCATIONAL QUALIFICATION” is non-standard for international ATS parsing.",
        "suggestion": "Rename it to “EDUCATION”."
      },
      {
        "section": "Resume headings",
        "issue": "“PERSONAL INFORMATION” is a non-standard ATS heading and includes multiple demographic fields.",
        "suggestion": "Rename to “CONTACT DETAILS” and include only name + city + phone + email (no DOB, religion, marital status, blood group, or parents)."
      },
      {
        "section": "Declaration",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 52,
    "feedback": "The resume shows relevant exposure to bank customer service, including customer transaction processing, KYC, account opening, and reporting—good alignment for entry-level banking operations roles. However, most internship bullets use broad verbs (“Assisted”, “Helped”, “Supported”, “Did data entry”) without outcomes or measurable impact, which can weaken international shortlisting. The resume also omits common international banking role elements such as CRM/ticketing systems, transaction types, error reduction/accuracy, compliance handling depth (beyond KYC verification), and any specific reporting format or frequency beyond general daily/monthly reports.",
    "strengths": [
      "Relevant internship experience in banking customer service at a commercial bank (Mutual Trust Bank).",
      "Mentions KYC verification and account opening documentation, which are key banking operations/compliance-adjacent tasks.",
      "Basic office productivity tools listed (MS Word/Excel/PowerPoint).",
      "Clear academic background in BBA (Finance) with a solid CGPA."
    ],
    "weaknesses": [
      "Internship bullets are under-quantified and use vague phrasing (e.g., “Assisted”, “Helped”, “Supported”, “Did data entry work”) without volumes, accuracy metrics, turnaround times, or outcomes.",
      "No explicit mention of customer service performance metrics (e.g., number of customers processed per day, SLA adherence, error rate, escalation handling).",
      "No detail on specific systems/tools used in the bank (e.g., core banking system/CRM/ticketing), which ATS and recruiters often expect.",
      "Language section is not strong for international roles (only reading/writing “Fairly good”); lacks speaking/listening level.",
      "Target alignment is limited: the career objective is generic and doesn’t specify the functional track (customer service/operations/KYC/compliance)."
    ]
  },
  "language_grammar": {
    "score": 85,
    "feedback": "Language is mostly clear and professional. Minor improvements are needed for consistency and specificity in bullet wording (e.g., replacing “Did data entry work” with a cleaner action-verb structure). The resume uses sentence fragments consistently within bullets, which is acceptable.",
    "issues": [
      {
        "original": "To get a challenging job in a reputed bank or financial institution where I can utilize my\nknowledge and skills and build a bright career for myself.",
        "corrected": "To obtain a challenging role in a reputable bank or financial institution where I can apply my skills and knowledge in customer service and operations, and grow professionally.",
        "type": "Content/phrasing improvement"
      },
      {
        "original": "  • Did data entry work for new account registration",
        "corrected": "  • Performed data entry for new account registrations",
        "type": "Grammar/style improvement"
      },
      {
        "original": "Bengali : Native",
        "corrected": "Bengali: Native",
        "type": "Punctuation consistency"
      }
    ]
  },
  "action_items": [
    "Replace the heading “CAREER OBJECTIVE” with “PROFESSIONAL SUMMARY” and rewrite it to 2–3 lines tailored to entry-level banking/customer service/KYC operations (resume section: Career Objective).",
    "Remove all demographic fields from “PERSONAL INFORMATION” (father/mother’s names, date of birth, religion, marital status, blood group, gender, nationality, and addresses). Keep only “CONTACT DETAILS” with phone and email (resume section: Personal Information).",
    "Rewrite the internship bullets to be outcome-driven and specific by adding measurable details and removing vague starters (“Assisted/Helped/Supported/Did”). For example, update the bullets under “Junior Executive – Customer Service (Internship)” (resume section: Professional Experience).",
    "Rename “EDUCATIONAL QUALIFICATION” to “EDUCATION” and standardize the format (Degree, Institution, Dates, Result) to match international ATS expectations (resume section: Educational Qualification).",
    "Remove the entire “DECLARATION” section including signature/date to save space and match international CV conventions (resume section: Declaration)."
  ],
  "ats_analysis": {
    "inferred_role": "Entry-level Bank Customer Service / Bank Operations (KYC & Account Opening support)",
    "inferred_industry": "Banking and Financial Services",
    "keyword_hits": [
      "customer service",
      "customer transactions",
      "account opening",
      "KYC verification",
      "daily and monthly reports",
      "data entry",
      "MS Excel",
      "MS Word",
      "MS PowerPoint"
    ],
    "keyword_gaps": [
      "core banking system",
      "AML",
      "CRM"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "Non-standard ATS heading; many international ATS systems prefer “Professional Summary”.",
        "recommended": "Replace with “PROFESSIONAL SUMMARY”."
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "Non-standard heading; ATS parsing is typically better with “Education”.",
        "recommended": "Rename to “EDUCATION”."
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "ATS may parse this section inconsistently, and it contains demographic items not typically used in screening.",
        "recommended": "Rename to “CONTACT DETAILS” and remove demographic fields."
      }
    ],
    "ats_tips": [
      "Remove personal demographic information from the resume (e.g., parents’ names, date of birth, religion, marital status, blood group). International ATS systems and recruiters will likely remove or discount resumes containing personal demographic information.",
      "Under “Junior Executive – Customer Service (Internship)”, replace vague bullets (“Assisted”, “Helped”, “Supported”, “Did data entry work”) with specific, ATS-friendly actions and results (e.g., approximate number of customers processed, accuracy/error reduction, and types of transactions handled).",
      "Add explicit banking-compliance and tooling keywords if truthful (e.g., “AML checks”, “core banking system”, “CRM/ticketing system”) so the resume matches international job descriptions."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 55
}