import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Home.css'

const features = [
  { icon: '📄', title: 'AI resume review', desc: 'Upload your resume and get precise, actionable feedback based on Bangladeshi job market standards.', badge: 'Primary feature', badgeClass: 'badge-blue' },
  { icon: '📚', title: 'Career resources', desc: 'Browse guides, videos, and articles covering resume writing, interview prep, and job searching in Bangladesh.', badge: 'All disciplines', badgeClass: 'badge-neutral' },
  { icon: '🗺️', title: 'Career path explorer', desc: 'Explore career paths across IT, Finance, Science, Engineering, and more — with local salary and skills data.', badge: 'All industries', badgeClass: 'badge-neutral' },
  { icon: '💬', title: 'Career chatbot', desc: 'Ask career questions and get guidance on job searching, interviews, and professional development.', badge: 'EN / BN', badgeClass: 'badge-neutral' },
  { icon: '👥', title: 'Alumni network', desc: 'See real career journeys from Bangladeshi graduates across all disciplines and industries.', badge: 'Real stories', badgeClass: 'badge-neutral' },
  { icon: '🌐', title: 'Bangla language support', desc: 'Switch the entire platform to Bangla with one click — including AI feedback and chatbot responses.', badge: 'EN / BN toggle', badgeClass: 'badge-green', highlight: true },
]

export default function Home() {
  return (
    <div className="page-enter">
      <Navbar />
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Career guidance built for<br />Bangladeshi graduates</h1>
          <p className="hero-sub">Get AI-powered feedback on your resume, explore career paths across all industries, and access resources tailored to the Bangladeshi job market.</p>
          <div className="hero-btns">
            <Link to="/resume-review" className="btn-primary-lg">Review my resume</Link>
            <Link to="/careers" className="btn-outline-lg">Explore careers</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <p className="section-label">What you can do</p>
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