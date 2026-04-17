import { useState } from 'react'
import Navbar from '../components/Navbar'
import './CareerPaths.css'

const disciplines = ['All', 'IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

const paths = [
  {
    id: 1,
    title: 'Financial Analyst',
    industry: 'Banking and Finance',
    discipline: 'Finance',
    desc: 'Financial Analysts in Bangladesh are in high demand across banks, NGOs, and corporate finance teams. The role involves analysing financial data, preparing reports, and supporting business decisions. Entry-level positions are commonly found at BRAC Bank, Dutch-Bangla Bank, and multinational firms operating in Dhaka.',
    skills: ['Excel', 'Financial Modelling', 'Accounting Principles', 'Data Analysis', 'Report Writing', 'Communication'],
    progression: [
      { label: 'Junior Analyst', time: '0–1 yr' },
      { label: 'Financial Analyst', time: '1–3 yrs', current: true },
      { label: 'Senior Analyst', time: '3–5 yrs' },
      { label: 'Finance Manager', time: '5–8 yrs' },
      { label: 'CFO / Director', time: '8+ yrs' },
    ],
    salaryEntry: 'BDT 25,000–40,000',
    salarySenior: 'BDT 80,000–150,000',
  },
  {
    id: 2,
    title: 'Software Engineer',
    industry: 'Technology',
    discipline: 'IT',
    desc: 'Software Engineers are among the most sought-after professionals in Bangladesh\'s growing tech sector. Companies like Pathao, Shohoz, and numerous software outsourcing firms actively recruit fresh graduates. Strong fundamentals, a GitHub portfolio, and knowledge of modern frameworks are key.',
    skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'REST APIs', 'Problem Solving'],
    progression: [
      { label: 'Junior Developer', time: '0–1 yr' },
      { label: 'Software Engineer', time: '1–3 yrs', current: true },
      { label: 'Senior Engineer', time: '3–6 yrs' },
      { label: 'Tech Lead', time: '6–9 yrs' },
      { label: 'CTO / Architect', time: '9+ yrs' },
    ],
    salaryEntry: 'BDT 30,000–55,000',
    salarySenior: 'BDT 120,000–250,000',
  },
  {
    id: 3,
    title: 'Civil Engineer',
    industry: 'Infrastructure and Construction',
    discipline: 'Engineering',
    desc: 'Civil Engineers play a critical role in Bangladesh\'s infrastructure development. Government agencies like LGED and RAJUK, as well as large construction firms, regularly recruit graduates. Understanding local building codes and project management is essential.',
    skills: ['AutoCAD', 'Structural Analysis', 'Project Management', 'Site Supervision', 'Cost Estimation', 'Bangladesh Building Code'],
    progression: [
      { label: 'Site Engineer', time: '0–2 yrs' },
      { label: 'Civil Engineer', time: '2–4 yrs', current: true },
      { label: 'Senior Engineer', time: '4–7 yrs' },
      { label: 'Project Manager', time: '7–10 yrs' },
      { label: 'Chief Engineer', time: '10+ yrs' },
    ],
    salaryEntry: 'BDT 22,000–38,000',
    salarySenior: 'BDT 70,000–130,000',
  },
  {
    id: 4,
    title: 'Marketing Executive',
    industry: 'Marketing and Communications',
    discipline: 'Business',
    desc: 'Marketing roles in Bangladesh span telecoms, FMCG, e-commerce, and development sectors. Grameenphone, Robi, and Unilever Bangladesh run structured graduate trainee programmes. Digital marketing skills are increasingly valued alongside traditional brand management.',
    skills: ['Digital Marketing', 'Brand Management', 'Market Research', 'Communication', 'Social Media', 'Campaign Analytics'],
    progression: [
      { label: 'Marketing Trainee', time: '0–1 yr' },
      { label: 'Marketing Executive', time: '1–3 yrs', current: true },
      { label: 'Senior Executive', time: '3–5 yrs' },
      { label: 'Brand Manager', time: '5–8 yrs' },
      { label: 'Marketing Director', time: '8+ yrs' },
    ],
    salaryEntry: 'BDT 20,000–35,000',
    salarySenior: 'BDT 80,000–160,000',
  },
  {
    id: 5,
    title: 'Research Associate',
    industry: 'Research and Development',
    discipline: 'Science',
    desc: 'Research roles in Bangladesh are available at icddr,b, BARI, BRRI, and university research centres. Science graduates can also enter the pharmaceutical industry at companies like Square and Beximco. Strong analytical skills and a publication record strengthen your profile significantly.',
    skills: ['Research Methodology', 'Data Analysis', 'Scientific Writing', 'Lab Techniques', 'Statistical Software', 'Grant Writing'],
    progression: [
      { label: 'Research Assistant', time: '0–2 yrs' },
      { label: 'Research Associate', time: '2–4 yrs', current: true },
      { label: 'Senior Researcher', time: '4–7 yrs' },
      { label: 'Research Manager', time: '7–10 yrs' },
      { label: 'Principal Scientist', time: '10+ yrs' },
    ],
    salaryEntry: 'BDT 25,000–42,000',
    salarySenior: 'BDT 75,000–140,000',
  },
]

export default function CareerPaths() {
  const [disc, setDisc] = useState('All')
  const [selectedId, setSelectedId] = useState(1)

  const filtered = paths.filter(p => disc === 'All' || p.discipline === disc)
  const selected = paths.find(p => p.id === selectedId) || filtered[0]

  return (
    <div className="page-enter">
      <Navbar />

      <div className="cp-header">
        <div className="cp-header-inner">
          <h1 className="cp-title">Career path explorer</h1>
          <p className="cp-sub">
            Explore career paths across all industries relevant to Bangladeshi graduates — from entry level to senior roles, with local salary context and required skills.
          </p>
          <div className="cp-dropdowns">
            <select className="cp-select">
              <option>All disciplines</option>
              {disciplines.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
            </select>
            <select className="cp-select">
              <option>All industries</option>
              <option>Banking and Finance</option>
              <option>Technology</option>
              <option>Infrastructure and Construction</option>
              <option>Marketing and Communications</option>
              <option>Research and Development</option>
            </select>
          </div>
          <div className="filter-row">
            {disciplines.map(d => (
              <button
                key={d}
                className={`filter-pill ${disc === d ? 'active' : ''}`}
                onClick={() => { setDisc(d); if (d !== 'All') { const first = paths.find(p => p.discipline === d); if (first) setSelectedId(first.id) } }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cp-body">
        {/* Left: path list */}
        <div className="cp-list-col">
          {filtered.length === 0 && (
            <div className="cp-empty">No paths found for this discipline.</div>
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
            Showing {filtered.length} of {paths.length} paths
            {disc !== 'All' ? ` in ${disc}` : ''}
          </div>
        </div>

        {/* Right: detail panel */}
        {selected && (
          <div className="cp-detail-col">
            <h2 className="cp-detail-title">{selected.title}</h2>
            <div className="cp-detail-tags">
              <span className="cp-detail-tag">{selected.industry}</span>
              <span className="cp-detail-tag">{selected.discipline}</span>
            </div>
            <p className="cp-detail-desc">{selected.desc}</p>

            <div className="cp-section-label">Required skills</div>
            <div className="cp-skills">
              {selected.skills.map(s => (
                <span key={s} className="cp-skill-pill">{s}</span>
              ))}
            </div>

            <div className="cp-section-label">Typical progression</div>
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

            <div className="cp-section-label">Salary context (Bangladesh)</div>
            <div className="cp-salary-cards">
              <div className="cp-salary-card">
                <div className="cp-salary-level">Entry level</div>
                <div className="cp-salary-amount">{selected.salaryEntry}</div>
                <div className="cp-salary-period">per month</div>
              </div>
              <div className="cp-salary-card">
                <div className="cp-salary-level">Senior level</div>
                <div className="cp-salary-amount">{selected.salarySenior}</div>
                <div className="cp-salary-period">per month</div>
              </div>
            </div>

            <button className="cp-resources-btn">Find related resources →</button>
          </div>
        )}
      </div>
    </div>
  )
}