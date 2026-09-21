/**
 * Module: utils/piiMask
 * Responsibility: Strip candidate PII from every payload on its way OUT to the
 * model provider.
 *
 * ── How this differs from server/src/utils/piiRedactor ──────────────────────
 *
 * They point in opposite directions and both are needed.
 *
 *   piiRedactor  model -> user.  Stops the model echoing contact details back
 *                into feedback the user reads and the database stores.
 *   piiMask      user -> model.  Stops the details reaching the provider at
 *                all.
 *
 * The redactor was written after two evaluated models echoed candidate contact
 * details into their output despite a prompt instruction not to. That fixed
 * what came back. It did nothing about what went out: until this module, a
 * resume review sent the candidate's full name, email, postal address and
 * mobile number verbatim to a third-party API on every single call, and so did
 * the mock interview, the answer evaluation and the gap analysis behind My
 * Plan.
 *
 * ── The masking/meaning trade ───────────────────────────────────────────────
 *
 * The model still has to do its job on what is left. Interview questions cite
 * employers, feedback quotes project names, and the gap engine compares skills
 * against an advertisement — so masking that ate substantive content would
 * break the features it is protecting.
 *
 * Every rule here therefore targets CONTACT identity and nothing else. Nothing
 * matches an employer, a project, a skill, a qualification, a date or a
 * grade. The placeholders keep the document's shape legible:
 *
 *   [NAME] [EMAIL] [PHONE] [ADDRESS] [URL]
 *
 * A masked header still reads as a header — "[NAME]\n[EMAIL] | [PHONE]" — so
 * the model can still see it was given a resume and not a fragment.
 *
 * ── Names need help that regex cannot give ──────────────────────────────────
 *
 * There is no pattern that separates a person's name from an employer's or a
 * university's; "Rahim Chowdhury" and "Rahim Textiles Ltd" are the same shape.
 * Guessing produces either a leak or a review that has lost the name of the
 * company the candidate worked for.
 *
 * So names are matched as KNOWN STRINGS, supplied by the caller: the account
 * holder's stored full name, their stored email and phone, and a name parsed
 * from the CV header. Literal matching is what makes this work identically on
 * Bangla script — matching "মোঃ রাহিম উদ্দিন" needs no notion of what a Bangla
 * name looks like, only the string itself.
 *
 * ── Bangla ─────────────────────────────────────────────────────────────────
 *
 * Emails and phone numbers survive a language change because they anchor on
 * '@', on digits and on '+', none of which are script-specific. The one thing
 * that does not carry over is the digits themselves: a Bangla CV may write the
 * mobile number in Bengali numerals (০১৭...), so every numeric rule runs a
 * second pass over a transliterated copy and maps the hits back onto the
 * original by index.
 *
 * Deterministic by design: pure string and regex work, no model calls, no
 * network, no I/O. It behaves identically with zero API budget, which is the
 * point — the guarantee must not depend on the thing it is guarding.
 */

/* ── Placeholders ───────────────────────────────────────────────────────────
 * Chosen to contain no digits, no '@' and no '/', so re-running the mask over
 * its own output is a no-op. Idempotence is covered by tests.
 */
export const MASK = Object.freeze({
  name: '[NAME]',
  email: '[EMAIL]',
  phone: '[PHONE]',
  address: '[ADDRESS]',
  url: '[URL]',
});

/* ── Bengali and Arabic-Indic numeral handling ──────────────────────────────
 *
 * '০১৭১২৩৪৫৬৭৮' is a Bangladeshi mobile number and must mask exactly as
 * '01712345678' does. Rather than teach every numeric pattern a second
 * alphabet, the text is transliterated to ASCII digits for MATCHING only, and
 * the match offsets are applied to the original string. Both alphabets are
 * one code unit per digit, so offsets are identical in both and the mapping is
 * exact rather than approximate.
 */
const BENGALI_ZERO = 0x09e6; // ০
const ARABIC_INDIC_ZERO = 0x0660; // ٠

function toAsciiDigits(text) {
  let out = '';
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code >= BENGALI_ZERO && code <= BENGALI_ZERO + 9) {
      out += String(code - BENGALI_ZERO);
    } else if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
      out += String(code - ARABIC_INDIC_ZERO);
    } else {
      out += char;
    }
  }
  return out;
}

/** True when the text carries any non-ASCII digit worth a second pass. */
function hasNonAsciiDigits(text) {
  for (const char of text) {
    const code = char.codePointAt(0);
    if (
      (code >= BENGALI_ZERO && code <= BENGALI_ZERO + 9)
      || (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9)
    ) return true;
  }
  return false;
}

/* ── Rules ──────────────────────────────────────────────────────────────────
 *
 * Order is load-bearing:
 *   1. email first, so an address's digits and dots are gone before any
 *      numeric rule inspects them ('rahim.2019@gmail.com' must not lose its
 *      '2019' to a phone rule first).
 *   2. URLs next, same reason — 'linkedin.com/in/rahim-uddin-01712345678'.
 *   3. phones before addresses: a '+880' number's digits must not be claimed
 *      by a postcode rule.
 *   4. addresses last: their numbers are short and no numeric rule matches
 *      them, so they survive intact to be matched as a unit.
 *
 * `digits: true` marks a rule that must also run over the transliterated copy.
 */
const RULES = [
  {
    name: 'email',
    // Requires local@domain.tld. Script-independent: Bangla prose around an
    // address does not change the address's own shape.
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
    mask: MASK.email,
  },
  {
    name: 'profile-url',
    // The whole URL goes, host included. Unlike the outbound-to-user redactor
    // — which keeps the host so "add a LinkedIn profile" stays legible — there
    // is nothing for the model to gain from knowing which platform, and the
    // host plus a handle is directly identifying.
    pattern: /\b(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|twitter\.com|x\.com|facebook\.com|fb\.com|instagram\.com|behance\.net|dribbble\.com|medium\.com|stackoverflow\.com|kaggle\.com|bitbucket\.org)\/[A-Za-z0-9@._~#%/-]*[A-Za-z0-9]/gi,
    mask: MASK.url,
  },
  {
    name: 'personal-site',
    // A bare personal domain on its own line in a header block. Deliberately
    // narrow: only the handful of hosts a candidate uses for a portfolio, so
    // an employer's domain mentioned in a bullet is untouched.
    pattern: /\b(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-]+\.(?:github\.io|vercel\.app|netlify\.app|herokuapp\.com|wordpress\.com|blogspot\.com)(?:\/[A-Za-z0-9@._~#%/-]*)?/gi,
    mask: MASK.url,
  },
  {
    name: 'phone-bd',
    digits: true,
    // BD mobile is 11 digits: 01 + operator digit (3-9) + 8 more, or the same
    // without the leading 0 behind +880. Requiring the operator prefix, plus
    // digit boundaries on both sides, is what stops a year, a GPA or a score
    // matching. Separators allowed mid-number: '+880 1712-345678'.
    pattern: /(?<![\d+])(?:\+?880[\s.-]?1[3-9]\d{2}[\s.-]?\d{6}|01[3-9]\d{2}[\s.-]?\d{6})(?!\d)/g,
    mask: MASK.phone,
  },
  {
    name: 'phone-au',
    digits: true,
    // Australian mobile (04XX XXX XXX / +61 4XX XXX XXX) and landline with an
    // area code ((02) 9XXX XXXX / +61 2 9XXX XXXX). Written as its own rule
    // rather than folded into the international one because the domestic
    // forms carry no '+' and would otherwise need a bare-digit-run rule,
    // which is exactly what false-positives on dates.
    pattern: /(?<![\d+])(?:\+?61[\s.-]?4\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|04\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\(0[2-8]\)[\s.-]?\d{4}[\s.-]?\d{4}|\+?61[\s.-]?[2-8][\s.-]?\d{4}[\s.-]?\d{4}|0[2-8][\s.-]?\d{4}[\s.-]?\d{4})(?!\d)/g,
    mask: MASK.phone,
  },
  {
    name: 'phone-international',
    digits: true,
    // A literal '+' followed by 8-18 digit/separator characters. The leading
    // '+' is what makes this safe — bare digit runs are never matched here, so
    // no date range, student id or grade can be caught by it.
    pattern: /(?<![\d+])\+\d[\d\s.()-]{6,18}\d(?!\d)/g,
    mask: MASK.phone,
  },
  {
    name: 'phone-grouped',
    digits: true,
    // NANP-style 3-3-4 with mandatory separators. '2019-2023' is 4-4 and
    // cannot match; '45 / 35 / 20' is 2-2-2 and cannot match.
    pattern: /(?<![\d-])\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/g,
    mask: MASK.phone,
  },
  {
    name: 'address-bd',
    digits: true,
    // The BD "House 12, Road 5, Block C" form, and its Bangla equivalent
    // (বাসা ১২, রোড ৫). Both parts are required, so a lone "Road 5" or
    // "3 years" cannot match.
    pattern: /(?:\b(?:House|Flat|Holding)\s*#?\s*\d+[A-Za-z]?\s*,?\s*(?:Road|Rd)\s*#?\s*\d+[A-Za-z]?(?:\s*,\s*(?:Block|Sector)\s*[A-Za-z0-9-]+)?|(?:বাসা|বাড়ি|ফ্ল্যাট|হোল্ডিং)\s*#?\s*[\d০-৯]+\s*,?\s*(?:রোড|সড়ক)\s*#?\s*[\d০-৯]+(?:\s*,\s*(?:ব্লক|সেক্টর)\s*[^\s,]+)?)/gi,
    mask: MASK.address,
  },
  {
    name: 'address-street',
    // Western "12 Oak Street" / "3/14 Elizabeth St" form. The street-type
    // suffix is mandatory, so "3 Project Lead roles" cannot match.
    pattern: /\b\d{1,5}(?:\/\d{1,5})?\s+[A-Z][A-Za-z']*(?:\s+[A-Z][A-Za-z']*)?\s+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Terrace|Tce|Crescent|Cres|Parade|Pde|Highway|Hwy)\b\.?/g,
    mask: MASK.address,
  },
  {
    name: 'address-au-postcode',
    digits: true,
    // "Hawthorn VIC 3122" — a state abbreviation immediately before a 4-digit
    // code. The state token is what keeps a bare year from matching.
    pattern: /\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?,?\s+(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+\d{4}\b/g,
    mask: MASK.address,
  },
  {
    name: 'address-bd-postcode',
    digits: true,
    // "Dhaka-1209", and the Bangla "ঢাকা-১২০৯". A known city is required
    // immediately before the 4-digit code, so a bare four-digit year cannot
    // match.
    pattern: /(?:\b(?:Dhaka|Chattogram|Chittagong|Khulna|Rajshahi|Sylhet|Barisal|Barishal|Rangpur|Mymensingh|Comilla|Cumilla|Narayanganj|Gazipur)\s*-\s*\d{4}\b|(?:ঢাকা|চট্টগ্রাম|খুলনা|রাজশাহী|সিলেট|বরিশাল|রংপুর|ময়মনসিংহ|কুমিল্লা|নারায়ণগঞ্জ|গাজীপুর)\s*-\s*[\d০-৯]{4})/gi,
    mask: MASK.address,
  },
];

/* ── Known-string masking ───────────────────────────────────────────────── */

const REGEX_META = /[.*+?^${}()|[\]\\]/g;
const escapeRegex = (value) => value.replace(REGEX_META, '\\$&');

/**
 * Name particles that are not identifying on their own.
 *
 * Masking a bare 'Md' or 'Mohammad' would hit a third of Bangladeshi employer
 * names as well as the candidate, and masking a bare 'Kumar' or 'Ali' is the
 * same problem. Full names are always masked; these are only excluded from the
 * single-token pass.
 */
const NON_IDENTIFYING_PARTS = new Set([
  'md', 'mohammad', 'mohammed', 'muhammad', 'mohd', 'mr', 'mrs', 'ms', 'dr',
  'engr', 'prof', 'begum', 'khatun', 'miah', 'mia', 'shri', 'smt',
  'মোঃ', 'মোহাম্মদ', 'মুহাম্মদ', 'মিঃ', 'মিসেস', 'ডঃ', 'ড', 'জনাব', 'বেগম',
]);

/**
 * Expands a known name into the variants a CV actually contains.
 *
 * A resume says "Rahim Uddin Chowdhury" in the header and "Rahim" in a
 * reference line, and the account stores one of the two. Masking only the
 * exact stored string leaves the other in place, so each name is expanded into
 * its full form plus its individually identifying tokens.
 *
 * Longest first, so 'Rahim Uddin' is consumed before 'Rahim' can take half of
 * it and leave '[NAME] Uddin' on the page.
 */
function expandNameVariants(names) {
  const variants = new Set();

  for (const raw of names) {
    const name = String(raw ?? '').replace(/\s+/g, ' ').trim();
    if (name.length < 2) continue;

    variants.add(name);

    const parts = name.split(' ').filter(Boolean);
    if (parts.length < 2) continue;

    // The full name without honorifics: 'Md. Rahim Uddin' also appears as
    // 'Rahim Uddin'.
    const withoutHonorifics = parts
      .filter((part) => !NON_IDENTIFYING_PARTS.has(part.replace(/[.]/g, '').toLowerCase()))
      .join(' ');
    if (withoutHonorifics.split(' ').filter(Boolean).length >= 2) {
      variants.add(withoutHonorifics);
    }

    for (const part of parts) {
      const bare = part.replace(/[.,]/g, '');
      if (bare.length < 3) continue;
      if (NON_IDENTIFYING_PARTS.has(bare.toLowerCase())) continue;
      variants.add(bare);
    }
  }

  return [...variants].sort((a, b) => b.length - a.length);
}

/**
 * Masks a known literal value wherever it appears.
 *
 * Case-insensitive, because a CV header is routinely upper-cased while the
 * account stores title case. Bounded by non-word characters rather than \b:
 * \b is defined on ASCII word characters and does not fire around Bangla
 * script, so a Bangla name would never match with it.
 */
function maskKnownValue(text, value, placeholder) {
  const escaped = escapeRegex(value);
  // A leading/trailing guard that works for both scripts: the match may not be
  // flanked by a letter, digit or underscore in ANY alphabet.
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
    'giu'
  );
  return text.replace(pattern, placeholder);
}

/**
 * Masks a personal website whose domain is built out of the candidate's name.
 *
 * A bare custom domain cannot be matched generically — 'bdjobs.com',
 * 'brac.net' and every employer mentioned in a bullet have the same shape as
 * 'saminmahmud.com', and a rule broad enough to catch the third catches the
 * other two and guts the document.
 *
 * What IS safe is a domain that contains a token of a name we already know.
 * That is not a guess about domains in general; it is the known-string
 * approach applied to a second surface, and it covers the common real case of
 * a portfolio site named after its owner.
 *
 * Runs after the pattern rules, so an email address has already become
 * [EMAIL] and its domain cannot be matched here a second time.
 */
function maskNameDomains(text, nameTokens) {
  if (nameTokens.length === 0) return { text, count: 0 };

  const alternation = nameTokens.map(escapeRegex).join('|');
  const pattern = new RegExp(
    // optional scheme and www, a label containing a known name token, a TLD
    // (with an optional second level such as .com.bd), and an optional path.
    `(?:https?://)?(?:www\\.)?[A-Za-z0-9-]*(?:${alternation})[A-Za-z0-9-]*`
    + '\\.(?:[A-Za-z]{2,63})(?:\\.[A-Za-z]{2,63})?(?:/[^\\s]*)?',
    'gi'
  );

  let count = 0;
  const masked = text.replace(pattern, () => {
    count += 1;
    return MASK.url;
  });
  return { text: masked, count };
}

/* ── CV header name inference ───────────────────────────────────────────── */

const CONTACT_TOKEN = /@|\+?\d{3}|\[(?:EMAIL|PHONE|URL|ADDRESS)\]/;

/**
 * A document title above the name. These are skipped over, because the name is
 * still below them.
 */
const DOCUMENT_TITLE = /^(?:curriculum\s+vitae|resume|r[eé]sum[eé]|cv|bio\s*-?\s*data|জীবনবৃত্তান্ত|সিভি)\b/i;

/**
 * A section heading. Unlike a document title, this one means the header block
 * is OVER — the name was above it or is not there at all.
 */
const SECTION_HEADING = /^(?:profile|summary|objective|career\s+objective|education|experience|employment|skills|projects|contact|references|about)\b/i;

/**
 * Best-effort guess at the candidate's name from the top of the document.
 *
 * Only used IN ADDITION to the stored account name, never instead of it, and
 * deliberately conservative: it reads the first few non-empty lines and accepts
 * one only if it looks like a standalone name line — short, no contact token,
 * no section heading, two to five words.
 *
 * A wrong guess here masks a word that was not a name, which costs the model a
 * little context. A missed guess costs nothing, because the stored name has
 * already been masked. That asymmetry is why the thresholds are tight.
 *
 * @param {string} text
 * @returns {string|null}
 */
export function inferNameFromHeader(text) {
  const lines = String(text ?? '').split('\n').map((line) => line.trim()).filter(Boolean);

  for (const line of lines.slice(0, 4)) {
    // A document title sits above the name often enough to be worth stepping
    // over. Everything else that fails below ENDS the search rather than
    // continuing it: once a line is a contact line, a section heading or
    // simply not name-shaped, the header is behind us, and a name taken from
    // further down the page is a guess at a line that is something else.
    // '42 Software Projects' followed by 'Details below' is exactly how
    // scanning on produces a confident wrong answer.
    if (DOCUMENT_TITLE.test(line)) continue;

    if (line.length > 50) break;
    if (CONTACT_TOKEN.test(line)) break;
    if (SECTION_HEADING.test(line)) break;

    // A digit anywhere disqualifies the line. Checked before any cleaning:
    // stripping a leading '42 ' off '42 Software Projects' would leave two
    // capitalised words that look exactly like a name.
    if (/[\p{Nd}]/u.test(line)) break;

    // Strip decoration a header line often carries around the name.
    const cleaned = line.replace(/^[^\p{L}]+|[^\p{L}\p{M}.]+$/gu, '').trim();
    if (cleaned.length < 3 || cleaned.length > 50) break;

    const words = cleaned.split(/\s+/);
    if (words.length < 2 || words.length > 5) break;

    // Every word must read as a name word: letters, with an optional trailing
    // dot for an initial. \p{M} is required as well as \p{L} because Indic
    // scripts carry vowel signs and marks as separate combining code points —
    // the visarga in 'মোঃ' is a mark, not a letter, and a letters-only test
    // rejects every Bangla name that uses one.
    if (!words.every((word) => /^[\p{L}\p{M}][\p{L}\p{M}'-]*\.?$/u.test(word))) break;

    return cleaned;
  }

  return null;
}

/* ── Core ───────────────────────────────────────────────────────────────── */

/**
 * Applies the pattern rules, including the transliterated pass for numerals.
 *
 * The numeral pass works on offsets: the transliterated copy is the same length
 * as the original (both alphabets are one code unit per digit), so a match at
 * [start, end) in the copy is the same span in the original and can be cut out
 * of it directly. Spans are collected and applied right-to-left so earlier
 * offsets stay valid as the string shortens.
 */
function applyRules(input) {
  let text = String(input ?? '');
  const findings = [];

  for (const rule of RULES) {
    let count = 0;

    text = text.replace(rule.pattern, () => {
      count += 1;
      return rule.mask;
    });

    // Second pass for numbers written in Bengali or Arabic-Indic numerals.
    if (rule.digits && hasNonAsciiDigits(text)) {
      const ascii = toAsciiDigits(text);
      const spans = [];
      for (const match of ascii.matchAll(rule.pattern)) {
        spans.push({ start: match.index, end: match.index + match[0].length });
      }
      for (const span of spans.reverse()) {
        text = text.slice(0, span.start) + rule.mask + text.slice(span.end);
        count += 1;
      }
    }

    if (count > 0) findings.push({ rule: rule.name, count });
  }

  return { text, findings };
}

/**
 * @typedef {object} MaskIdentity
 * @property {string|null} [fullName]   the account holder's stored name
 * @property {string|null} [email]      their stored email
 * @property {string|null} [phone]      their stored phone
 * @property {string[]}    [extraNames] any further known names, e.g. parsed
 *                                      from the CV header
 */

/**
 * Masks PII in a single string. Pure.
 *
 * Known values are masked BEFORE the patterns run. A stored phone written in a
 * format no pattern recognises still goes, and a stored email is masked as
 * [EMAIL] by the known pass before the email pattern would have reached it —
 * same placeholder either way, so the ordering is invisible in the output.
 *
 * @param {string} input
 * @param {MaskIdentity} [identity]
 * @returns {string}
 */
export function maskPii(input, identity = {}) {
  return inspectMaskedPii(input, identity).text;
}

/**
 * maskPii with a report of which rules fired. Pure.
 *
 * Findings carry rule names and counts only — never the matched value, which
 * would defeat the whole purpose the moment anything logged them.
 *
 * @param {string} input
 * @param {MaskIdentity} [identity]
 * @returns {{text: string, findings: Array<{rule: string, count: number}>}}
 */
export function inspectMaskedPii(input, identity = {}) {
  let text = String(input ?? '');
  const findings = [];
  const bump = (rule, count) => {
    if (count <= 0) return;
    const existing = findings.find((item) => item.rule === rule);
    if (existing) existing.count += count;
    else findings.push({ rule, count });
  };

  const countOf = (before, after, placeholder) => {
    if (before === after) return 0;
    const occurrences = (value) => value.split(placeholder).length - 1;
    return occurrences(after) - occurrences(before);
  };

  // ── known values first ──
  const knownNames = [identity?.fullName, ...(identity?.extraNames ?? [])]
    .filter((value) => typeof value === 'string' && value.trim());

  for (const variant of expandNameVariants(knownNames)) {
    const before = text;
    text = maskKnownValue(text, variant, MASK.name);
    bump('known-name', countOf(before, text, MASK.name));
  }

  for (const [value, placeholder, label] of [
    [identity?.email, MASK.email, 'known-email'],
    [identity?.phone, MASK.phone, 'known-phone'],
  ]) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const before = text;
    text = maskKnownValue(text, value.trim(), placeholder);
    bump(label, countOf(before, text, placeholder));
  }

  // ── then the shape-based rules ──
  const applied = applyRules(text);
  for (const finding of applied.findings) bump(finding.rule, finding.count);

  // ── then a personal domain built from a known name ──
  const nameTokens = expandNameVariants(knownNames)
    .filter((variant) => !variant.includes(' ') && /^[A-Za-z]{3,}$/.test(variant));
  const domains = maskNameDomains(applied.text, nameTokens);
  bump('name-domain', domains.count);

  // Collapse a run of adjacent identical placeholders left behind by a header
  // line that was entirely contact details. '[PHONE] [PHONE]' from one number
  // split across two rules reads as two numbers, which is a fact about the
  // candidate we did not mean to hand over.
  let collapsed = domains.text;
  for (const placeholder of Object.values(MASK)) {
    const escaped = escapeRegex(placeholder);
    collapsed = collapsed.replace(
      new RegExp(`${escaped}(?:[\\s.,|/–—-]*${escaped})+`, 'g'),
      placeholder
    );
  }

  return { text: collapsed, findings };
}

/**
 * Masks every string value in a parsed structure, returning a deep copy.
 *
 * Operates on parsed objects, never on serialised text: keys are preserved
 * untouched and non-strings are returned as they are, so the layer cannot
 * corrupt structure, escaping or numeric scores.
 *
 * @param {unknown} value
 * @param {MaskIdentity} [identity]
 * @returns {unknown}
 */
export function maskPiiDeep(value, identity = {}) {
  const walk = (node) => {
    if (typeof node === 'string') return maskPii(node, identity);
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      // Keys are structural and never masked; only values are walked.
      return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, walk(child)]));
    }
    return node;
  };
  return walk(value);
}

/**
 * Masks an OpenAI-shape `messages` array in place of a copy.
 *
 * Every message is masked, system prompts included. A system prompt should
 * never carry candidate PII, and if one ever does — a future feature
 * interpolating a name into its instructions — this is what stops it, rather
 * than an assumption about which roles are trusted.
 *
 * @param {Array<{role: string, content: unknown}>} messages
 * @param {MaskIdentity} [identity]
 * @returns {{messages: Array<object>, findings: Array<{rule: string, count: number}>}}
 */
export function maskMessages(messages, identity = {}) {
  const findings = [];
  const bump = (rule, count) => {
    const existing = findings.find((item) => item.rule === rule);
    if (existing) existing.count += count;
    else findings.push({ rule, count });
  };

  const masked = (Array.isArray(messages) ? messages : []).map((message) => {
    if (!message || typeof message !== 'object') return message;
    if (typeof message.content !== 'string') {
      // Multipart content (an array of parts) is masked per string value so a
      // future vision or tool-call payload is covered by the same guarantee.
      return { ...message, content: maskPiiDeep(message.content, identity) };
    }
    const result = inspectMaskedPii(message.content, identity);
    for (const finding of result.findings) bump(finding.rule, finding.count);
    return { ...message, content: result.text };
  });

  return { messages: masked, findings };
}

/**
 * Renders a findings list for a log line.
 *
 * Rule names and counts only, by construction — there is no code path here that
 * can put a matched value into a log.
 *
 * @param {Array<{rule: string, count: number}>} findings
 * @returns {string}
 */
export function formatMaskFindings(findings) {
  if (!findings || findings.length === 0) return 'none';
  return findings.map((finding) => `${finding.rule}=${finding.count}`).join(' ');
}
