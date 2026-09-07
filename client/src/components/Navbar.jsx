import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Menu, X, Sun, Moon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

/**
 * Site navigation.
 *
 * The session comes from context rather than a prop. It used to be a `user`
 * prop that defaulted to null, which nine of the ten render sites left unset
 * and the tenth filled with a hardcoded demo name — so the signed-in state
 * shown here was never the real one.
 *
 * Three controls sit to the right of the links and all three are reachable at
 * every width, because each one is the way out of a state a user can get stuck
 * in: the wrong language, an unreadable theme, and a session they want to end.
 * The collapsible panel below carries the links and, under 600px where the
 * inline pair is hidden, the sign-in actions too.
 */
export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { key: 'nav.resources', to: '/resources' },
    { key: 'nav.careers', to: '/careers' },
    { key: 'nav.alumni', to: '/alumni' },
    { key: 'nav.resumeReview', to: '/resume-review' },
  ]

  // The gap board and the mock interview both belong to one account, so the
  // link is shown to people who have one. A guest is not told about a page that
  // would bounce them straight to the login form.
  if (isAuthenticated) {
    links.push({ key: 'nav.preparation', to: '/preparation' })
  }

  // Administrators previously had to type /admin by hand, because nothing in
  // the interface linked to it. Shown only to the role that can use it.
  if (isAuthenticated && user?.role === 'admin') {
    links.push({ key: 'nav.admin', to: '/admin' })
  }

  // A panel left open across a navigation covers the page the user just asked
  // for. Closing it during render on the path change, rather than in an effect,
  // means the new page never paints once with the panel still over it.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  const displayName = user?.full_name ?? user?.name ?? t('nav.account')
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] ?? '')
    .join('')
    .toUpperCase() || '?'

  const authActions = (
    <>
      <Link to="/login" className="nav-auth nav-auth--quiet">{t('nav.logIn')}</Link>
      <Link to="/register" className="nav-auth nav-auth--solid">{t('nav.signUp')}</Link>
    </>
  )

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__mark"><Compass size={16} /></span>
          <span className="nav__wordmark">{t('common.brand')}</span>
        </Link>

        <ul className="nav__links">
          {links.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `nav__link${isActive ? ' nav__link--on' : ''}`}
              >
                {t(link.key)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav__controls">
          <button
            type="button"
            className="nav__icon-btn nav__menu-btn"
            onClick={() => setMenuOpen(open => !open)}
            aria-expanded={menuOpen}
            aria-controls="nav-panel"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <button
            type="button"
            className="nav__icon-btn"
            onClick={toggleTheme}
            aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
            title={isDark ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {/* Both faces are mounted and cross-faded by CSS. Swapping the
                element instead would make the rotation impossible to animate. */}
            <span className="nav__theme-icons">
              <span className="nav__theme-icon nav__theme-icon--sun"><Sun size={17} /></span>
              <span className="nav__theme-icon nav__theme-icon--moon"><Moon size={17} /></span>
            </span>
          </button>

          <div className="lang-switch" role="group" aria-label={t('nav.language')}>
            <span className={`lang-switch__thumb${lang === 'bn' ? ' lang-switch__thumb--bn' : ''}`} />
            <button
              type="button"
              className={`lang-switch__btn${lang === 'en' ? ' lang-switch__btn--on' : ''}`}
              aria-pressed={lang === 'en'}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-switch__btn${lang === 'bn' ? ' lang-switch__btn--on' : ''}`}
              aria-pressed={lang === 'bn'}
              onClick={() => setLang('bn')}
            >
              বাং
            </button>
          </div>

          {isAuthenticated ? (
            <div className="nav__session">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav__profile${isActive ? ' nav__profile--on' : ''}`}
              >
                <span className="nav__avatar">{initials}</span>
                <span className="nav__profile-name">{displayName}</span>
              </NavLink>
              <button
                type="button"
                className="nav__signout"
                onClick={handleLogout}
                disabled={signingOut}
              >
                {signingOut ? t('nav.loggingOut') : t('nav.logOut')}
              </button>
            </div>
          ) : (
            <div className="nav__session nav__session--guest">{authActions}</div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="nav__panel" id="nav-panel">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav__panel-link${isActive ? ' nav__panel-link--on' : ''}`}
            >
              {t(link.key)}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <div className="nav__panel-auth">
              <span className="nav__panel-rule" />
              {/* Who the session belongs to. The bar carries this in
                  .nav__session, but .nav__profile-name is hidden from 1100px
                  down and .nav__signout from 600px, so without it here the
                  panel offers a Log out control while never saying whose
                  session is being ended. */}
              <span className="nav__panel-user">
                <span className="nav__avatar">{initials}</span>
                <span className="nav__profile-name">{displayName}</span>
              </span>
              <NavLink to="/profile" className="nav__panel-link">{t('nav.profile')}</NavLink>
              <button
                type="button"
                className="nav__panel-link nav__panel-link--button"
                onClick={handleLogout}
                disabled={signingOut}
              >
                {signingOut ? t('nav.loggingOut') : t('nav.logOut')}
              </button>
            </div>
          ) : (
            <div className="nav__panel-auth nav__panel-auth--guest">
              <span className="nav__panel-rule" />
              <Link to="/login" className="nav__panel-link">{t('nav.logIn')}</Link>
              <Link to="/register" className="nav__panel-link nav__panel-link--solid">{t('nav.signUp')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
