import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FileText, Eye, EyeOff, MapPinOff, ArrowRight, Upload } from 'lucide-react'
import 'react-pdf/dist/Page/TextLayer.css'
import { useLanguage } from '../context/LanguageContext'
import { buildIndex, locateQuote } from '../utils/quoteMatch'
import { collectAnnotations, CATEGORIES, OFF_BY_DEFAULT, MAX_NUMBERED } from '../utils/annotations'
import './AnnotatedResume.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** Where the two columns become two tabs. Matches the breakpoint in the CSS. */
const NARROW = '(max-width: 900px)'

/** Matches .ar-tip's max-width, so a tip near the right edge stays on the page. */
const TIP_WIDTH = 300

/**
 * The resume, with the review drawn onto it.
 *
 * The document is rendered in the browser from the file the candidate still
 * has open — a PDF through pdf.js's text layer, a Word file through
 * docx-preview — and never comes back from the server, which deletes it after
 * the analysis. Each issue's quoted text is then searched for in the rendered
 * text (utils/quoteMatch.js) and outlined where it sits, so the same code
 * places a mark in either format.
 *
 * Marks are measured from the live DOM, so they are recomputed whenever the
 * layout moves: a page finishing its text layer, the column resizing, or a
 * Word document reflowing.
 */

/** Text nodes under the given roots, in reading order, with their strings. */
function textNodesOf(roots) {
  const nodes = []
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: node => (node.parentElement?.closest('style, script') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    })
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node)
  }
  return nodes
}

/**
 * Boxes, relative to the surface, for every placed annotation.
 *
 * The surface may be CSS-scaled (a Word page narrower than its column), so
 * client rects are divided by the scale to land in the surface's own pixels.
 */
function measure(surface, roots, annotations) {
  const nodes = textNodesOf(roots)
  const index = buildIndex(nodes.map(node => node.nodeValue))
  const origin = surface.getBoundingClientRect()
  const scale = surface.offsetWidth > 0 ? origin.width / surface.offsetWidth : 1
  const placements = new Map()

  for (const annotation of annotations) {
    const rects = []
    let status = 'unplaced'
    for (const quote of annotation.quotes) {
      const found = locateQuote(index, quote, { all: annotation.term, term: annotation.term })
      if (found.status === 'unplaced') continue
      status = status === 'exact' ? 'exact' : found.status
      for (const { start, end } of found.ranges) {
        const range = document.createRange()
        range.setStart(nodes[start[0]], start[1])
        range.setEnd(nodes[end[0]], end[1] + 1)
        for (const rect of range.getClientRects()) {
          if (rect.width < 1 || rect.height < 1) continue
          rects.push({
            x: (rect.left - origin.left) / scale,
            y: (rect.top - origin.top) / scale,
            w: rect.width / scale,
            h: rect.height / scale,
          })
        }
      }
    }
    placements.set(annotation.id, { status: rects.length > 0 ? status : 'unplaced', rects })
  }
  return placements
}

function useElementWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(() => setWidth(element.clientWidth))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return width
}

/* ── Document renderers ──────────────────────────────────────────────── */

function PdfDocument({ source, width, onLayout, onError }) {
  const { t } = useLanguage()
  const [pages, setPages] = useState(0)

  return (
    <Document
      file={source}
      onLoadSuccess={({ numPages }) => setPages(numPages)}
      onLoadError={event => onError(event.message || t('results.pdfUnknownError'))}
      loading={<p className="ar-doc__status">{t('results.pdfLoading')}</p>}
    >
      {Array.from({ length: pages }, (_, index) => (
        <div key={index} className="ar-page" data-ar-root="">
          <Page
            pageNumber={index + 1}
            width={width || undefined}
            renderTextLayer
            renderAnnotationLayer={false}
            onRenderTextLayerSuccess={onLayout}
          />
        </div>
      ))}
    </Document>
  )
}

function WordDocument({ file, width, onLayout, onError }) {
  const { t } = useLanguage()
  const hostRef = useRef(null)
  const [natural, setNatural] = useState(null)
  // A Word page has a fixed width. Narrower than the column it is shown as is;
  // wider, it is scaled down to fit rather than scrolled sideways.
  const scale = natural && width ? Math.min(1, width / natural.w) : 1

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return undefined
    host.innerHTML = ''
    // Loaded on demand: most resumes are PDFs, and the renderer is the
    // largest thing on this page.
    import('docx-preview')
      .then(({ renderAsync }) => renderAsync(file, host, undefined, {
        className: 'ar-docx',
        inWrapper: true,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        renderHeaders: true,
        renderFooters: true,
        experimental: false,
      }))
      .then(() => {
        if (cancelled) return
        const wrapper = host.querySelector('.ar-docx-wrapper')
        setNatural(wrapper ? { w: wrapper.scrollWidth, h: wrapper.scrollHeight } : null)
        onLayout()
      })
      .catch(err => { if (!cancelled) onError(err?.message || t('results.pdfUnknownError')) })
    return () => { cancelled = true }
  }, [file, onLayout, onError, t])

  useEffect(() => { onLayout() }, [scale, onLayout])

  return (
    <div
      className="ar-docx-frame"
      style={natural ? { height: natural.h * scale } : undefined}
    >
      <div
        ref={hostRef}
        className="ar-docx-host"
        data-ar-root=""
        style={{ transform: `scale(${scale})`, width: natural ? natural.w : undefined }}
      />
    </div>
  )
}

/* ── Side panel pieces ───────────────────────────────────────────────── */

function IssueCard({ annotation, number, placed, active, onSelect, cardRef }) {
  const { t, tc } = useLanguage()
  const quoted = annotation.category === 'grammar' || annotation.category === 'content' || annotation.category === 'heading'

  return (
    <li ref={cardRef}>
      <button
        type="button"
        className={`ar-card ar-card--${annotation.category}${active ? ' ar-card--active' : ''}`}
        onClick={() => onSelect(annotation.id)}
        aria-pressed={active}
      >
        <span className="ar-card__top">
          {number ? <span className={`ar-num ar-num--${annotation.category}`}>{number}</span> : null}
          <span className="ar-card__category">
            {annotation.category === 'grammar' && annotation.kind
              ? tc(`results.grammarType.${annotation.kind}`, t('annot.category.grammar'))
              : t(`annot.category.${annotation.category}`)}
          </span>
        </span>
        <span className={`ar-card__title${quoted ? ' ar-card__title--quote' : ''}`}>
          {quoted ? `“${annotation.title}”` : annotation.title}
        </span>
        {annotation.detail && <span className="ar-card__detail">{annotation.detail}</span>}
        {annotation.fix && (
          <span className="ar-card__fix">
            <strong>{annotation.category === 'heading' ? t('annot.useInstead') : t('annot.try')}</strong> {annotation.fix}
          </span>
        )}
        {!placed && (
          <span className="ar-card__unplaced">
            <MapPinOff size={13} aria-hidden="true" /> {t('annot.notPlaced')}
          </span>
        )}
      </button>
    </li>
  )
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function AnnotatedResume({ file, fileUrl, feedback, isLoading, onOpenReport, onUploadNew }) {
  const { t, n } = useLanguage()
  const columnRef = useRef(null)
  const surfaceRef = useRef(null)
  const cardRefs = useRef(new Map())
  const markRefs = useRef(new Map())
  const columnWidth = useElementWidth(columnRef)
  const [layoutTick, setLayoutTick] = useState(0)
  const [placements, setPlacements] = useState(new Map())
  const [surfaceWidth, setSurfaceWidth] = useState(0)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const [hidden, setHidden] = useState(() => new Set(OFF_BY_DEFAULT))
  const [mobileTab, setMobileTab] = useState('resume')

  const isDocx = file?.type === DOCX_MIME || /\.docx$/i.test(file?.name ?? '')
  const source = file || fileUrl || null
  const docWidth = columnWidth > 48 ? Math.min(columnWidth - 48, 900) : 0

  const { annotations, wholeDocument, missingKeywords } = useMemo(() => collectAnnotations(feedback), [feedback])

  // Layout callbacks arrive once per page; batch them into one measurement.
  const bumpLayout = useCallback(() => setLayoutTick(tick => tick + 1), [])
  const reportError = useCallback(message => setError(message), [])

  useEffect(() => {
    if (isLoading) return undefined
    const surface = surfaceRef.current
    if (!surface) return undefined
    const frame = requestAnimationFrame(() => {
      const roots = [...surface.querySelectorAll('[data-ar-root]')]
      setPlacements(measure(surface, roots, annotations))
      setSurfaceWidth(surface.offsetWidth)
    })
    return () => cancelAnimationFrame(frame)
    // mobileTab: on a phone the document is hidden behind a tab, where it
    // measures as nothing, so it is measured again when it comes back.
  }, [annotations, isLoading, layoutTick, docWidth, mobileTab])

  // Numbers go to placed issues in priority order, up to the cap. Keywords are
  // a layer, not findings, and are never numbered.
  const numbers = useMemo(() => {
    const out = new Map()
    let next = 1
    for (const annotation of annotations) {
      if (annotation.category === 'keyword') continue
      if (placements.get(annotation.id)?.status === 'unplaced' || !placements.has(annotation.id)) continue
      if (next > MAX_NUMBERED) break
      out.set(annotation.id, next)
      next += 1
    }
    return out
  }, [annotations, placements])

  const counts = useMemo(() => {
    const out = {}
    for (const annotation of annotations) out[annotation.category] = (out[annotation.category] ?? 0) + 1
    return out
  }, [annotations])

  const findings = annotations.filter(annotation => annotation.category !== 'keyword')
  // Numbered first, in number order; then whatever could not be drawn.
  const listed = [
    ...findings.filter(annotation => numbers.has(annotation.id)),
    ...findings.filter(annotation => !numbers.has(annotation.id)),
  ].filter(annotation => !hidden.has(annotation.category))
  const capped = findings.filter(annotation => placements.get(annotation.id)?.status !== 'unplaced').length - numbers.size

  const toggle = category => setHidden(current => {
    const next = new Set(current)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    return next
  })

  const selectFromPanel = id => {
    setActiveId(id)
    setMobileTab('resume')
    requestAnimationFrame(() => {
      markRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const selectFromDocument = id => {
    setActiveId(id)
    // On a phone the panel is a separate tab, so tapping a mark goes there.
    const narrow = window.matchMedia(NARROW).matches
    if (narrow) setMobileTab('feedback')
    requestAnimationFrame(() => {
      cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: narrow ? 'center' : 'nearest' })
    })
  }

  const tooltipFor = hoverId ?? activeId
  const tooltipAnnotation = annotations.find(annotation => annotation.id === tooltipFor)
  const tooltipRect = tooltipAnnotation ? placements.get(tooltipAnnotation.id)?.rects?.[0] : null

  const overall = typeof feedback?.overall_score === 'number' ? feedback.overall_score : null

  return (
    <div className={`ar ar--show-${mobileTab}`}>
      <div className="ar-tabs" role="tablist" aria-label={t('annot.viewLabel')}>
        {['resume', 'feedback'].map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab}
            className={`ar-tabs__tab${mobileTab === tab ? ' ar-tabs__tab--on' : ''}`}
            onClick={() => setMobileTab(tab)}
          >
            {t(`annot.mobile.${tab}`)}
          </button>
        ))}
      </div>

      <div className="ar-doc" ref={columnRef}>
        {error && <p className="notice notice--error ar-doc__error">{t('results.pdfFailed', { message: error })}</p>}
        {isDocx && <p className="ar-doc__note"><FileText size={14} aria-hidden="true" /> {t('annot.docxNote')}</p>}

        <div className="ar-surface" ref={surfaceRef}>
          {source && (isDocx
            ? <WordDocument file={file} width={docWidth} onLayout={bumpLayout} onError={reportError} />
            : <PdfDocument source={source} width={docWidth} onLayout={bumpLayout} onError={reportError} />)}

          <div className="ar-overlay">
            {annotations.map(annotation => {
              if (hidden.has(annotation.category)) return null
              const placement = placements.get(annotation.id)
              if (!placement || placement.status === 'unplaced') return null
              const number = numbers.get(annotation.id)
              // Past the cap: still listed, not drawn.
              if (annotation.category !== 'keyword' && !number) return null
              const label = annotation.category === 'keyword'
                ? t('annot.matchesAd')
                : t('annot.markLabel', { number: n(number), text: annotation.title })
              return placement.rects.map((rect, index) => (
                <button
                  key={`${annotation.id}-${index}`}
                  ref={index === 0 ? element => {
                    if (element) markRefs.current.set(annotation.id, element)
                    else markRefs.current.delete(annotation.id)
                  } : undefined}
                  type="button"
                  className={`ar-mark ar-mark--${annotation.category}${activeId === annotation.id ? ' ar-mark--active' : ''}`}
                  style={{ left: rect.x - 2, top: rect.y - 1, width: rect.w + 4, height: rect.h + 2 }}
                  aria-label={index === 0 ? label : undefined}
                  aria-hidden={index === 0 ? undefined : true}
                  tabIndex={index === 0 ? 0 : -1}
                  onMouseEnter={() => setHoverId(annotation.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(annotation.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={() => selectFromDocument(annotation.id)}
                >
                  {index === 0 && number ? <span className={`ar-num ar-num--${annotation.category} ar-mark__num`}>{n(number)}</span> : null}
                </button>
              ))
            })}

            {tooltipAnnotation && tooltipRect && !hidden.has(tooltipAnnotation.category) && (
              <div
                className="ar-tip"
                role="tooltip"
                style={{
                  left: Math.max(0, Math.min(tooltipRect.x, surfaceWidth - TIP_WIDTH)),
                  top: tooltipRect.y + tooltipRect.h + 8,
                }}
              >
                <span className="ar-tip__category">{t(`annot.category.${tooltipAnnotation.category}`)}</span>
                {tooltipAnnotation.category === 'keyword'
                  ? <span>{t('annot.matchesAd')}</span>
                  : (
                    <>
                      {tooltipAnnotation.detail && <span>{tooltipAnnotation.detail}</span>}
                      {tooltipAnnotation.fix && (
                        <span className="ar-tip__fix">
                          <strong>{tooltipAnnotation.category === 'heading' ? t('annot.useInstead') : t('annot.try')}</strong>{' '}
                          {tooltipAnnotation.fix}
                        </span>
                      )}
                    </>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="ar-panel" aria-label={t('annot.panelLabel')}>
        <div className="ar-panel__head">
          {overall !== null && (
            <p className="ar-panel__score">
              <span className="ar-panel__score-number">{n(overall)}</span>
              <span className="ar-panel__score-label">{t('annot.overall')}</span>
            </p>
          )}
          <p className="ar-panel__summary" role="status">
            {isLoading
              ? t('annot.marking')
              : numbers.size === 1
                ? t('annot.markedOne')
                : t('annot.markedCount', { count: n(numbers.size) })}
          </p>

          <div className="ar-filters" role="group" aria-label={t('annot.filtersLabel')}>
            {CATEGORIES.filter(category => counts[category]).map(category => (
              <button
                key={category}
                type="button"
                className={`ar-filter ar-filter--${category}${hidden.has(category) ? '' : ' ar-filter--on'}`}
                aria-pressed={!hidden.has(category)}
                onClick={() => toggle(category)}
              >
                <span className={`ar-filter__dot ar-filter__dot--${category}`} aria-hidden="true" />
                {t(`annot.category.${category}`)}
                <span className="ar-filter__count">{n(counts[category])}</span>
                {hidden.has(category) ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        {!isLoading && findings.length === 0 && <p className="ar-panel__empty">{t('annot.noIssues')}</p>}

        <ol className="ar-list">
          {listed.map(annotation => (
            <IssueCard
              key={annotation.id}
              annotation={annotation}
              number={numbers.has(annotation.id) ? n(numbers.get(annotation.id)) : null}
              placed={isLoading || placements.get(annotation.id)?.status !== 'unplaced'}
              active={activeId === annotation.id}
              onSelect={selectFromPanel}
              cardRef={element => {
                if (element) cardRefs.current.set(annotation.id, element)
                else cardRefs.current.delete(annotation.id)
              }}
            />
          ))}
        </ol>

        {capped > 0 && <p className="ar-panel__note">{t('annot.capped', { count: n(capped) })}</p>}

        {wholeDocument.length > 0 && !hidden.has('format') && (
          <section className="ar-section">
            <h3 className="ar-section__title">{t('annot.wholeDoc')}</h3>
            <ul className="ar-plain">
              {wholeDocument.map((item, index) => (
                <li key={index}>
                  <strong>{item.issue}</strong>
                  {item.suggestion && <span> {item.suggestion}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {missingKeywords.length > 0 && (
          <section className="ar-section">
            <h3 className="ar-section__title">{t('annot.missing')}</h3>
            <p className="ar-section__hint">{t('annot.missingHint')}</p>
            <div className="ar-chips">
              {missingKeywords.map(keyword => <span key={keyword} className="ar-chip">{keyword}</span>)}
            </div>
          </section>
        )}

        <div className="ar-panel__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={onOpenReport}>
            {t('annot.openReport')} <ArrowRight size={14} />
          </button>
          <button type="button" className="btn btn--outline btn--sm" onClick={onUploadNew}>
            <Upload size={14} /> {t('results.uploadNew')}
          </button>
        </div>
      </aside>
    </div>
  )
}
