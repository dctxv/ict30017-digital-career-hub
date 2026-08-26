import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Home.css'

/*
 * Feature cards hold translation keys rather than copy. The array used to carry
 * English strings directly, which made the whole section untranslatable without
 * rewriting it per language.
 */
const features = [
  { icon: '📄', key: 'review', badgeClass: 'badge-blue' },
  { icon: '📚', key: 'resources', badgeClass: 'badge-neutral' },
  { icon: '🗺️', key: 'paths', badgeClass: 'badge-neutral' },
  { icon: '💬', key: 'chatbot', badgeClass: 'badge-neutral' },
  { icon: '👥', key: 'alumni', badgeClass: 'badge-neutral' },
  { icon: '🌐', key: 'language', badgeClass: 'badge-green', highlight: true },
]

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="page-enter">
      <Navbar />
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">{t('home.heroTitleLine1')}<br />{t('home.heroTitleLine2')}</h1>
          <p className="hero-sub">{t('home.heroSub')}</p>
          <div className="hero-btns">
            <Link to="/resume-review" className="btn-primary-lg">{t('home.ctaReview')}</Link>
            <Link to="/careers" className="btn-outline-lg">{t('home.ctaExplore')}</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <p className="section-label">{t('home.sectionLabel')}</p>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.key} className={`feat-card ${f.highlight ? 'feat-card--highlight' : ''}`}>
                <div className="feat-icon">{f.icon}</div>
                <h3 className="feat-title">{t(`home.feature.${f.key}.title`)}</h3>
                <p className="feat-desc">{t(`home.feature.${f.key}.desc`)}</p>
                <span className={`badge ${f.badgeClass}`}>{t(`home.feature.${f.key}.badge`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
