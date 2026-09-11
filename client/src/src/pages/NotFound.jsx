import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './NotFound.css'

/**
 * An unknown path used to render an empty page with no navigation on it, which
 * is indistinguishable from the application having crashed. This states what
 * happened and puts the two most likely destinations in reach.
 */
export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="page-enter">
      <Navbar />

      <div className="nf">
        <span className="nf__mark"><Compass size={22} /></span>
        <h1 className="nf__title">{t('notFound.title')}</h1>
        <p className="nf__body">{t('notFound.body')}</p>
        <div className="nf__actions">
          <Link to="/" className="btn btn--primary">{t('notFound.goHome')}</Link>
          <Link to="/resume-review" className="btn btn--outline">{t('home.ctaReview')}</Link>
        </div>
      </div>
    </div>
  )
}
