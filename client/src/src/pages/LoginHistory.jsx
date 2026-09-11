import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiGet } from '../api/apiClient'
import './LoginHistory.css'

const EVENT_LABELS = {
  login_success: { label: 'Signed in', icon: '✅', kind: 'success' },
  login_success_trusted_device: { label: 'Signed in (trusted device)', icon: '✅', kind: 'success' },
  login_success_oauth: { label: 'Signed in via OAuth', icon: '✅', kind: 'success' },
  login_failed_bad_password: { label: 'Failed attempt', icon: '⚠️', kind: 'warn' },
  otp_failed: { label: 'Wrong OTP code', icon: '⚠️', kind: 'warn' },
  login_blocked_lockout: { label: 'Blocked (account locked)', icon: '🔒', kind: 'danger' },
  account_locked: { label: 'Account locked', icon: '🔒', kind: 'danger' },
  logout: { label: 'Signed out', icon: '👋', kind: 'neutral' },
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  return `${Math.floor(hr / 24)} days ago`
}

function formatBrowser(ua) {
  if (!ua) return 'Unknown device'
  if (/Edge\/|Edg\//i.test(ua)) return 'Microsoft Edge'
  if (/Firefox\/([\d.]+)/i.test(ua)) return `Firefox ${ua.match(/Firefox\/([\d.]+)/i)[1].split('.')[0]}`
  if (/Chrome\/([\d.]+)/i.test(ua) && !/Chromium/i.test(ua)) return `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1].split('.')[0]}`
  if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari'
  if (/curl/i.test(ua)) return 'cURL / API client'
  return ua.slice(0, 40)
}

function formatOS(ua) {
  if (!ua) return ''
  if (/Windows NT 10/i.test(ua)) return 'Windows 10/11'
  if (/Windows NT 6/i.test(ua)) return 'Windows 7/8'
  if (/Mac OS X/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad/i.test(ua)) return 'iOS'
  return ''
}

export default function LoginHistory() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    apiGet('/api/users/me/login-history')
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEvents(Array.isArray(data) ? data : [])
      })
      .catch(err => setError(err.message || 'Could not load history.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? events : events.filter(e => {
    const meta = EVENT_LABELS[e.event_type]
    if (filter === 'success') return meta?.kind === 'success'
    if (filter === 'failed') return meta?.kind === 'warn' || meta?.kind === 'danger'
    return true
  })

  return (
    <div className="page-enter lh-page">
      <Navbar />
      <div className="lh-container">
        <div className="lh-card">
          <div className="lh-header">
            <div>
              <p className="lh-eyebrow">ACCOUNT SECURITY</p>
              <h1>Login history</h1>
              <p className="lh-sub">The last 50 authentication events on your account. Flag anything you don't recognise.</p>
            </div>
            <Link to="/security/sessions" className="lh-back">← Sessions</Link>
          </div>

          <div className="lh-toolbar">
            <select
              className="lh-filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All events</option>
              <option value="success">Successful logins</option>
              <option value="failed">Failures &amp; blocks</option>
            </select>
            <span className="lh-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading && <p className="lh-empty">Loading…</p>}
          {error && <p className="lh-error">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <p className="lh-empty">No events to show.</p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="lh-list">
              {filtered.map((ev, i) => {
                const meta = EVENT_LABELS[ev.event_type] || { label: ev.event_type, icon: '•', kind: 'neutral' }
                const browser = formatBrowser(ev.user_agent)
                const os = formatOS(ev.user_agent)
                return (
                  <div key={i} className={`lh-row lh-row--${meta.kind}`}>
                    <span className="lh-icon">{meta.icon}</span>
                    <div className="lh-info">
                      <strong>{meta.label}</strong>
                      <p className="lh-meta">
                        {browser}{os ? ` · ${os}` : ''}{ev.ip_address ? ` · ${ev.ip_address}` : ''}
                      </p>
                    </div>
                    <span className="lh-time" title={new Date(ev.created_at).toLocaleString()}>
                      {timeAgo(ev.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="lh-tip">
            <span>🔐</span>
            <p>See an event you don't recognise? <Link to="/reset-password" className="lh-link">Reset your password</Link> and <Link to="/security/sessions" className="lh-link">revoke all sessions</Link> immediately.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
