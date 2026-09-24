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
 * ── What is masked ──────────────────────────────────────────────────────────
 *
 * Everything the review prompt already tells the model never to reproduce
 * (systemPrompt: "names, addresses, phone numbers, emails, NID or passport
 * numbers, dates of birth, religion, marital status, blood group, or referee
 * contact details"), plus the identifiers a CV carries in other countries:
 *
 *   contact     the candidate's name, email, phone, postal address, profile
 *               URLs, portfolio sites and social handles
 *   identity    national ids, passports, tax and social insurance numbers,
 *               driver licences, and professional register numbers (AHPRA,
 *               BMDC, bar numbers…), each of which a public register maps
 *               back to a name
 *   personal    date of birth, parents' and spouse's names, religion, marital
 *               status, blood group, height and weight
 *   referees    the names and contact details of the people listed as
 *               references, who never agreed to be sent anywhere
 *
 * The audit behind this list — 26 resumes across careers, countries and
 * layouts, measured end to end — is docs/qa/PII_MASK_AUDIT.md.
 *
 * ── The masking/meaning trade ───────────────────────────────────────────────
 *
 * The model still has to do its job on what is left. Interview questions cite
 * employers, feedback quotes project names, the gap engine compares skills
 * against an advertisement, and the international reviewer is told to flag a
 * CV that lists a father's name or a religion. So:
 *
 *   - Nothing matches an employer, a project, a skill, a qualification or its
 *     course code, an employment date or a grade.
 *   - Labelled personal fields keep their LABEL and lose their value:
 *     "Father's Name: [NAME]", "Religion: [PERSONAL]". The model can still
 *     see the field is there and advise on it.
 *   - Numbers are only taken when their shape or their label says what they
 *     are. No rule matches a bare digit run short enough to be a year or a
 *     score.
 *
 * Placeholders keep the document's shape legible:
 *
 *   [NAME] [EMAIL] [PHONE] [ADDRESS] [URL] [ID] [DATE OF BIRTH] [PERSONAL]
 *
 * ── Names need help that regex cannot give ──────────────────────────────────
 *
 * There is no pattern that separates a person's name from an employer's or a
 * university's; "Rahim Chowdhury" and "Rahim Textiles Ltd" are the same shape.
 * So names are matched as KNOWN STRINGS, supplied by the caller: the account
 * holder's stored name, email and phone, the name the server read off the
 * CV's largest type, and a name parsed from the CV's first lines.
 *
 * Matching is tolerant of how the same name is actually written — case,
 * accents ("Gomez" matches "Gómez"), apostrophes and hyphens ("O'Sullivan",
 * "O’Sullivan", "O Sullivan") and spacing. A single word of a name is masked
 * on its own only where it stands as a name: capitalised, and not part of a
 * longer capitalised phrase that is something else, so "Box Hill Institute"
 * survives for a candidate called Grace Hill and "Line Cook" for Daniel Cook.
 *
 * ── Bangla ─────────────────────────────────────────────────────────────────
 *
 * Emails and phone numbers survive a language change because they anchor on
 * '@', on digits and on '+'. Bengali numerals (০১৭...) are matched by running
 * every numeric rule a second time over a transliterated copy and mapping the
 * hits back by index. Bangla field labels (পিতার নাম, জন্ম তারিখ…) are matched
 * tolerantly, because PDF extraction routinely loses a conjunct or a reph from
 * them.
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
  id: '[ID]',
  dob: '[DATE OF BIRTH]',
  personal: '[PERSONAL]',
});

const PLACEHOLDER = /\[(?:NAME|EMAIL|PHONE|ADDRESS|URL|ID|DATE OF BIRTH|PERSONAL)\]/;
const ONLY_PLACEHOLDERS = new RegExp(`^(?:[\\s,.;|/()-]*${PLACEHOLDER.source})+[\\s,.;|/()-]*$`);

/* ── Small helpers ──────────────────────────────────────────────────────── */

const REGEX_META = /[.*+?^${}()|[\]\\]/g;
const escapeRegex = (value) => value.replace(REGEX_META, '\\$&');

const BENGALI_ZERO = 0x09e6; // ০
const ARABIC_INDIC_ZERO = 0x0660; // ٠

function toAsciiDigits(text) {
  let out = '';
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code >= BENGALI_ZERO && code <= BENGALI_ZERO + 9) out += String(code - BENGALI_ZERO);
    else if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) out += String(code - ARABIC_INDIC_ZERO);
    else out += char;
  }
  return out;
}

/** A word matched in any letter case, for patterns that must stay
 *  case-sensitive elsewhere (an identifier's letters are upper case). */
const ci = (word) => escapeRegex(word)
  .split(' ')
  .map((part) => part.replace(/[a-z]/gi, (c) => `[${c.toLowerCase()}${c.toUpperCase()}]`))
  .join('\\s+');

/*
 * What was removed, for callers that ask (inspectMaskedPii's collectValues).
 * Set only for the duration of one synchronous call, so the functions stay
 * pure from the outside. Never logged: the values are the PII itself.
 */
let recorder = null;
const note = (value, placeholder) => {
  if (!recorder || typeof value !== 'string') return;
  // A value may already contain a placeholder from an earlier rule ("Md.
  // Abul Hashem, [PHONE]"); the parts either side of it are what was removed.
  for (const part of value.split(new RegExp(PLACEHOLDER.source, 'g'))) {
    const clean = part.replace(/^[\s,;:|/.-]+|[\s,;:|/-]+$/g, '');
    if (clean) recorder.push({ value: clean, placeholder });
  }
};
/** The placeholder a replacement produced, when it produced exactly one. */
const placeholderIn = (text) => text.match(PLACEHOLDER)?.[0] ?? null;

/**
 * The part of `match` a replacement actually removed. Rules that keep a label
 * or keyword ("Licence No. [ID]") replace only part of what they matched: the
 * text before and after the placeholder is kept, so it is trimmed off here.
 */
function replacedPart(match, replacement) {
  const placeholder = placeholderIn(replacement);
  if (!placeholder) return match;
  const before = replacement.indexOf(placeholder);
  const after = replacement.length - before - placeholder.length;
  return match.slice(before, match.length - after);
}

const hasNonAsciiDigits = (text) => /[০-৯٠-٩]/u.test(text);
const digitCount = (text) => (toAsciiDigits(text).match(/\d/g) ?? []).length;

/**
 * Runs a global regex rule, including the second pass over a transliterated
 * copy for rules that involve digits.
 *
 * Both numeral alphabets are one code unit per digit, so offsets in the copy
 * are offsets in the original and a hit can be cut out directly. Spans are
 * applied right-to-left so earlier offsets stay valid.
 *
 * A rule's `replace` may return the match unchanged to decline it (a shape
 * check that failed); declined matches are not counted.
 */
function runRule(text, rule) {
  let count = 0;
  const replacement = (args) => (typeof rule.replace === 'function' ? rule.replace(...args) : rule.mask);

  let out = text.replace(rule.pattern, (...args) => {
    const next = replacement(args);
    if (next !== args[0]) {
      count += 1;
      note(replacedPart(args[0], next), placeholderIn(next));
    }
    return next;
  });

  if (rule.digits && hasNonAsciiDigits(out)) {
    const ascii = toAsciiDigits(out);
    const spans = [];
    for (const match of ascii.matchAll(rule.pattern)) {
      const next = replacement([...match, match.index, ascii]);
      if (next !== match[0]) spans.push({ start: match.index, end: match.index + match[0].length, next });
    }
    for (const span of spans.reverse()) {
      note(replacedPart(out.slice(span.start, span.end), span.next), placeholderIn(span.next));
      out = out.slice(0, span.start) + span.next + out.slice(span.end);
      count += 1;
    }
  }

  return { text: out, count };
}

/* ── Email and online identity ──────────────────────────────────────────── */

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

/**
 * Mail providers whose domain says nothing about the person. Any OTHER domain
 * in the candidate's email is their own (a business or portfolio site), and a
 * bare mention of it elsewhere in the CV is masked too.
 */
const SHARED_MAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com', 'outlook.com', 'hotmail.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com', 'proton.me', 'pm.me',
  'gmx.com', 'gmx.net', 'zoho.com', 'yandex.com', 'mail.com', 'qq.com', '163.com', '126.com', 'fastmail.com',
  'tutanota.com', 'hey.com', 'rediffmail.com', 'xtra.co.nz', 'bigpond.com', 'optusnet.com.au', 'btinternet.com',
  'sky.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.com.au', 'hotmail.co.uk', 'outlook.com.au',
]);

// Hosts where the path is a person: a profile, a channel, a portfolio.
const PROFILE_HOSTS = [
  'linkedin\\.com', 'github\\.com', 'gitlab\\.com', 'twitter\\.com', 'x\\.com', 'facebook\\.com', 'fb\\.com',
  'instagram\\.com', 'behance\\.net', 'dribbble\\.com', 'medium\\.com', 'stackoverflow\\.com', 'kaggle\\.com',
  'bitbucket\\.org', 'youtube\\.com', 'youtu\\.be', 'soundcloud\\.com', 'tiktok\\.com', 'linktr\\.ee',
  'muckrack\\.com', 'vimeo\\.com', '(?:open\\.)?spotify\\.com', 'threads\\.net', 'pinterest\\.com',
  'artstation\\.com', 'deviantart\\.com', 'flickr\\.com', 'reddit\\.com', 't\\.me', 'wa\\.me', 'about\\.me',
  'researchgate\\.net', 'orcid\\.org', 'scholar\\.google\\.com', 'academia\\.edu', 'upwork\\.com', 'fiverr\\.com',
  'freelancer\\.com', 'wellfound\\.com', 'angel\\.co', 'xing\\.com', 'leetcode\\.com', 'hackerrank\\.com',
  'codepen\\.io', 'dev\\.to', 'hashnode\\.com', 'telegram\\.me', 'bandcamp\\.com', 'mixcloud\\.com',
].join('|');

// Hosts where the SUBDOMAIN is a person.
const PERSONAL_SITE_HOSTS = [
  'github\\.io', 'gitlab\\.io', 'vercel\\.app', 'netlify\\.app', 'herokuapp\\.com', 'wordpress\\.com',
  'blogspot\\.com', 'myportfolio\\.com', 'wixsite\\.com', 'squarespace\\.com', 'weebly\\.com', 'carrd\\.co',
  'notion\\.site', 'substack\\.com', 'bandcamp\\.com', 'tumblr\\.com', 'webflow\\.io', 'framer\\.website',
  'pages\\.dev', 'web\\.app', 'firebaseapp\\.com', 'format\\.com', 'cargo\\.site', 'journoportfolio\\.com',
  'contently\\.com', 'jimdosite\\.com', 'godaddysites\\.com', 'site123\\.me',
].join('|');

const URL_RULES = [
  {
    name: 'profile-url',
    pattern: new RegExp(`\\b(?:https?:\\/\\/)?(?:www\\.)?(?:${PROFILE_HOSTS})\\/[A-Za-z0-9@._~#%/?=&-]*[A-Za-z0-9_]`, 'gi'),
    mask: MASK.url,
  },
  {
    name: 'personal-site',
    pattern: new RegExp(`\\b(?:https?:\\/\\/)?(?:www\\.)?[A-Za-z0-9-]+\\.(?:${PERSONAL_SITE_HOSTS})(?:\\/[A-Za-z0-9@._~#%/-]*)?`, 'gi'),
    mask: MASK.url,
  },
  {
    name: 'handle',
    // A bare social handle. Emails are gone by now, so any remaining '@'
    // followed by a handle-shaped token is one. A trailing dot is sentence
    // punctuation, not part of the handle.
    pattern: /(?<![\p{L}\p{N}_@./])@[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?/gu,
    mask: MASK.url,
  },
];

/* ── Phones ─────────────────────────────────────────────────────────────── */

const PHONE_RULES = [
  {
    name: 'phone-bd',
    digits: true,
    // BD mobile is 11 digits: 01 + operator digit (3-9) + 8 more, or the same
    // without the leading 0 behind +880. Requiring the operator prefix, plus
    // digit boundaries on both sides, is what stops a year, a GPA or a score
    // matching. Groupings people actually write: '01712-345678',
    // '017 1234 5678', '0171-2345678', '+880 1712-345678'.
    pattern: /(?<![\d+])(?:\+?880[\s.-]?1[3-9]\d{2}[\s.-]?\d{6}|01[3-9](?:\d{2}[\s.-]?\d{6}|\d[\s.-]?\d{7}|[\s.-]?\d{4}[\s.-]?\d{4}))(?!\d)/g,
    mask: MASK.phone,
  },
  {
    name: 'phone-au',
    digits: true,
    // Australian mobile (04XX XXX XXX / +61 4XX XXX XXX) and landline with an
    // area code ((02) 9XXX XXXX / +61 2 9XXX XXXX).
    pattern: /(?<![\d+])(?:\+?61[\s.-]?4\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|04\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\(0[2-8]\)[\s.-]?\d{4}[\s.-]?\d{4}|\+?61[\s.-]?[2-8][\s.-]?\d{4}[\s.-]?\d{4}|0[2-8][\s.-]?\d{4}[\s.-]?\d{4})(?!\d)/g,
    mask: MASK.phone,
  },
  {
    name: 'phone-international',
    digits: true,
    // A literal '+' followed by 8-18 digit/separator characters. The leading
    // '+' is what makes this safe — bare digit runs are never matched here.
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
    name: 'phone-trunk',
    digits: true,
    // A national number written with its trunk '0' and grouped: UK
    // '07700 900 372', Philippines and Nigeria '0917 123 4567', Mumbai
    // '022 2634 5678', NZ '(09) 555 0876'. The leading 0, at least one
    // separator and 9-12 digits in total are all required. No year starts
    // with 0, and dates ('01-01-1988') have too few digits.
    // A group joined by a dash to digits before it is the tail of a longer
    // identifier ('12-01-73-01234'), left for the dashed-id rule.
    pattern: /(?<![\p{L}\p{N}+.\/])(?<!\d-)(?:\(0\d{1,4}\)|0\d{1,4})(?:[ .-]\d{2,8}){1,3}(?![\p{N}\/-])/gu,
    replace: (match) => {
      const n = digitCount(match);
      return n >= 9 && n <= 12 ? MASK.phone : match;
    },
  },
];

/** Labels that introduce a phone number. */
const PHONE_LABELS = [
  'mobile', 'mob', 'cell', 'cellphone', 'cell phone', 'phone', 'ph', 'tel', 'telephone', 'contact',
  'contact no', 'contact number', 'whatsapp', 'viber', 'imo', 'signal', 'home', 'work', 'office', 'residence',
  'landline', 'fax', 'alt', 'alternative', 'alternate', 'alternative mobile', 'alternate mobile', 'alt mobile',
  'alternative phone', 'alternative no', 'local', 'emergency contact', 'মোবাইল', 'ফোন', 'মোবাঃ',
];

/**
 * Masks any number after a phone label, in any grouping: "Local: 9123 4567",
 * "Alternative Mobile: 017 1122 3344". Only up to where the field ends — the
 * next label or a ' | ' — so a registration number later on the same contact
 * line is left to the rules that know what it is.
 */
function applyLabelledPhones(text, bump) {
  const pattern = new RegExp(`(?:^|(?<=[\\n|(,•])|(?<=[^\\S\\n]))(?:${PHONE_LABELS.map(en).join('|')})${LABEL_QUALIFIER}(?:(${FIELD_SEPARATOR})|[^\\S\\n]*\\n)`, 'giu');
  let out = '';
  let cursor = 0;
  let count = 0;
  const scan = toAsciiDigits(text);
  for (const match of scan.matchAll(pattern)) {
    const from = match.index + match[0].length;
    if (from < cursor) continue;
    const end = valueEnd(scan, from, 120);
    const value = text.slice(from, end);
    const masked = toAsciiDigits(value).replace(/\+?\(?\d[\d\s().\/-]{5,}\d/g, (run) => {
      if (digitCount(run) < 7) return run;
      note(run, MASK.phone);
      return MASK.phone;
    });
    if (!masked.includes(MASK.phone)) continue;
    // Keep the original text (and numerals) wherever nothing was masked.
    out += text.slice(cursor, from) + mergeMasked(value, masked);
    cursor = end;
    count += (masked.match(/\[PHONE\]/g) ?? []).length;
  }
  bump('phone-labelled', count);
  return out + text.slice(cursor);
}

/** Rebuilds `original` with the placeholder runs from its masked ASCII copy. */
function mergeMasked(original, masked) {
  // Both strings agree outside the placeholders, and digits are one code unit
  // in either alphabet, so walking them in step recovers the original text.
  let out = '';
  let i = 0;
  let j = 0;
  while (j < masked.length) {
    if (masked.startsWith(MASK.phone, j)) {
      // Skip the original characters the placeholder stands for.
      const rest = masked.slice(j + MASK.phone.length);
      const resume = rest.length ? original.length - rest.length : original.length;
      out += MASK.phone;
      i = resume;
      j += MASK.phone.length;
      continue;
    }
    out += original[i] ?? '';
    i += 1;
    j += 1;
  }
  return out;
}

/* ── Identifiers ────────────────────────────────────────────────────────── */

/**
 * An identifier value: an optional upper-case letter prefix attached to the
 * digits, then digit-led groups joined by '.', '-', '/' or a single space,
 * then an optional check letter. Covers 'A01234567', 'NMW0001234567',
 * 'D4123-56789-01234', 'R.23456', 'WC-1234567', '4521 8876 3310'.
 *
 * Case-sensitive on purpose, and the prefix may not be followed by a space:
 * otherwise a word is a "prefix" — "Jan 2019", "Check 1234567" — and the
 * word goes with the number.
 */
const ID_VALUE = '(?:[A-Z]{1,5}(?:[.\\-/]\\n?)?)?\\d[\\dA-Z]*(?:[.\\-/]\\d[\\dA-Z]*|[^\\S\\n]\\d[\\dA-Z]*)*(?:[^\\S\\n][A-Z](?![\\p{L}\\p{N}]))?';

const looksLikeDateOrYear = (value) => /^(?:19|20)\d{2}$/.test(value)
  || /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(value)
  || /^(?:19|20)\d{2}\s*[-–]\s*(?:19|20)\d{2}$/.test(value);

/** Masks the trailing ID value of a match, keeping everything before it. */
function maskTrailingId(minDigits, minDigitsWithLetters) {
  return (match, value) => {
    if (!value) return match;
    const trimmed = value.trim();
    const digits = digitCount(trimmed);
    const hasLetters = /[A-Za-z]/.test(trimmed);
    const enough = digits >= minDigits || (hasLetters && digits >= minDigitsWithLetters);
    if (!enough || looksLikeDateOrYear(trimmed)) return match;
    return match.slice(0, match.length - value.length) + MASK.id;
  };
}

/** Words that name an identifier or a register number, in any case. */
const ID_KEYWORDS = [
  'nid', 'nric', 'fin', 'pan', 'aadhaar', 'aadhar', 'ssn', 'tfn', 'passport', 'licence', 'license', 'registration',
  'registered', 'reg', 'membership', 'member', 'accreditation', 'ahpra', 'bmdc', 'coren', 'icai', 'trec', 'wwc',
  'wwcc', 'ndis', 'dbs', 'atpl', 'cpl', 'ppl', 'dl', 'white card', 'blue card', 'police check', 'worker screening',
  'id', 'identity', 'insurance', 'roll', 'enrolment', 'enrollment', 'employee id', 'staff id', 'badge', 'permit',
  'cnic', 'nic', 'nicop', 'ntn', 'tin', 'abn', 'acn', 'ein', 'uen', 'sin', 'bsn', 'pps', 'ic', 'mykad', 'kra', 'nin',
  'bvn', 'uid', 'iqama', 'citizenship', 'smart card', 'voter',
].map(ci).join('|');
const NUMERO = ['no', 'nr', 'num', 'number'].map(ci).join('|');

const ID_RULES = [
  {
    name: 'national-id-shape',
    // Shapes distinctive enough to need no label: Singapore NRIC/FIN, AHPRA
    // registration, Indian PAN, UK National Insurance, US SSN.
    pattern: /\b(?:[STFGM]\d{7}[A-Z]|[A-Z]{3}\d{10}|[A-Z]{5}\d{4}[A-Z]|[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z] ?\d{2} ?\d{2} ?\d{2} ?[A-D]|\d{3}-\d{2}-\d{4})\b/g,
    mask: MASK.id,
  },
  {
    name: 'dashed-id',
    digits: true,
    // Digit groups joined by dashes, eleven digits or more: Pakistan CNIC
    // '35202-1234567-1', Emirates ID '784-1990-1234567-1', a Nepali
    // citizenship number '12-01-73-01234'. Dates have eight digits at most,
    // and phones were masked before this runs.
    pattern: /(?<![\p{L}\p{N}-])\d{1,6}(?:-\d{1,8}){2,4}(?![\p{L}\p{N}-])/gu,
    replace: (match) => (digitCount(match) >= 11 ? MASK.id : match),
  },
  {
    name: 'national-id-digits',
    digits: true,
    // A bare 9-18 digit run: Bangladesh NID (10, 13 or 17 digits), a South
    // African ID (13), a DBS certificate (12). Phones were masked before this
    // runs, so nothing legitimate in a CV is left at this length. Digits
    // joined to letters are left to the shape rule above ('PHY0001987654').
    pattern: /(?<![\p{L}\d+.,])\d{9,18}(?![\p{L}\d.,])/gu,
    mask: MASK.id,
  },
  {
    name: 'numbered-id',
    digits: true,
    // "No. 154321", "Reg. No. A-12345", "License #0654321", "card no. 4417".
    // A numero sign followed straight away by a value with four or more
    // digits is an identifier whatever it numbers.
    pattern: new RegExp(`(?<![\\p{L}])(?:${NUMERO}|নং|নম্বর)(?![\\p{L}])\\.?\\s*[:.]?\\s*(${ID_VALUE})|#[^\\S\\n]?(${ID_VALUE})`, 'gu'),
    replace: (match, a, b) => maskTrailingId(4, 4)(match, a ?? b),
  },
  {
    name: 'keyword-id',
    digits: true,
    // An identifier word, up to five words of description, then the value:
    // "NSW Driver Licence 12345678", "NDIS Worker Screening Check 1234567",
    // "COREN Registered (R.23456)", "Enhanced DBS on the Update Service
    // (certificate 001234567890)". Five digits at least (four with letters),
    // so a year after "Registered Nurse since" is never taken. A PDF wraps
    // lines anywhere, so the description and the value may be split across
    // one: "NDIS Worker Screening\nCheck 1234567".
    // Description words never include a placeholder: a number already
    // masked ends the description rather than being stepped over.
    pattern: new RegExp(`\\b(?:${ID_KEYWORDS})\\b(?:\\s+[^\\s\\d\\[]{1,24}){0,5}?\\s*[:(]?\\s*(${ID_VALUE})`, 'gu'),
    replace: maskTrailingId(5, 4),
  },
];

/* ── Labelled personal fields ───────────────────────────────────────────── */

/**
 * Builds a pattern for a Bangla label that still matches after PDF extraction
 * has damaged it. Text-layer extraction of Bangla routinely drops a reph, the
 * second half of a conjunct, or a vowel sign, and can leave a stray space
 * between clusters — "জন্ম তারিখ" arrives as "জ তারিখ", "ধর্ম" as "ধম". So
 * every vowel sign is optional, a reph is optional, a conjunct may be reduced
 * to its first consonant or vanish, and a space may appear between clusters.
 * The labels are only ever matched with a following ':' (see FIELD_RULES), so
 * the tolerance cannot fire in running text.
 */
function tolerantBangla(label) {
  const SIGNS = '[\\u09BE-\\u09CC\\u09D7\\u0981-\\u0983\\u09BC]*';
  const C = '[\\u0995-\\u09B9\\u09CE\\u09DC-\\u09DF]\\u09BC?';
  const clusterRe = new RegExp(`(\\u09B0\\u09CD(?=${C}))?(${C}(?:\\u09CD${C})*)(${SIGNS})|([\\u0985-\\u0994])(${SIGNS})|(\\s+)|(.)`, 'gu');
  let out = '';
  let wordStart = true;
  // In a label of two words or more the rest is distinctive enough for the
  // first conjunct to go missing too ('স্বামীর নাম' arrives as 'ামীর নাম').
  const multiWord = /\s/.test(label.trim());
  for (const m of label.matchAll(clusterRe)) {
    const [, reph, cluster, , vowel, , space, other] = m;
    if (cluster) {
      if (reph) out += '(?:\\u09B0\\u09CD)?';
      const first = cluster.match(new RegExp(C, 'u'))[0];
      // A conjunct may lose its second half, or vanish entirely — except at
      // the start of a word, where at least its first consonant must be
      // there. Otherwise 'গ্রাম' would match any 'াম' in the text.
      let body;
      if (!cluster.includes('্')) body = escapeRegex(cluster);
      else if (wordStart && !multiWord) body = `(?:${escapeRegex(cluster)}|${escapeRegex(first)})`;
      else body = `(?:${escapeRegex(cluster)}|${escapeRegex(first)})?`;
      out += `[\\u09BF\\u09C7\\u09C8]?${body}${SIGNS}[^\\S\\n]?`;
      wordStart = false;
    } else if (vowel) {
      out += `${escapeRegex(vowel)}${SIGNS}[^\\S\\n]?`;
      wordStart = false;
    } else if (space) {
      out += '[^\\S\\n]*';
      wordStart = true;
    } else if (other) {
      out += escapeRegex(other);
    }
  }
  return out;
}

/** An English label with flexible apostrophes, spacing and dotted abbreviations. */
const en = (label) => label
  .split(' ')
  .map((word) => {
    // "Father's Name", "Fathers Name" and "Father Name" are all written.
    const possessive = word.endsWith("'s");
    const stem = (possessive ? word.slice(0, -2) : word)
      .split("'")
      .map((part) => part.replace(/\./g, '\\.?'))
      .join("['’]?");
    return possessive ? `${stem}(?:['’]?s)?` : stem;
  })
  .join('[^\\S\\n]+');

/**
 * Field labels whose VALUE is personal. Each value is masked and the label is
 * kept. `digitsRequired` means the value is only taken if it carries that many
 * digits — a licence line saying "Code EC (C1)" is a licence class, not a
 * number. `multiline` lets an address run onto a continuation line.
 * `lineStart` confines a label that is also an ordinary word ("Name") to the
 * start of a line.
 */
const FIELD_RULES = [
  {
    name: 'field-dob',
    mask: MASK.dob,
    labels: [
      en('date of birth'), en('birth date'), en('date-of-birth'), 'd\\.?[^\\S\\n]?o\\.?[^\\S\\n]?b\\.?', en('born'),
      en('born on'), en('birthday'), tolerantBangla('জন্ম তারিখ'), tolerantBangla('জন্মতারিখ'),
    ],
  },
  { name: 'field-age', mask: MASK.personal, labels: [en('age')] },
  {
    name: 'field-family',
    mask: MASK.name,
    labels: [
      en("father's name"), en("mother's name"), en("fathers name"), en("mothers name"), en("spouse's name"),
      en("husband's name"), en("wife's name"), en("guardian's name"), en("parents' names"), en("parent's name"),
      en('name of father'), en('name of mother'), en('father'), en('mother'), en('spouse'), en('husband'),
      en('wife'), en('guardian'), '[SDW]\\/O', en('brother'), en('sister'), en('son'), en('daughter'),
      en("brother's name"), en("sister's name"), en('uncle'), en('aunt'), en('cousin'), en('relative'),
      en('next of kin'), en('nominee'), en("nominee's name"), en('emergency contact person'), en('contact person'),
      en('c/o'), en('care of'), tolerantBangla('পিতার নাম'), tolerantBangla('মাতার নাম'),
      tolerantBangla('স্বামীর নাম'), tolerantBangla('পিতা'), tolerantBangla('মাতা'), tolerantBangla('ভাই'),
      tolerantBangla('বোন'), tolerantBangla('নমিনি'), tolerantBangla('অভিভাবক'),
    ],
  },
  {
    name: 'field-personal',
    mask: MASK.personal,
    labels: [
      en('religion'), en('marital status'), en('civil status'), en('blood group'), en('blood type'), en('height'),
      en('weight'), en('sex'), en('gender'), en('state of origin'), en('lga'), en('local government area'),
      en('caste'), en('ethnicity'), en('race'), en('date of issue'), en('date of expiry'), en('issue date'),
      en('expiry date'), en('place of issue'), en('place of birth'), en('birthplace'), en('birth place'),
      en('hometown'), en('home town'), en('native place'), en('native district'), en('domicile'),
      en('province of domicile'), en('tribe'), en('ethnic group'), en('arm reach'), en('reach'), en('shoe size'),
      en('dress size'), en('uniform size'), en('chest'), en('waist'), en('bmi'), en('eyesight'), en('complexion'),
      en('hair colour'), en('hair color'), en('eye colour'), en('eye color'), tolerantBangla('ধর্ম'), tolerantBangla('বৈবাহিক অবস্থা'),
      tolerantBangla('রক্তের গ্রুপ'), tolerantBangla('লিঙ্গ'), tolerantBangla('উচ্চতা'), tolerantBangla('ওজন'),
    ],
  },
  {
    name: 'field-id',
    mask: MASK.id,
    digitsRequired: 4,
    idToken: true,
    labels: [
      en('national id card no'), en('national id card number'), en('national id no'), en('national id number'),
      en('national id card'), en('national id'), en('nid no'), en('nid number'), en('nid'), en('nric'), en('fin'),
      en('passport no'), en('passport number'), en('passport'), en('pan no'), en('pan card'), en('pan'),
      en('aadhaar no'), en('aadhaar number'), en('aadhaar'), en('aadhar'), en('ssn'), en('social security no'),
      en('social security number'), en('tfn'), en('tax file number'), en('national insurance no'),
      en('national insurance number'), en('national insurance'), en('ni no'), en('ni number'), en('id no'),
      en('id number'), en('id card'), en('id'), en('identity card no'), en('identity card'), en('identity no'),
      en('birth registration no'), en('birth registration number'), en('birth certificate no'),
      en("driver's licence no"), en("driver's licence"), en("driver's license"), en('driving licence'),
      en('driving license'), en('licence no'), en('license no'), en('registration no'), en('reg. no'),
      en('ahpra'), en('bmdc reg'), en('bmdc'), en('membership no'), en('cnic'), en('cnic no'), en('nic'),
      en('nic no'), en('nicop'), en('ntn'), en('tin'), en('tin no'), en('abn'), en('acn'), en('ein'), en('uen'),
      en('gst no'), en('vat no'), en('sin'), en('bsn'), en('pps no'), en('pps number'), en('ic'), en('ic no'),
      en('ic number'), en('mykad'), en('kra pin'), en('nin'), en('bvn'), en('smart card no'), en('smart card'),
      en('voter id'), en('uid'), en('uid no'), en('emirates id'), en('iqama'), en('iqama no'), en('civil id'),
      en('citizenship no'), en('citizenship number'), en('citizenship certificate no'),
      tolerantBangla('জাতীয় পরিচয়পত্র নং'), tolerantBangla('জাতীয় পরিচয়পত্র নম্বর'),
      tolerantBangla('জাতীয় পরিচয়পত্র'), tolerantBangla('এনআইডি'), tolerantBangla('পাসপোর্ট নং'),
      tolerantBangla('পাসপোর্ট'), tolerantBangla('জন্ম নিবন্ধন নং'),
    ],
  },
  {
    name: 'field-address',
    mask: MASK.address,
    multiline: true,
    labels: [
      en('present address'), en('permanent address'), en('mailing address'), en('home address'),
      en('residential address'), en('current address'), en('postal address'), en('contact address'),
      en('address'), en('village'), en('vill'), en('p.o'), en('post office'), en('post'), en('p.s'),
      en('police station'), en('thana'), en('upazila'), en('upozila'), en('union'), en('ward'), en('dist'),
      en('district'), en('postcode'), en('post code'), en('zip'), en('zip code'), en('pin code'),
      tolerantBangla('বর্তমান ঠিকানা'), tolerantBangla('স্থায়ী ঠিকানা'), tolerantBangla('ঠিকানা'),
      tolerantBangla('গ্রাম'), tolerantBangla('ডাকঘর'), tolerantBangla('থানা'), tolerantBangla('উপজেলা'),
      tolerantBangla('জেলা'),
    ],
  },
  {
    name: 'field-handle',
    mask: MASK.url,
    token: true,
    labels: [
      en('skype'), en('skype id'), en('telegram'), en('wechat'), en('wechat id'), en('line id'), en('discord'),
      en('instagram'), en('ig'), en('insta'), en('twitter'), en('tiktok'), en('facebook'), en('fb'), en('website'),
      en('web'), en('portfolio'), en('blog'), en('homepage'), en('youtube'), en('soundcloud'),
      en('spotify'), en('snapchat'),
    ],
  },
  {
    name: 'field-name',
    mask: MASK.name,
    lineStart: true,
    labels: [
      en('name'), en('full name'), en("candidate's name"), en("applicant's name"), en('name of candidate'),
      en('name of applicant'), en('referee'), en("referee's name"), en('name of referee'), tolerantBangla('নাম'),
    ],
  },
];

/**
 * Labels that end a field without being masked themselves. In a flattened
 * table ("Religion : Islam Nationality : Bangladeshi") the next label is the
 * only place a value can be seen to stop.
 */
const TERMINATOR_LABELS = [
  en('nationality'), en('languages'), en('language'), en('email'), en('e-mail'), en('linkedin'), en('github'),
  en('hobbies'), en('interests'), en('citizenship'), en('visa'), en('visa status'), en('work rights'),
  tolerantBangla('জাতীয়তা'), tolerantBangla('ইমেইল'), ...PHONE_LABELS.map(en),
];

/** A line that is a section heading. It ends any field running into it. */
const SECTION_HEADING = new RegExp(`^(?:${[
  'summary', 'professional summary', 'career summary', 'profile', 'professional profile', 'about', 'about me',
  'objective', 'career objective', 'experience', 'work experience', 'professional experience', 'employment',
  'employment history', 'job experience', 'work history', 'education', 'educational qualifications?',
  'academic qualifications?', 'qualifications', 'training', 'trainings?', 'skills', 'special skills', 'key skills',
  'core skills', 'technical skills', 'tools', 'languages?', 'licen[cs]es(?: & tickets)?', 'certifications?',
  'certificates', 'projects', 'achievements', 'awards', 'publications', 'interests', 'hobbies', 'references?',
  'referees?', 'professional references', 'declaration', 'personal information', 'personal details',
  'personal data', 'personal particulars', 'personal', 'contact', 'contact details', 'contact information',
  'registration', 'bar admissions', 'flying experience', 'teaching', 'performance', 'passport details',
  'volunteering', 'extra-curricular activities', 'memberships', 'licences and tickets',
].join('|')})[^\\S\\n]*:?$`, 'iu');

const FIELD_SEPARATOR = '[^\\S\\n]*(?:[:：]|[-–—](?=[^\\S\\n]))[^\\S\\n]*';
const LABEL_QUALIFIER = '(?:[^\\S\\n]*\\([^)\\n]{1,24}\\))?';

const ALL_LABELS = [...FIELD_RULES.flatMap((rule) => rule.labels), ...TERMINATOR_LABELS];
// The next field's label inside a value: it follows whitespace or a pipe,
// never the middle of a word.
const ANY_LABEL_AHEAD = new RegExp(`(?:[^\\S\\n]|\\|)(?:${ALL_LABELS.join('|')})${FIELD_SEPARATOR}`, 'iu');
const LINE_STARTS_WITH_LABEL = new RegExp(`^[^\\S\\n]*(?:${ALL_LABELS.join('|')})(?:${FIELD_SEPARATOR}|[^\\S\\n]*$)`, 'iu');

/** Where a same-line field value stops. */
function valueEnd(text, from, limit) {
  let end = text.indexOf('\n', from);
  if (end < 0) end = text.length;
  end = Math.min(end, from + limit);
  const segment = text.slice(from, end);
  const pipe = segment.search(/[^\S\n]\|[^\S\n]/);
  let cut = pipe >= 0 ? pipe : segment.length;
  // The next label in a flattened table.
  const next = segment.slice(0, cut).search(ANY_LABEL_AHEAD);
  if (next >= 0) cut = Math.min(cut, next);
  return from + cut;
}

/**
 * The identifier at the start of a field value: an optional letter prefix
 * (which after a label may be spaced, as in 'QQ 12 34 56 C'), then digit-led
 * groups, in either numeral alphabet.
 */
const ID_TOKEN = /^[^\S\n]*((?:[A-Za-z]{1,5}[ .\-/]?)?[\p{Nd}][\p{L}\p{Nd}./\-]*(?:[^\S\n][\p{Nd}][\p{L}\p{Nd}./\-]*)*(?:[^\S\n][A-Z](?![\p{L}\p{N}]))?)/u;

const looksAddressy = (line) => /\d|,|[A-Z]\d[A-Z]|\b[A-Z]{2}\b/.test(line);

/**
 * Masks the value of every labelled field. The value is either on the same
 * line as the label ("Religion : Islam") or, when the label stands alone on a
 * line (a sidebar's "ADDRESS"), on the lines below it.
 */
function applyFieldRules(text, bump) {
  let out = text;

  for (const rule of FIELD_RULES) {
    const start = rule.lineStart ? '(?:^|(?<=\\n)|(?<=\\|[^\\S\\n]))' : '(?:^|(?<=[\\n|(,•])|(?<=[^\\S\\n]))';
    // A label may end in an abbreviation's dot ("BMDC REG.", "D.O.B.") or
    // carry a bracketed qualifier, as government forms do: "Name (in
    // English):", "Present Address (in Bangla):".
    const pattern = new RegExp(`${start}(?:${rule.labels.join('|')})\\.?${LABEL_QUALIFIER}(?:(${FIELD_SEPARATOR})|([^\\S\\n]*:?[^\\S\\n]*\\n))`, 'giu');
    let count = 0;
    let result = '';
    let cursor = 0;

    for (const match of out.matchAll(pattern)) {
      if (match.index < cursor) continue;
      const labelEnd = match.index + match[0].length;
      const sameLine = match[1] !== undefined;
      // A label with its value on the next line must be the whole line
      // ("ADDRESS" in a sidebar). A label word that merely ends a wrapped
      // line of prose ("…update your address") must not claim the line below.
      if (!sameLine && !/(?:^|\n)[^\S\n]*$/.test(out.slice(0, match.index))) continue;
      const spans = [];

      if (sameLine) {
        const end = valueEnd(out, labelEnd, rule.multiline ? 220 : 90);
        spans.push([labelEnd, end]);
        // An address that wraps: follow it onto a line that plainly continues it.
        if (rule.multiline) {
          let lineEnd = end;
          for (let k = 0; k < 2; k++) {
            if (out[lineEnd] !== '\n') break;
            const nextEnd = out.indexOf('\n', lineEnd + 1) < 0 ? out.length : out.indexOf('\n', lineEnd + 1);
            const nextLine = out.slice(lineEnd + 1, nextEnd);
            const prevLine = out.slice(out.lastIndexOf('\n', lineEnd - 1) + 1, lineEnd);
            const unfinished = /[,:\-–]\s*$/.test(prevLine);
            if (!nextLine.trim() || SECTION_HEADING.test(nextLine.trim()) || LINE_STARTS_WITH_LABEL.test(nextLine)) break;
            if (!unfinished && !looksAddressy(nextLine)) break;
            if (nextLine.length > 80) break;
            spans.push([lineEnd + 1, nextEnd]);
            lineEnd = nextEnd;
          }
        }
      } else {
        // Label alone on its line: the value is below it.
        let lineStart = labelEnd;
        const maxLines = rule.multiline ? 3 : 1;
        for (let k = 0; k < maxLines && lineStart < out.length; k++) {
          const lineEnd = out.indexOf('\n', lineStart) < 0 ? out.length : out.indexOf('\n', lineStart);
          const line = out.slice(lineStart, lineEnd);
          if (!line.trim() || SECTION_HEADING.test(line.trim()) || LINE_STARTS_WITH_LABEL.test(line)) break;
          if (k > 0 && !looksAddressy(line)) break;
          spans.push([lineStart, lineEnd]);
          lineStart = lineEnd + 1;
        }
      }

      const kept = [];
      for (const [s, e] of spans) {
        let value = out.slice(s, e);
        if (rule.token) {
          // A handle or a site: one token, not the rest of the line.
          const token = value.match(/^\s*(\S+)/);
          if (!token) continue;
          const tokenEnd = s + token.index + token[0].length;
          value = out.slice(s, tokenEnd);
          if (!value.trim() || ONLY_PLACEHOLDERS.test(value)) continue;
          kept.push([s + (value.length - value.trimStart().length), tokenEnd]);
          continue;
        }
        if (!value.trim() || ONLY_PLACEHOLDERS.test(value.trim())) continue;
        if (rule.idToken) {
          // An identifier, not the rest of the line: "DK0012345L00001
          // (Professional, Heavy). Valid to 2029." keeps its description.
          const id = value.match(ID_TOKEN);
          if (!id || digitCount(id[1]) < rule.digitsRequired) continue;
          const idStart = s + id.index + id[0].length - id[1].length;
          kept.push([idStart, idStart + id[1].length]);
          continue;
        }
        if (rule.digitsRequired && digitCount(value) < rule.digitsRequired) continue;
        const lead = value.length - value.trimStart().length;
        const trail = value.length - value.trimEnd().length;
        kept.push([s + lead, e - trail]);
      }
      if (kept.length === 0) continue;

      for (const [s, e] of kept) {
        note(out.slice(s, e), rule.mask);
        result += out.slice(cursor, s) + rule.mask;
        cursor = e;
        count += 1;
      }
    }

    out = result + out.slice(cursor);
    bump(rule.name, count);
  }

  // "S/O Suresh Mehta" and the like, written without a colon.
  const relation = runRule(out, {
    pattern: /\b([SDW]\/O)\.?[^\S\n]+((?:(?:Late|Md|Mr|Mst|Mrs|Dr)\.?[^\S\n]+)*[\p{Lu}][\p{L}'’.-]+(?:[^\S\n]+[\p{Lu}][\p{L}'’.-]+){0,3})/gu,
    replace: (match, rel) => `${rel} ${MASK.name}`,
  });
  bump('field-family', relation.count);
  return relation.text;
}

/* ── Addresses ──────────────────────────────────────────────────────────── */

const STREET_TYPES = [
  'Street', 'St', 'Road', 'Rd', 'Avenue', 'Ave', 'Lane', 'Ln', 'Boulevard', 'Blvd', 'Drive', 'Dr', 'Court', 'Ct',
  'Place', 'Pl', 'Terrace', 'Tce', 'Crescent', 'Cres', 'Parade', 'Pde', 'Highway', 'Hwy', 'Way', 'Close', 'Cl',
  'Circuit', 'Cct', 'Grove', 'Gr', 'Square', 'Sq', 'Walk', 'Row', 'Mews', 'Esplanade', 'Esp', 'Parkway', 'Pkwy',
  'Loop', 'Rise', 'Trail', 'Track', 'Alley', 'Gardens', 'Gdns', 'Crossing', 'Promenade', 'Quay', 'Wharf', 'Heights',
].join('|');

// Words in a street name: capitalised, an ordinal ('57th'), or a single
// initial. Up to three before the street type.
const STREET_WORD = "(?:[A-Z][A-Za-z'’]*|\\d{1,3}(?:st|nd|rd|th))";

const AU_POSTCODE_RANGES = {
  NSW: [[1000, 2599], [2619, 2899], [2921, 2999]],
  ACT: [[200, 299], [2600, 2618], [2900, 2920]],
  VIC: [[3000, 3999], [8000, 8999]],
  QLD: [[4000, 4999], [9000, 9999]],
  SA: [[5000, 5799], [5800, 5999]],
  WA: [[6000, 6797], [6800, 6999]],
  TAS: [[7000, 7799], [7800, 7999]],
  NT: [[800, 899], [900, 999]],
};

const US_STATES = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC';

const INSTITUTION_WORD = /^(?:TAFE|University|Institute|College|School|Academy|Polytechnic|Hospital|Council|Government|Department|Health|Services?|Police|Ambulance|Fire)$/i;

/**
 * Address anchors: shapes that are an address on their own. Each is then
 * widened to the whole address around it (see widenAddress).
 */
const ADDRESS_ANCHORS = [
  {
    name: 'address-bd',
    digits: true,
    // "House 12, Road 5, Block C" and its Bangla equivalent (বাসা ১২, রোড ৫).
    pattern: /(?:\b(?:House|Flat|Holding)\s*#?\s*\d+[A-Za-z]?\s*,?\s*(?:Road|Rd)\s*#?\s*\d+[A-Za-z]?(?:\s*,\s*(?:Block|Sector)\s*[A-Za-z0-9-]+)?|(?:বাসা|বাড়ি|ফ্ল্যাট|হোল্ডিং)\s*#?\s*[\d০-৯]+\s*,?\s*(?:রোড|সড়ক)\s*#?\s*[\d০-৯]+(?:\s*,\s*(?:ব্লক|সেক্টর)\s*[^\s,]+)?)/giu,
  },
  {
    name: 'address-street',
    // "12 Oak Street", "3/14 Elizabeth St", "45/1 Indira Road",
    // "350 West 57th Street", "221B Baker Street".
    pattern: new RegExp(`\\b\\d{1,5}[A-Za-z]?(?:\\/\\d{1,5}[A-Za-z]?)?\\s+${STREET_WORD}(?:\\s+${STREET_WORD}){0,2}\\s+(?:${STREET_TYPES})\\b\\.?`, 'g'),
    // A street type that is also an ordinary noun ("argued 3 Supreme Court
    // appeals") counts only where an address would end: before a comma, a
    // line end or a state and postcode.
    accept: (match, ...rest) => {
      const [offset, whole] = rest.slice(-2);
      if (!/\b(?:Court|Ct|Place|Pl|Square|Sq|Walk|Row|Gardens|Heights|Rise|Loop|Track|Trail|Crossing|Quay|Wharf)\.?$/.test(match)) return true;
      return /^(?:[^\S\n]*(?:,|\n|$)|[^\S\n]+[A-Z]{2,3}[^\S\n]+\d{4})/.test(whole.slice(offset + match.length));
    },
  },
  {
    name: 'address-unit',
    // "Flat 302,", "Plot 15,", "Apartment 7,", "House No. 45,", "Ward No. 7,",
    // "No. 12,": a dwelling prefix and number followed by a comma. The comma
    // is what keeps "Level 3 Food Hygiene" out.
    pattern: /\b(?:(?:Flat|Apt|Apartment|Plot|Blk|House|Holding|Villa|Ward|Road)\.?\s*(?:No\.?|#)?|No\.?)\s*\d+[A-Za-z]?(?:\/[\dA-Za-z]+)?\s*(?=,)/g,
  },
  {
    name: 'address-unit-weak',
    // "Unit 1504,", "Level 2,", "Suite 4,", "Block 3,": the same, but these
    // words also number course units and qualification levels ("NVQ Level 4,
    // Professional Cookery"), so they count only when what follows reads as
    // the rest of an address — a number or a street.
    pattern: /\b(?:Unit|Suite|Ste|Level|Floor|Block|Room|Lot|Shop)\s*#?\s*\d+[A-Za-z]?(?:\/\d+)?\s*(?=,)/g,
    corroborate: true,
  },
  {
    name: 'address-pobox',
    // "P.O. Box 1234-00100", "PO Box 55", "GPO Box 12", "Private Bag 3".
    pattern: /\b(?:P\.?\s?O\.?\s?Box|G\.?P\.?O\.?\s?Box|Post\s+Box|Private\s+Bag|Locked\s+Bag)\s*\d+(?:-\d+)?/gi,
  },
  {
    name: 'address-street-suffix',
    // Streets written as one word with the type attached, as German, Dutch
    // and Scandinavian addresses are: "Musterstraße 12", "Keizersgracht 123",
    // "Storgatan 5".
    pattern: /(?<![\p{L}\p{N}])\p{Lu}[\p{L}-]*(?:straße|strasse|str\.|weg|allee|platz|gasse|ring|damm|ufer|chaussee|straat|laan|gracht|plein|kade|vej|gade|gatan|vägen|veien|gata)\s+\d+[a-z]?\b/gu,
  },
  {
    name: 'address-local-street',
    // Street words that come before the name: Malay and Indonesian "Jalan
    // Bukit Bintang", "Taman Maluri", Vietnamese "đường Nguyễn Trãi",
    // "Quận 1", "Số 12".
    pattern: /(?<![\p{L}\p{N}])(?:(?:Jalan|Jln\.?|Jl\.|Lorong|Lrg\.?|Persiaran|Lebuh|Lebuhraya|Taman|Tmn\.?|Kampung|Kg\.|Gang)\s+(?:\p{Lu}|\d)[\p{L}\p{N}\/]*(?:\s+(?:\p{Lu}|\d)[\p{L}\p{N}\/]*){0,3}|(?:[đĐ]ường|[pP]hố|[nN]gõ|[hH]ẻm|Quận|Huyện|Phường|Xã|Thị\s+xã)\s+(?:\p{Lu}|\d)[\p{L}\p{N}]*(?:\s+\p{Lu}[\p{L}]*){0,3}|[sS]ố\s*\d+[A-Za-z]?(?:\/\d+)?)/gu,
  },
  {
    name: 'address-postcode-city',
    digits: true,
    // A postcode before its city, closing an address line: "10115 Berlin",
    // "55100 Kuala Lumpur". Only after a comma or at a line start, and only
    // where the city ends the line or the part — a sentence that starts with
    // a number ("12000 Units sold") does not qualify. A four-digit number
    // that could be a year never counts.
    pattern: /(?:(?<=^|\n)|(?<=,[^\S\n]*))(\d{4,6})[^\S\n]+\p{Lu}\p{L}+(?:[^\S\n]+\p{Lu}\p{L}+){0,2}(?=[^\S\n]*(?:,|\n|$))/gu,
    accept: (_match, code) => code.length > 4 || !/^(?:19|20)\d{2}$/.test(code),
  },
  {
    name: 'address-au-postcode',
    digits: true,
    // "Hawthorn VIC 3122". The number must be a real postcode for that state:
    // NSW postcodes start with 2, which is what used to make "TAFE NSW 2015"
    // an address. An institution name, or a second year straight after
    // (a date range), rules a match out.
    pattern: /\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?),?\s+(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})\b(?![^\S\n]*(?:[-–][^\S\n]*)?(?:\d{4}\b|present|current|now|to\b))/g,
    accept: (_match, place, state, code) => {
      if (place.split(/\s+/).some((word) => INSTITUTION_WORD.test(word))) return false;
      const n = Number(code);
      return (AU_POSTCODE_RANGES[state] ?? []).some(([lo, hi]) => n >= lo && n <= hi);
    },
  },
  {
    name: 'address-bd-postcode',
    digits: true,
    // "Dhaka-1209", "Dhaka 1213" at the end of an address, and the Bangla
    // "ঢাকা-১২০৯". Without the dash the code must close the line or the part
    // and must not be a year: "University of Dhaka 2015" is a degree line.
    pattern: /(?:\b(?:Dhaka|Chattogram|Chittagong|Khulna|Rajshahi|Sylhet|Barisal|Barishal|Rangpur|Mymensingh|Comilla|Cumilla|Narayanganj|Gazipur|Bogura|Bogra|Jessore|Jashore|Cox's Bazar|Tangail|Dinajpur|Pabna|Noakhali|Faridpur)(?:\s*-\s*\d{4}\b|[^\S\n]+(?!(?:19|20)\d{2}\b)\d{4}(?=[^\S\n]*(?:,|\n|$|\)|Bangladesh)))|(?:ঢাকা|চট্টগ্রাম|খুলনা|রাজশাহী|সিলেট|বরিশাল|রংপুর|ময়মনসিংহ|কুমিল্লা|নারায়ণগঞ্জ|গাজীপুর)\s*-\s*[\d০-৯]{4})/giu,
  },
  {
    name: 'address-uk-postcode',
    // "E8 3PN", "M14 5TQ", "NW1 6XE". The inward code's letters exclude
    // C, I, K, M, O and V, as Royal Mail's do.
    pattern: /\b[A-Z]{1,2}\d[A-Z\d]?\s\d[ABD-HJLNP-UW-Z]{2}\b/g,
  },
  {
    name: 'address-us-zip',
    // "NY 10019", "Austin, TX 78704-1234".
    pattern: new RegExp(`\\b(?:${US_STATES}),?\\s+\\d{5}(?:-\\d{4})?\\b`, 'g'),
  },
  {
    name: 'address-ca-postcode',
    // "L6X 2K4".
    pattern: /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d\b/g,
  },
  {
    name: 'address-eircode',
    // Irish Eircode: "D02 X285".
    pattern: /\b(?:[AC-FHKNPRTV-Y]\d{2}|D6W)\s?[0-9AC-FHKNPRTV-Y]{4}\b/g,
  },
  {
    name: 'address-sg-postcode',
    // "Singapore 521123", and a unit number "#05-67".
    pattern: /\bSingapore\s+\d{6}\b|#\d{2}-\d{2,4}\b/g,
  },
];

// One comma-separated part of an address: every word capitalised, a number,
// a postcode or a unit number. A lowercase word ends it, which is what stops
// a street mentioned in a sentence from swallowing the sentence.
const ADDRESS_CHUNK = "(?:(?:[(\\p{Lu}\\p{N}]|#\\d)[\\p{L}\\p{N}'’().#\\/-]*)(?:[^\\S\\n]+(?:[(\\p{Lu}\\p{N}]|#\\d)[\\p{L}\\p{N}'’().#\\/-]*){0,3}";
const RIGHT_PART = new RegExp(`^(?:[^\\S\\n]*,[^\\S\\n]*|[^\\S\\n]+[-–][^\\S\\n]+|[^\\S\\n]+(?=\\p{N}|#\\d|[A-Z]{1,2}\\d))(${ADDRESS_CHUNK})`, 'u');
const LEFT_PART = new RegExp(`(?:^|(?<=[\\n,:|]))[^\\S\\n]*(${ADDRESS_CHUNK})(?:[^\\S\\n]*,[^\\S\\n]*|[^\\S\\n]+)$`, 'u');

/**
 * Widens an address anchor to the address it sits in, within its line: parts
 * joined by commas to the right ("22 Wattle Street, Penrith NSW 2750"), and
 * for a postcode anchor up to two parts to the left ("Brampton, ON L6X 2K4").
 */
function widenAddress(text, start, end, { left }) {
  let s = start;
  let e = end;
  for (let k = 0; k < 6; k++) {
    const rest = text.slice(e);
    const m = rest.match(RIGHT_PART);
    if (!m) break;
    // A part followed by ':' is the next field's label ("…, Mobile: …").
    if (/^[^\S\n]*:/.test(rest.slice(m[0].length))) break;
    e += m[0].length;
  }
  if (left) {
    for (let k = 0; k < 2; k++) {
      const before = text.slice(0, s);
      const m = before.match(LEFT_PART);
      if (!m || PLACEHOLDER.test(m[1])) break;
      s -= m[0].length - (m[0].length - m[0].trimStart().length);
    }
  }
  return [s, e];
}

function applyAddressRules(text, bump) {
  let out = text;
  for (const anchor of ADDRESS_ANCHORS) {
    const scan = anchor.digits && hasNonAsciiDigits(out) ? toAsciiDigits(out) : out;
    const spans = [];
    for (const match of scan.matchAll(anchor.pattern)) {
      if (anchor.accept && !anchor.accept(...match, match.index, scan)) continue;
      const postcode = /postcode|zip|eircode|city/.test(anchor.name);
      const span = widenAddress(scan, match.index, match.index + match[0].length, { left: postcode });
      if (anchor.corroborate) {
        const rest = scan.slice(match.index + match[0].length, span[1]);
        if (!/\d/.test(rest) && !new RegExp(`\\b(?:${STREET_TYPES})\\b`).test(rest)) continue;
      }
      spans.push(span);
    }
    // Merge overlaps, then replace right to left.
    spans.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const span of spans) {
      const last = merged[merged.length - 1];
      if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1]);
      else merged.push([...span]);
    }
    for (const [s, e] of merged.reverse()) {
      note(out.slice(s, e), MASK.address);
      out = out.slice(0, s) + MASK.address + out.slice(e);
    }
    bump(anchor.name, merged.length);
  }
  return out;
}

/* ── Referees ───────────────────────────────────────────────────────────── */

const REFEREE_HEADING = /^(?:references?|referees?|professional references|character references|reference persons?|তথ্যসূত্র|রেফারেন্স)[^\S\n]*:?$/iu;

const HONORIFIC = '(?:Mr|Mrs|Ms|Miss|Mx|Dr|Prof|Professor|Engr|Eng|Md|Mst|Mohammad|Hon|Rev|Sir|Dame|Late|Capt|Col|Maj|Justice|Adv|CA|Barrister)';
const PERSON_NAME = new RegExp(`^((?:${HONORIFIC}\\.?[^\\S\\n]+)*[\\p{Lu}][\\p{L}'’-]+(?:[^\\S\\n]+(?:[\\p{Lu}][\\p{L}'’-]+|[\\p{Lu}]\\.)){1,4})(?=$|[^\\S\\n]*[,–—|(-])`, 'u');

/**
 * Masks the names in a References section.
 *
 * A referee's name opens their entry: it is the first line after the
 * heading, or the first line after the previous referee's contact details. A
 * name on that line (up to the first comma or dash, so "Karen Whitfield, Nurse
 * Unit Manager" works too) is masked. Role and organisation lines never open
 * an entry, so they survive.
 */
function applyRefereeRule(text, bump) {
  const lines = text.split('\n');
  let inSection = false;
  let entryStart = false;
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (REFEREE_HEADING.test(trimmed)) {
      inSection = true;
      entryStart = true;
      continue;
    }
    if (!inSection) continue;
    // A known heading, or any line in capitals ("MARKET RULES"), ends the
    // section: names in a reference list are not written in capitals, and a
    // heading must never be taken for one.
    const words = trimmed.replace(new RegExp(PLACEHOLDER.source, 'g'), ' ').trim();
    if (SECTION_HEADING.test(trimmed) || (/\p{L}{2}/u.test(words) && words === words.toUpperCase() && /\p{Lu}/u.test(words))) {
      inSection = false;
      continue;
    }
    if (!trimmed) {
      entryStart = true;
      continue;
    }
    if (entryStart) {
      const m = trimmed.match(PERSON_NAME);
      if (m && !PLACEHOLDER.test(m[1])) {
        note(m[1], MASK.name);
        lines[i] = lines[i].replace(m[1], MASK.name);
        count += 1;
      }
      entryStart = false;
    }
    // A contact line closes an entry; the next line opens the next one.
    if (/\[(?:PHONE|EMAIL)\]/.test(trimmed)) entryStart = true;
  }

  bump('referee-name', count);
  return lines.join('\n');
}

/* ── Known-string names ─────────────────────────────────────────────────── */

/**
 * Name particles that are not identifying on their own.
 *
 * Masking a bare 'Md' or 'Mohammad' would hit a third of Bangladeshi employer
 * names as well as the candidate, and masking a bare 'Kumar' or 'Ali' is the
 * same problem. Full names are always masked; these are only excluded from the
 * single-token pass.
 */
const NON_IDENTIFYING_PARTS = new Set([
  'md', 'mohammad', 'mohammed', 'muhammad', 'mohd', 'mr', 'mrs', 'ms', 'dr', 'mst', 'engr', 'prof', 'begum',
  'khatun', 'miah', 'mia', 'shri', 'smt', 'late', 'ca', 'hon', 'rev', 'sir', 'the', 'and', 'of',
  'মোঃ', 'মোছাঃ', 'মোসাঃ', 'মোহাম্মদ', 'মুহাম্মদ', 'মিঃ', 'মিসেস', 'ডঃ', 'ড', 'জনাব', 'বেগম',
]);

/** Latin letters and the accented forms that should match them. */
const LETTER_VARIANTS = (() => {
  const map = new Map();
  for (let code = 0x00c0; code <= 0x024f; code++) {
    const char = String.fromCodePoint(code);
    const base = char.normalize('NFD')[0];
    if (!/[A-Za-z]/.test(base)) continue;
    const key = base.toLowerCase();
    map.set(key, (map.get(key) ?? '') + char);
  }
  return map;
})();

/** Strips accents from Latin letters only. Bangla vowel signs are marks too,
 *  and must survive: they are part of the name. */
const foldToAscii = (value) => [...value]
  .map((char) => (/[\u00C0-\u024F]/u.test(char) ? char.normalize('NFD')[0] : char))
  .join('');

/**
 * The pattern for one known name: case-insensitive, accent-insensitive, and
 * indifferent to how its words are joined ("O'Sullivan", "O’Sullivan",
 * "O Sullivan", "O-Sullivan"; "Md. Rahim" and "MD RAHIM"; a name broken over
 * two lines). Bounded by non-letters in any script — \b is ASCII-only and
 * would never fire around a Bangla name.
 */
function namePattern(name) {
  let body = '';
  let pendingSep = false;
  for (const char of foldToAscii(name)) {
    if (/[\s'’‘`.,\-()]/.test(char)) {
      pendingSep = true;
      continue;
    }
    if (pendingSep && body) body += "[\\s'’‘`.,\\-()]*";
    pendingSep = false;
    const lower = char.toLowerCase();
    body += LETTER_VARIANTS.has(lower) && /[a-z]/.test(lower)
      ? `[${lower}${LETTER_VARIANTS.get(lower)}]`
      : escapeRegex(char);
  }
  // "ZHANG Wei (David)": the closing bracket is part of the name.
  if (/\)\s*$/.test(name)) body += '\\)?';
  return new RegExp(`(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])`, 'giu');
}

/**
 * Expands the known names into what to match.
 *
 * Whole names (and the name without its honorifics) are masked wherever they
 * appear. Single words of a name — "Rahim" in a reference line, "Jess" in a
 * sentence — are returned separately, because they are masked only where they
 * stand as a name (see maskSingleToken).
 */
function expandNames(names) {
  const whole = new Set();
  const tokens = new Set();

  for (const raw of names) {
    // NFC, as the text is: a PDF can hand back 'য়' precomposed (U+09DF),
    // which normalisation always splits into য + ়.
    const name = String(raw ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
    if (name.length < 2) continue;
    whole.add(name);

    // A bracketed nickname is a name of its own: "ZHANG Wei (David)".
    for (const inner of name.matchAll(/\(([^)]+)\)/g)) tokens.add(inner[1].trim());
    const plain = name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain && plain !== name) whole.add(plain);

    const parts = plain.split(' ').filter(Boolean);
    const withoutParticles = parts
      .filter((part) => !NON_IDENTIFYING_PARTS.has(part.replace(/[.]/g, '').toLowerCase()))
      .join(' ');
    if (withoutParticles.split(' ').filter(Boolean).length >= 2) whole.add(withoutParticles);

    for (const part of parts) {
      // "O'Sullivan" is also "Sullivan"; "Chen-Adler" is also "Chen" and "Adler".
      for (const piece of [part, ...part.split(/['’\-]/)]) {
        const bare = piece.replace(/[.,]/g, '');
        if ([...bare].length < 3) continue;
        if (NON_IDENTIFYING_PARTS.has(bare.toLowerCase())) continue;
        tokens.add(bare);
      }
    }
  }

  const byLength = (a, b) => b.length - a.length;
  const surnames = new Set(
    [...whole]
      .filter((w) => w.includes(' ') && !/\(/.test(w))
      .map((w) => w.split(' ').pop().replace(/[.,]/g, ''))
      .flatMap((w) => [w, ...w.split(/['’-]/)])
      .map((w) => foldToAscii(w).toLowerCase())
  );
  return {
    surnames,
    // A one-word name is matched as a token, so it gets the same "stands as
    // a name" check as any other single word.
    whole: [...whole].filter((w) => w.includes(' ')).sort(byLength),
    tokens: [...new Set([...tokens, ...[...whole].filter((w) => !w.includes(' '))])].sort(byLength),
  };
}

const CAPITALISED_WORD = /^[\p{Lu}\p{Lo}]/u;

/**
 * Masks one word of a known name where it stands as a name.
 *
 * It must be capitalised (or in a script without case), and every other
 * capitalised word run together with it must also be a name word, an
 * honorific, an initial or an already-masked name. "Contact Rahim directly"
 * masks; "Line Cook", "Box Hill Institute" and "rose to Store Manager" do not.
 */
function maskSingleToken(text, token, isNameWord, isSurname) {
  const pattern = namePattern(token);
  let count = 0;
  const foreign = (word) => Boolean(word)
    && (CAPITALISED_WORD.test(word) || word.startsWith('['))
    && word !== MASK.name
    && !isNameWord(word);
  const masked = text.replace(pattern, (match, offset, whole) => {
    if (!CAPITALISED_WORD.test(match)) return match;
    const before = whole.slice(0, offset);
    const after = whole.slice(offset + match.length);
    const prev = before.match(/([\p{L}\p{M}'’.\[\]]+)[^\S\n]*$/u)?.[1];
    const next = after.match(/^[^\S\n]*([\p{L}\p{M}'’.\[\]]+)/u)?.[1];
    // Inside or at the end of another name: "Line Cook", "Box Hill Institute".
    if (foreign(prev)) return match;
    // At the start of one. A surname there is a business named after its
    // owner ("Thompson Plumbing"), which identifies them; a first name there
    // is usually something else ("Grace Lutheran College").
    if (foreign(next) && !isSurname(match)) return match;
    count += 1;
    note(match, MASK.name);
    return MASK.name;
  });
  return { text: masked, count };
}

/**
 * Masks a known literal value (an email or a phone) wherever it appears.
 */
function maskKnownValue(text, value, placeholder) {
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegex(value)}(?![\\p{L}\\p{N}_])`, 'giu');
  let count = 0;
  const out = text.replace(pattern, (match) => {
    count += 1;
    note(match, placeholder);
    return placeholder;
  });
  return { text: out, count };
}

/**
 * Masks a known phone number however it is grouped.
 *
 * The account may store '+8801712345678' while the CV says '0171-2345678', or
 * '07700 900372' against '07700 900 372'. The stored digits are tried with and
 * without a country code, and any separators are allowed between them.
 */
function maskKnownPhone(text, phone) {
  const digits = toAsciiDigits(phone).replace(/\D/g, '');
  if (digits.length < 7) return { text, count: 0 };
  const variants = new Set([digits]);
  if (/^\s*(?:\+|00)/.test(phone)) {
    const international = digits.replace(/^00/, '');
    for (let k = 1; k <= 3; k++) {
      variants.add(international.slice(k));
      variants.add(`0${international.slice(k)}`);
    }
  }
  if (digits.startsWith('0')) variants.add(digits.slice(1));

  let out = text;
  let count = 0;
  // Eight digits at least: a shorter tail of a number ('1234567') turns up
  // inside unrelated identifiers ('K1234567A').
  for (const variant of [...variants].filter((v) => v.length >= 8).sort((a, b) => b.length - a.length)) {
    const body = [...variant].join('[\\s().-]{0,2}');
    // An optional country code, an optional '(0)', an optional opening
    // bracket — never a bare space, which would take the gap before the
    // number with it.
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}+(])(?:\\+?\\d{1,3}[\\s.-]?)?(?:\\(0\\)[\\s.-]?)?\\(?${body}(?![\\p{L}\\p{N}])`, 'gu');
    const scan = hasNonAsciiDigits(out) ? toAsciiDigits(out) : out;
    const spans = [...scan.matchAll(pattern)].map((m) => [m.index, m.index + m[0].length]);
    for (const [s, e] of spans.reverse()) {
      note(out.slice(s, e), MASK.phone);
      out = out.slice(0, s) + MASK.phone + out.slice(e);
      count += 1;
    }
  }
  return { text: out, count };
}

/**
 * Masks a personal website whose domain is built out of the candidate's name
 * ('saminmahmud.com'). A bare custom domain cannot be matched generically —
 * 'bdjobs.com', 'brac.net' and every employer mentioned in a bullet have the
 * same shape — but one containing a word of a name we already know is theirs.
 */
function maskNameDomains(text, nameTokens) {
  const ascii = nameTokens.map(foldToAscii).filter((t) => /^[A-Za-z]{3,}$/.test(t));
  if (ascii.length === 0) return { text, count: 0 };
  const alternation = ascii.map(escapeRegex).join('|');
  const pattern = new RegExp(
    `(?:https?://)?(?:www\\.)?[A-Za-z0-9-]*(?:${alternation})[A-Za-z0-9-]*`
    + '\\.(?:[A-Za-z]{2,63})(?:\\.[A-Za-z]{2,63})?(?:/[^\\s]*)?',
    'gi'
  );
  let count = 0;
  const out = text.replace(pattern, (match) => {
    count += 1;
    note(match, MASK.url);
    return MASK.url;
  });
  return { text: out, count };
}

/** Masks bare mentions of the candidate's own (non-webmail) email domain. */
function maskOwnDomains(text, domains) {
  if (domains.size === 0) return { text, count: 0 };
  const alternation = [...domains].map(escapeRegex).join('|');
  const pattern = new RegExp(`(?<![\\w@.-])(?:https?://)?(?:www\\.)?(?:${alternation})(?:/[^\\s]*)?(?![\\w-])`, 'gi');
  let count = 0;
  const out = text.replace(pattern, (match) => {
    count += 1;
    note(match, MASK.url);
    return MASK.url;
  });
  return { text: out, count };
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
const HEADER_SECTION = /^(?:profile|summary|objective|career\s+objective|education|experience|employment|skills|projects|contact|references|about)\b/i;

/**
 * Best-effort guess at the candidate's name from the top of the document.
 *
 * Only used IN ADDITION to the stored account name and the server's type-size
 * hint, never instead of them, and deliberately conservative: it reads the
 * first few non-empty lines and accepts one only if it looks like a standalone
 * name line — short, no contact token, no section heading, two to five words.
 *
 * A wrong guess here masks a word that was not a name, which costs the model a
 * little context. A missed guess costs nothing when another source has the
 * name. That asymmetry is why the thresholds are tight.
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
    if (DOCUMENT_TITLE.test(line)) continue;

    if (line.length > 50) break;
    if (CONTACT_TOKEN.test(line)) break;
    if (HEADER_SECTION.test(line)) break;

    // A digit anywhere disqualifies the line. Checked before any cleaning:
    // stripping a leading '42 ' off '42 Software Projects' would leave two
    // capitalised words that look exactly like a name.
    if (/[\p{Nd}]/u.test(line)) break;

    // Strip decoration a header line often carries around the name.
    const cleaned = line.replace(/^[^\p{L}]+|[^\p{L}\p{M}.)]+$/gu, '').trim();
    if (cleaned.length < 3 || cleaned.length > 50) break;

    const words = cleaned.split(/\s+/);
    if (words.length < 2 || words.length > 5) break;

    // Every word must read as a name word: letters, with an optional trailing
    // dot for an initial, or a bracketed nickname. \p{M} is required as well
    // as \p{L} because Indic scripts carry vowel signs and marks as separate
    // combining code points — the visarga in 'মোঃ' is a mark, not a letter.
    if (!words.every((word) => /^\(?[\p{L}\p{M}][\p{L}\p{M}'’-]*\.?\)?$/u.test(word))) break;

    return cleaned;
  }

  return null;
}

/* ── Core ───────────────────────────────────────────────────────────────── */

/**
 * @typedef {object} MaskIdentity
 * @property {string|null} [fullName]   the account holder's stored name
 * @property {string|null} [email]      their stored email
 * @property {string|null} [phone]      their stored phone
 * @property {string[]}    [extraNames] any further known names: the server's
 *                                      type-size hint, the CV header
 */

/**
 * Masks PII in a single string. Pure.
 *
 * @param {string} input
 * @param {MaskIdentity} [identity]
 * @returns {string}
 */
export function maskPii(input, identity = {}, options = {}) {
  return inspectMaskedPii(input, identity, options).text;
}

/**
 * maskPii with a report of which rules fired. Pure.
 *
 * Findings carry rule names and counts only — never the matched value, which
 * would defeat the whole purpose the moment anything logged them.
 *
 * Order is load-bearing:
 *   1. emails, so no later rule sees an address's digits, dots or name words;
 *   2. URLs and handles, for the same reason;
 *   3. phones, before identifiers and addresses claim their digits;
 *   4. identifiers, then labelled fields (the label decides what a value is);
 *   5. addresses, which widen from an anchor to the whole address;
 *   6. referee names, which need the contact lines already masked to find
 *      where each referee's entry starts;
 *   7. known names last, so the rules above have already removed everything
 *      a name could hide inside.
 *
 * `options.labelledFields` and `options.referees` exist for the inbound
 * redactor, which runs this over the MODEL'S feedback. Feedback legitimately
 * says "Religion: consider removing this field" and discusses a References
 * section; the label-driven rules would rewrite that advice. The shape rules
 * and known names stay on, since a value is a value wherever it appears.
 *
 * @param {string} input
 * @param {MaskIdentity} [identity]
 * `options.collectValues` also returns what was removed, as
 * {value, placeholder} pairs. The server hands these to the inbound redactor
 * so that anything masked on the way out is masked again if it ever comes
 * back. They are the PII itself: keep them in memory, never log them.
 *
 * @param {{labelledFields?: boolean, referees?: boolean, collectValues?: boolean}} [options]
 * @returns {{text: string, findings: Array<{rule: string, count: number}>, values?: Array<{value: string, placeholder: string}>}}
 */
export function inspectMaskedPii(input, identity = {}, { labelledFields = true, referees = true, collectValues = false } = {}) {
  const previous = recorder;
  recorder = collectValues ? [] : null;
  try {
    const result = maskText(input, identity, { labelledFields, referees });
    return collectValues ? { ...result, values: recorder } : result;
  } finally {
    recorder = previous;
  }
}

function maskText(input, identity, { labelledFields, referees }) {
  // NFC so an accent typed as a combining mark matches its precomposed form.
  let text = String(input ?? '').normalize('NFC');
  const findings = [];
  const bump = (rule, count) => {
    if (count <= 0) return;
    const existing = findings.find((item) => item.rule === rule);
    if (existing) existing.count += count;
    else findings.push({ rule, count });
  };
  const run = (rule) => {
    const result = runRule(text, rule);
    text = result.text;
    bump(rule.name, result.count);
  };
  const apply = (label, result) => {
    text = result.text;
    bump(label, result.count);
  };

  const knownNames = [identity?.fullName, ...(identity?.extraNames ?? [])]
    .filter((value) => typeof value === 'string' && value.trim());
  const names = expandNames(knownNames);

  // ── 1. emails ──
  if (typeof identity?.email === 'string' && identity.email.trim()) {
    apply('known-email', maskKnownValue(text, identity.email.trim(), MASK.email));
  }
  const ownDomains = new Set();
  for (const match of text.matchAll(EMAIL)) {
    const domain = match[0].split('@')[1].toLowerCase();
    if (!SHARED_MAIL_DOMAINS.has(domain)) ownDomains.add(domain);
  }
  run({ name: 'email', pattern: EMAIL, mask: MASK.email });

  // ── 2. URLs and handles ──
  for (const rule of URL_RULES) run(rule);
  apply('own-domain', maskOwnDomains(text, ownDomains));
  apply('name-domain', maskNameDomains(text, names.tokens));

  // ── 3. phones ──
  if (typeof identity?.phone === 'string' && identity.phone.trim()) {
    apply('known-phone', maskKnownPhone(text, identity.phone));
  }
  for (const rule of PHONE_RULES) run(rule);
  if (labelledFields) text = applyLabelledPhones(text, bump);

  // ── 4. identifiers and labelled fields ──
  for (const rule of ID_RULES) run(rule);
  if (labelledFields) text = applyFieldRules(text, bump);

  // ── 5. addresses ──
  text = applyAddressRules(text, bump);

  // ── 6. referees ──
  if (referees) text = applyRefereeRule(text, bump);

  // ── 7. known names ──
  for (const whole of names.whole) {
    const pattern = namePattern(whole);
    let count = 0;
    text = text.replace(pattern, (match) => {
      count += 1;
      note(match, MASK.name);
      return MASK.name;
    });
    bump('known-name', count);
  }
  const tokenSet = new Set(names.tokens.map((t) => foldToAscii(t).toLowerCase()));
  const isNameWord = (word) => {
    const bare = foldToAscii(word).replace(/[.'’]/g, '').toLowerCase();
    return tokenSet.has(bare) || NON_IDENTIFYING_PARTS.has(bare) || /^\p{Lu}\.?$/u.test(word);
  };
  const isSurname = (word) => names.surnames.has(foldToAscii(word).replace(/[.'’]/g, '').toLowerCase());
  for (const token of names.tokens) apply('known-name', maskSingleToken(text, token, isNameWord, isSurname));

  // Collapse a run of adjacent identical placeholders left behind by a header
  // line that was entirely contact details. '[PHONE] [PHONE]' from one number
  // split across two rules reads as two numbers, which is a fact about the
  // candidate we did not mean to hand over.
  for (const placeholder of Object.values(MASK)) {
    const escaped = escapeRegex(placeholder);
    text = text.replace(new RegExp(`${escaped}(?:[^\\S\\n]*[.,|/–—-]?[^\\S\\n]*${escaped})+`, 'g'), placeholder);
  }

  return { text, findings };
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
export function maskPiiDeep(value, identity = {}, options = {}) {
  const walk = (node) => {
    if (typeof node === 'string') return maskPii(node, identity, options);
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
 * A system prompt gets the value-shape rules and known names but not the
 * label- and section-driven ones. Those read a document's structure ("Religion
 * : …", a References section), and a prompt ABOUT CVs is full of that
 * vocabulary: run over the review prompt they would rewrite its instructions.
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
    const options = message.role === 'system' ? { labelledFields: false, referees: false } : {};
    if (typeof message.content !== 'string') {
      // Multipart content (an array of parts) is masked per string value so a
      // future vision or tool-call payload is covered by the same guarantee.
      return { ...message, content: maskPiiDeep(message.content, identity, options) };
    }
    const result = inspectMaskedPii(message.content, identity, options);
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
