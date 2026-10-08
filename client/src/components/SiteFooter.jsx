import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './SiteFooter.css'

/**
 * The links nobody looks for until they need them: what the site is, what it
 * does not promise, and the two pages registration asks people to accept.
 * Rendered on the home page and on those pages themselves rather than
 * everywhere, so the working pages keep their full height.
 */
const LINKS = [
  { to: '/about', key: 'footer.about' },
  { to: '/disclaimer', key: 'footer.disclaimer' },
  { to: '/terms', key: 'footer.terms' },
  { to: '/privacy', key: 'footer.privacy' },
]

export default function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav className="site-footer__links" aria-label={t('footer.about')}>
          {LINKS.map(link => (
            <Link key={link.to} to={link.to} className="site-footer__link">
              {t(link.key)}
            </Link>
          ))}
        </nav>
        <p className="site-footer__note">
          © {new Date().getFullYear()} {t('common.brand')} · {t('footer.note')}
        </p>
      </div>
    </footer>
  )
}
