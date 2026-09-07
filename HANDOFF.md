# Handoff

Written 2026-09-07 at the end of phase 2. Read this first in a new session,
then `README.md`, `docs/brand/reskin-conventions.md` and
`docs/clone-conventions.md`.

## Where things stand

- **Phase 1 is complete:** a pixel-faithful clone of the hyperagent.com
  dashboard (every left-sidebar page plus the shell overlays).
- **Phase 2 is complete and merged.** `main` renders the same layout in the
  brand design language: paper-white canvas with a dark mapping, sand
  neutrals, one tangerine accent, ink buttons, pills, tint fills, hairline
  separation, glass elevation, PythiaType display headings over Inter. There
  is one branch (`main`), no remote, no open worktrees, and a clean tree.
- Verification at the last commit: `npx tsc --noEmit`, `npm run lint` (no
  warnings), `npm run build`, `npm run brand:check-contrast` (WCAG AA, both
  themes) and `npm run brand:lint-tokens` (zero findings) all pass. Every
  route was screenshotted at 1456×868 in light and dark and reviewed; the
  account menu, theme switch, ⌘K palette and composer menus were checked in
  the browser.

```bash
npm install
npm run dev            # http://localhost:3000 → /threads/new
npm run build && npm run lint && npx tsc --noEmit
npm run brand:check-contrast && npm run brand:lint-tokens
node scripts/dev/screenshot-pages.mjs out/ http://localhost:3000   # every route, light + dark
node scripts/dev/contact-sheet.mjs out/light out/sheet-light.png "main"
```

## How the brand is wired

- `src/design/brand/brand.css` is the single source of truth for the tokens
  (every primitive ramp, semantic token, radius, shadow, type and motion
  value), scoped under `.theme-brand`, which `src/app/layout.tsx` puts on
  `<body>`. The dark mapping is `.dark .theme-brand`; `next-themes` sets
  `dark` on `<html>` from the account menu's Theme item (light is the
  default, system follows the OS, the choice persists in localStorage).
- `src/app/globals.css` carries the "PHASE 2 BRIDGE": an `@theme inline
  reference` block that names every brand-only token (`--color-tint-10:
  var(--tint-10)` and so on) so Tailwind emits utilities such as
  `bg-tint-10`, `text-foreground-low`, `font-book`, `rounded-5xl`,
  `shadow-card`, `gap-group`, `ease-out-quart`; nothing is re-emitted on
  `:root`. A `.theme-brand` block below it remaps the Hyperagent-only tokens
  the brand never defines (the canvas gradient, `--surface`, `--glow`, the
  `*-active` font indirection), so `bg-glass-gradient`, `font-display` and
  `text-logo` follow the brand without touching components.
- `src/lib/utils.ts` is the brand's `cn()`: tailwind-merge extended with the
  `font-book` / `font-firm` weights and with the typography role classes
  (`text-label-12-caps` …) registered as their own group, because
  tailwind-merge otherwise reads them as text colours and drops them.
- The Hyperagent palettes are still in `globals.css` for side-by-side
  comparison (plan step 5). Swap `theme-brand` for `palette-neutral` on
  `<body>` and pick Dark to see the phase-1 clone.

## How phase 2 was done (so the pattern can be reused)

1. `theme-brand` on `<body>` in place of `palette-neutral` (the two cannot
   coexist: `.dark body.palette-neutral` outranks `.dark .theme-brand`), the
   pinned `dark` removed, the brand font variables on `<html>`, `brand.css`
   imported once by the root layout.
2. The token bridge above, verified by grepping the built CSS for each
   utility.
3. Shell first, on `phase2-shell`: the 23 primitives in `src/components/ui`
   (same variant and size API as phase 1, the phase-1 heights kept so
   layouts do not move), the sidebar, the composer, the menus, the palette,
   the theme switch.
4. Five page branches in parallel git worktrees (`phase2-home`,
   `phase2-thread`, `phase2-resources`, `phase2-resources-cards`,
   `phase2-settings`), each owning its paths, following
   `docs/brand/reskin-conventions.md`, verified with the four gates and both
   themes, merged into `main` with `--no-ff`, gates re-run after every merge.
5. `scripts/brand/lint-tokens.mjs` as the gate that keeps components on the
   tokens; `scripts/dev/screenshot-pages.mjs` for the visual pass.

## Design decisions worth knowing

- **Keep the layout, change the skin.** Element trees, copy, icon sizes,
  spacing and control heights are the phase-1 metrics; only colours, radii,
  borders, shadows, type and motion changed. The composer text stays 14px.
- **One accent per view.** The composer's send arrow is the solid tangerine
  action; the "Set up your agent" chip and the Profile settings tile are the
  tinted brand surface; selected checks in menus and the usage ring are
  `brand-accent`. The Plan pill is ink, the user chat bubble is the brand's
  tangerine bubble with white text.
- **Group labels are caps on the third tier** (sidebar sections, settings
  groups, palette headings, "Featured"), titles and card names are in the
  display face, running copy on `muted-foreground`, meta on `foreground-low`.
- **Status only as dots or tinted chips** (the Live dot, the inbox check,
  thumbs-up hover, the swipe-to-archive sheet); no pastel decoration.
- **Imagery keeps its colours:** logos, agent orbs, cover art, the
  marketplace collage and listing thumbnails; the marketplace hero itself
  became the brand's sunken hero backdrop.

## Repo map

| Path | What |
|---|---|
| `src/app/globals.css` | Hyperagent tokens (kept for comparison), the phase-2 bridge, the `.theme-brand` remap, site utilities, keyframes |
| `src/app/layout.tsx` | All fonts, `theme-brand` on `<body>`, the next-themes and tooltip providers |
| `src/app/(app)/` | One route per sidebar page inside the app shell |
| `src/components/app/` | Sidebar (menus, ⌘K palette, rail, drag-resize), app frame, account menu with the theme switch, brand marks |
| `src/components/composer/` | Composer and its four menus |
| `src/components/<page>/` | Page components; `resources/` holds the shared heading, search and empty-state pieces |
| `src/components/ui/` | shadcn primitives in the brand skin (pills, tints, hairlines, glass), phase-1 API |
| `src/lib/mock/` | All data (static) |
| `src/design/brand/` | `brand.css`, fonts and loaders, the brand's own primitives (reference only), `README.md` with the token mapping |
| `src/app/design/brand/` | Swatch page at `/design/brand` |
| `docs/brand/` | `design.md` (the brand language), `reskin-conventions.md` (the phase-2 contract), the style audit |
| `docs/clone-conventions.md`, `docs/reference/` | The phase-1 contract and the captured ground truth |
| `scripts/brand/` | `gen-ramps.mjs`, `check-contrast.mjs`, `lint-tokens.mjs` |
| `scripts/dev/` | `screenshot-pages.mjs`, `contact-sheet.mjs` (headless Chrome over the DevTools protocol, no dependencies) |

## Known gaps and follow-ups

- The phase-1 gaps still apply (invented grid and board layouts, a few
  menu sub-panels, the referral banner, routes the site links to but the
  clone lacks).
- Plan step 5 is open: once the re-skin is signed off, remove the Hyperagent
  palettes (`:root`, `.dark`, `.dark body.palette-neutral`) and the
  `palette-neutral` switch from `globals.css`, drop the Geist and Season
  Sans loaders from `layout.tsx` (the brand does not use them; the
  `font-display` indirection already points at PythiaType), and let the
  primitives leave the `.theme-brand` scope.
- Only the desktop 1456-wide layout was verified. Responsive classes were
  carried over and in places adjusted (the threads and home lists), but the
  phone layout is untested.
- `src/lib/mock/` still carries fields nothing reads any more
  (`conversation.ts` `accent`, the settings cards' `gradient`,
  `marketplaceHero.background`); prune when the data is next touched.
- The swatch page consumes tokens through `bg-(--chip)`-style arbitrary
  values from before the bridge; it could use the plain utilities now.
- A `TooltipTrigger asChild` around a `ToggleGroupItem` overwrites radix's
  `data-state`; the toggle primitives style the on-state from `aria-checked`
  and `aria-pressed` as well, which covers it either way round.
- `Composer` still has no `initialValue` / `accentStyle` props (phase-1 note);
  the thread page no longer needs the variable override it used to apply.

## Naming rule

Inside this repo the token system is called **brand** everywhere: paths,
identifiers, docs, commit messages. The history was rewritten on 2026-09-06 to
enforce that; keep it so.

## Commit conventions

Conventional messages (`feat(<page>): …`, `fix(shell): …`, `docs: …`), author
`Karthik Sivacharan <karthicksivacharan@gmail.com>`, ending with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and a
`Claude-Session:` trailer for the session that made the change. Page work
runs as one branch per page group in git worktrees, merged with `--no-ff`,
gates re-run after each merge.

## Prompt to start the next session

> Read HANDOFF.md, README.md and docs/brand/reskin-conventions.md in
> ~/Projects/hyperagent. Phases 1 and 2 are merged on main: the dashboard
> clone runs on the brand tokens in light and dark. Review every page at
> 1456×868 in both themes (scripts/dev/screenshot-pages.mjs) and list what
> still reads off-brand; then do plan step 5 from HANDOFF.md (retire the
> Hyperagent palettes and unused fonts) and a phone-width pass. Keep
> npm run brand:check-contrast and npm run brand:lint-tokens green.
