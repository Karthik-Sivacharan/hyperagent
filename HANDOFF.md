# Handoff

Written 2026-09-07 at the end of plan step 5 (the brand colour tokens are
the app's only palette) and updated the same day for the move to Tabler
icons and for the component system sweep. Read this first in a new
session, then `README.md`, `docs/components.md`,
`docs/brand/reskin-conventions.md`, `docs/brand/icons.md` and
`docs/clone-conventions.md`.

## Where things stand

- **Phase 1 is complete:** a pixel-faithful clone of the hyperagent.com
  dashboard (every left-sidebar page plus the shell overlays).
- **Phase 2 is complete and merged.** `main` renders the same layout in the
  brand design language: paper-white canvas with a dark mapping, sand
  neutrals, one tangerine accent, ink buttons, pills, tint fills, hairline
  separation, glass elevation, Geist throughout on Vercel's typography
  roles (headings at the spec's 600, Geist Mono for identifiers).
- **Plan step 5 is complete and merged.** The brand tokens are the only
  palette: `brand.css` defines them on `:root` and `.dark`, the phase-1
  Hyperagent palettes and the comparison switch are gone, and a vitest
  suite locks the contract. Token values did not change; 32 of the 34
  route screenshots (17 routes, light and dark) are pixel-identical to the
  capture taken before the change, and the two that differ are the swatch
  page, whose header copy had to stop saying "scoped copy".
- **Icons are Tabler only (2026-09-07).** `@tabler/icons-react` replaced
  `lucide-react` in the 54 files that imported it (commit `8523a2c`, a
  ts-morph codemod), `lucide-react` is gone from the dependencies, decorative
  icons carry `aria-hidden="true"` explicitly, and
  `src/components/icons.test.ts` locks the rule. Same grid and stroke, so
  the layout did not move: at the merge all six gates pass and the 34 route
  screenshots differ from the pre-change capture only inside icon glyphs
  (0.03 to 0.08 percent of the pixels per page), the swatch page being
  pixel-identical in both themes. The convention is `docs/brand/icons.md`; see
  "Decided 2026-09-07: Tabler icons only" below.
- **The component system sweep is done (2026-09-07).** Every piece of UI
  is built from one component set in four tiers under `src/components/`
  (`docs/components.md`): `ui/` (29 primitives on the brand tokens, the
  only place `radix-ui` and `cmdk` are imported, every one with a
  `data-slot`), `patterns/` (the four cross-page composites, formerly
  `resources/`), the shell (`app/`, `composer/`) and the page components,
  which hold no raw control. Nine commits on the `component-system`
  branch, plus this docs commit: the plan; six new primitives (`select`,
  `checkbox`, `label` from the shadcn CLI, `overline`, `icon-tile`,
  `nav-item` by hand) and the variants the pages needed (`Button` tint /
  pill / icon-2xs / none, `Card` asChild / size none / interactive,
  `Input` and `Textarea` bare, `ScrollArea` viewport props, `Switch` sm),
  with `cn()` learning the brand shadows and radii; the `resources/` to
  `patterns/` rename; 42 overlay captures from a live sweep of
  hyperagent.com; the select indicator slot; three migration commits
  (the shell; home, thread and threads; the resource, settings and
  marketplace pages) that replaced every raw control outside `ui/` (the
  `asChild` child in option-cards is the one kept), the four hand-built
  radix compositions and the eleven hand-written card shells with the
  primitives; the caps fix below. The prototype's verbatim component
  copies (`src/design/brand/ui/`, `utils.ts`) are deleted and stay in git
  history. `npm test` now includes `src/components/components.test.ts`
  (5 files, 39 tests), which locks the rules and checks that every
  `data-slot` in the reference dumps (57) has a local definition; at the
  end of the docs task tsc, lint, the token lint and vitest pass. Pixel
  proof: every route is pixel-identical to the pre-sweep baseline at
  1456×868, light and dark, except for the one deliberate change, the
  sidebar group headers Agents and Recent threads taking the brand's caps
  role like Resources (commit `572a136`), which shows on every route.
- There is one branch (`main`); `origin`
  (github.com/Karthik-Sivacharan/hyperagent, private) has everything up to
  the Tabler move, the component sweep is local until pushed; no open
  worktrees, and a clean tree.
- Verification at the end of step 5: `npx tsc --noEmit`, `npm run lint` (no
  warnings), `npm run build` (29 routes), `npm run brand:check-contrast`
  (WCAG AA, 64 pairs per theme, zero skipped), `npm run brand:lint-tokens`
  (zero findings) and `npm test` (3 files, 22 tests) all pass.

```bash
npm install
npm run dev            # http://localhost:3000 → /threads/new
npm run build && npm run lint && npx tsc --noEmit
npm run brand:check-contrast && npm run brand:lint-tokens && npm test
node scripts/dev/screenshot-pages.mjs out/ http://localhost:3000   # every route, light + dark
node scripts/dev/contact-sheet.mjs out/light out/sheet-light.png "main"
```

## How the brand is wired

- `src/design/brand/brand.css` is the single source of truth for the tokens
  (every primitive ramp, semantic token, radius, shadow, type and motion
  value). Primitives and the light semantics are one `:root { }` rule; the
  dark mapping is `.dark { }`, which must stay after `:root` in the file
  (equal specificity on `<html>`, so source order decides). `next-themes`
  sets `dark` on `<html>` from the account menu's Theme item (light is the
  default, system follows the OS, the choice persists in localStorage).
  `<body>` carries no theme class. Base styles sit on `html`, `body` and
  `*`; the typography role classes (`text-heading-display`,
  `text-heading-lg`, `text-label-14-mono`, `text-label-12-mono`,
  `text-label-12-caps`), `focus-ring`, `squircle`, `skeleton` and the
  `genui-prose` block are plain, unprefixed classes inside the
  `@layer utilities` / `@layer components` wrappers, so utilities still win.
- `src/app/globals.css` owns no colour. It carries the Tailwind imports, the
  `@theme inline` block (the shadcn contract, the Hyperagent extras, the
  radius offsets that coincide with the brand scale at `--radius: 10px`, the
  site's `animate-*` names), the "PHASE 2 BRIDGE" (an `@theme inline
  reference` block naming every brand-only token, `--color-tint-10:
  var(--tint-10)` and so on, so `bg-tint-10`, `text-foreground-low`,
  `font-strong`, `rounded-5xl`, `shadow-card`, `gap-group`,
  `ease-out-quart` exist app-wide without re-emitting anything on `:root`),
  a small `:root` block that maps the Hyperagent-only names the site
  utilities still read (`--bg-gradient-*`, `--surface`, `--pending`,
  `--glow`, `--shimmer-sweep`, `--sidebar-fade`, `--motion-*`, `--glass-*`)
  onto brand tokens plus the banner-stack and dialog-height variables, the
  base layer, the site utilities (`text-logo`, `bg-glass-gradient`,
  `glass-panel`, `scrollbar-hide`, the safe-area helpers) and keyframes. The
  six `--font-*` names in `@theme inline` point straight at
  `--font-geist-sans` / `--font-geist-mono`.
- `src/lib/utils.ts` is the brand's `cn()`: tailwind-merge extended with the
  `font-strong` weight (550) and with the typography role classes registered
  as their own group, because tailwind-merge otherwise reads them as text
  colours and drops them.
- `scripts/brand/check-contrast.mjs` parses `brand.css` by selector: the
  light block from `:root { }`, the dark block from `.dark { }` (regexes
  anchored to a line start, capturing to the first line that is just `}`).
- `npm test` runs vitest (4.x, node environment, no DOM):
  `src/design/brand/brand.test.ts` asserts the `:root` / `.dark` shape,
  that `.dark` only re-maps, that every token in the contrast gate's `PAIRS`
  resolves in both themes, the GenUI tokens and classes, and the colour
  rules (`--primary` ink, `--brand` tangerine-600, `--brand-accent` 500 /
  400, `--ring` following it); `src/app/globals.test.ts` asserts globals.css
  has no palette, no scope class, no `*-active` indirection, and that every
  bridge entry points at a token brand.css declares;
  `src/lib/utils.test.ts` covers `cn()`; `src/components/icons.test.ts`
  asserts that no `.ts` / `.tsx` under `src/` imports `lucide-react`, that
  `@tabler/icons-react` is in `dependencies` and `lucide-react` in no
  dependency block, and that every name imported from `@tabler/icons-react`
  is one the installed package exports (the `TablerIcon`, `Icon` and
  `IconProps` types included); `src/components/components.test.ts`
  asserts the component rules: `radix-ui` and `cmdk` only under `ui/`, no
  raw control outside `ui/` (the rendered element of an `asChild`
  primitive and the swatch page's three motion specimens excepted), the
  prototype copies absent, every `data-slot` in the reference dumps
  defined under `ui/` or `patterns/`, every primitive naming a slot.
  vitest 5 wants `@types/node ^22` and the repo
  pins `^20`, hence 4.x.
- The phase-1 skin exists only in history: `c10d36c` is the last commit that
  carries the Hyperagent palettes; `docs/reference/` keeps the captured
  ground truth.

## How phase 2 was done (so the pattern can be reused)

1. The brand sheet went on `<body>` under a scope class in place of the
   site's `palette-neutral`, the pinned `dark` was removed, the brand font
   variables went on `<html>`, `brand.css` was imported once by the root
   layout. (Step 5 later removed the scope class; see below.)
2. The token bridge above, verified by grepping the built CSS for each
   utility.
3. Shell first, on `phase2-shell`: the 23 primitives in `src/components/ui`
   (same variant and size API as phase 1, the phase-1 heights kept so
   layouts do not move), the sidebar, the composer, the menus, the palette,
   the theme switch.
4. Five page branches in parallel git worktrees (`phase2-home`,
   `phase2-thread`, `phase2-resources`, `phase2-resources-cards`,
   `phase2-settings`), each owning its paths, following
   `docs/brand/reskin-conventions.md`, verified with the gates and both
   themes, merged into `main` with `--no-ff`, gates re-run after every merge.
5. `scripts/brand/lint-tokens.mjs` as the gate that keeps components on the
   tokens; `scripts/dev/screenshot-pages.mjs` for the visual pass.

## How step 5 was done (2026-09-07)

- Three worktrees under `.claude/worktrees/` (git-ignored; `eslint.config.mjs`
  ignores `.claude/**` and TypeScript's `**/*.ts` glob skips dot-directories,
  so worktrees never leak into `main`'s gates), one agent each, with a brief
  stating the exact after-state:
  - `step5-tokens`: `brand.css` `.theme-brand` → `:root`, `.dark .theme-brand`
    → `.dark`, prefixes dropped from the layered blocks; `globals.css`
    palettes and `*-active` lines deleted and the remap block folded into
    `:root`; `layout.tsx` body class removed; `check-contrast.mjs` and the
    `gen-ramps.mjs` comment repointed; the swatch page wrapper paints
    `bg-background text-foreground` itself and keeps its local `dark`.
  - `step5-docs`, in parallel: `README.md`, `docs/brand/design.md`,
    `src/design/brand/README.md`.
  - `step5-tests`, after the first two merged: vitest and the three test
    files, each shown red against a deliberate break before green.
- Proof nothing moved: every `--token: value` declaration in `brand.css` was
  diffed before and after (identical); the contrast report was byte-identical
  apart from the selector labels; all routes were screenshotted before and
  after with `scripts/dev/screenshot-pages.mjs` and compared pixel by pixel
  (pngjs + pixelmatch in a scratch directory). The capture is deterministic:
  two captures of the same commit were identical on all 34 pages, so any
  differing pixel is a real change. Headless Chrome reports a dark OS
  preference, so `/design/brand` (whose local toggle defaults to the OS)
  renders dark in both captures; consistent, harmless.
- Merged with `--no-ff`, worktrees removed, branches deleted, gates re-run on
  `main`.

## How the component sweep was done (2026-09-07)

- One worktree (`component-system`, dev server on :3001), a plan file with
  file ownership per task (`docs/plans/2026-09-07-component-system-sweep.md`)
  and a baseline capture of all 17 routes, light and dark, before any edit.
- Phase 1, two read-only audits in parallel: a live sweep of hyperagent.com
  with BrowserOS neo (every menu, dialog, select, toggle and populated
  state; 42 new dumps under `docs/reference/overlays/`) and a local audit
  of the component set (every primitive, every `data-slot` in the dumps,
  every raw control and hand-built radix composition, every repeated class
  pattern, with the exact primitive and variant that renders each one
  identically).
- Phase 2, one agent per task with disjoint paths and the orchestrator
  committing by path: the primitives first (additive only, no importer
  yet, so no pixel moves), then three migration buckets in parallel (the
  shell; home, thread and threads; the rest), each screenshotting its
  routes against the baseline, then the docs and the vitest lock, each
  rule shown red against a fixture before green.
- Phase 3, the orchestrator: the six gates, the full pixel diff, the
  `--no-ff` merge.

## Design decisions worth knowing

- **Keep the layout, change the skin.** Element trees, copy, icon sizes,
  spacing and control heights are the phase-1 metrics; only colours, radii,
  borders, shadows, type and motion changed. The composer text stays 14px.
- **One accent per view.** The composer's send arrow is the solid tangerine
  action; the "Set up your agent" chip and the Profile settings tile are the
  tinted brand surface; selected checks in menus and the usage ring are
  `brand-accent`. The Plan pill is ink, the user chat bubble is the brand's
  tangerine bubble with white text. The primary button is ink (`--primary` =
  neutral-950 light / neutral-100 dark), never orange; `--brand`
  (tangerine-600) is the only text-bearing orange fill, `--brand-accent`
  (tangerine-500, lifted to 400 in dark) is for rings, icons, selection and
  graphics, `--brand-subtle` (tangerine-50 / 950) is the tinted surface.
  `brand.test.ts` now asserts these values.
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
| `src/app/globals.css` | Tailwind theme wiring, the phase-2 bridge, the `:root` remap of Hyperagent-only names onto brand tokens, base layer, site utilities, keyframes; no palette |
| `src/app/globals.test.ts` | vitest: globals.css owns no colour, every bridge entry has a target in brand.css |
| `src/app/layout.tsx` | Geist and Geist Mono on `<html>`, `<body className="antialiased">`, the next-themes and tooltip providers |
| `src/app/(app)/` | One route per sidebar page inside the app shell |
| `src/components/app/` | Sidebar (menus, ⌘K palette, rail, drag-resize), app frame, account menu with the theme switch, brand marks |
| `src/components/composer/` | Composer and its four menus |
| `src/components/patterns/` | Composites of primitives used by two or more pages: `PageHeading`, `SearchInput`, `EmptyState`, `ShowArchivedSwitch` |
| `src/components/<page>/` | Page components: layout, data wiring and composition of `ui/` and `patterns/`; never a raw control |
| `src/components/ui/` | 29 shadcn primitives in the brand skin (pills, tints, hairlines, glass), phase-1 API; the only place `radix-ui` and `cmdk` are imported; every one carries a `data-slot` |
| `src/components/icons.test.ts` | vitest: no lucide import under `src/`, Tabler in the dependencies, every imported icon name exists |
| `src/components/components.test.ts` | vitest: the component rules and the `data-slot` lock (`docs/components.md` §1) |
| `src/lib/mock/` | All data (static) |
| `src/lib/utils.ts`, `utils.test.ts` | The brand's `cn()` and its tests |
| `src/design/brand/` | `brand.css` (the app's token sheet), `brand.test.ts`, the Geist loaders, `README.md` with the wiring and the phase-2 mapping table |
| `src/app/design/brand/` | Swatch page at `/design/brand` with its own local light/dark toggle |
| `docs/brand/` | `design.md` (the brand language), `reskin-conventions.md` (the phase-2 contract), `icons.md` (Tabler only, the lucide-to-Tabler names), the style audit |
| `docs/components.md` | The component system: tiers, rules, the component map with live evidence, how to add a component, the live UI the clone lacks |
| `docs/plans/` | Implementation plans, one file per sweep, the boxes ticked as the work landed |
| `docs/clone-conventions.md`, `docs/reference/` | The phase-1 contract and the captured ground truth (`pages/` per route, `overlays/` per menu, dialog, popover and populated state) |
| `scripts/brand/` | `gen-ramps.mjs`, `check-contrast.mjs`, `lint-tokens.mjs` |
| `scripts/dev/` | `screenshot-pages.mjs`, `contact-sheet.mjs` (headless Chrome over the DevTools protocol, no dependencies) |
| `vitest.config.mts` | node environment, `src/**/*.test.ts` |

## Decided 2026-09-07: no display face; Geist on Vercel's Geist roles

The user closed the display-face question: Geist and Geist Mono only, as
Vercel's Geist design system specifies. The type tokens were then audited
against the live spec (vercel.com/geist/typography, read in the browser the
same day) and tightened:

- The published heading roles (`text-heading-72` … `text-heading-14`) all
  compute to **600**; labels and copy to 400, buttons to 500, `<strong>`
  inside copy to 550, `<strong>` inside a label to 500. The brand's earlier
  450 heading weight was not the spec: vercel.com's marketing site sets its
  56px section headings at 450 and its hero at 400. The dashboard follows
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
  `--font-weight-bold` are gone; `npm run brand:lint-tokens` rejects
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
  June, the only serif-heading precedents are the brand prototype (PythiaType
  over Inter, Newsreader fallback) and the Wajo product.

The caps group labels (`text-label-12-caps`) stay: Vercel's own Label 12
role carries an "AND CAPS" variant for tertiary text in busy views.

## Decided 2026-09-07: Tabler icons only

The user closed the icon question the same day: from now on this repo uses
Tabler icons (`@tabler/icons-react`) and nothing else, no `lucide-react`, no
second set for a glyph Tabler lacks. The convention is `docs/brand/icons.md`;
`AGENTS.md`, `README.md`, `docs/clone-conventions.md` and
`docs/brand/reskin-conventions.md` point at it.

- **Why.** One library, so stroke weights and corner radii match across a
  view; a larger set, with a filled variant for most glyphs, so a starred or
  selected state has a real icon instead of a CSS fill; the same 24-unit
  grid, 2px stroke and round caps as lucide, so the swap changed no size, no
  spacing and no layout.
- **What changed.** Commit `8523a2c`: a ts-morph codemod (language-service
  renames) over the 54 files that imported `lucide-react`. Its message
  counts 251 import renames, 73 names by adding the `Icon` prefix and 41
  through a lucide-to-Tabler name map (now the table in
  `docs/brand/icons.md`), plus `LucideIcon` to `TablerIcon`, `strokeWidth`
  to `stroke` on the three sites that set a custom weight, and an explicit
  `aria-hidden="true"` on the 35 decorative icons lucide used to hide on its
  own (Tabler adds nothing). `lucide-react` left the dependencies. A hand
  review after the codemod (three agents, one per page group, each glyph
  checked against the lucide original side by side) changed twelve names:
  Bot to `IconRobotFace` (head only, like lucide's), Shapes to
  `IconTriangleSquareCircle`, ListFilter to `IconFilter2`, ArrowRightLeft to
  `IconArrowsRightLeft`, PenTool to `IconBrush`, and seven prefix names whose
  Tabler namesake draws a different picture (Menu to `IconMenu2`, Settings2
  to `IconAdjustmentsHorizontal`, Globe to `IconWorld`, Volume2 to
  `IconVolume`, Network to `IconSitemap`, ChartColumn to `IconChartBar`,
  Grid3x3 to `IconLayoutGrid`). The table in `docs/brand/icons.md` is the
  final map. The DOM
  dumps still show the site's `lucide-<name>` classes and stay the ground
  truth for which icon a page uses.
- **What did not change.** `components.json` keeps `"iconLibrary":
  "lucide"` because shadcn's CLI supports only lucide, radix, hugeicons and
  phosphor; anything `shadcn add` emits therefore imports `lucide-react` and
  must be converted before it is committed. Next 16 has
  `@tabler/icons-react` in its default `optimizePackageImports`, so no
  config was needed for per-icon imports.
- **The gate.** `src/components/icons.test.ts`, in `npm test`, fails if any
  `.ts` / `.tsx` under `src/` imports `lucide-react`, if `lucide-react` sits
  in any dependency block or `@tabler/icons-react` is missing from
  `dependencies`, or if a name imported from `@tabler/icons-react` is not one
  the installed package exports. At the merge: tsc, lint (no
  warnings), build, contrast (WCAG AA, 64 pairs per theme), token lint and
  vitest (4 files, 29 tests) pass; the 17 routes captured light and dark at
  1456×868 differ from the pre-change capture only inside icon glyphs (0.03
  to 0.08 percent of the pixels per page), and the swatch page is
  pixel-identical in both themes.

## Decided 2026-09-09: the heading cut stays the spec

The user compared the spec's heading setting (600, Vercel's tracking) with a
quieter cut (500, no tracking, the setting several Geist dashboards use) on
six routes side by side, via a switchable override block on a trial branch,
and chose the spec: the lighter, untracked headings read worse in the
dashboard. The trial branch was deleted; nothing on `main` changed. The
`--font-weight-heading` knob and the `--text-*--letter-spacing` tokens remain
the place to revisit this, and the handoff should not reopen the question
without a new reason.

## Known gaps and follow-ups

- The phase-1 gaps still apply (invented grid and board layouts, a few
  menu sub-panels, the referral banner, routes the site links to but the
  clone lacks).
- Only the desktop 1456-wide layout was verified. Responsive classes were
  carried over and in places adjusted (the threads and home lists), but the
  phone layout is untested. This is the natural next step.
- `src/lib/mock/` still carries fields nothing reads any more
  (`conversation.ts` `accent`, the settings cards' `gradient`,
  `marketplaceHero.background`); prune when the data is next touched.
- The swatch page consumes tokens through `bg-(--chip)`-style arbitrary
  values from before the bridge; it could use the plain utilities now.
- Live UI grown since the 2026-09-06 capture that the clone does not render
  (the Starred sidebar group, star toggles and project tags on thread rows,
  generated grid covers, Execute on the composer pill, the integrations
  sub-menus, the referral chip, the whole thread-detail layer, the populated
  states of the resource pages): the list with the dump for each is
  `docs/components.md` §4. `RadioGroup` and `Progress` are the only shadcn
  primitives those features need that `ui/` lacks.
- Two inconsistencies left to the design owner because fixing them moves
  pixels: the 36px toolbar buttons and the pressed chips are spelled with
  two paddings, two gaps and two tint strengths across threads, memories,
  agents, skills and library; the hover-revealed card actions and the
  scroll-to-bottom pill use three glass fills (`docs/components.md` §5).
- `components.json` says `"iconLibrary": "lucide"` because the shadcn CLI
  has no Tabler option. Output of `shadcn add` imports `lucide-react`; convert
  it to Tabler by hand (`docs/brand/icons.md`) and let `npm test` confirm.
- `docs/brand/design.md` §15 says `.genui-prose` is "see globals.css"; it
  lives in `brand.css`.
- The brand prototype also has a copy lint (a script plus a vitest file
  that fail on AI-writing tells in rendered copy). Not ported; worth it if
  the mock copy is ever rewritten.
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

Conventional messages (`feat(<page>): …`, `fix(shell): …`, `refactor(theme):
…`, `test: …`, `docs: …`), author `Karthik Sivacharan
<karthicksivacharan@gmail.com>` (pass `-c user.name="Karthik Sivacharan"`;
the repo config has the hyphenated GitHub name), ending with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and a
`Claude-Session:` trailer for the session that made the change. Parallel work
runs as one branch per concern in git worktrees under `.claude/worktrees/`,
merged with `--no-ff`, gates re-run after each merge, worktrees and branches
removed afterwards.

## Prompt to start the next session

> Read HANDOFF.md, README.md, docs/components.md, docs/brand/design.md and
> docs/brand/reskin-conventions.md in ~/Projects/hyperagent. Phases 1 and 2,
> plan step 5 and the component system sweep are merged on main (push if
> origin is behind): the dashboard clone runs on the brand tokens as its
> only palette, light and dark, in Geist and Geist Mono on Vercel's Geist
> roles, with Tabler as the only icon set (docs/brand/icons.md), and every
> piece of UI is built from the primitives in src/components/ui and the
> composites in src/components/patterns (page files hold no raw control;
> npm test locks it), with six gates (tsc, lint, build,
> brand:check-contrast, brand:lint-tokens, test). Do the phone-width pass:
> verify every route at 390×844 in light and dark with
> scripts/dev/screenshot-pages.mjs (add a viewport option), fix layout that
> breaks using only the brand tokens and the existing primitives (add a
> primitive per docs/components.md §3 if one is missing), keep the
> 1456-wide screenshots pixel-identical (capture before you start and
> compare after), and prune the unread mock fields listed in the handoff.
> Commit on main with the trailers in HANDOFF.md and push.
