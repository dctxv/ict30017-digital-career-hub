import { useState, useRef, useEffect } from 'react'
import './ChatbotWidget.css'

const INITIAL_MSG = {
  role: 'bot',
  text: "Hi! I can help with career guidance, resume tips, interview prep, and job searching in Bangladesh. What would you like to know?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [lang, setLang] = useState('EN')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function send() {
    if (!input.trim()) return
    const userMsg = {
      role: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(m => [...m, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, {
        role: 'bot',
        text: "That's a great career question. For the most relevant guidance in the Bangladeshi job market, I'd recommend researching local industry norms and connecting with alumni in your target field. Would you like more specific advice?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }, 1400)
  }

  return (
    <>
      {open && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="bot-avatar">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="5" width="10" height="8" rx="2" stroke="white" strokeWidth="1.2"/>
                  <circle cx="6" cy="9" r="1" fill="white"/>
                  <circle cx="10" cy="9" r="1" fill="white"/>
                  <path d="M6 5V3M10 5V3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M8 3H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="chat-title">Career Assistant</div>
                <div className="chat-subtitle">Career guidance only · EN / BN</div>
              </div>
            </div>
            <div className="chat-header-right">
              <button className="chat-ctrl" onClick={() => setOpen(false)}>—</button>
              <button className="chat-ctrl" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chat-lang-bar">
            <span>Responding in {lang === 'EN' ? 'English' : 'Bangla'}</span>
            <button onClick={() => setLang(l => l === 'EN' ? 'BN' : 'EN')}>
              Switch to {lang === 'EN' ? 'Bangla' : 'English'}
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble-wrap ${m.role}`}>
                <div className={`chat-bubble ${m.role}`}>{m.text}</div>
                <div className="chat-time">{m.time}</div>
              </div>
            ))}
            {typing && (
              <div className="chat-bubble-wrap bot">
                <div className="chat-bubble bot typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder="Ask a career question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="chat-send" onClick={send}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2L5 8L2 14L14 8Z" fill="white"/>
              </svg>
            </button>
          </div>
          <div className="chat-scope-note">Scoped to career topics only</div>
        </div>
      )}

      <button className="chat-trigger" onClick={() => setOpen(o => !o)}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 4h14a2 2 0 012 2v8a2 2 0 01-2 2H7l-4 3V6a2 2 0 012-2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
        )}
        <span className="chat-trigger-dot" />
      </button>
    </>
  )
}