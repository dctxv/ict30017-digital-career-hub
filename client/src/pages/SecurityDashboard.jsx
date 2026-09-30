import { useState, useEffect, useCallback } from 'react'
import { Shield, Lock, Users, Activity, Clock, RefreshCw, ChevronDown, ChevronUp, Unlock, XCircle } from 'lucide-react'
import Navbar from '../components/Navbar'

const API = (path) => `/api/security${path}`

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function StatCard({ icon: Icon, label, value, color = '#6366f1', sub }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: color + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, color: 'var(--text)' }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Badge({ type }) {
  const map = {
    register:       { color: '#22c55e', label: 'register' },
    login:          { color: '#6366f1', label: 'login' },
    login_failure:  { color: '#f59e0b', label: 'login fail' },
    otp_sent:       { color: '#06b6d4', label: 'OTP sent' },
    otp_verified:   { color: '#22c55e', label: 'OTP ok' },
    otp_failed:     { color: '#ef4444', label: 'OTP fail' },
    password_reset: { color: '#f59e0b', label: 'pwd reset' },
    logout:         { color: '#94a3b8', label: 'logout' },
  }
  const { color, label } = map[type] ?? { color: '#94a3b8', label: type || '—' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em',
      background: color + '22', color,
    }}>{label}</span>
  )
}

export default function SecurityDashboard() {
  const [stats, setStats]     = useState(null)
  const [logs, setLogs]       = useState([])
  const [locked, setLocked]   = useState([])
  const [sessions, setSessions] = useState([])
  const [tab, setTab]         = useState('audit')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [logFilter, setLogFilter] = useState('')
  const [expandedLog, setExpandedLog] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [s, l, lk, ss] = await Promise.all([
        fetch(API('/stats')).then(r => r.json()),
        fetch(API('/audit-logs?limit=100')).then(r => r.json()),
        fetch(API('/locked-accounts')).then(r => r.json()),
        fetch(API('/active-sessions')).then(r => r.json()),
      ])
      if (s.error) { setError(s.error); return }
      setStats(s)
      setLogs(l.logs || [])
      setLocked(lk.accounts || [])
      setSessions(ss.sessions || [])
    } catch {
      setError('Failed to load security data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function unlockAccount(userId) {
    await fetch(API(`/unlock/${userId}`), { method: 'POST' })
    setLocked(prev => prev.filter(a => a.user_id !== userId))
    setStats(prev => prev ? { ...prev, lockedAccounts: prev.lockedAccounts - 1 } : prev)
  }

  async function revokeSession(id) {
    await fetch(API(`/revoke-session/${id}`), { method: 'POST' })
    setSessions(prev => prev.filter(s => s.id !== id))
    setStats(prev => prev ? { ...prev, activeSessions: Math.max(0, prev.activeSessions - 1) } : prev)
  }

  const filteredLogs = logFilter
    ? logs.filter(l => (l.event_type || '').includes(logFilter))
    : logs

  const tabs = [
    { id: 'audit',    label: 'Audit Log',       count: logs.length },
    { id: 'locked',   label: 'Locked Accounts', count: locked.length },
    { id: 'sessions', label: 'Active Sessions',  count: sessions.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={26} color="#6366f1" />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Security Dashboard</h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>Audit logs · Sessions · Locked accounts</p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <StatCard icon={Users}    label="Total Users"       value={stats?.totalUsers}     color="#6366f1"
            sub={stats ? `${stats.verifiedUsers} verified` : null} />
          <StatCard icon={Lock}     label="Locked Accounts"   value={stats?.lockedAccounts}  color="#ef4444" />
          <StatCard icon={Activity} label="Active Sessions"    value={stats?.activeSessions}  color="#22c55e" />
          <StatCard icon={Clock}    label="Events (24h)"       value={stats?.auditEvents24h}  color="#f59e0b" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '0.6rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
              color: tab === t.id ? '#6366f1' : 'var(--muted)',
              borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent',
              fontWeight: tab === t.id ? 600 : 400, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {t.label}
              <span style={{
                background: tab === t.id ? '#6366f122' : 'var(--border)',
                color: tab === t.id ? '#6366f1' : 'var(--muted)',
                borderRadius: 999, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700,
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading…</div>}

        {/* Audit Log tab */}
        {!loading && tab === 'audit' && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['', 'login_failure', 'otp_failed', 'register', 'login'].map(f => (
                <button key={f} onClick={() => setLogFilter(f)} style={{
                  padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.75rem',
                  border: '1px solid var(--border)',
                  background: logFilter === f ? '#6366f1' : 'var(--card-bg)',
                  color: logFilter === f ? '#fff' : 'var(--muted)',
                  cursor: 'pointer',
                }}>
                  {f || 'All'}
                </button>
              ))}
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Event', 'Email', 'IP', 'Details'].map(h => (
                      <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: '0.75rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No events found.</td></tr>
                  )}
                  {filteredLogs.map((log, i) => (
                    <>
                      <tr key={log.log_id || i} style={{
                        borderBottom: '1px solid var(--border)',
                        background: i % 2 === 0 ? 'transparent' : 'var(--card-bg)',
                      }}>
                        <td style={{ padding: '0.6rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }} title={formatDate(log.created_at)}>
                          {timeAgo(log.created_at)}
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}><Badge type={log.event_type} /></td>
                        <td style={{ padding: '0.6rem 1rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.email || '—'}
                        </td>
                        <td style={{ padding: '0.6rem 1rem', color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {log.ip_address || '—'}
                        </td>
                        <td style={{ padding: '0.6rem 1rem' }}>
                          {log.metadata && (
                            <button onClick={() => setExpandedLog(expandedLog === (log.log_id || i) ? null : (log.log_id || i))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                              {expandedLog === (log.log_id || i) ? <ChevronUp size={12} /> : <ChevronDown size={12} />} meta
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedLog === (log.log_id || i) && log.metadata && (
                        <tr key={`meta-${i}`} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td colSpan={5} style={{ padding: '0.5rem 1rem 0.75rem', background: 'var(--card-bg)' }}>
                            <pre style={{ margin: 0, fontSize: '0.72rem', color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Locked Accounts tab */}
        {!loading && tab === 'locked' && (
          <div>
            {locked.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <Lock size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No locked accounts right now.</p>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
                      {['Email', 'Name', 'Failed Attempts', 'Locked Until', 'Action'].map(h => (
                        <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: '0.75rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {locked.map((acc, i) => (
                      <tr key={acc.user_id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--card-bg)' }}>
                        <td style={{ padding: '0.7rem 1rem' }}>{acc.email}</td>
                        <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)' }}>{acc.full_name || '—'}</td>
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>{acc.failed_login_attempts}</span>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)', fontSize: '0.75rem' }}>
                          {formatDate(acc.lockout_until)}
                        </td>
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <button onClick={() => unlockAccount(acc.user_id)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.3rem 0.75rem', borderRadius: 6,
                            border: '1px solid #22c55e', background: '#22c55e22',
                            color: '#22c55e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                          }}>
                            <Unlock size={12} /> Unlock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Active Sessions tab */}
        {!loading && tab === 'sessions' && (
          <div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <Activity size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No active sessions.</p>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
                      {['User', 'IP', 'Last Seen', 'Expires', 'Browser', 'Action'].map(h => (
                        <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: '0.75rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--card-bg)' }}>
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <div style={{ fontWeight: 500 }}>{s.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.full_name}</div>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {s.ip_address || '—'}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)' }} title={formatDate(s.last_seen_at)}>
                          {timeAgo(s.last_seen_at)}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)', fontSize: '0.75rem' }} title={formatDate(s.expires_at)}>
                          {timeAgo(s.expires_at)}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--muted)', fontSize: '0.72rem' }}>
                          {s.user_agent ? s.user_agent.replace(/Mozilla\/[\d.]+ \(.*?\) /, '') : '—'}
                        </td>
                        <td style={{ padding: '0.7rem 1rem' }}>
                          <button onClick={() => revokeSession(s.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.3rem 0.75rem', borderRadius: 6,
                            border: '1px solid #ef4444', background: '#ef444422',
                            color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                          }}>
                            <XCircle size={12} /> Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        :root {
          --bg: #0f1117;
          --card-bg: #1a1d27;
          --border: #2a2d3d;
          --text: #e2e8f0;
          --muted: #64748b;
        }
        @media (prefers-color-scheme: light) {
          :root:not([data-theme="dark"]) {
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --border: #e2e8f0;
            --text: #0f172a;
            --muted: #64748b;
          }
        }
        :root[data-theme="light"] {
          --bg: #f8fafc;
          --card-bg: #ffffff;
          --border: #e2e8f0;
          --text: #0f172a;
          --muted: #64748b;
        }
      `}</style>
    </div>
  )
}
