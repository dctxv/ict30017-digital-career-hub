import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { fetchList } from '../api/fetchList'
import './CareerPaths.css'

// Discipline groups, client-side mirror of add_discipline_groups.sql: used
// only when the API call fails and the hardcoded fallback list takes over.
// Bangla labels are mirrored too (from seed_bangla_content.sql / the group
// UPDATEs in add_discipline_groups.sql) so a language switch still works
// while the API is down — otherwise falling back silently pinned the filter
// bar to English regardless of `lang`.
const FALLBACK_DISCIPLINES = [
  { name: 'IT', name_bn: 'আইটি', group: 'Technology', group_bn: 'প্রযুক্তি ও বিজ্ঞান' },
  { name: 'Engineering', name_bn: 'ইঞ্জিনিয়ারিং', group: 'Technology', group_bn: 'প্রযুক্তি ও বিজ্ঞান' },
  { name: 'Science', name_bn: 'বিজ্ঞান', group: 'Technology', group_bn: 'প্রযুক্তি ও বিজ্ঞান' },
  { name: 'Finance', name_bn: 'ফিন্যান্স', group: 'Business & Finance', group_bn: 'ব্যবসা ও অর্থনীতি' },
  { name: 'Business', name_bn: 'ব্যবসা', group: 'Business & Finance', group_bn: 'ব্যবসা ও অর্থনীতি' },
  { name: 'Arts', name_bn: 'কলা', group: 'Humanities & Education', group_bn: 'মানবিক ও শিক্ষা' },
  { name: 'Education', name_bn: 'শিক্ষা', group: 'Humanities & Education', group_bn: 'মানবিক ও শিক্ষা' },
]

export default function CareerPaths() {
  const { lang, t, n, d: duration } = useLanguage()
  const navigate = useNavigate()
  // `group` narrows which disciplines the second pill row offers; `disc`
  // narrows within that group. Grouping is presentation only — every path is
  // still filtered by `discipline`, never by group, so no server change was
  // needed to filter on it.
  const [group, setGroup] = useState('All')
  const [disc, setDisc] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  // { name, label, group, groupLabel }: `name` is the English key rows are
  // filtered by, `label` is what the pill shows. See the disciplines route for
  // why English and Bangla stay separate rather than being resolved here.
  const [disciplines, setDisciplines] = useState([{ name: 'All', label: 'All', group: 'All', groupLabel: 'All' }])

  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchList(`/api/disciplines?lang=${lang}`)
      .then(data => {
        if (cancelled) return
        setDisciplines([
          { name: 'All', label: t('common.all'), group: 'All', groupLabel: t('common.all') },
          ...data.map(row => ({
            name: row.name,
            label: (lang === 'bn' && row.name_bn) || row.name,
            group: row.group_name,
            groupLabel: (lang === 'bn' && row.group_name_bn) || row.group_name,
          })),
        ])
      })
      .catch(() => {
        if (cancelled) return
        setDisciplines([
          { name: 'All', label: t('common.all'), group: 'All', groupLabel: t('common.all') },
          ...FALLBACK_DISCIPLINES.map(({ name, name_bn, group, group_bn }) => ({
            name,
            label: (lang === 'bn' && name_bn) || name,
            group,
            groupLabel: (lang === 'bn' && group_bn) || group,
          })),
        ])
      })
    return () => { cancelled = true }
  }, [lang, t])

  // One pill per distinct group, in the order its first discipline appears —
  // which is the order the admin dashboard lists disciplines in, so the
  // filter bar matches the admin's own ordering rather than resorting it.
  const groups = useMemo(() => {
    const seen = new Map()
    seen.set('All', t('common.all'))
    for (const item of disciplines) {
      if (item.name === 'All') continue
      if (!seen.has(item.group)) seen.set(item.group, item.groupLabel)
    }
    return [...seen.entries()].map(([name, label]) => ({ name, label }))
  }, [disciplines, t])

  // Refetches on a language change so descriptions arrive translated. The
  // selected path survives it because selection is keyed on id, not index.
  useEffect(() => {
    let cancelled = false
    fetchList(`/api/career-paths?lang=${lang}`)
      .then(rows => {
        if (cancelled) return
        setPaths(rows)
        setSelectedId(current => current ?? rows[0]?.id ?? null)
        setLoadError(false)
      })
      .catch(error => {
        if (cancelled) return
        console.error('[career-paths]', error.message)
        setPaths([])
        setLoadError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lang])

  // Map from discipline name to its group, built from whatever list is live
  // (API or fallback) so a group pill can filter paths without the server
  // needing to know what "group" means.
  const groupOf = useMemo(() => {
    const map = new Map()
    for (const item of disciplines) {
      if (item.name !== 'All') map.set(item.name, item.group)
    }
    return map
  }, [disciplines])

  // The second pill row offers only the disciplines inside the selected
  // group — the "break it down underneath" part of the request — and is
  // skipped entirely while "All" is selected, so the filter bar stays as
  // compact as the grouping was meant to make it.
  const disciplinesInGroup = useMemo(
    () => disciplines.filter(item => item.name !== 'All' && item.group === group),
    [disciplines, group],
  )

  const filtered = useMemo(
    () => paths.filter(p =>
      (group === 'All' || groupOf.get(p.discipline) === group) &&
      (disc === 'All' || p.discipline === disc)
    ),
    [paths, group, disc, groupOf],
  )

  const selected = filtered.find(p => p.id === selectedId) ?? filtered[0] ?? null

  const chooseGroup = (name) => {
    setGroup(name)
    setDisc('All')
    const first = paths.find(p => name === 'All' || groupOf.get(p.discipline) === name)
    if (first) setSelectedId(first.id)
  }

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
            {groups.map(item => (
              <button
                key={item.name}
                type="button"
                className={`pill${group === item.name ? ' pill--on' : ''}`}
                aria-pressed={group === item.name}
                onClick={() => chooseGroup(item.name)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* Only appears once a group narrows the list to more than one
              discipline — "All" already shows everything, and a group with a
              single discipline in it has nothing left to break down. */}
          {disciplinesInGroup.length > 1 && (
            <div className="pill-row cp-filters cp-filters--sub">
              <button
                type="button"
                className={`pill pill--sm${disc === 'All' ? ' pill--on' : ''}`}
                aria-pressed={disc === 'All'}
                onClick={() => chooseDiscipline('All')}
              >
                {t('common.all')}
              </button>
              {disciplinesInGroup.map(item => (
                <button
                  key={item.name}
                  type="button"
                  className={`pill pill--sm${disc === item.name ? ' pill--on' : ''}`}
                  aria-pressed={disc === item.name}
                  onClick={() => chooseDiscipline(item.name)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {loadError && (
        <div className="page-body" style={{ paddingBottom: 0 }}>
          <p className="notice notice--error" role="alert">{t('common.loadFailed')}</p>
        </div>
      )}

      {loading ? (
        <div className="empty-state">{t('careers.loading')}</div>
      ) : (
        <section className="cp-body">
          <div className="cp-list">
            {!loadError && filtered.length === 0 && (
              <div className="empty-state">{t('careers.empty')}</div>
            )}

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
