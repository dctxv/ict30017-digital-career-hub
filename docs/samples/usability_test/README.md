# Usability test personas

Six fictional job seekers for the ICT30017 usability test. Each has a CV, a job
advertisement to apply for, and a persona sheet: a participant card with the
account details to use, the profile details, and answer notes for the mock
interview. Participants
work as the persona, so nobody has to use their own CV or personal details.

The six people differ in field, region, religion, education route, career stage
and language, and between them they cover five of the resume review's seven
application channels (consultancy or tender submission and academic CV are not
covered).

| Persona | Background | Applying for | Channel | CV | Persona sheet |
| --- | --- | --- | --- | --- | --- |
| Farhan Kabir | Dhaka, Muslim, 24. B.Sc. Statistics, Jahangirnagar University 2025. Fresher with a 4-month internship | Junior Data Analyst, Northstar Retail | Emailing a PDF directly | PDF | English |
| Priyanka Das | Sylhet, Hindu, 26. BBA Accounting, SUST 2022. Four years as an accounts assistant at a tea company | Accounts Officer, Meridian Pharmaceuticals | Company online application | PDF | English |
| Mrinmoyee Chakma | Rangamati, Chakma, Buddhist, 26. BSS Anthropology, University of Chittagong 2023. Two years of NGO field work | Field Coordinator, BrightPath International | NGO or development organisation | PDF | English |
| Md. Abdur Rahim | Rural Rajshahi, Muslim, 31, married. Diploma in Civil Engineering 2015, no degree. Ten years on construction sites | Site Engineer (Civil), Delta Infrastructure | Bdjobs profile | DOCX | Bangla |
| Mohammad Ismail Hossain | Noakhali, Muslim, 28. Dakhil and Alim from a madrasa, BA Islamic History (National University) 2021. Union Digital Centre operator | Office Assistant cum Computer Typist, District Education Office | Government prescribed form | DOCX | Bangla |
| Rumana Akter | Narayanganj, Muslim, 35, married with a child. MA English (National University). Six years teaching, then a career break | Customer Service Executive, PayNest | Company online application | DOCX | English |

## Files

For each persona:

- `cv_<name>_<field>.pdf` or `.docx`: the file the participant uploads
- `cv_<name>_<field>.txt`: the source text of that CV
- `job_ad_<role>_en.txt`: the advertisement, for the mock interview
- `persona_sheet_<name>_<lang>.md` and `.docx`: the sheet to print and hand over

## What each CV is meant to surface

Every CV has realistic weaknesses so the review and the interview have something
to say. Facilitators can use this to check the site's feedback makes sense.

- **Farhan**: a generic, copy-paste career objective; no SQL or Power BI at work,
  which the advertisement requires.
- **Priyanka**: a strong, specific CV with one measurable achievement; gaps are
  SAP and full IFRS reporting.
- **Mrinmoyee**: a good field record, but she speaks Chakma, not the Marma or
  Tripura that Bandarban mostly needs.
- **Abdur Rahim**: duty lists with no results, weak English, no bridge or
  culvert experience; a declaration and full personal details as is normal for a
  Bdjobs-style CV.
- **Ismail**: a bio-data with personal details first, as government forms expect;
  thin on Excel.
- **Rumana**: an unexplained gap from 2022 to 2023, a vague objective and
  "Reference: Available on request".

## Which persona each participant gets

Each participant works as one persona and uses that persona's one CV, in the
resume review and again in the mock interview. Rotate by Participant ID so PDF
and DOCX uploads alternate:

| Participant | Persona | CV format | Interview language |
| --- | --- | --- | --- |
| P01, P07 | Farhan Kabir | PDF | English |
| P02, P08 | Rumana Akter | DOCX | English |
| P03, P09 | Priyanka Das | PDF | English |
| P04, P10 | Md. Abdur Rahim | DOCX | Bangla |
| P05, P11 | Mrinmoyee Chakma | PDF | English |
| P06, P12 | Mohammad Ismail Hossain | DOCX | Bangla |

Give Rahim and Ismail only to participants who are comfortable answering in
Bangla; otherwise swap in the next English persona.

## Before a session

- Create one Gmail account for the whole test (for example
  `p83usabilitytest@gmail.com`) and keep it signed in, in a second browser tab.
  Each participant registers with `p83usabilitytest+P01@gmail.com`,
  `+P02` and so on: Gmail delivers them all to the one inbox, while the site
  treats each as a separate account. Write the ID into the card before printing.
- Every participant creates a new account, so a free account's daily limits are
  enough and nobody sees the previous participant's history.
- Put the persona's CV and job advertisement on the desktop, print their persona
  sheet, and sign out of the site.
- Set the site back to English before the next session.
- Afterwards, the test accounts can be removed in the database:
  `DELETE FROM users WHERE email LIKE 'p83usabilitytest+%';`

## Notes

Everyone and every organisation here is invented. Email addresses use the reserved
`example.com` and `.example` domains, the mobile numbers follow a `01700-000xxx`
placeholder pattern, and the NID numbers are dummies. The universities, colleges
and districts are real so the CVs read as Bangladeshi CVs do.
