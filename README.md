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

## Status

Done: background content is filled in, the worker is deployed, and the widget
is wired into `boneyp003.github.io`.

## How the site consumes the widget

The site doesn't install this as an npm package — it **vendors the built
output**. After building the widget (`npm run build` inside `packages/widget`),
copy `dist/portfolio-chatbot-widget.js`, `dist/portfolio-chatbot-widget.css`,
and `dist/index.d.ts` (renamed to `portfolio-chatbot-widget.d.ts`, so TypeScript
picks it up as the sibling declaration file) into
`boneyp003.github.io/src/vendor/chatbot-widget/`, overwriting the existing
copies. Re-copy those three files any time you change the widget's source.

This avoids both a cross-repo `file:` dependency (which broke the site's CI,
since GitHub Actions only checks out one repo) and a published npm package
(GitHub Packages requires an authenticated token to install even public
packages, which added friction for no real benefit at this scale).
