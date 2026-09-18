---
name: Brand
description: The design system of the agent dashboard re-skin. Warm paper, ink, one tangerine accent, Geist throughout.
colors:
  tangerine: "oklch(0.6700 0.2022 42)"
  tangerine-text-safe: "oklch(0.5530 0.1668 42)"
  tangerine-dark-accent: "oklch(0.7666 0.1447 42)"
  paper: "oklch(1 0 0)"
  sand-50: "oklch(0.9818 0.0013 100)"
  sand-100: "oklch(0.9520 0.0025 100)"
  sand-300: "oklch(0.8852 0.0042 100)"
  sand-400: "oklch(0.7666 0.0087 100)"
  sand-500: "oklch(0.6700 0.0100 100)"
  sand-600: "oklch(0.5530 0.0089 100)"
  sand-700: "oklch(0.4981 0.0078 100)"
  sand-800: "oklch(0.3484 0.0053 100)"
  sand-900: "oklch(0.2843 0.0036 100)"
  ink: "oklch(0.2346 0.0019 100)"
  tint-10: "oklch(0.6700 0.0100 100 / 0.10)"
  tint-12: "oklch(0.6700 0.0100 100 / 0.12)"
  tint-15: "oklch(0.6700 0.0100 100 / 0.15)"
  red-600: "#bc4441"
  green-700: "#007648"
  amber-600: "#9e6400"
  blue-600: "#1774c9"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.06em"
  page-title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: "48px"
    letterSpacing: "-0.06em"
  page-title-compact:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "40px"
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.04em"
  section:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "26px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0"
    fontFeature: "\"rlig\" 1, \"calt\" 0, \"ss11\" 1"
  ui:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0"
  meta:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0"
  label-caps:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.06em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    fontFeature: "\"tnum\" 1, \"zero\" 1"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  4xl: "26px"
  5xl: "32px"
  full: "9999px"
spacing:
  unit: "4px"
  group: "12px"
  stack: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "36px"
  button-brand:
    backgroundColor: "{colors.tangerine-text-safe}"
    textColor: "{colors.paper}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.tint-10}"
  chip:
    backgroundColor: "{colors.sand-100}"
    textColor: "{colors.sand-700}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    height: "32px"
  badge:
    backgroundColor: "{colors.tint-10}"
    textColor: "{colors.sand-700}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "20px"
  input:
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  tabs-list:
    backgroundColor: "{colors.tint-10}"
    rounded: "{rounded.full}"
    padding: "4px"
    height: "36px"
  tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.3xl}"
    padding: "16px"
---

# Design System: Brand

The source of truth is `src/design/brand/brand.css`; `docs/brand/design.md` is the long-form guide. If this file ever disagrees with either, they win. Values above are the light mapping (`:root`); the app opens in dark (`.dark`), where the same semantic names remap and the primitives stay put.

## 1. Overview

**Creative North Star: "The Warm Paper Desk"**

A calm working surface for people who run agents: paper-white (or near-black ink in dark), sand-tinted neutrals, one hot tangerine used rarely, and Geist carrying every word. It should feel like a well-kept desk with a notebook open on it, not a control room. Density is allowed where people scan (rails, lists, tables); reading surfaces get room to breathe.

The system rejects the steel-grey SaaS dashboard, the "everything in one grey" template page, decoration standing in for hierarchy, and orange used as garnish. Hierarchy comes from type size, weight and space first; lines and fills come last.

Space runs on Tailwind's 4px scale with three named rhythm steps: **group** (12px, rows inside one block), **stack** (24px, between blocks) and **section** (40px, between sections or turns). Reading columns sit at 560 to 700px (`max-w-content` is 672px, `max-w-wide` 752px) so body text lands at 65 to 75 characters a line. Controls come in three heights: 32, 36 to 40, and 48px.

**Key Characteristics:**
- One family (Geist) at four weights, Geist Mono only for identifiers and figures.
- Fills are translucent tints, so one class works in both themes.
- Soft shapes: pills for controls, 22 to 32px radii for cards and the composer.
- Hairlines over shadows; shadows only on floating things.
- Motion is quick (150 to 300ms), ease-out, and conveys state only.

## 2. Colors

Sand neutrals with a faint yellow lean (hue 100, chroma at most 0.010) and a single tangerine (hue 42) that is reserved, not spread.

### Primary
- **Tangerine** (oklch(0.67 0.20 42)): graphical accent only: focus rings, selection, icons, the brand mark. It fails AA as a text ground.
- **Deep Tangerine** (oklch(0.553 0.167 42)): the text-safe fill (`bg-brand`, white text at 5.2:1). The one primary call to action per view and the user's chat bubble.

### Neutral
- **Paper** (oklch(1 0 0)): the light canvas and card ground; cards share the canvas and separate by hairline.
- **Ink** (oklch(0.235 0.002 100)): light-theme text and the default button; also the dark canvas.
- **Sand 50 / 100**: the secondary surface and chips.
- **Sand 700**: `muted-foreground`, running copy (6.0:1).
- **Sand 600**: `foreground-low`, labels and provenance (4.8:1).
- **Sand 300**: `border`. Hairlines are `tint-12` (`border-subtle`).
- **Tints 5 to 40**: sand 500 at fixed alphas; `tint-10` rest, `tint-15` hover, `tint-12` hairline.

### Status
Red, green, amber and blue share one chroma envelope, quieter than the brand. Deep fills with white text in light, lighter fills with ink text in dark. Used as small dots, chips and soft `/10` tints, never large fills.

### Named Rules
**The One Orange Rule.** One tangerine action per view. Everything else is ink, chip or ghost. Orange as decoration is prohibited.

**The Tint-First Rule.** Reach for `bg-tint-10` / `hover:bg-tint-15` before a solid step. Tints need no `dark:` override; solids usually do.

## 3. Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono, for code, paths, ids, versions, timestamps and measured figures only

**Character:** One neo-grotesque doing every job, with hierarchy built from size, the 600 heading weight and negative tracking on large sizes. Quiet at rest, confident at the top of a page.

### Hierarchy
Every size is a `--text-*` token that carries its own line-height, tracking and, from 20px up, the heading weight. Use `text-<size>`; never an arbitrary `text-[Npx]`.
- **Display** (600, clamp 40 to 48px, 1.15, -0.06em): the single page-defining statement, when scale is earned. `text-display` / `text-heading-display`.
- **Page title** (600, 40/48, -0.06em; compact 32/40, -0.04em): the title of a page or document. `text-4xl`, or `text-3xl` in a column under 640px.
- **Headline** (600, 24/32, -0.04em): major section turns, dialog titles, dashboard page titles. `text-2xl`.
- **Section** (600, 20/26, -0.02em): section headings inside a page or answer. `text-xl`.
- **Title** (600, 18/28, -0.02em): sub-sections, card and list-row titles. `text-heading-lg`.
- **Lede** (400, 18/28): one short orientation passage under a title. `text-lg`.
- **Body** (400, 16/24): anything read as sentences. Cap the measure at 65 to 75ch. `text-base`.
- **UI** (400 or 500, 14/20): buttons, tabs, chips, nav rows, table cells, list rows. `text-sm`.
- **Meta** (400, 13/18): captions, meta lines, subordinate evidence, outline entries. `text-md`.
- **Label** (400 or 500, 12/16): keycaps, footers, disclaimers, badge text. `text-xs`. Caps variant: 500, +0.06em, uppercase, `text-label-12-caps`, for the label over a group only.

Weights are 400 (copy), 500 (controls and labels that name a thing), 550 (`font-strong`, `<strong>` inside running copy) and 600 (every heading, via the role). No other weight exists.

Text colour carries a role, in three tiers: **foreground** for the voice (headings, names, the chosen value), **muted-foreground** for running copy, **foreground-low** for what is scanned (labels, provenance, meta). On a `tint-10` ground tier 3 moves up to `muted-foreground` to keep AA.

### Named Rules
**The Reading Floor Rule.** Anything read as a sentence (an article body, a description, a lede) is `text-base` or larger. 14px and below is for things that are scanned: controls, rows, rails, meta. A body at 14px in a wide column is the most common way a page ends up looking small.

**The Heading Weight Rule.** A heading is larger than the text under it and at 600. A heading at body size or at 400 is only a paragraph, whatever its tag, and a rule line cannot make up for it.

**The Heading Gap Rule.** Heading levels that can sit next to each other are at least 6px apart. A titled document runs 32 / 24 / 18 over a 16px body (`text-3xl`, `text-2xl`, `text-heading-lg`, `text-base`); a 20px heading directly over an 18px one reads as a single level.

**The Peer Rule.** Equivalent items share role, size, weight, line-height and numeric treatment. Never resize one because its string is longer. Changing numbers get `tabular-nums`.

## 4. Elevation

Mostly flat. Separation comes from hairlines (`border-subtle`, or `shadow-edge` for a hairline without a border box) and from surface steps (`surface-secondary` groups; `card` plus `shadow-card` is the tile you act on). Real shadows are a glass stack of low-alpha umbra layers with inset highlights, and they belong to things that float.

### Shadow Vocabulary
- **Edge** (`box-shadow: 0 0 0 1px var(--border-subtle)`): a hairline on chips, outline buttons, tables.
- **Card** (`box-shadow: 0 0 0 1px var(--border-subtle), 0 2px 2px 0 oklch(0 0 0 / 0.03)`): a resting card or block.
- **Card hover** (adds `0 8px 16px -4px oklch(0 0 0 / 0.06)`): hover lift at 300ms.
- **Large** (`shadow-lg`, five umbra layers, an edge and strong inset highlights): the composer, popovers, menus.

### Named Rules
**The Hairline-First Rule.** Separate with space first, a hairline second and a shadow last. `shadow-lg` and up are for the composer, popovers and tiles only.

## 5. Components

Refined and restrained: soft pill shapes, ink before orange, colour-only hovers.

### Buttons
- **Shape:** full pill (9999px); `shape="soft"` gives 6px.
- **Primary:** ink fill, paper text, 14px at 500, 36px tall (`h-9 px-4`); `sm` 32px, `lg` 40px, `xs` 28px.
- **Brand:** deep tangerine fill with white text. Once per view.
- **Outline / Ghost / Secondary:** paper with an edge hairline, transparent, or the secondary surface; all hover to `tint-10` / `tint-15`.
- **Hover / Focus:** colour only at 150ms ease-out-quart; press scales to 0.98 under `motion-safe`; focus is a 2px ring at 50% with a 2px offset.

### Chips and badges
- **Chips:** `bg-chip` pill, 14px, pressed state is ink.
- **Badges:** 20px pill, 12px at 500, tabular figures. Variants: `secondary` (tint), `outline` (edge), status tints at `/10`.

### Cards / Containers
- **Corner Style:** 22px (`rounded-3xl`).
- **Background:** the canvas colour; separation by `shadow-card`.
- **Internal Padding:** 16px (`sm` 12px).
- Nested cards are prohibited; group inside a card with space and hairlines.

### Inputs / Fields
- **Style:** 32px, 10px radius, `border-input` (tint-20) on transparent; 16px text on mobile, 14px from `md`.
- **Focus:** border turns to the ring colour with a 3px ring at 25%.
- **Error / Disabled:** destructive border and ring; disabled drops to `tint-5` at 50%.

### Navigation
- **Tabs:** a tint pill track (`tabs-list`, 36px) with the active tab raised to paper; `variant="line"` gives an underline tab set. 14px at 500.
- **Rails and lists:** rows at 14px (`text-sm`), 6px vertical padding, `rounded-md`, `hover:bg-tint-10`; the current row is `bg-tint-10` in `foreground`.

### Reading surface (`.genui-prose`)
The markdown body of answers and documents: 16/24 body, `h2` at the Section role, `h3` at the Title role, 12px between blocks, 24px above an `h2`, 20px above an `h3`, 4px between list items, links underlined with a `border-loud` decoration at a 4px offset. Any new long-form surface starts from it. A document that has its own page title and uses sub-sections (a wiki page) steps `h2` up to the Headline role (24px) per the Heading Gap Rule, and keeps 40px above each `h2`, 8px below it, with no rule line.

## 6. Do's and Don'ts

### Do:
- **Do** consume the highest token tier that fits: semantic over primitive, primitive over a raw value.
- **Do** set reading text at `text-base` (16/24) and hold the column to 65 to 75 characters.
- **Do** let headings take their weight from the role: `text-xl` and up are 600 already; below that add `font-semibold`.
- **Do** space by relationship: 12px inside a group, 24px between blocks, 40px between sections, and less space under a heading than above it.
- **Do** use `text-pretty` on paragraphs and `text-balance` on headings of three lines or fewer.
- **Do** keep product motion at or under 300ms, list transition properties explicitly, and honour `prefers-reduced-motion`.

### Don't:
- **Don't** set article or document body copy in `text-sm` or `text-xs`.
- **Don't** use arbitrary sizes (`text-[10px]`, `text-[15px]`, `leading-[21px]`); every size on screen comes from the scale.
- **Don't** make a heading the same size or weight as its body and lean on a rule line to mark it.
- **Don't** put `<strong>` at 500 in running copy; it is 550 (`font-strong`).
- **Don't** put white text on tangerine 500 or on a 500-step status colour.
- **Don't** use a tangerine or status hue as decoration, or as a large fill.
- **Don't** use `border-left` or `border-right` over 1px as a coloured accent stripe.
- **Don't** nest cards, or wrap content in a container it does not need.
- **Don't** hard-code hex, px radii or ad-hoc durations; reach for the scales.
