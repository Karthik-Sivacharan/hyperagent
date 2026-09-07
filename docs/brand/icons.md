# Icons: Tabler only

Every icon in this repo is a component from `@tabler/icons-react`. This page
is the convention: how to import one, what its props are and where they differ
from lucide's, the accessibility rules, the iconography rules that apply, the
shadcn caveat, and how to get from a reference dump to the Tabler name. Read
it before adding an icon.

## The rule

One icon library, Tabler, and nothing else: no `lucide-react`, no radix icons,
no heroicons, no glyph pasted in from another set. Two libraries in one view
never quite match; the stroke weights, corner radii and optical sizes differ
just enough that the mix reads as a mistake. `lucide-react` is not installed,
and `src/components/icons.test.ts` (part of `npm test`) fails if any file
under `src/` imports it or names an icon Tabler does not export.

Artwork that is not an icon is outside the rule: logos, the brand marks, the
agent orbs and the settings tiles (`src/components/app/brand-icons.tsx`,
`src/components/settings/settings-icons.tsx`) are inline SVGs copied from the
site and stay as they are.

## Import and type

Import named exports from the package root. Every export is `Icon` followed
by the PascalCase name; the component type is `TablerIcon` (the props type,
for a wrapper, is `IconProps`).

```tsx
import { IconArrowLeft, IconSearch, type TablerIcon } from "@tabler/icons-react";

const ACTIONS: { icon: TablerIcon; label: string }[] = [
  { icon: IconSearch, label: "Search" },
];
```

Next 16 lists `@tabler/icons-react` in its default `optimizePackageImports`,
so the barrel import above is rewritten to per-icon files at build time. No
config is needed and no deep import path should be written.

## Props

| Prop | Default | Notes |
|---|---|---|
| `size` | `24` | Width and height, number or string. A Tailwind `size-4` on `className` also works and is what most call sites do, because the dump's classes carry the size. |
| `color` | `currentColor` | Leave it; colour comes from `text-*` on the icon or its parent. |
| `stroke` | `2` | A number, in grid units. lucide called this `strokeWidth`. |
| `title` | none | Renders an SVG `<title>`. Rarely wanted; see accessibility. |
| `className` | none | Merged after the `tabler-icon tabler-icon-<name>` classes Tabler sets. |

Anything else (`aria-hidden`, `aria-label`, `role`, `onClick`, `ref`) is
spread onto the `<svg>`.

What is different from lucide:

- `strokeWidth` is `stroke`. There is no `absoluteStrokeWidth`.
- `LucideIcon` is `TablerIcon`.
- lucide added `aria-hidden="true"` on its own whenever an icon carried no
  `aria-*`, `role` or `title` prop. Tabler does not. Decorative icons must
  say `aria-hidden="true"` themselves (next section).
- The class on the element is `tabler-icon tabler-icon-<name>`; lucide wrote
  `lucide lucide-<name>`. Nothing in the styles targets either.
- Tabler ships filled variants as separate exports (`IconStarFilled`,
  `IconHeartFilled`). Use one only where a filled state exists semantically
  (a starred item, a chosen favourite), never as decoration.

What is the same: a 24-unit grid, a 2-unit stroke with round caps and joins,
and the same optical size, so nothing moved when the library changed. Sizes
keep coming from the dump (`size-4`, `size-5`, `size-6`).

## Accessibility

- A decorative icon (one next to a label, or inside a control that already
  has text) carries `aria-hidden="true"`. Always, because Tabler will not add
  it for you.
- An icon-only control (a button, link or menu trigger whose only content is
  an icon) carries an `aria-label`. It goes on the control, not on the icon,
  and the icon inside stays `aria-hidden`.
- The label names the action, not the element: `aria-label="Hide sidebar"`,
  not `"Panel left close icon"`. In the code: `"Close"`, `"New agent"`,
  `"Open sidebar"`, `"Copy user ID"`.
- A control that toggles keeps the label for what it does next
  (`collapsed ? "Pin sidebar" : "Hide sidebar"`) and, where it applies,
  `aria-expanded` or `aria-pressed`.
- Do not use `title` for the accessible name of a control; screen readers
  handle it unevenly and it shows a native tooltip.

```tsx
<Button size="icon-xs" aria-label="Close">
  <IconX aria-hidden="true" />
</Button>

<Button variant="ghost">
  <IconPlus aria-hidden="true" />
  New thread
</Button>
```

## Iconography rules

The iconography rules from the design-engineering principles this repo
follows (Emil Kowalski's design rules, Iconography), applied to Tabler:

- One library. Weight and radius differences between sets compound across a
  view even when the glyphs look alike.
- Distinct glyphs for distinct meanings. A star means rating; a favourite is
  a heart or a bookmark. Do not give one icon two jobs in the same product.
- Chevron versus arrow. A chevron expands, collapses or reveals in place
  (accordions, menus, "show more"); an arrow navigates or moves
  (`IconArrowUpRight` for "opens elsewhere", `IconArrowRight` for "go").
  Never a chevron for both.
- Pairs that differ only by rotation (upload and download) need a second
  signal, a label or a fixed position, so they can be told apart at a glance.
- Stroke matched to size. The stroke is in grid units, so it scales with
  `size` on its own: 2 units is 2px at 24 and 1.33px at 16, which is the
  thinning the rule asks for. Set `stroke` only for a deliberate change, as
  the marketplace category art does (`stroke={1.5}` at `size-7`, a decorative
  glyph kept light next to text). Do not push a 24-grid glyph past `size-8`;
  the stroke goes heavy and the detail coarse.
- Filled at very small sizes. At 12px an outline stroke falls apart; use the
  `Filled` variant there, or make the icon bigger.
- Optical weight matched to the text beside it. A thin stroke next to a
  600-weight heading reads as a mistake; the default stroke sits well with
  the app's 400 and 500 labels.
- 6 to 8px between an icon and its label (`gap-1.5` or `gap-2`), never
  touching. Keep icons on whole pixels: `size-4` inside `h-8`, no fractional
  offsets.
- An icon alone is not a label. Save, export, share and the like get text, or
  at least a tooltip and an `aria-label`.

## The shadcn caveat

shadcn's CLI supports four icon libraries (`lucide`, `radix`, `hugeicons`,
`phosphor`) and Tabler is not one of them, so `components.json` keeps
`"iconLibrary": "lucide"`. The consequence: anything
`npx shadcn@latest add <name>` emits imports from `lucide-react`, which is
not installed. Convert those imports to Tabler before committing, with the
naming rule and the table below. `npm test` fails on any `lucide-react`
import under `src/`, so a forgotten one cannot merge.

## From a dump to a Tabler name

The DOM dumps in `docs/reference/pages/` are still the ground truth for which
icon a page uses. They show the site's own classes, so an icon appears there
as `lucide-<name>`. Read the kebab-case name, look it up in the table below,
and if it is absent, take `Icon` plus the PascalCase form:

- `lucide-chevron-right` is not in the table: `IconChevronRight`.
- `lucide-square-pen` is in the table: `IconEdit`.
- `lucide-bot` is in the table: `IconRobotFace`.

For a lucide component name (shadcn output, an old branch) the same rule
applies from PascalCase: `Plus` becomes `IconPlus`; a trailing `Icon` suffix
is dropped first (`CheckIcon` becomes `IconCheck`); the table covers the names
that do not line up.

When no Tabler glyph is a close match, prefer the closest meaning over the
closest shape, stay consistent with any existing use of the same lucide name
in the code, and check tabler.io/icons for the candidates.

## Name table

The lucide names in this repo whose Tabler name is not just the `Icon`
prefix. The table is the map as the code stands after the hand review that
followed the codemod; if a later commit picks a different glyph, update the
row. Seven of the names (`ChartColumn`, `Globe`, `Grid3x3`, `Menu`, `Network`,
`Settings2`, `Volume2`) exist in Tabler under the prefixed name but draw a
different picture (a barcode, a desk globe, a bare hash, two bars, a wired
globe, a hex nut, one sound wave), so a matching name is not proof of a
matching glyph: check the shape on tabler.io before trusting the prefix rule.

| lucide | Tabler |
|---|---|
| `ArrowRightLeft` | `IconArrowsRightLeft` |
| `ArrowUpDown` | `IconArrowsUpDown` |
| `BadgeDollarSign` | `IconCoin` |
| `BookOpen` | `IconBook` |
| `BookX` | `IconBookOff` |
| `Bot` | `IconRobotFace` |
| `ChartColumn` | `IconChartBar` |
| `CheckCheck` | `IconChecks` |
| `CircleQuestionMark` | `IconHelpCircle` |
| `Ellipsis` | `IconDots` |
| `Globe` | `IconWorld` |
| `GraduationCap` | `IconSchool` |
| `Grid3x3` | `IconLayoutGrid` |
| `Image` | `IconPhoto` |
| `Info` | `IconInfoCircle` |
| `KeyRound` | `IconKey` |
| `LifeBuoy` | `IconLifebuoy` |
| `Lightbulb` | `IconBulb` |
| `ListFilter` | `IconFilter2` |
| `ListTodo` | `IconListCheck` |
| `LogOut` | `IconLogout` |
| `Maximize2` | `IconArrowsDiagonal` |
| `Megaphone` | `IconSpeakerphone` |
| `Menu` | `IconMenu2` |
| `MessageCircleQuestionMark` | `IconMessageCircleQuestion` |
| `MessageSquare` | `IconMessage` |
| `MessageSquareText` | `IconMessage2` |
| `MessagesSquare` | `IconMessages` |
| `Mic` | `IconMicrophone` |
| `Monitor` | `IconDeviceDesktop` |
| `Network` | `IconSitemap` |
| `PanelLeftClose` | `IconLayoutSidebarLeftCollapse` |
| `PanelLeftOpen` | `IconLayoutSidebarLeftExpand` |
| `PanelRight` | `IconLayoutSidebarRight` |
| `PenLine` | `IconBallpen` |
| `PenTool` | `IconBrush` |
| `RefreshCw` | `IconRefresh` |
| `Settings2` | `IconAdjustmentsHorizontal` |
| `Shapes` | `IconTriangleSquareCircle` |
| `SquareKanban` | `IconLayoutKanban` |
| `SquarePen` | `IconEdit` |
| `Store` | `IconBuildingStore` |
| `ThumbsDown` | `IconThumbDown` |
| `ThumbsUp` | `IconThumbUp` |
| `Volume2` | `IconVolume` |
| `WandSparkles` | `IconWand` |
| `Workflow` | `IconSchema` |
| `Zap` | `IconBolt` |
