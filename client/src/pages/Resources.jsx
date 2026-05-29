import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './Resources.css'

const categories = ['All', 'Resume Writing', 'Interview Prep', 'Job Search', 'Soft Skills', 'Skill Development']

const typeColors = {
  Guide: '#D8F3DC',
  Article: '#DBEAFE',
  Video: '#FEF3C7',
  Course: '#EDE9FE',
}
const typeDots = {
  Guide: '#2D6A4F',
  Article: '#1D4ED8',
  Video: '#D97706',
  Course: '#7C3AED',
}

export default function Resources() {
  const [cat, setCat] = useState('All')
  const [disc, setDisc] = useState('All disciplines')
  const [query, setQuery] = useState('')
  const [disciplines, setDisciplines] = useState(['All disciplines'])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch disciplines from API
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await fetch('/api/disciplines')
        const data = await response.json()
        const disciplineNames = ['All disciplines', ...data.map(d => d.name)]
        setDisciplines(disciplineNames)
      } catch (error) {
        console.error('Error fetching disciplines:', error)
        setDisciplines(['All disciplines', 'IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education'])
      }
    }
    
    fetchDisciplines()
  }, [])

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources')
        const data = await response.json()
        setResources(data)
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [])

  // Check if coming from Career Paths page and auto-apply discipline filter
  useEffect(() => {
    const savedDiscipline = localStorage.getItem('selectedDiscipline')
    if (savedDiscipline) {
      setDisc(savedDiscipline)
      localStorage.removeItem('selectedDiscipline')
      localStorage.removeItem('selectedCareer')
    }
  }, [])

  const filtered = resources.filter(r => {
    const matchCat = cat === 'All' || r.category === cat
    const matchDisc = disc === 'All disciplines' || r.discipline === disc || r.discipline === 'All disciplines'
    const matchQ = !query || r.title.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchDisc && matchQ
  })

  if (loading) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />
      <div className="res-header">
        <div className="res-header-inner">
          <h1 className="res-title">Career resources</h1>
          <p className="res-sub">Guides, videos, and articles covering resume writing, interview preparation, job searching, and skill development — tailored for Bangladeshi graduates across all disciplines.</p>
          <div className="res-search-wrap">
            <svg className="res-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input className="res-search" placeholder="Search resources..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="filter-row">
            {categories.map(c => (
              <button key={c} className={`filter-pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="filter-row filter-row--sm">
            {disciplines.map(d => (
              <button key={d} className={`filter-pill filter-pill--sm ${disc === d ? 'active' : ''}`} onClick={() => setDisc(d)}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="res-content">
        <div className="res-grid">
          {filtered.map((r, i) => (
            <div key={i} className="res-card">
              <div className="res-card-banner" style={{ background: typeColors[r.type] }}>
                <span className="res-type-badge" style={{ color: typeDots[r.type] }}>{r.type}</span>
              </div>
              <div className="res-card-body">
                <h3 className="res-card-title">{r.title}</h3>
                <p className="res-card-desc">{r.desc}</p>
                <div className="res-card-tags">
                  <span className="res-tag">{r.discipline}</span>
                  <span className="res-tag">{r.category}</span>
                </div>
                <div className="res-card-footer">
                  <a href={r.url || "#"} className="res-read-more" target="_blank" rel="noopener noreferrer">
                    {r.type === 'Video' ? 'Watch →' : 'Read more →'}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="res-empty">No resources found. Try a different filter.</div>}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-load-more">Load more resources</button>
        </div>
      </div>
    </div>
  )
}