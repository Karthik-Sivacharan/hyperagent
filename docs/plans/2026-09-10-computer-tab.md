# The Computer tab in the signup handoff (plan, 2026-09-10)

Branch `feat/computer-tab`, to be cut from `feat/workspace-panel` (which already
carries `main` up to `8d7ce64`, the agent stream included). Worktree
`.claude/worktrees/computer-tab`, dev server on port 3005 (3000 serves the main
checkout, 3004 the workspace preview). Nothing here is built yet.

## What it should do

When send brings the app shell in around the conversation (beat 1 of "The
agent streams" in HANDOFF.md), two things change and nothing else does:

1. The left sidebar arrives at its 64px rail instead of open at 256. It is a
   starting state, not a lock: the person can open it, and the shell's own
   yield rules still apply on top.
2. The right panel arrives wide enough for the computer and open on a new
   **Computer** tab, the first and default one, showing the artifact workspace
   (`src/components/workspace/`, see HANDOFF "The artifact workspace").
   Configuration and Usage stay as the second and third tabs.

## Why the numbers work

The computer needs **684px**: the carousel's 48px lead-in, the 600px document
card, and the 36px trailing pad (`workspace.tsx`, `pl-12` / `w-150` / `pr-9`).
The live site's desktop is exactly that wide at 1456.

With the rail, the conversation gets `viewport − 64 − 2×20 (gutters) − 684`:

| Viewport | Conversation | Floor 512 |
|---|---|---|
| 1920 | 1132 (the chat caps itself at 752) | yes |
| 1512 | 724 | yes |
| 1456 | 668 (today: 712 with the open sidebar and the 448 panel) | yes |
| 1300 | 512 | exactly |
| 1280 | 492 | no: the panel's ceiling drops to 664 and it shrinks |

The shell-fit arithmetic already handles every row of that table without a
change. `use-shell-fit.ts` computes `available = viewport − sidebarWidth − 40`
from the sidebar's LIVE width (`:123`), docks when `available ≥ 512 + 440`
(`:139`, 1056px and up with the rail) and hands the panel a ceiling of
`available − 512` (`:154`), which reaches 684 at 1300. Below that the panel
takes the ceiling, and below 1056 it floats, closed on arrival, as today.

If the person opens the sidebar (256) at 1456, the ceiling is 648, so the
card must be able to shrink or 36px of it are cut off. See change 4.

## Where things are today (checked against the branch)

- `src/components/app/sidebar.tsx:330` `userCollapsed` starts `useState(false)`;
  `:331` `collapsed = userCollapsed || forceCollapsed`; `:336`
  `railLocked = forceCollapsed`, so `forceCollapsed` LOCKS the rail (its
  expand toggle is `aria-disabled`, `:500`). Do not use it for this.
- `src/components/signup/app-handoff.tsx:184-188` mounts `<Sidebar
  forceCollapsed={railSidebar} collapseRidesSlide … />`; `:303-314` is the
  panel's layer (`translate-x-full` → `translate-x-0`) and mounts `<AgentPanel
  maxWidth={panelMax} onWidthChange={onPanelWidthChange} />`.
- `src/components/signup/signup-screen.tsx:200` calls `useShellFit`;
  `:214-217` closes the panel whenever it stops being docked; `:486-487` pad
  `<main>` by the live sidebar and panel widths.
- `src/components/agent-panel/agent-panel.tsx`: `:86` `AGENT_PANEL_WIDTH = 448`,
  `:108` `AGENT_PANEL_MIN_WIDTH = 440` (use-shell-fit reads it to decide
  docking: leave it alone), `:109` `PANEL_MAX_WIDTH = 720`, `:240` the
  `maxWidth` prop, `:275` `preferred` starts at 448, `:281` reports the width
  up; `:460` `aria-label="Agent configuration"`; `:476`
  `<Tabs defaultValue="configuration">` (uncontrolled); `:489-490` the two
  triggers; `:503` Save; `:521` the Configuration panel (inside a
  `ScrollArea`); `:564` Usage (a plain `min-h-0 flex-1` box); `:581` the
  splitter's label; `:588` double-click resets to 448.
- `AgentPanel` is imported by `app-handoff.tsx` and `/design/agent-panel`;
  every change to it must be opt-in so the design page renders as it does.

## Changes

- [ ] **1. `Sidebar` gains `defaultCollapsed`** (opt-in, default false): the
  seed of `useState` at `:330`, nothing else. The reader's toggle works as
  before; `forceCollapsed` still layers on top. `app-handoff.tsx` passes it.
  The rail's `onWidthChange` reports 64, so use-shell-fit sees the room at
  once; `onExpandedWidthChange` still reports 256, so `railSidebar` is
  unchanged.
- [ ] **2. `AgentPanel` gains an opt-in `computer?: ReactNode`.** Absent,
  nothing changes. Present:
  - the tabs become controlled, "Computer · Configuration · Usage", default
    Computer;
  - the Computer panel is `relative min-h-0 flex-1` holding the node, NOT in a
    `ScrollArea` (the workspace fills its box; a scroller has no height to
    give it);
  - every `TabsContent` takes `forceMount` plus `data-[state=inactive]:hidden`,
    because Radix unmounts inactive tabs and the carousel's scroll and the
    Skills list's local state would reset on every switch;
  - `preferred` starts at a new exported `COMPUTER_PANEL_WIDTH = 684` with the
    derivation written beside it, and the double-click reset returns to it;
  - Save shows only on Configuration (it saves configuration);
  - the aside's label becomes "Agent" and the splitter's "Resize agent panel".
- [ ] **3. `app-handoff.tsx`** passes `defaultCollapsed` to the sidebar and
  `computer={<Workspace artifacts={…} activeId={…} />}` to the panel.
- [ ] **4. The document card may shrink.** `artifact-card.tsx` `w-150` becomes
  `min(600px, the carousel's content box)`, which is exactly 600 at 684 and
  keeps the whole card on screen below it. Check `/design/workspace` after:
  its desktop is 678 wide, so its card may move by a few px, and that is the
  only pixel change allowed there.
- [ ] **5. Signup content for the computer.** `WORKSPACE_ARTIFACTS` is a
  document about this repo and a drawn signup capture: the wrong story for
  the Trainwell record. See the decision below; the component takes
  `artifacts` as a prop, so it is a data change in `src/lib/mock/`.
- [ ] **6. Docs:** a HANDOFF section, the components.md §4 note, these boxes.

## Decisions (defaults in bold; ask the user before changing one)

- **Content.** What is on the computer when it arrives? **First pass: the
  existing mock set, to judge the layout; then a signup set** (for example the
  plan the picked agent is drafting) that obeys the stream's honesty rule:
  nothing connected at signup, so nothing that claims to read private data.
  An empty desktop is also honest but needs an empty state that does not
  exist yet.
- **Width per tab.** **One width (684) for all three tabs.** Per-tab widths
  would change the panel's width on a tab switch, which snaps while `<main>`'s
  padding eases over 480ms: the ghost HANDOFF describes under "Decided
  2026-09-10", back again. If per-tab widths are wanted, the panel's width has
  to ride the same `--duration-slide` on `--ease-in-out` as the padding.
- **Header.** **Keep the agent's name, blurb and the tab row above the
  computer.** At 868 tall that leaves ~740px, and the card needs 668.
- **Dark theme.** **The wallpaper stays light in dark**: it is a picture, and
  the glass on it already flips.

## Traps

- `transition-[…]` lists must never name `transform` (the components test
  enforces it); `translate`, `scale`, `rotate` are the properties v4 moves.
- The panel slides in on `translate` now carrying backdrop blurs, three
  blurred colour fields and a blended grain. Record the slide at 1456 in
  Chrome and Safari and look for dropped frames before calling it done.
- `probe:signup`'s "nothing escapes inside the agent panel" criterion will
  meet the carousel, whose second card sits off to the right inside an
  `overflow-x-auto` scroller by design. If the probe flags it, teach the probe
  that a scroller clips its children; do not hide the card.
- Criterion 6 (the chrome takes clicks) skips scrolled-out and disabled
  controls, so the off-screen card and the dock's disabled scroll buttons are
  fine; the card's hover actions are `opacity-0` but live, and must still be
  topmost at their centres.
- The glass controls blur the wallpaper, which lives inside the workspace. An
  `opacity`, `filter` or `mask` on a box that wraps a glass control but not the
  wallpaper (fading the toolbar row, say) starts a new backdrop root there and
  the control loses its blur. Fade the whole workspace or nothing; the panel's
  `translate` is fine.

## Gates

The six (`npx tsc --noEmit`, `npm run lint`, `npm run build`,
`npm run brand:check-contrast`, `npm run brand:lint-tokens`, `npm test`);
`npm run probe:signup` in dark and light, and with `--sidebar-collapsed` and
`--panel-closed`; screenshots of the handoff and the streaming turn at
1456×868 and 1512×902 in both themes, reviewed; the 17 cloned routes
byte-identical to `main` (`scripts/dev/screenshot-pages.mjs` + pixelmatch);
`/design/agent-panel` identical without the prop.
