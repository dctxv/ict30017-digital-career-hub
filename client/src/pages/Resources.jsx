import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Resources.css'

const CATEGORIES = ['All', 'Resume Writing', 'Interview Prep', 'Job Search', 'Soft Skills', 'Skill Development']

const FALLBACK_DISCIPLINES = ['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

/* How many cards are shown before "load more". The button used to be decorative
   — it rendered on every list and did nothing, including on a list of six. */
const PAGE_SIZE = 9

export default function Resources() {
  const { lang, t, tc, n } = useLanguage()
  const [cat, setCat] = useState('All')
  // Seeded from the Career Paths hand-off. Reading it in the initialiser
  // instead of an effect avoids a second render just to apply the filter.
  const [disc, setDisc] = useState(
    () => localStorage.getItem('selectedDiscipline') || 'All disciplines'
  )
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Narrowing the list while page three is showing would leave the user looking
  // at a short list under a "load more" button, so every filter resets the
  // window rather than letting it persist across a change of subject.
  const narrow = (apply) => (value) => { apply(value); setVisible(PAGE_SIZE) }
  const chooseCategory = narrow(setCat)
  const chooseDiscipline = narrow(setDisc)
  const search = narrow(setQuery)
  // { name, label }: `name` is the English key resources are filtered by,
  // `label` is what the pill shows. Collapsing the two would make a Bangla
  // label match no resource row.
  const [disciplines, setDisciplines] = useState([{ name: 'All disciplines', label: 'All disciplines' }])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/disciplines?lang=${lang}`)
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('unavailable'))))
      .then(data => {
        if (cancelled) return
        setDisciplines([
          { name: 'All disciplines', label: t('common.allDisciplines') },
          ...data.map(d => ({ name: d.name, label: (lang === 'bn' && d.name_bn) || d.name })),
        ])
      })
      .catch(() => {
        if (cancelled) return
        setDisciplines([
          { name: 'All disciplines', label: t('common.allDisciplines') },
          ...FALLBACK_DISCIPLINES.map(name => ({ name, label: name })),
        ])
      })
    return () => { cancelled = true }
  }, [lang, t])

  // Refetches when the language changes — the API resolves title and desc for
  // the requested language and falls back to English per field for anything not
  // yet translated.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/resources?lang=${lang}`)
      .then(response => (response.ok ? response.json() : []))
      .then(data => { if (!cancelled) setResources(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setResources([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lang])

  // The hand-off keys are one-shot: consumed by the initialiser above, then
  // cleared so a later direct visit does not resurrect a stale filter.
  useEffect(() => {
    localStorage.removeItem('selectedDiscipline')
    localStorage.removeItem('selectedCareer')
  }, [])

  const filtered = useMemo(() => resources.filter(r => {
    const matchCat = cat === 'All' || r.category === cat
    const matchDisc = disc === 'All disciplines' || r.discipline === disc || r.discipline === 'All disciplines'
    const matchQuery = !query || r.title.toLowerCase().includes(query.trim().toLowerCase())
    return matchCat && matchDisc && matchQuery
  }), [resources, cat, disc, query])

  const shown = filtered.slice(0, visible)
  const labelFor = name => disciplines.find(d => d.name === name)?.label ?? name

  return (
    <div className="page-enter">
      <Navbar />

      <section className="page-head">
        <div className="shell">
          <h1 className="page-head__title">{t('resources.title')}</h1>
          <p className="page-head__sub">{t('resources.sub')}</p>

          <div className="res-search">
            <Search size={17} className="res-search__icon" />
            <input
              className="input res-search__input"
              placeholder={t('resources.searchPlaceholder')}
              value={query}
              onChange={event => search(event.target.value)}
              aria-label={t('resources.searchPlaceholder')}
            />
          </div>

          <div className="pill-row res-filters">
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                className={`pill${cat === c ? ' pill--on' : ''}`}
                onClick={() => chooseCategory(c)}
              >
                {c === 'All' ? t('common.all') : tc(`resources.category.${c}`, c)}
              </button>
            ))}
          </div>

          <div className="pill-row">
            {disciplines.map(d => (
              <button
                key={d.name}
                type="button"
                className={`pill pill--sm${disc === d.name ? ' pill--on' : ''}`}
                onClick={() => chooseDiscipline(d.name)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-body">
        {loading ? (
          <div className="empty-state">{t('resources.loading')}</div>
        ) : (
          <>
            <p className="res-count">
              {t('resources.count', { shown: n(filtered.length), total: n(resources.length) })}
            </p>

            <div className="res-grid">
              {shown.map(r => (
                <article key={r.id} className="res-card">
                  <div className={`res-card__banner res-card__banner--${(r.type || '').toLowerCase()}`}>
                    <span className="res-card__type">{tc(`resources.type.${r.type}`, r.type)}</span>
                  </div>

                  <div className="res-card__body">
                    <h3 className="res-card__title">{r.title}</h3>
                    <p className="res-card__desc">{r.desc}</p>

                    <div className="res-card__tags">
                      <span className="tag tag--tint">{labelFor(r.discipline)}</span>
                      <span className="tag">{tc(`resources.category.${r.category}`, r.category)}</span>
                    </div>

                    <div className="res-card__footer">
                      <a
                        className="res-card__link"
                        href={r.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {r.type === 'Video' ? t('resources.watch') : t('resources.readMore')}
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && <div className="empty-state">{t('resources.empty')}</div>}

            {/* Only rendered when there is genuinely more to show. */}
            {visible < filtered.length && (
              <div className="res-more">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setVisible(count => count + PAGE_SIZE)}
                >
                  {t('resources.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
