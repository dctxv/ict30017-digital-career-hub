/**
 * Component: SecurityScore
 * Displays the account's security score as a circular meter with a breakdown
 * of which factors are achieved and which are missing.
 *
 * Data is fetched from GET /api/users/me/security-score.
 *
 * Usage:
 *   <SecurityScore />
 *
 * The component is self-contained — it fetches, handles loading/error states,
 * and renders the full widget. Drop it anywhere on the Profile security tab.
 */

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const API_URL = '/api/users/me/security-score';

function ring(score) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return { circ, filled };
}

function scoreColor(score) {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444';                  // red
}

function scoreLabel(score) {
  if (score >= 80) return 'Strong';
  if (score >= 50) return 'Fair';
  return 'Weak';
}

export default function SecurityScore() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.placeholder}>Loading security score…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
          <ShieldAlert size={20} />
          <span>Could not load security score.</span>
        </div>
      </div>
    );
  }

  const { score, factors, recentFailedLogins } = data;
  const color = scoreColor(score);
  const { circ, filled } = ring(score);

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>
        <Shield size={18} style={{ color }} />
        Security Score
      </h3>

      {/* Circular meter */}
      <div style={styles.meterRow}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="44" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="55" cy="55" r="44"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
          <text x="55" y="51" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>
            {score}
          </text>
          <text x="55" y="67" textAnchor="middle" fontSize="11" fill="#64748b">
            {scoreLabel(score)}
          </text>
        </svg>

        {/* Factor list */}
        <ul style={styles.factors}>
          {factors.map(f => (
            <li key={f.label} style={styles.factor}>
              {f.achieved
                ? <ShieldCheck size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                : <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              }
              <span style={{ color: f.achieved ? '#1e293b' : '#64748b' }}>{f.label}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 600, color: f.achieved ? color : '#94a3b8' }}>
                +{f.points}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Warning if recent failures */}
      {recentFailedLogins > 0 && (
        <p style={styles.warning}>
          ⚠️ {recentFailedLogins} failed login attempt{recentFailedLogins !== 1 ? 's' : ''} in the last 7 days.
        </p>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--card-bg, #f8fafc)',
    border: '1px solid var(--border, #e2e8f0)',
    borderRadius: '0.75rem',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text, #1e293b)',
    marginBottom: '1rem',
  },
  meterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  factors: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    minWidth: '180px',
  },
  factor: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  warning: {
    marginTop: '1rem',
    fontSize: '0.85rem',
    color: '#b45309',
    background: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: '0.4rem',
    padding: '0.5rem 0.75rem',
  },
  placeholder: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
};
