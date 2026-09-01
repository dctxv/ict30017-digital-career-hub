/**
 * Module: ChatbotWidget
 * Responsibility: Floating career chatbot with POST-based SSE streaming.
 *
 * Callers elsewhere in the app open this through openChatbot() in chatbotBus.js
 * — see that file for why it is an event rather than a provider.
 */

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { CHATBOT_OPEN_EVENT } from './chatbotBus'
import './ChatbotWidget.css'

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
  const inputRef = useRef(null)

  /*
   * The greeting is rendered rather than stored, so toggling the language
   * before the first reply re-renders it instead of leaving an English
   * sentence at the top of a Bangla conversation. Once the user has sent
   * anything, the transcript is left exactly as it was said.
   */
  const greeting = { role: 'assistant', content: t('chatbot.greeting') }

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(CHATBOT_OPEN_EVENT, handler)
    return () => window.removeEventListener(CHATBOT_OPEN_EVENT, handler)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, isResponding, open])

  // Opening a panel and leaving focus behind it is the difference between a
  // control a keyboard user can reach and one they cannot.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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

    const fail = (key) => {
      setConversationHistory([...priorHistory, userMessage])
      setErrorKey(key)
      setIsResponding(false)
    }

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
      fail('chatbot.genericError')
      return
    }

    // 429 is the daily allowance, and it needs its own message: telling someone
    // "something went wrong" when they have simply used today's messages sends
    // them to retry a request that cannot succeed until tomorrow.
    if (response.status === 429) { fail('chatbot.limit'); return }
    if (!response.ok || !response.body) { fail('chatbot.genericError'); return }

    await streamAssistantReply(response.body, {
      onText: content => setConversationHistory(history => updateAssistantAt(history, assistantIndex, content)),
      onError: () => setErrorKey('chatbot.genericError'),
    })
    setIsResponding(false)
  }

  const canSend = input.trim().length > 0 && !isResponding
  const visibleMessages = [greeting, ...conversationHistory]
    .filter(message => message.content.trim().length > 0)
  const lastMessage = conversationHistory.at(-1)
  const isThinking = isResponding && lastMessage?.role === 'assistant' && !lastMessage?.content

  return (
    <>
      {open && (
        <section className="chat" aria-label={t('chatbot.label')}>
          <header className="chat__header">
            <div className="chat__identity">
              <span className="chat__avatar" aria-hidden="true"><MessageCircle size={17} /></span>
              <div>
                <p className="chat__title">{t('chatbot.title')}</p>
                <p className="chat__lang">
                  {language === 'bn' ? t('chatbot.langBangla') : t('chatbot.langEnglish')}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="chat__close"
              onClick={() => setOpen(false)}
              aria-label={t('chatbot.close')}
            >
              <X size={16} />
            </button>
          </header>

          <div className="chat__messages">
            {visibleMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat__row chat__row--${message.role}`}>
                <div className="chat__bubble">{message.content}</div>
              </div>
            ))}

            {isThinking && (
              <div className="chat__row chat__row--assistant">
                <div className="chat__bubble chat__bubble--thinking">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {errorKey && <div className="chat__error" role="status">{t(errorKey)}</div>}

          <form
            className="chat__composer"
            onSubmit={event => { event.preventDefault(); sendMessage() }}
          >
            <input
              ref={inputRef}
              className="chat__input"
              placeholder={t('chatbot.placeholder')}
              value={input}
              onChange={event => setInput(event.target.value)}
              disabled={isResponding}
            />
            <button
              className="chat__send"
              type="submit"
              disabled={!canSend}
              aria-label={t('chatbot.send')}
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat__trigger"
        onClick={() => setOpen(value => !value)}
        aria-label={open ? t('chatbot.closeTrigger') : t('chatbot.openTrigger')}
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
