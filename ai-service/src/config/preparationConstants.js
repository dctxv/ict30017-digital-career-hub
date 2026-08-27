/**
 * Module: config/preparationConstants
 * Responsibility: The closed vocabulary a Gap is expressed in, and the key
 * normalisation that lets the same gap found twice resolve to one record.
 *
 * Preparation is not a third feature beside the resume review and the mock
 * interview. It is the shared output layer of both: the review produces action
 * items, the interview produces identified weaknesses, and a Gap is what either
 * of them converts into. One structure, two input sources, so the profile can
 * show a gap closing rather than two unrelated lists of advice.
 *
 * THE HARD PART IS IDENTITY, NOT STORAGE
 *
 * To show progress, the same gap detected in two separate analyses has to land
 * on the same row. Free-text descriptions never will: the model writes "no
 * evidence of SQL" one week and "SQL is not demonstrated anywhere" the next, and
 * a store keyed on that text accumulates duplicates and can never close
 * anything. So the model returns a gap_key from a constrained vocabulary
 * alongside the prose, and normaliseGapKey below is what makes it dependable —
 * the prompt asks for `skill:sql`, and this guarantees `Skill: SQL ` and
 * `skill:SQL` arrive as the same string. Same doctrine as the protected-heading
 * backstop in reviewConstants.js: the prompt asks, the server guarantees.
 */

/** Where a gap came from. Stored so the profile can say why it is on the list. */
export const GAP_SOURCES = Object.freeze(['resume', 'interview', 'role_comparison']);

/**
 * The four categories, and the reason there are four.
 *
 *  skill      Learnable. The advertisement wants a capability the resume does
 *             not evidence. Remediation is a specific learning path, which is
 *             where this feature meets the Career Resources library.
 *  credential Closeable but slow. A named qualification, with an indicative
 *             time and cost so the user can judge whether it is worth it.
 *  evidence   The user has done the thing and the resume does not say so, or
 *             says it so weakly it does not register. Fastest to close and the
 *             largest immediate movement in the score, which makes it the
 *             category that makes the tool feel like it helped.
 *  experience Not closeable in the short term. Remediation is honesty: the
 *             adjacent role they are genuinely competitive for now.
 *
 * The fourth is a deliberate position, not an oversight. A tool that tells every
 * user they can reach any role is worthless; "not this role yet, this one now"
 * is the more useful output and it is what separates this from a motivational
 * feature.
 */
export const GAP_CATEGORIES = Object.freeze(['skill', 'credential', 'evidence', 'experience']);

export const GAP_SEVERITIES = Object.freeze(['blocking', 'significant', 'minor']);

export const GAP_CLOSEABLE = Object.freeze(['now', 'months', 'not_short_term']);

/**
 * open      detected and not yet dealt with
 * closed    detected before, absent from the latest analysis — this is progress
 * dismissed the user said it does not apply — this is NOT progress
 *
 * Keeping dismissed separate from closed is the whole reason there are three
 * values. Collapsing them would let a user clear their board by disagreeing
 * with it and be congratulated for improving.
 */
export const GAP_STATUSES = Object.freeze(['open', 'closed', 'dismissed']);

/**
 * Severity weights for the progress figure.
 *
 * Progress is deliberately not a raw count. Closing three minor gaps is not
 * three times the achievement of closing one blocking gap, and a percentage
 * built on counts would say it is — so someone who fixed a date format outranks
 * someone who earned the qualification the job requires.
 */
export const GAP_SEVERITY_WEIGHT = Object.freeze({
  blocking: 5,
  significant: 3,
  minor: 1,
});

/** Most gaps a single extraction may produce. Beyond this it stops being a plan. */
export const GAP_CAP = 8;

/** Longest key stored, after the category prefix. */
const GAP_SLUG_MAX = 48;

/**
 * Resume sections an evidence gap may be keyed to.
 *
 * An evidence gap is about a place in the document rather than about a subject,
 * so its key names the section: `evidence:work-experience`. Fixing the bullets
 * under Work Experience and re-running should close it, and that only works if
 * both runs agree on what the section is called. Anything outside this list is
 * slugged as given and still stores fine — the list is what keeps the common
 * cases aligned, not a validation gate.
 */
export const EVIDENCE_SECTIONS = Object.freeze([
  'summary',
  'work-experience',
  'education',
  'skills',
  'projects',
  'achievements',
  'certifications',
  'training',
  'publications',
  'extracurricular',
  'languages',
  'references',
  'contact',
]);

/* ── Mock interview ─────────────────────────────────────────────────────── */

/**
 * Five questions, fixed.
 *
 * The binding constraint on this feature is the free-tier daily request cap, not
 * the model's ability to hold a conversation. A turn-by-turn interview is twelve
 * or more calls and would exhaust the allowance inside a single client
 * demonstration. Generating all five in one call and evaluating the whole
 * transcript in a second produces the same user-visible output for two calls,
 * which is roughly six times the demonstration headroom.
 */
export const INTERVIEW_QUESTION_COUNT = 5;

/**
 * The mix, and which of them is worth demonstrating.
 *
 * Two behavioural, two role-specific, one aimed at a gap the resume review
 * already found. The last one is the item to show a client, because it visibly
 * proves the two features are connected rather than bolted together. With no
 * gaps on file there is nothing honest to aim at, so the slot becomes a third
 * role-specific question rather than an invented weakness.
 */
export const INTERVIEW_QUESTION_KINDS = Object.freeze(['behavioural', 'role_specific', 'gap_targeted']);

export const INTERVIEW_MIX = Object.freeze({ behavioural: 2, role_specific: 2, gap_targeted: 1 });

/** Input tiers. Quality degrades with them; the interview always runs. */
export const INTERVIEW_TIERS = Object.freeze([1, 2, 3]);

/**
 * Longest job advertisement accepted, in characters.
 *
 * Users paste whole pages, navigation and footer included. Matches the cap the
 * resume review already applies to the same field.
 */
export const JOB_AD_MAX_CHARS = 4000;

/** Longest single answer accepted. Long enough for a full STAR response. */
export const ANSWER_MAX_CHARS = 2500;

/** Longest role title accepted, matching the review's target-role cap. */
export const ROLE_MAX_CHARS = 120;

/**
 * Completion parameters for both interview calls.
 *
 * Warmer than the reviewer's 0.1 because five identical-sounding questions is a
 * worse failure here than a little variance, and every field is still validated
 * against a schema. The ceiling is lower than the reviewer's 6144: the longest
 * response this feature produces is an evaluation of five answers, which is well
 * under half a review.
 */
export const INTERVIEW_COMPLETION_PARAMS = Object.freeze({
  temperature: 0.4,
  max_tokens: 4096,
});

/** Gap extraction is a classification task, so it gets the reviewer's temperature. */
export const GAP_COMPLETION_PARAMS = Object.freeze({
  temperature: 0.15,
  max_tokens: 3072,
});

/* ── Key normalisation ──────────────────────────────────────────────────── */

/**
 * Turns free text into the slug half of a gap key.
 *
 * Unicode-aware on purpose. A Bangla review is asked to keep gap keys in
 * English, and mostly does, but an ASCII-only slugger turns a Bangla key into
 * the empty string — which would then collide with every other empty key and
 * silently merge unrelated gaps into one row. Keeping letters and digits of any
 * script means a key that ignored the instruction is still stable and still its
 * own record.
 */
function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, GAP_SLUG_MAX)
    .replace(/-+$/g, '');
}

/**
 * Normalises a gap key to `category:slug`.
 *
 * Accepts what the model actually sends rather than what it was asked to send:
 * with or without the prefix, with the wrong prefix, with capitals, with spaces
 * around the colon. The category argument is the authority when the two
 * disagree, because it is validated separately against GAP_CATEGORIES and the
 * prefix is not.
 *
 * @param {string} raw the model's gap_key
 * @param {string} [category] the gap's validated category
 * @returns {string|null} `category:slug`, or null when nothing usable is left
 */
export function normaliseGapKey(raw, category) {
  const text = String(raw ?? '').trim();
  const colon = text.indexOf(':');

  const prefix = colon === -1 ? '' : text.slice(0, colon).trim().toLowerCase();
  const rest = colon === -1 ? text : text.slice(colon + 1);

  const resolvedCategory = GAP_CATEGORIES.includes(category)
    ? category
    : GAP_CATEGORIES.includes(prefix)
      ? prefix
      : null;

  if (!resolvedCategory) return null;

  // A key of "skill:skill" or a bare "skill" carries no subject. Dropping the
  // gap is right: an unidentifiable gap cannot be tracked across analyses, which
  // is the only thing storing it would be for.
  const slug = slugify(colon === -1 && GAP_CATEGORIES.includes(prefix) ? '' : rest);
  if (!slug || slug === resolvedCategory) return null;

  return `${resolvedCategory}:${slug}`;
}

/** The category half of a stored key, for grouping without a second column. */
export function categoryOfGapKey(gapKey) {
  const prefix = String(gapKey ?? '').split(':')[0];
  return GAP_CATEGORIES.includes(prefix) ? prefix : null;
}

/**
 * Severity-weighted progress across a set of gaps.
 *
 * Dismissed gaps are excluded from both halves rather than counted as closed.
 * A user who dismisses everything has a board with nothing on it and no
 * progress, which is the truthful reading of what they did.
 *
 * @param {Array<{severity: string, status: string}>} gaps
 * @returns {{open: number, closed: number, dismissed: number, weightOpen: number,
 *            weightClosed: number, percent: number}}
 */
export function summariseGapProgress(gaps = []) {
  let open = 0, closed = 0, dismissed = 0, weightOpen = 0, weightClosed = 0;

  for (const gap of gaps) {
    const weight = GAP_SEVERITY_WEIGHT[gap?.severity] ?? GAP_SEVERITY_WEIGHT.minor;
    if (gap?.status === 'closed') { closed++; weightClosed += weight; continue; }
    if (gap?.status === 'dismissed') { dismissed++; continue; }
    open++; weightOpen += weight;
  }

  const total = weightOpen + weightClosed;
  return {
    open,
    closed,
    dismissed,
    weightOpen,
    weightClosed,
    percent: total === 0 ? 0 : Math.round((weightClosed / total) * 100),
  };
}
