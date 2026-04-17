import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar({ user = null }) {
  const [lang, setLang] = useState('EN')
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { label: 'Resources', to: '/resources' },
    { label: 'Career paths', to: '/careers' },
    { label: 'Alumni', to: '/alumni' },
    { label: 'Resume review', to: '/resume-review' },
  ]

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
              className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
              onClick={() => setLang('EN')}
            >EN</button>
            <button
              className={`lang-btn ${lang === 'BN' ? 'active' : ''}`}
              onClick={() => setLang('BN')}
            >BN</button>
          </div>

          {user ? (
            <span className="navbar-user">{user.name}</span>
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