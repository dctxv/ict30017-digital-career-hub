/**
 * Module: prompt/context
 * Responsibility: The review context vocabulary, and the delimited block that
 * carries it to the model.
 *
 * Why this exists: the client's standing complaint is that the reviewer has no
 * grasp of Bangladeshi hiring. A large part of that is not missing knowledge but
 * missing situation. Reviewing a Bdjobs structured profile as though it were a
 * one-page Western PDF produces confident, wrong advice, and that reads to a
 * user as cultural ignorance.
 *
 * Bangladesh is not one hiring market. A Bdjobs profile, a direct-email PDF, a
 * multinational ATS submission, a BPSC prescribed form, a donor-funded
 * consultancy CV and an academic CV each expect different content. The BCS
 * application, for instance, mandates a colour photograph at 300x300px and a
 * signature at 300x80px; a photograph on a multinational ATS submission is a
 * liability. The same artefact is required in one channel and harmful in another.
 *
 * Every value is a closed enum. Nothing here is free text, because all of it is
 * interpolated into the system prompt and free text there is an injection route.
 */

/** How the application is being submitted. Controls format and required fields. */
export const APPLICATION_CHANNELS = Object.freeze([
  'bdjobs_profile',
  'direct_pdf',
  'corporate_ats',
  'government_form',
  'ngo_development',
  'consultancy_tender',
  'academic_cv',
  'unknown',
]);

/** Who is hiring. Controls personal details, photographs, references, length. */
export const EMPLOYER_TYPES = Object.freeze([
  'local_traditional',
  'local_modern',
  'multinational',
  'government',
  'ngo_development',
  'academic',
  'consultancy',
  'unknown',
]);

/** Career stage. Controls section ordering and objective versus summary. */
export const CANDIDATE_STAGES = Object.freeze([
  'student',
  'fresher',
  'early_career',
  'experienced',
  'senior',
  'unknown',
]);

/** Target sector. Selects exactly one evidence module, never all of them. */
export const TARGET_SECTORS = Object.freeze([
  'it_software',
  'rmg_manufacturing',
  'banking_finance',
  'ngo_development',
  'civil_engineering',
  'business',
  'academic_research',
  'unknown',
]);

/**
 * Retained for backward compatibility with the two-mode call sites.
 * Market mode is now derived from employer type where one is supplied.
 */
export const MARKET_MODES = Object.freeze(['bangladesh', 'international']);

const ENUMS = {
  applicationChannel: APPLICATION_CHANNELS,
  employerType: EMPLOYER_TYPES,
  candidateStage: CANDIDATE_STAGES,
  targetSector: TARGET_SECTORS,
  marketMode: MARKET_MODES,
};

/**
 * Coerces arbitrary caller input into a safe context object.
 *
 * Anything not in the enum becomes 'unknown' rather than raising, because a
 * stale client sending a retired value should still get a review. The one
 * exception is marketMode, which defaults to bangladesh to preserve existing
 * behaviour.
 *
 * @param {object} [raw]
 * @returns {{applicationChannel: string, employerType: string, candidateStage: string,
 *            targetSector: string, marketMode: string, targetRole: string|null,
 *            renderedPagesAvailable: boolean, hasJobAd: boolean}}
 */
export function normaliseContext(raw = {}) {
  const pick = (key, fallback = 'unknown') => {
    const value = typeof raw?.[key] === 'string' ? raw[key].trim().toLowerCase() : '';
    return ENUMS[key].includes(value) ? value : fallback;
  };

  // Target role is the only free-text field. It is length-capped and stripped of
  // characters that could be used to forge a block delimiter or an instruction.
  const rawRole = typeof raw.targetRole === 'string' ? raw.targetRole : '';
  const targetRole = rawRole
    .replace(/[<>{}\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || null;

  const explicitMode = pick('marketMode', 'bangladesh');
  let employerType = pick('employerType');

  // Legacy two-mode callers pass only marketMode. 'international' meant "apply
  // Western conventions", which is now the multinational employer module, so
  // resolve it to that rather than leaving the employer unknown. Without this
  // the two legacy modes compose to an identical prompt and international
  // reviews silently lose their Western rules.
  if (employerType === 'unknown' && explicitMode === 'international') {
    employerType = 'multinational';
  }

  return {
    applicationChannel: pick('applicationChannel'),
    employerType,
    candidateStage: pick('candidateStage'),
    targetSector: pick('targetSector'),
    marketMode: deriveMarketMode(employerType, explicitMode),
    targetRole,
    renderedPagesAvailable: raw.renderedPagesAvailable === true,
    hasJobAd: Boolean(raw.hasJobAd),
  };
}

/**
 * Market mode is now a consequence of employer type rather than a separate
 * switch the user has to understand.
 *
 * Only a multinational employer implies Western conventions. Everything else,
 * including a modern local technology company, is a Bangladeshi application and
 * keeps the local conventions. When employer type is unknown, the explicitly
 * supplied mode wins so existing callers behave exactly as before.
 */
export function deriveMarketMode(employerType, explicitMode = 'bangladesh') {
  if (employerType === 'multinational') return 'international';
  if (employerType === 'unknown') return MARKET_MODES.includes(explicitMode) ? explicitMode : 'bangladesh';
  return 'bangladesh';
}

/**
 * Renders the context as a delimited block for the user message.
 *
 * Emitted as data with an explicit instruction that it is not instructions.
 * Fields resolving to unknown are omitted rather than sent as the literal
 * "unknown", so the model infers them instead of anchoring on a null value.
 */
export function renderContextBlock(context) {
  const lines = [];
  const add = (key, value) => { if (value && value !== 'unknown') lines.push(`${key}: ${value}`); };

  add('application_channel', context.applicationChannel);
  add('employer_type', context.employerType);
  add('candidate_stage', context.candidateStage);
  add('target_sector', context.targetSector);
  add('target_role', context.targetRole);
  lines.push(`rendered_pages_available: ${context.renderedPagesAvailable ? 'true' : 'false'}`);

  if (lines.length === 1) {
    lines.unshift('(none supplied - infer every field from the resume and state your inference)');
  }

  return `<APPLICATION_CONTEXT>\n${lines.join('\n')}\n</APPLICATION_CONTEXT>`;
}
