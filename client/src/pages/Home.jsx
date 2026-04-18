import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Home.css'
import { useTranslation } from "react-i18next"   // ✅ ADDED

export default function Home() {
  const { t } = useTranslation()   // ✅ ADDED

  const features = [
    { icon: '📄', title: t('feature_ai_title'), desc: t('feature_ai_desc'), badge: t('feature_ai_badge'), badgeClass: 'badge-blue' },
    { icon: '📚', title: t('feature_resources_title'), desc: t('feature_resources_desc'), badge: t('feature_resources_badge'), badgeClass: 'badge-neutral' },
    { icon: '🗺️', title: t('feature_paths_title'), desc: t('feature_paths_desc'), badge: t('feature_paths_badge'), badgeClass: 'badge-neutral' },
    { icon: '💬', title: t('feature_chatbot_title'), desc: t('feature_chatbot_desc'), badge: t('feature_chatbot_badge'), badgeClass: 'badge-neutral' },
    { icon: '👥', title: t('feature_alumni_title'), desc: t('feature_alumni_desc'), badge: t('feature_alumni_badge'), badgeClass: 'badge-neutral' },
    { icon: '🌐', title: t('feature_lang_title'), desc: t('feature_lang_desc'), badge: t('feature_lang_badge'), badgeClass: 'badge-green', highlight: true },
  ]

  return (
    <div className="page-enter">
      <Navbar />

      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            {t('home_title')}  {/* ✅ UPDATED */}
          </h1>

          <p className="hero-sub">
            {t('home_sub')}  {/* ✅ UPDATED */}
          </p>

          <div className="hero-btns">
            <Link to="/resume-review" className="btn-primary-lg">
              {t('review_resume')} {/* ✅ UPDATED */}
            </Link>

            <Link to="/careers" className="btn-outline-lg">
              {t('explore_careers')} {/* ✅ UPDATED */}
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <p className="section-label">
            {t('section_label')} {/* ✅ UPDATED */}
          </p>

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