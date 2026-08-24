/**
 * Module: prompt
 * Responsibility: Compose the system prompt from the modules that apply to this
 * particular review.
 *
 * The previous design was a single monolith per market mode: everything the
 * reviewer knew, on every request, whether or not it applied. That had two
 * costs. It could not express that a Bdjobs profile and a BPSC form need
 * different rules, and it spent its instruction budget on advice that was
 * irrelevant to the document in hand.
 *
 * Composition fixes both. A request loads the two always-on blocks plus exactly
 * one channel, one employer, one stage and one sector module. The result is
 * smaller than the old Bangladesh prompt while covering far more ground.
 *
 * That size matters for a measured reason, not a theoretical one. Live testing
 * on 2026-08-20 showed this model ignoring a bluntly stated heading rule on five
 * of six resumes at roughly 3,000 tokens. Adding thousands more tokens of
 * conditional logic makes adherence worse, not better. Anything that must be
 * guaranteed is enforced in normalizeResponse, not asked for here.
 */

import { CORE_BLOCK } from './core.js';
import { BANGLADESH_MARKET_BLOCK } from './bangladeshMarket.js';
import { OUTPUT_CONTRACT_BLOCK } from './outputContract.js';
import { channelBlock } from './channels.js';
import { employerBlock } from './employers.js';
import { stageBlock } from './stages.js';
import { sectorBlock } from './sectors.js';
import { normaliseContext, renderContextBlock } from './context.js';

const RULE = '\n\n---\n\n';

/**
 * Builds the system prompt for a review.
 *
 * Accepts either a context object or, for backward compatibility with the
 * two-mode call sites, a bare market mode string.
 *
 * @param {object|string} [input] context object, or 'bangladesh' | 'international'
 * @returns {string}
 */
export function buildSystemPrompt(input = {}) {
  const context = typeof input === 'string'
    ? normaliseContext({ marketMode: input })
    : normaliseContext(input);

  // International reviews still get the Bangladesh market block, because the
  // candidate is still a Bangladeshi applicant whose qualifications, spellings
  // and pathways must be read correctly. The employer module is what tells the
  // model to apply Western conventions to presentation.
  const parts = [
    CORE_BLOCK,
    BANGLADESH_MARKET_BLOCK,
    'MARKET RULES - APPLICATION CHANNEL\n\n' + channelBlock(context.applicationChannel),
    'MARKET RULES - EMPLOYER\n\n' + employerBlock(context.employerType),
    'MARKET RULES - CANDIDATE STAGE\n\n' + stageBlock(context.candidateStage),
    'MARKET RULES - TARGET SECTOR\n\n' + sectorBlock(context.targetSector),
    OUTPUT_CONTRACT_BLOCK,
  ];

  return parts.join(RULE).trim();
}

/**
 * Reports which modules a context resolves to, without building the prompt.
 * Used by the golden snapshot tests and the evaluation harness.
 */
export function resolveModules(input = {}) {
  const context = typeof input === 'string'
    ? normaliseContext({ marketMode: input })
    : normaliseContext(input);

  return {
    channel: context.applicationChannel,
    employer: context.employerType,
    stage: context.candidateStage,
    sector: context.targetSector,
    marketMode: context.marketMode,
  };
}

export { normaliseContext, renderContextBlock };
export * from './context.js';
