import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Alumni.css'

export default function Alumni() {
  const { lang, t, n } = useLanguage()
  const [disc, setDisc] = useState('All')
  // Each entry is { name, label }: `name` is the English join key the filter
  // compares against, `label` is what the pill shows. Collapsing the two would
  // make a Bangla label match no alumni row.
  const [disciplines, setDisciplines] = useState([{ name: 'All', label: 'All' }])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch disciplines from API
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await fetch(`/api/disciplines?lang=${lang}`)
        const data = await response.json()
        setDisciplines([
          { name: 'All', label: t('common.all') },
          ...data.map(d => ({ name: d.name, label: (lang === 'bn' && d.name_bn) || d.name })),
        ])
      } catch (error) {
        console.error('Error fetching disciplines:', error)
        setDisciplines([
          { name: 'All', label: t('common.all') },
          ...['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']
            .map(name => ({ name, label: name })),
        ])
      }
    }

    fetchDisciplines()
  }, [lang, t])

  // Fetch alumni from API
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        let url = '/api/alumni'
        if (disc !== 'All') {
          url = `/api/alumni/discipline/${disc}`
        }
        const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}lang=${lang}`)
        const data = await response.json()
        setAlumni(data)
      } catch (error) {
        console.error('Error fetching alumni:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAlumni()
  }, [disc, lang])

  // Function to get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>{t('alumni.loading')}</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />
      
      <div className="alumni-header">
        <div className="alumni-header-inner">
          <h1 className="alumni-title">{t('alumni.title')}</h1>
          <p className="alumni-sub">{t('alumni.sub')}</p>
          <div className="filter-row">
            {disciplines.map(d => (
              <button
                key={d.name}
                className={`filter-pill ${disc === d.name ? 'active' : ''}`}
                onClick={() => setDisc(d.name)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="alumni-content">
        <div className="alumni-grid">
          {alumni.length === 0 && (
            <div className="alumni-empty">{t('alumni.empty')}</div>
          )}
          {alumni.map(alum => (
            <div key={alum.id} className="alumni-card">
              <div className="alumni-avatar">
                <div className="alumni-avatar-initials">{alum.image_initials || getInitials(alum.full_name)}</div>
              </div>
              <div className="alumni-info">
                <h3 className="alumni-name">{alum.full_name}</h3>
                <div className="alumni-details">
                  <span className="alumni-institution">{alum.institution} · {n(alum.graduation_year)}</span>
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