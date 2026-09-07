# Handoff

Written 2026-09-07 at the end of phase 2, after the type swap to Geist and
the type-token audit against Vercel's Geist spec. Read this first in a new
session,
then `README.md`, `docs/brand/reskin-conventions.md` and
`docs/clone-conventions.md`.

## Where things stand

- **Phase 1 is complete:** a pixel-faithful clone of the hyperagent.com
  dashboard (every left-sidebar page plus the shell overlays).
- **Phase 2 is complete and merged.** `main` renders the same layout in the
  brand design language: paper-white canvas with a dark mapping, sand
  neutrals, one tangerine accent, ink buttons, pills, tint fills, hairline
  separation, glass elevation, Geist throughout on Vercel's typography
  roles (headings at the spec's 600, Geist Mono for identifiers). There is
  one branch (`main`), pushed to `origin`
  (github.com/Karthik-Sivacharan/hyperagent, private), no open worktrees, and
  a clean tree.
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
  `bg-tint-10`, `text-foreground-low`, `font-strong`, `rounded-5xl`,
  `shadow-card`, `gap-group`, `ease-out-quart`; nothing is re-emitted on
  `:root`. A `.theme-brand` block below it remaps the Hyperagent-only tokens
  the brand never defines (the canvas gradient, `--surface`, `--glow`, the
  `*-active` font indirection), so `bg-glass-gradient`, `font-display` and
  `text-logo` follow the brand without touching components.
- `src/lib/utils.ts` is the brand's `cn()`: tailwind-merge extended with the
  `font-strong` weight (550) and with the typography role classes
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
  groups, palette headings, "Featured"), titles and card names take the
  600 heading weight from their `text-*` role, running copy sits on
  `muted-foreground`, meta on `foreground-low`.
- **Type is Geist** (swapped after the re-skin, at the user's request, from
  the prototype's Inter + PythiaType): the families, weights and size /
  leading / tracking roles follow Vercel's published typography system
  (`docs/brand/design.md` §4). No font files ship in the repo any more;
  both faces come from `next/font/google`.
- **Status only as dots or tinted chips** (the Live dot, the inbox check,
  thumbs-up hover, the swipe-to-archive sheet); no pastel decoration.
- **Imagery keeps its colours:** logos, agent orbs, cover art, the
  marketplace collage and listing thumbnails; the marketplace hero itself
  became the brand's sunken hero backdrop.

## Repo map

| Path | What |
|---|---|
| `src/app/globals.css` | Hyperagent tokens (kept for comparison), the phase-2 bridge, the `.theme-brand` remap, site utilities, keyframes |
| `src/app/layout.tsx` | Geist and Geist Mono, `theme-brand` on `<body>`, the next-themes and tooltip providers |
| `src/app/(app)/` | One route per sidebar page inside the app shell |
| `src/components/app/` | Sidebar (menus, ⌘K palette, rail, drag-resize), app frame, account menu with the theme switch, brand marks |
| `src/components/composer/` | Composer and its four menus |
| `src/components/<page>/` | Page components; `resources/` holds the shared heading, search and empty-state pieces |
| `src/components/ui/` | shadcn primitives in the brand skin (pills, tints, hairlines, glass), phase-1 API |
| `src/lib/mock/` | All data (static) |
| `src/design/brand/` | `brand.css`, the Geist loaders, the brand's own primitives (reference only), `README.md` with the token mapping |
| `src/app/design/brand/` | Swatch page at `/design/brand` |
| `docs/brand/` | `design.md` (the brand language), `reskin-conventions.md` (the phase-2 contract), the style audit |
| `docs/clone-conventions.md`, `docs/reference/` | The phase-1 contract and the captured ground truth |
| `scripts/brand/` | `gen-ramps.mjs`, `check-contrast.mjs`, `lint-tokens.mjs` |
| `scripts/dev/` | `screenshot-pages.mjs`, `contact-sheet.mjs` (headless Chrome over the DevTools protocol, no dependencies) |

## Decided 2026-09-07: no display face; Geist on Vercel's Geist roles

The user closed the display-face question: Geist and Geist Mono only, as
Vercel's Geist design system specifies. The type tokens were then audited
against the live spec (vercel.com/geist/typography, read in the browser the
same day) and tightened:

- The published heading roles (`text-heading-72` … `text-heading-14`) all
  compute to **600**; labels and copy to 400, buttons to 500, `<strong>`
  inside copy to 550, `<strong>` inside a label to 500. The brand's earlier
  450 heading weight was not the spec: vercel.com's marketing site sets its
  56px section headings at 450 and its hero at 400. The dashboard now follows
  the spec through one knob, `--font-weight-heading` (600), read by every
  heading role (`text-xl` and up, `text-display`, `text-heading-display`,
  `text-heading-lg`, prose headings). Set it to 450 to get the marketing cut
  back; the three inline `font-semibold` card titles in
  `src/components/settings/integration-card.tsx` would need a hand edit.
- Tracking and line-height already matched (the spec's px values in em:
  -0.06em at 40px and up, -0.04em at 24 and 32, -0.02em at 20 and below).
- `font-book` and `--font-weight-book` are gone (call sites moved to
  `text-heading-lg` or `font-semibold`); `font-strong` (550) is the brand's
  one custom weight utility, used for `<strong>` in prose; `--font-serif` and
  `--font-weight-bold` are gone; `npm run brand:lint-tokens` now rejects
  `font-thin/extralight/light/book/bold/extrabold/black/serif` in components.
- `--font-heading` stays as an alias of the sans: `font-heading` marks a
  heading and is the single line to change if a display face is ever
  reconsidered. Candidates recorded at the time, for the record: Figtree,
  Newsreader, Instrument Serif, Fraunces; the reference copy of Season Sans
  (hyperagent.com's own display face) stays in `docs/reference/fonts` for
  comparison only.
- Correction to the earlier survey: wajo.ai's landing page (the local
  `wajo-landing-page` repo) is set in STK Bureau Sans (self-hosted, Book 300)
  with Fragment Mono, not Figtree over Inter; the Wajo product uses DM Sans
  with DM Serif Display for headings. Across the other local projects since
  June, the only serif-heading precedents are delphi (PythiaType over Inter,
  Newsreader fallback) and the Wajo product.

The caps group labels (`text-label-12-caps`) stay: Vercel's own Label 12
role carries an "AND CAPS" variant for tertiary text in busy views.

## Next: plan step 5, the brand colour tokens become the only palette

Not started. Colour is currently defined twice, and the brand wins only by
scoping:

- `src/app/globals.css` still carries the phase-1 Hyperagent palettes: the
  warm light default on `:root`, the warm dark on `.dark` and the neutral
  dark on `.dark body.palette-neutral` (about 165 lines), plus the
  `--font-*-active` indirection on `:root` and in the `.theme-brand` remap
  block. They exist only so that swapping `theme-brand` for
  `palette-neutral` on `<body>` (`src/app/layout.tsx`) shows the phase-1
  clone for comparison.
- `src/design/brand/brand.css` defines every brand token under
  `.theme-brand` (47 scoped selectors) and its dark mapping under
  `.dark .theme-brand`, so it outranks the root palettes.

The step, now that the re-skin is signed off:

1. Delete the three palette blocks and the `--font-*-active` lines from
   `globals.css`; delete the comparison comment and the `theme-brand` class
   from `layout.tsx`.
2. In `brand.css`, move the light tokens from `.theme-brand` to `:root` and
   the dark mapping from `.dark .theme-brand` to `.dark`; drop the
   `.theme-brand` prefix from the base styles, the prose block and the role
   classes. The Hyperagent-only names the site utilities still read
   (`--bg-gradient-*`, `--surface`, `--glow`, `--shimmer-sweep`,
   `--sidebar-fade`, `--motion-*`, `--font-display` / `--font-ui` /
   `--font-body`) must keep a definition: fold the `.theme-brand` remap
   block in `globals.css` into `:root`, or point the utilities at the brand
   tokens directly.
3. `scripts/brand/check-contrast.mjs` parses `brand.css` by selector: it
   takes the light block with `block('\\.theme-brand')` and the dark block
   from `.theme-brand.dark, .dark .theme-brand`; point both at `:root` and
   `.dark` in the same change or the gate reads nothing. Update
   `docs/brand/design.md` §2 (how to consume tokens),
   `src/design/brand/README.md` (the "put `theme-brand` on an ancestor"
   paragraph and the bridge section) and `docs/brand/reskin-conventions.md`.
4. Gates: `npx tsc --noEmit`, `npm run lint`, `npm run build`,
   `npm run brand:check-contrast`, `npm run brand:lint-tokens`; then
   `node scripts/dev/screenshot-pages.mjs` against the dev server (one is
   usually already running on :3000) and a contact sheet against a set
   captured before the change. Nothing should move or change colour.

Colour rules to keep while doing it (`docs/brand/design.md` §3 and §12):
the primary button is ink (`--primary` = neutral-950 light / neutral-100
dark), not orange; tangerine is the accent and appears once per view.
`--brand` (tangerine-600) is the only text-bearing orange fill,
`--brand-accent` (tangerine-500, lifted to 400 in dark) is for rings,
icons, selection and graphics, `--brand-subtle` (tangerine-50 / 950) is
the tinted surface. Thirteen components use these today; the swatch page
at `/design/brand` shows every token in both themes.

## Known gaps and follow-ups

- The phase-1 gaps still apply (invented grid and board layouts, a few
  menu sub-panels, the referral banner, routes the site links to but the
  clone lacks).
- Plan step 5 is next; see the section above.
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

> Read HANDOFF.md, README.md, docs/brand/design.md (§2, §3, §12) and
> docs/brand/reskin-conventions.md in ~/Projects/hyperagent. Phases 1 and 2
> are merged on main and pushed to origin (private): the dashboard clone
> runs on the brand tokens in light and dark, in Geist and Geist Mono on
> Vercel's Geist roles; the type work is closed. Do plan step 5 from the
> handoff: make the brand colour tokens the only palette. Remove the
> Hyperagent palettes and the *-active font indirection from
> src/app/globals.css and the theme-brand comparison switch from
> src/app/layout.tsx; move the brand tokens in src/design/brand/brand.css
> from .theme-brand to :root and .dark; keep the primary button ink and
> tangerine as the single accent per view. Prove nothing moved: screenshot
> before you start, re-run npx tsc --noEmit, npm run lint, npm run build,
> npm run brand:check-contrast and npm run brand:lint-tokens, then
> screenshot again and compare. Commit on main with the trailers in
> HANDOFF.md and push.
