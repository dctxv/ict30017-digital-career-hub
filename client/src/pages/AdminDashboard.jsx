import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('disciplines')
  const [disciplines, setDisciplines] = useState([])
  const [careerPaths, setCareerPaths] = useState([])
  const [resources, setResources] = useState([])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // Form states
  const [discForm, setDiscForm] = useState({ name: '', description: '' })
  const [editingDiscId, setEditingDiscId] = useState(null)
  
  const [pathForm, setPathForm] = useState({
    title: '', industry: '', discipline: '', desc: '',
    skills: '', progression: '', salaryEntry: '', salarySenior: ''
  })
  const [editingPathId, setEditingPathId] = useState(null)
  
  const [resourceForm, setResourceForm] = useState({
    title: '', type: '', discipline: '', category: '', desc: '', url: ''
  })
  
  const [alumniForm, setAlumniForm] = useState({
    full_name: '', institution: '', discipline: '', graduation_year: '',
    current_role: '', industry: '', bio: '', image_initials: ''
  })
  const [editingAlumniId, setEditingAlumniId] = useState(null)
  
  const [disciplinesList, setDisciplinesList] = useState([])

  // Fetch all data
  const fetchDisciplines = async () => {
    const res = await fetch('http://localhost:3000/api/disciplines')
    const data = await res.json()
    setDisciplines(data)
    setDisciplinesList(data)
  }

  const fetchCareerPaths = async () => {
    const res = await fetch('http://localhost:3000/api/career-paths')
    const data = await res.json()
    setCareerPaths(data)
  }

  const fetchResources = async () => {
    const res = await fetch('http://localhost:3000/api/resources')
    const data = await res.json()
    setResources(data)
  }

  const fetchAlumni = async () => {
    const res = await fetch('http://localhost:3000/api/alumni')
    const data = await res.json()
    setAlumni(data)
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await fetchDisciplines()
      await fetchCareerPaths()
      await fetchResources()
      await fetchAlumni()
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Discipline CRUD
  const handleDiscSubmit = async (e) => {
    e.preventDefault()
    const url = editingDiscId 
      ? `http://localhost:3000/api/disciplines/${editingDiscId}`
      : 'http://localhost:3000/api/disciplines'
    const method = editingDiscId ? 'PUT' : 'POST'
    
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discForm) })
    if (res.ok) {
      setMessage(editingDiscId ? 'Discipline updated' : 'Discipline added')
      fetchDisciplines()
      setDiscForm({ name: '', description: '' })
      setEditingDiscId(null)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleDiscDelete = async (id) => {
    if (confirm('Delete this discipline?')) {
      await fetch(`http://localhost:3000/api/disciplines/${id}`, { method: 'DELETE' })
      fetchDisciplines()
      setMessage('Discipline deleted')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  // Career Path CRUD
  const handlePathSubmit = async (e) => {
    e.preventDefault()
    const skillsArray = pathForm.skills.split(',').map(s => s.trim())
    let progressionArray = []
    try {
      progressionArray = JSON.parse(pathForm.progression)
    } catch {
      progressionArray = [{ label: 'Entry level', time: '0-2 yrs' }]
    }
    
    const payload = {
      title: pathForm.title,
      industry: pathForm.industry,
      discipline: pathForm.discipline,
      desc: pathForm.desc,
      skills: skillsArray,
      progression: progressionArray,
      salaryEntry: pathForm.salaryEntry,
      salarySenior: pathForm.salarySenior
    }
    
    const url = editingPathId 
      ? `http://localhost:3000/api/career-paths/${editingPathId}`
      : 'http://localhost:3000/api/career-paths'
    const method = editingPathId ? 'PUT' : 'POST'
    
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setMessage(editingPathId ? 'Career path updated' : 'Career path added')
      fetchCareerPaths()
      setPathForm({ title: '', industry: '', discipline: '', desc: '', skills: '', progression: '', salaryEntry: '', salarySenior: '' })
      setEditingPathId(null)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handlePathDelete = async (id) => {
    if (confirm('Delete this career path?')) {
      await fetch(`http://localhost:3000/api/career-paths/${id}`, { method: 'DELETE' })
      fetchCareerPaths()
      setMessage('Career path deleted')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  // Resource CRUD
  const handleResourceSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:3000/api/resources', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(resourceForm) 
    })
    if (res.ok) {
      setMessage('Resource added')
      fetchResources()
      setResourceForm({ title: '', type: '', discipline: '', category: '', desc: '', url: '' })
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleResourceDelete = async (index) => {
    if (confirm('Delete this resource?')) {
      await fetch(`http://localhost:3000/api/resources/${index}`, { method: 'DELETE' })
      fetchResources()
      setMessage('Resource deleted')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  // Alumni CRUD
  const handleAlumniSubmit = async (e) => {
    e.preventDefault()
    const url = editingAlumniId 
      ? `http://localhost:3000/api/alumni/${editingAlumniId}`
      : 'http://localhost:3000/api/alumni'
    const method = editingAlumniId ? 'PUT' : 'POST'
    
    const payload = { ...alumniForm, consent_given: true, is_published: true }
    
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setMessage(editingAlumniId ? 'Alumni updated' : 'Alumni added')
      fetchAlumni()
      setAlumniForm({ full_name: '', institution: '', discipline: '', graduation_year: '', current_role: '', industry: '', bio: '', image_initials: '' })
      setEditingAlumniId(null)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleAlumniDelete = async (id) => {
    if (confirm('Delete this alumni?')) {
      await fetch(`http://localhost:3000/api/alumni/${id}`, { method: 'DELETE' })
      fetchAlumni()
      setMessage('Alumni deleted')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  if (loading) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />
      <div className="admin-header">
        <div className="admin-header-inner">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-sub">Manage disciplines, career paths, resources, and alumni</p>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'disciplines' ? 'active' : ''}`} onClick={() => setActiveTab('disciplines')}>Disciplines</button>
          <button className={`admin-tab ${activeTab === 'career-paths' ? 'active' : ''}`} onClick={() => setActiveTab('career-paths')}>Career Paths</button>
          <button className={`admin-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Resources</button>
          <button className={`admin-tab ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => setActiveTab('alumni')}>Alumni</button>
        </div>

        <div className="admin-panel">
          {message && <div className="admin-message">{message}</div>}

          {/* Disciplines Tab */}
          {activeTab === 'disciplines' && (
            <div>
              <div className="admin-form-card">
                <h2>{editingDiscId ? 'Edit Discipline' : 'Add New Discipline'}</h2>
                <form onSubmit={handleDiscSubmit}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={discForm.name} onChange={(e) => setDiscForm({ ...discForm, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={discForm.description} onChange={(e) => setDiscForm({ ...discForm, description: e.target.value })} rows="2" />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{editingDiscId ? 'Update' : 'Add'} Discipline</button>
                    {editingDiscId && <button type="button" className="btn-secondary" onClick={() => { setEditingDiscId(null); setDiscForm({ name: '', description: '' }) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Disciplines</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {disciplines.map(d => (
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.description || '-'}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingDiscId(d.id); setDiscForm({ name: d.name, description: d.description || '' }) }}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDiscDelete(d.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Career Paths Tab */}
          {activeTab === 'career-paths' && (
            <div>
              <div className="admin-form-card">
                <h2>{editingPathId ? 'Edit Career Path' : 'Add New Career Path'}</h2>
                <form onSubmit={handlePathSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input className="form-input" value={pathForm.title} onChange={(e) => setPathForm({ ...pathForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <input className="form-input" value={pathForm.industry} onChange={(e) => setPathForm({ ...pathForm, industry: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Discipline</label>
                      <select className="form-input" value={pathForm.discipline} onChange={(e) => setPathForm({ ...pathForm, discipline: e.target.value })} required>
                        <option value="">Select discipline</option>
                        {disciplinesList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Salary (Entry)</label>
                      <input className="form-input" value={pathForm.salaryEntry} onChange={(e) => setPathForm({ ...pathForm, salaryEntry: e.target.value })} placeholder="BDT 25,000–40,000" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Salary (Senior)</label>
                      <input className="form-input" value={pathForm.salarySenior} onChange={(e) => setPathForm({ ...pathForm, salarySenior: e.target.value })} placeholder="BDT 80,000–150,000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Skills (comma separated)</label>
                      <input className="form-input" value={pathForm.skills} onChange={(e) => setPathForm({ ...pathForm, skills: e.target.value })} placeholder="Excel, Python, Communication" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={pathForm.desc} onChange={(e) => setPathForm({ ...pathForm, desc: e.target.value })} rows="3" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Progression (JSON format)</label>
                    <textarea className="form-textarea" value={pathForm.progression} onChange={(e) => setPathForm({ ...pathForm, progression: e.target.value })} rows="4" placeholder='[{"label":"Junior","time":"0-1 yr"},{"label":"Senior","time":"1-3 yrs","current":true}]' />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{editingPathId ? 'Update' : 'Add'} Career Path</button>
                    {editingPathId && <button type="button" className="btn-secondary" onClick={() => { setEditingPathId(null); setPathForm({ title: '', industry: '', discipline: '', desc: '', skills: '', progression: '', salaryEntry: '', salarySenior: '' }) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Career Paths ({careerPaths.length})</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Title</th><th>Discipline</th><th>Industry</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {careerPaths.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><strong>{p.title}</strong></td>
                        <td>{p.discipline}</td>
                        <td>{p.industry}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingPathId(p.id); setPathForm({ title: p.title, industry: p.industry, discipline: p.discipline, desc: p.desc, skills: p.skills.join(', '), progression: JSON.stringify(p.progression, null, 2), salaryEntry: p.salaryEntry, salarySenior: p.salarySenior }) }}>Edit</button>
                          <button className="btn-delete" onClick={() => handlePathDelete(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              <div className="admin-form-card">
                <h2>Add New Resource</h2>
                <form onSubmit={handleResourceSubmit}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-input" value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} required>
                        <option value="">Select type</option>
                        <option value="Guide">Guide</option>
                        <option value="Article">Article</option>
                        <option value="Video">Video</option>
                        <option value="Course">Course</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discipline</label>
                      <select className="form-input" value={resourceForm.discipline} onChange={(e) => setResourceForm({ ...resourceForm, discipline: e.target.value })} required>
                        <option value="">Select discipline</option>
                        <option value="All disciplines">All disciplines</option>
                        {disciplinesList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })} required>
                        <option value="">Select category</option>
                        <option value="Resume Writing">Resume Writing</option>
                        <option value="Interview Prep">Interview Prep</option>
                        <option value="Job Search">Job Search</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Skill Development">Skill Development</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL</label>
                      <input className="form-input" value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={resourceForm.desc} onChange={(e) => setResourceForm({ ...resourceForm, desc: e.target.value })} rows="3" required />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">Add Resource</button>
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Resources ({resources.length})</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Title</th><th>Type</th><th>Discipline</th><th>Category</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {resources.map((r, i) => (
                      <tr key={i}>
                        <td>{i}</td>
                        <td><strong>{r.title.substring(0, 40)}...</strong></td>
                        <td>{r.type}</td>
                        <td>{r.discipline}</td>
                        <td>{r.category}</td>
                        <td><button className="btn-delete" onClick={() => handleResourceDelete(i)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alumni Tab */}
          {activeTab === 'alumni' && (
            <div>
              <div className="admin-form-card">
                <h2>{editingAlumniId ? 'Edit Alumni' : 'Add New Alumni'}</h2>
                <form onSubmit={handleAlumniSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={alumniForm.full_name} onChange={(e) => setAlumniForm({ ...alumniForm, full_name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Institution</label>
                      <input className="form-input" value={alumniForm.institution} onChange={(e) => setAlumniForm({ ...alumniForm, institution: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Discipline</label>
                      <select className="form-input" value={alumniForm.discipline} onChange={(e) => setAlumniForm({ ...alumniForm, discipline: e.target.value })} required>
                        <option value="">Select discipline</option>
                        {disciplinesList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Graduation Year</label>
                      <input className="form-input" type="number" value={alumniForm.graduation_year} onChange={(e) => setAlumniForm({ ...alumniForm, graduation_year: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Current Role</label>
                      <input className="form-input" value={alumniForm.current_role} onChange={(e) => setAlumniForm({ ...alumniForm, current_role: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <input className="form-input" value={alumniForm.industry} onChange={(e) => setAlumniForm({ ...alumniForm, industry: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Initials (for avatar)</label>
                      <input className="form-input" value={alumniForm.image_initials} onChange={(e) => setAlumniForm({ ...alumniForm, image_initials: e.target.value })} placeholder="SR" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" value={alumniForm.bio} onChange={(e) => setAlumniForm({ ...alumniForm, bio: e.target.value })} rows="3" required />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{editingAlumniId ? 'Update' : 'Add'} Alumni</button>
                    {editingAlumniId && <button type="button" className="btn-secondary" onClick={() => { setEditingAlumniId(null); setAlumniForm({ full_name: '', institution: '', discipline: '', graduation_year: '', current_role: '', industry: '', bio: '', image_initials: '' }) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Alumni ({alumni.length})</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Institution</th><th>Discipline</th><th>Role</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {alumni.map(a => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td><strong>{a.full_name}</strong></td>
                        <td>{a.institution}</td>
                        <td>{a.discipline}</td>
                        <td>{a.current_role}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingAlumniId(a.id); setAlumniForm({ full_name: a.full_name, institution: a.institution, discipline: a.discipline, graduation_year: a.graduation_year, current_role: a.current_role, industry: a.industry, bio: a.bio, image_initials: a.image_initials || '' }) }}>Edit</button>
                          <button className="btn-delete" onClick={() => handleAlumniDelete(a.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}