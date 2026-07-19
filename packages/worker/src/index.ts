import { buildSystemPrompt } from './systemPrompt'

export interface Env {
  AI: Ai
  RATE_LIMIT_KV: KVNamespace
  ALLOWED_ORIGINS: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const MODEL = '@cf/meta/llama-3.1-8b-instruct'
const RATE_LIMIT_PER_HOUR = 30

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

async function isRateLimited(env: Env, clientIp: string): Promise<boolean> {
  const key = `rl:${clientIp}`
  const current = Number((await env.RATE_LIMIT_KV.get(key)) ?? '0')
  if (current >= RATE_LIMIT_PER_HOUR) return true
  await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: 3600 })
  return false
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    const origin = request.headers.get('Origin')
    const headers = corsHeaders(origin, allowedOrigins)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    const url = new URL(request.url)
    if (url.pathname !== '/chat' || request.method !== 'POST') {
      return new Response('Not found', { status: 404, headers })
    }

    if (!origin || !allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    if (await isRateLimited(env, clientIp)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    let messages: ChatMessage[]
    try {
      const body = (await request.json()) as { messages?: ChatMessage[] }
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw new Error('messages must be a non-empty array')
      }
      messages = body.messages
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const aiResponse = await env.AI.run(MODEL, {
      messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages],
    })

    const reply =
      typeof aiResponse === 'object' && aiResponse !== null && 'response' in aiResponse
        ? String((aiResponse as { response: unknown }).response)
        : String(aiResponse)

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  },
}
