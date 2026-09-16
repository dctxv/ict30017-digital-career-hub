import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, ShieldCheck, Clock,
  FileText, Languages, BookOpen, Route, MessageCircle, Users,
  ExternalLink, Newspaper, RefreshCw,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { openChatbot } from '../components/chatbotBus'
import './Home.css'

/*
 * The feature grid is deliberately uneven.
 *
 * Resume review is the product, so it takes two columns and the only filled
 * badge. Alumni spans the full width underneath because it is a browse-when-
 * curious feature rather than a task, and reads better as a banner than as a
 * fifth equal tile. Six identical cards would have said all six things matter
 * the same amount, which is the one thing the home page must not say.
 *
 * Every card holds a translation key rather than copy. The array used to carry
 * English strings directly, which made the section untranslatable without
 * rewriting it per language.
 */
const TILES = [
  { key: 'language', icon: Languages, action: 'toggleLanguage', tone: 'accent', badgeTone: 'tag--accent' },
  { key: 'resources', icon: BookOpen, to: '/resources', tone: 'tint' },
  { key: 'paths', icon: Route, to: '/careers', tone: 'tint' },
  { key: 'chatbot', icon: MessageCircle, action: 'openChat', tone: 'tint' },
]

/** A tile is a link when it navigates and a button when it does something. */
function Tile({ className, to, onClick, children }) {
  if (to) return <Link to={to} className={className}>{children}</Link>
  return <button type="button" className={className} onClick={onClick}>{children}</button>
}

function formatNewsDate(value, lang) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function Home() {
  const { lang, setLang, t } = useLanguage()
  const [articles, setArticles] = useState([])
  const [newsStatus, setNewsStatus] = useState('loading')
  const [newsReload, setNewsReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/news?v=2', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('News is unavailable')
        return response.json()
      })
      .then(data => {
        setArticles(Array.isArray(data.articles) ? data.articles : [])
        setNewsStatus('ready')
      })
      .catch(error => {
        if (error.name !== 'AbortError') setNewsStatus('error')
      })

    return () => controller.abort()
  }, [newsReload])

  const actions = {
    toggleLanguage: () => setLang(lang === 'en' ? 'bn' : 'en'),
    openChat: () => openChatbot(),
  }

  return (
    <div className="page-enter">
      <Navbar />

      <section className="hero">
        <div className="hero__inner">
          <span className="hero__badge">
            <span className="hero__badge-mark"><Sparkles size={12} /></span>
            {t('home.heroBadge')}
          </span>

          <h1 className="hero__title">
            {t('home.heroTitleLine1')}{' '}
            <span className="hero__title-accent">{t('home.heroTitleLine2')}</span>
          </h1>

          <p className="hero__sub">{t('home.heroSub')}</p>

          <div className="hero__actions">
            <Link to="/resume-review" className="btn btn--primary btn--lg">
              {t('home.ctaReview')}
              <ArrowRight size={17} />
            </Link>
            <Link to="/careers" className="btn btn--outline btn--lg">{t('home.ctaExplore')}</Link>
          </div>

          <div className="hero__trust">
            <span><ShieldCheck size={14} />{t('home.trustDelete')}</span>
            <span><Clock size={14} />{t('home.trustFast')}</span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features__inner">
          <p className="features__label">{t('home.sectionLabel')}</p>

          <div className="features__grid">
            <Link to="/resume-review" className="feature feature--wide">
              <span className="feature__icon feature__icon--solid"><FileText size={21} /></span>
              <span className="feature__body">
                <span className="feature__heading">
                  <h3 className="feature__title">{t('home.feature.review.title')}</h3>
                  <span className="tag tag--solid">{t('home.feature.review.badge')}</span>
                </span>
                <p className="feature__desc">{t('home.feature.review.desc')}</p>
                <span className="feature__cta">
                  {t('home.startReview')} <ArrowRight size={15} />
                </span>
              </span>
            </Link>

            {TILES.map(tile => {
              const Icon = tile.icon
              return (
                <Tile
                  key={tile.key}
                  className="feature feature--tile"
                  to={tile.to}
                  onClick={actions[tile.action]}
                >
                  <span className={`feature__icon feature__icon--${tile.tone}`}><Icon size={19} /></span>
                  <h3 className="feature__title">{t(`home.feature.${tile.key}.title`)}</h3>
                  <p className="feature__desc">{t(`home.feature.${tile.key}.desc`)}</p>
                  <span className={`tag ${tile.badgeTone ?? ''} feature__badge`}>
                    {t(`home.feature.${tile.key}.badge`)}
                  </span>
                </Tile>
              )
            })}

            <Link to="/alumni" className="feature feature--banner">
              <span className="feature__icon feature__icon--accent"><Users size={21} /></span>
              <span className="feature__body">
                <h3 className="feature__title">{t('home.feature.alumni.title')}</h3>
                <p className="feature__desc">{t('home.feature.alumni.desc')}</p>
              </span>
              <span className="tag">{t('home.feature.alumni.badge')}</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="news" aria-labelledby="news-title">
        <div className="news__inner">
          <p className="features__label">{t('home.news.label')}</p>
          <div className="news__heading">
            <div>
              <h2 id="news-title">{t('home.news.title')}</h2>
              <p>{t('home.news.subtitle')}</p>
            </div>
            <Newspaper size={25} aria-hidden="true" />
          </div>

          {newsStatus === 'loading' && (
            <p className="news__status" role="status">{t('home.news.loading')}</p>
          )}

          {newsStatus === 'error' && (
            <div className="news__status news__status--error" role="alert">
              <span>{t('home.news.error')}</span>
              <button type="button" className="btn btn--outline" onClick={() => { setNewsStatus('loading'); setNewsReload(value => value + 1) }}>
                <RefreshCw size={15} /> {t('home.news.retry')}
              </button>
            </div>
          )}

          {newsStatus === 'ready' && articles.length === 0 && (
            <p className="news__status">{t('home.news.empty')}</p>
          )}

          {articles.length > 0 && (
            <div className="news__grid">
              {articles.map(article => (
                <article className="news-card" key={article.id}>
                  <div className="news-card__meta">
                    <span>{article.source}</span>
                    {article.published && <time dateTime={article.published}>{formatNewsDate(article.published, lang)}</time>}
                  </div>
                  <h3>{article.title}</h3>
                  {article.description && <p>{article.description}</p>}
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {t('home.news.readMore')} <ExternalLink size={14} />
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
