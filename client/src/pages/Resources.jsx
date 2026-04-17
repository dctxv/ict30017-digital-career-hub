import { useState } from 'react'
import Navbar from '../components/Navbar'
import './Resources.css'

const categories = ['All', 'Resume Writing', 'Interview Prep', 'Job Search', 'Soft Skills', 'Skill Development']
const disciplines = ['All disciplines', 'IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

const resources = [
  { title: 'How to write a strong CV for finance roles in Bangladesh', type: 'Guide', discipline: 'Finance', category: 'Resume Writing', desc: 'A step-by-step guide to structuring your CV for Bangladeshi finance employers, including what local recruiters look for.' },
  { title: 'Interview preparation guide for fresh graduates', type: 'Article', discipline: 'All disciplines', category: 'Interview Prep', desc: 'Common interview question formats, expected behaviours, and how to present yourself confidently to Bangladeshi employers.' },
  { title: 'Understanding Bangladesh job market trends 2026', type: 'Article', discipline: 'All disciplines', category: 'Job Search', desc: 'A breakdown of which sectors are hiring, what skills are in demand, and how to position yourself effectively.' },
  { title: 'Soft skills in Asian professional culture — what employers expect', type: 'Video', discipline: 'All disciplines', category: 'Soft Skills', desc: 'How professional soft skills differ between Asian and Western workplace cultures, and how to demonstrate them.' },
  { title: 'Building technical skills for software engineering roles', type: 'Course', discipline: 'IT', category: 'Skill Development', desc: 'A curated learning path covering the technical skills most sought after by Bangladeshi tech companies.' },
  { title: 'How to write a cover letter for Bangladeshi employers', type: 'Guide', discipline: 'All disciplines', category: 'Resume Writing', desc: 'Cover letter conventions for the Bangladeshi job market, with structure, tone, and example phrases.' },
]

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

  const filtered = resources.filter(r => {
    const matchCat = cat === 'All' || r.category === cat
    const matchDisc = disc === 'All disciplines' || r.discipline === disc || r.discipline === 'All disciplines'
    const matchQ = !query || r.title.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchDisc && matchQ
  })

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
                  <a href="#" className="res-read-more">{r.type === 'Video' ? 'Watch →' : 'Read more →'}</a>
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