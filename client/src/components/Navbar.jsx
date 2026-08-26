import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { lang, setLang } = useLanguage()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { label: 'Resources', to: '/resources' },
    { label: 'Career paths', to: '/careers' },
    { label: 'Alumni', to: '/alumni' },
    { label: 'Resume review', to: '/resume-review' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Digital Career Hub</Link>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`navbar-link ${location.pathname === l.to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <div className="lang-toggle">
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              aria-pressed={lang === 'en'}
              onClick={() => setLang('en')}
            >EN</button>
            <button
              className={`lang-btn ${lang === 'bn' ? 'active' : ''}`}
              aria-pressed={lang === 'bn'}
              onClick={() => setLang('bn')}
            >BN</button>
          </div>

          {user ? (
            <>
              <span className="navbar-user">{user.full_name}</span>
              <button className="btn-outline-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline-sm">Log in</Link>
              <Link to="/register" className="btn-filled-sm">Sign up</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}