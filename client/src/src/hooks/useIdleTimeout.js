/**
 * Hook: useIdleTimeout
 * Detects user inactivity and calls back when the idle threshold is reached.
 *
 * Activity events monitored: mousemove, mousedown, keydown, touchstart, scroll.
 * The timer resets on any of those. When the timeout elapses with no activity
 * the `onIdle` callback fires.
 *
 * Usage:
 *   useIdleTimeout({ timeout: 15 * 60 * 1000, onIdle: () => logout() });
 *
 * @param {object} options
 * @param {number} options.timeout   Milliseconds of inactivity before onIdle fires.
 * @param {Function} options.onIdle  Called once when the idle threshold is reached.
 * @param {boolean} [options.enabled=true] Set false to skip the whole hook.
 *
 * References:
 *   MDN — Idle Detection: mousemove, keydown, touchstart, scroll events.
 */

import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export default function useIdleTimeout({ timeout, onIdle, enabled = true }) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // Keep the ref current so the timer closure always calls the latest callback
  // without needing it as a dependency (which would restart the timer on every render).
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;

    function resetTimer() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onIdleRef.current?.(), timeout);
    }

    resetTimer(); // Start immediately

    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, resetTimer, { passive: true })
    );

    return () => {
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach(evt =>
        window.removeEventListener(evt, resetTimer)
      );
    };
  }, [timeout, enabled]);
}
