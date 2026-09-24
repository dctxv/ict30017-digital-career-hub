/**
 * Module: piiRedactor
 * Responsibility: Strip candidate PII from AI output on the resume path before
 * it reaches the client or storage.
 *
 * Why this exists: during the May 2026 model feasibility study, two of the
 * evaluated models echoed candidate contact details back into their feedback
 * despite an explicit prompt instruction not to ("Do not echo personal details
 * ... anywhere in your response", resumeReviewer.js). A prompt instruction is a
 * request, not a control. The feasibility report therefore mandates a
 * deterministic redaction layer regardless of which model is in production, so
 * the guarantee survives a model swap.
 *
 * Deterministic by design: pure regex and string rules, no model calls, no
 * network, no I/O. It behaves identically with zero API budget, which is the
 * point — it must not be the thing that breaks when the AI provider changes.
 *
 * ── The precision/recall call ────────────────────────────────────────────────
 *
 * The reviewer legitimately discusses the *structure* of a resume: "your
 * contact section is missing an email address", "remove your NID from an
 * international CV". Those are field mentions and must survive verbatim —
 * mangling them turns useful feedback into nonsense.
 *
 * Every rule below therefore matches on value shape (an @, a digit run of a
 * specific length, a known profile host) and never on field names. Where a rule
 * cannot cleanly separate a value from a legitimate number, it does not fire,
 * and low-confidence rules report themselves through inspectPii() so the
 * uncertainty is visible rather than silent.
 *
 * Numeric patterns are anchored on both sides with digit boundaries so that
 * CGPA (3.75/4.00), year ranges (2019-2023), SSC/HSC GPA (5.00), score values
 * (55, 45/35/20) and percentages cannot false-positive.
 *
 * ── Structure awareness ──────────────────────────────────────────────────────
 *
 * redactPiiDeep() walks the parsed response object and rewrites string values
 * only. It never touches keys, and never runs over serialised JSON text, so it
 * cannot corrupt structure, escaping, or the server-side scores (which are
 * numbers, and numbers are left alone entirely).
 *
 * ── Shared rules ─────────────────────────────────────────────────────────────
 *
 * After its own rules, every string also goes through the outbound mask's
 * value-shape rules and known-name matching (ai-service utils/piiMask), so a
 * value the mask recognises on the way out is recognised here on the way back
 * — Australian and UK phones, postcodes, national ids, handles, and the
 * candidate's own name when the caller passes their identity. The mask's
 * label-driven rules are left off: "Religion: consider removing this field" is
 * advice about a field, and exactly what this layer must not rewrite.
 */

import { inspectMaskedPii, MASK } from 'ai-service';

/* ── Values the outbound mask removed ────────────────────────────────────────
 *
 * The strongest check available: the server knows exactly which values the
 * mask took out of the CV on the way to the model (inspectMaskedPii with
 * collectValues), so any of them appearing in the feedback is an echo by
 * definition. Matching those literal values cannot touch advice ABOUT a field
 * — "remove your religion" contains no one's religion — which the label rules
 * could.
 *
 * Two kinds of value are too ordinary to match on their own: very short ones
 * ("B+", "M") and everyday words ("Single", "Married", "Male"). Those are
 * matched only straight after the label they were filed under.
 */
const ORDINARY_VALUES = new Set([
  'single', 'married', 'unmarried', 'divorced', 'widowed', 'separated', 'male', 'female', 'other', 'yes', 'no',
  'none', 'n/a', 'na', 'nil', 'present', 'current',
]);
const ORDINARY_LABEL = '(?:blood[^\\S\\n]+(?:group|type)|marital[^\\S\\n]+status|civil[^\\S\\n]+status|gender|sex|height|weight|age)';
const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Compiled once per list: the stream redactor matches on every push. */
const compiledKnownValues = new WeakMap();

function knownValuePatterns(knownValues) {
  if (!Array.isArray(knownValues)) return [];
  if (compiledKnownValues.has(knownValues)) return compiledKnownValues.get(knownValues);
  const compiled = [];
  const values = knownValues
    .filter((item) => item && typeof item.value === 'string')
    .sort((a, b) => b.value.length - a.value.length);

  for (const { value, placeholder } of values) {
    const mark = MARK_FOR_PLACEHOLDER.get(placeholder) ?? MARK.personal;
    const clean = value.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const body = escapeRe(clean).replace(/ /g, '\\s+');
    const ordinary = ORDINARY_VALUES.has(clean.toLowerCase()) || (clean.match(/[\p{L}\p{N}]/gu) ?? []).length < 3;
    const pattern = ordinary
      // The label may sit on the line above its value, as in a sidebar.
      ? new RegExp(`(${ORDINARY_LABEL}[^\\S\\n]*[:\\-–]?\\s*)${body}(?![\\p{L}\\p{N}])`, 'giu')
      : new RegExp(`(?<![\\p{L}\\p{N}])()${body}(?![\\p{L}\\p{N}])`, 'giu');
    compiled.push({ pattern, mark });
  }
  compiledKnownValues.set(knownValues, compiled);
  return compiled;
}

function applyKnownValues(input, knownValues) {
  let text = input;
  let count = 0;
  for (const { pattern, mark } of knownValuePatterns(knownValues)) {
    text = text.replace(pattern, (_match, label) => {
      count += 1;
      return `${label}${mark}`;
    });
  }
  return { text, count };
}

/* ── Redaction markers ──────────────────────────────────────────────────────
 * Markers deliberately contain no digits, no '@' and no '/', so re-running the
 * redactor over its own output is a no-op. Idempotence is covered by tests.
 */
const MARK = {
  email: '[redacted-email]',
  phone: '[redacted-phone]',
  nid: '[redacted-id]',
  username: '[redacted-username]',
  address: '[redacted-address]',
  name: '[redacted-name]',
  url: '[redacted-url]',
  personal: '[redacted-personal]',
};

/** The mask's placeholders, as this layer's markers. */
const MARK_FOR_PLACEHOLDER = new Map([
  [MASK.name, MARK.name],
  [MASK.email, MARK.email],
  [MASK.phone, MARK.phone],
  [MASK.address, MARK.address],
  [MASK.url, MARK.url],
  [MASK.id, MARK.nid],
  [MASK.dob, MARK.personal],
  [MASK.personal, MARK.personal],
]);

/* ── Rules ──────────────────────────────────────────────────────────────────
 *
 * Order matters and is load-bearing:
 *   1. email first, so an address's digits are gone before any numeric rule
 *      inspects them.
 *   2. profile URLs before numeric rules, same reason.
 *   3. phone before national ID: '+8801712345678' is a phone, but its digits
 *      alone are a 13-run that the NID rule would otherwise claim.
 *   4. addresses last: their numbers are short and no numeric rule matches
 *      them, so they survive to be matched as a unit.
 *
 * confidence: 'high'   - shape is unambiguous, fires silently.
 *             'medium' - shape is plausible but not certain; reported by
 *                        inspectPii() so callers can log the uncertainty.
 */
const PII_RULES = [
  {
    name: 'email',
    confidence: 'high',
    // Requires local@domain.tld. "email address" as prose has no '@' and cannot match.
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
    replace: () => MARK.email,
  },
  {
    name: 'profile-url-username',
    confidence: 'high',
    // Keeps the host so "add your LinkedIn profile" style feedback stays
    // legible, and removes only the identifying handle.
    pattern: /((?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in|github\.com|gitlab\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|behance\.net|dribbble\.com|medium\.com)\/@?)([A-Za-z0-9._-]{2,})/gi,
    replace: (_match, host) => `${host}${MARK.username}`,
  },
  {
    name: 'phone-bd',
    confidence: 'high',
    // BD mobile is 11 digits: 01 + operator digit (3-9) + 8 more, or the same
    // without the leading 0 behind +880. The operator-prefix requirement plus
    // digit boundaries mean no year, GPA or score can match.
    pattern: /(?<![\d+])(?:\+?880[\s-]?1[3-9]\d{2}[\s-]?\d{6}|01[3-9]\d{2}[\s-]?\d{6})(?!\d)/g,
    replace: () => MARK.phone,
  },
  {
    name: 'phone-international',
    confidence: 'high',
    // A literal '+' followed by 8-18 digit/separator characters. The leading
    // '+' is what makes this safe: bare digit runs are not matched here.
    pattern: /(?<![\d+])\+\d[\d\s.-]{6,16}\d(?!\d)/g,
    replace: () => MARK.phone,
  },
  {
    name: 'phone-grouped',
    confidence: 'medium',
    // NANP-style 3-3-4 with mandatory separators. '2019-2023' is 4-4 and
    // cannot match; '45 / 35 / 20' is 2-2-2 and cannot match.
    pattern: /(?<![\d-])\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/g,
    replace: () => MARK.phone,
  },
  {
    name: 'national-id',
    confidence: 'high',
    // Bangladesh NID is 13 or 17 digits. Nothing legitimate in resume feedback
    // is a 13- or 17-digit run.
    pattern: /(?<![\d+])(?:\d{17}|\d{13})(?!\d)/g,
    replace: () => MARK.nid,
  },
  {
    name: 'national-id-10',
    confidence: 'medium',
    // The older 10-digit NID. Reported as medium confidence: a bare 10-digit
    // run is almost certainly an identifier in this context, but unlike the
    // 13/17 forms it is not structurally impossible as something else.
    pattern: /(?<![\d+])\d{10}(?!\d)/g,
    replace: () => MARK.nid,
  },
  {
    name: 'address-bd',
    confidence: 'high',
    // The BD "House 12, Road 5" form. Requires both parts, so a lone "Road 5"
    // or "3 years" cannot match. Optional block/sector/area tail.
    pattern: /\bHouse\s*#?\s*\d+[A-Za-z]?\s*,?\s*Road\s*#?\s*\d+[A-Za-z]?(?:\s*,\s*(?:Block|Sector)\s*[A-Za-z0-9-]+)?/gi,
    replace: () => MARK.address,
  },
  {
    name: 'address-street',
    confidence: 'medium',
    // Western "12 Oak Street" form. The street-type suffix is mandatory, so
    // "3 Project Lead roles" cannot match.
    pattern: /\b\d{1,5}\s+[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)?\s+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Boulevard|Blvd|Drive|Dr)\b\.?/g,
    replace: () => MARK.address,
  },
  {
    name: 'postcode-city-bd',
    confidence: 'medium',
    // "Dhaka-1209". Requires a known city immediately before the 4-digit code,
    // so a bare 4-digit year cannot match.
    pattern: /\b(?:Dhaka|Chattogram|Chittagong|Khulna|Rajshahi|Sylhet|Barisal|Barishal|Rangpur|Mymensingh|Comilla|Cumilla|Narayanganj|Gazipur)\s*-\s*\d{4}\b/gi,
    replace: () => MARK.address,
  },
];

/**
 * Longest span any single rule can match, plus headroom.
 *
 * The streaming redactor holds back this many trailing characters so that PII
 * which has only partially arrived (e.g. '0171' so far) is never emitted before
 * it is complete enough to match. It must therefore exceed the longest possible
 * single match. The shared address rules widen a match to the whole address
 * line ("Flat 5C, Green Valley Apartments, 45/1 Indira Road, Farmgate,
 * Dhaka-1215" is over 70 characters), so the window is 160.
 */
export const STREAM_HOLDBACK_CHARS = 160;

/* ── Core (pure) ─────────────────────────────────────────────────────────── */

// Markers and placeholders already in the text, and a profile URL this layer
// has already reduced to its host. They are set aside while the shared rules
// run, so the model's own "[NAME]" passes through as written and
// "linkedin.com/in/[redacted-username]" keeps its host.
const ALREADY_HANDLED = /(?:(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9.-]+\/(?:[A-Za-z0-9._-]+\/)*@?)?\[(?:NAME|EMAIL|PHONE|ADDRESS|URL|ID|DATE OF BIRTH|PERSONAL|redacted-[a-z]+)\]/g;
const STAND_IN = '\uE000';

function applySharedRules(text, identity) {
  const setAside = [];
  const guarded = text.replace(ALREADY_HANDLED, (match) => {
    setAside.push(match);
    return STAND_IN;
  });

  const { text: masked, findings } = inspectMaskedPii(guarded, identity ?? {}, { labelledFields: false, referees: false });
  if (findings.length === 0) return { text, findings: [] };

  let out = masked;
  for (const [placeholder, mark] of MARK_FOR_PLACEHOLDER) out = out.split(placeholder).join(mark);
  let index = 0;
  out = out.replace(new RegExp(STAND_IN, 'g'), () => setAside[index++]);

  return {
    text: out,
    findings: findings.map((finding) => ({ rule: `shared:${finding.rule}`, confidence: 'high', count: finding.count })),
  };
}

function applyRules(input, identity, knownValues) {
  let text = String(input ?? '').normalize('NFC');
  const findings = [];

  if (knownValues?.length) {
    const known = applyKnownValues(text, knownValues);
    text = known.text;
    if (known.count > 0) findings.push({ rule: 'known-value', confidence: 'high', count: known.count });
  }

  for (const rule of PII_RULES) {
    let count = 0;
    text = text.replace(rule.pattern, (...args) => {
      count += 1;
      return rule.replace(...args);
    });
    if (count > 0) {
      findings.push({ rule: rule.name, confidence: rule.confidence, count });
    }
  }

  const shared = applySharedRules(text, identity);
  return { text: shared.text, findings: [...findings, ...shared.findings] };
}

/**
 * Redacts PII from a single string. Pure.
 *
 * @param {string} input
 * @param {object|null} [identity] the account holder's identity, as passed to
 *   the outbound mask, so their name is caught if the model writes it
 * @param {Array<{value: string, placeholder: string}>} [knownValues] what the
 *   outbound mask removed from the CV (inspectMaskedPii collectValues)
 * @returns {string}
 */
export function redactPii(input, identity, knownValues) {
  return applyRules(input, identity, knownValues).text;
}

/**
 * Redacts and reports which rules fired. Pure.
 *
 * Findings carry rule names and counts only — never the matched value, which
 * would defeat the purpose the moment anything logged them.
 *
 * @param {string} input
 * @returns {{ text: string, findings: Array<{rule: string, confidence: string, count: number}> }}
 */
export function inspectPii(input, identity, knownValues) {
  return applyRules(input, identity, knownValues);
}

/**
 * Walks a parsed value and redacts string values in place of a copy.
 *
 * Operates on parsed JSON, never on serialised text: keys are preserved
 * untouched, and non-strings (notably the server-side numeric scores) are
 * returned as-is. This is what makes the layer unable to corrupt structure.
 *
 * @param {unknown} value
 * @returns {unknown} a redacted deep copy
 */
export function redactPiiDeep(value, identity, knownValues) {
  return redactPiiDeepWithFindings(value, identity, knownValues).value;
}

/**
 * redactPiiDeep with an aggregated findings report across every string value.
 *
 * @param {unknown} value
 * @returns {{ value: unknown, findings: Array<{rule: string, confidence: string, count: number}> }}
 */
export function redactPiiDeepWithFindings(value, identity, knownValues) {
  const totals = new Map();

  const walk = (node) => {
    if (typeof node === 'string') {
      const { text, findings } = applyRules(node, identity, knownValues);
      for (const finding of findings) {
        const existing = totals.get(finding.rule);
        if (existing) {
          existing.count += finding.count;
        } else {
          totals.set(finding.rule, { ...finding });
        }
      }
      return text;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      // Keys are structural and never redacted; only values are walked.
      return Object.fromEntries(
        Object.entries(node).map(([key, child]) => [key, walk(child)])
      );
    }
    return node;
  };

  return { value: walk(value), findings: [...totals.values()] };
}

/* ── Streaming ───────────────────────────────────────────────────────────── */

function findMatchRanges(text, knownValues) {
  const ranges = [];
  const patterns = [...PII_RULES.map((rule) => rule.pattern), ...knownValuePatterns(knownValues).map((k) => k.pattern)];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return ranges;
}

/**
 * Creates a stateful redactor for the SSE token stream.
 *
 * The AI streams JSON a few characters at a time, so a phone number can arrive
 * split across two or more chunks. Redacting each chunk in isolation would emit
 * both halves verbatim. This buffers instead, and only releases text that is
 * far enough from the write head to be final:
 *
 *   - a trailing window of `holdback` characters is always withheld, so PII
 *     that has partially arrived is never emitted mid-formation;
 *   - if a completed match still straddles the release point, the release point
 *     is pulled back to the start of that match so it is never split.
 *
 *   - the release point is moved back to a space, so a word — a name the
 *     shared rules would recognise whole — is never split across releases.
 *
 * flush() drains the remainder and must be called when the stream ends,
 * otherwise the final `holdback` characters are dropped.
 *
 * @param {{ holdback?: number, identity?: object|null, knownValues?: Array<object> }} [options]
 * @returns {{ push: (chunk: string) => string, flush: () => string }}
 */
export function createStreamRedactor({ holdback = STREAM_HOLDBACK_CHARS, identity = null, knownValues = [] } = {}) {
  let buffer = '';

  return {
    push(chunk) {
      buffer += String(chunk ?? '');

      let cut = buffer.length - holdback;
      if (cut <= 0) return '';

      // Release at a space, so no word is split across releases...
      const space = buffer.lastIndexOf(' ', cut);
      if (space > 0) cut = space;
      // ...then never release a partial match: if a match spans the cut
      // point, hold the whole match back for the next push. This runs second
      // because moving to a space can land inside a multi-word match.
      for (const range of findMatchRanges(buffer, knownValues)) {
        if (range.start < cut && range.end > cut) cut = range.start;
      }
      if (cut <= 0) return '';

      const head = buffer.slice(0, cut);
      buffer = buffer.slice(cut);
      return redactPii(head, identity, knownValues);
    },

    flush() {
      const remainder = buffer;
      buffer = '';
      return redactPii(remainder, identity, knownValues);
    },
  };
}
