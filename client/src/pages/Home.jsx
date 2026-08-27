import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTranslation } from '../i18n/useTranslation'
import './Home.css'

const FEATURE_KEYS = [
  { icon: '📄', key: 'resumeReview', badgeClass: 'badge-blue' },
  { icon: '📚', key: 'resources', badgeClass: 'badge-neutral' },
  { icon: '🗺️', key: 'careerPaths', badgeClass: 'badge-neutral' },
  { icon: '💬', key: 'chatbot', badgeClass: 'badge-neutral' },
  { icon: '👥', key: 'alumni', badgeClass: 'badge-neutral' },
  { icon: '🌐', key: 'bangla', badgeClass: 'badge-green', highlight: true },
]

export default function Home() {
  const { t } = useTranslation()

  const features = FEATURE_KEYS.map((f) => ({
    ...f,
    title: t(`home.features.${f.key}.title`),
    desc: t(`home.features.${f.key}.desc`),
    badge: t(`home.features.${f.key}.badge`),
  }))

  return (
    <div className="page-enter">
      <Navbar />
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">{t('home.heroTitleLine1')}<br />{t('home.heroTitleLine2')}</h1>
          <p className="hero-sub">{t('home.heroSub')}</p>
          <div className="hero-btns">
            <Link to="/resume-review" className="btn-primary-lg">{t('home.reviewMyResume')}</Link>
            <Link to="/careers" className="btn-outline-lg">{t('home.exploreCareers')}</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <p className="section-label">{t('home.whatYouCanDo')}</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feat-card ${f.highlight ? 'feat-card--highlight' : ''}`}>
                <div className="feat-icon">{f.icon}</div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
                <span className={`badge ${f.badgeClass}`}>{f.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}