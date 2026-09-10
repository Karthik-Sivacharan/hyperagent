# The signup shell, made responsive (2026-09-10)

Branch `fix/responsive-shell`, worktree `.claude/worktrees/responsive-shell`.
Read `HANDOFF.md` §"The signup flow" first — three things on that page are
load-bearing and this plan touches all three.

## What is wrong, measured

Driven to the handoff state (`/signup` → Google → Hyperpersonalize → pick a
card → send) at 902px tall, dark, and then resized. `stageW` is the
conversation column; `docH > vh` means the page scrolls.

| viewport | stage | card cols | h1 lines | composer h | scrolls |
|---:|---:|---|---:|---:|---|
| 1920 | 752 | 368 + 368 | 2 | 66 | no |
| 1512 | 696 | 340 + 340 | 2 | 66 | no |
| 1440 | 624 | 304 + 304 | 2 | 85 | no |
| 1280 | 464 | 224 + 224 | 2 | 85 | no |
| 1180 | 364 | 174 + 174 | 3 | 106 | no |
| 1024 | 208 | 96 + 96 | 5 | 190 | **yes** |
| 900 | 84 | 34 + 34 | 9 | 222 | **yes** |
| 834 | 18 | 1 + 1 | 12 | — | **yes** |
| 768 | **0** | 0 + 0 | 12 | — | **yes** |

Four separate faults produce that table.

1. **The two chrome columns are fixed and the conversation is the remainder.**
   `<main>` in `signup-screen.tsx` pads `md:pl-64` (a hard 256px) and
   `md:pr-(--handoff-panel-w)` (the panel's live width, 560 at rest). 256 + 560
   is 816px of chrome that never yields, so at 768 the conversation is 0px
   wide. The conversation is the subject of this screen; it is the one thing
   that should not be the remainder.

2. **The sidebar's width never reaches the column.** `sidebar.tsx` owns
   `collapsed` (a 64px rail) and a 250–500 drag, and reports neither. Collapse
   the sidebar after the handoff and the column does not move — the rail leaves
   192px of dead gutter. `agent-panel.tsx` already solves exactly this for the
   right side, reporting its width upward through `onWidthChange`; the sidebar
   is the same fact and does not report it.

3. **The column sizes itself off the VIEWPORT.** The card grid is
   `grid-cols-1 sm:grid-cols-2` — `sm` is a viewport media query, so the cards
   stay two-up at any viewport ≥640 even when the column they sit in is 96px.
   Every breakpoint inside a column whose width is "viewport minus two chrome
   columns" is measuring the wrong box.

4. **The handoff padding replaces the gutter instead of adding to it.**
   `px-5` gives the stage 20px of air; `md:pl-64` and `md:pr-…` override
   `pl-5` / `pr-5` outright, so after the handoff the conversation is flush
   against the sidebar's hairline on one side and the panel's on the other.
   Visible at 1180, where the right-hand cards touch the panel edge.

And one thing that is simply not wired:

5. **The panel toggle in the thread bar does nothing.** `thread-header.tsx`
   renders `IconLayoutSidebarRight` as a `Button` with `aria-label="Open panel"`
   and no `onClick`, no `aria-expanded`, no state. The panel is drag-resizable
   and that works; it cannot be closed.

## The shape of the fix

**The conversation has a floor, and the chrome yields first.** Everything below
follows from that one sentence. The chrome yields in three steps, cheapest
first — the panel gives up its own width, then the panel stops being a column,
then the sidebar rails — and the conversation gives up nothing at any of them.

### Measured numbers

Column width against what the column can hold, taken by forcing `max-width` on
the stage and reading the DOM back:

| column | cards | h1 lines | card content |
|---:|---|---:|---|
| 752 → 496 | two-up | 2 | intact |
| 480 → 448 | two-up | 2 | **overflows the card's 132px** |
| 416 → 384 | two-up | 3 | **overflows** |

**Corrected 2026-09-10 by W2, after the fact.** The numbers above are right and
the reading of them was wrong on two counts, and the cause has since been
fixed:

- **The overflow is HORIZONTAL, not vertical.** The card is 132px tall at every
  column width from 752 down to 320; nothing was ever spilling out of its
  height. `truncate` implies `white-space: nowrap`, and the min-content width of
  a nowrap box is the whole string — 208.6px for the longest title, plus 32px of
  padding, which became a 241px floor on the card's own width. Below that the
  grid track could not shrink and the card pushed out sideways.
- **The threshold is 241, not 240**, so 496 of column really is where two-up
  starts to break rather than being just under it. `COLUMN_FLOOR = 512` was
  still the right choice; the sentence justifying it was off by one width step.
- W2 fixed the floor itself with `min-w-0` on the card's content layer, so a
  card now ellipsises instead of refusing to shrink. Below 512 the cards go
  one-up anyway; the fix is what makes the one-up case honest.

So:

- `COLUMN_FLOOR = 512` — Tailwind's `@lg` container breakpoint, one step above
  the 496 where two-up starts to break, and the width at which the card grid
  should drop to one column anyway. One number does both jobs.
- `PANEL_MIN = 440` — already in `agent-panel.tsx`, unchanged.
- `PANEL_REST = 560`, `PANEL_MAX = 720` — unchanged.
- `GUTTER = 20` — `px-5`, restored on both sides.

### Docked, floating, or railed: decided by a live fit test

Not a media query. The sidebar is collapsible and drag-resizable, so the test
has to run against its live width or collapsing the rail buys the panel
nothing:

```
available   = viewport − sidebarWidth − 2 × GUTTER
docked      = available ≥ COLUMN_FLOOR + PANEL_MIN
panelMax    = available − COLUMN_FLOOR          // docked only
panelW      = clamp(PANEL_MIN, preferred, panelMax)
column      = available − panelW                // ≥ COLUMN_FLOOR by construction

railSidebar = viewport − expandedSidebarWidth − 2 × GUTTER < COLUMN_FLOOR
```

- **Docked** — the panel is a column, as today, and gives up its own width
  down to 440 before the conversation gives up any. At 1280 with a 256
  sidebar: 984 available, panel 472, conversation 512.
- **Floating** — below that the panel stops being a column: it is closed on
  arrival, and opening it puts it over the conversation at the right edge on
  `shadow-lg`, non-modal, closed by Escape. The conversation keeps the whole
  `available` width and never narrows. Collapsing the sidebar to its 64px rail
  moves the threshold down by 192px, which is the rail finally meaning
  something.
- **Railed** — and below THAT, the sidebar itself yields. **Added 2026-09-10,
  after W3's harness swept past W1's floor and found the hole the first two
  steps leave: 768 to 807.** There the panel has already floated and the 256px
  sidebar still will not move, so 768 − 256 − 40 leaves a 472px column, under
  the floor; the cards correctly drop to one-up, the column grows about 296px
  taller and the page scrolls **183px under a real wheel** with all three
  scrollers reading 0 at rest — exactly the trap this plan opens with. That
  band is iPad portrait. Railing the sidebar there buys 192px, which puts the
  column at 664 and the cards back to two-up. 808 is where it stops being
  needed, because 512 + 256 + 40 fits.

`railSidebar` is asked of the sidebar's EXPANDED width and never of its live
one. The obvious version feeds itself: railing changes the live width, which
un-makes the decision, which un-rails. The expanded width does not move when
the rail is forced, so the answer is stable. It reaches `Sidebar` as
`forceCollapsed`, a constraint rather than a value — the same shape and the
same argument as `AgentPanel.maxWidth` — so `collapsed = userCollapsed ||
forceCollapsed` and the reader's own choice goes on living underneath: widen
past 808 and the column comes back open if that is how it was left, or stays
railed if that is how it was left.

The two decisions cannot fight, and the arithmetic says so rather than the
hope. Railing holds only while `viewport < COLUMN_FLOOR + 2 × GUTTER +
expanded`, which across the sidebar's own 250–500 drag range tops out below
1052; docking after a rail needs `viewport − 64 − 40 ≥ 952`, which is 1056 and
up. The bands do not touch, so no width exists where railing the sidebar
re-docks the panel and re-opens the question. Measured at 768: sidebar 64,
column 664, panel still floating.

The transition between docked and floating is the only place the panel changes
itself: entering floating mode closes it. It does not silently re-open on the
way back out — a panel that reappears because you widened a window is a panel
you did not ask for.

### The column measures itself

`@container` on the chat step, and every breakpoint inside it becomes a
container query. The card grid is `grid-cols-1 @lg:grid-cols-2`, so two-up at
≥512 of column and one-up below, whatever the viewport is doing. This is
already the repo's idiom — `composer.tsx`, `memories-page.tsx`,
`threads-page.tsx` and `settings/integrations-page.tsx` all query their own
box — and it is what makes the column correct inside the docked case, the
floating case, the phone case and any panel width a drag can produce, with no
number to keep in sync.

### The toggle

`ThreadHeader` takes optional `panelOpen` / `onTogglePanel` / `panelId`.
Omitted, it renders exactly what it renders today — `/thread/[id]` is a cloned
route and must stay pixel-identical. Wired, the button carries
`aria-expanded`, `aria-controls`, a label that flips, and the tint fill it
already has as the open state. One glyph in both states, which is the
precedent `sidebar.tsx` already sets for its own collapse control (same icon,
"Pin sidebar" / "Hide sidebar").

## Workstreams

Three, on disjoint files, in this one worktree.

### W1 — shell geometry and the toggle

Files: `src/components/signup/signup-screen.tsx`,
`src/components/signup/app-handoff.tsx`,
`src/components/app/sidebar.tsx`,
`src/components/thread/thread-header.tsx`,
`src/components/agent-panel/agent-panel.tsx`,
plus a new `src/components/signup/use-shell-fit.ts`.

1. `Sidebar` takes an optional `onWidthChange?: (px: number) => void` and
   reports `collapsed ? RAIL_WIDTH : width` from an effect, the same shape and
   for the same reason as `AgentPanel.onWidthChange`. No DOM change, no
   default behaviour change; `AppShell` passes nothing. **Added with the rail
   step:** `onExpandedWidthChange?: (px: number) => void`, which reports the
   dragged width whether or not the rail is showing (that is the number the
   rail decision has to be made against), and `forceCollapsed?: boolean`, a
   constraint rather than a value — `collapsed = userCollapsed ||
   forceCollapsed`, so the reader's own choice survives underneath it. Both
   omitted on the cloned routes, both no-ops there.
2. `AgentPanel` takes an optional `maxWidth` and an `id`. `maxWidth` is a
   constraint, not a width — it clamps the drag and the resting width from
   above, and the panel still owns which width it wants inside it. Keep
   `PANEL_MIN`/`PANEL_MAX` as the outer bounds. Document why a constraint
   coming down is not the same as a width coming down.
3. `use-shell-fit.ts` holds the arithmetic above against `window.innerWidth`
   (a `resize` listener, plus the live sidebar width and the expanded one) and
   returns `{ docked, railSidebar, panelMax, columnFloor, available }`.
4. `SignupScreen` holds `sidebarWidth`, `panelWidth`, `panelOpen`, and pads
   `<main>` by `calc(sidebar + 20px)` on the left and, when docked and open,
   `calc(panel + 20px)` on the right — **added to** the gutter, not replacing
   it. Below `md` both are 0 and `px-5` stands alone.
5. `AppHandoff` gets `panelOpen` / `docked` and slides the panel out to the
   right when closed; in floating mode it also takes `shadow-lg` and a z-index
   above the column. Escape closes it. The thread bar's right inset follows the
   same figure as `<main>`'s padding.
6. Everything moves on `--duration-slide` + `--ease-in-out`, the pairing the
   handoff already uses, and everything bails on `prefers-reduced-motion`.

**Load-bearing, do not break:** the mark is absolutely positioned inside the
stage and parked by a transform measured against the stage's box. Move the
stage's ANCESTOR (padding on `<main>`), never the stage itself — a transform on
the stage composes with the mark's own and the two fight. The `ResizeObserver`
in `signup-screen.tsx` re-parks the mark when the stage's width changes, which
is what makes a panel collapse free.

### W2 — the column measures itself

Files: `src/components/signup/chat-step.tsx`,
`src/components/signup/agent-card.tsx`,
`src/components/signup/research-signals.tsx`.

1. `@container/chat` on the chat step's root.
2. The card grid becomes `grid-cols-1 @lg:grid-cols-2`.
3. Sweep the rest of the column for viewport breakpoints and for anything that
   assumes 752: the heading, the signal row, the receipt line, the tool rows.
   Anything that has to change with the column changes on a container query.
4. **The research pass may still not change height.** The container breakpoint
   sits at 512 and the column is ≥512 whenever the shell is on screen, so
   nothing in this workstream may fire during the pass at any docked width.
   Verify it: `grid-template-rows` on the stage identical at every step, at
   1512×902 and 1456×868.

### W3 — the verification harness

New file: `scripts/dev/probe-signup.mjs`, in the style of
`scripts/dev/screenshot-pages.mjs` (headless Chrome over the DevTools
protocol, no dependencies).

It drives `/signup` to the handoff state and then, for each width in a sweep,
reports the column width, the card grid's computed
`grid-template-columns`, the heading's line count, the composer's height, all
three scroll positions and whether a real wheel moves anything, and writes a
screenshot per width. `--sidebar-collapsed` runs the same sweep with the rail
collapsed; `--panel-closed` with the panel shut.

**The measurement trap, from HANDOFF.md:** `globals.css` sets
`overflow-x: hidden` on `html` and `body`, which forces their used
`overflow-y` to `auto`. A body scroll can exist while `documentElement`
reports none. Check `window.scrollY`, `document.documentElement.scrollTop` AND
`document.body.scrollTop`, and prefer dispatching a real wheel over reading
`scrollHeight`.

## What "done" looks like

At 1920, 1512, 1440, 1280, 1180, 1024, 900 and 768, in dark and light, in the
handoff state:

- the conversation column is never below 512 while the shell is docked;
- the card grid is two-up whenever the column is ≥512 and one-up below;
- no card's content overflows its box, and the heading never exceeds 3 lines;
- the page does not scroll at any of those widths at 902 and 868 tall — checked
  on all three scrollers and with a real wheel;
- collapsing the sidebar to the rail moves **`<main>`'s content box** left by
  192px — measured at every width, exactly 192 (padding-left 276 → 84). The
  RENDERED column moves that far only while it is narrower than `max-w-wide` in
  both states; where it hits the 752 cap it re-centres in a wider box and moves
  less. Measured: 1280 −192 (512 → 616 wide), 1440 −180, 1512 −144, 1920 −96.
  At 1180 the rail buys a dock instead, and the column goes 752 → 516 and moves
  −258. The original line said "the column" and was only ever true of the
  content box;
- the toggle closes the panel, the column widens toward 752, the mark stays
  parked on its seat, and the toggle opens it again;
- Escape closes a floating panel and does nothing to a docked one.

And the six gates: `npx tsc --noEmit`, `npm run lint`, `npm run build`,
`npm run brand:check-contrast`, `npm run brand:lint-tokens`, `npm test`.

Plus the pixel gate for the cloned routes: `/thread/[id]` and the other 16
routes are pixel-identical to `main` at 1456×868 in both themes. `ThreadHeader`
and `Sidebar` are shared with those routes and both changes are opt-in props.
