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
| `src/app/layout.tsx` | Fonts (Geist and Geist Mono from `next/font/google`), `theme-brand` on `<body>`, the next-themes provider |
| `src/app/(app)/` | One route per sidebar page, wrapped by the app shell |
| `src/components/app/` | Shell: sidebar, frame, brand marks |
| `src/components/composer/` | The message composer (home + thread pages) |
| `src/components/<page>/` | Page-specific components |
| `src/components/ui/` | shadcn primitives, re-skinned with the brand in phase 2 (pills, tints, hairlines, glass shadows) behind the phase-1 variant and size API |
| `src/design/brand/` | The Brand token system, scoped under `.theme-brand`; bridged into Tailwind by the "PHASE 2 BRIDGE" block in `globals.css` |
| `docs/brand/` | `design.md` (the brand language), `reskin-conventions.md` (the phase-2 page-branch contract), the style audit |
| `scripts/brand/`, `scripts/dev/` | Ramp generator, WCAG contrast gate, token lint; headless screenshot and contact-sheet scripts |
| `docs/reference/` | Ground truth captured from hyperagent.com: compiled CSS, fonts, a DOM dump per page, and `overlays/` with every captured menu, dialog and tooltip |
| `docs/clone-conventions.md` | The rules every page branch follows |

## Theme switches

Phase 2 puts `theme-brand` on `<body>`, so the whole app runs on the brand
tokens; light is the default and the account menu's Theme item switches to
dark or system through `next-themes` (a `dark` class on `<html>`). The
Hyperagent palettes are still in `globals.css` for side-by-side comparison:
swap `theme-brand` for `palette-neutral` on `<body>` in `layout.tsx` and pick
Dark to see the phase-1 clone exactly as the live account renders it.

```bash
npm run brand:check-contrast   # WCAG AA gate over the brand tokens, both themes
npm run brand:lint-tokens      # no raw colours / stock palette classes / px radii in components
node scripts/dev/screenshot-pages.mjs out/ http://localhost:3000   # every route, light + dark
```
