# portfolio-chatbot

An AI chatbot for [boneyp003.github.io](https://boneyp003.github.io), split into two
packages that share one API contract:

- [`packages/widget`](packages/widget) — the React component library (`<Chatbot />`)
  that plugs into the static site.
- [`packages/worker`](packages/worker) — a Cloudflare Worker that proxies chat requests
  to [Workers AI](https://developers.cloudflare.com/workers-ai/) (free tier), so no API
  key is ever exposed in the browser.

## Why a separate backend?

`boneyp003.github.io` is a static site (GitHub Pages) — it has no server. The widget
can't safely call an LLM directly, so it calls a Worker instead, which holds no
secrets (Workers AI is billed to the Cloudflare account, not a bearer key in the
request) and enforces CORS + rate limiting.

## API contract

```
POST {WORKER_URL}/chat
{ "messages": [{ "role": "user" | "assistant", "content": string }] }
→ { "reply": string }
```

See [packages/worker/README.md](packages/worker/README.md) for error responses.

## Getting started

```
npm install
```

Then, in one terminal:

```
npm run dev:worker    # wrangler dev on http://localhost:8787
```

And in another:

```
npm run dev:widget    # Vite dev sandbox, talks to the local worker
```

## Before this goes live

1. **Provide your background content** — replace [packages/worker/src/background.txt](packages/worker/src/background.txt)
   with your real experience/projects/education/certifications text. The assistant
   answers only from this file.
2. **Deploy the worker** (`npm run deploy` inside `packages/worker`, after
   `npx wrangler login` — needs your own free Cloudflare account) to get a live URL.
3. **Build the widget** (`npm run build` inside `packages/widget`).
4. **Wire it into the site**: from `boneyp003.github.io`,
   `npm install --save file:../portfolio-chatbot/packages/widget`, then add
   `<Chatbot apiUrl="<your worker URL>/chat" />` to `App.tsx` and import
   `@portfolio-chatbot/widget/style.css` once.

Steps 2-4 aren't done yet — they need your Cloudflare login and background text file.
