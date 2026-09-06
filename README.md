# Hyperagent dashboard clone

A pixel-faithful rebuild of the hyperagent.com dashboard (every page reachable
from the left sidebar) on the same stack the site uses: Next.js 16 (App
Router), Tailwind CSS v4, shadcn (radix), lucide. Phase 1 reproduces
Hyperagent's own design exactly; phase 2 re-skins the same components with the
Brand design language, whose token system lives alongside in
`src/design/brand/`.

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /threads/new
npm run build && npm run lint
```

Everything is static mock data (`src/lib/mock/`); there is no backend, auth,
or API. Menus, dialogs, tabs and toggles work with local state so the pages
feel alive, but nothing persists.

## Pages

`/threads/new` (home), `/threads`, `/thread/[id]`, `/inbox`, `/teams`, `/skills`,
`/memories`, `/learning`, `/projects`, `/library`, `/marketplace`, `/agents`,
`/settings` (+ sub-page placeholders) and `/settings/integrations`, plus the
shell overlays (⌘K search, account menu, section menus, composer menus, the
collapsed 64px rail and drag-to-resize). `/design/brand` shows the Brand
token swatches.

## Layout

| Path | What |
|---|---|
| `src/app/globals.css` | Hyperagent's tokens: shadcn variables for the warm light, warm dark and dark-neutral palettes, radius scale, motion, site utilities, keyframes |
| `src/app/layout.tsx` | Fonts (Geist, Geist Mono, Season Sans) and the pinned dark/neutral theme |
| `src/app/(app)/` | One route per sidebar page, wrapped by the app shell |
| `src/components/app/` | Shell: sidebar, frame, brand marks |
| `src/components/composer/` | The message composer (home + thread pages) |
| `src/components/<page>/` | Page-specific components |
| `src/components/ui/` | shadcn primitives (`button.tsx` matches the site's variant strings byte for byte) |
| `src/design/brand/` | The Brand token system, scoped under `.theme-brand` (phase 2) |
| `docs/reference/` | Ground truth captured from hyperagent.com: compiled CSS, fonts, a DOM dump per page, and `overlays/` with every captured menu, dialog and tooltip |
| `docs/clone-conventions.md` | The rules every page branch follows |

## Theme switches

The live account renders the dark, neutral palette, so `<html class="dark">`
and `<body class="palette-neutral">` are pinned in `layout.tsx`. Remove
`palette-neutral` for the site's warm dark palette, or `dark` for the warm
light one. Adding `theme-brand` to `<body>` (once the Brand branch is merged)
re-themes the whole app with Brand's tokens, because both systems share the
shadcn variable names.
