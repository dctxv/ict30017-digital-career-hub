/**
 * Module: ChatbotWidget
 * Responsibility: Floating AI career chatbot UI with POST-based SSE streaming.
 */

import { useEffect, useRef, useState } from 'react'
import styles from './ChatbotWidget.module.css'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hi! I can help with career guidance, resume tips, interview prep, and job searching in Bangladesh.',
}

const LIMIT_MESSAGE = "You've reached your daily chat limit. Upgrade to Premium for unlimited access."
const GENERIC_ERROR = 'Something went wrong. Please try again.'

function readCurrentLanguage() {
  const activeToggle = document.querySelector('.lang-btn.active')
  const activeText = activeToggle?.textContent?.trim().toLowerCase()

  if (activeText === 'bn') return 'bn'
  if (document.documentElement.lang?.toLowerCase().startsWith('bn')) return 'bn'
  if (navigator.language?.toLowerCase().startsWith('bn')) return 'bn'

  return 'en'
}

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

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState(() => readCurrentLanguage())
  const bottomRef = useRef(null)

  useEffect(() => {
    const syncLanguage = () => setLanguage(readCurrentLanguage())
    const onDocumentClick = () => window.setTimeout(syncLanguage, 0)

    syncLanguage()
    document.addEventListener('click', onDocumentClick)

    return () => document.removeEventListener('click', onDocumentClick)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, isResponding, open])

  async function sendMessage() {
    const message = input.trim()
    if (!message || isResponding) return

    const historyBeforeSend = conversationHistory.filter(item => item.content.trim())
    const userMessage = { role: 'user', content: message }
    const assistantIndex = historyBeforeSend.length + 1

    setConversationHistory([...historyBeforeSend, userMessage, { role: 'assistant', content: '' }])
    setInput('')
    setError('')
    setIsResponding(true)

    let response
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: historyBeforeSend,
          language,
        }),
      })
    } catch {
      setConversationHistory([...historyBeforeSend, userMessage])
      setError(GENERIC_ERROR)
      setIsResponding(false)
      return
    }

    if (response.status === 401) {
      setConversationHistory([...historyBeforeSend, userMessage])
      setError(GENERIC_ERROR)
      setIsResponding(false)
      return
    }

    if (response.status === 429) {
      setConversationHistory([...historyBeforeSend, userMessage])
      setError(LIMIT_MESSAGE)
      setIsResponding(false)
      return
    }

    if (!response.ok || !response.body) {
      setConversationHistory([...historyBeforeSend, userMessage])
      setError(GENERIC_ERROR)
      setIsResponding(false)
      return
    }

    const reader = response.body.getReader()
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

          if (payload === '[DONE]') {
            setIsResponding(false)
            return
          }

          if (payload === '[ERROR]') {
            setError(GENERIC_ERROR)
            setIsResponding(false)
            return
          }

          if (payload) {
            const nextChunk = assistantContent ? payload : payload.replace(/^\s+/, '')
            if (!nextChunk) {
              frameEnd = buffer.indexOf('\n\n')
              continue
            }

            assistantContent += nextChunk
            setConversationHistory(history => updateAssistantAt(history, assistantIndex, assistantContent))
          }

          frameEnd = buffer.indexOf('\n\n')
        }
      }

      setIsResponding(false)
    } catch {
      setError(GENERIC_ERROR)
      setIsResponding(false)
    }
  }

  const canSend = input.trim().length > 0 && !isResponding
  const visibleMessages = conversationHistory.filter(message => message.content.trim().length > 0)
  const isThinking = isResponding && conversationHistory.at(-1)?.role === 'assistant' && !conversationHistory.at(-1)?.content

  return (
    <>
      {open && (
        <section className={styles.widget} aria-label="Career chatbot">
          <header className={styles.header}>
            <div className={styles.headerIdentity}>
              <div className={styles.avatar} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 5.5A2.5 2.5 0 016.5 3h7A2.5 2.5 0 0116 5.5v5A2.5 2.5 0 0113.5 13H9l-4 3v-3.1A2.5 2.5 0 014 10.5v-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M7 8h.01M10 8h.01M13 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className={styles.title}>Career Assistant</div>
                <div className={styles.subtitle}>{language === 'bn' ? 'Bangla' : 'English'}</div>
              </div>
            </div>
            <button className={styles.iconButton} type="button" onClick={() => setOpen(false)} aria-label="Close chat">
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

          {error && <div className={styles.inlineError}>{error}</div>}

          <form className={styles.inputArea} onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
            <textarea
              className={styles.input}
              rows={1}
              placeholder="Ask a career question..."
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
            <button className={styles.sendButton} type="submit" disabled={!canSend} aria-label="Send message">
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 2.25L8.25 9.75M15.75 2.25l-4.5 13.5-3-6-6-3 13.5-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </section>
      )}

      <button className={styles.trigger} type="button" onClick={() => setOpen(value => !value)} aria-label={open ? 'Close career chatbot' : 'Open career chatbot'}>
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
