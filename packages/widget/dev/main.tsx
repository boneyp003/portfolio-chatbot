import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Chatbot } from '../src'

const params = new URLSearchParams(window.location.search)
const apiUrl = params.get('apiUrl') ?? 'http://localhost:8787/chat'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Widget dev sandbox</h1>
      <p>
        Talking to <code>{apiUrl}</code>. Override with <code>?apiUrl=...</code>.
      </p>
      <Chatbot apiUrl={apiUrl} />
    </div>
  </StrictMode>,
)
