# @portfolio-chatbot/worker

Cloudflare Worker that proxies chat requests from the [widget](../widget) to
[Workers AI](https://developers.cloudflare.com/workers-ai/) (free tier, no credit card required).

## API contract

```
POST /chat
Content-Type: application/json

{ "messages": [{ "role": "user", "content": "What have you worked on?" }] }
```

Response:

```json
{ "reply": "..." }
```

Errors return `{ "error": "..." }` with an appropriate status code (400 invalid body,
403 disallowed origin, 429 rate limited).

## Before you deploy

1. Replace [src/background.txt](src/background.txt) with your real background content
   (professional experience, projects, education, certifications, etc). This is what
   the assistant is instructed to answer from.
2. Update `ALLOWED_ORIGINS` in [wrangler.toml](wrangler.toml) if your site's origin changes.
3. Create a KV namespace for rate limiting and put its id in `wrangler.toml`:
   ```
   npx wrangler kv namespace create RATE_LIMIT_KV
   ```
   Copy the returned `id` into the `[[kv_namespaces]]` block (replacing
   `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`).

## Local development

```
npm run dev
```

Starts `wrangler dev` on `http://localhost:8787`. **Requires `npx wrangler login`
first** (free Cloudflare account, no credit card) — Workers AI has no local
emulator, so even local dev proxies real requests to your Cloudflare account.

Test it:

```
curl -X POST http://localhost:8787/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

## Deploy

```
npm run deploy
```

Requires `npx wrangler login` once. This gives you a live URL like
`https://portfolio-chatbot-worker.<your-subdomain>.workers.dev` — pass that
(with `/chat` appended) as the widget's `apiUrl` prop.

## Notes

- Model: `@cf/meta/llama-3.1-8b-instruct`, free-tier eligible on Workers AI.
- Rate limiting: 30 requests/hour per IP via KV, to stay comfortably inside the
  free daily neuron allowance. Tune `RATE_LIMIT_PER_HOUR` in `src/index.ts` if needed.
- CORS is locked to `ALLOWED_ORIGINS` — requests from other origins get a 403.
