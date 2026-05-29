import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './Alumni.css'

export default function Alumni() {
  const [disc, setDisc] = useState('All')
  const [disciplines, setDisciplines] = useState(['All'])
  const [alumni, setAlumni] = useState([])
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

  // Fetch alumni from API
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        let url = '/api/alumni'
        if (disc !== 'All') {
          url = `/api/alumni/discipline/${disc}`
        }
        const response = await fetch(url)
        const data = await response.json()
        setAlumni(data)
      } catch (error) {
        console.error('Error fetching alumni:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAlumni()
  }, [disc])

  // Function to get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading alumni...</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />
      
      <div className="alumni-header">
        <div className="alumni-header-inner">
          <h1 className="alumni-title">Alumni Network</h1>
          <p className="alumni-sub">
            Connect with the journeys of Bangladeshi graduates who have built successful careers across different industries.
          </p>
          <div className="filter-row">
            {disciplines.map(d => (
              <button
                key={d}
                className={`filter-pill ${disc === d ? 'active' : ''}`}
                onClick={() => setDisc(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="alumni-content">
        <div className="alumni-grid">
          {alumni.length === 0 && (
            <div className="alumni-empty">No alumni found for this discipline.</div>
          )}
          {alumni.map(alum => (
            <div key={alum.id} className="alumni-card">
              <div className="alumni-avatar">
                <div className="alumni-avatar-initials">{alum.image_initials || getInitials(alum.full_name)}</div>
              </div>
              <div className="alumni-info">
                <h3 className="alumni-name">{alum.full_name}</h3>
                <div className="alumni-details">
                  <span className="alumni-institution">{alum.institution} · {alum.graduation_year}</span>
                  <span className="alumni-role">{alum.current_role}</span>
                  <span className="alumni-industry">{alum.industry}</span>
                </div>
                <p className="alumni-bio">{alum.bio}</p>
                <div className="alumni-tags">
                  <span className="alumni-tag">{alum.discipline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}