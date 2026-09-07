# Brand design tokens (scoped copy)

A self-contained copy of the Brand prototype's design-token system, brought into Hyperagent without touching the app's own theme. Nothing here applies outside an element carrying the class `theme-brand`. Phase 2 rewires Hyperagent's components to these tokens; this directory is the faithful reference that rewiring reads from.

Source: the brand prototype's own repository, kept outside this repo and never modified from here.

## What is here

| Path | What | From |
|---|---|---|
| `brand.css` | The token sheet: every primitive ramp, tint, semantic token, radius, shadow, type, motion, z-index and layout token, plus the scoped base styles, the `genui-prose` block, the typography role classes and the `focus-ring` / `squircle` / `skeleton` classes. Plain CSS, no Tailwind directives. | `src/app/globals.css` |
| `fonts/` | `InterVariable.woff2`, `InterVariable-Italic.woff2`, `PythiaType-SemiBold.woff2` (PythiaType is Brand's proprietary display face: prototype use only, do not redistribute). | `src/app/fonts/` |
| `fonts.ts` | `next/font` loaders: `brandInter` (`--font-inter`), `brandPythia` (`--font-pythia`), `brandNewsreader` (`--font-newsreader`), `brandGeistMono` (`--font-geist-mono`), and `brandFontClassName` joining all four `.variable` classes. | `src/app/layout.tsx` |
| `utils.ts` | Brand's `cn()`: tailwind-merge extended with the `font-book` / `font-firm` weight group. The `ui/` copies import this, not `@/lib/utils`, so a caller's `font-book` beats a component's `font-medium` as it does in Brand. | `src/lib/utils.ts` |
| `ui/` | Verbatim copies of Brand's shadcn primitives (23 files). Only the imports changed: `@/lib/utils` → `@/design/brand/utils`, `@/components/ui/button` → `./button`, `@/components/ui/toggle` → `./toggle`. Nothing imports them yet. | `src/components/ui/*.tsx` |
| `../../app/design/brand/` | The token swatch page at `/design/brand` (`layout.tsx`, `page.tsx`, `_design/theme-toggle.tsx`). The layout is the only importer of `brand.css`. | `src/app/page.tsx`, `src/app/_design/theme-toggle.tsx` |
| `../../../docs/brand/design.md` | How to consume the tokens, with a preamble on how this copy differs. | `design.md` |
| `../../../docs/brand/brand-style-audit.md` | The raw measurements from the brand site (verbatim). | `docs/brand-style-audit.md` |
| `../../../scripts/brand/gen-ramps.mjs` | Regenerates the OKLCH ramps with `culori`; prints literals to paste into `brand.css`. | `scripts/gen-ramps.mjs` |
| `../../../scripts/brand/check-contrast.mjs` | The WCAG AA gate (APCA reported) over every semantic pair in both themes. | `scripts/check-contrast.mjs` |

Not copied:

- `src/components/ui/chart.tsx`: it imports `recharts`, which Hyperagent does not install. Copy it alongside a `recharts` dependency when a chart is actually needed.
- `*.test.tsx`, `src/app/globals.test.ts`, `src/components/genui/token-lint.test.ts`: vitest is not set up here. Their intent is worth keeping in mind for phase 2: `globals.test.ts` asserts the GenUI tokens exist in both themes (`--spacing-group/stack/section`, `--blur-glass`, `--shadow-edge/card/card-hover`, `--chart-6`, `--chart-track/grid/target/band`, `--chart-seq-1..5`, the `focus-ring` and `skeleton` utilities, `.genui-prose`); `token-lint.test.ts` forbids raw hex / `rgb()` / `oklch()` literals, stock Tailwind palette colours (`bg-gray-500`, `text-zinc-…`), arbitrary `px` values and `transition-all` in component class strings.

## The scoping contract

- Put `theme-brand` on an ancestor and the subtree is themed: `brand.css` defines every variable on `.theme-brand` (Brand's `@theme inline` primitives and its `:root` semantics, merged, names verbatim) and remaps the semantics on `.theme-brand.dark, .dark .theme-brand`. Put `dark` on the same element or any ancestor (an app-level next-themes `html.dark` works too).
- Put `brandFontClassName` on the same element so `--font-inter` etc. are defined where the `--font-sans` / `--font-heading` / `--font-mono` stacks read them.
- Variable names collide with Tailwind's defaults on purpose. Tailwind v4 utilities compile to `var(--…)`, so inside the scope `bg-neutral-500` is Brand's sand, `rounded-md` is `calc(var(--radius) * 0.8)`, `text-xl` is 20/28, `ease-out` is Brand's curve, `font-medium` is 500. The rest of the app never sees these values because no element outside the scope carries the class.
- The `@layer base / components / utilities` wrappers are kept (every selector inside them is scoped). Cascade layers are standard CSS; the names merge into the layers Tailwind already declares in `src/app/globals.css`, so a scoped base rule such as `.theme-brand * { border-color: var(--border) }` loses to `border-*` utilities exactly as it does in Brand. Written as an unlayered rule it would override them on every descendant.
- The file passes through `@tailwindcss/postcss` untouched because it contains no Tailwind directives (`@import`, `@theme`, `@utility`, `@apply`, `--spacing()` were all removed or expanded). It is safe to import from any nested layout.

## The phase-2 bridge (landed)

Tailwind only generates utilities for names present in the main theme, so
phase 2 added an `@theme inline reference` block to `src/app/globals.css`
("PHASE 2 BRIDGE") that names every brand-only token and points it at the
variable of the same name: `bg-tangerine-500`, `bg-tint-10`,
`bg-surface-secondary`, `bg-brand`, `bg-chip`, `text-foreground-low`,
`border-border-subtle`, `font-book`, `text-md`, `text-display`,
`rounded-5xl`, `rounded-bubble`, `shadow-card`, `shadow-edge`,
`max-w-content`, `gap-group`, `ease-out-quart`, `animate-typing-dot` and the
rest now exist app-wide and resolve inside `.theme-brand` (which sits on
`<body>`). `reference` keeps Tailwind from re-emitting the variables on
`:root`, so this file stays the single source of truth and the contrast gate
keeps reading one file. The two Tailwind behaviours that needed care:

- `shadow-*` utilities inline their value at build time, so each brand shadow
  is named in the bridge (`--shadow-lg: var(--shadow-lg)` …) and the utility
  becomes a `var()` read of the token; `shadow-lg` inside the scope is now
  the brand's glass composer shadow.
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

Workflow for a new colour (design.md §14): add the family to `gen-ramps.mjs`, run it, paste the literals into the `.theme-brand { }` block, map a semantic token in both `.theme-brand` and `.theme-brand.dark`, add the pair to `PAIRS` in `check-contrast.mjs`, run the gate, mirror it on the swatch page.

## Phase 2 mapping: Hyperagent shadcn tokens ↔ Brand tokens

Hyperagent today ships a dark, neutral (cool gray) palette with Geist for body/UI, Season Sans for display and Geist Mono. Brand is light-canonical with a full dark mapping, sand neutrals, one tangerine accent, Inter + PythiaType (Newsreader fallback) + Geist Mono. Brand values below are light / dark; primitives are Brand's ramp steps (`neutral-950` = `#1e1e1d`, `tangerine-600` = `#be4600`, …).

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
| `--font-geist-sans` (body / UI) | Geist | `--font-sans` | Inter Variable (`--font-inter`) | |
| Season Sans (display) | | `--font-heading` | PythiaType SemiBold (`--font-pythia`), Newsreader fallback | serif display over a sans body |
| `--font-geist-mono` | Geist Mono | `--font-mono` | Geist Mono (`--font-geist-mono`) | identical face; both loaders expose the same variable name |

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
- Type: `--text-md`, `--text-display` (+ companions), `--font-weight-book` (450), `--font-weight-firm` (470), the role classes `text-heading-display`, `text-heading-lg`, `text-label-14-mono`, `text-label-12-mono`, `text-label-12-caps`.
- Motion: `--duration-*` (exit 90 · instant 100 · enter 140 · fast 150 · normal 200 · move 220 · slow 300 · reveal 400 · slide 480 · entrance 500 · stagger 80), `--ease-*` (out, out-quart, out-quint, out-layout, out-expo, in-out, linear), `--scale-press`, `--scale-press-icon`, `--scale-enter`, `--translate-enter`, `--animate-typing-dot`, `--animate-skeleton`, `--animate-ring-draw`.
- Layout: `--container-content/wide/nav`, `--spacing-group/stack/section`, `--blur-glass`, `--z-sticky/scrim/dropdown/modal/tooltip/toast`.
