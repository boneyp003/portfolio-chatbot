# @portfolio-chatbot/widget

A small, dependency-free React chat widget. Renders a floating launcher button
that opens a chat panel talking to your [Worker backend](../worker).

## Usage

```tsx
import { Chatbot } from '@portfolio-chatbot/widget'
import '@portfolio-chatbot/widget/style.css' // resolves to dist/portfolio-chatbot-widget.css

function App() {
  return (
    <>
      {/* ...rest of your site... */}
      <Chatbot apiUrl="https://portfolio-chatbot-worker.<your-subdomain>.workers.dev/chat" />
    </>
  )
}
```

### Props

| Prop | Default | Description |
| --- | --- | --- |
| `apiUrl` | *(required)* | URL of the Worker's `/chat` endpoint |
| `title` | `"Ask me anything"` | Panel header text |
| `initialMessage` | greeting text | First assistant message shown before the visitor types |
| `placeholder` | `"Type a message…"` | Input placeholder |

### Theming

The widget follows the host page's `data-theme="dark"` attribute automatically
(the same mechanism `boneyp003.github.io` already uses in `theme.ts`). To
customize colors, override these CSS custom properties on `:root` or on
`[data-theme="dark"]`:

```css
--chatbot-bg, --chatbot-fg, --chatbot-muted,
--chatbot-accent, --chatbot-accent-fg,
--chatbot-border, --chatbot-bubble-bg
```

## Local development

```
npm run dev
```

Opens a dev sandbox (`dev/main.tsx`) rendering `<Chatbot />` against
`http://localhost:8787/chat` by default (the worker's local `wrangler dev`
address). Override with `?apiUrl=...` in the sandbox URL.

## Build

```
npm run build
```

Outputs an ESM + CJS bundle and type declarations to `dist/`, plus a single
`dist/style.css`.

## Consuming from `boneyp003.github.io`

Not published to npm — install it locally once built:

```
npm install --save file:../portfolio-chatbot/packages/widget
```

(run from the `boneyp003.github.io` repo, assuming both repos are siblings on disk).
