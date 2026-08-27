import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './CareerPaths.css'

const FALLBACK_DISCIPLINES = ['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

export default function CareerPaths() {
  const { lang, t, n, d: duration } = useLanguage()
  const navigate = useNavigate()
  const [disc, setDisc] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  // { name, label }: `name` is the English key rows are filtered by, `label` is
  // what the pill shows. See the disciplines route for why they stay separate.
  const [disciplines, setDisciplines] = useState([{ name: 'All', label: 'All' }])
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/disciplines?lang=${lang}`)
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('unavailable'))))
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

  // Refetches on a language change so descriptions arrive translated. The
  // selected path survives it because selection is keyed on id, not index.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/career-paths?lang=${lang}`)
      .then(response => (response.ok ? response.json() : []))
      .then(data => {
        if (cancelled) return
        const rows = Array.isArray(data) ? data : []
        setPaths(rows)
        setSelectedId(current => current ?? rows[0]?.id ?? null)
      })
      .catch(() => { if (!cancelled) setPaths([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lang])

  const filtered = useMemo(
    () => paths.filter(p => disc === 'All' || p.discipline === disc),
    [paths, disc],
  )

  const selected = filtered.find(p => p.id === selectedId) ?? filtered[0] ?? null

  const chooseDiscipline = (name) => {
    setDisc(name)
    // Selecting a discipline whose first path is not the one on screen would
    // leave the detail panel showing a path the list no longer contains.
    const first = paths.find(p => name === 'All' || p.discipline === name)
    if (first) setSelectedId(first.id)
  }

  // The resources page reads these on mount and clears them immediately, so
  // they are a one-shot hand-off rather than persisted state.
  const goToResources = () => {
    if (!selected) return
    localStorage.setItem('selectedDiscipline', selected.discipline)
    localStorage.setItem('selectedCareer', selected.title)
    navigate('/resources')
  }

  return (
    <div className="page-enter">
      <Navbar />

      <section className="page-head">
        <div className="shell">
          <h1 className="page-head__title">{t('careers.title')}</h1>
          <p className="page-head__sub">{t('careers.sub')}</p>
          <div className="pill-row cp-filters">
            {disciplines.map(item => (
              <button
                key={item.name}
                type="button"
                className={`pill${disc === item.name ? ' pill--on' : ''}`}
                onClick={() => chooseDiscipline(item.name)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="empty-state">{t('careers.loading')}</div>
      ) : (
        <section className="cp-body">
          <div className="cp-list">
            {filtered.length === 0 && <div className="empty-state">{t('careers.empty')}</div>}

            {filtered.map(path => {
              const on = selected?.id === path.id
              return (
                <button
                  key={path.id}
                  type="button"
                  className={`cp-item${on ? ' cp-item--on' : ''}`}
                  onClick={() => setSelectedId(path.id)}
                  aria-current={on}
                >
                  <span className="cp-item__text">
                    <span className="cp-item__title">{path.title}</span>
                    <span className="cp-item__industry">{path.industry}</span>
                  </span>
                  <ChevronRight size={16} className="cp-item__arrow" />
                </button>
              )
            })}

            {filtered.length > 0 && (
              <p className="cp-count">
                {disc === 'All'
                  ? t('careers.showingCount', { shown: n(filtered.length), total: n(paths.length) })
                  : t('careers.showingCountFiltered', {
                      shown: n(filtered.length),
                      total: n(paths.length),
                      discipline: disciplines.find(item => item.name === disc)?.label ?? disc,
                    })}
              </p>
            )}
          </div>

          {selected && (
            <div className="cp-detail">
              <h2 className="cp-detail__title">{selected.title}</h2>

              <div className="cp-detail__tags">
                <span className="tag tag--accent">{selected.industry}</span>
                <span className="tag tag--tint">
                  {disciplines.find(item => item.name === selected.discipline)?.label ?? selected.discipline}
                </span>
              </div>

              <p className="cp-detail__desc">{selected.desc}</p>

              <p className="eyebrow">{t('careers.requiredSkills')}</p>
              <div className="cp-skills">
                {(selected.skills ?? []).map(skill => (
                  <span key={skill} className="cp-skill">{skill}</span>
                ))}
              </div>

              <p className="eyebrow">{t('careers.progression')}</p>
              <div className="cp-progression scroll-x">
                {(selected.progression ?? []).map((step, index, steps) => (
                  <div key={`${step.label}-${index}`} className="cp-step">
                    {index < steps.length - 1 && <span className="cp-step__line" />}
                    <span className={`cp-step__dot${step.current ? ' cp-step__dot--on' : ''}`} />
                    <span className={`cp-step__label${step.current ? ' cp-step__label--on' : ''}`}>
                      {step.label}
                    </span>
                    <span className="cp-step__time">{duration(step.time)}</span>
                  </div>
                ))}
              </div>

              <p className="eyebrow">{t('careers.salaryContext')}</p>
              <div className="cp-salary">
                {[
                  ['careers.entryLevel', selected.salaryEntry],
                  ['careers.seniorLevel', selected.salarySenior],
                ].map(([labelKey, amount]) => (
                  <div key={labelKey} className="cp-salary__card">
                    <p className="cp-salary__level">{t(labelKey)}</p>
                    <p className="cp-salary__amount">{n(amount)}</p>
                    <p className="cp-salary__period">{t('common.perMonth')}</p>
                  </div>
                ))}
              </div>

              <button type="button" className="btn btn--outline cp-detail__cta" onClick={goToResources}>
                {t('careers.findResources', { title: selected.title })}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
