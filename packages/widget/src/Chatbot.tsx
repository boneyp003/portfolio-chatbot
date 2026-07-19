import { useState, type FormEvent } from 'react'
import { useChat } from './useChat'
import styles from './Chatbot.module.css'

export interface ChatbotProps {
  /** URL of the Worker's /chat endpoint */
  apiUrl: string
  /** Label shown in the panel header */
  title?: string
  /** First assistant message shown before the visitor types anything */
  initialMessage?: string
  /** Placeholder text for the input field */
  placeholder?: string
}

export function Chatbot({
  apiUrl,
  title = 'Ask me anything',
  initialMessage = "Hi! Ask me about my background, experience, or projects.",
  placeholder = 'Type a message…',
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const { messages, isLoading, error, sendMessage } = useChat({ apiUrl, initialMessage })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = draft
    setDraft('')
    void sendMessage(text)
  }

  return (
    <div className={styles.root}>
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label={title}>
          <div className={styles.header}>
            <span>{title}</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}
              >
                {m.content}
              </div>
            ))}
            {isLoading && <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>…</div>}
            {error && <div className={styles.error}>{error}</div>}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
            />
            <button type="submit" className={styles.sendButton} disabled={isLoading || !draft.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={styles.launcher}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}
