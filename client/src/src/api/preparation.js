/**
 * The preparation API, in one place.
 *
 * Same shape as api/account.js and for the same reason: every call goes through
 * apiFetch, so an expired session is handled identically wherever it surfaces
 * rather than each caller inventing its own message for a lapsed token.
 *
 * The interview start is the one call that does not send JSON. It carries an
 * optional resume file, so it is multipart — and that file is the reason there
 * is no "use my last resume" option anywhere here. The extracted text of a past
 * upload is deliberately never stored, so there is nothing on the server to
 * reuse, and asking for the file again is what keeps that true.
 */

import { apiFetch } from '../utils/apiClient'
import { ApiError } from './account'

async function request(url, options = {}) {
  const response = await apiFetch(url, {
    headers: options.body && typeof options.body === 'string'
      ? { 'Content-Type': 'application/json' }
      : undefined,
    ...options,
  })

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // A body that is not JSON is only a problem if the call also failed.
  }

  if (!response.ok) {
    throw new ApiError(data?.error ?? null, response.status)
  }

  return data
}

/** Every gap held for this account, with its resource links already resolved. */
export function fetchGaps() {
  return request('/api/preparation/gaps')
}

/** The severity-weighted progress figure, without carrying every gap to get it. */
export function fetchGapSummary() {
  return request('/api/preparation/summary')
}

/**
 * Dismisses a gap, or brings a dismissed one back.
 *
 * There is deliberately no way to mark a gap closed by hand. Closing is
 * something an analysis concludes; a self-serve close button would make the
 * progress figure a measure of clicking rather than of work.
 */
export function setGapStatus(gapId, status) {
  return request(`/api/preparation/gaps/${gapId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function fetchInterviewQuota() {
  return request('/api/preparation/quota')
}

/**
 * Starts an interview. Everything is optional: with nothing supplied the
 * questions are generic for the role, which is a real tier and not a failure.
 *
 * @param {{targetRole?: string, candidateStage?: string, jobAd?: string,
 *          resumeFile?: File, language?: string}} input
 */
export function startInterview({ targetRole, candidateStage, jobAd, resumeFile, language }) {
  const form = new FormData()
  if (resumeFile) form.append('resume', resumeFile)
  if (targetRole) form.append('targetRole', targetRole)
  if (candidateStage) form.append('candidateStage', candidateStage)
  if (jobAd) form.append('jobAd', jobAd)
  if (language) form.append('language', language)

  return request('/api/preparation/interviews', { method: 'POST', body: form })
}

/**
 * Submits the answers and returns the assessment.
 *
 * The questions are not sent back. The server holds the ones it wrote, and
 * marking someone against five questions the client supplied would be marking
 * them against questions nobody asked.
 */
export function submitInterviewAnswers(interviewId, answers, language) {
  return request(`/api/preparation/interviews/${interviewId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ answers, language }),
  })
}

/** Past interviews, newest first. Scores and dates only. */
export function fetchInterviews() {
  return request('/api/preparation/interviews')
}

/** One interview in full, in whatever state it was left in. */
export function fetchInterview(id) {
  return request(`/api/preparation/interviews/${id}`)
}
