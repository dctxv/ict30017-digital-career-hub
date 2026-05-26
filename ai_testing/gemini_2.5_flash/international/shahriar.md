---
resume: shahriar
mode: international
model: gemini_2.5_flash
date: 2026-05-15
metadata:
  tokens_per_second: 163.2
  token_count: 1648
  cost_usd: 0.0051073
  duration_seconds: 10.1
---

## Analysis Output

```json
{
  "formatting": {
    "score": 50,
    "feedback": "The resume contains several elements that are not standard for international applications, significantly impacting its professional presentation. While the use of bullet points and clear sectioning is good, the inclusion of personal demographic information and a declaration section detracts from its suitability for Western hiring standards. Addressing these issues will greatly improve its chances with international ATS and recruiters.",
    "issues": [
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Including a parent's name is not expected in international applications and can introduce unconscious bias in shortlisting.",
        "suggestion": "Remove father's name and mother's name from the Personal Information section entirely."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Date of birth disclosure can lead to age discrimination and is discouraged or prohibited in many international hiring contexts.",
        "suggestion": "Remove date of birth from the resume. Focus on experience and qualifications instead."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Disclosing religion on a resume can lead to discrimination in international hiring contexts and is considered inappropriate in most countries.",
        "suggestion": "Remove religion from the Personal Information section."
      },
      {
        "section": "PERSONAL INFORMATION",
        "issue": "Marital status is personal information that can introduce bias and is not expected or appropriate in international applications.",
        "suggestion": "Remove marital status from the Personal Information section."
      },
      {
        "section": "DECLARATION",
        "issue": "Declaration sections are a Bangladeshi CV convention not used in international resumes and waste valuable page space.",
        "suggestion": "Remove the declaration section entirely."
      }
    ]
  },
  "content_quality": {
    "score": 85,
    "feedback": "The resume demonstrates strong technical expertise and significant achievements, particularly in project management and system implementation. The use of quantifiable results in the 'Senior Electrical Engineer' section is excellent. However, some earlier roles could benefit from more specific metrics and stronger action verbs to highlight impact more clearly.",
    "strengths": [
      "Quantifiable achievements: 'completed within approved budget and 3 weeks ahead of contractual schedule', 'reducing remote monitoring response time by 40% and cutting fault isolation time from 45 to 12 minutes', 'achieving 8% cost saving', 'reducing unplanned outages by 23%'.",
      "Strong action verbs in the 'Senior Electrical Engineer' role: 'Designed', 'Led', 'Prepared', 'Implemented', 'Mentored'.",
      "Clear progression of responsibilities and increasing impact across roles.",
      "Comprehensive technical skills section with relevant software, standards, and specializations."
    ],
    "weaknesses": [
      "Some bullet points in earlier roles could be more quantified. For example, 'Designed complete electrical systems for 5 industrial plants' is good, but could benefit from the scale or impact of these designs.",
      "The 'Junior Electrical Engineer' role has less quantifiable impact. 'Performed scheduled and corrective maintenance' and 'Prepared daily and weekly plant operations reports' are descriptive but lack specific outcomes or improvements."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The resume is well-written with good grammar and spelling. There are no significant errors, and the language is professional and clear. The use of strong action verbs is consistent, especially in the more recent experience.",
    "issues": [
      {
        "original": "programme",
        "corrected": "program",
        "type": "consistency"
      }
    ]
  },
  "action_items": [
    "Remove all personal demographic information (Father's Name, Mother's Name, Date of Birth, Gender, Religion, Marital Status, Nationality) from the 'PERSONAL INFORMATION' section to align with international resume standards and prevent unconscious bias.",
    "Eliminate the 'DECLARATION' section entirely, as it is not a standard component of international resumes and consumes valuable space.",
    "Reformat the 'PERSONAL INFORMATION' section to 'Contact Details' and include only your address, mobile, and email. Consider removing the full address and just listing 'Dhaka, Bangladesh' for brevity and privacy.",
    "Quantify achievements in the 'Electrical Engineer' and 'Junior Electrical Engineer' roles. For example, for 'Designed complete electrical systems for 5 industrial plants', add details about the scale of these plants or the impact of your designs (e.g., 'for plants with a combined capacity of X MW'). For maintenance tasks, mention the number of systems maintained or the uptime achieved."
  ],
  "ats_analysis": {
    "inferred_role": "Senior Electrical Engineer / Power Systems Engineer",
    "inferred_industry": "Energy / Power Generation & Distribution",
    "keyword_hits": [
      "Electrical Engineer",
      "Power Systems",
      "Substation Design",
      "SCADA",
      "Industrial Automation",
      "132 kV",
      "Grid Modernisation",
      "Predictive Maintenance",
      "IEC 61850",
      "Protection Relay Coordination",
      "ETAP",
      "AutoCAD Electrical",
      "MATLAB/Simulink",
      "DIgSILENT PowerFactory",
      "MS Project",
      "IEEE C37",
      "HV/MV Substation Design",
      "Power System Studies",
      "EPC Project Management",
      "Energy Auditor",
      "PMP"
    ],
    "keyword_gaps": [
      "Renewable Energy",
      "Smart Grid",
      "Cybersecurity (for SCADA)"
    ],
    "heading_risks": [
      {
        "original": "CAREER OBJECTIVE",
        "issue": "This heading is non-standard for international ATS systems and can be misinterpreted. Modern resumes typically use a 'Professional Summary' or 'Executive Summary'.",
        "recommended": "PROFESSIONAL SUMMARY"
      },
      {
        "original": "EDUCATIONAL QUALIFICATION",
        "issue": "This heading is non-standard for international ATS systems. 'Education' is the widely accepted term.",
        "recommended": "EDUCATION"
      },
      {
        "original": "PERSONAL INFORMATION",
        "issue": "This heading is non-standard for international ATS systems and contains information that should not be on a resume. 'Contact Details' is the appropriate heading.",
        "recommended": "CONTACT DETAILS"
      }
    ],
    "ats_tips": [
      "Replace 'CAREER OBJECTIVE' with a 'PROFESSIONAL SUMMARY' that highlights your 8+ years of experience, key skills, and career aspirations in 3-4 concise sentences, using relevant keywords for your target roles.",
      "Change 'EDUCATIONAL QUALIFICATION' to 'EDUCATION' and 'PERSONAL INFORMATION' to 'CONTACT DETAILS' to ensure better parsing by international ATS systems.",
      "Remove all personal demographic information (e.g., Father's Name, Date of Birth, Religion, Marital Status) as international ATS systems and recruiters will likely remove or discount resumes containing such details, which are considered irrelevant and can introduce bias."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 80
}
```