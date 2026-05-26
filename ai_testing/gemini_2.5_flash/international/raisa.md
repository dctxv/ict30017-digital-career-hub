---
resume: raisa
mode: international
model: gemini_2.5_flash
date: 2026-05-15
metadata:
  tokens_per_second: 187.1
  token_count: 1497
  cost_usd: 0.0046023
  duration_seconds: 8
---

## Analysis Output

```json
{
  "formatting": {
    "score": 85,
    "feedback": "The resume has a clean layout and good use of white space. However, some section headings are not standard for international applications, and the 'Last Updated' date is unnecessary. The use of bullet points is generally effective for listing activities and publications.",
    "issues": [
      {
        "section": "Top of Resume",
        "issue": "'Last Updated October 2022' is not a standard element in international resumes.",
        "suggestion": "Remove 'Last Updated October 2022' as it is not necessary and can make the resume appear dated if not consistently updated."
      },
      {
        "section": "EDUCATION AND QUALIFICATIONS",
        "issue": "The heading 'EDUCATION AND QUALIFICATIONS' is less common in international resumes.",
        "suggestion": "Change 'EDUCATION AND QUALIFICATIONS' to 'Education' for better ATS compatibility and conciseness."
      },
      {
        "section": "RECORD OF EMPLOYMENT",
        "issue": "The heading 'RECORD OF EMPLOYMENT' is less common in international resumes.",
        "suggestion": "Change 'RECORD OF EMPLOYMENT' to 'Experience' or 'Professional Experience' for better ATS compatibility and standard terminology."
      },
      {
        "section": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "The heading 'SELECTED PUBLICATIONS AND OUTPUTS' is quite long and could be more concise.",
        "suggestion": "Consider shortening 'SELECTED PUBLICATIONS AND OUTPUTS' to 'Publications' or 'Research & Publications' for brevity."
      },
      {
        "section": "EXTRACURRICULAR ACTIVITIES",
        "issue": "The heading 'EXTRACURRICULAR ACTIVITIES' is less common in international resumes.",
        "suggestion": "Change 'EXTRACURRICULAR ACTIVITIES' to 'Leadership & Activities' or 'Volunteer Experience' to highlight transferable skills and align with international standards."
      }
    ]
  },
  "content_quality": {
    "score": 60,
    "feedback": "The resume provides a good overview of academic and professional experience, including publications. However, the descriptions for roles are entirely missing, which is a significant weakness. Quantifying achievements and detailing responsibilities for each position would greatly enhance the content.",
    "strengths": [
      "Includes relevant academic qualifications from reputable institutions.",
      "Features a journal article publication, demonstrating research capability.",
      "Lists relevant work experience, including a UN internship.",
      "Highlights extracurricular activities, showing leadership and engagement."
    ],
    "weaknesses": [
      "Lack of bullet points detailing responsibilities and achievements for any work experience.",
      "No quantification of impact or results in any role.",
      "Missing a professional summary or objective statement to frame the candidate's career goals.",
      "No dedicated skills section to highlight technical or soft skills relevant to target roles.",
      "Academic work descriptions are brief and lack detail on contributions or outcomes."
    ]
  },
  "language_grammar": {
    "score": 95,
    "feedback": "The resume is generally well-written with no significant grammatical errors or typos. The language is clear and professional.",
    "issues": []
  },
  "action_items": [
    "Add a 'Professional Summary' section at the top of the resume, immediately after contact information, to provide a concise overview of your skills, experience, and career aspirations. This should be 3-4 sentences long and tailored to the types of roles you are seeking.",
    "For each 'RECORD OF EMPLOYMENT' entry, add 3-5 bullet points detailing your responsibilities, key projects, and quantifiable achievements. Use strong action verbs and focus on the impact of your work (e.g., 'Managed data analysis for X project, resulting in Y outcome').",
    "Create a dedicated 'Skills' section to list your technical skills (e.g., statistical software, programming languages, data analysis tools) and relevant soft skills (e.g., research, communication, project management).",
    "Revise section headings to align with international standards: change 'EDUCATION AND QUALIFICATIONS' to 'Education', 'RECORD OF EMPLOYMENT' to 'Experience', and 'EXTRACURRICULAR ACTIVITIES' to 'Leadership & Activities' or 'Volunteer Experience'."
  ],
  "ats_analysis": {
    "inferred_role": "Research Associate / Economist",
    "inferred_industry": "Economics / Public Policy / Development",
    "keyword_hits": [
      "Economics",
      "Research Associate",
      "Research Assistant",
      "Publications",
      "Journal Article",
      "Undergraduate thesis",
      "Data analysis",
      "Public Health",
      "COVID-19",
      "Foreign Direct Investment (FDI)",
      "Bangladesh",
      "United Nations Development Programme (UNDP)"
    ],
    "keyword_gaps": [
      "Statistical software (e.g., Stata, R, Python)",
      "Data analysis",
      "Quantitative research",
      "Project management",
      "Policy analysis"
    ],
    "heading_risks": [
      {
        "original": "EDUCATION AND QUALIFICATIONS",
        "issue": "This heading is less common in international ATS systems and may not be parsed optimally.",
        "recommended": "Education"
      },
      {
        "original": "RECORD OF EMPLOYMENT",
        "issue": "This heading is less common in international ATS systems and may not be parsed optimally.",
        "recommended": "Experience"
      },
      {
        "original": "SELECTED PUBLICATIONS AND OUTPUTS",
        "issue": "This heading is quite long and may not be recognized as a standard publications section by some ATS.",
        "recommended": "Publications"
      },
      {
        "original": "EXTRACURRICULAR ACTIVITIES",
        "issue": "This heading is less common in international ATS systems and may not be parsed optimally.",
        "recommended": "Leadership & Activities"
      }
    ],
    "ats_tips": [
      "Include a 'Skills' section with specific technical skills (e.g., statistical software, programming languages, data visualization tools) to improve keyword matching for relevant roles.",
      "Elaborate on each work experience entry with bullet points detailing responsibilities and quantifiable achievements. ATS systems look for specific action verbs and metrics.",
      "Add a 'Professional Summary' at the top to provide a keyword-rich overview of your qualifications and career goals, which helps ATS systems quickly identify your fit for a role."
    ],
    "standard": "international/multinational ATS"
  },
  "job_match": null,
  "overall_score": 70
}
```