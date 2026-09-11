# Handoff

Written 2026-09-07 at the end of plan step 5 (the brand colour tokens are
the app's only palette), updated the same day for the move to Tabler
icons and for the component system sweep, on 2026-09-09 for the composer
Tools panel merge and the heading-cut decision, and rewritten on
2026-09-10 when the signup / hyper-personalized onboarding work merged, and
extended the same day for the streaming agent turn (`feat/agent-stream`).
**Everything described here is on `main`, and `main` is pushed.** Read
this first in a new session, then `README.md`, `docs/components.md`,
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
- **The composer Tools panel shipped (2026-09-09, merged from
  `feat/tools-menu-redesign`).** The Tools submenu of the thread-settings
  menu was a stub reading "17 tools enabled";
  `src/components/composer/tools-menu.tsx` now holds the tool data, the
  state hook and three panels (roster, chips, presets), compared side by
  side as real menus at `/design/tools`; the composer renders the chips
  panel. On/off state is carried by fill, text tier and a check, never by
  hue; every tool is a `menuitemcheckbox` in the menu's roving focus; the
  count follows the state. `DropdownMenuCheckboxItem` / `RadioItem` gained
  an `indicator` prop, and `DropdownMenuContent` no longer restores focus
  after a pointer close, which fixed a stuck focus ring and a stuck
  tooltip on the composer pills. All six gates passed at the merge.
- **The signup flow is merged (2026-09-10).**
  `feat/hyper-personalized-onboarding` went onto `main` with `--no-ff`
  (26 commits); both refs are pushed to `origin`
  (github.com/Karthik-Sivacharan/hyperagent, private). It adds `/signup` —
  five beats that are the first thing in this repo not cloned from an
  existing hyperagent.com page. See "The signup flow" below before touching
  it: three things on that page are load-bearing and easy to break. It
  merged with its known gaps rather than finished — chief among them that
  there is still no streaming assistant turn — and the gap list is in that
  section.
- **The app defaults to dark (2026-09-10).** `defaultTheme="dark"` on the
  root layout's ThemeProvider, so anyone with no stored choice gets the dark
  mapping whatever their OS prefers. `enableSystem` stays on because
  `defaultTheme` outranks the OS: the account menu's System item is the only
  thing that still follows it, and dropping the flag would remove that third
  choice rather than change the default. Nothing about the token sheet moved
  — `:root` is still the light mapping and `.dark` still only re-maps it.
- **The signup shell is responsive (2026-09-10).** `fix/responsive-shell`: the
  conversation column has a floor and the chrome yields to it in three steps,
  the column measures itself with container queries, and the thread bar's panel
  toggle works. `npm run probe:signup` is the gate. See "The shell yields, the
  conversation does not" below.
- **The agent panel is 448 and the profile CTA reads "Find agents for me"
  (2026-09-10).** `fix/panel-width`. The width was 560 on a remembered figure
  ("Gumloop ~550"); Gumloop measures 477 at 1456 and is proportional, not
  fixed. Going under 480 then needed a bug fixed, not a number changed — see
  the panel-width paragraphs under "The signup flow". The CTA said
  "Hyperpersonalize my onboarding", which named the mechanism; it now names
  the outcome and pairs against "Set up manually". **`probe-signup.mjs` drives
  the flow by clicking that CTA's exact string, so renaming it again means
  editing the harness** — it fails loudly rather than measuring the wrong
  screen.
- **Ten dead transitions are fixed (2026-09-10).** `fix/dead-transitions`:
  Tailwind v4 compiles `translate-*` / `scale-*` / `rotate-*` to the separate
  `translate` / `scale` / `rotate` properties, so every
  `transition-[…,transform]` beside one of them was transitioning nothing and
  the element snapped. It had rotted into ten places, the signup panel and every
  button's press among them. `components.test.ts` locks the rule. See "Decided
  2026-09-10: never name `transform` in a `transition-[…]` list" below.
- **The agent streams (2026-09-10).** `feat/agent-stream`: send used to bring
  the shell in around a finished screen and stop there. Now the three cards
  you did not pick leave, your brief lands as your message, and the agent
  answers in the product's own streaming idiom (reasoning, stacked tool calls,
  prose) ending on the skills question that `a6b87b6` unwired, which is now
  answerable. `<main>` becomes the thread's scroller at send, so the PAGE still
  never scrolls. The running state was captured live off hyperagent.com for
  this (`docs/reference/overlays/thread-streaming-live.html`). See "The agent
  streams" below; `probe:signup` now waits for the finished turn and asserts
  six things instead of three, one of them a real hit-test of every control
  in the chrome.
- **Two design pages carry work that is built but not fully wired**:
  `/design/skill-suggestions` (three ways to offer skills; variant A is now in
  the stream, B and C are one import away) and
  `/design/agent-panel` (the Gumloop-shaped agent config panel, with its
  consolidation audit at `docs/plans/2026-09-10-agent-panel-consolidation.md`).
  Both are described under "The signup flow".
- **The artifact workspace is built but not wired (2026-09-10,
  `feat/workspace-panel`).** The desktop hyperagent.com opens beside a thread
  once it has produced something: wallpaper, a glass toolbar, the artifacts on
  a carousel, a dock. Static, Carousel layout only, in
  `src/components/workspace/`, shown beside the real thread view at
  `/design/workspace`. See "The artifact workspace" below.
- A second worktree, `.claude/worktrees/onboarding-exact` (branch
  `onboarding-exact`), holds a DIFFERENT `/onboarding` feature. It is
  unrelated to the signup flow; do not confuse the two or edit one from the
  other's worktree.
- Verification at the signup merge (2026-09-10), all six gates on the merge
  commit before it was pushed: `npx tsc --noEmit`, `npm run lint` (no
  warnings), `npm run build` (34 pages), `npm run brand:check-contrast`
  (WCAG AA, 64 pairs per theme, zero skipped), `npm run brand:lint-tokens`
  (zero findings) and `npm test` (5 files, 39 tests).

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
  sets `dark` on `<html>` from the account menu's Theme item (dark is the
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

## The signup flow (merged to `main` 2026-09-10)

Merged with `--no-ff` from `feat/hyper-personalized-onboarding` (26 commits);
both the branch and `main` are pushed to `origin`. Everything below lives at
`/signup`, outside the `(app)` route group on purpose: an account gate gets
the root layout (fonts, theme, tooltips) and none of the app shell.

**What it is.** Five beats on one page, no routing: pick a provider → a wait →
confirm the record we built → a chat-shaped screen that turns that record into
a brief → and on send, the app shell arrives around the conversation. It is a
demo of hyper-personalized onboarding, and the first UI in this repo invented
rather than cloned, so `docs/reference/` has no ground truth for the flow as a
whole; the individual blocks inside it do, and each one names its dump below.
The design references were Gumloop's agent tiles and hyperagent.com's own
thread column, both measured live rather than eyeballed.

**Nothing authenticates.** `src/lib/mock/signup-identity.ts` is the whole
"result", static like the rest of `src/lib/mock/`. It deliberately keeps the
split a real implementation would have: Google's ID token already carries
`given_name`, `family_name`, `email` and `picture` (free), while everything
about the company comes from an enrichment call keyed on the token's `hd`
domain claim (not free, and the half that can come back empty). That is why
the company card is editable and why the screen reads as a draft to confirm.
Only Google is wired; Apple and Microsoft are inert, as the email form is.

**The step machine** is `src/components/signup/signup-screen.tsx`:
`signin | loading | profile | personalize`, one way, a plain string. All four
screens share one CSS grid cell and crossfade, so the cell is as tall as the
tallest and nothing reflows. Hidden screens are `inert`.

**The handoff is not a fifth step.** Pressing send on the fourth screen brings
the app in around the conversation instead of navigating to it: the sidebar
slides in from the left, the agent panel from the right, the glass and its
noise come up underneath, the thread bar fades in overhead, and the centred
column steps in to make room. The composer you were typing in is the same DOM
node before and after; so is the mark, so are the four cards, so is the draft.
A step change crossfades one screen out and another in, and the thing that has
to survive here is the conversation itself — so `step` stays `"personalize"`
and a separate flag rides on top of it.

That is also why **the mark needs no fifth seat**: it is absolutely positioned
inside the stage and parked by a transform measured against the stage's own
box, so moving the stage's ANCESTOR carries it along for free. Hence the column
shifts by padding on the element above the stage rather than by a transform on
the stage, which would have composed with the mark's own transform and fought
it. The sidebar keeps its own 20px mark rather than receiving the flying one:
they are different objects, and flying one into the other would say the thing
that had been speaking to you was a nav button all along.

**One mark for the whole flow.** The Hyperagent mark is rendered ONCE in the
stage and never unmounted — unmounting replays its entrance, which is the
blink this replaced. Each screen carries an empty seat (`data-mark-slot`)
holding its place in the column, and the mark is FLIPped between seats in a
`useBeforePaint` effect. Two things there are load-bearing and easy to break:
the in-flight animation must be cancelled BEFORE the second measurement or it
reports the animated position rather than the new resting one; and
`origin-top-left` is what makes the arithmetic "translate to the seat's
corner" with no half-size correction (64 × 0.6875 = the 44px seat exactly).
A `ResizeObserver` re-parks without animating on reflow.

**The one cell must FIT THE VIEWPORT. This is the constraint that bites.**
All four screens share one centred grid cell, so the cell is as tall as the
tallest screen and every screen pays for it. `<main>` is
`flex min-h-svh flex-col items-center justify-center px-5 py-12` and has been
in every commit on this branch: there is no scroll handling anywhere, and none
is wanted. While the tallest screen fits, the block centres on both axes and
the page does not scroll. The moment it does not fit, EVERY screen scrolls,
including the sign-in screen that needs 502px, and the column stops being
viewport-centred because it is centring against a content box taller than the
viewport. That is exactly what the skill card did (see below), and it is the
first thing to check when this page starts scrolling.
- The budget is the viewport height minus `<main>`'s 96px of `py-12`: about
  806px of cell at 902, about 772 at 868. The cell measures **674px** today.
- Two gates worth re-running by hand after any layout change here, at 1512×902
  and 1456×868: the stage's `grid-template-rows` must be the same at every
  step, and a real wheel must move nothing. Check ALL THREE scrollers —
  `window.scrollY`, `document.documentElement.scrollTop` AND
  `document.body.scrollTop`. `globals.css` sets `overflow-x: hidden` on `html`
  and `body`, which forces their used `overflow-y` to `auto`, so a body scroll
  can exist while `documentElement` reports none. Reading only the first is
  what hid a 206px body scroll during the 2026-09-10 diagnosis.
- The stage is `relative grid w-full max-w-wide grid-cols-1`. **`grid-cols-1`
  is load-bearing**: an implicit grid column is `auto`, so the track sizes to
  the widest item's MIN-CONTENT and ignores `max-w-*`. All four screens are
  always mounted, and one wide row inside the chat screen reported 644.94px of
  min-content, which made the track 644.94 inside what was then a 384px box
  and threw every column centred in it 130.47px to the right at every viewport
  width. `grid-cols-1` is `minmax(0, 1fr)`, which pins the track to the
  container. The stage carries ONE measure for all four screens rather than
  switching on the step: the first three never took their width from it
  (`COLUMN` caps them at 384 and centres them in the cell), so one measure
  costs them nothing and holds every seat on a fixed axis.

**Motion decisions, all measured rather than guessed.**
- The mark keeps ONE rendered size (64) its whole life and reaches 44 by
  scaling. Re-rendering the SVG smaller re-rasterises its filters mid-flight.
  `material-mark.tsx` gates those filters at 40px (`MATERIAL_MIN_PX`).
- `material-mark.tsx` gained `spin="auto"`: the hover turn (600ms) on an
  infinite loop with the pause written INTO the keyframes, because
  `iterations: Infinity` honours a `delay` only once. Cycle 968ms = 600ms turn
  + 368ms hold. In that mode it takes no cursor and no hover handlers.
  Leaving auto used to snap the rotation to 0; cleanup now carries the
  remaining sweep to 360°.
- Travel uses `--ease-in-out`, NOT `--duration-slide`'s usual quint-out
  partner. Measured mid-flight, quint-out had the mark 94% of the way there at
  t=210ms while the column behind it was still half-opaque — a flick then a
  drift. Same finding the mark's own 360° turn already records. Everything the
  handoff moves rides the same pairing, so the shell arrives as one object
  rather than as four.
- The two record cards used to MORPH into the sentence's chips, and that is
  gone as of 2026-09-09 at the user's request. The last step is now the plain
  crossfade every other step uses. The effect and its two `data-morph` handles
  are in this branch's history if it is ever wanted back.
- Every one of these bails on `prefers-reduced-motion`, which leaves a still
  mark — so the loading screen owns a text status line that changes either way.

**The chips are a deliberate rule break.** `identity-chips.tsx` colours the
three inline chips `info` / `success` / `warning`. Those are STATUS tokens and
brand rule 8 reserves them for status; here they are category labels carrying
no state. The reason is the token lint: `scripts/brand/lint-tokens.mjs` bans
raw hex and stock palette classes, and those five status hues are the only
distinct ones that exist. `destructive` was left out (red never reads as a
category) and `brand` too (the screen's one tangerine belongs to the composer
send). **If this bothers a future reader, the clean fix is real categorical
tokens in `brand.css`** — deliberately not done, because that is the shared
token file page branches are meant to leave alone. The chips are also not
`Badge`: an `h-5 rounded-full` pill is a status chip, not something that sits
in running text, and they are `inline-block` rather than `inline-flex` so the
baseline comes from the label's own line box (inline-flex measured 1.7px low).

**The fourth screen shows its work.** It used to appear fully formed, on a
premise that something was out there researching for you. Now
`research-signals.tsx` runs a five-source pass in the product's own tool-row
idiom, and the ground truth for it is a live capture:
`docs/reference/overlays/thread-streaming-turn.html`, read off hyperagent.com
on 2026-09-09. **The finding that shaped everything: a running turn has NO
spinner anywhere.** A tool call is one 28px row — a 12px mark, a 12/16 label
at weight 500, a middot, a truncated parameter — and running vs complete is
the same row with the label shimmering or not. The words never go past tense.
- **The four cards are on screen from the first frame as skeletons** and
  resolve as the pass runs, so the loading state is the end state half-drawn.
  Content and skeleton share one grid cell, so a card is its loaded height
  immediately. `markTop` measures 97px at every frame, pick included.
- **One row at a time in a fixed 28px slot**, not the product's growing stack,
  for that same reason — and because the end state is the four cards, not five
  resolved rows of chrome above them.
- **The sources are public** — the company site, its App Store listing, its
  open roles, the open web, and Exa. At signup nothing is connected, so a row
  claiming to read a mailbox or a private repo would be a lie the screen
  cannot back up. The product's own onboarding mode filters to the same public
  set. Exa earns its own row rather than folding into the plain web search
  because it answers a different question: a keyword search finds the company,
  a neural index finds what the company is LIKE, and it is the only one of the
  five that can say anything about a market. Its mark is the 256px PNG inside
  Exa's own favicon.ico — simple-icons carries no Exa glyph and the site
  publishes no standalone SVG — following airtable's precedent.
- **Timing: 1800ms a source (1400 working, 400 settled), 9.3s for the pass.**
  The fifth row was bought at full price rather than by squeezing the other
  four, because the row is the evidence: five sources read in the time four
  used to take would quietly say none of them cost anything. If it ever has to
  fit a budget, cut a source, not the milliseconds. Four cards against five
  signals means one source pays for no card, and it is the FIRST — fetching
  the company's own site buys the ground the rest stand on — so a card still
  lands on the final row.
- **The heading shimmers while the pass runs.** The sentence was already
  present tense, so the device costs no extra copy and no extra element. The
  band is clipped to the `h1`, not to the runs of plain words inside it, or
  each would sweep at its own rate; the chips paint over the top and keep
  their hues. It reuses `@keyframes shimmer` and `--shimmer-sweep`; the spread
  is 2px per character, measured off the dump. Every part of it sits behind
  `motion-safe:`, including `bg-clip-text`, because a transparent label with
  no band painted behind it is an invisible label.
- **The receipt, and the retry.** The finished pass collapses into the five
  marks plus `Read 5 sources` in the same slot. Not "5 public sources": the
  constraint has not moved and a private source still may not be added here,
  but the marks in that line are the receipt, and a reader looking at the App
  Store and LinkedIn sitting there does not need to be told the reading was
  public. At the right edge of that slot is a retry — the only way to disagree
  with the four cards without typing. `IconRefresh`, not sparkles (which would
  promise a different KIND of answer) and not shuffle (which would promise the
  same four reordered). Ghost, 24px, quiet on `foreground-low` and up one tier
  on hover, no accent, and `inert` while hidden because it is the only member
  of that slot holding a control. A replay clears the picked card and the
  composer, hand-typed text included. **It lands on the same four cards:**
  `SUGGESTED_AGENTS` holds one batch, so the mechanism is here and the second
  batch is not written.
- **The cards are controls.** `Card asChild` over a `<button>` (the
  `option-cards.tsx` shape `components.test.ts` allows), `aria-pressed`,
  disabled while pending. A click fills the composer with that agent's
  `prompt` and takes focus with the caret at the end. One selected at a time;
  clicking the selected card again is a reset, not a toggle, which is the
  screen's only undo; emptying the box by hand drops the selection, editing it
  does not. Selection is `bg-tint-20` under a hairline ring on the FOREGROUND
  — it was `ring-border-loud` first, which is tint-20, the same value as the
  fill under it, so the state came down to one tint step and could not be
  read. Fills run 7 rest / 10 hover / 20 picked. No accent: the screen's one
  tangerine is the composer's send.
- **A way out under the composer**, centred at 24px: `Set up manually`, the
  same words as the profile step's button one screen earlier, deliberately —
  an escape hatch that renames itself on every screen reads as a different
  door each time. What separates them is weight, not vocabulary. It retires on
  handoff, fading rather than unmounting and keeping its box, because removing
  44px directly under the composer would settle the whole centred column at
  the exact moment the shell is sliding in.

**`Composer` grew three opt-in props** (a fourth, `status`, came with the
agent stream; see that section), all the same shape and for the same
reason — exactly one screen in the repo has anywhere to send to, and every
cloned route must keep the behaviour it has today: `value` / `onValueChange`
(hybrid controlled) and `onSend`. Two real bugs were fixed behind them. Its
auto-grow moved off the textarea's `onInput` onto a before-paint effect keyed
on the rendered value, because text set from outside fires no input event and
would have sat in a one-row box; and a `ResizeObserver` now re-measures on
WIDTH, because the box otherwise keeps the height it measured at the old
measure and clips. Every cloned route has a composer whose column never moves,
so the width case never showed until the handoff took ~150px off a filled one.

**Skills are built, and variant A is now wired into the streamed turn (see
"The agent streams"). The history of why it was unwired first:** Three variants are compared
side by side at `/design/skill-suggestions`, each the real component with its
real state: A the question card (300px), B the skill shelf (400px), C inline
in the stream (132px). Every entry in `suggested-skills.ts` is a published
skill on skills.sh read off its own page — real names, owners and install
counts — because a suggestion screen listing plausible skills nobody can
install is the one lie this flow has not told; the SELECTION is the invented
part. Order is relevance, not popularity. Ground truth for A is
`docs/reference/overlays/thread-question-card.html`, the first message-level
block in the dumps, which `docs/components.md` §4 asks for before any of them
is cloned. **A was wired into the flow and then unwired**, because it reserved
300px from the first frame and took the chat screen to 990px — past the
viewport — which made every screen scroll. C is the only one that fits the
~806px budget. Whichever comes back, re-run the two layout gates above.

**The agent config panel is built but NOT consolidated** (`/design/agent-panel`).
hyperagent.com puts the same agent configuration in three places — the
composer's `+` menu, the composer's settings pill, and a right panel at
`?panel=settings` that opens CLOSED behind tabs and an accordion — so the
menus win and the configuration that should be read whole is only read in
slices. This follows Gumloop instead: a 448px panel open by default, sections
flat and always visible, each with its own `+ Add` and its own AI-managed
state on the header row. Model & compute, Skills, Connectors, Knowledge
sources, Subagents, Triggers, Autonomy & safety, in that order. **480 is
corrected from 560 (2026-09-10), after measuring the reference instead of
trusting the figure written down here.** The old comment claimed "Gumloop
~550"; Gumloop's panel is 477px at a 1456px viewport, and it is not a fixed
width at all but a split pane at `flex: 33.898 1 0px` — 33.9% of the content
area. 560 was 80px wider than the reference it named. Kept as a fixed number
rather than a percentage because the width is already clamped from both
sides by the live fit test, and a proportional default would be a second
opinion about the same pixels.

**Then 480 went to 448, and the second move found a bug rather than a
preference.** The panel had a CONTENT FLOOR at 471px it could not get under,
so 480 was already sitting 9px above it and `PANEL_MIN_WIDTH = 440` was a
number the splitter could never reach: dragging there overflowed by 31px,
silently, clipped by the viewport. Two things made it. Radix's ScrollArea
Viewport wraps its children in a `display: table` box, which shrink-to-fits
to its contents' MAX-content width; the instructions field is a
`field-sizing: content` textarea, whose max-content width is its own text.
Below 471 the textarea stopped shrinking at 431 and the section overflowed.
`[&>div]:!block` on the viewport makes the box fill rather than shrink, so
`w-full` on the textarea resolves against the panel instead of against
itself; measured after, the field tracks the panel down to 360 with nothing
overflowing. Scoped to this panel rather than fixed in the primitive,
because the table box is how Radix supports content wider than its viewport
and changing it there would move pixels on seventeen cloned routes;
`thread-view.tsx` already reaches into the same box the same way.

**The `!` is load-bearing and cost a round trip.** Radix writes
`display: table` INLINE, so the first attempt without it did nothing at all
and the panel went on clipping its own "+ Add" buttons at 448. Every gate
passed and `probe:signup` still said 3 of 3, because none of them look
inside the panel — it was caught by opening a screenshot. That is a real
blind spot in the harness.

448 is 28rem, one notch under the reference's 477, and it hands the thread
its full 752 measure at 1512 (712 at 1456) against 640 at the old 560.
`PANEL_MIN_WIDTH`'s own comment was a second remembered number: it claimed
440 was "where the longest header row runs out of gap", and no header row
collides at any width down to 360 (they are `justify-between` over a
`min-w-0` title, so they truncate rather than touch). It is a judgement, now
labelled as one, and left at 440 because `use-shell-fit.ts` reads it to
decide when the panel may dock at all. Drag-to-resize is 440–720 with a double-click reset and a
focusable window splitter with arrow keys. Save is dirty-only and changes
state rather than greying out. Connected versus available is carried three
ways and none is hue. `docs/plans/2026-09-10-agent-panel-consolidation.md` is
the audit behind it — every setting in both composer menus, where it should
live, and the rule: **the composer owns the message, the panel owns the
agent.** Nothing has been removed from the composer yet; the audit records
that the largest casualty is `tools-menu.tsx` as a menu, whose every
accessibility decision is a `role="menu"` idiom that transfers to nothing.

The panel does arrive in the flow: the handoff brings both columns in at once,
sidebar from the left and panel from the right, in the same beat and on the
same curve, because two columns from two edges is one gesture — the room
assembling — where staggering them would read as two events. The panel owns
its width and reports it upward rather than taking it as a prop; the column
between the two pads by that live figure through a custom property, so
dragging the splitter moves the conversation with it. **This is the one place
the stage actually narrows**: with both columns in, 1456 leaves about 600px,
so the stage is under its max-width and the chat reflows. That is what the
real app does when the panel opens, and `ResizeObserver` re-parks the mark
without animating, which is what it was written for.

**Reuse worth knowing.**
- `src/components/thread/` and `src/components/composer/` carry NO app-shell
  context. `Composer` mounts verbatim outside `(app)`; that is how the fourth
  screen gets a chat window without a sidebar.
- The sidebar's wrapper is `md:flex`, not `md:block`. Its whole internal
  column is built on `h-full`, which resolves against a parent with a definite
  height; dropped into a plain block it measures 0 and renders an invisible
  256px of nothing.
- `FoundCard` is the shell both record cards wear. `AgentCard` reuses its look
  (same tint, padding, rim light) but NOT the component: FoundCard's row is
  media + title + subtitle + corner action and an agent has none of those.
- The tool-logo row follows Gumloop's measured structure: one bordered group
  with `divide-x` between chrome-less tiles, the `+N` as another tile inside
  that group, not a detached pill.
- Logos prefer the ~29 already in `settings/integration-logos.tsx` (already on
  the token lint's ALLOW list) and fall back to `public/tools/` via
  `src/lib/mock/tool-logos.ts`. **Any single-tone logo added there must paint
  in `currentColor`** — Notion and GitHub arrived hard-coded near-black and
  were invisible on the dark canvas until they were converted.
- `src/lib/mock/` is NOT scanned by the token lint at all (its `ROOTS` are
  only `src/components` and `src/app`), so a manifest of paths needs no ALLOW
  entry; a component that inlines a mark as SVG does.
- **`--shadow-card-soft` and `--shadow-rim-soft`** (brand.css, bridged in
  globals.css) are this flow's resting card elevation, one step under the
  full-strength pair. Both were needed because the two themes tell elevation
  with different layers — the drop does the work in light, the inset rim in
  dark — so stepping down one would have quietened one theme only. Additive,
  and applied to this flow's cards, NOT to the `Card` primitive, which would
  move pixels on all 17 cloned routes.
- The company mark is Trainwell's real 256px app icon (`/logos/trainwell.png`,
  byte-identical to what their site serves). It reads at the card's 48px; at
  the chip's 20px and the summary tile's 16px it is a small purple blur, which
  is what the cropped `t` at `/logos/trainwell-mark.png` existed for. That
  file is kept if the small sizes ever want it back.

**Known gaps, in the order worth fixing.**
- ~~**There is no streaming assistant turn.**~~ **Closed 2026-09-10 by
  `feat/agent-stream`; see "The agent streams" below.**
- **The composer's `+` menu and settings pill still hold config the panel
  duplicates.** The staged migration is
  `docs/plans/2026-09-10-agent-panel-consolidation.md`; nothing has been
  removed yet.
- ~~**Skills are unwired.**~~ **Closed 2026-09-10:** variant A is the last
  block of the streamed turn, after send, where the pre-send cell budget no
  longer applies.
- The receipt's retry re-runs the pass but lands on the same four cards —
  `SUGGESTED_AGENTS` holds one batch.
- There is no failure state in the research pass. Five sources that never miss
  is less believable than four that land and one that comes back empty, and
  the product's own `· Failed` suffix is in the dump, unused.
- The two waits total about 13s (3.78s on the loading screen, 9.3s on the
  research pass). Honest for a demo, long once real calls sit behind them.
- `HEADING_CHARS` in chat-step.tsx counts the sentence's fixed words to size
  the shimmer band; editing the `h1` copy silently drifts it. A measured
  `scrollWidth` would maintain itself.
- The summary's tile group is nearly frameless on the dark canvas —
  `bg-tint-10` + `shadow-edge` is tuned for sitting on a card, not on the
  page, and it wants a slightly louder fill off-card.
- The two edit pencils on the record cards are inert. Wiring them means
  deciding inline editing vs a dialog.
- ~~Nothing here has been verified below 1456 wide.~~ **Closed 2026-09-10 by
  `fix/responsive-shell`; see "The shell yields, the conversation does not"
  below.** `npm run probe:signup` is now the gate, and it passes at every width
  from 1920 down to 768 in both themes.
- `--shadow-rim` does real work in dark and is close to invisible in light,
  where `--highlight` is white on a near-white card. Left as is, since the
  light theme is flat by design elsewhere. A per-theme inset would be correct.
- Every suggested agent happens to draw Linear, so the tool rows look more
  alike than they should.

## Decided 2026-09-10: never name `transform` in a `transition-[…]` list

**Tailwind v4 does not compile `translate-*`, `scale-*` or `rotate-*` to the
`transform` property.** It compiles them to the separate CSS `translate`,
`scale` and `rotate` properties:

```css
.translate-x-full { --tw-translate-x: 100%; translate: var(--tw-translate-x) var(--tw-translate-y); }
```

So an arbitrary list like `transition-[transform,box-shadow]` sitting next to a
`translate-x-full` transitions NOTHING, and the element teleports. It fails
silently, it looks like a deliberate snap, and it had rotted into **ten** places
in this repo before anyone noticed. The named utility `transition-transform` is
safe: v4 expands it to `transform, translate, scale, rotate`.

The rule is locked by `src/components/components.test.ts` ("transition property
lists"). It is deliberately not a ban on the word — `skew-*` and `transform-gpu`
really do compile to `transform` — it works out which properties each file
actually moves on and flags a list that names `transform` without them. Run
against the commit before the fix it reports all ten; the failure message says
what to write instead.

**Its one blind spot, written into its own comment:** the rule is file-scoped,
and `home/thread-card.tsx` and `threads/thread-card.tsx` killed `Button`'s press
feedback from a different file — an `ACTION` string whose own
`transition-[…,transform]` replaces the base's whole arbitrary list through
tailwind-merge. If you override a transition list on a component you did not
write, carry its properties through.

What this was hiding, all of it documented intent that had never once run:
- **The signup panel's slide** (`app-handoff.tsx`). It had exactly TWO positions
  in its whole life. This is the bug behind the reported ghost — see below.
- **The signin screen's leave cascade** (`signup-screen.tsx`). `delay-*` only
  delays a property that is actually transitioned, so all four parts snapped
  their full 8px simultaneously on the frame you pressed the provider button,
  while everything was still opaque, and the documented stagger applied to the
  fade alone. It is now what the comments always claimed.
- **Every button in the app.** `motion-safe:active:scale-(--scale-press)` was
  applying instantly at both ends instead of over `--duration-fast`.
- The provider/email swap's 4px settle, the settings link card's hover arrow,
  `SelectTrigger`'s press, the thread view's scroll-to-bottom pill, and the
  three motion specimens on `/design/brand`, which were demonstrating a snap
  while the rows beside them described a 150ms ease.

**The ghost it caused, and why it was not a compositing artefact.** The panel
teleported to its parked position on frame 1 while `<main>`'s `padding-right`
took a real 480ms to make room. `<main>` is `z-10` with no background of its
own and the panel is opaque at `z-0` behind it, so for those frames the
conversation was painted straight on top of the panel and its text read through
the cards. Measured at 1512: 23 frames and 180px on arrival, 19 frames and
308px on expand; zero after. The proof it was a model bug rather than a raster
one is that stretching `--duration-slide` to 3000ms stretched the overlap to
2278ms. **A transparent `<main>` is the amplifier, not the cause** — at rest the
boxes never overlap, there is always exactly 20px of gutter.

A second, smaller version of the same desync: the sidebar's collapse rode a
private `width 200ms ease-out` while `<main>`'s padding rode `--duration-slide`
on `--ease-in-out`, 2.4x longer on a different curve, for 68px of overlap over
15 frames on expand. `Sidebar` now takes `collapseRidesSlide`, an opt-in the
shell passes and the seventeen cloned routes do not, so their motion is
untouched. The duration is read off the live column rather than written down
twice — the old teardown timer was a hard-coded 260ms for a 200ms move and
would have cut a 480ms move in half — and it is set with longhands, because an
unresolved `var()` inside the `transition` shorthand invalidates the whole
declaration and would take the animation with it.

At the merge: all six gates, `probe:signup` 3 of 3 in both themes, and all 17
cloned routes byte-identical to `main` at 1456×868 in both themes.

## The shell yields, the conversation does not (2026-09-10)

Merged from `fix/responsive-shell`. The plan, with every measurement behind it,
is `docs/plans/2026-09-10-responsive-shell.md`. Before this, the handoff's
`<main>` padded a hard `md:pl-64` and the panel's live width, so the
conversation was the REMAINDER of a subtraction and the two things it
subtracted never yielded: at 1024 the column was 208px, at 768 it was 0.

**The rule is one sentence: the conversation has a floor, and the chrome yields
first.** Three steps, cheapest first, decided by a live fit test rather than a
media query — the sidebar is collapsible and drag-resizable, so a breakpoint
would be measuring a number that moves.

1. **The panel gives up its own width**, down to its existing 440 minimum,
   before the conversation gives up any. `AgentPanel` gained `maxWidth`, a
   CONSTRAINT rather than a value: the panel still owns which width it wants
   (`preferred`) and `maxWidth` only says what it may have, so a drag made
   while squeezed is remembered and returns when the window widens.
2. **The panel stops being a column** and floats over the conversation at the
   right edge on `shadow-lg`, closed on arrival, dismissed by Escape. It is
   inset by the thread bar's 48px so it cannot cover the toggle that opened it.
3. **The sidebar rails.** This one exists because a harness sweep found the
   768–807 band the first two steps leave open: the panel has already floated,
   the 256px sidebar still will not move, and the column lands at 472 under the
   512 floor. `Sidebar` gained `forceCollapsed`, the same constraint shape, with
   `collapsed = userCollapsed || forceCollapsed` so the reader's own choice
   survives underneath it.

`COLUMN_FLOOR = 512` is Tailwind's `@lg` container breakpoint and it does two
jobs with one number: it is the floor the shell defends, and it is where the
card grid drops to one column. The arithmetic lives in
`src/components/signup/use-shell-fit.ts`, which also carries the proof that the
rail and dock bands cannot oscillate.

**`railSidebar` is asked of the sidebar's EXPANDED width, never its live one.**
The obvious version feeds itself: railing changes the live width, which un-makes
the decision, which un-rails. That is why `Sidebar` reports two figures.

**The column measures itself now, not the viewport.** `chat-step.tsx` is
`@container/chat` and the card grid is `@lg/chat:grid-cols-2`. A `sm:` inside a
column whose width is "viewport minus two pieces of chrome" is reading the wrong
box — that is why the cards stayed two-up at 96px each. Container queries were
already this repo's idiom (`composer.tsx`, `memories-page.tsx`,
`threads-page.tsx`, `settings/integrations-page.tsx`).

**Two bugs found on the way, both worth remembering.**
- **The panel toggle was dead for two reasons, not one.** It had no `onClick`,
  and the thread bar sits inside a `pointer-events-none` layer that (unlike the
  sidebar and panel wrappers) never re-armed them, so `elementFromPoint` over
  the button returned `<main>`. Wiring the handler alone would have changed
  nothing.
- **`truncate` implies `white-space: nowrap`, whose min-content width is the
  whole string.** The agent card's longest title, 208.6px, plus 32px of padding,
  became a 241px floor on the card's own grid track, so below that the card
  pushed its content out sideways under `overflow-hidden` — and `truncate` had
  never once truncated at any width. `min-w-0` on the content layer fixes both.

**The gate is `npm run probe:signup`.** It drives `/signup` to the handoff
state and sweeps 14 widths, reporting the column, the grid's computed
`grid-template-columns`, the heading's line count, the panel's mode and the
mark's seat, and asserting three things: the column never falls under 512 while
docked, nothing scrolls at any width ≥768, nothing escapes its box. It exits 0
on pass, 1 on fail, 2 when the run is unsound — it records whether the shell
actually arrived, because an HMR recompile mid-sweep can reset React state and
quietly measure the pre-handoff page. Add `--sidebar-collapsed`,
`--panel-closed`, `--theme=light`.

Two traps it encodes, both of which cost real time:
- `globals.css` sets `overflow-x: hidden` on `html` and `body`, forcing their
  used `overflow-y` to `auto`, so a body scroll can exist while
  `documentElement` reports none. Check all three scrollers and dispatch a real
  wheel.
- **Dispatch that wheel over the conversation, not at a fixed point.** A wheel
  at `(400, 400)` lands inside the panel at narrow widths and scrolls THAT,
  reporting a reassuring zero.

At the merge: all six gates, `probe:signup` passing 3 of 3 in both themes, and
all 17 cloned routes byte-identical to `main` at 1456×868 in both themes —
`ThreadHeader` and `Sidebar` are shared with them and every new prop is opt-in.

## The agent streams (2026-09-10)

Branch `feat/agent-stream`. The plan, with the contracts the three parallel
agents built to, is `docs/plans/2026-09-10-agent-stream.md`.

**What send does now.** Two beats. Beat 1 (0 to 480ms, the shell's own
`--duration-slide` on `--ease-in-out`) is the room: the sidebar and the panel
arrive as before, the three cards you did not pick fade in place (keeping
their boxes, so nothing reflows under the arriving chrome), the research
receipt's retry and "Set up manually" retire, and the composer glides down to
its dock still holding your brief. Beat 2 (480ms on) is the conversation: the
unpicked cards leave the layout, the picked one glides into the first cell if
it was not already there, the brief leaves the composer and lands as your
message, the composer grows the product's Working strip, and the agent's turn
starts. No card picked means all four leave. The mark neither moves nor spins
after send: the live finding this flow was built on is that a running turn
has no spinner anywhere, and a turning mark is one.

**Ground truth was captured live, not reconstructed.** A frame recorder was
installed on hyperagent.com/threads/new before a send click and survived the
client-side route change, so one clock covers the whole turn:
`docs/reference/overlays/thread-streaming-live.html`. It confirmed the
2026-09-09 reconstruction and added what that file could not see: the
composer's "Working… / Stop" strip (it leaves when the final answer starts),
the favicon receipt a tool row lands when it resolves, that a reasoning block
with no text is simply REPLACED by the first tool row (no "Reasoned" line is
left behind), and the order of everything. Timings in it are ±1s because the
tab was throttled; the order is exact. The running tool row's DOM itself was
not among the checkpoints, so Block C1 of the older file still stands for it.

**The one architectural decision: send changes what scrolls.** A streaming
turn grows, and before send nothing may (the shared cell, the mark). After
send that cannot hold, so `<main>` becomes the thread's scroll container on
the send frame: `h-svh overflow-y-auto`, `justify-start`, `pb-4`, with
`padding-top` frozen at the stage's measured top (97px at 1456×868) so nothing
moves on that frame. It is `<main>` and not a box inside the chat screen
because the mark is absolutely positioned in the stage and has to scroll
natively with the sentence it heads, which means whatever scrolls must contain
the whole stage. Scrolling is not a transform, so "never transform the stage
or an ancestor" still holds. The page (html, body, window) still never
scrolls; `probe:signup` checks all three at every width under a real wheel.
- `<main>`'s transition list is now `transition-[padding-left,padding-right]`.
  The shorthand would have animated the frozen top down from `py-12`'s 48px:
  the handoff only ever moved those two sides.
- The stage takes `flex-1`, the chat screen `self-stretch`, and the three
  finished screens `hidden` (the flow is one way; a zero-opacity signin column
  would otherwise sit centred in a thread-tall row for nothing).
- The composer's wrapper is the DOCK (`[data-composer-dock]`): `mt-auto` puts
  it on the window's floor while the thread is short and `sticky bottom-0`
  keeps it there once it scrolls. **`bottom-0`, not `bottom-4`**: a sticky
  box's insets are measured inside its scroll container's PADDING, and `<main>`
  already pads 16px, so `bottom-4` measured 32px off the floor (836 of 868).
- The thread passes UNDER the thread bar because the bar now has its own fixed
  layer at z-20 inside `<main>`'s context; in layer one it painted under the
  column, so scrolled text drew over it. The floating panel is also z-20 but
  inset 48px below the bar, so the two never meet.
- Text scrolling down behind the dock is hidden by a band behind the composer:
  `bg-glass-gradient bg-fixed` with a 24px top mask. The canvas is a 135deg
  sweep across the whole window, so no flat token matches it, but the same
  gradient fixed to the viewport lines up with the canvas pixel for pixel. It
  fades in on the canvas's own duration and curve; mounted opaque, it was a
  glass patch on the pre-glass canvas for half a second. The probe reports its
  20px of deliberate bleed into each gutter rather than failing it.
- Stick to bottom: within 40px of the end, growth scrolls `<main>` to the end,
  instantly, as the product does. Scrolled up, the reader is left alone.

**The turn** is `src/components/signup/agent-turn.tsx`, driven by
`use-agent-stream.ts` from a static script in `src/lib/mock/agent-stream.ts`
(one per suggested agent, plus a fallback for a hand-typed brief). Reasoning
1200ms, then three tool rows at 1100 running + 300 settled (the loading
screen's tempo), then prose at ~110 chars/s, a 300ms beat, and the question:
about 10.8s from send. **Every row is honest**: nothing is connected at
signup, so rows write, search the public skills index and CHECK connectors;
none claims to read a mailbox, a repo or a Figma file. Only the Design system
drift script mentions the panel, because the panel is static and describes
that agent alone. The question is `SkillQuestionCard` (variant A) with three
new opt-in props (`question`, `onAnswer`, `answered`); its three pre-ticked
skills are exactly the three the panel lists, and must stay so. Answering
sends the answer as your message and runs one row and one sentence. Stop, while
the agent works, marks the running row Interrupted (the product's canceled
state: the row at 60%, an italic suffix) and ends the turn. After the first
send the composer's arrow is inert, as on every cloned route: a follow-up box
that pretended to send would be the one lie this flow has not told.
- Reduced motion collapses every transition and FLIP, and the SEQUENCE keeps
  its timing, as the research pass already argues: it is information, not
  motion. Text still arrives in chunks; that is content arriving.

**The components, reusable and free of signup context** (the thread view
could adopt them as they are):
- `thread/shimmer.ts`: `SHIMMER` and `sweepStyle` moved out of
  research-signals.tsx, with `cycleMs` / `spreadPerChar` options whose defaults
  keep the research pass identical.
- `thread/tool-call-row.tsx`: `ToolCallRow` (running, done, interrupted,
  failed; a glyph or a 12px logo; a `receipt` slot shown only once done) and
  `ToolCallCount`, which brings its own middot because "iOS 6 found" read as
  part of the detail. research-signals.tsx renders it now; all 12 distinct DOM
  states of a research pass are byte-identical across the extraction.
- `thread/reasoning-block.tsx`: "Reasoning…" over two `Skeleton` bars. The
  product's `opacity-50` on the bars was dropped: half of `tint-10` vanished
  on the dark canvas.
- `thread/streaming-message.tsx`: `StreamingMessage` (AssistantMessage's
  prose, snapped to whole words so no half-word paints, strong runs strong
  even when cut) and `useTextStream` (seeded jitter, so a probe or a replay
  sees the same frames; `active=false` freezes, which is Stop).
- `composer/composer-status.tsx` and Composer's opt-in `status` prop: the
  Working strip, on the brand's typing dots. Absent, every cloned route
  renders the DOM it did.
- `/design/agent-stream` shows every block in every state at 752 and 512.

**Three bugs found on the way.**
- The question card's rows escaped their box at columns of 440 and under: a
  hyphenated skill name reports its longest SEGMENT as its min-content, and a
  truncating reason reports its whole string there. Now the reason gives way
  first, then the repo, never the name; nothing escapes down to a 290px card.
- A focus fight: the chat screen moves focus to the composer inside
  `onAnswer`, and the card then took it back. The card now only catches focus
  that has fallen to `<body>`.
- **The sidebar's collapse and expand toggle, and its home link, took no
  clicks after send.** Moving the thread bar to its own layer above the column
  moved its wrapper there too, and that wrapper spans the whole window and
  reaches the bar's edges with PADDING, which hit-tests. Re-armed with
  `pointer-events-auto`, its left padding lay over the sidebar's top 48px (and
  its right padding over the docked panel's), so `elementFromPoint` over "Hide
  sidebar" returned the wrapper. In layer one it never showed, because the
  sidebar came later in the tree and painted over the padding. The fix re-arms
  the bar's own box, not the wrapper. Every gate passed it, because the probe
  toggled the sidebar with a programmatic `el.click()`, which ignores whatever
  lies on top: the same way the dead panel toggle got through before. Hence
  criterion 6 below.

**`probe:signup` in thread mode.** After send it waits for
`[data-agent-turn][data-state="waiting"]` (exit 2 if it never arrives), holds
`<main>` at its end for every row, and asserts five things: the column ≥512
while docked; the PAGE never scrolls under a real wheel over the turn and over
the gutter (`<main>` may, and reports how far); nothing escapes the column;
the composer is docked (inside the viewport, bottom within 32px of the edge);
**nothing escapes inside the agent panel**, which closes the blind spot that
let a clipped panel through; and **the chrome takes clicks**: every enabled
control in the sidebar, the thread bar and an open panel must be the topmost
element at its own centre (scrolled-out, disabled and `inert` controls are
skipped). `--sidebar-collapsed` and `--panel-closed` now press a real mouse at
the control through CDP instead of calling `el.click()`. Criterion 6 was
proved against the bug: with the wrapper re-armed it fails and names "Hide
sidebar" and "Hyperagent home"; with the fix it passes. At the merge: 6 of 6
in dark and light at 902 and 868 tall. `--panel-closed` and
`--sidebar-collapsed` passed the first five at both heights before criterion
6 existed and were not re-run with it (the collapse and expand toggles were
checked by hand with real clicks instead). The thread scrolls up to 627px and
the dock sits 16px up at all 14 widths. The 17
cloned routes are byte-identical to `main` at 1456×868 in both themes.

**Known gaps.**
- The agent panel is static and always describes Design system drift, so
  picking any other card leaves the panel's header and connectors wrong. True
  before this branch; more visible now that the stream names the agent.
- Answering the skills question does not change the panel's Skills section.
  The panel reads `AGENT_CONFIG`; an opt-in `skills` prop would close it.
- The six skills are chosen for the RECORD (a design engineer at Trainwell),
  not per agent. Per-agent sets need real skills.sh reads for the other three
  jobs; inventing plausible ones is the lie `suggested-skills.ts` refuses.
- No follow-up turn: after the first send the arrow is inert.
- The research pass and the stream together are ~20s of watching. Honest for
  a demo; cut a row, not the milliseconds, if it has to shrink.
- Background tabs clamp timers to ~1s, so the stream looks slow in an
  unfocused tab. Judge its timing in a foreground tab or headless.

## The artifact workspace (built, not wired, 2026-09-10)

Branch `feat/workspace-panel`. The right-hand desktop of a populated thread on
hyperagent.com, cloned as a still: the Carousel layout at rest, no behaviour.
Ground truth is `docs/reference/overlays/thread-workspace-carousel.html`,
captured read-only the same day (its header comment also records the
document iframe's measured type, which the dump itself cannot carry).

**Where it is.** `src/components/workspace/`: `workspace.tsx` (the root, and
the Browser pill), `workspace-toolbar.tsx` (the filter pill and the layout
switch), `artifact-card.tsx` (label pill, content, hover actions),
`document-view.tsx` (a document read in place), `artifact-dock.tsx`,
`workspace-artwork.tsx` (the wallpaper and the document tile's face) and
`glass.ts` (the one glass surface and the text strengths on it). Mock data,
including the wallpaper's palette, is `src/lib/mock/workspace.ts`; the image
artifact is `public/img/workspace/browser-capture.svg`, a drawn stand-in,
because the live one is a third-party page carrying a real address.

**How it mounts.** `Workspace` fills whatever positioned box it is given and
needs nothing from its host. `ThreadView` takes it as an opt-in `workspace`
prop: the chat column then takes the site's 512px (`w-lg flex-none`) and the
workspace fills the rest of the frame. No cloned route passes the prop, and
the `thread` route is pixel-identical to `main` in both themes (0 differing
pixels at 1456×868). `/design/workspace` wraps `AppShell` + `ThreadView` +
`Workspace` so the pairing reads as it will ship. The signup handoff mounts it
as the agent panel's Computer tab; see "The computer in the signup handoff".

**Measured against the live page, not eyeballed.** Rects relative to each
desktop's own box match to the pixel: the 600×668 document card and its
632px content, the 286×28 label (Geist on both sides, so text widths match),
the 164×78 dock and its 52px tiles, the 89×38 filter pill, the 109×34
Browser pill and the 143×38 layout switch. The desktop is 678 wide here and
684 on the live page only because the live sidebar had been dragged to 250px;
centred items sit half that difference over, and the first card snaps 3px in
(it is `snap-center`), which is what the site does at 678 too.

**Skin decisions (keep the layout, change the skin).**
- The wallpaper is artwork: its palette is data, its renderer is on the
  token lint's allow-list. Base, three blurred colour fields, a vignette, a
  highlight and grain, byte for byte the site's numbers.
- One glass (`GLASS`): `bg-surface-elevated/40` (sand, flips on its own),
  the brand's `--highlight` as the rim, `backdrop-blur-glass`. Text on it is
  the first tier at 100/70/50%, because the wallpaper stays light in dark
  mode and the brand's muted tiers sink into the pane there.
- The pressed layout key is lifted by `--highlight` (white .5 / .15). The
  canvas fill the app's other layout switches use read as a black hole on
  glass in dark.
- Brand corners everywhere: pills for every control, the card at
  `rounded-3xl`, dock tiles at the soft 14px and the dock concentric with
  them (14 + 8 = 22, `rounded-3xl`).
- The focus ring on the selected card is `brand-accent` at 70% under
  `shadow-lg`; the dock's selected tile keeps the site's white ring (it sits
  on the tile's own picture) and a `bg-foreground` dot.
- The document tile's blue is the site's, as a file-type face. The document
  itself is on the brand's reading type (`genui-prose`, headings at 600)
  rather than the site's iframe sheet; the unfilled-section placeholder drops
  to `foreground-low` instead of the site's italic, which Geist cannot set.
- Hover actions reuse the thread view's scroll-to-bottom pill rather than a
  new glass, and show on focus-within as well as hover.

**Not built.** Dragging the carousel, cards sliding under the thread column
(here the carousel starts at the desktop's edge, the same picture at rest),
the resize handle, dock scrolling and reordering, the Tile and Windows
layouts (seen live but not captured: Tile stacks the cards and regroups the
dock by type with counts; Windows floats each artifact in a 28px-title-bar
window with three traffic-light buttons and eight resize handles, keeps each
window's geometry per thread in localStorage, and adds sort / tile / cascade
buttons to the switch), every menu, the Spotlight overlay, the Browser view
and the entrance animation. The site keeps the chosen layout in localStorage
(`hyperagent-workspace-layout-mode`: `scroll`, `grid` or `windows`). The layout
switch is held on Carousel. Scrolling the carousel and its snapping work,
because they are CSS.

**Two traps from building it.** Padding on a `flex-1` item counts toward its
basis, so the filter's `px-2` has to sit on an inner box (as on the site) or
the layout switch lands 8px off centre. The `Separator` primitive stretches
through `data-vertical:self-stretch`, which beats a bare `self-center`;
override it on the same variant.

## The computer in the signup handoff (2026-09-10)

Branch `feat/computer-tab`, cut from `feat/workspace-panel`. Plan:
`docs/plans/2026-09-10-computer-tab.md`. When send brings the shell in, the
sidebar arrives at its 64px rail and the agent panel arrives 684px wide, open
on a new first tab, **Computer**, showing the artifact workspace.
Configuration and Usage are the second and third tabs.

**Two opt-in props, nothing else moves.**
- `Sidebar.defaultCollapsed` seeds the reader's own `userCollapsed`. It is a
  starting state, not `forceCollapsed`'s lock: the rail's expand toggle works,
  and the fit test's rail still applies on top. The rail reports 64 through
  `onWidthChange`, so `use-shell-fit.ts` sees the room at once; the expanded
  width still reports 256, so `railSidebar` is decided exactly as before.
- `AgentPanel.computer` (a `ReactNode`). Given one, the tabs become
  controlled with Computer as the default, the panel rests at
  `COMPUTER_PANEL_WIDTH` (684: the carousel's 48px lead-in, the 600px card
  and the 36px trailing pad) and double-click resets to it, every
  `TabsContent` is `forceMount` and hidden while inactive (Radix would
  otherwise unmount the carousel's scroll and the Skills list's state on each
  switch), Save shows only on Configuration, and the labels read "Agent" and
  "Resize agent panel". The header drops the agent's name and blurb and is
  the tab row alone, built like the thread bar (a 48px row over a 1px
  hairline) so the two tops are one height with one divider. Without it the panel is the two-tab panel it was, so
  `/design/agent-panel` does not change.

**The Computer tab fills its box** (`relative min-h-0 flex-1` over an
`absolute inset-0` holder) instead of scrolling in a `ScrollArea`, because the
workspace sizes itself to the height it is given.

**The document card may shrink.** `artifact-card.tsx` is now
`w-[min(--spacing(150),100%)]`: 600px, or the carousel's content box when that
is narrower. At 684 that is exactly 600; with the sidebar opened at 1456 the
panel's ceiling is 648 and the card takes 564 instead of losing its right
edge. `/design/workspace` (678 wide) moves its card by up to 6px, the one
pixel change allowed there.

**Width arithmetic, no change to the fit test.** With the rail the
conversation gets `viewport − 64 − 40 − 684`: 668 at 1456, 724 at 1512, 512
exactly at 1300, and below that the panel takes its ceiling and shrinks.

**Content.** `SIGNUP_WORKSPACE_ARTIFACTS` in `src/lib/mock/workspace.ts`: the
project document for Design system drift (goal, the repo, the library as
source of truth, where it files, decisions, tasks), under the agent stream's
honesty rule, so Findings is an empty section until a first run. The second
card is still the drawn signup capture. `/design/workspace` keeps its own set.

**Not verified yet.** This pass was built without the probe, screenshots or
the cloned-route pixel diff; those gates (plan, "Gates") are still to run.

## The Learning tab, and where the demo is hosted (2026-09-10)

**Learning tab.** `AgentPanel`'s opt-in `learning` prop adds a tab between
Configuration and Usage (`src/components/agent-panel/learning-tab.tsx`); the
signup handoff passes it, `/design/agent-panel` does not. Ground truth is
`docs/reference/overlays/thread-panel-learning.html`, a SCRUBBED capture:
every live insight was about the account (one quoted its email address), so
the text is replaced and only structure and classes are kept. Three sections
on the Configuration tab's own shell and spacing: Knowledge (Discover
knowledge, then Memories / Skills / Agents / Rubrics with Suggest and Auto),
Generation (the model that drafts insights) and Insights, which is its empty
line, because an agent that has never run has learned nothing. The switches
sit in two fixed-width columns so Suggest lines up down the list even where a
row has no Auto; the live panel right-aligns them and they wander. `Field`
moved to `panel-section.tsx` as `PanelField`, shared by both tabs.

**Hosting.** Vercel project `hyperagent-onboard` (scope "Karthik Sivacharan's
projects"), connected to this GitHub repo: every push to `main` deploys to
production at https://hyperagent-onboard.vercel.app, and other branches get
preview URLs. The project was created with `vercel project add`, which leaves
the framework preset at "Other" and serves `public/` only (the first deploy
was a 404 everywhere); it is set to Next.js now (`vercel api
/v9/projects/hyperagent-onboard -X PATCH -f framework=nextjs`). The first
production deploy was uploaded from a `git archive` of `main`, so no
git-ignored file (docs/research, other worktrees) left the machine.
`vercel link` also wrote a git-ignored `.env.local` with a short-lived
`VERCEL_OIDC_TOKEN` in the main checkout.

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
| `src/app/signup/`, `src/components/signup/` | The five-beat onboarding flow, outside `(app)` so it gets the root layout and none of the shell; `signup-screen.tsx` holds the step machine, the shared grid cell and the mark's FLIP |
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
| `src/app/design/` | The comparison pages: `/design/tools` (three composer Tools panels), `/design/skill-suggestions` (three ways to offer skills, none wired), `/design/agent-panel` (the config panel, not yet consolidated), `/design/agent-stream` (every streaming-turn block in every state), `/design/workspace` (the artifact workspace beside the thread view, not wired), `/design/logo` (the logo-motion studies the signup mark came from) |
| `src/components/workspace/` | The artifact workspace: wallpaper, glass toolbar, artifact cards, dock; static, Carousel layout only; mounts in any positioned box or through `ThreadView`'s `workspace` prop |
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
a `Co-Authored-By:` trailer naming the model that made the change (the
session tells you which; it has been Fable 5.1 and Opus 5) and a
`Claude-Session:` trailer for that session. Parallel work
runs as one branch per concern in git worktrees under `.claude/worktrees/`,
merged with `--no-ff`, gates re-run after each merge, worktrees and branches
removed afterwards.

## Prompt to start the next session

Everything is on `main` and pushed. The streaming agent turn merged from
`feat/agent-stream` with `--no-ff`; its worktree
(`.claude/worktrees/agent-stream`) and branch can be removed. The unrelated
`onboarding-exact` worktree is still there. The largest open pieces are now
the static agent panel (it always describes Design system drift) and a real
follow-up turn.

> Read HANDOFF.md in ~/Projects/hyperagent — especially "The signup flow",
> "The shell yields, the conversation does not", "The agent streams" and
> "Decided 2026-09-10: never name `transform` in a `transition-[…]` list" —
> then AGENTS.md, docs/brand/reskin-conventions.md and docs/components.md.
>
> You are on `main`, clean and pushed, all six gates passing. `/signup` is a
> five-beat invented flow (providers → a spinning-mark wait → a
> confirm-your-record screen → a chat screen that reads five public sources
> while four suggested-agent cards fill in behind it → and on send, the app
> shell arriving around the conversation while the agent streams its answer:
> reasoning, tool rows, prose, and a skills question you can answer).
> Everything is static mock data, nothing authenticates, the app defaults to
> dark.
>
> Three things on that page are load-bearing. The Hyperagent mark is a single
> never-unmounted element FLIPped between per-screen seats — read that effect
> in signup-screen.tsx before changing any layout, and never transform the
> stage or an ancestor of it. Nothing on the fourth screen may change height
> BEFORE SEND, because all four screens share one centred grid cell. And that
> cell must FIT THE VIEWPORT, or every screen scrolls and the column stops
> being centred. After send `<main>` becomes the thread's scroller with its
> top frozen where the stage stood, and the composer sits in a sticky dock:
> read "The agent streams" before touching either.
>
> Two gates exist so you do not have to re-derive any of this. `npm run
> probe:signup` drives the flow through send, waits for the streamed turn to
> reach its question, and sweeps 14 widths, asserting the conversation never
> falls under 512 while the panel is docked, the PAGE never scrolls (the
> thread may), nothing escapes the column or the agent panel, the composer is
> docked, and every control in the chrome is the topmost thing at its own
> centre; it exits 2 rather than publishing numbers if the shell or the turn
> did not actually arrive.
> `npm test` includes a rule that catches `transition-[…]` lists naming
> `transform` beside a v4 translate/scale/rotate utility.
>
> Know the three traps this repo has already paid for. (1) `overflow-x:
> hidden` on html/body forces their used `overflow-y` to `auto`, so a body
> scroll can exist while `documentElement` reports none — check all three
> scrollers and dispatch a real wheel. (2) Dispatch that wheel over the
> conversation, not at a fixed point, or it lands inside the panel and scrolls
> that instead. (3) **The gates do not look inside the agent panel.** A
> clipped panel passed every gate and `probe:signup` 3 of 3; it was caught by
> opening a screenshot; the probe now walks the panel too, but look at the
> pixels anyway. (4) **A programmatic `el.click()` proves nothing about
> whether a person can click it.** Twice now a control has been covered by an
> invisible layer and still passed; the probe hit-tests the chrome and presses
> a real mouse for its toggles. Do the same in any check you write.
>
> Two more things that will bite a rename or a refactor: `probe-signup.mjs`
> drives the flow by clicking the profile CTA's exact string ("Find agents for
> me"), and `HEADING_CHARS` in chat-step.tsx counts the h1's fixed words to
> size the shimmer band.
>
> Run `npm run dev` and walk the flow in both themes. **Do not start work:
> report what you have read and wait for instructions.**
