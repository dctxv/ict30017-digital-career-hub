/**
 * Module: utils/pdfText
 * Responsibility: Turn pdfjs text items into text that keeps the document's
 * lines, and read the candidate's name off page 1 by type size.
 *
 * Pure functions over the item objects pdfjs's getTextContent() returns, so
 * they can be tested without a PDF.
 *
 * Why this is not just `items.map(i => i.str).join(' ')`, which is what the
 * parser used to do:
 *
 *   - pdfjs already reports where lines end (`hasEOL`) and emits its own space
 *     items between words. Joining with ' ' threw the line ends away and put a
 *     space between every glyph run, so every PDF became one line per page.
 *     The PII mask reads a CV's header by its lines and scopes addresses and
 *     labelled fields to a line; on one-line text neither can work.
 *   - A letter-spaced heading comes out as "M A R I A  S A N T O S". A reader
 *     sees a name; a string match does not.
 *   - Bangla is drawn in visual order. A vowel sign written before its
 *     consonant ('ি' in 'মি') arrives before it ('িম'), the left half of 'ো'
 *     has no Unicode mapping at all and arrives as U+0000, and each glyph
 *     cluster is its own item, which the old join spaced apart.
 */

/* ── Item-level repairs ─────────────────────────────────────────────────── */

/**
 * Collapses a letter-spaced run back into a word.
 *
 * Only an item made ENTIRELY of single characters separated by single spaces
 * is touched — at least four of them, at least three letters — so ordinary
 * text containing "a" or "I" is never merged. Word boundaries inside the run
 * are not recoverable from the text layer ("M A R I A I S A B E L" has one
 * space everywhere), so "MARIAISABEL" is the best available reading; it is
 * still one readable string that a mask can match literally.
 *
 * @param {string} str
 * @returns {string}
 */
export function collapseLetterSpacing(str) {
  const trimmed = str.trim();
  if (!/^(?:[\p{L}\p{N}'’.-]\p{M}* ){3,}[\p{L}\p{N}'’.-]\p{M}*$/u.test(trimmed)) return str;
  if ((trimmed.match(/\p{L}/gu) ?? []).length < 3) return str;
  const lead = str.match(/^\s*/)[0];
  const tail = str.match(/\s*$/)[0];
  return lead + trimmed.replace(/ /g, '') + tail;
}

// A Bengali consonant, with an optional nukta, and any conjunct formed with
// hasanta. Vowel signs attach to the whole cluster.
const BN_CONSONANT = '[\\u0995-\\u09B9\\u09CE\\u09DC-\\u09DF]\\u09BC?';
const BN_CLUSTER = `${BN_CONSONANT}(?:\\u09CD${BN_CONSONANT})*`;
// Pre-base vowel signs, drawn to the left of the consonant they follow.
const BN_PRE_BASE = '[\\u09BF\\u09C7\\u09C8]';

const LEADING_PRE_BASE = new RegExp(`^(\\s*)(${BN_PRE_BASE})(${BN_CLUSTER})`, 'u');
// U+0000 then a cluster then aa-kar: the unmapped left half of o-kar.
const LEADING_O_KAR = new RegExp(`^(\\s*)\\u0000(${BN_CLUSTER})\\u09BE`, 'u');
// U+0000 then a cluster then au-length mark: the same for au-kar.
const LEADING_AU_KAR = new RegExp(`^(\\s*)\\u0000(${BN_CLUSTER})\\u09D7`, 'u');
// U+0000 then a cluster with no second half after it: an unmapped e-kar.
const LEADING_E_KAR = new RegExp(`^(\\s*)\\u0000(${BN_CLUSTER})(?![\\u09BE\\u09D7])`, 'u');
// e-kar, cluster, aa-kar: o-kar drawn in two halves that both mapped.
const SPLIT_O_KAR = new RegExp(`^(\\s*)(${BN_CLUSTER})\\u09C7\\u09BE`, 'u');

const O_KAR = String.fromCodePoint(0x09cb);
const AU_KAR = String.fromCodePoint(0x09cc);
const E_KAR = String.fromCodePoint(0x09c7);

/**
 * Puts a visually ordered Bengali item back into logical order.
 *
 * Applied at the START of an item only. A dependent vowel sign can never
 * begin a word in logical Bengali, so a leading one is always a visual-order
 * artefact and moving it is safe whatever produced the PDF. Mid-item the same
 * byte sequence can be correct logical text ('কিম' is ক + ি + ম), so nothing
 * inside an item is reordered.
 *
 * @param {string} str
 * @returns {string}
 */
export function repairBengaliVisualOrder(str) {
  if (!/[ঀ-৿]/u.test(str)) return str.replace(/\u0000/g, '');
  const out = str
    .replace(LEADING_O_KAR, `$1$2${O_KAR}`)
    .replace(LEADING_AU_KAR, `$1$2${AU_KAR}`)
    .replace(LEADING_E_KAR, `$1$2${E_KAR}`)
    .replace(LEADING_PRE_BASE, '$1$3$2')
    .replace(SPLIT_O_KAR, `$1$2${O_KAR}`);
  // Anything still unmapped cannot be recovered; dropping it beats sending NULs.
  return out.replace(/\u0000/g, '');
}

/* ── Items → text ───────────────────────────────────────────────────────── */

const fontSize = (item) => Math.hypot(item.transform?.[2] ?? 0, item.transform?.[3] ?? 0) || item.height || 0;

const HAS_BENGALI_OR_NUL = /[\u0980-\u09FF\u0000]/u;
const ONLY_NUL = /^\u0000+$/u;
const STARTS_WITH_CLUSTER = new RegExp(`^(${BN_CLUSTER})(\u09BE?)`, 'u');

/**
 * Item-sequence repairs for visually ordered Bengali that no single item can
 * show on its own.
 *
 *   - A glyph run pdfjs measures at zero width (a conjunct ligature, a reph)
 *     is followed by a fake space item carrying the glyph's advance, which
 *     splits the word: 'শিক্ষ ক' for 'শিক্ষক'. The fake space is dropped.
 *   - An unmapped glyph standing alone at the start of a word, just before a
 *     consonant, is the pre-base half of a vowel: 'ো' when the consonant is
 *     followed by 'া' (the other half), otherwise 'ে'.
 *
 * Returns the item strings to use, in order, with dropped items as null.
 */
function repairItemSequence(items) {
  const out = items.map((item) => (typeof item?.str === 'string' ? item.str : null));

  for (let i = 0; i < items.length; i++) {
    const str = out[i];
    if (str === null) continue;

    // Fake advance after a zero-width Bengali run. Where the next glyph
    // actually starts tells a fake space from a real one: a conjunct on its
    // own advances about two-thirds of an em, so a space item spanning that is
    // the glyph's own width and is dropped. Much less (a zero-width reph then
    // a real space) or much more (the glyph plus a real space) keeps a space.
    if (!str.trim() && str.length > 0 && i > 0) {
      const prev = items[i - 1];
      const next = items[i + 1];
      if (typeof prev?.str === 'string' && (prev.width ?? 1) === 0 && HAS_BENGALI_OR_NUL.test(prev.str) && next?.transform) {
        const em = Math.max(fontSize(prev), 1);
        const advance = (next.transform[4] - prev.transform[4]) / em;
        if (advance >= 0.4 && advance <= 0.72) {
          out[i] = null;
          continue;
        }
      }
    }

    // Unmapped pre-base vowel half at a word start.
    if (ONLY_NUL.test(str)) {
      const before = i > 0 ? out.slice(0, i).filter((s) => s !== null).join('') : '';
      const atWordStart = !before || /[\s\n:|(]$/u.test(before) || items[i - 1]?.hasEOL;
      const next = out[i + 1];
      const match = typeof next === 'string' ? next.match(STARTS_WITH_CLUSTER) : null;
      if (atWordStart && match) {
        const [whole, cluster, aa] = match;
        out[i + 1] = cluster + (aa ? '\u09CB' : '\u09C7') + next.slice(whole.length);
      }
      out[i] = '';
    }
  }
  return out;
}

/**
 * Joins a page's items into text that keeps its lines.
 *
 * Items are concatenated as they are — pdfjs supplies the spaces between
 * words itself — with three additions: a newline wherever pdfjs marks a line
 * end, a newline when the baseline moves by more than half a line without one
 * being marked, and a space when two items on the same line are separated by
 * a visible gap with no space item between them (table cells, right-aligned
 * dates).
 *
 * @param {Array<object>} items pdfjs TextItem objects (TextMarkedContent ignored)
 * @returns {string}
 */
export function itemsToText(items) {
  let out = '';
  let prev = null;
  const repaired = repairItemSequence(items);

  for (const [index, item] of items.entries()) {
    if (repaired[index] === null) continue;
    const str = repairBengaliVisualOrder(collapseLetterSpacing(repaired[index]));

    if (prev && str) {
      const size = Math.max(fontSize(item), fontSize(prev), 1);
      const dy = Math.abs((item.transform?.[5] ?? 0) - (prev.transform?.[5] ?? 0));
      const prevEnd = (prev.transform?.[4] ?? 0) + (prev.width ?? 0);
      const gap = (item.transform?.[4] ?? 0) - prevEnd;
      const lastChar = out.slice(-1);
      // A zero-width Bengali run's advance was carried by the fake space
      // repairItemSequence dropped; the gap it leaves is not a word break.
      const afterZeroWidth = (prev.width ?? 1) === 0 && HAS_BENGALI_OR_NUL.test(prev.str) && repaired[index - 1] === null;
      if (dy > size * 0.5 && lastChar !== '\n' && fontSize(item) > 0) {
        out += '\n';
      } else if (gap > size * 0.25 && !afterZeroWidth && lastChar && !/\s/.test(lastChar) && !/^\s/.test(str)) {
        out += ' ';
      }
    }

    out += str;
    if (item.hasEOL && !out.endsWith('\n')) out += '\n';
    if (str.trim() || item.hasEOL) prev = item;
  }

  return out.replace(/[^\S\n]+\n/g, '\n');
}

/* ── Name hint ──────────────────────────────────────────────────────────── */

// A document title, alone or introducing the name: "RESUME", "Resume of".
const DOCUMENT_TITLE = /^(?:curriculum\s*vitae|resume|r[eé]sum[eé]|cv|bio\s*-?\s*data|জীবনবৃত্তান্ত|সিভি)(?:\s+of)?\b[\s:–-]*/iu;

/**
 * Reads the candidate's name as the largest type on page 1.
 *
 * On a CV the name is almost always set bigger than anything else, whatever
 * the layout — including sidebar templates, where it is not in the first
 * lines of the text at all. A document title ("CURRICULUM VITAE") set larger
 * still is stepped over. The result is used only as an extra known string for
 * the PII mask, never shown and never trusted on its own: if it is not
 * name-shaped, no hint is returned.
 *
 * @param {Array<object>} items page 1's pdfjs TextItem objects
 * @returns {string|null}
 */
export function nameHintFromItems(items) {
  const texty = (items ?? []).filter((item) => typeof item?.str === 'string' && /\p{L}/u.test(item.str));
  const sizes = [...new Set(texty.map((item) => Math.round(fontSize(item) * 10) / 10))].sort((a, b) => b - a);

  for (const size of sizes.slice(0, 3)) {
    // The first contiguous run of items at this size: a name split across two
    // spans (first name light, surname bold) is one run. Whitespace and
    // unmapped-glyph items inside the run belong to it.
    let first = -1;
    let last = -1;
    for (const [index, item] of items.entries()) {
      if (typeof item?.str !== 'string') continue;
      const atSize = Math.abs(fontSize(item) - size) < 0.6 && /\p{L}/u.test(item.str);
      if (atSize) {
        if (first < 0) first = index;
        last = index;
      } else if (first >= 0 && item.str.trim() && !ONLY_NUL.test(item.str)) {
        break;
      }
    }
    if (first < 0) continue;

    // An unmapped glyph just before the run is part of its first word.
    const start = first > 0 && ONLY_NUL.test(items[first - 1]?.str ?? '') ? first - 1 : first;
    const text = itemsToText(items.slice(start, last + 1)).replace(/\s+/g, ' ').trim();

    // "Resume of Sakib Hasan" gives the name; "RESUME" or "Resume of [Photo]"
    // gives nothing at this size, so the next size down is tried.
    const title = text.match(DOCUMENT_TITLE);
    if (title) {
      const rest = text.slice(title[0].length).trim();
      if (isNameShaped(rest)) return rest;
      continue;
    }
    if (isNameShaped(text)) return text;
    return null;
  }
  return null;
}

function isNameShaped(text) {
  if (!text || text.length < 3 || text.length > 60) return false;
  if (/[\p{Nd}@|:]/u.test(text)) return false;
  const words = text.split(' ');
  // Two words at least: a lone large word is a heading ("PROFILE"), and
  // masking a heading everywhere as a name would gut the document.
  if (words.length < 2 || words.length > 6) return false;
  return words.every((word) => /^\(?[\p{L}\p{M}][\p{L}\p{M}'’.-]*\)?\.?$/u.test(word));
}
