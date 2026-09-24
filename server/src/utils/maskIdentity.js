/**
 * Module: utils/maskIdentity
 * Responsibility: Combine what the outbound PII mask knows about a candidate.
 *
 * The mask masks names as known strings (see ai-service utils/piiMask). There
 * are two sources for them on an upload: the account row, which a guest does
 * not have and which often holds a different form of the name ("Jess" for
 * "Jessica", no accents, no middle name), and the name the parser read off the
 * CV's largest type. Both are passed, so either one is enough.
 */

/**
 * @param {{fullName?: string|null, email?: string|null, phone?: string|null, extraNames?: string[]}|null} identity
 * @param {string|null|undefined} nameHint
 * @returns {object|null} the identity with the hint added to extraNames, or
 *   the identity unchanged when there is no hint
 */
export function withNameHint(identity, nameHint) {
  if (!nameHint) return identity;
  return {
    ...(identity ?? {}),
    extraNames: [...(identity?.extraNames ?? []), nameHint],
  };
}
