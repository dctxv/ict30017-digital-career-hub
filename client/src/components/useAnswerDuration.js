/**
 * How long an answer took, rendered for a reader.
 *
 * Its own file rather than a second export from LiveInterview.jsx: a module
 * that exports both components and plain functions breaks fast refresh, and
 * the results screen needs this without needing the interview runner.
 *
 * Not a bare template string, because both halves of the output are localised.
 * The digits go through n() so a Bangla reader sees Bengali numerals, and the
 * unit words are translated rather than assumed to be "m" and "s".
 */

import { useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'

export function useAnswerDuration() {
  const { t, n } = useLanguage()

  return useCallback((totalSeconds) => {
    const whole = Math.max(0, Math.round(Number(totalSeconds) || 0))
    if (whole < 60) return t('prep.durationSeconds', { seconds: n(whole) })
    // Padded only in the minutes form, where an unpadded "3m 4s" reads as a
    // decimal rather than as three minutes and four seconds.
    return t('prep.durationMinutes', {
      minutes: n(Math.floor(whole / 60)),
      seconds: n(String(whole % 60).padStart(2, '0')),
    })
  }, [t, n])
}
