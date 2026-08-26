import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './CareerPaths.css'

export default function CareerPaths() {
  const { t, n } = useLanguage()
  const [disc, setDisc] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [disciplines, setDisciplines] = useState(['All'])
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch disciplines from API
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await fetch('/api/disciplines')
        const data = await response.json()
        const disciplineNames = ['All', ...data.map(d => d.name)]
        setDisciplines(disciplineNames)
      } catch (error) {
        console.error('Error fetching disciplines:', error)
        setDisciplines(['All', 'IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education'])
      }
    }
    
    fetchDisciplines()
  }, [])

  // Fetch career paths from API
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const response = await fetch('/api/career-paths')
        const data = await response.json()
        setPaths(data)
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching career paths:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPaths()
  }, [])

  // Function to navigate to resources with discipline filter
  const goToResources = (discipline, careerTitle) => {
    localStorage.setItem('selectedDiscipline', discipline)
    localStorage.setItem('selectedCareer', careerTitle)
    // assign() rather than an href assignment: identical navigation, but the
    // React Compiler's immutability rule rejects writing to a value defined
    // outside the component, and it now analyses this component far enough to
    // see it.
    window.location.assign('/resources')
  }

  const filtered = paths.filter(p => disc === 'All' || p.discipline === disc)
  const selected = paths.find(p => p.id === selectedId) || filtered[0]

  if (loading) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>{t('careers.loading')}</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />

      <div className="cp-header">
        <div className="cp-header-inner">
          <h1 className="cp-title">{t('careers.title')}</h1>
          <p className="cp-sub">{t('careers.sub')}</p>
          <div className="filter-row">
            {disciplines.map(d => (
              <button
                key={d}
                className={`filter-pill ${disc === d ? 'active' : ''}`}
                onClick={() => { 
                  setDisc(d)
                  if (d !== 'All') {
                    const first = paths.find(p => p.discipline === d)
                    if (first) setSelectedId(first.id)
                  } else if (filtered.length > 0) {
                    setSelectedId(filtered[0].id)
                  }
                }}
              >
                {d === 'All' ? t('common.all') : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cp-body">
        <div className="cp-list-col">
          {filtered.length === 0 && (
            <div className="cp-empty">{t('careers.empty')}</div>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              className={`cp-path-item ${selectedId === p.id ? 'active' : ''}`}
              onClick={() => setSelectedId(p.id)}
            >
              <div className="cp-path-item-inner">
                <div>
                  <div className="cp-path-title">{p.title}</div>
                  <div className="cp-path-industry">{p.industry}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="cp-arrow">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
          <div className="cp-list-count">
            {disc === 'All'
              ? t('careers.showingCount', { shown: n(filtered.length), total: n(paths.length) })
              : t('careers.showingCountFiltered', { shown: n(filtered.length), total: n(paths.length), discipline: disc })}
          </div>
        </div>

        {selected && (
          <div className="cp-detail-col">
            <h2 className="cp-detail-title">{selected.title}</h2>
            <div className="cp-detail-tags">
              <span className="cp-detail-tag">{selected.industry}</span>
              <span className="cp-detail-tag">{selected.discipline}</span>
            </div>
            <p className="cp-detail-desc">{selected.desc}</p>

            <div className="cp-section-label">{t('careers.requiredSkills')}</div>
            <div className="cp-skills">
              {selected.skills.map(s => (
                <span key={s} className="cp-skill-pill">{s}</span>
              ))}
            </div>

            <div className="cp-section-label">{t('careers.progression')}</div>
            <div className="cp-progression">
              {selected.progression.map((step, i) => (
                <div key={i} className="cp-prog-step">
                  <div className={`cp-prog-dot ${step.current ? 'current' : ''}`} />
                  {i < selected.progression.length - 1 && <div className="cp-prog-line" />}
                  <div className={`cp-prog-label ${step.current ? 'current' : ''}`}>{step.label}</div>
                  <div className="cp-prog-time">{step.time}</div>
                </div>
              ))}
            </div>

            <div className="cp-section-label">{t('careers.salaryContext')}</div>
            <div className="cp-salary-cards">
              <div className="cp-salary-card">
                <div className="cp-salary-level">{t('careers.entryLevel')}</div>
                <div className="cp-salary-amount">{selected.salaryEntry}</div>
                <div className="cp-salary-period">{t('common.perMonth')}</div>
              </div>
              <div className="cp-salary-card">
                <div className="cp-salary-level">{t('careers.seniorLevel')}</div>
                <div className="cp-salary-amount">{selected.salarySenior}</div>
                <div className="cp-salary-period">{t('common.perMonth')}</div>
              </div>
            </div>

            <button 
              className="cp-resources-btn"
              onClick={() => goToResources(selected.discipline, selected.title)}
            >
              {t('careers.findResources', { title: selected.title })}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}