/**
 * Module: ChatbotWidget
 * Responsibility: Floating AI career chatbot UI with POST-based SSE streaming.
 */

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import styles from './ChatbotWidget.module.css'

function parseSseFrame(frame) {
  const dataLines = frame
    .split(/\r?\n/)
    .filter(line => line.startsWith('data:'))
    .map(line => {
      const value = line.slice(5)
      return value.startsWith(' ') ? value.slice(1) : value
    })

  return dataLines.join('\n')
}

function updateAssistantAt(history, index, content) {
  return history.map((message, currentIndex) => {
    if (currentIndex !== index || message.role !== 'assistant') return message
    return { ...message, content }
  })
}

/**
 * Drains the SSE body, accumulating the assistant's reply and reporting it as
 * it grows.
 *
 * This lives at module scope rather than inside the component on purpose. It
 * accumulates into a local that it reassigns on every frame, and React's
 * compiler treats values captured from a component body as immutable — so the
 * same loop written inline is rejected. Outside a component there is nothing to
 * memoise and the reassignment is ordinary JavaScript.
 *
 * @param {ReadableStream} body
 * @param {{ onText: (content: string) => void, onError: () => void }} handlers
 */
async function streamAssistantReply(body, { onText, onError }) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let assistantContent = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      let frameEnd = buffer.indexOf('\n\n')
      while (frameEnd !== -1) {
        const frame = buffer.slice(0, frameEnd)
        buffer = buffer.slice(frameEnd + 2)
        const payload = parseSseFrame(frame)

        if (payload === '[DONE]') return

        if (payload === '[ERROR]') {
          onError()
          return
        }

        if (payload) {
          // The very first chunk arrives with the model's leading whitespace
          // still attached; later ones must keep theirs or words run together.
          const nextChunk = assistantContent ? payload : payload.replace(/^\s+/, '')
          if (nextChunk) {
            assistantContent += nextChunk
            onText(assistantContent)
          }
        }

        frameEnd = buffer.indexOf('\n\n')
      }
    }
  } catch {
    onError()
  }
}

export default function ChatbotWidget() {
  /*
   * The language used to be read by querying the navbar for '.lang-btn.active'
   * and re-read on every document click. It worked, but it coupled the chatbot
   * to a CSS class in an unrelated component: renaming that class would have
   * silently reverted every conversation to English. The selection has a
   * provider, so it is read from there.
   */
  const { lang: language, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [input, setInput] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  const [errorKey, setErrorKey] = useState('')
  const bottomRef = useRef(null)

  /*
   * The greeting is rendered rather than stored, so toggling the language
   * before the first reply re-renders it instead of leaving an English
   * sentence at the top of a Bangla conversation. Once the user has sent
   * anything, the transcript is left exactly as it was said.
   */
  const greeting = { role: 'assistant', content: t('chatbot.greeting') }

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, isResponding, open])

  async function sendMessage() {
    const message = input.trim()
    if (!message || isResponding) return

    // State holds the transcript only; the greeting is prepended for display
    // and for the model, never stored, so it never lands in state twice.
    const priorHistory = conversationHistory.filter(item => item.content.trim())
    const userMessage = { role: 'user', content: message }
    const assistantIndex = priorHistory.length + 1

    setConversationHistory([...priorHistory, userMessage, { role: 'assistant', content: '' }])
    setInput('')
    setErrorKey('')
    setIsResponding(true)

    let response
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: [greeting, ...priorHistory],
          language,
        }),
      })
    } catch {
      setConversationHistory([...priorHistory, userMessage])
      setErrorKey('chatbot.genericError')
      setIsResponding(false)
      return
    }

    if (response.status === 401) {
      setConversationHistory([...priorHistory, userMessage])
      setErrorKey('chatbot.genericError')
      setIsResponding(false)
      return
    }

    if (response.status === 429) {
      setConversationHistory([...priorHistory, userMessage])
      setErrorKey('chatbot.limit')
      setIsResponding(false)
      return
    }

    if (!response.ok || !response.body) {
      setConversationHistory([...priorHistory, userMessage])
      setErrorKey('chatbot.genericError')
      setIsResponding(false)
      return
    }

    await streamAssistantReply(response.body, {
      onText: content => setConversationHistory(history => updateAssistantAt(history, assistantIndex, content)),
      onError: () => setErrorKey('chatbot.genericError'),
    })
    setIsResponding(false)
  }

  const canSend = input.trim().length > 0 && !isResponding
  const visibleMessages = [greeting, ...conversationHistory].filter(message => message.content.trim().length > 0)
  const isThinking = isResponding && conversationHistory.at(-1)?.role === 'assistant' && !conversationHistory.at(-1)?.content

  return (
    <>
      {open && (
        <section className={styles.widget} aria-label={t('chatbot.label')}>
          <header className={styles.header}>
            <div className={styles.headerIdentity}>
              <div className={styles.avatar} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 5.5A2.5 2.5 0 016.5 3h7A2.5 2.5 0 0116 5.5v5A2.5 2.5 0 0113.5 13H9l-4 3v-3.1A2.5 2.5 0 014 10.5v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M7 8h.01M10 8h.01M13 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className={styles.title}>{t('chatbot.title')}</div>
                <div className={styles.subtitle}>{language === 'bn' ? t('chatbot.langBangla') : t('chatbot.langEnglish')}</div>
              </div>
            </div>
            <button className={styles.iconButton} type="button" onClick={() => setOpen(false)} aria-label={t('chatbot.close')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className={styles.messages}>
            {visibleMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`${styles.messageRow} ${styles[message.role]}`}>
                <div className={styles.bubble}>{message.content}</div>
              </div>
            ))}
            {isThinking && (
              <div className={`${styles.messageRow} ${styles.assistant}`}>
                <div className={`${styles.bubble} ${styles.thinking}`}>
                  <span className={styles.thinkingDot} aria-hidden="true" />
                  <span className={styles.thinkingDot} aria-hidden="true" />
                  <span className={styles.thinkingDot} aria-hidden="true" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {errorKey && <div className={styles.inlineError}>{t(errorKey)}</div>}

          <form className={styles.inputArea} onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
            <textarea
              className={styles.input}
              rows={1}
              placeholder={t('chatbot.placeholder')}
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              disabled={isResponding}
            />
            <button className={styles.sendButton} type="submit" disabled={!canSend} aria-label={t('chatbot.send')}>
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 2.25L8.25 9.75M15.75 2.25l-4.5 13.5-3-6-6-3 13.5-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button className={styles.trigger} type="button" onClick={() => setOpen(value => !value)} aria-label={open ? t('chatbot.closeTrigger') : t('chatbot.openTrigger')}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 5.5A2.5 2.5 0 016.5 3h9A2.5 2.5 0 0118 5.5v6A2.5 2.5 0 0115.5 14H9l-5 4v-4.5A2.5 2.5 0 011.5 11V5.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </>
  )
}
