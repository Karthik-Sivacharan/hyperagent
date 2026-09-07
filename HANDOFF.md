# Handoff

Written 2026-09-07 at the end of plan step 5 (the brand colour tokens are
the app's only palette). Read this first in a new session, then `README.md`,
`docs/brand/reskin-conventions.md` and `docs/clone-conventions.md`.

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
- There is one branch (`main`), pushed to `origin`
  (github.com/Karthik-Sivacharan/hyperagent, private), no open worktrees, and
  a clean tree.
- Verification at the last commit: `npx tsc --noEmit`, `npm run lint` (no
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
  `src/lib/utils.test.ts` covers `cn()`. vitest 5 wants `@types/node ^22`
  and the repo pins `^20`, hence 4.x.
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
| `src/components/<page>/` | Page components; `resources/` holds the shared heading, search and empty-state pieces |
| `src/components/ui/` | shadcn primitives in the brand skin (pills, tints, hairlines, glass), phase-1 API |
| `src/lib/mock/` | All data (static) |
| `src/lib/utils.ts`, `utils.test.ts` | The brand's `cn()` and its tests |
| `src/design/brand/` | `brand.css` (the app's token sheet), `brand.test.ts`, the Geist loaders, the brand's own primitives (reference only, nothing imports them), `README.md` with the wiring and the phase-2 mapping table |
| `src/app/design/brand/` | Swatch page at `/design/brand` with its own local light/dark toggle |
| `docs/brand/` | `design.md` (the brand language), `reskin-conventions.md` (the phase-2 contract), the style audit |
| `docs/clone-conventions.md`, `docs/reference/` | The phase-1 contract and the captured ground truth |
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
- `src/design/brand/ui/` (the brand prototype's 23 primitives, verbatim) is
  still unimported reference material; keep it or prune it deliberately.
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

> Read HANDOFF.md, README.md, docs/brand/design.md and
> docs/brand/reskin-conventions.md in ~/Projects/hyperagent. Phases 1 and 2
> and plan step 5 are merged on main and pushed to origin (private): the
> dashboard clone runs on the brand tokens as its only palette, light and
> dark, in Geist and Geist Mono on Vercel's Geist roles, with six gates
> (tsc, lint, build, brand:check-contrast, brand:lint-tokens, test). Do the
> phone-width pass: verify every route at 390×844 in light and dark with
> scripts/dev/screenshot-pages.mjs (add a viewport option), fix layout that
> breaks using only the brand tokens and the existing primitives, keep the
> 1456-wide screenshots pixel-identical (capture before you start and
> compare after), and prune the unread mock fields listed in the handoff.
> Commit on main with the trailers in HANDOFF.md and push.
