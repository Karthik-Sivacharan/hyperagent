# Brand design tokens

The Brand prototype's design-token system, brought into Hyperagent in phase 1 and, since plan step 5, the app's only palette: `brand.css` is the token sheet the whole document reads. Phase 2 rewired Hyperagent's components to these tokens; this directory is the reference that rewiring reads from.

Source: the brand prototype's own repository, kept outside this repo and never modified from here.

## What is here

| Path | What | From |
|---|---|---|
| `brand.css` | The app's token sheet: every primitive ramp, tint, semantic token, radius, shadow, type, motion, z-index and layout token on `:root`, the dark mapping on `.dark`, plus the base styles on `html`, `body` and `*`, the `genui-prose` block, the typography role classes and the `focus-ring` / `squircle` / `skeleton` classes. Plain CSS, no Tailwind directives. | `src/app/globals.css` |
| `fonts.ts` | `next/font/google` loaders for Geist (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`), and `brandFontClassName` joining the two `.variable` classes. Phase 2 replaced the prototype's Inter / PythiaType / Newsreader files with Geist and Vercel's published typography roles (docs/brand/design.md §4); no font files ship in this directory. | `src/app/layout.tsx` |
| `../../app/design/brand/` | The token swatch page at `/design/brand` (`layout.tsx`, `page.tsx`, `_design/theme-toggle.tsx`). `brand.css` itself is imported once, by the root layout `src/app/layout.tsx`. | `src/app/page.tsx`, `src/app/_design/theme-toggle.tsx` |
| `../../../docs/brand/design.md` | How to consume the tokens, with a preamble on how this copy differs. | `design.md` |
| `../../../docs/brand/brand-style-audit.md` | The raw measurements from the brand site (verbatim). | `docs/brand-style-audit.md` |
| `../../../scripts/brand/gen-ramps.mjs` | Regenerates the OKLCH ramps with `culori`; prints literals to paste into `brand.css`. | `scripts/gen-ramps.mjs` |
| `../../../docs/brand/hyperagent-DESIGN.md` | The portable form of these tokens: one DESIGN.md another Tailwind v4 + shadcn/ui codebase drops in (tokens as front matter, a pasteable token sheet, recipes for each shadcn component). Its token regions are generated from `brand.css` by `scripts/brand/build-design-md.mjs` (`npm run brand:design-md`); the script writes the same bytes to `public/design.md`, which the site serves at `/design.md` (the link to share); `src/design/brand/design-md.test.ts` fails when either drifts, and `npm run brand:lint-design-md` runs the DESIGN.md linter (`@google/design.md`) on it. | new (2026-09-21) |
| `../../../scripts/brand/check-contrast.mjs` | The WCAG AA gate (APCA reported) over every semantic pair in both themes; it parses `brand.css` by selector, the light block from `:root { }` and the dark block from `.dark { }`. | `scripts/check-contrast.mjs` |

Retired in the component system sweep (2026-09-07): `utils.ts` (the prototype's `cn()`, folded into `src/lib/utils.ts` in phase 2) and `ui/` (verbatim copies of the prototype's 23 shadcn primitives, which nothing ever imported). The app's one component set is `src/components/ui/` (29 primitives on these tokens; `docs/components.md`), and `src/components/components.test.ts` fails if the folder or an import of it comes back. Both stay in git history (`git log --all -- src/design/brand/ui`).

Not copied:

- `src/components/ui/chart.tsx`: it imports `recharts`, which Hyperagent does not install. Copy it alongside a `recharts` dependency when a chart is actually needed.
- `*.test.tsx`, `src/app/globals.test.ts`, `src/components/genui/token-lint.test.ts`: the token-presence test now lives at `src/design/brand/brand.test.ts` and `src/app/globals.test.ts` (`npm test`), and the lint as `scripts/brand/lint-tokens.mjs`. Their intent is worth keeping in mind for phase 2: `globals.test.ts` asserts the GenUI tokens exist in both themes (`--spacing-group/stack/section`, `--blur-glass`, `--shadow-edge/card/card-hover`, `--chart-6`, `--chart-track/grid/target/band`, `--chart-seq-1..5`, the `focus-ring` and `skeleton` utilities, `.genui-prose`); `token-lint.test.ts` forbids raw hex / `rgb()` / `oklch()` literals, stock Tailwind palette colours (`bg-gray-500`, `text-zinc-…`), arbitrary `px` values and `transition-all` in component class strings.

## How the sheet is wired

- `brand.css` defines the primitives (Brand's `@theme inline` ramps, names verbatim) and the light semantics (Brand's `:root`) in one `:root { }` rule and remaps the semantics in `.dark { }`. `next-themes` puts `dark` on `<html>` from the account menu's Theme item (`attribute="class"`, `defaultTheme="dark"`, `enableSystem` in `src/app/layout.tsx`; the app defaults to dark for anyone with no stored choice, the menu's "System" item follows the OS, the choice persists in localStorage). `<body>` carries no theme class.
- The base styles sit where Brand had them: `html` (font smoothing, text rendering, `font-synthesis: none`, kerning, optical sizing), `body` (canvas colour, `--font-sans`, 16/24 at 400, Geist's feature settings) and `*` (border and outline colours), plus `::selection`, `::placeholder` and `:focus-visible`.
- `brandFontClassName` goes on `<html>` so `--font-geist-sans` and `--font-geist-mono` are defined where the `--font-sans` / `--font-heading` / `--font-mono` stacks read them.
- Variable names collide with Tailwind's defaults on purpose. Tailwind v4 utilities compile to `var(--…)`, so `bg-neutral-500` is Brand's sand, `rounded-md` is `calc(var(--radius) * 0.8)`, `text-xl` is 20/28, `ease-out` is Brand's curve and `font-medium` is 500, everywhere in the app.
- The `@layer base / components / utilities` wrappers are kept. Cascade layers are standard CSS; the names merge into the layers Tailwind already declares in `src/app/globals.css`, so a base rule such as `* { border-color: var(--border) }` loses to `border-*` utilities exactly as it does in Brand. Written as an unlayered rule it would override them on every element.
- `.dark` sets `color-scheme: dark` (next-themes did this on `<html>` in Brand) so native controls and scrollbars follow the theme.
- A `@keyframes pulse` identical to Tailwind's is included so `--animate-skeleton` works even when the app never emits `animate-pulse`.
- The file passes through `@tailwindcss/postcss` untouched because it contains no Tailwind directives (`@import`, `@theme`, `@utility`, `@apply`, `--spacing()` were all removed or expanded). The root layout imports it once, after `globals.css`.

## The phase-2 bridge (landed)

Tailwind only generates utilities for names present in the main theme, so
phase 2 added an `@theme inline reference` block to `src/app/globals.css`
("PHASE 2 BRIDGE") that names every brand-only token and points it at the
variable of the same name: `bg-tangerine-500`, `bg-tint-10`,
`bg-surface-secondary`, `bg-brand`, `bg-chip`, `text-foreground-low`,
`border-border-subtle`, `font-strong`, `text-md`, `text-display`,
`rounded-5xl`, `rounded-bubble`, `shadow-card`, `shadow-edge`,
`max-w-content`, `gap-group`, `ease-out-quart`, `animate-typing-dot` and the
rest now exist app-wide and read the `:root` values in `brand.css`.
`reference` keeps Tailwind from re-emitting the variables on `:root`, so this
file stays the single source of truth and the contrast gate keeps reading one
file. The two Tailwind behaviours that needed care:

- `shadow-*` utilities inline their value at build time, so each brand shadow
  is named in the bridge (`--shadow-lg: var(--shadow-lg)` …) and the utility
  becomes a `var()` read of the token; `shadow-lg` is now the brand's glass
  composer shadow.
- `text-xl` etc. only emit the `--letter-spacing` / `--font-weight`
  companions that exist in the main theme at build time, so the bridge names
  those companions too; the brand's tracking and heading weights ride the
  `text-*` classes.

Durations and scales are plain custom properties (no Tailwind namespace):
`duration-(--duration-fast)`, `scale-(--scale-press)`. The typography role
classes (`text-label-12-caps` …) are plain classes in this sheet, not
utilities: they cannot take a variant such as `[&_h2]:text-label-12-caps`,
and `src/lib/utils.ts` registers them with tailwind-merge so `cn()` does not
read them as text colours. `npm run brand:lint-tokens` is the gate that keeps
components on the tokens (no raw colours, stock palette classes, px radii or
`transition-all`).

## Running the scripts

```sh
npm run brand:check-contrast          # WCAG AA gate over brand.css, both themes; exit 1 on failure
npm run brand:check-contrast -- --quiet
npm run brand:gen-ramps               # prints regenerated ramp literals + anchor / contrast probes
node scripts/brand/check-contrast.mjs path/to/other.css   # audit another sheet
```

Workflow for a new colour (design.md §14): add the family to `gen-ramps.mjs`, run it, paste the literals into the `:root { }` block, map a semantic token in both `:root` and `.dark`, add the pair to `PAIRS` in `check-contrast.mjs`, run the gate, mirror it on the swatch page, and if the name is brand-only add it to the bridge in `src/app/globals.css`.

## Phase 2 mapping: Hyperagent shadcn tokens ↔ Brand tokens

The Hyperagent values below are the phase-1 skin, kept here for the record: they left the code in plan step 5 (the last commit carrying them is `c10d36c`) and survive only in git history and as the captured reference in `docs/reference/`.

Hyperagent ships a dark, neutral (cool gray) palette with Geist for body/UI, Season Sans for display and Geist Mono. Brand is light-canonical with a full dark mapping, sand neutrals, one tangerine accent, and (since phase 2) Geist + Geist Mono on Vercel's typography roles. Brand values below are light / dark; primitives are Brand's ramp steps (`neutral-950` = `#1e1e1d`, `tangerine-600` = `#be4600`, …).

| Hyperagent token | Hyperagent value (dark) | Brand token | Brand value (light / dark) | Note |
|---|---|---|---|---|
| `--background` | `#090909` | `--background` | white / `neutral-950` `#1e1e1d` | Brand's dark canvas is warm charcoal, not near-black |
| `--foreground` | `#ebebeb` | `--foreground` | `neutral-950` / `neutral-100` `#efefed` | |
| `--card` | `#121212` | `--card` | white / `neutral-900` `#2a2a28` | in light, cards share the canvas colour; separation is `--border-subtle` or `--shadow-card` |
| `--card-foreground` | (foreground) | `--card-foreground` | `neutral-950` / `neutral-100` | |
| `--popover` | `#0d0d0d` | `--popover` | white / `neutral-900` | |
| `--popover-foreground` | (foreground) | `--popover-foreground` | `neutral-950` / `neutral-100` | |
| `--primary` | `#ebebeb` | `--primary` | `neutral-950` / `neutral-100` | ink button in both systems |
| `--primary-foreground` | `#090909` | `--primary-foreground` | white / `neutral-950` | |
| `--secondary` | `#1b1b1b` | `--secondary` | `neutral-50` / `neutral-900` | |
| `--secondary-foreground` | (foreground) | `--secondary-foreground` | `neutral-950` / `neutral-100` | |
| `--muted` | `#222222` | `--muted` | `neutral-50` / `neutral-900` | |
| `--muted-foreground` | `#a4a4a4` | `--muted-foreground` | `neutral-700` `#64635e` / `neutral-400` `#b4b3ad` | Brand's fg-mid tier |
| `--accent` | `#242424` | `--accent` | `neutral-100` / `neutral-900` | hover fill |
| `--accent-foreground` | (foreground) | `--accent-foreground` | `neutral-950` / `neutral-100` | |
| `--destructive` | (shadcn default) | `--destructive` | `red-600` / `red-500` | darker fill + white text in light, lighter fill + dark text in dark |
| `--destructive-foreground` | | `--destructive-foreground` | white / `neutral-950` | |
| `--border` | `#3a3a3a80` (alpha) | `--border` | `neutral-300` `#dad9d6` / `neutral-800` `#3b3a37` | Brand's `--border` is solid; its translucent hairlines are `--border-subtle` (`tint-12`) and `--border-loud` (`tint-20`), the closer analogue to Hyperagent's alpha border |
| `--input` | `#1b1b1b` (a fill) | `--input` | `tint-20` (both) | Brand's input token is an outline tint, not a fill |
| `--ring` | `#9e9e9e80` (neutral) | `--ring` | `tangerine-500` / `tangerine-400` | neutral ring becomes the brand ring |
| `--sidebar` | `#0d0d0d` | `--sidebar` | `neutral-50` / `neutral-950` | |
| `--sidebar-foreground` | | `--sidebar-foreground` | `neutral-950` / `neutral-100` | |
| `--sidebar-primary` | | `--sidebar-primary` | `neutral-950` / `neutral-100` | |
| `--sidebar-primary-foreground` | | `--sidebar-primary-foreground` | white / `neutral-950` | |
| `--sidebar-accent` | `#1f1f1f` | `--sidebar-accent` | `neutral-100` / `neutral-900` | |
| `--sidebar-accent-foreground` | | `--sidebar-accent-foreground` | `neutral-950` / `neutral-100` | |
| `--sidebar-border` | `#42424266` (alpha) | `--sidebar-border` | `neutral-300` / `neutral-800` | see `--border` |
| `--sidebar-ring` | | `--sidebar-ring` | `tangerine-500` / `tangerine-400` | |
| `--chart-1` … `--chart-5` | (shadcn defaults) | `--chart-1` … `--chart-6` | tangerine-500, neutral-700, blue-600, green-600, amber-600, red-600 / all lifted to the 400 step | plus `--chart-track`, `--chart-grid`, `--chart-target`, `--chart-band`, `--chart-seq-1..5` |
| `--surface` | `#161616` | `--surface-raised` or `--surface-elevated` | `neutral-100` / `neutral-925` `#222221` · white / `neutral-900` | Hyperagent's `--surface` sits between card and accent; Brand splits that role into raised (a whisper above the canvas) and elevated (cards, composer, popovers). Decide per use |
| `--radius` | `.875rem` (14px) | `--radius` | `10px`, multiplicative scale | Hyperagent's base radius equals Brand's `--radius-xl` (14px). Brand's `rounded-*` steps are ratios of the knob (`xs` 4, `sm` 6, `md` 8, `lg` 10, `xl` 14, `2xl` 18, `3xl` 22, `4xl` 26, `5xl` 32, `bubble` 20, `hero` 72, `squircle` 80) |
| `--font-geist-sans` (body / UI) | Geist | `--font-sans` | Geist (`--font-geist-sans`) | same face; headings take the 600 heading weight (`--font-weight-heading`) from the `text-*` roles |
| Season Sans (display) | | `--font-heading` / `--font-display` | Geist | one family for display and body |
| `--font-geist-mono` | Geist Mono | `--font-mono` | Geist Mono (`--font-geist-mono`) | identical face |

### Brand tokens with no Hyperagent counterpart

These need a home in phase 2 (a new semantic token in Hyperagent, or a component-level decision):

- Surfaces and tiers: `--surface-secondary` (`neutral-50` / `neutral-975`, sunken below the dark canvas), `--surface-elevated`, `--surface-raised`, `--foreground-low` (`neutral-600` / `neutral-500`, the tertiary text tier), `--foreground-inverted`, `--overlay`, `--scrim`.
- Borders: `--border-subtle` (`tint-12`), `--border-loud` (`tint-20`).
- Brand: `--brand` (`tangerine-600`, text-bearing fill), `--brand-foreground`, `--brand-accent` (`tangerine-500` / `tangerine-400`, graphical only), `--brand-subtle`, `--brand-subtle-foreground`, `--selection`, `--selection-foreground`.
- Chips and chat: `--chip`, `--chip-foreground`, `--chat-bubble-user(-foreground)`, `--chat-bubble-assistant(-foreground)`.
- Status: `--success`, `--warning`, `--info` (+ `-foreground`).
- Mind score tiers: `--mind-novice` … `--mind-eternal` (graphic use only).
- Tints: `--tint-5/7/10/12/15/20/25/40` (theme-switched base: `neutral-500` in light, `neutral-600` in dark) and their `--color-tint-*` aliases.
- Shadow layers: `--highlight`, `--highlight-soft`, `--highlight-strong`, `--edge`; shadows `--shadow-edge/card/card-hover/avatar/rim/hero`.
- Radius extras: `--radius-5xl/bubble/hero/squircle`.
- Type: `--text-md` (13px metadata), `--text-display` (+ companions), `--font-weight-strong` (550, strong inside copy), `--font-weight-heading` (600, the heading weight), the role classes `text-heading-display`, `text-heading-lg`, `text-label-14-mono`, `text-label-12-mono`, `text-label-12-caps`.
- Motion: `--duration-*` (exit 90 · instant 100 · enter 140 · fast 150 · normal 200 · move 220 · slow 300 · reveal 400 · slide 480 · entrance 500 · stagger 80), `--ease-*` (out, out-quart, out-quint, out-layout, out-expo, in-out, linear), `--scale-press`, `--scale-press-icon`, `--scale-enter`, `--translate-enter`, `--animate-typing-dot`, `--animate-skeleton`, `--animate-ring-draw`.
- Layout: `--container-content/wide/nav`, `--spacing-group/stack/section`, `--blur-glass`, `--z-sticky/scrim/dropdown/modal/tooltip/toast`.
