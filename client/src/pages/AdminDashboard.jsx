import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import './AdminDashboard.css'

const RESOURCE_TYPES = ['Guide', 'Article', 'Video', 'Course', 'PDF']
const RESOURCE_CATEGORIES = [
  'Resume Writing',
  'Interview Prep',
  'Job Search',
  'Soft Skills',
  'Skill Development',
]

const emptyDisc = { name: '', description: '' }
const emptyPath = {
  title: '', industry: '', discipline: '', desc: '',
  skills: '', progression: '', salaryEntry: '', salarySenior: '',
}
const emptyResource = {
  title_en: '', title_bn: '', description_en: '', description_bn: '',
  type: '', discipline: '', category: '', url: '',
}
const emptyAlumni = {
  full_name: '', institution: '', discipline: '', graduation_year: '',
  current_role: '', industry: '', bio: '', image_initials: '',
  consent_given: false, is_published: false,
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('disciplines')
  const [disciplines, setDisciplines] = useState([])
  const [careerPaths, setCareerPaths] = useState([])
  const [resources, setResources] = useState([])
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [discForm, setDiscForm] = useState(emptyDisc)
  const [editingDiscId, setEditingDiscId] = useState(null)

  const [pathForm, setPathForm] = useState(emptyPath)
  const [editingPathId, setEditingPathId] = useState(null)

  const [resourceForm, setResourceForm] = useState(emptyResource)
  const [editingResourceId, setEditingResourceId] = useState(null)

  const [alumniForm, setAlumniForm] = useState(emptyAlumni)
  const [editingAlumniId, setEditingAlumniId] = useState(null)

  const notify = (text) => {
    setError('')
    setMessage(text)
    setTimeout(() => setMessage(''), 2500)
  }

  // Surfaces why a write failed instead of failing silently. The guarded
  // endpoints answer 401 when the session has lapsed and 403 when the account
  // is not an admin; both are worth telling the user apart.
  const reportFailure = async (res, fallback) => {
    setMessage('')
    if (res.status === 401) {
      setError('Your session has expired. Please log in again.')
      return
    }
    if (res.status === 403) {
      setError('Your account does not have permission to make this change.')
      return
    }
    let detail = ''
    try {
      detail = (await res.json())?.error ?? ''
    } catch {
      detail = ''
    }
    setError(detail || fallback)
  }

  const getJson = async (path, setter, label) => {
    try {
      const res = await fetch(path)
      if (!res.ok) {
        await reportFailure(res, `Could not load ${label}.`)
        return
      }
      setter(await res.json())
    } catch {
      setError(`Could not reach the server while loading ${label}.`)
    }
  }

  const fetchDisciplines = () => getJson('/api/disciplines', setDisciplines, 'disciplines')
  const fetchCareerPaths = () => getJson('/api/career-paths', setCareerPaths, 'career paths')
  const fetchResources = () => getJson('/api/resources', setResources, 'resources')
  // Admin view includes unpublished drafts, which /api/alumni deliberately hides.
  const fetchAlumni = () => getJson('/api/alumni/all', setAlumni, 'alumni')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([fetchDisciplines(), fetchCareerPaths(), fetchResources(), fetchAlumni()])
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Shared write helper. Returns true when the write succeeded.
  const submit = async (method, path, payload, fallback) => {
    try {
      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        await reportFailure(res, fallback)
        return false
      }
      return true
    } catch {
      setError('Could not reach the server.')
      return false
    }
  }

  const remove = async (path, confirmText, refresh, label) => {
    if (!confirm(confirmText)) return
    try {
      const res = await fetch(path, { method: 'DELETE' })
      if (!res.ok) {
        await reportFailure(res, `Could not delete this ${label}.`)
        return
      }
      await refresh()
      notify(`${label} deleted`)
    } catch {
      setError('Could not reach the server.')
    }
  }

  // ---- Disciplines ----
  const handleDiscSubmit = async (e) => {
    e.preventDefault()
    const ok = await submit(
      editingDiscId ? 'PUT' : 'POST',
      editingDiscId ? `/api/disciplines/${editingDiscId}` : '/api/disciplines',
      discForm,
      'Could not save this discipline.'
    )
    if (!ok) return
    await fetchDisciplines()
    setDiscForm(emptyDisc)
    setEditingDiscId(null)
    notify(editingDiscId ? 'Discipline updated' : 'Discipline added')
  }

  // ---- Career paths ----
  const handlePathSubmit = async (e) => {
    e.preventDefault()

    // Progression is entered as JSON. A parse failure is reported rather than
    // silently replaced with placeholder steps, which would quietly discard
    // whatever the admin typed.
    let progression = []
    const raw = pathForm.progression.trim()
    if (raw !== '') {
      try {
        progression = JSON.parse(raw)
      } catch {
        setMessage('')
        setError('Progression must be valid JSON, for example [{"label":"Junior","time":"0-1 yr"}].')
        return
      }
    }

    const payload = {
      title: pathForm.title,
      industry: pathForm.industry,
      discipline: pathForm.discipline,
      desc: pathForm.desc,
      skills: pathForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      progression,
      salaryEntry: pathForm.salaryEntry,
      salarySenior: pathForm.salarySenior,
    }

    const ok = await submit(
      editingPathId ? 'PUT' : 'POST',
      editingPathId ? `/api/career-paths/${editingPathId}` : '/api/career-paths',
      payload,
      'Could not save this career path.'
    )
    if (!ok) return
    await fetchCareerPaths()
    setPathForm(emptyPath)
    setEditingPathId(null)
    notify(editingPathId ? 'Career path updated' : 'Career path added')
  }

  // ---- Resources ----
  const handleResourceSubmit = async (e) => {
    e.preventDefault()
    const ok = await submit(
      editingResourceId ? 'PUT' : 'POST',
      editingResourceId ? `/api/resources/${editingResourceId}` : '/api/resources',
      resourceForm,
      'Could not save this resource.'
    )
    if (!ok) return
    await fetchResources()
    setResourceForm(emptyResource)
    setEditingResourceId(null)
    notify(editingResourceId ? 'Resource updated' : 'Resource added')
  }

  // ---- Alumni ----
  const handleAlumniSubmit = async (e) => {
    e.preventDefault()
    const ok = await submit(
      editingAlumniId ? 'PUT' : 'POST',
      editingAlumniId ? `/api/alumni/${editingAlumniId}` : '/api/alumni',
      alumniForm,
      'Could not save this alumni profile.'
    )
    if (!ok) return
    await fetchAlumni()
    setAlumniForm(emptyAlumni)
    setEditingAlumniId(null)
    notify(editingAlumniId ? 'Alumni updated' : 'Alumni added')
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
          {error && <div className="admin-error">{error}</div>}

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
                    {editingDiscId && <button type="button" className="btn-secondary" onClick={() => { setEditingDiscId(null); setDiscForm(emptyDisc) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Disciplines ({disciplines.length})</h2>
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
                          <button className="btn-delete" onClick={() => remove(`/api/disciplines/${d.id}`, 'Delete this discipline?', fetchDisciplines, 'Discipline')}>Delete</button>
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
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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
                    {editingPathId && <button type="button" className="btn-secondary" onClick={() => { setEditingPathId(null); setPathForm(emptyPath) }}>Cancel</button>}
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
                          <button className="btn-edit" onClick={() => { setEditingPathId(p.id); setPathForm({ title: p.title, industry: p.industry, discipline: p.discipline, desc: p.desc, skills: (p.skills ?? []).join(', '), progression: JSON.stringify(p.progression ?? [], null, 2), salaryEntry: p.salaryEntry, salarySenior: p.salarySenior }) }}>Edit</button>
                          <button className="btn-delete" onClick={() => remove(`/api/career-paths/${p.id}`, 'Delete this career path?', fetchCareerPaths, 'Career path')}>Delete</button>
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
                <h2>{editingResourceId ? 'Edit Resource' : 'Add New Resource'}</h2>
                <p className="admin-hint">
                  Resources are stored in both languages. Bangla fields may be left blank —
                  the site falls back to the English text until a translation is added.
                </p>
                <form onSubmit={handleResourceSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Title (English)</label>
                      <input className="form-input" value={resourceForm.title_en} onChange={(e) => setResourceForm({ ...resourceForm, title_en: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title (Bangla)</label>
                      <input className="form-input" lang="bn" value={resourceForm.title_bn} onChange={(e) => setResourceForm({ ...resourceForm, title_bn: e.target.value })} placeholder="ঐচ্ছিক" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-input" value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} required>
                        <option value="">Select type</option>
                        {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discipline</label>
                      <select className="form-input" value={resourceForm.discipline} onChange={(e) => setResourceForm({ ...resourceForm, discipline: e.target.value })} required>
                        <option value="">Select discipline</option>
                        <option value="All disciplines">All disciplines</option>
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input" value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })} required>
                        <option value="">Select category</option>
                        {RESOURCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL</label>
                      <input className="form-input" type="url" value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://..." required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description (English)</label>
                    <textarea className="form-textarea" value={resourceForm.description_en} onChange={(e) => setResourceForm({ ...resourceForm, description_en: e.target.value })} rows="3" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description (Bangla)</label>
                    <textarea className="form-textarea" lang="bn" value={resourceForm.description_bn} onChange={(e) => setResourceForm({ ...resourceForm, description_bn: e.target.value })} rows="3" placeholder="ঐচ্ছিক" />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{editingResourceId ? 'Update' : 'Add'} Resource</button>
                    {editingResourceId && <button type="button" className="btn-secondary" onClick={() => { setEditingResourceId(null); setResourceForm(emptyResource) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Resources ({resources.length})</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Title</th><th>Bangla</th><th>Type</th><th>Discipline</th><th>Category</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td><strong>{r.title_en}</strong></td>
                        <td>{r.title_bn ? 'Yes' : <span className="admin-untranslated">Not translated</span>}</td>
                        <td>{r.type}</td>
                        <td>{r.discipline}</td>
                        <td>{r.category}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingResourceId(r.id); setResourceForm({ title_en: r.title_en, title_bn: r.title_bn ?? '', description_en: r.description_en, description_bn: r.description_bn ?? '', type: r.type, discipline: r.discipline, category: r.category, url: r.url }) }}>Edit</button>
                          <button className="btn-delete" onClick={() => remove(`/api/resources/${r.id}`, 'Delete this resource?', fetchResources, 'Resource')}>Delete</button>
                        </td>
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
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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

                  {/* Consent is recorded explicitly. It is not implied by adding the
                      profile: these are real graduates, and the server rejects any
                      attempt to publish a profile without it. */}
                  <div className="form-group admin-consent">
                    <label className="form-checkbox">
                      <input type="checkbox" checked={alumniForm.consent_given} onChange={(e) => setAlumniForm({ ...alumniForm, consent_given: e.target.checked })} />
                      <span>This graduate has given consent for their profile to be used</span>
                    </label>
                    <label className="form-checkbox">
                      <input type="checkbox" checked={alumniForm.is_published} disabled={!alumniForm.consent_given} onChange={(e) => setAlumniForm({ ...alumniForm, is_published: e.target.checked })} />
                      <span>Publish this profile on the public alumni page</span>
                    </label>
                    {!alumniForm.consent_given && (
                      <p className="admin-hint">Consent must be recorded before a profile can be published.</p>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{editingAlumniId ? 'Update' : 'Add'} Alumni</button>
                    {editingAlumniId && <button type="button" className="btn-secondary" onClick={() => { setEditingAlumniId(null); setAlumniForm(emptyAlumni) }}>Cancel</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>Existing Alumni ({alumni.length})</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Institution</th><th>Discipline</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {alumni.map(a => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td><strong>{a.full_name}</strong></td>
                        <td>{a.institution}</td>
                        <td>{a.discipline}</td>
                        <td>{a.current_role}</td>
                        <td>{a.is_published ? 'Published' : <span className="admin-untranslated">Draft</span>}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingAlumniId(a.id); setAlumniForm({ full_name: a.full_name, institution: a.institution, discipline: a.discipline, graduation_year: a.graduation_year ?? '', current_role: a.current_role, industry: a.industry, bio: a.bio, image_initials: a.image_initials || '', consent_given: a.consent_given === true, is_published: a.is_published === true }) }}>Edit</button>
                          <button className="btn-delete" onClick={() => remove(`/api/alumni/${a.id}`, 'Delete this alumni profile?', fetchAlumni, 'Alumni profile')}>Delete</button>
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
