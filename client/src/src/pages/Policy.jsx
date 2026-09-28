import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Policy.css'

/**
 * The terms and the privacy notice.
 *
 * The registration form has asked people to agree to these since it was
 * written, and both links pointed at routes that did not exist — so the one
 * thing a user was required to accept was the one page they could not read.
 *
 * The content describes what this software actually does with what it is given,
 * and nothing else. It is not drafted legal text and does not pretend to be:
 * this is university coursework, it says so, and inventing enforceable-sounding
 * clauses for a system with no operator behind them would be worse than saying
 * plainly what happens to a resume after it is uploaded.
 *
 * Both pages are rendered from the same component because they are the same
 * shape — a heading, a date, and a list of sections — and the only thing that
 * varies is which set of translation keys is read.
 */

const SECTIONS = {
  terms: ['what', 'account', 'limits', 'ai', 'acceptable', 'liability'],
  privacy: ['collect', 'resume', 'ai', 'cookies', 'retention', 'rights'],
}

export default function Policy({ kind }) {
  const { t } = useLanguage()
  const sections = SECTIONS[kind] ?? SECTIONS.terms

  return (
    <div className="page-enter">
      <Navbar />

      <section className="page-head">
        <div className="shell">
          <h1 className="page-head__title">{t(`policy.${kind}.title`)}</h1>
          <p className="page-head__sub">{t(`policy.${kind}.intro`)}</p>
        </div>
      </section>

      <article className="policy">
        <p className="policy__meta">{t('policy.lastUpdated')}</p>

        {sections.map(section => (
          <section className="policy__section" key={section}>
            <h2 className="policy__heading">{t(`policy.${kind}.${section}.heading`)}</h2>
            <p className="policy__body">{t(`policy.${kind}.${section}.body`)}</p>
          </section>
        ))}

        <p className="notice notice--warn policy__footer">{t('policy.coursework')}</p>
      </article>
    </div>
  )
}
