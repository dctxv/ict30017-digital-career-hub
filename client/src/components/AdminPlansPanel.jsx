import { useEffect, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const ORDER = ['free', 'basic', 'premium']

export default function AdminPlansPanel({ onMessage, onError }) {
  const { t } = useLanguage()
  const [limits, setLimits] = useState([])
  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState('')

  const readJson = async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || t('admin.plans.loadFailed'))
    return response.json()
  }

  const load = async (query = '') => {
    try {
      const [tierRows, accountRows] = await Promise.all([
        readJson('/api/admin/plans/tier-limits'),
        readJson(`/api/admin/plans/accounts?search=${encodeURIComponent(query)}`),
      ])
      setLimits(tierRows)
      setAccounts(accountRows)
    } catch (error) {
      onError(error.message)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      readJson('/api/admin/plans/tier-limits'),
      readJson('/api/admin/plans/accounts?search='),
    ]).then(([tierRows, accountRows]) => {
      if (cancelled) return
      setLimits(tierRows)
      setAccounts(accountRows)
    }).catch(error => {
      if (!cancelled) onError(error.message)
    })
    return () => { cancelled = true }
    // Initial load only. Search refreshes explicitly through the search form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeLimit = (tier, field, value) => {
    setLimits(rows => rows.map(row => row.tier === tier ? { ...row, [field]: value } : row))
  }

  const saveTier = async (row) => {
    setBusy(`tier-${row.tier}`)
    try {
      const payload = {
        resume_reviews_daily: row.resume_reviews_daily === '' ? null : Number(row.resume_reviews_daily),
        mock_interviews_daily: row.mock_interviews_daily === '' ? null : Number(row.mock_interviews_daily),
      }
      const response = await fetch(`/api/admin/plans/tier-limits/${row.tier}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || t('admin.plans.saveFailed'))
      const saved = await response.json()
      setLimits(rows => rows.map(item => item.tier === saved.tier ? saved : item))
      onMessage(t('admin.plans.saved', { tier: t(`admin.plans.tier.${row.tier}`) }))
    } catch (error) {
      onError(error.message)
    } finally {
      setBusy('')
    }
  }

  const setPaid = async (account, isPaid) => {
    setBusy(`account-${account.user_id}`)
    try {
      const response = await fetch(`/api/admin/plans/accounts/${account.user_id}/paid`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_paid: isPaid }),
      })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || t('admin.plans.paidFailed'))
      const saved = await response.json()
      setAccounts(rows => rows.map(item => item.user_id === saved.user_id ? saved : item))
      onMessage(t(isPaid ? 'admin.plans.markedPaid' : 'admin.plans.markedUnpaid', { name: saved.full_name }))
    } catch (error) {
      onError(error.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="admin-plans">
      <section className="admin-list-card">
        <h2>{t('admin.plans.limitsTitle')}</h2>
        <p className="admin-hint">{t('admin.plans.limitsHint')}</p>
        <div className="admin-tier-grid">
          {ORDER.map(tier => {
            const row = limits.find(item => item.tier === tier)
            if (!row) return null
            return (
              <article className={`admin-tier-card admin-tier-card--${tier}`} key={tier}>
                <div className="admin-tier-card__heading">
                  <h3>{t(`admin.plans.tier.${tier}`)}</h3>
                  {tier === 'premium' && <span>{t('admin.plans.unlimitedBadge')}</span>}
                </div>
                <label className="form-label">
                  {t('admin.plans.resumeLimit')}
                  <input className="form-input" type="number" min="0" max="10000" value={row.resume_reviews_daily ?? ''} placeholder={t('admin.plans.unlimited')} onChange={e => changeLimit(tier, 'resume_reviews_daily', e.target.value)} />
                </label>
                <label className="form-label">
                  {t('admin.plans.interviewLimit')}
                  <input className="form-input" type="number" min="0" max="10000" value={row.mock_interviews_daily ?? ''} placeholder={t('admin.plans.unlimited')} onChange={e => changeLimit(tier, 'mock_interviews_daily', e.target.value)} />
                </label>
                <button className="btn-primary" disabled={busy === `tier-${tier}`} onClick={() => saveTier(row)}>
                  <Check size={15} /> {t('admin.plans.saveTier')}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="admin-list-card">
        <div className="admin-accounts-heading">
          <div><h2>{t('admin.plans.accountsTitle')}</h2><p className="admin-hint">{t('admin.plans.accountsHint')}</p></div>
          <form className="admin-account-search" onSubmit={e => { e.preventDefault(); load(search) }}>
            <Search size={16} />
            <input aria-label={t('admin.plans.search')} value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin.plans.search')} />
          </form>
        </div>
        <table className="admin-table">
          <thead><tr><th>{t('admin.table.name')}</th><th>{t('admin.plans.email')}</th><th>{t('admin.plans.plan')}</th><th>{t('admin.plans.paid')}</th><th>{t('admin.table.actions')}</th></tr></thead>
          <tbody>{accounts.map(account => (
            <tr key={account.user_id}>
              <td><strong>{account.full_name}</strong></td><td>{account.email}</td>
              <td><span className="admin-tier-pill">{t(`admin.plans.tier.${account.tier}`)}</span></td>
              <td>{account.is_paid ? t('common.yes') : t('common.no')}</td>
              <td><button className={account.is_paid ? 'btn-secondary' : 'btn-primary'} disabled={busy === `account-${account.user_id}`} onClick={() => setPaid(account, !account.is_paid)}>{t(account.is_paid ? 'admin.plans.markUnpaid' : 'admin.plans.markPaid')}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </div>
  )
}
