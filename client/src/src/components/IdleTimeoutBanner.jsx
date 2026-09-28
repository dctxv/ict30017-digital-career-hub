/**
 * Component: IdleTimeoutBanner
 * Shows a warning banner when the user has been idle for (timeout - warningLeadMs)
 * and counts down to automatic logout. Dismissing the banner resets the idle timer.
 *
 * Props:
 *   timeout        {number}   Total idle time in ms before logout (default 15 min).
 *   warningLeadMs  {number}   How many ms before logout to show the banner (default 2 min).
 *   onLogout       {Function} Called when the countdown reaches zero.
 *
 * Usage:
 *   <IdleTimeoutBanner onLogout={logout} />
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import useIdleTimeout from '../hooks/useIdleTimeout';

const DEFAULT_TIMEOUT_MS    = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING_MS    =  2 * 60 * 1000; // show banner 2 min before logout

export default function IdleTimeoutBanner({
  timeout = DEFAULT_TIMEOUT_MS,
  warningLeadMs = DEFAULT_WARNING_MS,
  onLogout,
}) {
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(warningLeadMs / 1000));
  const countdownRef = useRef(null);

  const clearCountdown = useCallback(() => {
    clearInterval(countdownRef.current);
    countdownRef.current = null;
  }, []);

  const startCountdown = useCallback(() => {
    setSecondsLeft(Math.floor(warningLeadMs / 1000));
    setVisible(true);
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearCountdown();
          onLogout?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [warningLeadMs, onLogout, clearCountdown]);

  const dismiss = useCallback(() => {
    clearCountdown();
    setVisible(false);
    setSecondsLeft(Math.floor(warningLeadMs / 1000));
  }, [warningLeadMs, clearCountdown]);

  // Show the warning banner when idle for (timeout - warningLeadMs)
  useIdleTimeout({
    timeout: timeout - warningLeadMs,
    onIdle: startCountdown,
    enabled: !visible, // Pause the idle watcher while the banner is up
  });

  useEffect(() => () => clearCountdown(), [clearCountdown]);

  if (!visible) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = minutes > 0
    ? `${minutes}m ${String(seconds).padStart(2, '0')}s`
    : `${seconds}s`;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#1e293b',
        color: '#f1f5f9',
        border: '1px solid #f59e0b',
        borderRadius: '0.75rem',
        padding: '1rem 1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        maxWidth: '480px',
        width: 'calc(100vw - 2rem)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.9rem',
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>⚠️</span>
      <span style={{ flex: 1 }}>
        <strong>Session expiring in {formatted}</strong>
        <br />
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
          You've been inactive. Move your mouse or press a key to stay signed in.
        </span>
      </span>
      <button
        onClick={dismiss}
        style={{
          background: '#f59e0b',
          color: '#1e293b',
          border: 'none',
          borderRadius: '0.4rem',
          padding: '0.4rem 0.9rem',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '0.85rem',
        }}
      >
        Stay signed in
      </button>
    </div>
  );
}
