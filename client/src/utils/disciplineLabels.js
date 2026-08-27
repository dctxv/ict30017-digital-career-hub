/**
 * Discipline names come from the database via /api/disciplines — they are
 * data, not frontend copy, so there's no `name_bn` column to translate them
 * properly server-side (only the `resources` table has that). This is a
 * pragmatic frontend-only stand-in: a fixed lookup from the known discipline
 * names to an i18next key, used purely for display.
 *
 * The raw English name from the API is always what's kept in state and used
 * for filtering/matching (`p.discipline === disc`, etc.) — only the label
 * shown to the user goes through this. Any discipline not in the map (e.g.
 * a new one added to the database later) simply renders as-is in English
 * rather than breaking, the same soft-fallback behaviour as i18next itself.
 */
export const disciplineLabelKeys = {
  'IT': 'disciplines.it',
  'Finance': 'disciplines.finance',
  'Science': 'disciplines.science',
  'Engineering': 'disciplines.engineering',
  'Business': 'disciplines.business',
  'Arts': 'disciplines.arts',
  'Education': 'disciplines.education',
}

/** @param {string} name @param {(key: string) => string} t */
export function disciplineLabel(name, t) {
  const key = disciplineLabelKeys[name]
  return key ? t(key) : name
}
