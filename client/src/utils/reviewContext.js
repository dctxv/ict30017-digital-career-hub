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
 */

/** Sent when the user leaves a field alone. */
export const UNKNOWN = 'unknown'

export const APPLICATION_CHANNEL_OPTIONS = [
  { value: UNKNOWN, label: 'Not sure' },
  { value: 'bdjobs_profile', label: 'Bdjobs profile' },
  { value: 'direct_pdf', label: 'Emailing a PDF directly' },
  { value: 'corporate_ats', label: 'Company online application' },
  { value: 'government_form', label: 'Government prescribed form' },
  { value: 'ngo_development', label: 'NGO or development organisation' },
  { value: 'consultancy_tender', label: 'Consultancy or tender submission' },
  { value: 'academic_cv', label: 'Academic CV' },
]

export const EMPLOYER_TYPE_OPTIONS = [
  { value: UNKNOWN, label: 'Not sure' },
  { value: 'local_traditional', label: 'Traditional local company' },
  { value: 'local_modern', label: 'Local technology company or startup' },
  { value: 'multinational', label: 'Multinational company' },
  { value: 'government', label: 'Government' },
  { value: 'ngo_development', label: 'NGO or development organisation' },
  { value: 'academic', label: 'University or research institute' },
  { value: 'consultancy', label: 'Consultancy firm' },
]

export const CANDIDATE_STAGE_OPTIONS = [
  { value: UNKNOWN, label: 'Not sure' },
  { value: 'student', label: 'Still studying' },
  { value: 'fresher', label: 'Fresh graduate' },
  { value: 'early_career', label: '2 to 5 years experience' },
  { value: 'experienced', label: 'More than 5 years experience' },
  { value: 'senior', label: 'Senior or specialist' },
]

export const TARGET_SECTOR_OPTIONS = [
  { value: UNKNOWN, label: 'Not sure' },
  { value: 'it_software', label: 'IT and software' },
  { value: 'rmg_manufacturing', label: 'RMG, textiles or manufacturing' },
  { value: 'banking_finance', label: 'Banking and finance' },
  { value: 'ngo_development', label: 'NGO and development' },
  { value: 'civil_engineering', label: 'Civil engineering and construction' },
  { value: 'business', label: 'General business' },
  { value: 'academic_research', label: 'Academic and research' },
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
