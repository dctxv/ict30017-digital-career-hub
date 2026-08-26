import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
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
  const { t, n, tc } = useLanguage()
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

  /*
   * URLs used by more than one resource row.
   *
   * 42 seeded rows point at 23 distinct URLs, and six unrelated titles share a
   * single YouTube link — which is why clicking an article opened something
   * that did not match its title. Sharing a URL is sometimes correct (one CV
   * template legitimately serves the finance, engineering and business guides),
   * so this marks rather than blocks. It exists so the duplication is visible
   * while editing instead of only when a user clicks through and notices.
   */
  const duplicateUrls = useMemo(() => {
    const seen = new Map()
    for (const r of resources) {
      if (!r.url) continue
      seen.set(r.url, (seen.get(r.url) ?? 0) + 1)
    }
    return new Set([...seen].filter(([, count]) => count > 1).map(([url]) => url))
  }, [resources])

  const notify = (text) => {
    setError('')
    setMessage(text)
    setTimeout(() => setMessage(''), 2500)
  }

  // Surfaces why a write failed instead of failing silently. The guarded
  // endpoints answer 401 when the session has lapsed and 403 when the account
  // is not an admin; both are worth telling the user apart.
  // The server localises the `error` field it returns from the lang cookie, so
  // a detail that arrives here is already in the reader's language and is shown
  // as sent. The fallback covers a response that carried no detail at all.
  const reportFailure = async (res, fallbackKey) => {
    setMessage('')
    if (res.status === 401) {
      setError(t('admin.sessionExpired'))
      return
    }
    if (res.status === 403) {
      setError(t('admin.forbidden'))
      return
    }
    let detail = ''
    try {
      detail = (await res.json())?.error ?? ''
    } catch {
      detail = ''
    }
    setError(detail || t(fallbackKey))
  }

  const getJson = async (path, setter, labelKey) => {
    const label = t(labelKey)
    try {
      const res = await fetch(path)
      if (!res.ok) {
        setMessage('')
        setError(t('admin.loadFailed', { label }))
        return
      }
      setter(await res.json())
    } catch {
      setError(t('admin.loadUnreachable', { label }))
    }
  }

  const fetchDisciplines = () => getJson('/api/disciplines', setDisciplines, 'admin.label.disciplines')
  const fetchCareerPaths = () => getJson('/api/career-paths', setCareerPaths, 'admin.label.careerPaths')
  const fetchResources = () => getJson('/api/resources', setResources, 'admin.label.resources')
  // Admin view includes unpublished drafts, which /api/alumni deliberately hides.
  const fetchAlumni = () => getJson('/api/alumni/all', setAlumni, 'admin.label.alumni')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([fetchDisciplines(), fetchCareerPaths(), fetchResources(), fetchAlumni()])
      setLoading(false)
    }
    fetchAll()
  }, [])

  // Shared write helper. Returns true when the write succeeded.
  const submit = async (method, path, payload, fallbackKey) => {
    try {
      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        await reportFailure(res, fallbackKey)
        return false
      }
      return true
    } catch {
      setError(t('admin.serverUnreachable'))
      return false
    }
  }

  const remove = async (path, confirmKey, refresh, labelKey) => {
    if (!confirm(t(confirmKey))) return
    const label = t(labelKey)
    try {
      const res = await fetch(path, { method: 'DELETE' })
      if (!res.ok) {
        setMessage('')
        setError(t('admin.deleteFailed', { label }))
        return
      }
      await refresh()
      notify(t('admin.deleted', { label }))
    } catch {
      setError(t('admin.serverUnreachable'))
    }
  }

  // ---- Disciplines ----
  const handleDiscSubmit = async (e) => {
    e.preventDefault()
    const ok = await submit(
      editingDiscId ? 'PUT' : 'POST',
      editingDiscId ? `/api/disciplines/${editingDiscId}` : '/api/disciplines',
      discForm,
      'admin.disc.saveFailed'
    )
    if (!ok) return
    await fetchDisciplines()
    setDiscForm(emptyDisc)
    setEditingDiscId(null)
    notify(t(editingDiscId ? 'admin.disc.updated' : 'admin.disc.added'))
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
        setError(t('admin.path.progressionInvalid'))
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
      'admin.path.saveFailed'
    )
    if (!ok) return
    await fetchCareerPaths()
    setPathForm(emptyPath)
    setEditingPathId(null)
    notify(t(editingPathId ? 'admin.path.updated' : 'admin.path.added'))
  }

  // ---- Resources ----
  const handleResourceSubmit = async (e) => {
    e.preventDefault()
    const ok = await submit(
      editingResourceId ? 'PUT' : 'POST',
      editingResourceId ? `/api/resources/${editingResourceId}` : '/api/resources',
      resourceForm,
      'admin.res.saveFailed'
    )
    if (!ok) return
    await fetchResources()
    setResourceForm(emptyResource)
    setEditingResourceId(null)
    notify(t(editingResourceId ? 'admin.res.updated' : 'admin.res.added'))
  }

  // ---- Alumni ----
  const handleAlumniSubmit = async (e) => {
    e.preventDefault()
    const ok = await submit(
      editingAlumniId ? 'PUT' : 'POST',
      editingAlumniId ? `/api/alumni/${editingAlumniId}` : '/api/alumni',
      alumniForm,
      'admin.alum.saveFailed'
    )
    if (!ok) return
    await fetchAlumni()
    setAlumniForm(emptyAlumni)
    setEditingAlumniId(null)
    notify(t(editingAlumniId ? 'admin.alum.updated' : 'admin.alum.added'))
  }

  if (loading) {
    return (
      <div className="page-enter">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>{t('admin.loading')}</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />
      <div className="admin-header">
        <div className="admin-header-inner">
          <h1 className="admin-title">{t('admin.title')}</h1>
          <p className="admin-sub">{t('admin.sub')}</p>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'disciplines' ? 'active' : ''}`} onClick={() => setActiveTab('disciplines')}>{t('admin.tabDisciplines')}</button>
          <button className={`admin-tab ${activeTab === 'career-paths' ? 'active' : ''}`} onClick={() => setActiveTab('career-paths')}>{t('admin.tabCareerPaths')}</button>
          <button className={`admin-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>{t('admin.tabResources')}</button>
          <button className={`admin-tab ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => setActiveTab('alumni')}>{t('admin.tabAlumni')}</button>
        </div>

        <div className="admin-panel">
          {message && <div className="admin-message">{message}</div>}
          {error && <div className="admin-error">{error}</div>}

          {/* Disciplines Tab */}
          {activeTab === 'disciplines' && (
            <div>
              <div className="admin-form-card">
                <h2>{t(editingDiscId ? 'admin.disc.editHeading' : 'admin.disc.addHeading')}</h2>
                <form onSubmit={handleDiscSubmit}>
                  <div className="form-group">
                    <label className="form-label">{t('admin.disc.name')}</label>
                    <input className="form-input" value={discForm.name} onChange={(e) => setDiscForm({ ...discForm, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.disc.description')}</label>
                    <textarea className="form-textarea" value={discForm.description} onChange={(e) => setDiscForm({ ...discForm, description: e.target.value })} rows="2" />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{t(editingDiscId ? 'admin.disc.updateButton' : 'admin.disc.addButton')}</button>
                    {editingDiscId && <button type="button" className="btn-secondary" onClick={() => { setEditingDiscId(null); setDiscForm(emptyDisc) }}>{t('common.cancel')}</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>{t('admin.disc.existing', { count: n(disciplines.length) })}</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>{t('admin.table.id')}</th><th>{t('admin.table.name')}</th><th>{t('admin.table.description')}</th><th>{t('admin.table.actions')}</th></tr>
                  </thead>
                  <tbody>
                    {disciplines.map(d => (
                      <tr key={d.id}>
                        <td>{d.id}</td>
                        <td><strong>{d.name}</strong></td>
                        <td>{d.description || '-'}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingDiscId(d.id); setDiscForm({ name: d.name, description: d.description || '' }) }}>{t('common.edit')}</button>
                          <button className="btn-delete" onClick={() => remove(`/api/disciplines/${d.id}`, 'admin.disc.confirmDelete', fetchDisciplines, 'admin.label.discipline')}>{t('common.delete')}</button>
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
                <h2>{t(editingPathId ? 'admin.path.editHeading' : 'admin.path.addHeading')}</h2>
                <form onSubmit={handlePathSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.path.titleField')}</label>
                      <input className="form-input" value={pathForm.title} onChange={(e) => setPathForm({ ...pathForm, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.path.industry')}</label>
                      <input className="form-input" value={pathForm.industry} onChange={(e) => setPathForm({ ...pathForm, industry: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.path.discipline')}</label>
                      <select className="form-input" value={pathForm.discipline} onChange={(e) => setPathForm({ ...pathForm, discipline: e.target.value })} required>
                        <option value="">{t('admin.path.selectDiscipline')}</option>
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.path.salaryEntry')}</label>
                      <input className="form-input" value={pathForm.salaryEntry} onChange={(e) => setPathForm({ ...pathForm, salaryEntry: e.target.value })} placeholder="BDT 25,000–40,000" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.path.salarySenior')}</label>
                      <input className="form-input" value={pathForm.salarySenior} onChange={(e) => setPathForm({ ...pathForm, salarySenior: e.target.value })} placeholder="BDT 80,000–150,000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.path.skills')}</label>
                      <input className="form-input" value={pathForm.skills} onChange={(e) => setPathForm({ ...pathForm, skills: e.target.value })} placeholder={t('admin.path.skillsPlaceholder')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.path.description')}</label>
                    <textarea className="form-textarea" value={pathForm.desc} onChange={(e) => setPathForm({ ...pathForm, desc: e.target.value })} rows="3" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.path.progression')}</label>
                    <textarea className="form-textarea" value={pathForm.progression} onChange={(e) => setPathForm({ ...pathForm, progression: e.target.value })} rows="4" placeholder='[{"label":"Junior","time":"0-1 yr"},{"label":"Senior","time":"1-3 yrs","current":true}]' />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{t(editingPathId ? 'admin.path.updateButton' : 'admin.path.addButton')}</button>
                    {editingPathId && <button type="button" className="btn-secondary" onClick={() => { setEditingPathId(null); setPathForm(emptyPath) }}>{t('common.cancel')}</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>{t('admin.path.existing', { count: n(careerPaths.length) })}</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>{t('admin.table.id')}</th><th>{t('admin.table.title')}</th><th>{t('admin.table.discipline')}</th><th>{t('admin.table.industry')}</th><th>{t('admin.table.actions')}</th></tr>
                  </thead>
                  <tbody>
                    {careerPaths.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><strong>{p.title}</strong></td>
                        <td>{p.discipline}</td>
                        <td>{p.industry}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingPathId(p.id); setPathForm({ title: p.title, industry: p.industry, discipline: p.discipline, desc: p.desc, skills: (p.skills ?? []).join(', '), progression: JSON.stringify(p.progression ?? [], null, 2), salaryEntry: p.salaryEntry, salarySenior: p.salarySenior }) }}>{t('common.edit')}</button>
                          <button className="btn-delete" onClick={() => remove(`/api/career-paths/${p.id}`, 'admin.path.confirmDelete', fetchCareerPaths, 'admin.label.careerPath')}>{t('common.delete')}</button>
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
                <h2>{t(editingResourceId ? 'admin.res.editHeading' : 'admin.res.addHeading')}</h2>
                <p className="admin-hint">{t('admin.res.bilingualHint')}</p>
                <form onSubmit={handleResourceSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.res.titleEn')}</label>
                      <input className="form-input" value={resourceForm.title_en} onChange={(e) => setResourceForm({ ...resourceForm, title_en: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.res.titleBn')}</label>
                      <input className="form-input" lang="bn" value={resourceForm.title_bn} onChange={(e) => setResourceForm({ ...resourceForm, title_bn: e.target.value })} placeholder={t('admin.res.optionalPlaceholder')} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.res.type')}</label>
                      <select className="form-input" value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} required>
                        <option value="">{t('admin.res.selectType')}</option>
                        {/* The stored value stays English; only the label is translated. */}
                        {RESOURCE_TYPES.map(type => <option key={type} value={type}>{tc(`resources.type.${type}`, type)}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.res.discipline')}</label>
                      <select className="form-input" value={resourceForm.discipline} onChange={(e) => setResourceForm({ ...resourceForm, discipline: e.target.value })} required>
                        <option value="">{t('admin.res.selectDiscipline')}</option>
                        <option value="All disciplines">{t('common.allDisciplines')}</option>
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.res.category')}</label>
                      <select className="form-input" value={resourceForm.category} onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })} required>
                        <option value="">{t('admin.res.selectCategory')}</option>
                        {RESOURCE_CATEGORIES.map(c => <option key={c} value={c}>{tc(`resources.category.${c}`, c)}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.res.url')}</label>
                      <input className="form-input" type="url" value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://..." required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.res.descEn')}</label>
                    <textarea className="form-textarea" value={resourceForm.description_en} onChange={(e) => setResourceForm({ ...resourceForm, description_en: e.target.value })} rows="3" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.res.descBn')}</label>
                    <textarea className="form-textarea" lang="bn" value={resourceForm.description_bn} onChange={(e) => setResourceForm({ ...resourceForm, description_bn: e.target.value })} rows="3" placeholder={t('admin.res.optionalPlaceholder')} />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{t(editingResourceId ? 'admin.res.updateButton' : 'admin.res.addButton')}</button>
                    {editingResourceId && <button type="button" className="btn-secondary" onClick={() => { setEditingResourceId(null); setResourceForm(emptyResource) }}>{t('common.cancel')}</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>{t('admin.res.existing', { count: n(resources.length) })}</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>{t('admin.table.id')}</th><th>{t('admin.table.title')}</th><th>{t('admin.res.banglaColumn')}</th><th>{t('admin.table.type')}</th><th>{t('admin.table.discipline')}</th><th>{t('admin.table.category')}</th><th>{t('admin.res.linkColumn')}</th><th>{t('admin.table.actions')}</th></tr>
                  </thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td><strong>{r.title_en}</strong></td>
                        <td>{r.title_bn ? t('common.yes') : <span className="admin-untranslated">{t('admin.res.untranslated')}</span>}</td>
                        <td>{tc(`resources.type.${r.type}`, r.type)}</td>
                        <td>{r.discipline === 'All disciplines' ? t('common.allDisciplines') : r.discipline}</td>
                        <td>{tc(`resources.category.${r.category}`, r.category)}</td>
                        <td>
                          {duplicateUrls.has(r.url)
                            ? <span className="admin-untranslated" title={r.url}>{t('admin.res.sharedUrl')}</span>
                            : ''}
                        </td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingResourceId(r.id); setResourceForm({ title_en: r.title_en, title_bn: r.title_bn ?? '', description_en: r.description_en, description_bn: r.description_bn ?? '', type: r.type, discipline: r.discipline, category: r.category, url: r.url }) }}>{t('common.edit')}</button>
                          <button className="btn-delete" onClick={() => remove(`/api/resources/${r.id}`, 'admin.res.confirmDelete', fetchResources, 'admin.label.resource')}>{t('common.delete')}</button>
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
                <h2>{t(editingAlumniId ? 'admin.alum.editHeading' : 'admin.alum.addHeading')}</h2>
                <form onSubmit={handleAlumniSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.fullName')}</label>
                      <input className="form-input" value={alumniForm.full_name} onChange={(e) => setAlumniForm({ ...alumniForm, full_name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.institution')}</label>
                      <input className="form-input" value={alumniForm.institution} onChange={(e) => setAlumniForm({ ...alumniForm, institution: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.discipline')}</label>
                      <select className="form-input" value={alumniForm.discipline} onChange={(e) => setAlumniForm({ ...alumniForm, discipline: e.target.value })} required>
                        <option value="">{t('admin.alum.selectDiscipline')}</option>
                        {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.graduationYear')}</label>
                      <input className="form-input" type="number" value={alumniForm.graduation_year} onChange={(e) => setAlumniForm({ ...alumniForm, graduation_year: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.currentRole')}</label>
                      <input className="form-input" value={alumniForm.current_role} onChange={(e) => setAlumniForm({ ...alumniForm, current_role: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.industry')}</label>
                      <input className="form-input" value={alumniForm.industry} onChange={(e) => setAlumniForm({ ...alumniForm, industry: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('admin.alum.initials')}</label>
                      <input className="form-input" value={alumniForm.image_initials} onChange={(e) => setAlumniForm({ ...alumniForm, image_initials: e.target.value })} placeholder="SR" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.alum.bio')}</label>
                    <textarea className="form-textarea" value={alumniForm.bio} onChange={(e) => setAlumniForm({ ...alumniForm, bio: e.target.value })} rows="3" required />
                  </div>

                  {/* Consent is recorded explicitly. It is not implied by adding the
                      profile: these are real graduates, and the server rejects any
                      attempt to publish a profile without it. */}
                  <div className="form-group admin-consent">
                    <label className="form-checkbox">
                      <input type="checkbox" checked={alumniForm.consent_given} onChange={(e) => setAlumniForm({ ...alumniForm, consent_given: e.target.checked })} />
                      <span>{t('admin.alum.consent')}</span>
                    </label>
                    <label className="form-checkbox">
                      <input type="checkbox" checked={alumniForm.is_published} disabled={!alumniForm.consent_given} onChange={(e) => setAlumniForm({ ...alumniForm, is_published: e.target.checked })} />
                      <span>{t('admin.alum.publish')}</span>
                    </label>
                    {!alumniForm.consent_given && (
                      <p className="admin-hint">{t('admin.alum.consentRequired')}</p>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">{t(editingAlumniId ? 'admin.alum.updateButton' : 'admin.alum.addButton')}</button>
                    {editingAlumniId && <button type="button" className="btn-secondary" onClick={() => { setEditingAlumniId(null); setAlumniForm(emptyAlumni) }}>{t('common.cancel')}</button>}
                  </div>
                </form>
              </div>
              <div className="admin-list-card">
                <h2>{t('admin.alum.existing', { count: n(alumni.length) })}</h2>
                <table className="admin-table">
                  <thead>
                    <tr><th>{t('admin.table.id')}</th><th>{t('admin.table.name')}</th><th>{t('admin.table.institution')}</th><th>{t('admin.table.discipline')}</th><th>{t('admin.table.role')}</th><th>{t('admin.table.status')}</th><th>{t('admin.table.actions')}</th></tr>
                  </thead>
                  <tbody>
                    {alumni.map(a => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td><strong>{a.full_name}</strong></td>
                        <td>{a.institution}</td>
                        <td>{a.discipline}</td>
                        <td>{a.current_role}</td>
                        <td>{a.is_published ? t('admin.alum.published') : <span className="admin-untranslated">{t('admin.alum.draft')}</span>}</td>
                        <td>
                          <button className="btn-edit" onClick={() => { setEditingAlumniId(a.id); setAlumniForm({ full_name: a.full_name, institution: a.institution, discipline: a.discipline, graduation_year: a.graduation_year ?? '', current_role: a.current_role, industry: a.industry, bio: a.bio, image_initials: a.image_initials || '', consent_given: a.consent_given === true, is_published: a.is_published === true }) }}>{t('common.edit')}</button>
                          <button className="btn-delete" onClick={() => remove(`/api/alumni/${a.id}`, 'admin.alum.confirmDelete', fetchAlumni, 'admin.label.alumniProfile')}>{t('common.delete')}</button>
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
