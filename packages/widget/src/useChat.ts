import { useCallback, useState } from 'react'
import type { ChatMessage, ChatRequestBody, ChatResponseBody } from './types'

export interface UseChatOptions {
  apiUrl: string
  initialMessage?: string
}

export function useChat({ apiUrl, initialMessage }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessage ? [{ role: 'assistant', content: initialMessage }] : [],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
      setMessages(nextMessages)
      setIsLoading(true)
      setError(null)

      try {
        const body: ChatRequestBody = { messages: nextMessages }
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }

        const data = (await res.json()) as ChatResponseBody
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [apiUrl, isLoading, messages],
  )

  return { messages, isLoading, error, sendMessage }
}
