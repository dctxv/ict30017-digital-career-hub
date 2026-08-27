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
 * Labels are i18next keys (labelKey) rather than literal text — the option
 * `value` is a closed enum validated server-side and must never be translated,
 * only the displayed label. Components resolve labelKey via useTranslation()'s
 * t() at render time.
 */

/** Sent when the user leaves a field alone. */
export const UNKNOWN = 'unknown'

export const APPLICATION_CHANNEL_OPTIONS = [
  { value: UNKNOWN, labelKey: 'reviewContext.notSure' },
  { value: 'bdjobs_profile', labelKey: 'reviewContext.channel.bdjobsProfile' },
  { value: 'direct_pdf', labelKey: 'reviewContext.channel.directPdf' },
  { value: 'corporate_ats', labelKey: 'reviewContext.channel.corporateAts' },
  { value: 'government_form', labelKey: 'reviewContext.channel.governmentForm' },
  { value: 'ngo_development', labelKey: 'reviewContext.channel.ngoDevelopment' },
  { value: 'consultancy_tender', labelKey: 'reviewContext.channel.consultancyTender' },
  { value: 'academic_cv', labelKey: 'reviewContext.channel.academicCv' },
]

export const EMPLOYER_TYPE_OPTIONS = [
  { value: UNKNOWN, labelKey: 'reviewContext.notSure' },
  { value: 'local_traditional', labelKey: 'reviewContext.employer.localTraditional' },
  { value: 'local_modern', labelKey: 'reviewContext.employer.localModern' },
  { value: 'multinational', labelKey: 'reviewContext.employer.multinational' },
  { value: 'government', labelKey: 'reviewContext.employer.government' },
  { value: 'ngo_development', labelKey: 'reviewContext.employer.ngoDevelopment' },
  { value: 'academic', labelKey: 'reviewContext.employer.academic' },
  { value: 'consultancy', labelKey: 'reviewContext.employer.consultancy' },
]

export const CANDIDATE_STAGE_OPTIONS = [
  { value: UNKNOWN, labelKey: 'reviewContext.notSure' },
  { value: 'student', labelKey: 'reviewContext.stage.student' },
  { value: 'fresher', labelKey: 'reviewContext.stage.fresher' },
  { value: 'early_career', labelKey: 'reviewContext.stage.earlyCareer' },
  { value: 'experienced', labelKey: 'reviewContext.stage.experienced' },
  { value: 'senior', labelKey: 'reviewContext.stage.senior' },
]

export const TARGET_SECTOR_OPTIONS = [
  { value: UNKNOWN, labelKey: 'reviewContext.notSure' },
  { value: 'it_software', labelKey: 'reviewContext.sector.itSoftware' },
  { value: 'rmg_manufacturing', labelKey: 'reviewContext.sector.rmgManufacturing' },
  { value: 'banking_finance', labelKey: 'reviewContext.sector.bankingFinance' },
  { value: 'ngo_development', labelKey: 'reviewContext.sector.ngoDevelopment' },
  { value: 'civil_engineering', labelKey: 'reviewContext.sector.civilEngineering' },
  { value: 'business', labelKey: 'reviewContext.sector.business' },
  { value: 'academic_research', labelKey: 'reviewContext.sector.academicResearch' },
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
