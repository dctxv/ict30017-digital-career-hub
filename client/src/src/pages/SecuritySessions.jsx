import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import RequireAuth from '../components/RequireAuth'
import SecurityScore from '../components/SecurityScore'
import { apiGet, apiPost } from '../api/apiClient'
import './SecuritySessions.css'

// Format a UTC timestamp relative to now.
function timeAgo(isoString) {
  if (!isoString) return '—'
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} days ago`
}

// Human-readable countdown until a session expires.
function expiresIn(isoString) {
  if (!isoString) return ''
  const diffMs = new Date(isoString).getTime() - Date.now()
  if (diffMs <= 0) return 'Expired'
  const mins = Math.ceil(diffMs / 60_000)
  if (mins < 60) return `expires in ${mins} min`
  const hours = Math.ceil(mins / 60)
  return `expires in ${hours} hr`
}

// Truncate a long user-agent string to something readable.
function formatUserAgent(ua) {
  if (!ua) return 'Unknown browser'
  // Try to extract the meaningful browser/OS name.
  const matches = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/) ||
                  ua.match(/(MSIE|Trident)/)
  if (matches) return `${matches[1]} ${matches[2] || ''}`
  return ua.slice(0, 60) + (ua.length > 60 ? '…' : '')
}

function SecuritySessionsInner() {
  const [sessions, setSessions] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState(null) // session id being revoked
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiGet('/api/auth/sessions')
      const data = await res.json()
      if (res.status === 401) {
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth-changed'))
        navigate('/login')
        return
      }
      if (!res.ok) throw new Error(data.error || 'Could not load sessions.')
      setSessions(data.sessions || [])
    } catch (e) {
      setError(e.message || 'Could not load sessions.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { load() }, [load])

  const revoke = async (id) => {
    setError(''); setMessage('')
    setRevoking(id)
    try {
      const res = await apiPost(`/api/auth/sessions/revoke/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not revoke session.')
      setMessage(data.message || 'Session revoked.')
      await load()
    } catch (e) {
      setError(e.message || 'Could not revoke session.')
    } finally {
      setRevoking(null)
    }
  }

  const revokeAll = async () => {
    if (!window.confirm('Revoke all active sessions and sign out everywhere? You will be logged out immediately.')) return
    setError(''); setMessage('')
    try {
      const res = await apiPost('/api/auth/sessions/revoke-all')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not revoke sessions.')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth-changed'))
      navigate('/login')
    } catch (e) {
      setError(e.message || 'Could not revoke sessions.')
    }
  }

  return (
    <div className="page-enter">
      <Navbar />
      <main className="security-page">
        <SecurityScore />
        <div className="security-card">
          <div className="security-heading">
            <div>
              <p className="security-eyebrow">ACCOUNT SECURITY</p>
              <h1>Security &amp; sessions</h1>
              <p>Review active login sessions. Revoke any session you don't recognise to immediately sign out that device.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <Link to="/security/login-history" className="security-back">Login history →</Link>
              <Link to="/" className="security-back" style={{ fontWeight: 400, fontSize: '13px' }}>← Back to home</Link>
            </div>
          </div>

          {message && <div className="security-success" role="alert">{message}</div>}
          {error && <div className="security-error" role="alert">{error}</div>}

          <div className="security-actions">
            <button className="danger-button" onClick={revokeAll}>
              Sign out all devices
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No active sessions found.</p>
          ) : (
            <div className="session-list">
              {sessions.map(s => (
                <div className={`session-row ${s.current ? 'session-row--current' : ''}`} key={s.id}>
                  <div className="session-icon" aria-hidden="true">
                    {s.current ? '🔒' : '💻'}
                  </div>
                  <div className="session-info">
                    <strong>{s.current ? 'This device (current session)' : 'Active session'}</strong>
                    <div className="session-meta">
                      {formatUserAgent(s.user_agent)}
                      {s.ip_address && <> · <span title="IP address">{s.ip_address}</span></>}
                    </div>
                    <div className="session-meta">
                      Last active: {timeAgo(s.last_seen_at)}
                      {' · '}
                      <span style={{ color: s.current ? 'var(--text-muted)' : 'inherit' }}>
                        {expiresIn(s.expires_at)}
                      </span>
                    </div>
                    <div className="session-meta" style={{ fontSize: '11px', opacity: 0.6 }}>
                      Started: {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className={`session-revoke ${s.current ? 'session-revoke--current' : ''}`}
                    onClick={() => revoke(s.id)}
                    disabled={revoking === s.id}
                    aria-label={s.current ? 'Revoke current session (you will be logged out)' : `Sign out session from ${formatUserAgent(s.user_agent)}`}
                  >
                    {revoking === s.id ? 'Revoking…' : s.current ? 'Revoke (log out)' : 'Sign out'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-subtle, #f8f9fa)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Security tip:</strong> If you see a session you don't recognise, revoke it immediately and{' '}
            <Link to="/forgot-password" className="link-green">change your password</Link>.
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SecuritySessions() {
  return (
    <RequireAuth>
      <SecuritySessionsInner />
    </RequireAuth>
  )
}
