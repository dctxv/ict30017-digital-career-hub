import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpRight, ShieldCheck, ShieldAlert } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { fetchList } from '../api/fetchList'
import './Resources.css'

const CATEGORIES = ['All', 'Resume Writing', 'Interview Prep', 'Job Search', 'Soft Skills', 'Skill Development']

// Discipline groups, client-side mirror of add_discipline_groups.sql: used
// only when the API call fails and the hardcoded fallback list takes over,
// and to seed the initial group synchronously (see `group` below). Bangla
// labels are mirrored too (from seed_bangla_content.sql / the group UPDATEs
// in add_discipline_groups.sql) so a language switch still works while the
// API is down — otherwise falling back silently pinned the filter bar to
// English regardless of `lang`.
const FALLBACK_DISCIPLINES = [
  { name: 'IT', name_bn: 'আইটি', group: 'Technology', group_bn: 'প্রযুক্তি ও বিজ্ঞান' },
  { name: 'Engineering', name_bn: 'ইঞ্জিনিয়ারিং', group: 'Technology', group_bn: 'প্রযুক্তি ও বিজ্ঞান' },
  { name: 'Science', name_bn: 'বিজ্ঞান', group: 'Technology', group_bn: 'প্রযুক্তি ও বিজ্ঞান' },
  { name: 'Finance', name_bn: 'ফিন্যান্স', group: 'Business & Finance', group_bn: 'ব্যবসা ও অর্থনীতি' },
  { name: 'Business', name_bn: 'ব্যবসা', group: 'Business & Finance', group_bn: 'ব্যবসা ও অর্থনীতি' },
  { name: 'Arts', name_bn: 'কলা', group: 'Humanities & Education', group_bn: 'মানবিক ও শিক্ষা' },
  { name: 'Education', name_bn: 'শিক্ষা', group: 'Humanities & Education', group_bn: 'মানবিক ও শিক্ষা' },
]

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
  // Seeded from the same hand-off as `disc`, against the fallback list so the
  // right group pill is already highlighted on the very first render rather
  // than snapping into place once the API responds. Reconciled against the
  // real data once it loads, below.
  const [group, setGroup] = useState(() => {
    const seeded = localStorage.getItem('selectedDiscipline')
    return FALLBACK_DISCIPLINES.find(d => d.name === seeded)?.group ?? 'All'
  })
  // Seeded from a preparation gap. A remediation step names a subject to learn,
  // and this is where the user lands with that subject already searched for —
  // read in the initialiser for the same reason the discipline is, so the filter
  // is applied on the first render rather than after a second one.
  const [query, setQuery] = useState(
    () => localStorage.getItem('selectedResourceQuery') || ''
  )
  // The career the visitor was reading about on Career Paths. That page wrote
  // it alongside the discipline for months, and this one only ever deleted it,
  // so "Find related resources for Treasury Analyst" landed on a page that
  // never mentioned Treasury Analyst. It is shown as the reason the list is
  // narrowed, and goes away when the visitor changes the filter themselves.
  const [careerContext, setCareerContext] = useState(
    () => localStorage.getItem('selectedCareer') || null
  )
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Narrowing the list while page three is showing would leave the user looking
  // at a short list under a "load more" button, so every filter resets the
  // window rather than letting it persist across a change of subject.
  const narrow = (apply) => (value) => { apply(value); setVisible(PAGE_SIZE) }
  const chooseCategory = narrow(setCat)
  const chooseDiscipline = narrow(value => { setDisc(value); setCareerContext(null) })
  // Changing the group resets the specific discipline to "all within this
  // group", same as Career Paths — see that page for why group is a pure
  // presentation filter rather than a value anything is stored against.
  const chooseGroup = narrow(value => { setGroup(value); setDisc('All disciplines'); setCareerContext(null) })
  const search = narrow(setQuery)
  // { name, label, group, groupLabel }: `name` is the English key resources
  // are filtered by, `label` is what the pill shows. Collapsing name and
  // label would make a Bangla label match no resource row.
  const [disciplines, setDisciplines] = useState([
    { name: 'All disciplines', label: 'All disciplines', group: 'All', groupLabel: 'All' },
  ])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchList(`/api/disciplines?lang=${lang}`)
      .then(data => {
        if (cancelled) return
        setDisciplines([
          { name: 'All disciplines', label: t('common.allDisciplines'), group: 'All', groupLabel: t('common.all') },
          ...data.map(d => ({
            name: d.name,
            label: (lang === 'bn' && d.name_bn) || d.name,
            group: d.group_name,
            groupLabel: (lang === 'bn' && d.group_name_bn) || d.group_name,
          })),
        ])
        // Reconcile the group seeded from the fallback guess (or "All") against
        // the real data, in case a hand-off discipline's actual group differs
        // from what the synchronous fallback list assumed.
        const real = data.find(d => d.name === disc)
        if (real) setGroup(real.group_name)
      })
      .catch(() => {
        if (cancelled) return
        setDisciplines([
          { name: 'All disciplines', label: t('common.allDisciplines'), group: 'All', groupLabel: t('common.all') },
          ...FALLBACK_DISCIPLINES.map(({ name, name_bn, group, group_bn }) => ({
            name,
            label: (lang === 'bn' && name_bn) || name,
            group,
            groupLabel: (lang === 'bn' && group_bn) || group,
          })),
        ])
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `disc` is read
    // only to reconcile the initial hand-off; including it would refetch on
    // every discipline click, which the discipline fetch has no reason to do.
  }, [lang, t])

  // Refetches when the language changes — the API resolves title and desc for
  // the requested language and falls back to English per field for anything not
  // yet translated.
  useEffect(() => {
    let cancelled = false
    fetchList(`/api/resources?lang=${lang}`)
      .then(data => { if (!cancelled) { setResources(data); setLoadError(false) } })
      .catch(error => {
        if (cancelled) return
        // The list is emptied AND the failure is shown. Emptying alone
        // renders as "no resources found", which is a different claim.
        console.error('[resources]', error.message)
        setResources([])
        setLoadError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lang])

  // The hand-off keys are one-shot: consumed by the initialiser above, then
  // cleared so a later direct visit does not resurrect a stale filter.
  useEffect(() => {
    localStorage.removeItem('selectedDiscipline')
    localStorage.removeItem('selectedCareer')
    localStorage.removeItem('selectedResourceQuery')
  }, [])

  // Map from discipline name to its group, built from whatever list is live
  // (API or fallback) so a group pill can filter resources without the
  // server needing to know what "group" means.
  const groupOf = useMemo(() => {
    const map = new Map()
    for (const item of disciplines) {
      if (item.name !== 'All disciplines') map.set(item.name, item.group)
    }
    return map
  }, [disciplines])

  // One pill per distinct group, in the order its first discipline appears —
  // the admin dashboard's own ordering, not a resorted one.
  const groups = useMemo(() => {
    const seen = new Map()
    seen.set('All', t('common.all'))
    for (const item of disciplines) {
      if (item.name === 'All disciplines') continue
      if (!seen.has(item.group)) seen.set(item.group, item.groupLabel)
    }
    return [...seen.entries()].map(([name, label]) => ({ name, label }))
  }, [disciplines, t])

  // The sub-row offers only the disciplines inside the selected group, and is
  // skipped while "All" is selected or the group has nothing to break down.
  const disciplinesInGroup = useMemo(
    () => disciplines.filter(item => item.name !== 'All disciplines' && item.group === group),
    [disciplines, group],
  )

  const filtered = useMemo(() => resources.filter(r => {
    const matchCat = cat === 'All' || r.category === cat
    const matchGroup = group === 'All' || r.discipline === 'All disciplines' || groupOf.get(r.discipline) === group
    const matchDisc = disc === 'All disciplines' || r.discipline === disc || r.discipline === 'All disciplines'
    // Title and description both. A title-only match was adequate while every
    // search was typed by hand, and stopped being adequate once a preparation
    // gap could hand a subject over — "sql" is far likelier to appear in the
    // blurb than in the heading, and an empty list reads as a broken link
    // rather than as a narrow search.
    const needle = query.trim().toLowerCase()
    const matchQuery = !needle
      || r.title.toLowerCase().includes(needle)
      || (r.desc ?? '').toLowerCase().includes(needle)
    return matchCat && matchGroup && matchDisc && matchQuery
  }), [resources, cat, group, disc, groupOf, query])

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
                aria-pressed={cat === c}
                onClick={() => chooseCategory(c)}
              >
                {c === 'All' ? t('common.all') : tc(`resources.category.${c}`, c)}
              </button>
            ))}
          </div>

          <div className="pill-row">
            {groups.map(g => (
              <button
                key={g.name}
                type="button"
                className={`pill pill--sm${group === g.name ? ' pill--on' : ''}`}
                aria-pressed={group === g.name}
                onClick={() => chooseGroup(g.name)}
              >
                {g.label}
              </button>
            ))}
          </div>
          {/* Only appears once a group narrows the list to more than one
              discipline — "All" already shows everything, and a group with a
              single discipline in it has nothing left to break down. */}
          {disciplinesInGroup.length > 1 && (
            <div className="pill-row">
              <button
                type="button"
                className={`pill pill--sm${disc === 'All disciplines' ? ' pill--on' : ''}`}
                aria-pressed={disc === 'All disciplines'}
                onClick={() => chooseDiscipline('All disciplines')}
              >
                {t('common.all')}
              </button>
              {disciplinesInGroup.map(d => (
                <button
                  key={d.name}
                  type="button"
                  className={`pill pill--sm${disc === d.name ? ' pill--on' : ''}`}
                  aria-pressed={disc === d.name}
                  onClick={() => chooseDiscipline(d.name)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-body">
        {loadError && (
          <p className="notice notice--error" role="alert">{t('common.loadFailed')}</p>
        )}

        {loading ? (
          <div className="empty-state">{t('resources.loading')}</div>
        ) : (
          <>
            {!loadError && careerContext && (
              <p className="res-context card card--tinted" role="status">
                <span>{t('resources.forCareer', { title: careerContext, discipline: labelFor(disc) })}</span>
                <button type="button" className="res-context__clear" onClick={() => setCareerContext(null)}>
                  {t('resources.clearCareer')}
                </button>
              </p>
            )}

            {!loadError && (
              <p className="res-count">
                {t('resources.count', { shown: n(filtered.length), total: n(resources.length) })}
              </p>
            )}

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

                    {/* Per the client's standard: a student should be able to tell
                        at a glance whether a resource's source was actually
                        checked, not just assume every link is trustworthy. */}
                    <div
                      className={`res-card__reliability res-card__reliability--${r.source_reliability === 'verified' ? 'verified' : 'unverified'}`}
                    >
                      {r.source_reliability === 'verified' ? (
                        <ShieldCheck size={13} />
                      ) : (
                        <ShieldAlert size={13} />
                      )}
                      <span>
                        {r.source_reliability === 'verified'
                          ? t('resources.sourceVerified')
                          : t('resources.sourceUnverified')}
                      </span>
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

            {!loadError && filtered.length === 0 && (
              <div className="empty-state">{t('resources.empty')}</div>
            )}

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
