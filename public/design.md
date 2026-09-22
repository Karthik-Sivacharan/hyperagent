---
version: alpha
name: Hyperagent
description: Warm paper-white canvas, sand neutrals, one tangerine accent, Geist throughout, pill-shaped controls and glass elevation. Written for Tailwind CSS v4 and shadcn/ui.
# generated:tokens
colors:
  primary: "#1e1e1d"
  primary-foreground: "#ffffff"
  secondary: "#f9f9f8"
  secondary-foreground: "#1e1e1d"
  background: "#ffffff"
  foreground: "#1e1e1d"
  card: "#ffffff"
  card-foreground: "#1e1e1d"
  popover: "#ffffff"
  popover-foreground: "#1e1e1d"
  muted: "#f9f9f8"
  muted-foreground: "#64635e"
  accent: "#efefed"
  accent-foreground: "#1e1e1d"
  destructive: "#bc4441"
  destructive-foreground: "#ffffff"
  border: "#dad9d6"
  input: "#eaeae9"
  ring: "#f55d00"
  brand: "#be4600"
  brand-foreground: "#ffffff"
  brand-accent: "#f55d00"
  brand-subtle: "#fff7f4"
  brand-subtle-foreground: "#a53c00"
  surface-secondary: "#f9f9f8"
  surface-elevated: "#ffffff"
  foreground-low: "#73736d"
  border-subtle: "#f2f2f2"
  tint-10: "#f5f4f4"
  tint-15: "#efefee"
  chip: "#efefed"
  chip-foreground: "#64635e"
  success: "#007648"
  success-foreground: "#ffffff"
  warning: "#9e6400"
  warning-foreground: "#ffffff"
  info: "#1774c9"
  info-foreground: "#ffffff"
typography:
  heading-48:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: 600
    lineHeight: 56px
    letterSpacing: -0.06em
  heading-40:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: 600
    lineHeight: 48px
    letterSpacing: -0.06em
  heading-32:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -0.04em
  heading-24:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.04em
  heading-20:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: -0.02em
  lede:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    fontFeature: '"rlig" 1, "calt" 0, "ss11" 1'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  metadata:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-xs:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  code:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  code-xs:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  2xl: 18px
  3xl: 22px
  4xl: 26px
  5xl: 32px
  bubble: 20px
  full: 9999px
spacing:
  unit: 4px
  group: 12px
  stack: 24px
  section: 40px
  container-content: 672px
  container-wide: 752px
  container-nav: 448px
# /generated:tokens
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  button-brand:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  button-tint:
    backgroundColor: "{colors.tint-10}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 32px
    padding: 12px
  button-tint-hover:
    backgroundColor: "{colors.tint-15}"
    textColor: "{colors.foreground}"
  button-chip:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.chip-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 32px
    padding: 12px
  button-chip-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  button-destructive:
    backgroundColor: "{colors.background}"
    textColor: "{colors.destructive}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 16px
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.full}"
    height: 20px
    padding: 8px
  badge-brand:
    backgroundColor: "{colors.brand-subtle}"
    textColor: "{colors.brand-subtle-foreground}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.full}"
    height: 20px
    padding: 8px
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-foreground}"
  status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.warning-foreground}"
  status-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.info-foreground}"
  status-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    height: 32px
    padding: 10px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.3xl}"
    padding: 16px
  card-footer:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    padding: 16px
  popover:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: 6px
  menu-item:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px
  tooltip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    padding: 12px
  dialog:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.4xl}"
    padding: 24px
  separator:
    backgroundColor: "{colors.border-subtle}"
    height: 1px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  field-outline:
    backgroundColor: "{colors.input}"
    width: 1px
  focus-ring:
    backgroundColor: "{colors.ring}"
    width: 2px
  indicator-dot:
    backgroundColor: "{colors.brand-accent}"
    size: 8px
  text-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-sm}"
  text-tertiary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground-low}"
    typography: "{typography.metadata}"
---

# Hyperagent Design System

The design system for apps built on Tailwind CSS v4 and shadcn/ui. The front
matter lists the tokens for design tools and linters. [Token CSS](#token-css)
holds the exact values the app runs on, and wins if the two ever disagree.
[Setup](#setup) wires it into a project; [Components](#components) says how to
restyle each shadcn component. The current version always lives at
<https://hyperagent-onboard.vercel.app/design.md>.

## Overview

White, warm and conversational: a paper-white canvas (a charcoal one in dark),
sand-tinted neutrals, a single tangerine accent, Geist everywhere, and every
control shaped like a pill. It should feel like a calm conversation with a
capable colleague, not a dense dashboard. Depth comes from hairlines and soft
glass shadows, never from grey boxes.

The rules that everything below follows:

1. **Change a token before a class, and a component before a call site.** A
   new look goes into the tokens or a `cva` variant in `components/ui`. At a
   call site, `className` is for layout only: margin, width, flex and grid
   placement. Never colour, radius or type.
2. **Ink by default, tangerine once.** The default button is ink
   (`bg-primary`). Tangerine (`bg-brand`) marks the one main call to action in
   a view, the user's chat bubble, the focus ring, selected-item checks and
   text selection. Nothing else.
3. **Fills are tints.** Rest `bg-tint-10`, hover and on-state `bg-tint-15`,
   disabled `bg-tint-5`. A tint is translucent sand, so one class reads right
   on the canvas, on a card and in both themes.
4. **Controls are pills.** Buttons, badges, tabs, toggles, switches, chips,
   avatars and search fields are `rounded-full`. Containers follow the radius
   scale in [Shapes](#shapes).
5. **Edges are hairlines.** `shadow-edge` or `ring-1 ring-border-subtle`, not a
   solid border. Elevation is the glass shadows in
   [Elevation & Depth](#elevation--depth).
6. **Semantic tokens only.** No raw `#hex`, `oklch()` or `rgb()`, no Tailwind
   palette colours (`zinc-*`, `gray-*`, `orange-*`), and no `dark:` colour
   overrides: every token already switches with the theme.
7. **Status colour stays small.** Dots, icons and badges at a 10% fill with
   status-coloured text. Never a large red, green or amber area.

## Setup

0. **Save this file** at the root of your repo, where your agents can read it,
   and run the same command again to update it:

   ```sh
   curl -o hyperagent-DESIGN.md https://hyperagent-onboard.vercel.app/design.md
   ```

1. **Fonts.** Load Geist and Geist Mono and expose them on `<html>` as
   `--font-geist-sans` and `--font-geist-mono`. In Next.js:

   ```tsx
   import { Geist, Geist_Mono } from "next/font/google";

   const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
   const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

   // <html className={`${sans.variable} ${mono.variable}`}>
   ```

   Outside Next.js, install the `geist` package or
   `@fontsource-variable/geist`. The font stacks fall back to the family names
   "Geist" and "Geist Mono".

2. **Tokens.** In the stylesheet shadcn/ui created (`app/globals.css`,
   `src/index.css` …), keep the `@import` lines (`tailwindcss`,
   `tw-animate-css`, and `shadcn/tailwind.css` if it is there) and replace
   everything after them with the two blocks in [Token CSS](#token-css). That
   removes shadcn's own `@custom-variant`, `@theme inline`, `:root`, `.dark`
   and `@layer base`. Replace them; don't merge the two sets.

3. **Dark mode.** Put the `dark` class on `<html>` (next-themes:
   `attribute="class"` and `disableTransitionOnChange`, so switching themes
   doesn't animate every colour on the page). Nothing else changes; every
   semantic token re-maps under `.dark`.

4. **`cn()`.** Teach tailwind-merge the new names. Without this it drops
   classes it misreads: `text-display` looks like a colour, and
   `text-label-12-caps` loses to `text-muted-foreground`.

   ```ts
   import { clsx, type ClassValue } from "clsx";
   import { extendTailwindMerge } from "tailwind-merge";

   const twMerge = extendTailwindMerge<"text-role">({
     extend: {
       theme: {
         text: ["md", "display"],
         "font-weight": ["strong"],
         spacing: ["group", "stack", "section"],
         container: ["content", "wide", "nav"],
         radius: ["bubble"],
         shadow: ["edge", "card", "card-hover", "card-soft", "rim", "rim-soft"],
         blur: ["glass"],
         ease: ["out-quart", "out-quint", "out-layout", "out-expo"],
       },
       classGroups: {
         "text-role": ["text-heading-display", "text-heading-lg", "text-label-14-mono", "text-label-12-mono", "text-label-12-caps"],
       },
     },
   });

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

5. **Point your agents here.** Coding agents don't look for this file on their
   own.
   - `AGENTS.md` (Codex, Cursor, and Claude Code when there is no
     `CLAUDE.md`): add one line, *"UI follows hyperagent-DESIGN.md: read it
     before changing any component, style or layout."*
   - Claude Code: a rule that loads only when UI files are touched, in
     `.claude/rules/ui.md`. Don't `@`-import the file from `CLAUDE.md`; that
     loads all of it into every session.

     ```md
     ---
     paths:
       - "**/components/**"
       - "**/app/**"
       - "**/*.css"
     ---
     Read hyperagent-DESIGN.md before changing UI. Tokens and component
     recipes there override shadcn/ui defaults.
     ```

   - Cursor: `.cursor/rules/design.mdc`.

     ```md
     ---
     description: Hyperagent design system: tokens and shadcn/ui component recipes
     globs: src/**, app/**, components/**
     alwaysApply: false
     ---
     @hyperagent-DESIGN.md
     ```

6. **Restyle the components.** Work through [Components](#components) one file
   at a time in `components/ui/`, then run the checks in
   [Verification](#verification).

## Colors

Warm, not grey. The neutrals ("sand") carry a faint yellow tint (hue 100,
chroma at most 0.01), so white reads as paper and the dark canvas (#1e1e1d) as
charcoal rather than steel. There is one accent, tangerine (#f55d00), and it is
used rarely. Every value is OKLCH. The front matter gives the sRGB hex of each
light value for tools, with the translucent ones (tints, the hairline, the
field outline) flattened over the white canvas; [Token CSS](#token-css) has the
exact values for both themes.

| Token (utility) | Use |
|---|---|
| `background` | The canvas. White in light, #1e1e1d in dark. |
| `foreground` | Primary text: the ink. |
| `muted-foreground` | Second tier: descriptions, inactive tabs, menu icons, secondary buttons' text. |
| `foreground-low` | Third tier: placeholders, captions, timestamps, group labels. Passes AA; don't set body copy in it. |
| `foreground-inverted` | Text on an ink fill. |
| `card`, `popover`, `overlay` | Cards, floating surfaces, dialogs and sheets. The same white as the canvas in light (separation comes from `shadow-card` and the ring); one step up in dark. |
| `surface-secondary` | Quiet panels: the sidebar, card footers, secondary buttons. Sits below the canvas in dark. |
| `surface-elevated`, `surface-raised` | The composer and glass badges; a whisper above the canvas. |
| `primary` / `primary-foreground` | The ink fill: default button, checked checkbox and switch, tooltips, default badge. Flips to near-white in dark. |
| `secondary`, `muted`, `accent` (+ `-foreground`) | shadcn's contract, all near-canvas sand here. `accent` is the solid hover for chips. Prefer tints in new work. |
| `tint-5` … `tint-40` | Translucent sand. 5 disabled and pressed · 7 row hover and the segmented track · 10 rest fill (chips, tint buttons, skeletons, keycaps) · 12 hairline · 15 hover and on-state · 20 switch off and field outline · 25 hover over 20 · 40 scrollbar thumb. |
| `border` | An opaque divider, where a hairline must not show what is behind it. |
| `border-subtle` | The default hairline (`border-border-subtle`, `ring-border-subtle`, `shadow-edge`). |
| `input`, `border-loud` | Field outlines and their hover. |
| `ring` | The focus ring: tangerine. |
| `brand` / `brand-foreground` | The text-safe tangerine fill (the 600 step): the one main call to action per view, the user's chat bubble. |
| `brand-accent` | The exact brand orange (the 500 step): focus rings, selected-item checks, selection, small graphics. 3:1 on white, so never text. |
| `brand-subtle` / `brand-subtle-foreground` | A tangerine-tinted surface and its text: the brand badge, a highlighted row. |
| `destructive` / `destructive-foreground` | Red. Used as red text on a 10% red fill; solid only for a confirming action. |
| `success`, `warning`, `info` (+ `-foreground`) | Status: dots, icons, badges at a 10% fill. Never a large area. |
| `chip` / `chip-foreground` | Suggestion and filter chips. |
| `chat-bubble-user`, `chat-bubble-assistant` (+ `-foreground`) | Chat. The user's bubble is the brand fill; the assistant's is sand. |
| `selection`, `scrim` | Text selection (set in the base layer); the dialog backdrop (with `backdrop-blur-xs`). |
| `sidebar-*` | shadcn's sidebar contract. |
| `chart-1` … `chart-6`, `chart-seq-1` … `chart-seq-5`, `chart-track`, `chart-grid`, `chart-target`, `chart-band` | Charts: tangerine first, then sand, then the status hues; a sequential tangerine ramp; bar and ring tracks, gridlines, goal lines and optimal-range bands. |

**Ramps.** `neutral` (sand, 50 → 950, plus 925 and 975 for the dark surfaces),
`tangerine`, `red`, `green`, `amber` and `blue`. All six sit on one lightness
ramp, so step N of any hue has the same contrast as step N of any other. They
replace Tailwind's own `neutral`, `red`, `green`, `amber` and `blue`. Reach for
a ramp only to define a new semantic token; components use the semantics.

## Typography

Geist for everything. Geist Mono only for code, commands, paths, IDs, versions
and figures that need an even advance. There is no display face. Body text uses
Geist's recommended features, `"rlig" 1, "calt" 0, "ss11" 1`, set once on
`body`.

**Weights:** 400 for copy and labels · 500 for buttons, tabs, badges, menu
labels and names · 550 (`font-strong`) for `<strong>` inside copy · 600 for
every heading, built into `text-xl` and up. Nothing else.

| Class | Size / line | Tracking | Weight | Use |
|---|---|---|---|---|
| `text-xs` | 12 / 16 | 0 | 400, 500 on badges | Badges, keycaps, captions, `xs` buttons |
| `text-md` | 13 / 18 | 0 | 400 | Metadata, timestamps |
| `text-sm` | 14 / 20 | 0 | 400, 500 on controls | The UI default: buttons, fields on desktop, menus, tables, card body |
| `text-base` | 16 / 24 | 0 | 400 | Body copy, chat; fields on mobile (16px stops iOS zooming in) |
| `text-lg` | 18 / 28 | 0 | 400 | A single lede |
| `text-xl` | 20 / 26 | -0.02em | 600 | Subsection headings |
| `text-2xl` | 24 / 32 | -0.04em | 600 | Section headings, dialog titles |
| `text-3xl` | 32 / 40 | -0.04em | 600 | Page titles on narrow screens |
| `text-4xl` | 40 / 48 | -0.06em | 600 | The page title |
| `text-5xl` | 48 / 56 | -0.06em | 600 | A display statement |
| `text-display` | fluid 40 → 48 | -0.06em | 600 | The one hero line |

**Role utilities** (defined in [Token CSS](#token-css)): `text-heading-lg`
(18/28 at 600, row and card titles), `text-heading-display`,
`text-label-14-mono` and `text-label-12-mono` (tabular figures, slashed zero),
and `text-label-12-caps` (12/16 at 500, uppercase, +0.06em: labels over a group
of cards; uppercase always travels with its tracking).

- A heading at body size is `text-base font-semibold` or `text-sm font-semibold`.
- `font-heading` marks a heading's family (Geist today; the one line to change
  if a display face is ever added).
- `text-balance` on headings, `text-pretty` on descriptions, `tabular-nums` on
  numbers that update.
- Keep reading columns to about 65 characters.

## Layout

- **Grid:** 4px (Tailwind's default `--spacing: 0.25rem`).
- **Rhythm, three steps:** `gap-group` 12px (rows inside one block, a row of
  chips) → `gap-stack` 24px (blocks inside a section) → `gap-section` 40px
  (sections, chat turns).
- **Padding:** `gap-1.5` to `gap-2` inside a control; `gap-2` between sibling
  controls; 16px inside a card (12px for `size="sm"`); 24px inside a dialog;
  6px (`p-1.5`) inside a menu; 16px for sheet headers and footers.
- **Control heights:** 28 (`xs`) · 32 (`sm`, fields, toggles, search) · 36
  (default button, select, tab list) · 40 (`lg`). Icon buttons are squares on
  the same steps (24 / 32 / 36 / 40). Badges and keycaps are 20.
- **Widths:** `max-w-content` 672px (a reading column), `max-w-wide` 752px (the
  composer, wide panels), `max-w-nav` 448px (a floating nav, narrow dialogs).
  Tooltips cap at 282px.
- **Responsive:** size components by their container, not the viewport. Mark a
  region `@container` and use `@md:` (448px and up) and `@2xl:` (672px and up).
- **Density:** comfortable. Controls are `text-sm` on a 16px page; nothing goes
  below `text-xs`.
- **Layers:** `z-(--z-sticky)` 40 for sticky chrome, `z-(--z-scrim)` 50 for the
  dialog backdrop, then `--z-dropdown` 100, `--z-modal` 200, `--z-tooltip` 300
  and `--z-toast` 400. Radix overlays portal to `<body>` with `z-50`.

## Elevation & Depth

Depth comes from hairlines and glass, not from grey backgrounds or heavy drop
shadows.

| Utility | What it draws | Use |
|---|---|---|
| `shadow-edge` | A 1px `border-subtle` line drawn as a shadow (no layout shift) | Outline buttons and badges, avatars (`after:`), any hairline box |
| `ring-1 ring-border-subtle` | The same line on a floating surface | Popovers, menus, select content, dialogs |
| `shadow-card` | The edge plus a 2px umbra at 3% | Resting cards |
| `shadow-card-hover` | Plus an 8/16px umbra at 6% | Hover on an interactive card, over `duration-(--duration-slow)` |
| `shadow-card-soft` | The edge plus half the drop | A quieter card |
| `shadow-xs` | A small glass: a faint umbra and inset highlights | The active tab, the on-item of a segmented control, the switch thumb |
| `shadow-sm` | A soft lift | The brand button |
| `shadow-md` | A raised control | Tooltips |
| `shadow-lg` | Floating glass, with a 1px light edge in dark | Menus, popovers, select content, dialogs, sheets, the composer |
| `shadow-xl`, `shadow-2xl` | Deep drops | Photo tiles and their hover only |
| `shadow-rim`, `shadow-rim-soft` | An inset rim light | Images and media tiles |
| `backdrop-blur-glass` | 12px blur | Translucent sticky bars over content |
| `bg-scrim backdrop-blur-xs` | 30% black and a 4px blur | Dialog and sheet backdrops |

**Surfaces.** In light, the canvas, cards and popovers are all white;
`shadow-card` and the rings separate them. In dark they step up:
`surface-secondary` (#191918, sunken) → `background` (#1e1e1d) →
`surface-raised` → `card` / `popover` / `overlay` (#2a2a28). The highlight and
edge colours inside the shadows switch with the theme, so the same `shadow-lg`
becomes a lit edge in dark with no extra class.

## Shapes

One knob, `--radius: 10px`. Every step is a ratio of it (the ratio-based
scale shadcn/ui now ships), so changing the knob rescales the whole UI in
proportion.

| Class | px | Use |
|---|---|---|
| `rounded-xs` | 4 | The smallest inner parts |
| `rounded-sm` | 6 | Checkbox, keycap, inline code, `shape="soft"` buttons |
| `rounded-md` | 8 | Menu and select items, skeletons |
| `rounded-lg` | 10 | Text fields, tooltips, command items |
| `rounded-xl` | 14 | Popovers, menus, select content, textareas |
| `rounded-2xl` | 18 | Small tiles, inline panels |
| `rounded-3xl` | 22 | Cards, the command palette |
| `rounded-4xl` | 26 | Dialogs, top and bottom sheets |
| `rounded-5xl` | 32 | The composer, large section cards |
| `rounded-bubble` | 20 | Chat bubbles |
| `rounded-full` | pill | Every button, badge, tab, toggle, switch, avatar, chip and search field |

- Controls are pills.
- Nested corners are concentric: inner radius = outer radius − padding. A
  `rounded-xl` menu with `p-1.5` holds `rounded-md` items.
- Full-width buttons stacked in a form may take `shape="soft"`, so a 384px pill
  doesn't read as a lozenge.

## Motion

Quick and quiet. Hover changes colour only; transforms are for entering,
leaving and pressing.

| Token | ms | Use |
|---|---|---|
| `--duration-exit` | 90 | Anything leaving. Exits are always faster than entrances |
| `--duration-instant` | 100 | Toggles, switches, menu item highlight |
| `--duration-enter` | 140 | Menus, popovers, tooltips appearing |
| `--duration-fast` | 150 | Buttons, fields |
| `--duration-normal` | 200 | Tabs, chips, colour changes, the dialog and its scrim |
| `--duration-move` | 220 | Layout and position shifts, sheets |
| `--duration-slow` | 300 | Hover shadows. The ceiling for product UI |
| `--duration-reveal` | 400 | Icon and composer reveals, charts drawing in |
| `--duration-slide` | 480 | Large transform moves |
| `--duration-entrance` | 500 | Staggered first-paint entrances, `--duration-stagger` (80) apart |

**Easing:** `ease-out-quart` for controls, `ease-out` for chips and tabs,
`ease-out-expo` for reveals and dialogs, `ease-out-quint` for large moves and
sheets, `ease-in-out` for on-screen movement, `ease-linear` for spinners.

- **A control:** `transition-[color,background-color,box-shadow,scale]
  duration-(--duration-fast) ease-out-quart motion-safe:active:scale-(--scale-press)`
  (0.98; icon buttons use `--scale-press-icon`, 0.95). Name `scale` in the
  list: Tailwind v4 compiles `scale-*` to the standalone `scale` property, so a
  list without it makes the press snap.
- **Menu, popover, tooltip** (with tw-animate-css):
  `data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
  data-[side=bottom]:slide-in-from-top-2 duration-(--duration-enter) ease-out-quart`,
  closing with `data-[state=closed]:animate-out data-[state=closed]:fade-out-0
  data-[state=closed]:zoom-out-95 data-[state=closed]:duration-(--duration-exit)`.
- **Dialog:** fade and `zoom-in-95` at `duration-(--duration-normal)
  ease-out-expo`; the scrim fades on the same duration and easing.
- **Sheet:** a 40px slide (`slide-in-from-right-10`) at
  `duration-(--duration-move) ease-out-quint`; its backdrop fades on the same
  duration and easing.
- **Card hover:** `transition-[box-shadow] duration-(--duration-slow) ease-out
  hover:shadow-card-hover`.
- **First paint:** fade and a 16px rise at `duration-(--duration-entrance)
  ease-out-expo`, siblings 80ms apart. Never scale from 0; start at 0.95.
- Never `transition-all`. The base block collapses every duration under
  `prefers-reduced-motion`; add `motion-reduce:animate-none` to entrances too.

**Rules**

- **Frequent means instant.** Something people open many times a day, or open
  from the keyboard (the command palette, a quick switcher), appears and leaves
  with no animation. Menus and popovers opened with the pointer keep the menu
  motion.
- **Grow from the trigger.** Popovers, menus, select content and tooltips set
  their transform origin to Radix's variable for that part:
  `origin-(--radix-popover-content-transform-origin)`, and likewise
  `--radix-dropdown-menu-…`, `--radix-context-menu-…`, `--radix-select-…`,
  `--radix-tooltip-…` and `--radix-hover-card-content-transform-origin`.
- **What moves together shares timing.** A dialog and its scrim, a sheet and
  its backdrop, a popover and the chevron that turns as it opens: one
  duration, one easing.
- **Animate `transform` and `opacity`.** Hover may also transition colour and
  shadow. Never animate `width`, `height`, `padding` or `margin`: open a
  collapsing panel with `grid-rows-[0fr]` → `grid-rows-[1fr]` and
  `transition-[grid-template-rows]`, or Motion's `layout`. Never animate a
  blur.
- **Hover is for pointers.** Tailwind v4's `hover:` only applies on devices
  that can hover, so hover styles don't stick after a tap. Keep it that way;
  never make a feature reachable only by hovering.

### Motion in JavaScript

CSS transitions cover most of the UI. Use Motion (`motion/react`) only for what
CSS can't do: exits of elements leaving the tree, layout changes, drag and
gestures, and movement the user can interrupt. Motion takes numbers, not CSS
variables, so copy these constants once (for example to `lib/motion.ts`) and
build every transition from them:

```ts
// Seconds, Motion's unit. The same values as the --duration-* and --ease-* tokens.
export const DURATION = {
  exit: 0.09, instant: 0.1, enter: 0.14, fast: 0.15, normal: 0.2, move: 0.22,
  slow: 0.3, reveal: 0.4, slide: 0.48, entrance: 0.5, stagger: 0.08,
} as const;

export const EASE = {
  out: [0, 0, 0.2, 1],
  outQuart: [0.165, 0.84, 0.44, 1],
  outQuint: [0.22, 1, 0.36, 1],
  outLayout: [0.23, 1, 0.32, 1],
  outExpo: [0.16, 1, 0.3, 1],
  inOut: [0.4, 0, 0.2, 1],
} as const;

/** Every sliding indicator and reflowing card. */
export const LAYOUT_TRANSITION = { duration: DURATION.move, ease: EASE.outLayout } as const;

/** Springs are for motion the user drives. No bounce by default. */
export const SPRING = { type: "spring", visualDuration: 0.3, bounce: 0 } as const;
/** Releasing a drag: the one place a little bounce belongs. */
export const SPRING_RELEASE = { type: "spring", visualDuration: 0.35, bounce: 0.15 } as const;
```

- **Always pass a transition.** Motion's default for `x`, `y`, `scale` and
  `rotate` is a bouncy spring, so an animation left on its default is
  off-brand. Set the default once at the root; `reducedMotion="user"` is also
  what makes JavaScript animations honour reduced motion, which the CSS block
  can't reach:

  ```tsx
  <MotionConfig reducedMotion="user" transition={{ duration: DURATION.normal, ease: EASE.outQuart }}>
  ```

- **Tweens by default.** Enter from `{ opacity: 0, scale: 0.95 }` or
  `{ opacity: 0, y: 8 }` at `{ duration: DURATION.enter, ease: EASE.outQuart }`;
  exit at `{ duration: DURATION.exit, ease: EASE.out }`; size and position
  changes with `layout` and `transition={LAYOUT_TRANSITION}`; press with
  `whileTap={{ scale: 0.98 }}`; first-paint lists with
  `staggerChildren: DURATION.stagger`.
- **Springs only when the user drives the motion:** a released drag
  (`SPRING_RELEASE`), a sheet snapping to rest, a gesture they can reverse
  halfway (`SPRING`). Never on menus, dialogs, tooltips or colour. Bounce stays
  at 0.15 or below.
- **Drag decides on release:** dismiss when the element has travelled past its
  threshold or was flicked (Motion's `info.velocity` above about 100px/s),
  otherwise spring back with `SPRING_RELEASE`.
- **Exits in a list:** `<AnimatePresence mode="popLayout" initial={false}>`, so
  siblings reflow while the item leaves and nothing animates on first render.
- **Only `x`, `y`, `scale`, `rotate` and `opacity`.** Change size through
  `layout`, never by animating `width` or `height`. Keep per-frame values out of
  React state (`useMotionValue`, `useTransform`), and pause loops that scroll
  out of view (`useInView`).

## Icons

One outline icon set per product, never two. The reference implementation uses
Tabler (`@tabler/icons-react`); Lucide, shadcn's default, is fine if the whole
app uses it. Keep the stroke at 2.

- **Sizes:** `size-4` (16) in buttons, menus, fields and tabs; `size-3.5` (14)
  in `xs` controls and select indicators; `size-3` (12) in badges and keycaps;
  `size-5` (20) in the command palette's input. Components set the default
  with `[&_svg:not([class*='size-'])]:size-4`, so a caller can still override
  it.
- **Colour:** `currentColor`, from the parent's `text-*`. Menu and command
  items dim their icons with `[&_svg:not([class*='text-'])]:text-muted-foreground`.
- Decorative icons get `aria-hidden="true"`. An icon-only button gets an
  `aria-label`, and usually a tooltip.

## Components

Recipes for the shadcn/ui components in `components/ui/`. Keep each
component's file, exports, props, Radix parts and `data-slot` attributes;
replace its classes and add the variants listed. Mirror `variant` and `size` on
the root as `data-variant` and `data-size`, and call `cn()` last so a caller's
`className` wins.

What every interactive component shares:

- **Focus:** pills use `outline-none focus-visible:ring-2 focus-visible:ring-ring/50`
  (buttons add `focus-visible:ring-offset-2 focus-visible:ring-offset-background`).
  Fields use `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25`.
- **Disabled:** `disabled:pointer-events-none disabled:opacity-50`; fields also
  take `disabled:bg-tint-5`.
- **Invalid:** `aria-invalid:border-destructive aria-invalid:ring-3
  aria-invalid:ring-destructive/20` on fields, `aria-invalid:ring-2
  aria-invalid:ring-destructive/40` on buttons.
- Radix states are written in their explicit form (`data-[state=open]:`). New
  shadcn projects also ship short aliases in `shadcn/tailwind.css`
  (`data-open:`, `data-active:`, `data-horizontal:`); either works.

### Button

The pattern every other recipe follows.

```tsx
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium select-none outline-none transition-[color,background-color,box-shadow,scale] duration-(--duration-fast) ease-out-quart focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-(--scale-press) disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
        secondary: "bg-surface-secondary text-foreground hover:bg-tint-15 aria-expanded:bg-tint-15",
        outline: "bg-background text-foreground shadow-edge hover:bg-tint-10 aria-expanded:bg-tint-10",
        ghost: "text-foreground hover:bg-tint-10 aria-expanded:bg-tint-10",
        tint: "bg-tint-10 text-muted-foreground hover:bg-tint-15 hover:text-foreground aria-expanded:bg-tint-15 aria-expanded:text-foreground",
        chip: "bg-chip text-chip-foreground hover:bg-accent hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 px-6 has-[>svg]:px-4",
        "icon-xs": "size-6 motion-safe:active:scale-(--scale-press-icon)",
        "icon-sm": "size-8 motion-safe:active:scale-(--scale-press-icon)",
        icon: "size-9 motion-safe:active:scale-(--scale-press-icon)",
        "icon-lg": "size-10 motion-safe:active:scale-(--scale-press-icon)",
      },
      shape: {
        pill: "",
        soft: "rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "pill" },
  },
);
```

When to use each variant: `default` (ink) for most actions · `brand` for the
one main call to action in a view · `secondary` for a quiet solid · `outline`
for a hairline on the canvas · `ghost` in toolbars and inline · `tint` for
toolbar pills and filter triggers · `chip` for suggestions and filters (set
`aria-pressed` for the on-state) · `destructive` for red text on a 10% red
fill · `link`.

### Badge

- **Base:** `inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1
  overflow-hidden rounded-full px-2 text-xs font-medium whitespace-nowrap
  tabular-nums transition-[color,background-color] duration-(--duration-fast)
  ease-out-quart [&>svg]:size-3!`
- **Variants:** `default` `bg-primary text-primary-foreground` · `secondary`
  `bg-tint-10 text-muted-foreground` · `outline` `shadow-edge text-foreground` ·
  `ghost` `text-muted-foreground hover:bg-tint-10 hover:text-foreground` ·
  `destructive` `bg-destructive/10 text-destructive` · `brand`
  `bg-brand-subtle text-brand-subtle-foreground` · `success` / `warning` /
  `info` `bg-success/10 text-success` (and so on) · `link`. As a link, the
  hover steps one tint up (`[a]:hover:bg-tint-15`).

### Card

- **Root:** `flex flex-col gap-(--card-spacing) overflow-hidden rounded-3xl
  bg-card py-(--card-spacing) text-sm text-card-foreground shadow-card`.
- **Sizes:** `default` `[--card-spacing:--spacing(4)]` (16px) · `sm`
  `[--card-spacing:--spacing(3)]` (12px).
- **Variant `interactive`:** `transition-[box-shadow] duration-(--duration-slow)
  ease-out hover:shadow-card-hover`, for a card that is a link or button
  (render it with `asChild`).
- **Parts:** header and content `px-(--card-spacing)`, header `gap-1`; title
  `font-heading text-base leading-snug font-medium` (`text-sm` at `sm`);
  description `text-sm text-muted-foreground`; footer `flex items-center
  border-t border-border-subtle bg-surface-secondary p-(--card-spacing)`.

### Input and Textarea

- **Input:** `h-8 w-full min-w-0 rounded-lg border border-input bg-transparent
  px-2.5 py-1 text-base md:text-sm placeholder:text-foreground-low
  transition-[color,border-color,box-shadow] duration-(--duration-fast)
  ease-out-quart outline-none hover:border-border-loud`, plus the field focus,
  disabled and invalid states above.
- **Textarea:** the same, with `field-sizing-content min-h-16 rounded-xl px-3 py-2`.
- **Variant `bare`** (for fields inside a composite, like a menu's search box):
  `h-auto rounded-none border-0 p-0 shadow-none focus-visible:ring-0`.
- **Input group** (a search field with an icon or button): the group is the
  pill, `h-8 rounded-full border border-input`, and takes the focus ring when
  its control has focus
  (`has-[[data-slot=input-group-control]:focus-visible]:border-ring …`). Addons
  are `text-sm text-muted-foreground [&>svg]:size-4`; the input inside is bare.
- **Label:** `flex items-center gap-2 text-sm font-medium select-none
  peer-disabled:opacity-50`.

### Checkbox, Switch and Radio

- **Checkbox:** `size-4 shrink-0 rounded-sm border border-input
  transition-[color,background-color,border-color,box-shadow]
  duration-(--duration-fast) ease-out-quart hover:border-border-loud
  data-[state=checked]:border-primary data-[state=checked]:bg-primary
  data-[state=checked]:text-primary-foreground` (the same for
  `indeterminate`), with the field focus ring. The check icon is `size-3.5`.
- **Switch:** track `inline-flex h-[1.15rem] w-8 shrink-0 rounded-full border
  border-transparent transition-[background-color,box-shadow]
  duration-(--duration-instant) ease-out data-[state=checked]:bg-primary
  data-[state=unchecked]:bg-tint-20 data-[state=unchecked]:hover:bg-tint-25`,
  with the pill focus ring and offset. Thumb `size-4 rounded-full bg-background
  shadow-xs transition-transform duration-(--duration-instant)
  data-[state=checked]:translate-x-[calc(100%-2px)]
  data-[state=checked]:bg-primary-foreground`. Size `sm`: track `h-3.5 w-6`,
  thumb `size-3`.
- **Radio group:** the checkbox recipe with `rounded-full`; the checked dot is
  `size-2 rounded-full bg-primary-foreground` on `bg-primary`.

### Select

- **Trigger:** `flex w-fit items-center justify-between gap-2 whitespace-nowrap
  rounded-full px-3 text-sm font-medium transition-[color,background-color,scale]
  duration-(--duration-normal) ease-out motion-safe:active:scale-(--scale-press)
  data-[placeholder]:text-foreground-low`, with the pill focus ring. Sizes
  `default` `h-9`, `sm` `h-8`.
- **Trigger variants:** `outline` `bg-background text-foreground shadow-edge
  hover:bg-tint-10 aria-expanded:bg-tint-10` · `tint` `bg-tint-10
  text-muted-foreground hover:bg-tint-15 hover:text-foreground
  aria-expanded:bg-tint-15`.
- **Content:** the menu surface below, `position="popper"`, `sideOffset={4}`,
  `origin-(--radix-select-content-transform-origin)`.
- **Item:** `rounded-md py-1.5 pr-8 pl-2 text-sm focus:bg-tint-10
  focus:text-foreground`. The selected check sits at the right in
  `text-brand-accent`, `size-3.5`.

### Dropdown Menu and Context Menu

- **Content:** `z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-xl
  bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-border-subtle
  origin-(--radix-dropdown-menu-content-transform-origin)` (the context menu:
  `origin-(--radix-context-menu-content-transform-origin)`), with the menu
  motion. `sideOffset={4}`.
- **Item:** `relative flex cursor-pointer items-center gap-2 rounded-md px-2
  py-1.5 text-sm outline-hidden select-none transition-[color,background-color]
  duration-(--duration-instant) ease-out focus:bg-tint-10 focus:text-foreground
  [&_svg:not([class*='text-'])]:text-muted-foreground`.
- **Variants:** `destructive` `text-destructive focus:bg-destructive/10` (its
  icon red too) · `inset` `pl-8`.
- **Parts:** label `px-2 py-1.5 text-sm font-medium` · separator `-mx-1.5 my-1.5
  h-px bg-border-subtle` · shortcut `ml-auto text-xs tracking-widest
  text-muted-foreground` · an open sub-trigger `data-[state=open]:bg-tint-10`.

### Popover and Tooltip

- **Popover:** `z-50 rounded-xl bg-popover text-popover-foreground shadow-lg
  ring-1 ring-border-subtle outline-none
  origin-(--radix-popover-content-transform-origin)`, with the menu motion.
  `sideOffset={4}`.
  Set width and padding per use; `w-72 p-4` is the usual default.
- **Tooltip:** an ink card, no arrow: `z-50 w-fit max-w-[282px] rounded-lg
  bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md
  break-words origin-(--radix-tooltip-content-transform-origin)`, with the menu
  motion. `sideOffset={6}`, provider
  `delayDuration={0}`. A keycap inside it is `bg-background/20 text-background`.

### Dialog and Sheet

- **Overlay (both):** `fixed inset-0 z-50 bg-scrim backdrop-blur-xs`. It fades
  on its surface's timing (the dialog's `duration-(--duration-normal)
  ease-out-expo`, the sheet's `duration-(--duration-move) ease-out-quint`) and
  out over `duration-(--duration-exit)`.
- **Dialog content:** `m-auto grid w-[calc(100%-2rem)] gap-4 rounded-4xl
  bg-overlay p-6 text-foreground shadow-lg ring-1 ring-border-subtle
  outline-none sm:max-w-lg`, with the dialog motion. Title `font-heading
  text-2xl text-balance`; description `text-sm text-muted-foreground
  text-pretty`; footer `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`;
  close button `absolute top-4 right-4 size-8 rounded-full text-muted-foreground
  hover:bg-tint-10 hover:text-foreground`.
- **Alert dialog:** the dialog recipe. The confirming button is `destructive`
  when it destroys something, `default` otherwise.
- **Sheet content:** `fixed z-50 flex flex-col gap-4 bg-overlay text-sm
  shadow-lg`, with the sheet motion. `right` / `left`: `inset-y-0 h-full w-3/4
  sm:max-w-sm` with `border-l` / `border-r border-border-subtle`. `top` /
  `bottom`: `inset-x-0` with `rounded-b-4xl` / `rounded-t-4xl`. Header and
  footer `p-4`, title `font-heading text-lg font-medium`, description
  `text-sm text-muted-foreground`.

### Tabs and Toggles

- **Tab list:** `inline-flex h-9 w-fit items-center rounded-full bg-tint-10 p-1
  text-muted-foreground`.
- **Tab:** `inline-flex h-full flex-1 items-center justify-center gap-1.5
  rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap
  transition-[color,background-color,box-shadow] duration-(--duration-normal)
  ease-out hover:text-foreground data-[state=active]:bg-background
  data-[state=active]:text-foreground data-[state=active]:shadow-xs`, with the
  pill focus ring.
- **Variant `line`:** the list is `gap-1 bg-transparent p-0`; the tab drops its
  fill and shadow and shows a `h-0.5 bg-foreground` underline (an `after:`
  element 5px below) when active.
- **Toggle:** `inline-flex items-center justify-center gap-1 rounded-full
  text-sm font-medium text-muted-foreground
  transition-[color,background-color,box-shadow] duration-(--duration-normal)
  ease-out hover:bg-tint-10 hover:text-foreground data-[state=on]:bg-tint-15
  data-[state=on]:text-foreground`. Sizes `sm` `h-7 min-w-7 px-2.5` · `default`
  `h-8 min-w-8 px-2.5` · `lg` `h-9 min-w-9 px-2.5`. Variant `outline` adds
  `shadow-edge`.
- **Toggle group as a segmented control** (`spacing={0}`): the group is
  `rounded-full bg-tint-7 p-0.5`; items are `h-7 min-w-7 px-2`, and the on-item
  is `bg-background shadow-xs`.

### Command

- In a dialog: `top-[25%] max-w-xl gap-0 overflow-hidden rounded-3xl p-0`.
  People open it many times a day, from the keyboard, so it appears and leaves
  without animation: add `data-[state=open]:animate-none
  data-[state=closed]:animate-none` to its content and its overlay.
- **Input row:** `flex h-12 items-center gap-2 border-b border-border-subtle
  px-3`, a `size-5 text-foreground-low` search icon, and the input `h-12
  bg-transparent text-base placeholder:text-foreground-low`.
- **Group heading:** `px-2 py-1.5 text-xs font-medium uppercase
  tracking-[0.06em] text-foreground-low`.
- **Item:** `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm
  data-[selected=true]:bg-tint-10 data-[selected=true]:text-foreground`, icons
  dimmed as in menus. Empty state `py-6 text-center text-sm
  text-muted-foreground`.

### Avatar, Separator, Skeleton, Scroll Area, Kbd

- **Avatar:** `relative flex size-8 shrink-0 rounded-full after:absolute
  after:inset-0 after:rounded-full after:shadow-edge`; sizes `sm` `size-6`,
  `lg` `size-10`. Fallback `bg-tint-10 text-sm font-medium
  text-muted-foreground`. In a group, each avatar gets `ring-2 ring-background`.
- **Separator:** `shrink-0 bg-border-subtle`, `h-px w-full` or `w-px`.
- **Skeleton:** `animate-skeleton rounded-md bg-tint-10` (or the `skeleton`
  utility).
- **Scroll area:** the bar is `w-2.5 p-px`, the thumb `rounded-full bg-tint-40`.
- **Kbd:** `inline-flex h-5 min-w-5 items-center justify-center gap-1
  rounded-sm bg-tint-10 px-1 font-mono text-xs font-medium
  text-muted-foreground [&_svg]:size-3`.

### Everything else

Components not listed above follow the same rules. These are the recipes that
follow from them:

- **Sidebar:** `bg-sidebar`. Items are pills: `flex w-full items-center gap-2
  rounded-full px-3.5 py-1.5 text-sm text-foreground hover:bg-tint-10`, the
  muted tone `text-muted-foreground hover:text-foreground`, the active item
  `bg-tint-15 text-foreground`. The weight never changes between states, so
  the label doesn't shift. Group labels are `text-label-12-caps
  text-foreground-low`.
- **Alert:** `rounded-xl bg-surface-secondary p-4 text-sm shadow-edge` with a
  `size-4` icon. `destructive` turns the icon and title `text-destructive` and
  leaves the body `text-muted-foreground`. No coloured fills.
- **Accordion:** items split by `border-b border-border-subtle`; the trigger is
  `py-3 text-sm font-medium` with a `size-4 text-muted-foreground` chevron that
  turns 180° over `duration-(--duration-normal)`; the content is `pb-3 text-sm
  text-muted-foreground`.
- **Table:** `text-sm`. Header cells `h-9 px-3 text-xs font-medium
  text-foreground-low`; body cells `px-3 py-2.5`; rows `border-b
  border-border-subtle hover:bg-tint-7`, selected `bg-tint-10`; numbers
  `tabular-nums text-right`.
- **Slider:** track `h-1 rounded-full bg-tint-20`, range `bg-primary`, thumb
  `size-4 rounded-full bg-background shadow-md ring-1 ring-border-subtle` with
  the pill focus ring.
- **Progress:** track `h-1.5 rounded-full bg-tint-10`, indicator `bg-primary`
  (`bg-brand` only for the one metric a page is about).
- **Toast (Sonner):** the popover surface, `rounded-xl bg-popover shadow-lg
  ring-1 ring-border-subtle text-sm`, title `font-medium`, description
  `text-muted-foreground`, with the menu motion.
- **Hover card:** the popover recipe at `w-72 p-4`, with
  `origin-(--radix-hover-card-content-transform-origin)`.
- **Breadcrumb:** `text-sm text-muted-foreground`, the current page
  `font-medium text-foreground`, separators `size-3.5 text-foreground-low`.
- **Pagination:** `ghost` `icon-sm` buttons; the current page is `outline`.
- **Calendar:** day cells `size-8 rounded-full text-sm hover:bg-tint-10`; the
  selected day `bg-primary text-primary-foreground`; today
  `ring-1 ring-border-loud`.
- **Chart:** series take `chart-1`, `chart-2` … in order; gridlines
  `chart-grid`, tracks `chart-track`, goal lines `chart-target` (dashed); the
  chart's tooltip is the popover surface.

## Accessibility

- **Contrast:** every foreground / background pair in [Colors](#colors) passes
  WCAG AA in both themes: 4.5:1 for text, 3:1 for UI and focus rings.
  `brand-accent` is graphic-only. A new pair must clear the same bar.
- **Focus:** visible for keyboard users only (`:focus-visible`), always
  tangerine. Controls inside a card, where an offset ring would clip, use the
  `focus-ring` utility: a canvas-coloured gap, then a 2px `brand-accent` ring.
- **Targets:** 32px is the smallest pointer target, and 24px icon buttons
  appear only inside dense toolbars. On touch screens, give anything under 44px
  a 44px hit area with a pseudo-element: add `relative
  pointer-coarse:after:absolute pointer-coarse:after:-inset-1.5` to a 32px
  control (`-inset-2.5` on a 24px one).
- **Fields:** `text-base` on mobile, `md:text-sm` on desktop, so iOS doesn't
  zoom when a field takes focus.
- **Motion:** respect `prefers-reduced-motion`. The base block covers CSS;
  JavaScript animations need `<MotionConfig reducedMotion="user">` (see
  [Motion in JavaScript](#motion-in-javascript)).

## Do's and Don'ts

- Do use `bg-primary` (ink) for the default action and `bg-brand` for at most
  one call to action per view.
- Do build fills from tints: `bg-tint-10` at rest, `hover:bg-tint-15`,
  `bg-tint-5` when disabled.
- Do draw edges with `shadow-edge` or `ring-1 ring-border-subtle`; keep
  `border` for dividers inside a surface.
- Do write motion with the duration and easing tokens, and list the properties
  you transition.
- Don't write raw colours (`#…`, `oklch(…)`, `rgb(…)`), Tailwind's other
  palettes (`zinc-*`, `gray-*`, `slate-*`, `orange-*`) or arbitrary colour
  values.
- Don't add `dark:` colour variants; the tokens switch on their own.
- Don't fill a large area with status or brand colour, and never set text in
  `brand-accent`.
- Don't use weights other than 400, 500, 550 and 600, or track body text.
- Don't mix icon sets, and don't use `transition-all`.
- Don't leave a Motion animation on its default transition, and don't put a
  spring on a menu, dialog or tooltip.
- Don't animate what people open many times a day from the keyboard.

## Verification

Before calling UI work done:

1. `npx @google/design.md lint hyperagent-DESIGN.md` passes with no errors.
2. No colour values outside the token CSS:
   `grep -rnE "#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|\b(zinc|slate|gray|stone|orange|sky)-[0-9]" components/`
   finds nothing but false positives (an anchor link, an id).
3. `grep -rnE "transition-all|dark:" components/ui` finds nothing, and every
   hit for `grep -rn 'type: "spring"'` is a drag or a gesture.
4. The screen looks right in light and in dark, at 390px and at desktop width,
   and tabbing through it shows a ring on every control.
5. Any new colour pair clears 4.5:1 for text or 3:1 for UI.

## Token CSS

Two blocks. In the stylesheet shadcn/ui created, keep the `@import` lines and
replace everything after them with these, in this order. The first holds every
token; the second holds the base styles, the utilities that are not tokens, and
the keyframes.

<!-- generated:css -->
```css
@custom-variant dark (&:is(.dark *));

/* 1. Scales. The same in both themes; each becomes a Tailwind utility
   (bg-tangerine-500, text-2xl, rounded-3xl, shadow-card, ease-out-quart …).
   `static` emits every variable, so var(--color-blue-400) works in inline
   styles even before a class uses it. */
@theme static {
  /* Colour ramps. One lightness ramp (50 → 950) shared by every hue, so any two families swap step for step. The hex is the sRGB value, for reference. */
  --color-neutral-50: oklch(0.9818 0.0013 100.00); /* #f9f9f8 */
  --color-neutral-100: oklch(0.9520 0.0025 100.00); /* #efefed */
  --color-neutral-200: oklch(0.9097 0.0042 100.00); /* #e2e1de */
  --color-neutral-300: oklch(0.8852 0.0042 100.00); /* #dad9d6 */
  --color-neutral-400: oklch(0.7666 0.0087 100.00); /* #b4b3ad */
  --color-neutral-500: oklch(0.6700 0.0100 100.00); /* #96958f */
  --color-neutral-600: oklch(0.5530 0.0089 100.00); /* #73736d */
  --color-neutral-700: oklch(0.4981 0.0078 100.00); /* #64635e */
  --color-neutral-800: oklch(0.3484 0.0053 100.00); /* #3b3a37 */
  --color-neutral-900: oklch(0.2843 0.0036 100.00); /* #2a2a28 */
  --color-neutral-925: oklch(0.2530 0.0019 100.00); /* #222221 */
  --color-neutral-950: oklch(0.2346 0.0019 100.00); /* #1e1e1d */
  --color-neutral-975: oklch(0.2130 0.0019 100.00); /* #191918 */
  --color-tangerine-50: oklch(0.9818 0.0093 42.00); /* #fff7f4 */
  --color-tangerine-100: oklch(0.9520 0.0220 42.00); /* #fdebe4 */
  --color-tangerine-200: oklch(0.9097 0.0450 42.00); /* #fdd8ca */
  --color-tangerine-300: oklch(0.8852 0.0638 42.00); /* #ffccb9 */
  --color-tangerine-400: oklch(0.7666 0.1447 42.00); /* #ff9166 */
  --color-tangerine-500: oklch(0.6700 0.2022 42.00); /* #f55d00 */
  --color-tangerine-600: oklch(0.5530 0.1668 42.00); /* #be4600 */
  --color-tangerine-700: oklch(0.4981 0.1503 42.00); /* #a53c00 */
  --color-tangerine-800: oklch(0.3484 0.1051 42.00); /* #652100 */
  --color-tangerine-900: oklch(0.2843 0.0850 42.00); /* #4b1700 */
  --color-tangerine-950: oklch(0.2346 0.0600 42.00); /* #341205 */
  --color-red-50: oklch(0.9818 0.0088 25.00); /* #fff7f6 */
  --color-red-100: oklch(0.9520 0.0238 25.00); /* #ffe9e7 */
  --color-red-200: oklch(0.9097 0.0465 25.00); /* #ffd6d2 */
  --color-red-300: oklch(0.8852 0.0604 25.00); /* #ffcbc5 */
  --color-red-400: oklch(0.7666 0.1250 25.00); /* #f9928a */
  --color-red-500: oklch(0.6700 0.1600 25.00); /* #e76761 */
  --color-red-600: oklch(0.5530 0.1550 25.00); /* #bc4441 */
  --color-red-700: oklch(0.4981 0.1350 25.00); /* #a13c39 */
  --color-red-800: oklch(0.3484 0.1000 25.00); /* #641f1e */
  --color-red-900: oklch(0.2843 0.0750 25.00); /* #481816 */
  --color-red-950: oklch(0.2346 0.0500 25.00); /* #321312 */
  --color-green-50: oklch(0.9818 0.0120 158.00); /* #f3fcf6 */
  --color-green-100: oklch(0.9520 0.0240 158.00); /* #e3f4e9 */
  --color-green-200: oklch(0.9097 0.0500 158.00); /* #c7ecd5 */
  --color-green-300: oklch(0.8852 0.0850 158.00); /* #aaebc4 */
  --color-green-400: oklch(0.7666 0.1250 158.00); /* #65cb94 */
  --color-green-500: oklch(0.6700 0.1567 158.00); /* #00b16f */
  --color-green-600: oklch(0.5530 0.1293 158.00); /* #008854 */
  --color-green-700: oklch(0.4981 0.1165 158.00); /* #007648 */
  --color-green-800: oklch(0.3484 0.0815 158.00); /* #004629 */
  --color-green-900: oklch(0.2843 0.0665 158.00); /* #00331d */
  --color-green-950: oklch(0.2346 0.0500 158.00); /* #042515 */
  --color-amber-50: oklch(0.9818 0.0120 70.00); /* #fff8f1 */
  --color-amber-100: oklch(0.9520 0.0240 70.00); /* #faedde */
  --color-amber-200: oklch(0.9097 0.0500 70.00); /* #f7dcbe */
  --color-amber-300: oklch(0.8852 0.0850 70.00); /* #fed09c */
  --color-amber-400: oklch(0.7666 0.1250 70.00); /* #e6a452 */
  --color-amber-500: oklch(0.6700 0.1451 70.00); /* #cd8300 */
  --color-amber-600: oklch(0.5530 0.1198 70.00); /* #9e6400 */
  --color-amber-700: oklch(0.4981 0.1079 70.00); /* #895600 */
  --color-amber-800: oklch(0.3484 0.0754 70.00); /* #533200 */
  --color-amber-900: oklch(0.2843 0.0616 70.00); /* #3d2300 */
  --color-amber-950: oklch(0.2346 0.0500 70.00); /* #2d1900 */
  --color-blue-50: oklch(0.9818 0.0088 252.00); /* #f5faff */
  --color-blue-100: oklch(0.9520 0.0235 252.00); /* #e4f1ff */
  --color-blue-200: oklch(0.9097 0.0449 252.00); /* #cce4ff */
  --color-blue-300: oklch(0.8852 0.0576 252.00); /* #bedcff */
  --color-blue-400: oklch(0.7666 0.1227 252.00); /* #77b8ff */
  --color-blue-500: oklch(0.6700 0.1600 252.00); /* #3f98f4 */
  --color-blue-600: oklch(0.5530 0.1550 252.00); /* #1774c9 */
  --color-blue-700: oklch(0.4981 0.1350 252.00); /* #1864ac */
  --color-blue-800: oklch(0.3484 0.1000 252.00); /* #043b6c */
  --color-blue-900: oklch(0.2843 0.0750 252.00); /* #072b4d */
  --color-blue-950: oklch(0.2346 0.0500 252.00); /* #0a1f35 */

  /* Type: Geist and Geist Mono. Headings carry their own tracking and the heading weight through the --text-* companions. */
  --font-sans: var(--font-geist-sans, "Geist"), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-heading: var(--font-sans);
  --font-mono: var(--font-geist-mono, "Geist Mono"), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-strong: 550;
  --font-weight-semibold: 600;
  --text-xs: 12px;
  --text-xs--line-height: 16px;
  --text-xs--letter-spacing: 0;
  --text-sm: 14px;
  --text-sm--line-height: 20px;
  --text-sm--letter-spacing: 0;
  --text-md: 13px;
  --text-md--line-height: 18px;
  --text-md--letter-spacing: 0;
  --text-base: 16px;
  --text-base--line-height: 24px;
  --text-base--letter-spacing: 0;
  --text-lg: 18px;
  --text-lg--line-height: 28px;
  --text-lg--letter-spacing: 0;
  --text-xl: 20px;
  --text-xl--line-height: 26px;
  --text-xl--letter-spacing: -0.02em;
  --text-xl--font-weight: var(--font-weight-heading);
  --text-2xl: 24px;
  --text-2xl--line-height: 32px;
  --text-2xl--letter-spacing: -0.04em;
  --text-2xl--font-weight: var(--font-weight-heading);
  --text-3xl: 32px;
  --text-3xl--line-height: 40px;
  --text-3xl--letter-spacing: -0.04em;
  --text-3xl--font-weight: var(--font-weight-heading);
  --text-4xl: 40px;
  --text-4xl--line-height: 48px;
  --text-4xl--letter-spacing: -0.06em;
  --text-4xl--font-weight: var(--font-weight-heading);
  --text-5xl: 48px;
  --text-5xl--line-height: 56px;
  --text-5xl--letter-spacing: -0.06em;
  --text-5xl--font-weight: var(--font-weight-heading);
  --text-display: clamp(2.5rem, 5vw, 3rem);
  --text-display--line-height: 1.15;
  --text-display--letter-spacing: -0.06em;
  --text-display--font-weight: var(--font-weight-heading);

  /* Radius: every step is a ratio of --radius (on :root), so one knob softens or sharpens the whole UI. */
  --radius-xs: calc(var(--radius) * 0.4);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --radius-5xl: calc(var(--radius) * 3.2);
  --radius-bubble: calc(var(--radius) * 2);
  --radius-full: 9999px;

  /* Elevation: glass shadows (low-alpha umbras plus inset highlights) and hairlines drawn as box-shadows. */
  --blur-glass: 12px;
  --shadow-2xs: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-xs: 0 0 3px oklch(0 0 0 / 0.08), inset 0 1px 1px 0 var(--highlight), inset 0 -1px 1px 0 var(--highlight-soft);
  --shadow-sm: 0 2px 2px 0 oklch(0 0 0 / 0.03), 0 0.5px 0.5px 0 oklch(0 0 0 / 0.03), 0 4px 43px 0 oklch(0 0 0 / 0.06);
  --shadow-md: 0 10px 10px 0 oklch(0 0 0 / 0.10), 0 4px 4px -2px oklch(0 0 0 / 0.10), 0 2px 2px -1px oklch(0 0 0 / 0.03), 0 1px 1px -0.5px oklch(0 0 0 / 0.05), inset 0 1px 2px 0 var(--highlight), inset 0 -1px 2px 0 var(--highlight-soft);
  --shadow-lg: 0 12px 12px 0 oklch(0 0 0 / 0.09), 0 17.2px 17.2px -8.6px oklch(0 0 0 / 0.03), 0 8.6px 8.6px -4.3px oklch(0 0 0 / 0.03), 0 4.3px 4.3px -2.15px oklch(0 0 0 / 0.03), 0 1.075px 1.075px -0.538px oklch(0 0 0 / 0.03), 0 0 0 1px var(--edge), inset 0 -2.15px 2.15px 0 var(--highlight-strong), inset 0 2.15px 2.15px 0 var(--highlight-strong);
  --shadow-xl: 0 32px 32px oklch(0 0 0 / 0.10), 0 17px 17px -9px oklch(0 0 0 / 0.10), 0 9px 9px -4px oklch(0 0 0 / 0.03), 0 4px 4px -2px oklch(0 0 0 / 0.05), 0 1px 1px -0.5px oklch(0 0 0 / 0.05);
  --shadow-2xl: 0 20px 40px oklch(0 0 0 / 0.15), 0 8px 16px oklch(0 0 0 / 0.10);
  --shadow-edge: 0 0 0 1px var(--border-subtle);
  --shadow-card: 0 0 0 1px var(--border-subtle), 0 2px 2px 0 oklch(0 0 0 / 0.03);
  --shadow-card-hover: 0 0 0 1px var(--border-subtle), 0 2px 2px 0 oklch(0 0 0 / 0.03), 0 8px 16px -4px oklch(0 0 0 / 0.06);
  --shadow-card-soft: 0 0 0 1px var(--border-subtle), 0 1px 2px 0 oklch(0 0 0 / 0.015);
  --shadow-rim: inset 0 2px 4px var(--highlight), inset 0 -2px 4px var(--highlight);
  --shadow-rim-soft: inset 0 2px 4px var(--highlight-soft), inset 0 -2px 4px var(--highlight-soft);

  /* Layout: content widths and the group → stack → section rhythm (gap-group, gap-stack, gap-section). */
  --container-content: 42rem;
  --container-wide: 47rem;
  --container-nav: 28rem;
  --spacing-group: 0.75rem;
  --spacing-stack: 1.5rem;
  --spacing-section: 2.5rem;

  /* Motion: easing curves and animations. Durations and press scales are plain variables on :root. */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-layout: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-linear: linear;
  --animate-typing-dot: typing-dot 1s linear infinite;
  --animate-skeleton: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-ring-draw: ring-draw var(--duration-reveal) var(--ease-out-expo) both;
}

/* 2. Knobs and the light theme. */
:root {
  /* The knobs */
  --font-weight-heading: var(--font-weight-semibold);
  color-scheme: light;
  --radius: 10px;

  /* Motion values. Not utilities: write duration-(--duration-fast) and motion-safe:active:scale-(--scale-press). */
  --duration-exit: 90ms;
  --duration-instant: 100ms;
  --duration-enter: 140ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-move: 220ms;
  --duration-slow: 300ms;
  --duration-reveal: 400ms;
  --duration-slide: 480ms;
  --duration-entrance: 500ms;
  --duration-stagger: 80ms;
  --ease: ease;
  --scale-press: 0.98;
  --scale-press-icon: 0.95;
  --scale-enter: 0.95;
  --translate-enter: 16px;

  /* Layers: z-(--z-dropdown), z-(--z-modal) … */
  --z-sticky: 40;
  --z-scrim: 50;
  --z-dropdown: 100;
  --z-modal: 200;
  --z-tooltip: 300;
  --z-toast: 400;

  /* Canvas, text and the shadcn/ui contract */
  --background: oklch(1 0 0);
  --foreground: var(--color-neutral-950);
  --card: oklch(1 0 0);
  --card-foreground: var(--color-neutral-950);
  --popover: oklch(1 0 0);
  --popover-foreground: var(--color-neutral-950);
  --primary: var(--color-neutral-950);
  --primary-foreground: oklch(1 0 0);
  --secondary: var(--color-neutral-50);
  --secondary-foreground: var(--color-neutral-950);
  --muted: var(--color-neutral-50);
  --muted-foreground: var(--color-neutral-700);
  --accent: var(--color-neutral-100);
  --accent-foreground: var(--color-neutral-950);
  --destructive: var(--color-red-600);
  --destructive-foreground: oklch(1 0 0);
  --border: var(--color-neutral-300);
  --input: var(--color-tint-20);
  --ring: var(--color-tangerine-500);

  /* Status: small fills, dots and text, never large areas */
  --success: var(--color-green-700);
  --success-foreground: oklch(1 0 0);
  --warning: var(--color-amber-600);
  --warning-foreground: oklch(1 0 0);
  --info: var(--color-blue-600);
  --info-foreground: oklch(1 0 0);

  /* Tints: translucent sand, the workhorse fill. The base is theme-switched, so one class reads right in both themes. */
  --tint-5: oklch(0.6700 0.0100 100.00 / 0.05);
  --tint-7: oklch(0.6700 0.0100 100.00 / 0.07);
  --tint-10: oklch(0.6700 0.0100 100.00 / 0.10);
  --tint-12: oklch(0.6700 0.0100 100.00 / 0.12);
  --tint-15: oklch(0.6700 0.0100 100.00 / 0.15);
  --tint-20: oklch(0.6700 0.0100 100.00 / 0.20);
  --tint-25: oklch(0.6700 0.0100 100.00 / 0.25);
  --tint-40: oklch(0.6700 0.0100 100.00 / 0.40);

  /* Surfaces, text tiers and edges */
  --surface-secondary: var(--color-neutral-50);
  --surface-elevated: oklch(1 0 0);
  --surface-raised: var(--color-neutral-100);
  --foreground-low: var(--color-neutral-600);
  --border-subtle: var(--color-tint-12);
  --border-loud: var(--color-tint-20);
  --foreground-inverted: oklch(1 0 0);
  --overlay: oklch(1 0 0);
  --scrim: oklch(0 0 0 / 0.3);

  /* Brand: tangerine, the one accent */
  --brand-accent: var(--color-tangerine-500);
  --brand: var(--color-tangerine-600);
  --brand-foreground: oklch(1 0 0);
  --brand-subtle: var(--color-tangerine-50);
  --brand-subtle-foreground: var(--color-tangerine-700);
  --selection: color-mix(in oklab, var(--color-tangerine-500) 18%, transparent);
  --selection-foreground: var(--color-tangerine-700);

  /* Chips and chat */
  --chip: var(--color-neutral-100);
  --chip-foreground: var(--color-neutral-700);
  --chat-bubble-user: var(--color-tangerine-600);
  --chat-bubble-user-foreground: oklch(1 0 0);
  --chat-bubble-assistant: var(--color-neutral-100);
  --chat-bubble-assistant-foreground: var(--color-neutral-950);

  /* Glass: the shadow highlights, and the 1px edge that appears in dark */
  --highlight: oklch(1 0 0 / 0.5);
  --highlight-soft: oklch(1 0 0 / 0.2);
  --highlight-strong: oklch(1 0 0 / 1);
  --edge: transparent;

  /* Sidebar */
  --sidebar: var(--color-neutral-50);
  --sidebar-foreground: var(--color-neutral-950);
  --sidebar-primary: var(--color-neutral-950);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: var(--color-neutral-100);
  --sidebar-accent-foreground: var(--color-neutral-950);
  --sidebar-border: var(--color-neutral-300);
  --sidebar-ring: var(--color-tangerine-500);

  /* Charts */
  --chart-1: var(--color-tangerine-500);
  --chart-2: var(--color-neutral-700);
  --chart-3: var(--color-blue-600);
  --chart-4: var(--color-green-600);
  --chart-5: var(--color-amber-600);
  --chart-6: var(--color-red-600);
  --chart-track: var(--color-tint-10);
  --chart-grid: var(--border-subtle);
  --chart-target: var(--color-neutral-600);
  --chart-band: color-mix(in oklab, var(--color-green-500) 12%, transparent);
  --chart-seq-1: var(--color-tangerine-100);
  --chart-seq-2: var(--color-tangerine-200);
  --chart-seq-3: var(--color-tangerine-300);
  --chart-seq-4: var(--color-tangerine-500);
  --chart-seq-5: var(--color-tangerine-700);
}

/* 3. The dark theme re-maps the semantics only; the scales never change. */
.dark {
  color-scheme: dark;

  /* Canvas, text and the shadcn/ui contract */
  --background: var(--color-neutral-950);
  --foreground: var(--color-neutral-100);
  --card: var(--color-neutral-900);
  --card-foreground: var(--color-neutral-100);
  --popover: var(--color-neutral-900);
  --popover-foreground: var(--color-neutral-100);
  --primary: var(--color-neutral-100);
  --primary-foreground: var(--color-neutral-950);
  --secondary: var(--color-neutral-900);
  --secondary-foreground: var(--color-neutral-100);
  --muted: var(--color-neutral-900);
  --muted-foreground: var(--color-neutral-400);
  --accent: var(--color-neutral-900);
  --accent-foreground: var(--color-neutral-100);
  --destructive: var(--color-red-500);
  --destructive-foreground: var(--color-neutral-950);
  --border: var(--color-neutral-800);
  --input: var(--color-tint-20);
  --ring: var(--color-tangerine-400);

  /* Status: small fills, dots and text, never large areas */
  --success: var(--color-green-500);
  --success-foreground: var(--color-neutral-950);
  --warning: var(--color-amber-500);
  --warning-foreground: var(--color-neutral-950);
  --info: var(--color-blue-500);
  --info-foreground: var(--color-neutral-950);

  /* Tints: translucent sand, the workhorse fill. The base is theme-switched, so one class reads right in both themes. */
  --tint-5: oklch(0.5530 0.0089 100.00 / 0.05);
  --tint-7: oklch(0.5530 0.0089 100.00 / 0.07);
  --tint-10: oklch(0.5530 0.0089 100.00 / 0.10);
  --tint-12: oklch(0.5530 0.0089 100.00 / 0.12);
  --tint-15: oklch(0.5530 0.0089 100.00 / 0.15);
  --tint-20: oklch(0.5530 0.0089 100.00 / 0.20);
  --tint-25: oklch(0.5530 0.0089 100.00 / 0.25);
  --tint-40: oklch(0.5530 0.0089 100.00 / 0.40);

  /* Surfaces, text tiers and edges */
  --surface-secondary: var(--color-neutral-975);
  --surface-elevated: var(--color-neutral-900);
  --surface-raised: var(--color-neutral-925);
  --foreground-low: var(--color-neutral-500);
  --border-subtle: var(--color-tint-12);
  --border-loud: var(--color-tint-20);
  --foreground-inverted: var(--color-neutral-950);
  --overlay: var(--color-neutral-900);
  --scrim: oklch(0 0 0 / 0.3);

  /* Brand: tangerine, the one accent */
  --brand-accent: var(--color-tangerine-400);
  --brand: var(--color-tangerine-600);
  --brand-foreground: oklch(1 0 0);
  --brand-subtle: var(--color-tangerine-950);
  --brand-subtle-foreground: var(--color-tangerine-300);
  --selection: color-mix(in oklab, var(--color-tangerine-400) 22%, transparent);
  --selection-foreground: var(--color-tangerine-300);

  /* Chips and chat */
  --chip: var(--color-neutral-900);
  --chip-foreground: var(--color-neutral-400);
  --chat-bubble-user: var(--color-tangerine-600);
  --chat-bubble-user-foreground: oklch(1 0 0);
  --chat-bubble-assistant: var(--color-neutral-900);
  --chat-bubble-assistant-foreground: var(--color-neutral-100);

  /* Glass: the shadow highlights, and the 1px edge that appears in dark */
  --highlight: oklch(1 0 0 / 0.15);
  --highlight-soft: oklch(1 0 0 / 0.05);
  --highlight-strong: oklch(1 0 0 / 0.08);
  --edge: oklch(1 0 0 / 0.07);

  /* Sidebar */
  --sidebar: var(--color-neutral-950);
  --sidebar-foreground: var(--color-neutral-100);
  --sidebar-primary: var(--color-neutral-100);
  --sidebar-primary-foreground: var(--color-neutral-950);
  --sidebar-accent: var(--color-neutral-900);
  --sidebar-accent-foreground: var(--color-neutral-100);
  --sidebar-border: var(--color-neutral-800);
  --sidebar-ring: var(--color-tangerine-400);

  /* Charts */
  --chart-1: var(--color-tangerine-400);
  --chart-2: var(--color-neutral-400);
  --chart-3: var(--color-blue-400);
  --chart-4: var(--color-green-400);
  --chart-5: var(--color-amber-400);
  --chart-6: var(--color-red-400);
  --chart-track: var(--color-tint-15);
  --chart-grid: var(--border-subtle);
  --chart-target: var(--color-neutral-400);
  --chart-band: color-mix(in oklab, var(--color-green-400) 14%, transparent);
  --chart-seq-1: var(--color-tangerine-900);
  --chart-seq-2: var(--color-tangerine-800);
  --chart-seq-3: var(--color-tangerine-600);
  --chart-seq-4: var(--color-tangerine-400);
  --chart-seq-5: var(--color-tangerine-300);
}

/* 4. Semantic colours → utilities (bg-background, text-foreground-low,
   bg-tint-10, bg-brand …). `inline` makes each utility read the variable,
   so it follows :root / .dark. */
@theme inline {
  /* Canvas, text and the shadcn/ui contract */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Status: small fills, dots and text, never large areas */
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);

  /* Tints: translucent sand, the workhorse fill. The base is theme-switched, so one class reads right in both themes. */
  --color-tint-5: var(--tint-5);
  --color-tint-7: var(--tint-7);
  --color-tint-10: var(--tint-10);
  --color-tint-12: var(--tint-12);
  --color-tint-15: var(--tint-15);
  --color-tint-20: var(--tint-20);
  --color-tint-25: var(--tint-25);
  --color-tint-40: var(--tint-40);

  /* Surfaces, text tiers and edges */
  --color-surface-secondary: var(--surface-secondary);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-raised: var(--surface-raised);
  --color-foreground-low: var(--foreground-low);
  --color-border-subtle: var(--border-subtle);
  --color-border-loud: var(--border-loud);
  --color-foreground-inverted: var(--foreground-inverted);
  --color-overlay: var(--overlay);
  --color-scrim: var(--scrim);

  /* Brand: tangerine, the one accent */
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-brand-accent: var(--brand-accent);
  --color-brand-subtle: var(--brand-subtle);
  --color-brand-subtle-foreground: var(--brand-subtle-foreground);
  --color-selection: var(--selection);
  --color-selection-foreground: var(--selection-foreground);

  /* Chips and chat */
  --color-chip: var(--chip);
  --color-chip-foreground: var(--chip-foreground);
  --color-chat-bubble-user: var(--chat-bubble-user);
  --color-chat-bubble-user-foreground: var(--chat-bubble-user-foreground);
  --color-chat-bubble-assistant: var(--chat-bubble-assistant);
  --color-chat-bubble-assistant-foreground: var(--chat-bubble-assistant-foreground);

  /* Sidebar */
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);

  /* Charts */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);
  --color-chart-track: var(--chart-track);
  --color-chart-grid: var(--chart-grid);
  --color-chart-target: var(--chart-target);
  --color-chart-band: var(--chart-band);
  --color-chart-seq-1: var(--chart-seq-1);
  --color-chart-seq-2: var(--chart-seq-2);
  --color-chart-seq-3: var(--chart-seq-3);
  --color-chart-seq-4: var(--chart-seq-4);
  --color-chart-seq-5: var(--chart-seq-5);
}
```
<!-- /generated:css -->

```css
@layer base {
  * {
    border-color: var(--border);
    outline-color: var(--ring);
  }
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-synthesis: none;
    font-kerning: normal;
    font-optical-sizing: auto;
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
    font-weight: var(--font-weight-normal);
    letter-spacing: 0;
    font-feature-settings: "rlig" 1, "calt" 0, "ss11" 1;
  }
  ::selection {
    background-color: var(--selection);
    color: var(--selection-foreground);
  }
  ::placeholder {
    color: var(--foreground-low);
  }
  /* Keyboard focus only. :where() keeps it weak, so a component's own ring wins. */
  :where(:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}

/* A double ring for controls inside cards, where an offset ring would clip. */
@utility focus-ring {
  outline-style: none;
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--brand-accent);
  }
}

@utility skeleton {
  animation: var(--animate-skeleton);
  border-radius: var(--radius-md);
  background-color: var(--tint-10);
}

/* Type roles that need a family or a case, which --text-* tokens cannot set. */
@utility text-heading-display {
  font-family: var(--font-heading);
  font-size: var(--text-display);
  line-height: 1.15;
  font-weight: var(--font-weight-heading);
  letter-spacing: -0.06em;
}
@utility text-heading-lg {
  font-family: var(--font-heading);
  font-size: 18px;
  line-height: 28px;
  font-weight: var(--font-weight-heading);
  letter-spacing: -0.02em;
}
@utility text-label-14-mono {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  font-variant-numeric: tabular-nums slashed-zero;
}
@utility text-label-12-mono {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  font-variant-numeric: tabular-nums slashed-zero;
}
@utility text-label-12-caps {
  font-family: var(--font-sans);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@keyframes pulse {
  50% { opacity: 0.5; }
}
@keyframes typing-dot {
  0%, 60%, 100% { opacity: 0.25; }
  10%, 50% { opacity: 0.5; }
}
/* An SVG arc drawing in: set --ring-from and --ring-to on the element. */
@keyframes ring-draw {
  from { stroke-dashoffset: var(--ring-from); }
  to { stroke-dashoffset: var(--ring-to); }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
