/**
 * Review context options offered on the upload panel.
 *
 * The reviewer routes its rules by application channel, employer type and
 * candidate stage. Without these the model infers everything, and its inference
 * is exactly what users experience as the reviewer not understanding their
 * situation: a Bdjobs profile assessed as though it were a one-page Western PDF,
 * or a government form told to drop its photograph.
 *
 * Every field is optional and defaults to "Not sure", which asks the server to
 * infer and to report the inference back. Labels are written for a Bangladeshi
 * job seeker, not for the enum behind them.
 *
 * Options carry a translation key rather than a label. The value is what the
 * server receives and must never be translated; the key is what the user reads.
 */

/** Sent when the user leaves a field alone. */
export const UNKNOWN = 'unknown'

export const APPLICATION_CHANNEL_OPTIONS = [
  { value: UNKNOWN, labelKey: 'context.unknown' },
  { value: 'bdjobs_profile', labelKey: 'context.channel.bdjobs_profile' },
  { value: 'direct_pdf', labelKey: 'context.channel.direct_pdf' },
  { value: 'corporate_ats', labelKey: 'context.channel.corporate_ats' },
  { value: 'government_form', labelKey: 'context.channel.government_form' },
  { value: 'ngo_development', labelKey: 'context.channel.ngo_development' },
  { value: 'consultancy_tender', labelKey: 'context.channel.consultancy_tender' },
  { value: 'academic_cv', labelKey: 'context.channel.academic_cv' },
]

export const EMPLOYER_TYPE_OPTIONS = [
  { value: UNKNOWN, labelKey: 'context.unknown' },
  { value: 'local_traditional', labelKey: 'context.employer.local_traditional' },
  { value: 'local_modern', labelKey: 'context.employer.local_modern' },
  { value: 'multinational', labelKey: 'context.employer.multinational' },
  { value: 'government', labelKey: 'context.employer.government' },
  { value: 'ngo_development', labelKey: 'context.employer.ngo_development' },
  { value: 'academic', labelKey: 'context.employer.academic' },
  { value: 'consultancy', labelKey: 'context.employer.consultancy' },
]

export const CANDIDATE_STAGE_OPTIONS = [
  { value: UNKNOWN, labelKey: 'context.unknown' },
  { value: 'student', labelKey: 'context.stage.student' },
  { value: 'fresher', labelKey: 'context.stage.fresher' },
  { value: 'early_career', labelKey: 'context.stage.early_career' },
  { value: 'experienced', labelKey: 'context.stage.experienced' },
  { value: 'senior', labelKey: 'context.stage.senior' },
]

export const TARGET_SECTOR_OPTIONS = [
  { value: UNKNOWN, labelKey: 'context.unknown' },
  { value: 'it_software', labelKey: 'context.sector.it_software' },
  { value: 'rmg_manufacturing', labelKey: 'context.sector.rmg_manufacturing' },
  { value: 'banking_finance', labelKey: 'context.sector.banking_finance' },
  { value: 'ngo_development', labelKey: 'context.sector.ngo_development' },
  { value: 'civil_engineering', labelKey: 'context.sector.civil_engineering' },
  { value: 'business', labelKey: 'context.sector.business' },
  { value: 'academic_research', labelKey: 'context.sector.academic_research' },
]

/** The shape held in component state before submission. */
export const EMPTY_REVIEW_CONTEXT = Object.freeze({
  applicationChannel: UNKNOWN,
  employerType: UNKNOWN,
  candidateStage: UNKNOWN,
  targetSector: UNKNOWN,
})

/**
 * Appends the context to an upload. Fields left at "Not sure" are omitted so the
 * server treats them as absent rather than as a deliberate unknown.
 *
 * @param {FormData} formData
 * @param {typeof EMPTY_REVIEW_CONTEXT} context
 */
export function appendReviewContext(formData, context = EMPTY_REVIEW_CONTEXT) {
  for (const [key, value] of Object.entries(context)) {
    if (value && value !== UNKNOWN) formData.append(key, value)
  }
  return formData
}

/** True when the user has narrowed at least one field. */
export function hasAnyContext(context = EMPTY_REVIEW_CONTEXT) {
  return Object.values(context).some((v) => v && v !== UNKNOWN)
}
