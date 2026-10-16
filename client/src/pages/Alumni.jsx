import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { fetchList } from '../api/fetchList'
import './Alumni.css'

// Discipline groups, client-side mirror of add_discipline_groups.sql: used
// only when the API call fails and the hardcoded fallback list takes over.
// Same grouping as Career Paths and Resources, so all three filter bars agree.
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
  // `group` narrows which disciplines the second pill row offers; `disc`
  // narrows within that group — same split as Career Paths and Resources.
  // Grouping is presentation only: alumni are still filtered by `discipline`,
  // never by group, so no server change was needed to filter on it.
  const [group, setGroup] = useState('All')
  const [disc, setDisc] = useState('All')
  // Each entry is { name, label, group, groupLabel }: `name` is the English
  // join key the filter compares against, `label` is what the pill shows.
  // Collapsing name and label would make a Bangla label match no alumni row.
  const [disciplines, setDisciplines] = useState([{ name: 'All', label: 'All', group: 'All', groupLabel: 'All' }])
  const [alumni, setAlumni] = useState([])
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

  // Fetches the full published list once per language; group and discipline
  // are applied client-side below, the same split Career Paths and Resources
  // use. This replaces the old per-discipline refetch through
  // /api/alumni/discipline/:name, which had no way to ask for "everyone in a
  // group" in a single call.
  useEffect(() => {
    let cancelled = false
    fetchList(`/api/alumni?lang=${lang}`)
      .then(data => { if (!cancelled) { setAlumni(data); setLoadError(false) } })
      .catch(error => {
        if (cancelled) return
        console.error('[alumni]', error.message)
        setAlumni([])
        setLoadError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lang])

  // Map from discipline name to its group, built from whatever list is live
  // (API or fallback) so a group pill can filter alumni without the server
  // needing to know what "group" means.
  const groupOf = useMemo(() => {
    const map = new Map()
    for (const item of disciplines) {
      if (item.name !== 'All') map.set(item.name, item.group)
    }
    return map
  }, [disciplines])

  // One pill per distinct group, in the order its first discipline appears —
  // the admin dashboard's own ordering, not a resorted one.
  const groups = useMemo(() => {
    const seen = new Map()
    seen.set('All', t('common.all'))
    for (const item of disciplines) {
      if (item.name === 'All') continue
      if (!seen.has(item.group)) seen.set(item.group, item.groupLabel)
    }
    return [...seen.entries()].map(([name, label]) => ({ name, label }))
  }, [disciplines, t])

  // The sub-row offers only the disciplines inside the selected group, and is
  // skipped while "All" is selected — it already shows everyone — or the
  // group has only one discipline in it, which has nothing left to break down.
  const disciplinesInGroup = useMemo(
    () => disciplines.filter(item => item.name !== 'All' && item.group === group),
    [disciplines, group],
  )

  const filtered = useMemo(
    () => alumni.filter(person =>
      (group === 'All' || groupOf.get(person.discipline) === group) &&
      (disc === 'All' || person.discipline === disc)
    ),
    [alumni, group, disc, groupOf],
  )

  const chooseGroup = (name) => {
    setGroup(name)
    setDisc('All')
  }

  return (
    <div className="page-enter">
      <Navbar />

      <section className="page-head alumni-head">
        <div className="shell">
          <h1 className="alumni-head__title">{t('alumni.title')}</h1>
          <p className="alumni-head__sub">{t('alumni.sub')}</p>
          <div className="pill-row alumni-head__filters">
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
              discipline — "All" already shows everyone, and a group with a
              single discipline in it has nothing left to break down. */}
          {disciplinesInGroup.length > 1 && (
            <div className="pill-row alumni-head__filters alumni-head__filters--sub">
              <button
                type="button"
                className={`pill pill--sm${disc === 'All' ? ' pill--on' : ''}`}
                aria-pressed={disc === 'All'}
                onClick={() => setDisc('All')}
              >
                {t('common.all')}
              </button>
              {disciplinesInGroup.map(item => (
                <button
                  key={item.name}
                  type="button"
                  className={`pill pill--sm${disc === item.name ? ' pill--on' : ''}`}
                  aria-pressed={disc === item.name}
                  onClick={() => setDisc(item.name)}
                >
                  {item.label}
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
          <div className="empty-state">{t('alumni.loading')}</div>
        ) : filtered.length === 0 ? (
          loadError ? null : <div className="empty-state">{t('alumni.empty')}</div>
        ) : (
          <div className="alumni-grid">
            {filtered.map(person => (
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

                  {(person.linkedin_url || person.email) && (
                    <div className="alumni-card__contacts">
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={16} aria-hidden="true" />
                          {t('alumni.linkedin')}
                        </a>
                      )}
                      {person.email && (
                        <a href={`mailto:${person.email}`}>
                          <Mail size={16} aria-hidden="true" />
                          {t('alumni.email')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
