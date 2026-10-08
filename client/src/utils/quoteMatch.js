/**
 * Finds a quote from the review inside the document it came from.
 *
 * The review is written about the text the model was sent; the preview is the
 * document the candidate uploaded. The two never agree character for character:
 * a PDF's text layer splits words across items, adds or drops spaces, breaks
 * lines mid-phrase and hyphenates; the model was sent text with personal
 * details replaced by placeholders such as [NAME]; and the model itself
 * normalises quote marks and dashes. So the comparison is made on a skeleton
 * of each side — letters, digits and combining marks only, lower-cased — and a
 * match on the skeleton is mapped back to exact positions in the original runs.
 *
 * Works on any list of strings in reading order: the spans of a PDF text layer,
 * the text nodes of a rendered Word document, or text items in a test. Pure, so
 * the same code that draws the highlights is the code that is measured.
 *
 * A quote that cannot be placed confidently is reported as unplaced rather
 * than matched loosely. A missing highlight is a small loss; one pointing at
 * the wrong line teaches the candidate to distrust all of them.
 */


/*
 * Where a quote may skip over text: a placeholder, which stands for the real
 * detail in the document, and an ellipsis, which the prompt forbids but models
 * still write. Each may stand for up to GAP_SPAN characters.
 */
const GAP = /\[(?:NAME|EMAIL|PHONE|ADDRESS|URL|ID|DATE OF BIRTH|PERSONAL)\]|\.{3}|…/

/** Characters that carry meaning for matching: letters, digits, combining marks. */
const KEEP = /[\p{L}\p{N}\p{M}]/u

/*
 * Bangla vowel signs and other marks are dropped from the skeleton. A PDF draws
 * a pre-base sign before its consonant ('ি' in 'মি' arrives as 'িম') and the
 * server reorders it before the model sees the text, so the review and the
 * preview disagree on exactly these characters. The consonants alone still
 * pin a multi-word Bangla phrase down, and their order is not disturbed.
 */
const BANGLA_MARK = /[\u0981-\u0983\u09BC\u09BE-\u09CD\u09D7\u09E2\u09E3]/u

/** Longest gap, in skeleton characters, a placeholder or ellipsis may stand for. */
const GAP_SPAN = 80

/** Shortest skeleton worth placing. Shorter quotes match too much by chance. */
const MIN_SKELETON = 4

/** A keyword may be shorter (PHP, iOS), because it must also be a whole word. */
const MIN_TERM = 2

/** Fuzzy matching only for quotes long enough that an edit or two is noise. */
const FUZZY_MIN = 16
const FUZZY_RATIO = 0.12

function skeletonChar(ch) {
  return ch.normalize('NFKC').toLowerCase()
}

/**
 * The skeleton of a list of runs, with a map from each skeleton character back
 * to the run and offset it came from.
 *
 * @param {string[]} runs
 * @returns {{text: string, map: Array<[number, number]>}}
 */
export function buildIndex(runs) {
  const source = runs.map(run => (typeof run === 'string' ? run : ''))
  let text = ''
  const map = []
  source.forEach((value, runIndex) => {
    for (let offset = 0; offset < value.length; offset += 1) {
      // NFKC can expand one character (a ligature) into several.
      for (const ch of skeletonChar(value[offset])) {
        if (KEEP.test(ch) && !BANGLA_MARK.test(ch)) {
          text += ch
          map.push([runIndex, offset])
        }
      }
    }
  })
  return { text, map, runs: source }
}

function skeleton(value) {
  let out = ''
  for (const ch of skeletonChar(value)) if (KEEP.test(ch) && !BANGLA_MARK.test(ch)) out += ch
  return out
}

/** Every start index of needle in haystack. */
function allIndexes(haystack, needle) {
  const found = []
  if (!needle) return found
  let at = haystack.indexOf(needle)
  while (at !== -1) {
    found.push(at)
    at = haystack.indexOf(needle, at + 1)
  }
  return found
}

/**
 * Exact skeleton match, allowing each placeholder in the quote to stand for up
 * to PLACEHOLDER_SPAN characters of whatever the document really says there.
 *
 * @returns {Array<[number, number]>} [start, end) skeleton spans
 */
function exactSpans(haystack, quote, minLength) {
  const parts = quote.split(GAP).map(skeleton)
  const anchors = parts.filter(Boolean)
  if (anchors.join('').length < minLength) return []

  const spans = []
  const first = parts.findIndex(Boolean)
  for (const start of allIndexes(haystack, parts[first])) {
    let cursor = start + parts[first].length
    let ok = true
    for (let i = first + 1; i < parts.length && ok; i += 1) {
      if (!parts[i]) continue
      // A placeholder or ellipsis sat between the previous part and this one.
      const window = haystack.slice(cursor, cursor + GAP_SPAN + parts[i].length)
      const at = window.indexOf(parts[i])
      if (at === -1) ok = false
      else cursor += at + parts[i].length
    }
    if (ok) spans.push([start, cursor])
  }
  return spans
}

/**
 * Best approximate occurrence of needle in haystack (Sellers' algorithm: edit
 * distance where the match may start and end anywhere in the haystack).
 *
 * @returns {{start: number, end: number, distance: number}|null}
 */
function approximateSpan(haystack, needle) {
  const m = needle.length
  const limit = Math.floor(m * FUZZY_RATIO)
  let prev = new Array(m + 1)
  let prevStart = new Array(m + 1)
  for (let i = 0; i <= m; i += 1) { prev[i] = i; prevStart[i] = 0 }

  let best = null
  for (let j = 1; j <= haystack.length; j += 1) {
    const cur = new Array(m + 1)
    const curStart = new Array(m + 1)
    cur[0] = 0
    curStart[0] = j
    for (let i = 1; i <= m; i += 1) {
      const cost = needle[i - 1] === haystack[j - 1] ? 0 : 1
      let value = prev[i - 1] + cost
      let start = prevStart[i - 1]
      if (prev[i] + 1 < value) { value = prev[i] + 1; start = prevStart[i] }
      if (cur[i - 1] + 1 < value) { value = cur[i - 1] + 1; start = curStart[i - 1] }
      cur[i] = value
      curStart[i] = start
    }
    if (cur[m] <= limit && (!best || cur[m] < best.distance)) {
      best = { start: curStart[m], end: j, distance: cur[m] }
    }
    prev = cur
    prevStart = curStart
  }
  return best
}

/**
 * Whether the document character next to a matched span is part of a word.
 * The edge of a run counts as a boundary: runs are lines, paragraphs or PDF
 * text items, and an item that splits a word in two is rare enough that
 * missing a keyword there costs less than refusing every keyword at the start
 * of a line.
 */
function wordCharAt(run, at) {
  return typeof run === 'string' && at >= 0 && at < run.length && /[\p{L}\p{N}]/u.test(run[at])
}

/** Keeps only spans that start and end on a word boundary. */
function wholeWords(index, spans) {
  return spans.filter(([start, end]) => {
    const [startRun, startOffset] = index.map[start]
    const [endRun, endOffset] = index.map[end - 1]
    return !wordCharAt(index.runs[startRun], startOffset - 1) && !wordCharAt(index.runs[endRun], endOffset + 1)
  })
}

/**
 * Where a quote sits in a document.
 *
 * @param {{text: string, map: Array<[number, number]>, runs: string[]}} index from buildIndex
 * @param {string} quote as the review gave it
 * @param {{all?: boolean, term?: boolean}} [options] all: every exact
 *   occurrence instead of the first. term: a keyword, which may be as short as
 *   two characters but must match whole words and is never matched fuzzily.
 * @returns {{status: 'exact'|'fuzzy'|'unplaced', ranges: Array<{start: [number, number], end: [number, number]}>}}
 *   start and end are [runIndex, offset]; end is inclusive of its character
 */
export function locateQuote(index, quote, { all = false, term = false } = {}) {
  const unplaced = { status: 'unplaced', ranges: [] }
  if (typeof quote !== 'string' || !index.text) return unplaced

  const toRange = ([start, end]) => ({ start: index.map[start], end: index.map[end - 1] })

  let exact = exactSpans(index.text, quote, term ? MIN_TERM : MIN_SKELETON)
  if (term) exact = wholeWords(index, exact)
  if (exact.length > 0) {
    return { status: 'exact', ranges: (all ? exact : exact.slice(0, 1)).map(toRange) }
  }
  if (term) return unplaced

  // Fuzzy only for a quote with no gap: one with a placeholder or ellipsis has
  // already had a gap allowed for it, and loosening both at once is where
  // wrong matches come from.
  if (GAP.test(quote)) return unplaced
  const needle = skeleton(quote)
  if (needle.length < FUZZY_MIN) return unplaced
  const near = approximateSpan(index.text, needle)
  if (!near || near.end <= near.start) return unplaced
  return { status: 'fuzzy', ranges: [toRange([near.start, near.end])] }
}
