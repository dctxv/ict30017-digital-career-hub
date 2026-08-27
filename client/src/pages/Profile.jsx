import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Gauge, History, Lock, Shield, ChevronDown, CheckCircle2, ShieldAlert,
  FileText, Download, ShieldCheck,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import ConfirmPasswordDialog from '../components/ConfirmPasswordDialog'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import {
  ApiError, fetchProfile, updateProfile, changePassword, exportAccountData,
  deleteAccount, fetchSubscription, fetchReviewHistory, fetchReviewQuota, fetchChatQuota,
} from '../api/account'
import './Profile.css'

const TABS = [
  { key: 'account', icon: User, labelKey: 'profile.tabAccount' },
  { key: 'plan', icon: Gauge, labelKey: 'profile.tabPlan' },
  { key: 'history', icon: History, labelKey: 'profile.tabHistory' },
  { key: 'security', icon: Lock, labelKey: 'profile.tabSecurity' },
  { key: 'privacy', icon: Shield, labelKey: 'profile.tabPrivacy' },
]

const FALLBACK_DISCIPLINES = ['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

const EDITABLE = ['full_name', 'email', 'discipline', 'institution', 'graduation_year']

function initialsOf(name) {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase() || '?'
}

/* A meter, or the word "unlimited". Rendering a bar at 0% for an account with
   no cap would say the opposite of what it means. */
function UsageMeter({ label, used, limit, unlimited }) {
  const { t, n } = useLanguage()
  const percent = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100))

  return (
    <div className="usage">
      <div className="usage__row">
        <span>{label}</span>
        <span className="usage__value">
          {unlimited ? `${n(used)} · ${t('profile.unlimited')}` : `${n(used)} / ${n(limit)}`}
        </span>
      </div>
      {!unlimited && (
        <div className="usage__track">
          <span className="usage__fill" style={{ width: `${percent}%` }} />
        </div>
      )}
      <p className="usage__note">
        {unlimited
          ? t('profile.noDailyCap')
          : t('profile.leftToday', { count: n(Math.max(0, limit - used)) })}
      </p>
    </div>
  )
}

export default function Profile() {
  const { t, n, lang, setLang } = useLanguage()
  const { user, login, clearSession, refresh } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('account')
  const [profile, setProfile] = useState(null)
  const [draft, setDraft] = useState(null)
  const [disciplines, setDisciplines] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [history, setHistory] = useState([])
  const [reviewQuota, setReviewQuota] = useState(null)
  const [chatQuota, setChatQuota] = useState(null)

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    let cancelled = false
    fetchProfile()
      .then(data => {
        if (cancelled) return
        setProfile(data)
        setDraft(data)
      })
      .catch(err => { if (!cancelled) setError(err.message || t('profile.loadFailed')) })
    return () => { cancelled = true }
  }, [t])

  useEffect(() => {
    fetchSubscription().then(setSubscription).catch(() => setSubscription(null))
    fetchReviewQuota().then(setReviewQuota).catch(() => {})
    fetchChatQuota().then(setChatQuota).catch(() => {})
    fetchReviewHistory()
      .then(rows => setHistory(Array.isArray(rows) ? rows : []))
      .catch(() => setHistory([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/disciplines?lang=${lang}`)
      .then(response => (response.ok ? response.json() : []))
      .then(data => { if (!cancelled) setDisciplines(Array.isArray(data) ? data : []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [lang])

  const disciplineOptions = disciplines.length > 0
    ? disciplines.map(row => ({ value: row.name, label: (lang === 'bn' && row.name_bn) || row.name }))
    : FALLBACK_DISCIPLINES.map(name => ({ value: name, label: name }))

  const dirty = useMemo(() => {
    if (!profile || !draft) return false
    return EDITABLE.some(key => (draft[key] ?? '') !== (profile[key] ?? ''))
  }, [profile, draft])

  const emailChanged = Boolean(profile && draft && draft.email !== profile.email)

  const set = (key) => (event) => {
    const { value } = event.target
    setDraft(current => ({ ...current, [key]: value }))
    setSaved(false)
    setError('')
  }

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const formatDateTime = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  }

  /* ── Actions ─────────────────────────────────────────────────────── */

  const saveProfile = async (currentPassword) => {
    setBusy(true)
    setError('')
    try {
      const payload = Object.fromEntries(EDITABLE.map(key => [key, draft[key] ?? '']))
      if (currentPassword) payload.currentPassword = currentPassword

      const updated = await updateProfile(payload)
      setProfile(updated)
      setDraft(updated)
      setSaved(true)
      setConfirm(null)
      // The navbar shows the name and the session cache holds it, so a rename
      // that only updated this page would leave two different names on screen.
      login({ ...user, full_name: updated.full_name, email: updated.email })
    } catch (err) {
      setError(err.message || t('profile.saveFailed'))
      if (err instanceof ApiError && err.status === 401) setConfirm(null)
    } finally {
      setBusy(false)
    }
  }

  const submitProfile = (event) => {
    event.preventDefault()
    // The server requires the password for an email change; asking here means
    // the user is told before the request rather than by a rejection.
    if (emailChanged) { setConfirm('email'); return }
    saveProfile()
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)

    if (passwords.next !== passwords.confirm) {
      setError(t('auth.passwordsMismatch'))
      return
    }

    setBusy(true)
    try {
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: '', next: '', confirm: '' })
      setSaved(true)
    } catch (err) {
      setError(err.message || t('profile.passwordFailed'))
    } finally {
      setBusy(false)
    }
  }

  const downloadData = async () => {
    setError('')
    try {
      const data = await exportAccountData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'career-hub-data.json'
      anchor.click()
      // Released on a timer rather than immediately: revoking before the
      // browser has started the download cancels it in Safari.
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (err) {
      setError(err.message || t('profile.exportFailed'))
    }
  }

  const confirmDelete = async (password) => {
    setBusy(true)
    setError('')
    try {
      await deleteAccount(password)
      clearSession()
      navigate('/')
    } catch (err) {
      setError(err.message || t('profile.deleteFailed'))
    } finally {
      setBusy(false)
    }
  }

  const changeLanguage = async (next) => {
    setLang(next)
    // Stored against the account so the choice follows the user to another
    // device, rather than living only in this browser's localStorage.
    try {
      await updateProfile({ preferred_language: next })
      await refresh()
    } catch {
      // The interface has already switched; failing to persist it is not worth
      // an error banner over.
    }
  }

  const tier = profile?.tier ?? user?.tier ?? 'free'
  const isPremium = tier === 'premium'
  const bestScore = history.length > 0 ? Math.max(...history.map(row => row.overall_score ?? 0)) : null
  const trend = history.slice(0, 8).reverse()

  return (
    <div className="page-enter">
      <Navbar />

      <section className="pf-head">
        <div className="shell pf-head__inner">
          <span className="pf-head__avatar">{initialsOf(profile?.full_name ?? user?.full_name)}</span>
          <div className="pf-head__text">
            <h1 className="pf-head__name">{profile?.full_name ?? user?.full_name ?? '—'}</h1>
            <p className="pf-head__email">{profile?.email ?? user?.email ?? ''}</p>
          </div>
          <div className="pf-head__meta">
            <span className={`tag ${isPremium ? 'tag--solid' : 'tag--accent'} pf-head__tier`}>
              {isPremium ? t('auth.tierPremium') : t('auth.tierFree')}
            </span>
            <span className="pf-head__since">
              {t('profile.memberSince', { date: formatDate(profile?.created_at) })}
            </span>
          </div>
        </div>
      </section>

      <section className="pf-body">
        <nav className="pf-rail" aria-label={t('profile.title')}>
          {TABS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                className={`pf-tab${tab === item.key ? ' pf-tab--on' : ''}`}
                onClick={() => { setTab(item.key); setSaved(false); setError('') }}
                aria-current={tab === item.key}
              >
                <Icon size={16} />
                {t(item.labelKey)}
              </button>
            )
          })}
        </nav>

        <div className="pf-panel">
          {error && <p className="notice notice--error" role="alert">{error}</p>}

          {tab === 'account' && (
            <form className="card" onSubmit={submitProfile}>
              <p className="card__title">{t('profile.accountTitle')}</p>
              <p className="card__sub">{t('profile.accountSub')}</p>

              <div className="field-grid">
                <label className="field">
                  <span className="field__label">{t('auth.fullNameLabel')}</span>
                  <input className="input" value={draft?.full_name ?? ''} onChange={set('full_name')} />
                </label>

                <label className="field">
                  <span className="field__label">{t('auth.emailLabel')}</span>
                  <input className="input" type="email" value={draft?.email ?? ''} onChange={set('email')} />
                </label>

                <label className="field">
                  <span className="field__label">{t('profile.discipline')}</span>
                  <span className="select-wrap">
                    <select className="select" value={draft?.discipline ?? ''} onChange={set('discipline')}>
                      <option value="">{t('auth.disciplinePlaceholder')}</option>
                      {disciplineOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-wrap__chevron" />
                  </span>
                </label>

                <label className="field">
                  <span className="field__label">{t('profile.institution')}</span>
                  <input className="input" value={draft?.institution ?? ''} onChange={set('institution')} />
                </label>

                <label className="field">
                  <span className="field__label">{t('profile.graduationYear')}</span>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={draft?.graduation_year ?? ''}
                    onChange={set('graduation_year')}
                  />
                </label>

                <div className="field">
                  <span className="field__label">{t('profile.preferredLanguage')}</span>
                  <div className="pf-segment">
                    <button
                      type="button"
                      className={`pf-segment__btn${lang === 'en' ? ' pf-segment__btn--on' : ''}`}
                      onClick={() => changeLanguage('en')}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      className={`pf-segment__btn${lang === 'bn' ? ' pf-segment__btn--on' : ''}`}
                      onClick={() => changeLanguage('bn')}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>
              </div>

              <div className="pf-actions">
                <button type="submit" className="btn btn--primary" disabled={busy || !dirty}>
                  {t('profile.saveChanges')}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => { setDraft(profile); setSaved(false); setError('') }}
                  disabled={!dirty}
                >
                  {t('profile.discard')}
                </button>

                {emailChanged && (
                  <span className="pf-hint pf-hint--warn">
                    <ShieldAlert size={15} />
                    {t('profile.emailNeedsPassword')}
                  </span>
                )}

                {saved && !dirty && (
                  <span className="pf-hint pf-hint--ok">
                    <CheckCircle2 size={15} />
                    {t('profile.saved')}
                  </span>
                )}
              </div>
            </form>
          )}

          {tab === 'plan' && (
            <>
              <div className="card">
                <p className="card__title">{t('profile.planTitle')}</p>
                <p className="card__sub">{t('profile.planSub')}</p>

                <div className="pf-tier">
                  <span>
                    <span className="pf-tier__name">
                      {isPremium ? t('auth.tierPremium') : t('auth.tierFree')}
                    </span>
                    <span className="pf-tier__summary">
                      {isPremium ? t('profile.premiumSummary') : t('profile.freeSummary')}
                    </span>
                  </span>
                </div>

                <div className="pf-meters">
                  <UsageMeter
                    label={t('profile.reviewsToday')}
                    used={reviewQuota?.used ?? 0}
                    limit={reviewQuota?.limit ?? 0}
                    unlimited={Boolean(reviewQuota?.unlimited)}
                  />
                  <UsageMeter
                    label={t('profile.chatsToday')}
                    used={chatQuota?.used ?? 0}
                    limit={chatQuota?.limit ?? 0}
                    unlimited={Boolean(chatQuota?.unlimited)}
                  />
                </div>
              </div>

              <div className="card">
                <p className="card__title">{t('profile.subscriptionRecord')}</p>
                <p className="card__sub">{t('profile.subscriptionRecordSub')}</p>

                <dl className="pf-rows">
                  {(subscription
                    ? [
                        [t('profile.subTier'), t('auth.tierPremium')],
                        [t('profile.subMethod'), subscription.source === 'payment'
                          ? t(`auth.pay.${subscription.payment_method ?? 'bkash'}`)
                          : t(`profile.subSource.${subscription.source}`)],
                        [t('profile.subGranted'), formatDate(subscription.started_at)],
                        [t('profile.subRenews'), subscription.expires_at
                          ? formatDate(subscription.expires_at)
                          : t('profile.subNoExpiry')],
                        [t('profile.subStatus'), t(`profile.subStatusValue.${subscription.status}`)],
                      ]
                    : [
                        [t('profile.subTier'), t('auth.tierFree')],
                        [t('profile.subMethod'), t('profile.subNone')],
                        [t('profile.subSince'), formatDate(profile?.created_at)],
                        [t('profile.subStatus'), t('profile.subFreeStatus')],
                      ]
                  ).map(([label, value]) => (
                    <div className="pf-row" key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}

          {tab === 'history' && (
            <>
              <div className="card">
                <p className="card__title">{t('profile.trendTitle')}</p>
                <p className="card__sub">
                  {history.length > 1
                    ? t('profile.trendSummary', { best: n(bestScore), count: n(history.length) })
                    : history.length === 1 ? t('profile.trendOne') : t('profile.trendNone')}
                </p>

                {history.length > 1 && (
                  <div className="pf-trend scroll-x">
                    {trend.map(row => (
                      <div className="pf-trend__col" key={row.review_id}>
                        <span className="pf-trend__score">{n(row.overall_score ?? 0)}</span>
                        <span
                          className="pf-trend__bar"
                          style={{ height: `${Math.max(4, Math.round((row.overall_score ?? 0) * 0.96))}px` }}
                        />
                        <span className="pf-trend__date">{formatDate(row.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <p className="card__title">{t('profile.historyTitle')}</p>
                <p className="card__sub">{t('profile.historySub')}</p>

                {history.length === 0 ? (
                  <div className="pf-empty">
                    <p>{t('profile.noHistory')}</p>
                    <button type="button" className="btn btn--outline" onClick={() => navigate('/resume-review')}>
                      {t('results.uploadNew')}
                    </button>
                  </div>
                ) : (
                  <ul className="pf-history">
                    {history.map(row => (
                      <li className="pf-history__item" key={row.review_id}>
                        <span className="pf-history__icon"><FileText size={16} /></span>
                        <span className="pf-history__text">
                          <span className="pf-history__name">{row.file_name}</span>
                          <span className="pf-history__meta">
                            {formatDateTime(row.created_at)} · {row.market_mode === 'international'
                              ? t('review.marketInternational')
                              : t('review.marketLocal')}
                          </span>
                        </span>
                        <span className="pf-history__score">{n(row.overall_score ?? 0)}</span>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => navigate(`/review/${row.review_id}`)}
                        >
                          {t('profile.openReview')}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {tab === 'security' && (
            <>
              <form className="card" onSubmit={submitPassword}>
                <p className="card__title">{t('profile.passwordTitle')}</p>
                <p className="card__sub">{t('profile.passwordSub')}</p>

                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">{t('profile.currentPassword')}</span>
                    <input
                      className="input"
                      type="password"
                      autoComplete="current-password"
                      value={passwords.current}
                      onChange={event => setPasswords(p => ({ ...p, current: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">{t('profile.newPassword')}</span>
                    <input
                      className="input"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.next}
                      onChange={event => setPasswords(p => ({ ...p, next: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">{t('auth.confirmPasswordLabel')}</span>
                    <input
                      className="input"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.confirm}
                      onChange={event => setPasswords(p => ({ ...p, confirm: event.target.value }))}
                    />
                  </label>
                </div>

                <div className="pf-actions">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={busy || !passwords.current || !passwords.next}
                  >
                    {t('profile.updatePassword')}
                  </button>
                  {saved && (
                    <span className="pf-hint pf-hint--ok">
                      <CheckCircle2 size={15} />
                      {t('profile.passwordUpdated')}
                    </span>
                  )}
                </div>
              </form>

              <div className="card">
                <p className="card__title">{t('profile.sessionTitle')}</p>
                <dl className="pf-rows">
                  <div className="pf-row">
                    <dt>{t('profile.lastSignIn')}</dt>
                    <dd>{formatDateTime(profile?.last_login_at)}</dd>
                  </div>
                  <div className="pf-row">
                    <dt>{t('profile.accountCreated')}</dt>
                    <dd>{formatDateTime(profile?.created_at)}</dd>
                  </div>
                  <div className="pf-row">
                    <dt>{t('profile.role')}</dt>
                    <dd>{profile?.role ?? user?.role ?? '—'}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}

          {tab === 'privacy' && (
            <>
              <div className="card">
                <p className="card__title">{t('profile.dataTitle')}</p>
                <p className="card__sub">{t('profile.dataSub')}</p>
                <div className="pf-actions">
                  <button type="button" className="btn btn--outline" onClick={downloadData}>
                    <Download size={16} />
                    {t('profile.downloadData')}
                  </button>
                  <span className="pf-hint">
                    <ShieldCheck size={15} />
                    {t('profile.dataNote')}
                  </span>
                </div>
              </div>

              <div className="card pf-danger">
                <p className="card__title">{t('profile.deleteTitle')}</p>
                <p className="card__sub">{t('profile.deleteSub')}</p>
                <button type="button" className="btn btn--danger" onClick={() => setConfirm('delete')}>
                  {t('profile.deleteAccount')}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {confirm && (
        <ConfirmPasswordDialog
          message={confirm === 'delete' ? t('profile.confirmDelete') : t('profile.confirmEmail')}
          actionLabel={confirm === 'delete' ? t('common.delete') : t('common.confirm')}
          destructive={confirm === 'delete'}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={password => (confirm === 'delete' ? confirmDelete(password) : saveProfile(password))}
        />
      )}
    </div>
  )
}
