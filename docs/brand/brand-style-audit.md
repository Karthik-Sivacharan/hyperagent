# Brand style audit (the brand site)

Raw extraction of the design language behind `https://www.the brand site/nireyal`, with `https://www.the brand site/explore` and the `the brand site` homepage as cross-checks. Captured 2026-08-26.

**Method.** The Chrome extension was not connected (three failed attempts), so the fallback path was used: the three pages were fetched with `curl`, all twelve `/_next/static/chunks/*.css` bundles referenced by the profile app (444 KB total) were downloaded, and colors, fonts, radii, shadows and motion were extracted from the raw CSS and the server-rendered HTML with grep/python. Frequencies below are counts of Tailwind utility classes in the rendered HTML of the profile and explore pages (a proxy for computed-style frequency; no screenshots were taken). Hex values for OKLCH tokens were computed with `culori` (sRGB-clamped where the source value is out of gamut).

The homepage (`the brand site/`) is a separate Framer site; the profile and explore pages are the product app (Next.js + Tailwind v4 + shadcn + Radix Colors). The product app is the authoritative source for tokens.

---

## 1. Color

### 1.1 Custom properties defined by the app

Brand's own token layer (from `:root` / `.dark` in the CSS bundle). Radix Colors supply the ramps (`sand`, `red`, `green`, `amber`, `blue`, `gold`); `tangerine` is a custom OKLCH ramp.

| Token | Light | Dark |
|---|---|---|
| `--surface-primary` (canvas, `--background`, `--card`) | `white` `#ffffff` | `#1e1e1d` |
| `--surface-secondary` (`--secondary`, `--muted`, `--accent`) | `sand-2` `#f9f9f8` | `sand-2` `#191918` (darker than the canvas: a sunken surface) |
| `--overlay` (`--popover`) | `= surface-primary` | `= surface-primary` |
| `--fg-high` (`--foreground`) | `sand-12` `#21201c` | `sand-12` `#eeeeec` |
| `--fg-mid` (`--muted-foreground`) | `sand-11` `#63635e` | `sand-11` `#b5b3ad` |
| `--fg-low` (placeholder, captions) | `sand-10` `#82827c` (3.9:1 on white, below AA) | `sand-10` `#7c7b74` (3.6:1, below AA) |
| `--fg-inverted` | `white` | `black` |
| `--primary` / `--primary-foreground` | `sand-12` `#21201c` / white | `sand-12` `#eeeeec` / black |
| `--brand-accent` | `oklch(.67 .22 42)` ≈ `#f55d00` (sRGB clamp) | `oklch(.74 .20 42)` ≈ `#ff824f` |
| `--bubble-accent` (user chat bubble) | `= brand-accent` | `tangerine-8` `oklch(.55 .20 42)` ≈ `#bd4600` |
| `--ring` | `tangerine-9` | `tangerine-11` `oklch(.82 .16 42)` ≈ `#ffad8d` |
| `--border` | `sand-6` `#dad9d6` | `sand-6` `#3b3a37` |
| `--input` | `sand-9` `#8d8d86` | `sand-9` @ 10% |
| `--destructive` / `--fg-error` | `red-9` `#e5484d` / `red-10` `#dc3e42` | `red-9` `#e5484d` |
| `--success` / `--fg-success` | `green-9` `#30a46c` / `green-11` `#218358` | `green-9` |
| `--warning` / `--fg-warning` | `amber-9` `#ffc53d` / `amber-11` `#ab6400` | `amber-9` |
| `--info` / `--fg-info` | `blue-9` `#0090ff` / `blue-11` `#0d74ce` | `blue-9` |
| `--chart-1` / `--chart-5` (dark only overrides) | | `tangerine-11` / `tangerine-9` |
| `::selection` | `tangerine-9` @ 18% bg, `tangerine-11` text | same |
| `* { border-color }` | `sand-9` | `sand-9` |
| `.border-subtle` / `.border-loud` | `sand-9` @ 12% / @ 20% | same |

Radix `sand` (the neutral) measured in OKLCH:

| Step | Light hex | L / C / H | Dark hex | L / C / H |
|---|---|---|---|---|
| 1 | `#fdfdfc` | 0.994 / 0.001 / 106 | `#111110` | 0.177 / 0.002 / 107 |
| 2 | `#f9f9f8` | 0.982 / 0.001 / 106 | `#191918` | 0.213 / 0.002 / 107 |
| 3 | `#f1f0ef` | 0.956 / 0.002 / 68 | `#222221` | 0.252 / 0.002 / 107 |
| 4 | `#e9e8e6` | 0.931 / 0.003 / 85 | `#2a2a28` | 0.284 / 0.004 / 107 |
| 5 | `#e2e1de` | 0.910 / 0.004 / 91 | `#31312e` | 0.312 / 0.005 / 107 |
| 6 | `#dad9d6` | 0.885 / 0.004 / 92 | `#3b3a37` | 0.348 / 0.005 / 92 |
| 7 | `#cfceca` | 0.851 / 0.006 / 95 | `#494844` | 0.401 / 0.007 / 95 |
| 8 | `#bcbbb5` | 0.791 / 0.008 / 99 | `#62605b` | 0.489 / 0.008 / 89 |
| 9 | `#8d8d86` | 0.641 / 0.010 / 107 | `#6f6d66` | 0.534 / 0.011 / 94 |
| 10 | `#82827c` | 0.605 / 0.009 / 107 | `#7c7b74` | 0.582 / 0.011 / 100 |
| 11 | `#63635e` | 0.498 / 0.008 / 107 | `#b5b3ad` | 0.767 / 0.009 / 92 |
| 12 | `#21201c` | 0.243 / 0.008 / 95 | `#eeeeec` | 0.949 / 0.003 / 107 |

The neutral is a **warm, yellow-leaning near-achromatic gray** (hue 90–107, chroma 0.001–0.011). Not cool, not pink-warm: sand.

Custom `tangerine` ramp (OKLCH, hue 42 throughout; Brand relies on browser gamut mapping, most steps exceed sRGB):

| Step | Light (L C H → sRGB) | Dark (L C H → sRGB) |
|---|---|---|
| 1 | `.99 .0096 42` → `#fffbf9` | `.15 .014 42` → `#100907` |
| 2 | `.97 .0192 42` → `#fff2ed` | `.18 .026 42` → `#1b0e08` |
| 3 | `.94 .036 42` → `#ffe5db` | `.23 .06 42` → `#331104` |
| 4 | `.90 .06 42` → `#ffd3c2` | `.27 .09 42` → `#451400` |
| 5 | `.85 .096 42` → `#ffbca2` | `.31 .12 42` → `#551b00` |
| 6 | `.79 .132 42` → `#ff9e78` | `.36 .14 42` → `#692300` |
| 7 | `.72 .18 42` → `#fe773d` | `.43 .17 42` → `#873000` |
| 8 | `.68 .21 42` → `#fa5f00` | `.55 .20 42` → `#bd4600` |
| **9** | **`.67 .22 42` → `#f55d00`** (brand) | `.67 .22 42` → `#f55d00` |
| 10 | `.60 .21 42` → `#d44f00` | `.74 .20 42` → `#ff824f` (dark brand) |
| 11 | `.50 .18 42` → `#a63c00` | `.82 .16 42` → `#ffad8d` |
| 12 | `.40 .14 42` → `#7a2a00` | `.92 .07 60` → `#ffddc3` |

Homepage (Framer) cross-check: the marketing site uses `rgb(255,92,0)` `#ff5c00` (23×), `rgb(255,82,13)` `#ff520d` (26×) and `#f65726` for the brand orange (all OKLCH hue 37–41, L 0.67–0.68), on a warm cream canvas `#fdf6ee` / `#f7f0e8` with a dark brown ink `#2b180a` and tan secondary text `rgb(148,135,124)` `#94877c`. So the brand orange is consistent across properties (hue ~40, L ~0.67); the marketing canvas is warmer (cream/tan) than the product canvas (white/sand).

### 1.2 Color usage frequency (utility classes, profile + explore HTML)

| Class | Count | Role |
|---|---|---|
| `text-fg-high` | 149 | primary text |
| `bg-sand-9/12` | 132 | default translucent fill (skeletons, chips) |
| `text-fg-mid` | 87 | secondary text |
| `bg-sand-9/10` | 73 | chip / button rest fill |
| `bg-sand-9/15` | 67 | chip / button hover fill |
| `text-white` | 34 | text on orange CTA and on photo tiles |
| `border-subtle` | 31 | hairline (sand-9 @ 12%) |
| `text-fg-low` | 26 | captions, placeholders |
| `bg-sand-9/7`, `/5`, `/4`, `/20`, `/40` | 20, 15, 15, 15, 15 | tint ladder for rest / active / dividers |
| `bg-surface-primary` | 19 | canvas |
| `ring-surface-primary` | 16 | avatar cut-out ring |
| `bg-white/90` | 15 | glass badge |
| `text-sand-11`, `text-sand-12` | 6, 5 | icon buttons |
| `bg-tangerine-9` | 2 | orange CTA ("Ask") |
| `bg-sand-4`, `bg-sand-5` | 4 | icon-button hover in dark |

Key pattern: **nearly every fill is a translucent tint of `sand-9`** (5–40%) rather than a solid step, so the same class works on both themes. Solid orange appears only on the primary CTA, the user chat bubble, the focus ring and text selection. The default `--primary` button is **ink (sand-12), not orange**.

## 2. Typography

Fonts actually loaded (`@font-face` + `next/font` class names on `<html>`):

| Role | Family | Source | Weights | Notes |
|---|---|---|---|---|
| `--font-inter` → `font-sans` (body, UI) | **Inter Variable** (`InterVariable-s.p.*.woff2`, italic too) | self-hosted via `next/font/local` | 100–900 variable | body uses 400, 450, 470, 500, 600. `font-feature-settings: "ss08","cv03","cv04","cv06","cv09","cv11"` |
| `--font-pythia` → `.font-heading` | **PythiaType SemiBold** (`PythiaType_SemiBold-s.p.*.woff2`) | self-hosted, proprietary | 600 only | fallback stack `ui-serif, Georgia, "Times New Roman", serif` → a serif display face |
| `--font-geist-mono` → `font-mono` | **Geist Mono** | Google Fonts via `next/font` | 100–900 | code |

Homepage (Framer) uses Inter + **Martina Plantijn Light** (serif) + Geist / Fragment Mono / Roboto Mono. Serif display + Inter body is consistent across both properties.

Measured text styles (class → resolved values):

| Element | Family | Size | Line-height | Weight | Tracking |
|---|---|---|---|---|---|
| h1 profile name | heading (serif) | `clamp(36px, 10vw, 52px)` | 1.1 | 600 | `-0.025em` |
| h2 section ("Ask me about") | sans | 20px | 1.75rem (TW) | 600 | `-0.025em` |
| h3 explore tile name | heading | 22px → 28px (md) | 1.25 | 600 | `-0.025em`, white + drop-shadow |
| list row name | heading | 18px | 1.3 | 500 | `-0.18px` |
| about copy | sans | 18px | 1.5 | 400 | 0 |
| chat composer textarea | sans | 16px → 18px (md) | 1.5 | 400 | 0 |
| suggested question button | sans | 16px | 1.5 | 500 | 0 |
| explore question bubble | sans | 15px | 1.375 (`leading-snug`) | 400 | 0 |
| chips / tabs / share button | sans | 14px | 1.43 | 500 (450 on share) | 0 |
| inline reference chip | sans | inherit | 1.4 | 470 | 0 |
| captions / footer / disclaimer | sans | 12px | 1.33 | 400 | `-0.025em` |
| badge count | sans | 10px | | 500, `tabular-nums` | `-0.025em` |

Utility frequency: `font-medium` 71, `font-heading` 25, `font-semibold` 11, `font-[470]` 5, `font-[450]` 1 · `text-sm` 38, `text-lg` 18, `text-xs` 17, `text-base` 7, `text-xl` 2 · `tracking-tight` 52, `leading-[1.3]` 30, `leading-snug` 15, `leading-tight` 9.

`html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; font-synthesis: none }`. Body: `font-sans antialiased`.

## 3. Spacing and sizing

- Tailwind default `--spacing: .25rem` (4px base). Most frequent: `px-3.5` 78, `gap-4` 74, `gap-1.5` 70, `py-3` 67, `px-4` 38, `py-2.5` 35, `py-2` 34, `gap-2` 32.
- Content column: `max-w-2xl` (672px) for the profile, `max-w-[47rem]` for the questions panel, `max-w-[42rem]` disclaimer, `max-w-md` bottom nav pill, `max-w-[440px]` question bubbles, `max-w-6xl` explore grid.
- Controls: buttons `h-10` (40px), large `h-12` / `md:h-[52px]`; icon buttons `size-10` / `size-12`; small icon buttons `size-8`; chat composer `min-h-[44px] md:min-h-[52px]`; avatar `size-36` (144px); explore tiles 180×236 → 217×285; list rows `md:h-[88px]`.
- Chip padding `px-4 py-2.5` (profile) / `px-3.5 py-2` (explore); tabs `px-3 py-1.5`.

## 4. Radius

`--radius: 0.625rem` (10px) with a **multiplicative** scale (not shadcn's additive one):

| Utility | Formula | px |
|---|---|---|
| `rounded-sm` | `radius × 0.6` | 6 |
| `rounded-md` | `radius × 0.8` | 8 |
| `rounded-lg` | `radius` | 10 |
| `rounded-xl` | `radius × 1.4` | 14 |
| `rounded-2xl` | `radius × 1.8` | 18 |
| `rounded-3xl` | `radius × 2.2` | 22 |
| `rounded-4xl` | `radius × 2.6` | 26 |

Usage: `rounded-3xl` 102, `rounded-full` 96, `rounded-md` 72, `rounded-2xl` 38, `rounded-none` 20; custom: `rounded-[32px]` (chat composer), `rounded-[30px]` ("Ask me about" card), `rounded-[60px]` (bottom nav pill), `rounded-[72px]` (avatar), `rounded-[10px]` (inline chips), assistant bubble `1.25rem` (20px). Pills and very soft corners dominate; the only "sharp" radius is `rounded-md` on menu items.

## 5. Shadows and borders

Shadows are **multi-layer stacks with inset white highlights** (a glass/soft-embossed look), rather than single drop shadows:

| Surface | Value |
|---|---|
| glass badge / chip (light) | `0 0 3px rgba(0,0,0,.08), inset 0 1px 1px 0 rgba(255,255,255,.5), inset 0 -1px 1px 0 rgba(255,255,255,.2)` |
| glass badge (dark) | `0 0 3px rgba(0,0,0,.2), inset 0 1px 1px 0 rgba(255,255,255,.15)` |
| raised button | `0 10px 10px 0 rgba(0,0,0,.1), 0 4px 4px -2px rgba(0,0,0,.1), 0 2px 2px -1px rgba(0,0,0,.03), 0 1px 1px -.5px rgba(0,0,0,.05), inset 0 1px 2px 0 rgba(255,255,255,.5), inset 0 -1px 2px 0 rgba(255,255,255,.4)` |
| orange CTA | `0 2px 2px 0 rgba(0,0,0,.03), 0 .5px .5px 0 rgba(0,0,0,.03), 0 4px 43px 0 rgba(0,0,0,.06)` |
| chat composer (light) | `0 12px 12px 0 rgba(0,0,0,.09), 0 17.2px 17.2px -8.6px rgba(0,0,0,.03), 0 8.6px 8.6px -4.3px rgba(0,0,0,.03), 0 4.3px 4.3px -2.15px rgba(0,0,0,.03), 0 1.075px 1.075px -.538px rgba(0,0,0,.03), 0 -2.15px 2.15px 0 #fff inset, 0 2.15px 2.15px 0 #fff inset` |
| chat composer (dark) | same stack at lower alpha + `0 0 0 1px rgba(0,0,0,.04)` + white insets at .04/.08 |
| explore tile | `0 32px 32px rgba(0,0,0,.1), 0 17px 17px -9px rgba(0,0,0,.1), 0 9px 9px -4px rgba(0,0,0,.03), 0 4px 4px -2px rgba(0,0,0,.05), 0 1px 1px -.5px rgba(0,0,0,.05)`; hover → `0 20px 40px rgba(0,0,0,.15), 0 8px 16px rgba(0,0,0,.1)` |
| tile rim light | `inset 0 2px 4px rgba(255,255,255,.5), inset 0 -2px 4px rgba(255,255,255,.5)` (dark: .2) |
| avatar (`--avatar-shadow`) | `0 32.25px 32.25px 0 rgba(0,0,0,.1), 0 17.2px 17.2px -8.6px rgba(0,0,0,.1), 0 8.6px 8.6px -4.3px rgba(0,0,0,.03), 0 4.3px 4.3px -2.15px rgba(0,0,0,.05), 0 1.075px 1.075px -.538px rgba(0,0,0,.05), 0 2px 4px 0 rgba(255,255,255,.5) inset, 0 -2px 4px 0 rgba(255,255,255,.4) inset` |
| bottom nav pill | Tailwind `shadow-sm` + `backdrop-blur-sm`; tabs `shadow-md` (none in dark) |

Borders: always 1px (`border` 115×, no `border-2`). Colors: `border-subtle` (sand-9 @ 12%) 31×, `border-loud` (sand-9 @ 20%) on the composer and inputs, `border-transparent` on buttons (`bg-clip-padding`). Focus: `focus-visible:ring-2` 32×, `ring-ring/30` 19×, `ring-3` 8× (+ `border-ring`), offset only on icon buttons. Ring color = tangerine.

## 6. Motion

| Class / value | Count | Where |
|---|---|---|
| `ease-out` (`cubic-bezier(0,0,.2,1)`) | 42 | chips, tiles, generic |
| `duration-200` | 33 | chips, tabs, color |
| `duration-300` | 24 | shadow / hover, inline chips |
| `duration-150` + `ease-out-quart` (`cubic-bezier(.165,.84,.44,1)`) | 5 | shadcn button base |
| `duration-[400ms]` + `cubic-bezier(.16,1,.3,1)` (expo-out) | 5 + inline | icon reveal, composer buttons |
| `duration-250` + `cubic-bezier(.23,1,.32,1)` | 1 | composer padding (layout) |
| `ease-in-out` | 5 | icon width/opacity |
| entrance `animate-in fade-in slide-in-from-bottom-4` | 3 | suggested questions: 500ms, expo-out, stagger 80ms |
| `animate-pulse [animation-duration:1.2s]` | 28 | skeletons |
| `typing-dot 1s linear infinite` | keyframe | assistant typing indicator |
| press | | `motion-safe:active:scale-[0.98]` (buttons), `active:scale-95` (icon buttons) |
| `--default-transition-duration` | | `.15s` |

Transitions list explicit properties (`transition-[color,background-color,border-color,box-shadow,transform,opacity]`); `transition-all` appears only on chips.

## 7. Light / dark

- `next-themes` with `attribute="class"`, storage key `theme`, `defaultTheme="system"`, `enableSystem`, themes `["light","dark"]`; `color-scheme` set on `<html>`.
- `<meta name="theme-color">` `#ffffff` (light) / `#1e1e1d` (dark). Server HTML renders without the `dark` class: **light is the canonical default**, dark follows the OS.
- Full `.dark` remap exists (`.dark, .dark-theme` Radix blocks + the app's `.dark {}` block). No `data-theme` on the app itself (only in an embedded react-tweet stylesheet).

## 8. Component vocabulary (profile page)

Avatar (`size-36`, `rounded-[72px]`, stacked avatar shadow + white inset, `ring-surface-primary`) · name `h1` (serif, clamp 36–52px) · role label ("Speaker", `text-fg-mid`) · share pill (`h-10 rounded-4xl bg-sand-12/10 font-[450] backdrop-blur-xs`) · about copy (`text-lg`, inline reference chips `rounded-[10px] bg-sand-10/10 font-[470]`) · "Ask me about" card (`rounded-[30px] bg-surface-secondary p-6`) with suggested-question buttons (`rounded-3xl px-4 py-2.5 bg-sand-9/10 hover:bg-sand-9/15`, staggered entrance) · chat composer (`rounded-[32px] border-loud p-1 bg-sand-1/60 backdrop-blur-md` glass shadow; textarea `text-base md:text-lg placeholder:text-fg-low`; mic / attach icon buttons `size-10 md:size-12 rounded-full text-sand-11 hover:bg-sand-4`) · send button (`h-12 rounded-full bg-sand-9/10`) · follow/social row (`size-8 rounded-2xl bg-sand-9/7`) · bottom tab pill (`rounded-[60px] max-w-md bg-surface-secondary border-subtle shadow-sm backdrop-blur-sm`, tabs `rounded-full px-3 py-1.5 text-sm font-medium data-selected:bg-sand-9/10`) · chat bubbles (`.is-user` → `bg-bubble-accent` orange; `.is-assistant` → `bg-sand-9/11 rounded-[1.25rem]`) · typing dots · footer / disclaimer (`text-xs text-fg-low`).

Explore page adds: category chips (`rounded-full px-4 py-2.5 text-sm font-medium bg-sand-9/10`), primary orange "Ask" chip (`bg-tangerine-9 text-white`), person tiles (`rounded-3xl` photo cards with serif name overlay and rim-light inset), list rows (`rounded-3xl px-3.5 py-3 md:h-[88px] hover:bg-sand-9/7`), question bubbles (`rounded-2xl px-3.5 py-2 text-[15px] bg-sand-9/5`), skeleton pulses, sidebar (`--sidebar-width: 16rem`).

## 9. Interpretation

- **Canvas:** pure white in light, warm charcoal `#1e1e1d` in dark; secondary surfaces are a whisper of sand (`#f9f9f8`).
- **Ink:** warm near-black `#21201c`; secondary text `#63635e`; tertiary `#82827c` (which Brand lets fall below AA).
- **One accent:** a hot tangerine orange, `oklch(0.67 0.22 42)` ≈ `#f55d00`, used sparingly (CTA, user bubble, ring, selection). The default button is ink, not orange.
- **Neutrals are sand, not gray:** hue ~100, chroma ≤ 0.011; warm but never beige in the product app (the marketing site leans cream/tan).
- **Fills are tints, not steps:** translucent `sand-9` at 5–40% does almost all surface work, so one class serves both themes.
- **Serif display + Inter body + Geist Mono:** PythiaType SemiBold headlines with tight tracking (-0.025em) over Inter at 400/450/470/500; Inter's alternate glyph sets (cv/ss) are enabled.
- **Everything is a pill or a very soft rounded rectangle:** 10px base radius with a multiplicative scale; 22–32px on cards and the composer; `rounded-full` for chips, tabs, icon buttons.
- **Glass elevation:** stacked low-alpha shadows plus 1px inset white highlights; hairline (1px, 12–20% alpha) borders everywhere.
- **Motion is quick and springy:** 150–300ms for product UI with quart/expo ease-out curves, 400–500ms only for reveals and staggered entrances; press feedback scales to 0.98.
- **Light by default, full dark mode** through `next-themes` class switching.

---

## 10. Live computed-style pass (BrowserOS, 2026-08-26)

**Method.** The first pass (sections 1–9) was static: curl'd HTML + CSS bundles. This pass drove the real page in BrowserOS (`http://127.0.0.1:9000/mcp` → `tabs` / `evaluate` / `run`), walking every rendered element with `getComputedStyle`, reading `:root` / `.dark` custom properties from `document.styleSheets`, and using CDP (`CSS.getMatchedStylesForNode`, `Emulation.setEmulatedMedia`) to force `prefers-color-scheme: light` and to resolve one ambiguous colour. No screenshots were used for extraction; one 728px JPEG was taken at the end to confirm the visible state.

### 10.1 Confirmed (static pass was right)

`--surface-primary` white / `#1e1e1d` · sand ramp 1–12 identical in both themes · `--fg-high/mid/low` = sand-12/11/10 · tangerine-9 `oklch(.67 .22 42)` on the CTA (`Create Your Brand`: white text, `h-9`, `px-3`, `text-sm font-medium`, radius 26px, 150ms quart-out) · `--radius: .625rem` · 1px hairlines at `sand-9/12` (subtle) and `/20` (loud) · `next-themes` class strategy, `defaultTheme="system"` (the page rendered dark because the host OS is dark) · Inter Variable (loaded, 100–900), PythiaType 600 (loaded), Geist Mono (declared, unloaded on the profile) · `font-feature-settings: "cv03","cv04","cv06","cv09","cv11","ss08"`, `antialiased`, `optimizeLegibility`.

### 10.2 New: custom properties the static pass missed or under-weighted

| Property | Light | Dark | Notes |
|---|---|---|---|
| `--duration-enter` | `.14s` | | Brand's own motion vocabulary — *enter* is short (140ms) |
| `--duration-exit` | `90ms` | | exits shorter than entrances |
| `--duration-move` | `.22s` | | layout / position |
| `--z-dropdown` / `--z-modal` / `--z-tooltip` / `--z-toast` | 100 / 200 / 300 / 400 | | fixed header is `z-40`, dialog scrim `z-50` |
| `--fg-inverted` | `white` | `black` | text on ink fills |
| `--overlay` | `= surface-primary` | | dialog surface |
| `--border-hairline` | `1px` | | |
| `--mind-novice` | `#ff5a01` | `#ffb366` | Mind-score tier palette (7 tiers) |
| `--mind-skilled` | `#e52310` | `#ff7a66` | |
| `--mind-expert` | `#7c009e` | `#b366cc` | |
| `--mind-master` | `#4e7daa` | `#7da3cc` | |
| `--mind-sage` | `#17572b` | `#4a8a5c` | the tier shown on Nir Eyal's profile (`div.mind-score-icon.text-mind-sage`, leaf / orbit / circle parts) |
| `--mind-legendary` | `#c79041` | `#e6b973` | |
| `--mind-eternal` | `#000` | `#66a3b8` | |
| `--avatar-shadow` / `--avatar-shadow-inset` | stacked umbra + white insets `.5/.4` | insets `.15/.1`, umbra `.2/.15/.1` | |

Colours ship as **Display-P3** on wide-gamut screens (`color(display-p3 .129 .126 .111)` for sand-12) via Radix's `@supports (color: color(display-p3 …))` blocks; OKLCH tokens cover this natively.

### 10.3 Computed type (light, 1456×868)

| Role | Size / line / weight / tracking | Family |
|---|---|---|
| h1 name | 52 / 57.2 / 600 / -1.3px (`clamp(36px,10vw,52px)`, 1.1, -0.025em) | PythiaType |
| "Sign in to continue with…" (`text-2xl font-medium`) | 24 / 32 / 500 / -0.6px | Inter |
| section h2 "Ask me about" (`text-xl font-semibold`) | 20 / 28 / 600 / -0.5px | Inter |
| about copy | 18 / 27 / 400 / -0.24px | Inter |
| inline entity chips ("Hooked", `font-[470] leading-[1.4]`) | 18 / 25.2 / 470 / -0.24px; `bg-sand-10/10`, radius 10px, `pl-1 pr-1.5`, 300ms | Inter |
| body / UI (`text-md`, `text-base`) | 16 / 24 / 400–500 / -0.24px | Inter |
| Share (`font-[450]`) | 16 / 24 / 450 / -0.24px; `h-10`, radius 26px, `sand-12/10` fill, blur | Inter |
| buttons / links (`text-sm font-medium`) | 14 / 20 / 500 / normal; `h-9` | Inter |
| captions / disclaimer | 12 / 16 / 400 / -0.24px … -0.3px | Inter |
| composer textarea | 18 / 28 / 400; `pl-3 pr-1 py-2.5` | Inter |

Running copy inherits **-0.24px** from a `tracking-[-0.015em]` wrapper computed at 16px; `text-sm` controls are `normal`.

### 10.4 Surfaces measured

- **Composer** `form`: `rounded-[32px] border border-loud p-1 bg-sand-1/60 dark:bg-sand-4/70 backdrop-blur-[12px]`, 752×62, shadow = the "chat composer" stack (§5) with `#fff` insets in light.
- **Hero backdrop**: two absolutely-positioned siblings behind the header — `h-[14rem]` with `linear-gradient(sand-2/60 → transparent)` and `h-[26rem] rounded-[72px]` carrying `inset 0 1px 1px #fff, inset 0 -1px 1px rgba(255,255,255,.5), 0 24.35px 24.35px rgba(0,0,0,.05), 0 6.49px 6.49px -3.25px .05, 0 3.25px 3.25px -1.62px .05, 0 .81px .81px -.41px rgba(239,95,0,.05), 0 0 0 1px .05` — note the faint **tangerine-tinted** micro layer.
- **"Ask me about" section**: `rounded-[30px] bg-surface-secondary p-6 pb-2`, 704 wide. Suggested questions: 46px tall, `rounded-3xl` (22px), `bg-sand-9/10`, `px-4 py-2.5 font-medium`.
- **Bottom nav pill**: `max-w-md rounded-[60px] bg-surface-secondary border-subtle backdrop-blur-[8px]` + `shadow-sm`; active tab carries a stacked shadow with `.2` white insets.
- **"View chat" pill** (ink, theme-invariant): `bg-#1e1e1d rounded-full px-3 py-1.5 text-sm shadow-md`, 109×32.
- **Social icon buttons**: `size-8 rounded-2xl bg-sand-9/7 text-fg-mid`.
- **Avatar**: 142px `object-cover` inside `avatar-squircle`, `--avatar-shadow` + inset highlights.
- **Content widths**: 672px (`max-w-2xl`, profile column) · 752px (composer, hero) · 448px (`max-w-md`, nav).
- **Transitions in use** (count): 150ms `cubic-bezier(.4,0,.2,1)` ×11 (colour), 150ms quart-out ×8 (buttons), 480ms `cubic-bezier(.22,1,.36,1)` transform ×5, 300ms ×5 (hover shadow / `transition-all` chips), 400ms expo-out ×2 (staggered opacity+transform), 200ms quart-out ×2, 250ms `cubic-bezier(.23,1,.32,1)` padding ×1, 200ms `cubic-bezier(0,0,.2,1)` transform ×1.

### 10.5 The sign-in gate (design-relevant)

On page load — with no interaction at all — Brand opens a **sign-in dialog** ("Sign in to continue with [avatar] Nir" · "Continue with Google" ink pill · "or" · "Continue with Email" sand pill · close ×). It is a Radix dialog: `fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm duration-200 ease-out-quart` scrim + a `rounded-4xl` 365×338 card; `body` gets `pointer-events: none`. The profile behind it stays fully rendered (name, role "Speaker", 31K Mind badge, bio with entity chips, "Ask me about" questions, composer) but is inert. For the *Personalized Profiles* assignment this is the current baseline of "a gated wall".

### 10.6 Corrections to sections 1–9

- `text-md` measures **16/24** (the static pass inferred 15/21 from question bubbles, which are `text-[15px]`); `text-xl` line-height is **28px**, not 26; `text-2xl` is **24/32 at weight 500** (tile names use `text-[22px]`).
- The static pass treated `--duration-enter/exit` as long entrance/exit animations; Brand uses them for **short** micro-transitions (140/90ms). Tokens were renamed accordingly (`--duration-entrance` is the 500ms staggered one).
- Tangerine-9 is rendered as `oklch(0.67 0.22 42)` verbatim (no sRGB clamp in the CSS); the `#f55d00` hex is only the sRGB fallback.

### 10.7 Methodology notes

- Tailwind v4 nests variant rules (`.parent { & [data-…] { … } }`), so `element.matches(rule.selectorText)` misses them; use CDP `CSS.getMatchedStylesForNode` instead.
- Removing the `dark` class alone does not produce a true light render while the OS prefers dark; emulate the media feature via CDP (`browser.cdpJsonForPage(page, 'Emulation.setEmulatedMedia', JSON.stringify({features:[…]}))` — params must be a JSON string).
- With the dialog open, the inert scroll viewport reported a stale near-white computed `color` on its descendants; CDP matched-styles confirmed those elements inherit `var(--fg-high)` (ink), and the screenshot confirmed ink-on-white.
