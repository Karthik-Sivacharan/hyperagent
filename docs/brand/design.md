> ## How this copy differs from Brand's `design.md`
>
> This is Brand's design-system guide, carried into Hyperagent as a **scoped** copy (phase 1). Read it with these substitutions in mind:
>
> - **Source of truth here is `src/design/brand/brand.css`**, not `src/design/brand/brand.css`. Every token keeps its Brand name, but the whole sheet is scoped under a `.theme-brand` class: Brand's `@theme inline` and `:root` became one `.theme-brand { … }` rule, and `.dark` became `.theme-brand.dark, .dark .theme-brand`. Nothing applies outside an element carrying `theme-brand`.
> - **There is no `@theme` yet.** Tailwind utilities for Brand-only names (`bg-tangerine-500`, `bg-tint-10`, `font-heading`, `ease-out-quart`, `text-display`, `rounded-5xl`, `shadow-card`, `bg-brand`, `bg-surface-secondary`, …) do not exist until phase 2 adds an `@theme inline` bridge to `src/design/brand/brand.css`. Utilities whose names Tailwind ships by default (`bg-neutral-500`, `rounded-md`, `text-xl`, `ease-out`, `font-medium`) already resolve through `var(--…)` and so re-theme inside `.theme-brand`; `shadow-*` does not (Tailwind inlines shadow values at build time). Until phase 2, consume tokens with `var()` (`style={{ background: "var(--color-tangerine-500)" }}`).
> - **`@utility` classes are plain classes** in the utilities layer (`.focus-ring`, `.squircle`, `.skeleton`), and `.genui-prose` / the `text-heading-*` / `text-label-*` roles are plain scoped classes. The `@layer base / components / utilities` wrappers are kept so they lose to utilities exactly as in Brand.
> - **Theme switching is local.** The swatch page toggles a `dark` class on its own wrapper (`src/app/design/brand/_design/theme-toggle.tsx`, local state + `localStorage`); `next-themes` is not used by this copy. An app-level `html.dark` also works, because `.dark .theme-brand` is part of the selector.
> - **File paths were updated** throughout: fonts in `src/design/brand/fonts/` with loaders in `src/design/brand/fonts.ts`; the swatch page at `src/app/design/brand/page.tsx` (rendered at `/design/brand`); reference component copies in `src/design/brand/ui/`; scripts in `scripts/brand/` (`npm run brand:gen-ramps`, `npm run brand:check-contrast`); the audit at `docs/brand/brand-style-audit.md`. `chart.tsx` was not copied (it needs `recharts`, which Hyperagent does not install). See `src/design/brand/README.md` for the phase-2 token mapping table.
>
> Everything below this line is Brand's text, edited only for those paths.

# Brand Design System

> Machine- and human-readable guidelines for the Brand prototype design tokens.
> **Single source of truth:** `src/design/brand/brand.css`. If a value here ever disagrees with that file, the CSS wins.
> **Where the values come from:** `docs/brand/brand-style-audit.md` (measured on the brand site) and `scripts/brand/gen-ramps.mjs` (regenerates every ramp with `culori`).

- **Name:** Brand (prototype tokens; not affiliated with the brand site)
- **Stack:** Next.js 16 (App Router) · Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config`) · shadcn/ui config (`radix-nova`, no components installed) · TypeScript
- **Fonts:** Inter (sans) · **PythiaType SemiBold** (serif display, Brand's own face, weight 600 only, self-hosted from `src/design/brand/fonts/` via `next/font/local` — proprietary, for this work-trial prototype only; Newsreader is the declared fallback) · Geist Mono, loaded in `src/design/brand/fonts.ts`
- **Color space:** OKLCH throughout
- **Radius knob:** `--radius: 10px`, multiplicative scale
- **Themes:** light (canonical) / dark, `next-themes` with `attribute="class"`, `defaultTheme="system"` (matches the brand site)

---

## 1. Philosophy

Brand is **white, warm, and conversational**: a paper-white canvas, sand-tinted neutrals, a single hot tangerine accent, serif headlines over Inter, and everything shaped like a pill. It should feel like a calm chat with a person, not a dashboard.

- **One accent, rarely solid.** Tangerine `oklch(0.67 0.20 42)` (`#f55d00`) marks the primary CTA, the user's chat bubble, focus rings and text selection, and nothing else. The default button is **ink**, not orange.
- **Sand, not gray.** Neutrals carry a faint warm, yellow-leaning tint (hue ~100, chroma ≤ 0.010) so surfaces read as paper rather than steel.
- **Fills are tints.** Brand builds almost every surface from a translucent mid-sand (`tint-5` … `tint-40`) instead of solid steps, so one class works on both themes. Reach for `bg-tint-10` / `hover:bg-tint-15` before a solid.
- **Soft everywhere.** 10px base radius, 22–32px on cards and the composer, `rounded-full` on chips, tabs, avatars and icon buttons. Only menu items go as tight as 8px.
- **Glass, not drop shadows.** Elevation is a stack of low-alpha umbra layers plus 1px inset white highlights; separation otherwise comes from hairline (12–20% alpha) borders.
- **Status is vivid but quieter than brand.** Red / green / amber / blue share one chroma envelope (peak 0.16) below the brand's 0.20.
- **Accessibility is a gate, not a goal.** Every semantic pairing passes WCAG AA (`npm run brand:check-contrast`). Where the brand site's own colors fall short, ours are deepened one step and the deviation is recorded in section 10.
- **Motion is quick and springy.** 150–300ms with quart / expo ease-out curves; 400–500ms only for reveals and staggered first-paint entrances.

---

## 2. How to consume tokens

Tokens resolve through a three-tier chain. **Always consume the highest tier that fits.**

```
primitive                 semantic (shadcn + Brand)     component
--color-tangerine-600  →  --brand                     →  bg-brand / text-brand-foreground
--color-neutral-300    →  --border                    →  border-border
--color-tint-10        →  (use directly)              →  bg-tint-10 hover:bg-tint-15
```

1. **Primitives:** raw ramps (`--color-neutral-500`, `--color-tangerine-600`, `--color-tint-10`). Defined in `@theme inline`. Use only when building a new semantic token, for a tint fill, or for a one-off swatch.
2. **Semantic tokens:** the shadcn contract (`--background`, `--primary`, `--muted`, `--border` …) plus Brand's own (`--surface-secondary`, `--foreground-low`, `--brand`, `--brand-accent`, `--chip`, `--chat-bubble-*`). Defined in `:root` (light) and re-mapped in `.dark`. **This is what components should use.**
3. **Component utilities:** Tailwind classes generated from the tokens (`bg-primary`, `text-muted-foreground`, `rounded-3xl`, `shadow-lg`, `ease-out-quart`, `font-heading`).

### `@theme inline` caveat (important)

The token block uses `@theme inline`. Tailwind only emits a `:root` CSS variable for a primitive **if a semantic token references it**. So `var(--color-blue-400)` may not exist at runtime even though the token is declared. Two consequences:

- **In CSS / inline styles:** prefer the semantic var (`var(--brand)`), which always exists.
- **In JSX:** use the literal utility class as a complete string (`bg-tangerine-500`), never a constructed string (`` `bg-${c}-500` ``); Tailwind's JIT only generates utilities it can see verbatim in source.

### Light/dark

`next-themes` toggles a `.dark` class on `<html>` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`). The custom variant `@custom-variant dark (&:is(.dark *))` powers `dark:` utilities. Semantic tokens re-map under `.dark`; **primitives do not change.** Only the mapping does. Because fills are tints, most components need no `dark:` overrides at all.

---

## 3. Color

### 3.1 Primitive ramps

All ramps run 50 (lightest) → 950 (darkest) and share **one lightness ramp**, anchored to values measured on the brand site:

| Step | L | Anchor |
|---|---|---|
| 50 | 0.9818 | sand-2 `#f9f9f8` (secondary surface) |
| 100 | 0.9520 | sand-3 / dark fg-high `#eeeeec` |
| 200 | 0.9097 | sand-5 |
| 300 | 0.8852 | sand-6 `#dad9d6` (light border) |
| 400 | 0.7666 | dark sand-11 `#b5b3ad` (dark secondary text) |
| 500 | 0.6700 | brand `oklch(.67 .22 42)` |
| 600 | 0.5530 | AA-safe text/fill step (see §10) |
| 700 | 0.4981 | sand-11 `#63635e` (secondary text) |
| 800 | 0.3484 | dark sand-6 `#3b3a37` (dark border) |
| 900 | 0.2843 | dark sand-4 `#2a2a28` (dark elevated) |
| 950 | 0.2346 | dark canvas `#1e1e1d` (also the light ink) |

**Neutral (sand):** hue 100, chroma 0.001–0.010. Surfaces and text.

| Step | OKLCH | hex | Step | OKLCH | hex |
|---|---|---|---|---|---|
| 50  | `0.9818 0.0013 100` | `#f9f9f8` | 500 | `0.6700 0.0100 100` | `#96958f` |
| 100 | `0.9520 0.0025 100` | `#efefed` | 600 | `0.5530 0.0089 100` | `#73736d` |
| 200 | `0.9097 0.0042 100` | `#e2e1de` | 700 | `0.4981 0.0078 100` | `#64635e` |
| 300 | `0.8852 0.0042 100` | `#dad9d6` | 800 | `0.3484 0.0053 100` | `#3b3a37` |
| 400 | `0.7666 0.0087 100` | `#b4b3ad` | 900 | `0.2843 0.0036 100` | `#2a2a28` |
|     |                     |           | 950 | `0.2346 0.0019 100` | `#1e1e1d` |

**Tangerine (brand):** hue 42, peak chroma 0.20 at 500 (the sRGB gamut limit at that lightness; Brand's source token `oklch(.67 .22 42)` renders as exactly this on sRGB screens).

| Step | OKLCH | hex | Step | OKLCH | hex |
|---|---|---|---|---|---|
| 50  | `0.9818 0.0093 42` | `#fff7f4` | 500 | `0.6700 0.2022 42` | `#f55d00` |
| 100 | `0.9520 0.0220 42` | `#fdebe4` | 600 | `0.5530 0.1668 42` | `#be4600` |
| 200 | `0.9097 0.0450 42` | `#fdd8ca` | 700 | `0.4981 0.1503 42` | `#a53c00` |
| 300 | `0.8852 0.0638 42` | `#ffccb9` | 800 | `0.3484 0.1051 42` | `#652100` |
| 400 | `0.7666 0.1447 42` | `#ff9166` | 900 | `0.2843 0.0850 42` | `#4b1700` |
|     |                    |           | 950 | `0.2346 0.0600 42` | `#341205` |

**Status hues** (`red` 25, `green` 158, `amber` 70, `blue` 252) share one chroma envelope; steps that exceeded sRGB were clamped by `gen-ramps.mjs` (mostly the very light and very dark ends, and green/amber mid-ramp).

| Step | Chroma | Step | Chroma |
|---|---|---|---|
| 50  | ~0.012 | 500 | ~0.160 (peak) |
| 100 | ~0.024 | 600 | ~0.155 |
| 200 | ~0.050 | 700 | ~0.135 |
| 300 | ~0.085 | 800 | ~0.100 |
| 400 | ~0.125 | 900 | ~0.075 |
|     |        | 950 | ~0.050 |

Representative hex: `red-500 #e76761` · `green-500 #00b16f` · `amber-500 #cd8300` · `blue-500 #3f98f4`; `red-600 #bc4441` · `green-700 #007648` · `amber-600 #9e6400` · `blue-600 #1774c9`.

**Tint:** `neutral-500` at fixed alphas, the workhorse fill. `tint-5` (pressed), `tint-7` (row hover), `tint-10` (chip rest), `tint-12` (skeleton, hairline), `tint-15` (chip hover), `tint-20` (loud border, active), `tint-25` (dark hover on inline reference chips), `tint-40` (dividers). The base is theme-switched (`--tint-*` literals in `:root` / `.dark`): `neutral-500` in light, `neutral-600` in dark, because Brand's sand-9 drops from L .64 to L .53 in dark and a single base made every dark fill one step too bright. Utilities: `bg-tint-10`, `border-tint-12`, etc. White/black alpha needs are native Tailwind (`bg-white/60`, `from-black/80`).

### 3.2 Semantic mapping

| Token | Light | Dark |
|---|---|---|
| `background` | `oklch(1 0 0)` white | `neutral-950` `#1e1e1d` |
| `foreground` | `neutral-950` | `neutral-100` |
| `card` / `popover` | white | `neutral-900` |
| `surface-secondary` | `neutral-50` | `neutral-975` (sunken below the canvas, like Brand) |
| `surface-elevated` | white | `neutral-900` |
| `surface-raised` | `neutral-100` | `neutral-925` (one whisper above the canvas, Brand's dark sand-3; the hero backdrop gradient start — anything lighter shows the card's bottom corners) |
| `primary` | `neutral-950` (ink) | `neutral-100` |
| `primary-foreground` | white | `neutral-950` |
| `secondary` / `muted` | `neutral-50` | `neutral-900` |
| `muted-foreground` | `neutral-700` | `neutral-400` |
| `foreground-low` | `neutral-600` | `neutral-500` |
| `accent` | `neutral-100` | `neutral-900` |
| `accent-foreground` | `neutral-950` | `neutral-100` |
| `chip` / `chip-foreground` | `neutral-100` / `neutral-700` | `neutral-900` / `neutral-400` |
| `brand-accent` (graphical) | `tangerine-500` | `tangerine-400` |
| `brand` / `brand-foreground` | `tangerine-600` / white | `tangerine-600` / white |
| `brand-subtle` / `-foreground` | `tangerine-50` / `tangerine-700` | `tangerine-950` / `tangerine-300` |
| `chat-bubble-user` / `-foreground` | `tangerine-600` / white | `tangerine-600` / white |
| `chat-bubble-assistant` / `-foreground` | `neutral-100` / `neutral-950` | `neutral-900` / `neutral-100` |
| `selection` / `-foreground` | `tangerine-500` @ 18% / `tangerine-700` | `tangerine-400` @ 22% / `tangerine-300` |
| `destructive` / `-foreground` | `red-600` / white | `red-500` / `neutral-950` |
| `success` / `-foreground` | `green-700` / white | `green-500` / `neutral-950` |
| `warning` / `-foreground` | `amber-600` / white | `amber-500` / `neutral-950` |
| `info` / `-foreground` | `blue-600` / white | `blue-500` / `neutral-950` |
| `border` | `neutral-300` | `neutral-800` |
| `border-subtle` / `border-loud` | `tint-12` / `tint-20` | same |
| `input` | `tint-20` | `tint-20` |
| `ring` | `tangerine-500` | `tangerine-400` |
| `highlight` / `-soft` / `-strong` (shadow insets) | white @ .5 / .2 / 1 | white @ .15 / .05 / .08 |
| `edge` (dark 1px rim in shadows) | transparent | white @ .07 |

**Patterns to note.** Cards share the canvas colour (as on the brand site) and rely on `border-subtle` or a glass shadow for separation. Status and destructive use **darker fills + white text** in light and **lighter fills + dark text** in dark. `brand-accent` is the exact brand hex and is reserved for graphical uses (3:1 gate); anything that carries text on orange uses `brand` (one step deeper, 5.2:1 with white). In dark, the brand site's secondary surface is *sunken* (`#191918`, darker than the canvas) and ours is too: the ramp gained `neutral-975` for it, so `surface-secondary` is a step below the canvas in both themes (this row used to sit in §10 as a deviation; it is one no more). Sampled on the brand site/~ 2026-09-02: their whole dashboard runs on two card grounds — `surface-secondary` sections that group, and `surface-primary` + a shadow for the tile you act on inside one.

**Charts** (`chart-1..5`): tangerine-500, neutral-700, blue-600, green-600, amber-600 (light); every series lifts to the 400 step in dark (≥7:1 on the canvas). **Sidebar** (`sidebar-*`) mirrors the surface-secondary / ink logic.

---

### 3.3 Brand-specific semantics

**Dialog layer.** `overlay` (dialog / sheet surface: white in light, `neutral-900` in dark) · `scrim` (`black/30`, pair with `backdrop-blur-xs`; Brand keeps the same alpha in dark) · `foreground-inverted` (text on ink fills: white / black). Brand's sign-in gate is exactly this: `rounded-4xl` overlay card on a blurred scrim, ink pill primary ("Continue with Google") + `surface-secondary` pill secondary ("Continue with Email"), 200ms quart-out.

**Mind score tiers.** Brand's knowledge-depth badge (the leaf icon beside "31K Mind") has seven tiers, each a fixed colour with a lifted dark remap. Kept as Brand's exact hexes; **graphic use only** (`text-mind-*` / `bg-mind-*` on the icon) — never on text.

| Tier | Light | Dark |
|---|---|---|
| `mind-novice` | `#ff5a01` | `#ffb366` |
| `mind-skilled` | `#e52310` | `#ff7a66` |
| `mind-expert` | `#7c009e` | `#b366cc` |
| `mind-master` | `#4e7daa` | `#7da3cc` |
| `mind-sage` | `#17572b` | `#4a8a5c` |
| `mind-legendary` | `#c79041` | `#e6b973` |
| `mind-eternal` | `#000000` | `#66a3b8` |

---

## 4. Typography

Three families, set as CSS variables on `<html>` by `next/font/google` and consumed by `@theme`:

- `--font-sans`: `var(--font-inter), ui-sans-serif, system-ui, sans-serif` → `font-sans` (body, UI). Inter with `opsz`; body enables Brand's alternates `cv03 cv04 cv06 cv09 cv11 ss08`.
- `--font-heading`: `var(--font-pythia), var(--font-newsreader), ui-serif, Georgia, serif` → `font-heading`. **PythiaType SemiBold is Brand's own display face** (self-hosted in `src/design/brand/fonts/`, weight 600 only — with `font-synthesis: none` every heading weight renders the 600 face, as on the brand site). Newsreader (Google, variable weight + optical size) is the fallback and still backs `--font-serif`. The font file is proprietary: it stays in this work-trial prototype and must not be redistributed.
- `--font-mono`: `var(--font-geist-mono), ui-monospace, …` → `font-mono` (exact match; the brand site uses Geist Mono).

**Weights:** `font-normal` 400 · `font-book` 450 (subtle buttons) · `font-firm` 470 (inline reference chips) · `font-medium` 500 (labels, chips, tabs) · `font-semibold` 600 (headings).

**Scale** (native `--text-*` tokens with paired line-height / tracking / weight; use `text-<size>`):

| Token | px / line-height / tracking / weight | Brand use |
|---|---|---|
| `display` | `clamp(36px, 10vw, 52px)` / 1.1 / -0.025em / 600 | profile name (`font-heading text-display`) |
| `5xl` | 52 / 1.1 / -0.025em / 600 | h1 desktop |
| `4xl` | 36 / 1.1 / -0.025em / 600 | h1 mobile |
| `3xl` | 28 / 34 / -0.025em / 600 | tile names (md+) |
| `2xl` | 24 / 32 / -0.025em / 500 | dialog titles ("Sign in to continue with…"); tile names are `text-[22px]` |
| `xl` | 20 / 28 / -0.025em / 600 | section headings ("Ask me about") |
| `lg` | 18 / 27 / -0.013em | about copy, composer (md+) |
| `base` | 16 / 24 / -0.015em | body, suggested questions, composer |
| `md` | 16 / 24 / -0.015em | Brand's `text-md` alias ("Follow Nir for more…"); question bubbles are `text-[15px]` |
| `sm` | 14 / 20 / 0 | chips, tabs, buttons (add `font-medium`); tracking resets to normal |
| `xs` | 12 / 16 / -0.02em | captions, footer |

**Tracking:** `body` sets `letter-spacing: -0.015em` (Brand's running-copy tracking, -0.24px at 16px). Every `--text-*` token carries its own `--letter-spacing`, so `text-sm` (0) and `text-xs` (-0.02em) override it.

**Utility roles** (font-family can't ride `--text-*`): `text-heading-display` (serif fluid h1), `text-heading-lg` (serif 18px / 1.3 / 500, list-row names), `text-label-14-mono`, `text-label-12-mono` (tabular numerals), `text-label-12-caps` (Inter 12/16 / 500 / +0.06em / uppercase — the label over a *group* of cards).

### 4.1 The three text tiers

A page that sets everything below its headings in one grey reads as a template. Text colour carries a role, and there are exactly three:

| Tier | Token | Typical face | What lives here |
|---|---|---|---|
| **1 — the voice** | `foreground` | serif 18–28, Inter 18 | card titles, pull quotes, a person's name, the value the visitor picked, a tab's opening line |
| **2 — running copy** | `muted-foreground` | Inter 14–16 | sentences someone reads: ledes inside a card, captions, body |
| **3 — labels & provenance** | `foreground-low` | `text-label-12-caps` (group labels) · `text-label-12-mono` (citations, meta) | things someone *scans*: the eyebrow over a group, the source under a fact, a dot-separated meta line |

Two rules follow. **A group label is never tier 2** — it is scanned, not read, so it is small, uppercase and `foreground-low`, and it never competes with the serif title under it. **On a `tint-10` ground, tier 3 drops to `muted-foreground`**: `foreground-low` measures 4.37:1 there and misses AA (§10).

---

## 5. Radius

Whole scale derives from one knob, `--radius: 10px`, by **multiplication** (the brand site's scale), so raising the knob softens everything proportionally.

| Token | Formula | px | Use |
|---|---|---|---|
| `rounded-sm` | `× 0.6` | 6 | small controls |
| `rounded-md` | `× 0.8` | 8 | menu items, inputs |
| `rounded-lg` | `× 1` | 10 | inline reference chips |
| `rounded-xl` | `× 1.4` | 14 | popovers, small cards |
| `rounded-2xl` | `× 1.8` | 18 | question bubbles, social tiles |
| `rounded-3xl` | `× 2.2` | 22 | suggested questions, photo tiles, list rows |
| `rounded-4xl` | `× 2.6` | 26 | share pill, large buttons |
| `rounded-5xl` | `× 3.2` | 32 | chat composer, section cards |
| `rounded-hero` | `× 7.2` | 72 | profile hero backdrop |
| `squircle` (utility) | `× 8` + `corner-shape: squircle` | 80 (28% fallback) | avatars |
| `rounded-bubble` | `× 2` | 20 | assistant chat bubble |
| `rounded-full` | `9999px` | | chips, tabs, icon buttons, avatars, nav pill |

---

## 6. Shadows

Brand's "glass" elevation: stacked low-alpha umbra layers plus inset white highlights. Highlight and edge colours are theme-switched (`--highlight*`, `--edge`), so each token works on both canvases.

| Token | Use | Value (light) |
|---|---|---|
| `shadow-2xs` | nav pill lift | `0 1px 2px /0.05` |
| `shadow-xs` | glass badge / chip | `0 0 3px /0.08` + inset highlights `.5` / `.2` |
| `shadow-sm` | brand CTA chip | `0 2px 2px /0.03, 0 .5px .5px /0.03, 0 4px 43px /0.06` |
| `shadow-md` | raised control | 4 umbra layers (`0 10px 10px /0.10` …) + inset highlights |
| `shadow-lg` | chat composer | 5 umbra layers (`0 12px 12px /0.09` …) + 1px `--edge` + strong inset highlights |
| `shadow-xl` | photo tile | 5 umbra layers (`0 32px 32px /0.10` …) |
| `shadow-2xl` | tile hover | `0 20px 40px /0.15, 0 8px 16px /0.10` |
| `shadow-avatar` | profile avatar | 5 umbra layers + inset highlights |
| `shadow-rim` | photo tile rim light | inset top/bottom highlights only |

Prefer `border-subtle` for separation; reserve `lg`+ for the composer, popovers and tiles.

---

## 7. Spacing & layout

**Width tokens** (`--container-*` → `max-w-*`): `max-w-content` 42rem / 672px (profile column) · `max-w-wide` 47rem / 752px (composer, hero backdrop, questions panel) · `max-w-nav` 28rem / 448px (bottom nav pill).

Tailwind's default **4px base scale**. Measured rhythm on the brand site: `px-3.5 py-3` (14/12) on rows, `px-4 py-2.5` on chips and suggested questions, `px-3 py-1.5` on tabs, `gap-1.5` inside controls, `gap-4` between siblings, `p-6` on section cards.

Sizes: buttons `h-10` (40px), large `h-12` → `md:h-[52px]`; icon buttons `size-10` / `size-12`; small icon buttons `size-8`; composer `min-h-[44px] md:min-h-[52px]`; avatar `size-36`. Content column `max-w-2xl` (672px) for a profile, `max-w-[47rem]` for the questions panel, `max-w-md` for the bottom nav pill, `max-w-[440px]` for chat bubbles, `max-w-6xl` for the explore grid. Sidebar width `16rem`.

---

## 8. Motion

Tailwind v4 auto-generates utilities **only** for `--ease-*` and `--animate-*`. `--duration-*` and `--scale-*` are plain custom props; consume them via `var()`.

```jsx
// easing → bare class
className="transition-[color,background-color,transform] ease-out-quart"
// duration → wrap the var (duration-fast as a class does NOTHING)
className="duration-[var(--duration-fast)]"
// press → reference the var, under motion-safe
className="motion-safe:active:scale-[var(--scale-press)]"
// animations
className="animate-typing-dot" · className="animate-skeleton"
```

**Durations:** `exit` 90ms (Brand `--duration-exit`, anything leaving) · `instant` 100ms (toggles) · `enter` 140ms (Brand `--duration-enter`, menus / popovers appearing) · `fast` 150ms (buttons, inputs) · `normal` 200ms (chips, tabs, colour, dialog scrim) · `move` 220ms (Brand `--duration-move`, layout / position shifts) · `slow` 300ms (hover shadows, the product-UI ceiling) · `reveal` 400ms (icon / composer reveals only) · `slide` 480ms (large transform moves) · `entrance` 500ms (staggered first-paint entrances, `stagger` 80ms). Brand's three named durations keep their exact meaning; exits are always shorter than entrances.

**Easing:** `--ease` (hover/colour) · `--ease-out` `cubic-bezier(0, 0, .2, 1)` (chips, tiles) · `--ease-out-quart` `cubic-bezier(.165, .84, .44, 1)` (buttons at 150ms) · `--ease-out-quint` `cubic-bezier(.22, 1, .36, 1)` (480ms transform moves) · `--ease-out-layout` `cubic-bezier(.23, 1, .32, 1)` (composer padding, 250ms) · `--ease-out-expo` `cubic-bezier(.16, 1, .3, 1)` (reveals + entrances) · `--ease-in-out` `cubic-bezier(.4, 0, .2, 1)` (on-screen movement) · `--ease-linear`.

**Interaction:** `--scale-press: 0.98` (buttons, chips) · `--scale-press-icon: 0.95` (round icon buttons) · `--scale-enter: 0.95` · `--translate-enter: 16px` (fade + rise entrance, as `animate-in fade-in slide-in-from-bottom-4`).

**Rules:** product UI ≤300ms; exits use `--duration-exit`; enter from `scale(0.95)` / `translateY(16px)`, never `scale(0)`; always list transition properties (no `transition: all`); press feedback only under `motion-safe:`. A global `prefers-reduced-motion` block collapses animations/transitions to ~0.

---

## 9. Z-index

Brand's own ladder, kept verbatim: `--z-sticky` 40 (fixed header, bottom nav pill) · `--z-scrim` 50 (dialog backdrop) · `--z-dropdown` 100 · `--z-modal` 200 · `--z-tooltip` 300 · `--z-toast` 400.

---

## 10. Accessibility and deviations from the brand site

All semantic foreground/background pairings meet **WCAG AA**; verify with `npm run brand:check-contrast` (`scripts/brand/check-contrast.mjs`, gate = WCAG 2 AA, APCA reported). The following mappings deliberately differ from what the brand site ships, because the measured value fails AA:

| Token | the brand site | Here | Why |
|---|---|---|---|
| `foreground-low` (light) | `#82827c` (3.9:1 on white) | `neutral-600` `#73736d` (4.8:1; 4.5:1 on `surface-secondary`) | tertiary text must clear AA |
| `foreground-low` (dark) | `#7c7b74` (3.6:1) | `neutral-500` `#96958f` (5.6:1) | same |
| `brand` / `chat-bubble-user` fill | `#f55d00` with white (3.3:1) | `tangerine-600` `#be4600` with white (5.2:1) | text on orange; exact hex kept as `brand-accent` for rings, selection and icons |
| `brand-accent` (dark) | `oklch(.74 .20 42)` `#ff824f` | `tangerine-400` `#ff9166` | nearest in-gamut ramp step |
| `destructive` (light) | red-9 `#e5484d` with white (3.9:1) | `red-600` with white (5.2:1) | |
| `success` (light) | green-9 `#30a46c` with white (3.1:1) | `green-700` with white (5.7:1) | green-600 lands on exactly 4.50; 700 leaves margin |
| `warning` (light) | amber-9 `#ffc53d` (yellow, dark text) | `amber-600` with white (4.9:1) | keeps one status pattern; the yellow fails 3:1 as a graphical object |
| `info` (light) | blue-9 `#0090ff` with white (3.5:1) | `blue-600` with white (4.8:1) | |
| status (dark) | same step-9 fills | 500 fills with `neutral-950` text (≥5.2:1) | |
| `foreground` (light) | `#21201c` | `neutral-950` `#1e1e1d` | one step serves both light ink and dark canvas (ΔL 0.009) |

Substitutions: **Newsreader** for PythiaType SemiBold (proprietary). Inter and Geist Mono are exact.

Motion respects `prefers-reduced-motion`. Focus is a 2px solid `--ring` outline, offset 2px, on `:focus-visible` only. New colours must be re-run through the auditor before merge.

---

## 11. Voice & UX copy

Write like the product reads: first-person, warm, direct. the brand site speaks as the person ("I'm Nir, author of…", "Ask me about", "Ask Nir Eyal anything…").

- Sentence case everywhere except names and product names.
- Name actions with a verb and an object (`Ask a question`, `Share profile`), never `OK` or `Submit`.
- Prompts are questions phrased the way a visitor would type them ("How do I master internal triggers…?").
- Keep captions and disclaimers short and in `text-xs text-foreground-low`.
- One brand-orange action per view (`bg-brand`); everything else is ink, chip, or ghost.

---

## 12. Do / Don't

- Do consume the highest token tier that fits: semantic over primitive, primitive over a raw value.
- Do use `bg-tint-*` for rest / hover fills; they need no `dark:` variants.
- Do use `brand` for anything carrying text on orange and `brand-accent` for rings, icons, selection and graphics.
- Do put headlines and person names in `font-heading`; keep UI text in Inter at 500.
- Do prefer `border-subtle` for separation; reserve `shadow-lg`+ for the composer, popovers and tiles.
- Do keep product motion ≤300ms, list transition properties explicitly, and honor `prefers-reduced-motion`.
- Don't put white text on `brand-accent` or on a 500-step status colour.
- Don't hard-code hex, px radius, or ad-hoc durations; reach for the scales.
- Don't build Tailwind color classes by string concatenation; the JIT only sees literal strings.
- Don't use tangerine or a status hue as decoration.
- Don't let a component consume a primitive directly; map a semantic token first.

---

## 13. Inventory

No UI components are installed (by design: tokens only). `components.json` is configured for shadcn (`radix-nova`, base color `neutral`, icons `lucide`, aliases `@/components`, `@/lib`, `@/hooks`); `src/lib/utils.ts` provides `cn()`.

The token swatch page (`src/app/design/brand/page.tsx`, rendered at `/design/brand`) shows every ramp, semantic pair, type style, radius, shadow and motion token, plus the dialog layer and the Mind-score tier dots, with a light/dark toggle (`src/app/design/brand/_design/theme-toggle.tsx`).

---

## 14. Conventions

**Adding a colour / token**
1. Add the **primitive** to `scripts/brand/gen-ramps.mjs` (a hue + chroma envelope on the shared L ramp), run `npm run brand:gen-ramps`, and paste the printed literals into the `.theme-brand { }` block in `brand.css`.
2. Map a **semantic** token in both `.theme-brand` and `.theme-brand.dark` (don't let components consume primitives directly) and mirror it as `--color-*` in `@theme inline` so utilities exist.
3. Add the pair to `PAIRS` in `scripts/brand/check-contrast.mjs` and run `npm run brand:check-contrast` until AA passes.
4. Mirror it in `src/app/design/brand/page.tsx` so the swatch page stays accurate.

**Adding a component**
- Use the shadcn CLI / aliases in `components.json`; components land in `src/design/brand/ui/`.
- Style only via semantic tokens and the radius / shadow / motion scales above.

**Source of truth**
- `brand.css` is authoritative; reflect every change here, in the audit's interpretation if the language shifts, and in the swatch page.

---

## 15. GenUI additions and the Vercel merge

Decisions D4/D5 in `docs/genui-research/13-decisions-and-backlog.md`. **Brand's skin, Vercel's restraint.**

**Kept from Brand:** sand + tangerine, Inter + Newsreader (+ Geist Mono), the multiplicative radius scale, glass shadows, motion values. **Taken from Vercel:** status colours only as small dots or chips (never large fills); 3-weight restraint on headings (400 / 500 / 600); hairline-as-box-shadow edges; the double focus ring; control heights 32 / 40 / 48 (`h-8` / `h-10` / `h-12`); the within-group → between-block → section spacing rule; "default to stillness" on data blocks (colour-only hover; transforms only on enter / exit / press).

| Token | Value | Use |
|---|---|---|
| `--spacing-group` / `gap-group` | 12px | rows inside one block, chip rows |
| `--spacing-block` / `gap-block` | 24px | between blocks inside an answer |
| `--spacing-section` / `gap-section` | 40px | between answer sections / turns |
| `--blur-glass` / `backdrop-blur-glass` | 12px | translucent sticky bars (action bar, composer) over content. Scrim keeps `backdrop-blur-xs` |
| `--shadow-edge` / `shadow-edge` | `0 0 0 1px border-subtle` | a hairline without a border box |
| `--shadow-card` / `shadow-card` | edge + 2px umbra @3% | resting block / card |
| `--shadow-card-hover` | + 8px/16px umbra @6% | hover lift, `duration-slow` |
| `chart-6` | red-600 / red-400 | sixth categorical series |
| `chart-track` | tint-10 / tint-15 | ring and bar tracks |
| `chart-grid` | border-subtle | gridlines |
| `chart-target` | neutral-600 / 400 | dashed goal / target line |
| `chart-band` | green @12% / 14% | optimal-range band |
| `chart-seq-1…5` | tangerine 100→700 (dark 900→300) | sequential / heat scales |
| `focus-ring` (utility) | 2px offset + 2px `brand-accent` | controls inside cards |
| `skeleton` (utility) | `bg-tint-10` + pulse | every Skeleton |
| `.genui-prose` | see globals.css | the markdown body of an answer |

**Motion (D3), the whole vocabulary:** enter = fade + rise (`--scale-enter` / `--translate-enter`, `--duration-reveal`, `ease-out-expo`, `--duration-stagger` between siblings); exit = `--duration-exit`; press = `--scale-press` under `motion-safe:`; hover = colour / shadow only at `--duration-fast`/`--duration-slow`. Charts draw in once with `--duration-reveal`. Nothing else animates. Components must respect `prefers-reduced-motion` (the global block already collapses durations; add `motion-reduce:animate-none` on entrances).

**Responsiveness:** GenUI components are sized by their container, not the viewport. The answer column is `@container/answer`; components use `@md:` (≥448px) and `@2xl:` (≥672px) variants. The lab renders at 390px and 672px.
