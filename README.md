# Hyperagent dashboard clone

A pixel-faithful rebuild of the hyperagent.com dashboard (every page reachable
from the left sidebar) on the stack the site uses: Next.js 16 (App Router),
Tailwind CSS v4, shadcn (radix). The site draws its icons with lucide; this
repo renders every icon with Tabler (`@tabler/icons-react`), see
`docs/brand/icons.md`. Phase 1 reproduces Hyperagent's own design exactly;
phase 2 re-skins the same components with the Brand design language, whose
token system lives alongside in `src/design/brand/`.

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
| `src/app/globals.css` | Tailwind imports, the `@theme inline` block (shadcn contract, Hyperagent extras, radius steps, `animate-*`), the "PHASE 2 BRIDGE" that turns brand-only tokens into utilities, a small `:root` block mapping the Hyperagent-only names the site utilities read onto brand tokens, base layer, site utilities, keyframes. No palette of its own |
| `src/app/layout.tsx` | Fonts (Geist and Geist Mono from `next/font/google`) on `<html>`, the next-themes and tooltip providers |
| `src/app/(app)/` | One route per sidebar page, wrapped by the app shell |
| `src/components/app/` | Shell: sidebar, frame, brand marks |
| `src/components/composer/` | The message composer (home + thread pages) |
| `src/components/patterns/` | Composites of primitives used by two or more pages (`PageHeading`, `SearchInput`, `EmptyState`, `ShowArchivedSwitch`) |
| `src/components/<page>/` | Page components: layout and data wiring composed from `ui/` and `patterns/`, never a raw control |
| `src/components/ui/` | 29 shadcn primitives, re-skinned with the brand in phase 2 (pills, tints, hairlines, glass shadows) behind the phase-1 variant and size API; the only place `radix-ui` and `cmdk` are imported, every one with a `data-slot` |
| `src/design/brand/` | The Brand token system: `brand.css` is the app's only palette (light on `:root`, dark on `.dark`), bridged into Tailwind by the "PHASE 2 BRIDGE" block in `globals.css` |
| `docs/brand/` | `design.md` (the brand language), `reskin-conventions.md` (the phase-2 page-branch contract), `icons.md` (Tabler only, and the lucide-to-Tabler names), the style audit |
| `scripts/brand/`, `scripts/dev/` | Ramp generator, WCAG contrast gate, token lint; headless screenshot and contact-sheet scripts |
| `docs/reference/` | Ground truth captured from hyperagent.com: compiled CSS, fonts, a DOM dump per page, and `overlays/` with every captured menu, dialog and tooltip |
| `docs/components.md` | The component system: tiers, rules, the component map with live evidence, how to add a component, the live UI the clone lacks |
| `docs/clone-conventions.md` | The rules every page branch follows |

## Theme switches

The brand tokens are the app's only palette: `src/design/brand/brand.css`
defines the light mapping on `:root` and the dark mapping on `.dark`. Light is
the default; the account menu's Theme item switches to dark or system through
`next-themes` (a `dark` class on `<html>`, remembered in localStorage; system
follows the OS). `/design/brand` has its own local light/dark toggle so every
token can be inspected in either mapping regardless of the app theme. The
phase-1 Hyperagent palettes are no longer in the code: the last commit that
carries them is `c10d36c`, and `docs/reference/` keeps the captured ground
truth.

```bash
npm run brand:check-contrast   # WCAG AA gate over the brand tokens, both themes
npm run brand:lint-tokens      # no raw colours / stock palette classes / px radii in components
npm test                       # the token contract (brand.css shape, bridge targets, cn()), the icon rule and the component lock (radix only under ui/, no raw controls, every live data-slot defined)
node scripts/dev/screenshot-pages.mjs out/ http://localhost:3000   # every route, light + dark
```
