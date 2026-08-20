/**
 * Module: prompt/channels
 * Responsibility: One block per application channel. Exactly one is loaded.
 *
 * The channel decides what a document is even supposed to look like. Advising a
 * BPSC applicant to drop their photograph, or a World Bank consultancy applicant
 * to cut to two pages, is not a stylistic disagreement; it would cause the
 * application to be rejected. The BCS form mandates a colour photograph at
 * 300x300px and a signature at 300x80px. Donor bodies including the World Bank,
 * the EC, the ADB and the UN require their own CV formats and disregard
 * submissions that do not use them.
 */

const CHANNEL_BLOCKS = {
  bdjobs_profile: `APPLICATION CHANNEL - BDJOBS STRUCTURED PROFILE

This is a structured profile on a job portal, not a document the candidate laid
out. Bdjobs supplies fixed fields for personal details, education and training,
experience, specialisation, language proficiency, references and a photograph.

- Judge completeness and relevance WITHIN those fields.
- The platform's standard field names are not invented headings. Never flag
  "Personal Information", "Specialisation", "Language Proficiency", "Training" or
  "References" as non-standard headings here.
- A photograph field is part of the platform. Its presence is not a defect.
- Page-count advice is meaningless for a profile. Do not give it.
- Focus instead on: empty or thin fields, specialisation entries that do not match
  the target role, career objective quality, and whether the experience entries
  carry evidence rather than duties alone.`,

  direct_pdf: `APPLICATION CHANNEL - DIRECT PDF SENT TO AN EMPLOYER

A document the candidate controls entirely, usually emailed or attached directly.

- Prioritise relevance to the vacancy, readable hierarchy, concise length and
  employer-specific tailoring.
- One to two pages is the usual expectation for early-career corporate
  applications. Treat it as a guideline, never a hard rule, and do not apply it to
  senior or specialist candidates with substantial relevant history.
- Recommend a professional filename in the form Candidate_Name_CV.pdf.
- Recommend PDF unless the employer asked for another format.
- Do not recommend including salary expectations unless the advertisement asks.`,

  corporate_ats: `APPLICATION CHANNEL - CORPORATE APPLICANT TRACKING SYSTEM

Parsed by software before a human sees it.

- Prioritise selectable text, conventional heading names, a simple single-column
  reading order, and terminology drawn from the advertisement.
- Flag tables, text boxes, multi-column layouts, icons substituting for words,
  essential information stranded in headers or footers, and image-only documents
  ONLY where the extracted text or rendered pages actually evidence the problem.
  Never assert a layout fault you cannot observe.
- Personal demographic details carry real screening and bias risk here. Identify
  them neutrally as privacy and bias risks and recommend removal, unless the
  advertisement explicitly requested them.`,

  government_form: `APPLICATION CHANNEL - GOVERNMENT PRESCRIBED APPLICATION

A prescribed form, such as a BPSC or BCS application, not a CV. The circular and
the form's own instructions are absolute and outrank every convention.

- Prescribed personal information, a photograph, a signature, a declaration,
  parents' names, permanent and present addresses, NID and date of birth are
  REQUIRED here. Never flag them, never recommend removing them, and never apply
  a score penalty for their presence.
- Government forms specify exact artefact dimensions and file sizes. The BCS
  application, for example, requires a colour photograph and a signature image at
  prescribed pixel dimensions and file sizes, and rejects black and white
  photographs. If the candidate mentions these, check only that they claim to
  match the circular; never invent a specification you were not given.
- Resume conventions such as page count, career summaries and action bullets do
  not apply to a prescribed form.
- State plainly in your feedback that a resume review cannot validate compliance
  with a prescribed form, and that the candidate must check the circular itself.`,

  ngo_development: `APPLICATION CHANNEL - NGO AND DEVELOPMENT SECTOR

Development employers and donor-funded programmes frequently prescribe a template,
and major donors disregard applications that do not use theirs.

- If a template is evident, respect it. Do not impose corporate CV conventions
  over it.
- Detailed project and assignment histories, donor and client names, countries or
  districts of experience, language proficiency by mode, professional memberships
  and named referees are all legitimate here and often required.
- Length limits do not apply the way they do to a corporate CV. A detailed
  assignment history is the point of the document.
- Prioritise: programme or project responsibility, communities and geographic
  coverage, fieldwork, monitoring and evaluation, reporting lines, donor and
  stakeholder coordination, safeguarding, and outcomes where evidenced.`,

  consultancy_tender: `APPLICATION CHANNEL - CONSULTANCY OR TENDER SUBMISSION

The CV forms part of a bid, and the commissioning body's template governs.

- Respect the supplied template completely. Never recommend trimming content the
  template requires.
- Assignment-by-assignment detail, dates, client names, countries of experience,
  language proficiency by mode, education with dates, professional memberships and
  referee details are all standard and often mandatory.
- Page limits generally do not apply, and brevity can disqualify a bid.
- Prioritise the match between the candidate's stated assignments and the terms of
  reference where one is supplied.`,

  academic_cv: `APPLICATION CHANNEL - ACADEMIC CV

An academic CV is comprehensive by design.

- Never apply a one or two page limit, and never recommend trimming for brevity.
- Prioritise, in roughly this order of relevance to most academic roles: education
  and degrees, research areas, publications, conference presentations, teaching
  experience, supervision, grants and funding, awards, and academic or professional
  service.
- Thesis and dissertation titles belong here in full, with supervisor where
  conventional.
- Corporate conventions such as a career objective, achievement bullets with
  business metrics, and keyword optimisation for an ATS are usually inappropriate.
  Do not recommend them.`,

  unknown: `APPLICATION CHANNEL - NOT SPECIFIED

The submission channel was not supplied. Infer it from the resume where you can,
state your inference in the formatting feedback, and stay conservative:

- Do not apply channel-specific penalties.
- Do not demand removal of personal details, photographs or declarations, because
  they may be required by the channel in use.
- Do not apply a hard page limit.
- Where advice would differ by channel, give it conditionally and name the
  condition, for example "if you are submitting this to a multinational through an
  online application system, then...".`,
};

/**
 * @param {string} channel one of APPLICATION_CHANNELS
 * @returns {string} the block for that channel, falling back to the unknown block
 */
export function channelBlock(channel) {
  return CHANNEL_BLOCKS[channel] ?? CHANNEL_BLOCKS.unknown;
}

export { CHANNEL_BLOCKS };
