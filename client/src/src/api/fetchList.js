/**
 * Module: api/fetchList
 * Responsibility: Fetch a JSON list endpoint and either return an array or
 * throw — never hand the caller something that is not a list.
 *
 * Why this exists:
 *
 * fetch() does not reject on an HTTP error. A 500 resolves normally, so
 *
 *   const data = await response.json()   // { error: "..." }  — an object
 *   setResources(data)                   // no throw, catch not entered
 *
 * stores the error body in state that the rest of the component believes is an
 * array. Nothing fails until render reaches `resources.filter(...)`, which
 * throws TypeError outside the try, escapes the effect, and takes the page down
 * to a blank screen with an error boundary notice.
 *
 * Observed exactly that way on 2026-08-27: a developer whose DB_PASSWORD was
 * wrong got `[resources] list failed: password authentication failed` on the
 * server and a completely white page in the browser, with the real cause three
 * console errors above `resources.filter is not a function`. The database was
 * the bug; the blank page was this.
 *
 * The disciplines fetches in the same components happened to survive, because
 * they call data.map() INSIDE the try — so the TypeError was caught and the
 * hardcoded fallback list rendered. That inconsistency is the tell: whether a
 * failed request blanked the page depended on where the array method sat.
 */

/**
 * @param {string} url
 * @returns {Promise<Array>} always an array, or throws
 * @throws {Error} on a network failure, a non-2xx status, or a non-array body
 */
export async function fetchList(url) {
  const response = await fetch(url)

  if (!response.ok) {
    // Surface the server's own message where it sent one. The routes return
    // { error: '...' }, and that text is far more useful than "500".
    let detail = ''
    try {
      const body = await response.json()
      detail = typeof body?.error === 'string' ? body.error : ''
    } catch {
      // Body was not JSON. The status alone still identifies the failure.
    }
    throw new Error(`${url} → ${response.status}${detail ? `: ${detail}` : ''}`)
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    throw new Error(`${url} → expected a list, received ${data === null ? 'null' : typeof data}`)
  }

  return data
}
