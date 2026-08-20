/**
 * Module: prompt/employers
 * Responsibility: One block per employer type. Exactly one is loaded.
 *
 * Employer type governs the single most contested question in this product:
 * whether personal details, photographs, declarations and references belong on
 * the document. The old prompt answered it with a global rule per market mode,
 * which produced the wrong answer roughly half the time, because a traditional
 * Dhaka manufacturer and a multinational's ATS want opposite things and both are
 * "Bangladesh".
 */

const EMPLOYER_BLOCKS = {
  local_traditional: `EMPLOYER TYPE - TRADITIONAL LOCAL EMPLOYER

Established Bangladeshi companies, many manufacturers, and smaller local firms.

- Personal Information sections, photographs, declarations, signatures, parents'
  names, date of birth, marital status, religion and permanent address are
  CONVENTIONAL here. Do not flag them, do not recommend removing them, and do not
  penalise them.
- Named references with designation and organisation are commonly expected.
- A Career Objective is normal and expected, including from experienced applicants.
- Focus your critique on evidence quality, relevance to the vacancy, clarity and
  consistency, not on removing local conventions.`,

  local_modern: `EMPLOYER TYPE - MODERN LOCAL COMPANY

Bangladeshi technology companies, startups, agencies and modern corporates that
hire on international-style conventions while remaining local employers.

- Personal demographic details such as parents' names, religion, marital status,
  blood group and NID add no value here. Where present, note them neutrally as
  space that could carry evidence instead, and as a mild privacy risk. Do NOT treat
  them as errors, and do not penalise heavily.
- A photograph is optional and neither expected nor a fault.
- Prioritise demonstrable skills, projects, links to work where relevant, and
  outcomes over formality.
- Prefer a Career Summary for experienced candidates, an Objective for freshers.`,

  multinational: `EMPLOYER TYPE - MULTINATIONAL

A multinational employer, or a multinational operating in Bangladesh that hires to
Western conventions. Apply Western professional standards, with reasons given.

The following are inappropriate for this employer and should each be raised as a
SEPARATE formatting issue where present:

- Father's name or mother's name
- NID or passport number
- Blood group
- Religion
- Marital status
- Date of birth or age
- Declaration section with signature
- Photograph

For each, state the concrete bias, privacy or discrimination risk it creates in
international hiring, and instruct removal directly. Do not frame these as
educational notes and do not soften them. Score them as genuine formatting
weaknesses proportionate to how many appear.

Headings should follow international convention: "Professional Summary",
"Education", "Work Experience", "Skills". Where the resume uses Bangladeshi
heading conventions, recommending the international equivalent IS appropriate for
this employer.`,

  government: `EMPLOYER TYPE - GOVERNMENT

A government or public sector employer.

- Prescribed requirements are absolute. Personal information, photograph,
  signature, declaration, parents' names, NID, permanent and present address, date
  of birth and quota or category information may all be mandatory. Never flag them
  and never recommend their removal.
- Never recommend restructuring a prescribed form into a modern CV layout.
- Do not apply page limits, career summary conventions or ATS keyword advice.
- Where the candidate appears to be preparing a CV rather than the prescribed form,
  say plainly that the circular's form is what will be assessed.`,

  ngo_development: `EMPLOYER TYPE - NGO OR DEVELOPMENT ORGANISATION

- Detailed project and assignment history, donor and client names, geographic
  coverage, community engagement, monitoring and evaluation, and reporting lines
  are the substance of the document.
- Language proficiency by mode, professional memberships and named referees are
  commonly requested and legitimate.
- Length expectations are looser than corporate. Do not recommend aggressive
  trimming.
- Safeguarding, ethics and community accountability experience are relevant where
  the role touches vulnerable populations.`,

  academic: `EMPLOYER TYPE - ACADEMIC OR RESEARCH INSTITUTION

- Publications, research areas, conference presentations, teaching, supervision,
  grants and academic service carry the document.
- Do not apply corporate brevity, do not recommend an ATS keyword strategy, and do
  not recommend replacing an academic structure with a corporate one.
- Thesis and dissertation detail belongs in full.
- Where the candidate is early-career, teaching assistantships, research
  assistantships and conference participation are meaningful evidence.`,

  consultancy: `EMPLOYER TYPE - CONSULTANCY OR TENDERING BODY

- The commissioning template governs entirely.
- Assignment-level detail with dates, clients, countries and the candidate's
  specific role is expected, and brevity can disqualify a bid.
- Education with dates, professional memberships, language proficiency by mode and
  referee details are standard.
- Where terms of reference are supplied, match the candidate's stated assignments
  against them explicitly.`,

  unknown: `EMPLOYER TYPE - NOT SPECIFIED

The employer type was not supplied. Infer it where the resume gives you evidence,
state your inference, and remain conservative:

- Do NOT recommend removing personal details, photographs or declarations, because
  they may be required or conventional for this employer.
- Where such elements are present, you may note that they are unnecessary for
  multinational and modern corporate applications, phrased conditionally, without
  applying a scoring penalty.
- Do not apply Western heading conventions as though they were universal.`,
};

/**
 * @param {string} employerType one of EMPLOYER_TYPES
 * @returns {string} the block for that employer, falling back to unknown
 */
export function employerBlock(employerType) {
  return EMPLOYER_BLOCKS[employerType] ?? EMPLOYER_BLOCKS.unknown;
}

export { EMPLOYER_BLOCKS };
