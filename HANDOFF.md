# Handoff

Written 2026-09-06 at the end of phase 1. Read this first in a new session,
then `README.md`, then `docs/clone-conventions.md`.

## Where things stand

- **Phase 1 is complete and merged.** `main` holds a pixel-faithful clone of
  the hyperagent.com dashboard: every left-sidebar page plus the shell
  overlays. There is one branch (`main`), no remote, no open worktrees, and a
  clean tree.
- **Phase 2 has not started.** Phase 2 re-skins the same components with the
  brand design language, whose token system already lives in the repo under
  `src/design/brand/` (scoped, inert until applied).
- Verification at the last commit: `npx tsc --noEmit`, `npm run lint`,
  `npm run build` and `npm run brand:check-contrast` all pass. Every route
  returns 200; an unknown thread id returns 404.

```bash
npm install
npm run dev            # http://localhost:3000 → /threads/new
npm run build && npm run lint && npx tsc --noEmit
npm run brand:check-contrast
```

## How the clone was made (so you can extend it the same way)

The site is Next.js + Tailwind v4 + shadcn (radix) + lucide, the same stack as
this repo, so its rendered class strings compile here unchanged. The method:

1. `docs/reference/pages/<page>.html` is a DOM dump of each live page
   (dark theme, neutral palette, 1456×868, captured 2026-09-06) with classes
   intact. `docs/reference/overlays/` holds the same for every menu, dialog and
   tooltip. `docs/reference/css/` has the compiled bundles; `fonts/` the
   self-hosted Geist, Geist Mono and Season Sans files.
2. Components transcribe those dumps verbatim (see `src/components/app/sidebar.tsx`
   for the style). `src/components/ui/button.tsx` and the overlay primitives
   were rewritten to the site's exact variant strings.
3. Each page was compared against the live site in BrowserOS neo at 1456×868,
   most with element-by-element bounding-rect and computed-style diffs.
4. Work ran as parallel git worktrees (one branch per page group, each owning
   distinct paths), merged into `main` with `--no-ff`. `docs/clone-conventions.md`
   is the contract those branches followed; reuse it for any new page.

The live account in BrowserOS is read-only for agents: never send a message,
create, connect or delete anything there.

## Repo map

| Path | What |
|---|---|
| `src/app/globals.css` | Hyperagent tokens: shadcn variables for warm light, warm dark and dark-neutral palettes; radius scale; motion; site utilities (`text-logo`, `glass-*`, `safe-area-*`, `bg-glass-gradient`); keyframes |
| `src/app/layout.tsx` | Geist / Geist Mono / Season Sans, `<html class="dark">`, `<body class="palette-neutral">` |
| `src/app/(app)/` | One route per sidebar page inside the app shell; `settings/*` sub-pages are title-only placeholders |
| `src/components/app/` | Sidebar (menus, ⌘K palette, 64px rail, drag-resize), app frame, brand marks |
| `src/components/composer/` | Composer and its four menus |
| `src/components/<page>/` | Page components; `resources/` holds the shared page-heading and empty-state pieces |
| `src/components/ui/` | shadcn primitives matched to the site's classes |
| `src/lib/mock/` | All data (static) |
| `public/img/` | Downloaded covers, logos, avatars |
| `src/design/brand/` | Brand token sheet (`brand.css`, scoped under `.theme-brand`), fonts, font loaders, the brand's own shadcn primitives (reference only), `README.md` with the token mapping table |
| `src/app/design/brand/` | Swatch page at `/design/brand` (light/dark toggle, every ramp and token) |
| `docs/brand/` | `design.md` (how to consume the brand tokens) and `brand-style-audit.md` (raw measurements) |
| `scripts/brand/` | `gen-ramps.mjs`, `check-contrast.mjs` |

## Known gaps in the clone

All documented in code comments; none block phase 2.

- Invented, because the live account never showed them: thread grid and board
  layouts; a few menu sub-panels (memories and assets pickers, project
  sub-lists); the expanded learning row; the open state of select menus.
- The home quick-action chips are static. `Composer` has no prop to prefill
  text or to tint the send button; the thread page overrides two CSS variables
  around it instead. Adding `initialValue` / `accentStyle` props is the fix.
- Routes the site links to but this clone lacks (billing details, licenses,
  agent wizard, command center, marketplace listing pages) point at the
  nearest page or are inert.
- The referral banner that appeared in the live sidebar later in the day is
  not cloned. Only the desktop 1456-wide layout was verified; responsive
  classes are carried over but untested.
- `src/design/brand/ui/chart.tsx` was not copied (needs `recharts`).

## Phase 2: the brand re-skin

Both token systems use the shadcn variable names, and Tailwind v4 utilities
resolve through `var(--…)`, so the re-skin is a rewiring job, not a rewrite.
Suggested order:

1. **Instant first cut.** Add `theme-brand` to `<body>` in `src/app/layout.tsx`
   and put `brandFontClassName` (from `src/design/brand/fonts.ts`) on `<html>`.
   `src/app/design/brand/layout.tsx` already imports `brand.css`; move that
   import to the root layout. Screenshot every page: this alone swaps
   backgrounds, text, borders, radii and the Inter body face.
2. **Bridge the brand-only names.** Add an `@theme inline` block to
   `src/app/globals.css` that maps brand-only tokens to utilities
   (`--color-tangerine-*`, `--color-tint-*`, `--color-brand`, `--color-chip`,
   `--color-surface-secondary`, `--color-foreground-low`,
   `--color-border-subtle`, `--font-heading`, `--font-weight-book/firm`,
   `--ease-out-quart/expo`, the extra radii and shadows). The list and the
   two Tailwind caveats (shadows inline at build time; `text-*` companions)
   are in `src/design/brand/README.md`, section "What does not work until
   phase 2". `docs/brand/design.md` explains what each token is for.
3. **Rewire components page by page**, shell first: sidebar → composer → home
   → thread → resources → settings. The brand language per `docs/brand/design.md`:
   paper-white canvas (dark stays available), sand neutrals, one tangerine
   accent used sparingly, ink primary button, pill chips and tabs, 10px base
   radius with 22–32px cards, tint fills instead of solid greys, glass
   elevation, PythiaType for display headings, Inter for everything else.
   Where the Hyperagent layout and the brand language disagree (Hyperagent's
   8px nav radius vs the brand's pills, its 14px radius vs 10px), the brand
   wins; keep the layout, change the skin.
4. **Gate it.** `npm run brand:check-contrast` must stay green; the swatch
   page at `/design/brand` is the visual reference. Consider porting the
   token-lint idea from the brand README (no raw hex / stock palette classes
   in components) once the rewiring is done.
5. **Keep a switch** while iterating: leave the Hyperagent tokens in place and
   toggle `theme-brand` on `<body>` for side-by-side comparison; remove the
   Hyperagent palettes only when the re-skin is signed off.

For parallel work, reuse the phase-1 pattern: branch per page group in git
worktrees, each owning its paths, `docs/clone-conventions.md` as the contract
(adapt rule 1 to allow shell edits on one designated branch), merge with
`--no-ff`, verify with build + lint + tsc + contrast after each merge.

## Naming rule

Inside this repo the token system is called **brand** everywhere: paths,
identifiers, docs, commit messages. The history was rewritten on 2026-09-06 to
enforce that; keep it so.

## Commit conventions

Conventional messages (`feat(<page>): …`, `fix(shell): …`, `docs: …`), author
`Karthik Sivacharan <karthicksivacharan@gmail.com>`, ending with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and a
`Claude-Session:` trailer for the session that made the change.

## Prompt to start the next session

> Read HANDOFF.md, README.md and docs/clone-conventions.md in
> ~/Projects/hyperagent. Phase 1 (pixel clone of hyperagent.com) is merged on
> main. Start phase 2: apply the brand design language from src/design/brand
> to the whole app, following the "Phase 2" section of HANDOFF.md. Do step 1
> first and show me screenshots of every page before rewiring anything.
