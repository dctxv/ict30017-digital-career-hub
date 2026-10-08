/**
 * What gets drawn on the resume, built from a review.
 *
 * Only issues with an exact place in the document become annotations: each one
 * carries the verbatim text the model quoted, which quoteMatch.js finds in the
 * preview. Feedback about the whole document, and keywords the resume does not
 * contain, have nowhere to point and stay in the side panel instead.
 *
 * Order is priority. Heading risks first, because a heading an applicant
 * tracking system cannot read can hide a whole section; then language errors,
 * which an employer notices on a first read; then weak lines; then formatting.
 * Only the first MAX_NUMBERED are numbered and drawn, so a resume with thirty
 * findings is not buried under colour; the rest stay listed.
 *
 * Pure: no React, no translation. The page supplies the words.
 */

export const MAX_NUMBERED = 20

/** Categories in priority order. `layer` keywords are off until switched on. */
export const CATEGORIES = ['heading', 'grammar', 'content', 'format', 'keyword']
export const OFF_BY_DEFAULT = new Set(['keyword'])

const text = value => (typeof value === 'string' ? value.trim() : '')
const list = value => (Array.isArray(value) ? value : [])

/**
 * @param {object|null} feedback a validated review
 * @returns {{
 *   annotations: Array<{id: string, category: string, quotes: string[], term: boolean,
 *     title: string, detail: string, fix: string, kind?: string}>,
 *   wholeDocument: Array<{section: string, issue: string, suggestion: string}>,
 *   missingKeywords: string[],
 * }}
 */
export function collectAnnotations(feedback) {
  const annotations = []
  const add = (category, fields) => {
    const quotes = fields.quotes.map(text).filter(quote => quote.length >= 2)
    if (quotes.length === 0) return false
    annotations.push({ id: `${category}-${annotations.length}`, category, term: false, ...fields, quotes })
    return true
  }

  for (const risk of list(feedback?.ats_analysis?.heading_risks)) {
    add('heading', {
      quotes: [risk?.original],
      title: text(risk?.original),
      detail: text(risk?.issue),
      fix: text(risk?.recommended),
    })
  }

  for (const issue of list(feedback?.language_grammar?.issues)) {
    add('grammar', {
      quotes: [issue?.original],
      title: text(issue?.original),
      detail: '',
      fix: text(issue?.corrected),
      kind: text(issue?.type).toUpperCase(),
    })
  }

  for (const bullet of list(feedback?.content_quality?.weak_bullets)) {
    add('content', {
      quotes: [bullet?.quote],
      title: text(bullet?.quote),
      detail: text(bullet?.issue),
      fix: text(bullet?.suggestion),
    })
  }

  const wholeDocument = []
  for (const issue of list(feedback?.formatting?.issues)) {
    if (!text(issue?.issue)) continue
    const placed = add('format', {
      quotes: list(issue?.quotes),
      title: text(issue?.issue),
      detail: text(issue?.section),
      fix: text(issue?.suggestion),
    })
    if (!placed) {
      wholeDocument.push({ section: text(issue?.section), issue: text(issue?.issue), suggestion: text(issue?.suggestion) })
    }
  }

  // Keywords the job advert asked for and the resume already has. Only with an
  // advert: without one the "hits" are the model's guess at the role family,
  // and painting them green would claim a match against nothing.
  for (const keyword of list(feedback?.job_match?.matched_keywords)) {
    if (!text(keyword)) continue
    annotations.push({
      id: `keyword-${annotations.length}`,
      category: 'keyword',
      term: true,
      quotes: [text(keyword)],
      title: text(keyword),
      detail: '',
      fix: '',
    })
  }

  const missingKeywords = feedback?.job_match
    ? list(feedback.job_match.missing_keywords).map(item => text(item?.keyword)).filter(Boolean)
    : list(feedback?.ats_analysis?.keyword_gaps).map(text).filter(Boolean)

  return { annotations, wholeDocument, missingKeywords }
}
