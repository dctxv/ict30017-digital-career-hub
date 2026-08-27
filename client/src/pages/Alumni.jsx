import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { fetchList } from '../api/fetchList'
import './Alumni.css'

const FALLBACK_DISCIPLINES = ['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

function initialsOf(name) {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase()
}

export default function Alumni() {
  const { lang, t, n } = useLanguage()
  const [disc, setDisc] = useState('All')
  // Each entry is { name, label }: `name` is the English join key the filter
  // compares against, `label` is what the pill shows. Collapsing the two would
  // make a Bangla label match no alumni row.
  const [disciplines, setDisciplines] = useState([{ name: 'All', label: 'All' }])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchList(`/api/disciplines?lang=${lang}`)
      .then(data => {
        if (cancelled) return
        setDisciplines([
          { name: 'All', label: t('common.all') },
          ...data.map(row => ({ name: row.name, label: (lang === 'bn' && row.name_bn) || row.name })),
        ])
      })
      .catch(() => {
        if (cancelled) return
        setDisciplines([
          { name: 'All', label: t('common.all') },
          ...FALLBACK_DISCIPLINES.map(name => ({ name, label: name })),
        ])
      })
    return () => { cancelled = true }
  }, [lang, t])

  useEffect(() => {
    let cancelled = false
    const path = disc === 'All' ? '/api/alumni' : `/api/alumni/discipline/${encodeURIComponent(disc)}`
    fetchList(`${path}?lang=${lang}`)
      .then(data => { if (!cancelled) { setAlumni(data); setLoadError(false) } })
      .catch(error => {
        if (cancelled) return
        console.error('[alumni]', error.message)
        setAlumni([])
        setLoadError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [disc, lang])

  return (
    <div className="page-enter">
      <Navbar />

      <section className="page-head alumni-head">
        <div className="shell">
          <h1 className="alumni-head__title">{t('alumni.title')}</h1>
          <p className="alumni-head__sub">{t('alumni.sub')}</p>
          <div className="pill-row alumni-head__filters">
            {disciplines.map(item => (
              <button
                key={item.name}
                type="button"
                className={`pill${disc === item.name ? ' pill--on' : ''}`}
                onClick={() => setDisc(item.name)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-body">
        {loadError && (
          <p className="notice notice--error" role="alert">{t('common.loadFailed')}</p>
        )}

        {loading ? (
          <div className="empty-state">{t('alumni.loading')}</div>
        ) : alumni.length === 0 ? (
          loadError ? null : <div className="empty-state">{t('alumni.empty')}</div>
        ) : (
          <div className="alumni-grid">
            {alumni.map(person => (
              <article key={person.id} className="alumni-card">
                <span className="alumni-card__avatar">
                  {person.image_initials || initialsOf(person.full_name)}
                </span>

                <div className="alumni-card__body">
                  <h3 className="alumni-card__name">{person.full_name}</h3>

                  <div className="alumni-card__tags">
                    <span className="tag tag--accent">
                      {person.institution} · {n(person.graduation_year)}
                    </span>
                    <span className="tag tag--tint">{person.current_role}</span>
                    <span className="tag">{person.industry}</span>
                  </div>

                  <p className="alumni-card__bio">{person.bio}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
