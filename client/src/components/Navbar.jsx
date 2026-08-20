import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

/**
 * Site navigation.
 *
 * The `user` prop is gone on purpose. It defaulted to null, nine of the ten
 * render sites passed nothing, and the tenth passed a hardcoded demo name, so
 * the signed-in state shown here was never the real one. The session now comes
 * from context, which no caller can override with a stale value.
 */
export default function Navbar() {
  const { lang, setLang } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { label: 'Resources', to: '/resources' },
    { label: 'Career paths', to: '/careers' },
    { label: 'Alumni', to: '/alumni' },
    { label: 'Resume review', to: '/resume-review' },
  ]

  // Administrators previously had to type /admin by hand, because nothing in
  // the UI linked to it. Shown only to the roles that can actually use it.
  const adminRoles = ['admin']
  const showAdminLink = isAuthenticated && adminRoles.includes(user?.role)

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      closeMenu()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  // Rendered twice: once in the desktop bar, once inside the mobile menu. At
  // 768px and below the desktop copy is hidden, and before this the mobile menu
  // carried only the four content links, leaving no route to authentication
  // except typing /login into the address bar.
  const authControls = (extraClass = '') => (
    isAuthenticated ? (
      <>
        <span className={`navbar-user ${extraClass}`}>{user?.full_name ?? user?.name ?? 'Account'}</span>
        <button
          type="button"
          className={`btn-outline-sm navbar-auth-action ${extraClass}`}
          onClick={handleLogout}
          disabled={signingOut}
        >
          {signingOut ? 'Logging out...' : 'Log out'}
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className={`btn-outline-sm navbar-auth-action ${extraClass}`} onClick={closeMenu}>Log in</Link>
        <Link to="/register" className={`btn-filled-sm navbar-auth-action ${extraClass}`} onClick={closeMenu}>Sign up</Link>
      </>
    )
  )

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Digital Career Hub</Link>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`} id="primary-navigation">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`navbar-link ${location.pathname === l.to ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {l.label}
              </Link>
            </li>
          ))}

          {showAdminLink && (
            <li>
              <Link
                to="/admin"
                className={`navbar-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Admin
              </Link>
            </li>
          )}

          {/* Mobile-only copy of the auth actions, inside the collapsible menu. */}
          <li className="navbar-mobile-auth">
            {authControls('navbar-auth-mobile')}
          </li>
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

          {authControls()}
        </div>

        <button
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
