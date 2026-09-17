# The room tracker: a board per room, and the bar that summarises it

Written 2026-09-17 on `feat/room-tracker`, off `feat/rooms` at 205eac8. Two
branches are in flight beside this one and neither is merged yet, so this file
is as much a contract as a plan: §6 is the seam each of them meets.

## 1. What this is

A room is where a team and its agents talk. This adds the other half: the work
they are talking about, as a board the room owns.

- Every room has a tracker. The room's header grows a third tab —
  **Messages · Tracker · Canvas** — and the tracker is a board and a list of
  the same tasks, toggled the way `/teams` toggles its views.
- **One card per task, not per agent.** An agent doing three things has three
  cards, in whichever lanes those three things are in. That is the whole
  reason the board is per-task: a fleet readout that collapses an agent to one
  row cannot say "Media Lab Director is stuck on one render and fine on the
  other".
- The task's status is where an agent's state comes from. The strip above the
  composer (`feat/composer-agent-status`) is the same data, compressed: four
  of the tracker's five lanes are exactly the strip's four states.
- Clicking an agent in a message opens the tracker and pulses that agent's
  cards once. Clicking a card's source goes back to the message it came out
  of. The two tabs are one surface with two views of the same work.

## 2. Reuse, not a second board

`/teams` already ships a kanban board and a list with everything this needs:
lane folding, the arrow-key walk between cards, group folding, the sticky
headers, the search-empty behaviour, and the motion rules for all of it. Over
500 lines of shell.

So the shell moves to `src/components/tracker/`, generic over a status
vocabulary and an item type, and **both** pages render into it. `/teams` keeps
its own card and row (agent orbs, cost, owner); the room gets its own (glyph
faces, the source message). Nothing is copied.

This is a new folder beside `patterns/`, not a fifth tier: a pattern is a
composite of primitives used by two pages with the same intent, and that is
exactly what these are. They are listed in `docs/components.md` §2.

## 3. The lanes

Five, in reading order — what the person owes first, what is finished last:

| Lane | Meaning | Strip state |
|---|---|---|
| **Needs you** | the agent stopped and is asking | `input` |
| **Blocked** | the agent cannot proceed and cannot ask its way out | `stuck` |
| **Working** | running now | `running` |
| **Queued** | accepted, not started | — |
| **Done** | finished | `done` |

`Queued` is the one lane with no presence in the strip, which is correct: the
strip's own types say a bar on screen means an agent has work, and an agent
whose only task is queued has none yet.

`/teams` has `review` where this has `blocked`, and no lane in common is
renamed. A room is not a review queue — an agent that wants eyes on something
says so, which is *Needs you* — and a room absolutely is where a stuck agent
surfaces, because the person who can unstick it is reading the channel.

**The colour budget.** `/teams` spends one hue, tangerine on the Needs you
glyph. The room board spends two: tangerine on Needs you, `destructive` on
Blocked. That is not an escalation, it is the same budget the composer strip
already holds (`run-state.ts` gives `stuck` `text-destructive` and `input`
`text-warning`), and the board is that strip expanded. The rule underneath
both is unchanged — colour means a person is needed — and the lane doing most
of the living, Working, stays grey.

## 4. Where the files go

```
src/components/tracker/               the shell both pages render into
  status.tsx                          TrackerStatusMeta, tones, the glyph
  board/tracker-board.tsx             the scroller, the fold, the arrow keys
  board/tracker-column.tsx            one lane
  list/tracker-list.tsx               the scroller, the folds, ↑/↓
  list/tracker-group.tsx              one status group
src/components/rooms/tracker/
  tracker-context.tsx                 RoomTrackerProvider / useRoomTracker
  tracker-panel.tsx                   the tab body: toolbar over board or list
  tracker-toolbar.tsx                 search + the board/list switch
  task-card.tsx                       the board card
  task-row.tsx                        the list row
  task-status.ts                      TASK_STATUS_META
  agent-runs.ts                       the strip contract (§6.1)
src/lib/mock/room-tracker.ts          the tasks
```

`/teams` keeps `board-view.tsx`, `list-view.tsx`, `board/run-card.tsx` and
`list/run-row.tsx`; `board/board-column.tsx` and `list/run-group.tsx` are
absorbed by the shell and deleted.

## 5. The shell's API

Generic over `S extends string` (the status vocabulary) and `T` (the item).
Neither file imports a mock.

```tsx
// src/components/tracker/status.tsx
export type TrackerTone = "brand" | "neutral" | "danger";
export type TrackerStatusMeta = { label: string; icon: TablerIcon; tone: TrackerTone };
export const TRACKER_TONE_CLASSES: Record<TrackerTone, string>;
export function TrackerStatusIcon({ meta, className }: { meta: TrackerStatusMeta; className?: string }): ReactNode;
```

```tsx
// src/components/tracker/board/tracker-board.tsx
export function TrackerBoard<S extends string, T>(props: {
  statuses: readonly S[];                  // reading order, left to right
  meta: Record<S, TrackerStatusMeta>;
  itemsByStatus: Record<S, T[]>;           // every status present, possibly empty
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;      // must carry data-tracker-card on its focusable element
  emptyCopy: Record<S, string>;            // the line an empty lane shows outside a search
  searching: boolean;                      // an empty lane then means "no match"
  /** The one lane that folds, folded at rest. Defaults to the last status. */
  foldable?: S | null;
  /** Lane widths. `compact` is for a column narrower than a page. */
  density?: "default" | "compact";
  /** Shown instead of the lanes when a search keeps nothing at all. */
  searchEmpty?: ReactNode;
  ariaLabel: string;
}): ReactNode;
```

```tsx
// src/components/tracker/list/tracker-list.tsx
export function TrackerList<S extends string, T>(props: {
  statuses: readonly S[];
  meta: Record<S, TrackerStatusMeta>;
  itemsByStatus: Record<S, T[]>;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;      // must carry data-list-nav on its focusable element
  searching: boolean;
  /** Statuses folded at rest. Defaults to the last status. */
  defaultFolded?: readonly S[];
  /** Shown below the groups when there is nothing at all. */
  empty?: ReactNode;
  searchEmpty?: ReactNode;
}): ReactNode;
```

Behaviour that moves with the shell, unchanged from `/teams`: the board's
sticky lane headers, the fold that scrolls the board to its end when the lane
would overflow, the arrow-key walk (up/down inside a lane, left/right to the
nearest card at the same height in the next lane that has one), the list's
sticky group headers, the fold-during-search rules (a group that holds a match
opens; folds made during a search are forgotten when it clears), and ↑/↓
walking rows and headers. Every motion value stays as it is.

`density: "compact"` is the one addition: lanes `min-w-52` open, `min-w-48`
while the folding lane is open, `max-w-72`. A room column is narrower than a
page, and the board scrolls sideways below that — which is what a kanban board
does, and is why the folding lane is folded at rest.

## 6. The seams with the other two branches

### 6.1 `feat/composer-agent-status` — the strip above the composer

`src/components/rooms/tracker/agent-runs.ts` produces exactly that branch's
`AgentRun[]`, one entry per live task, ordered the way its `STATE_PRIORITY`
orders them:

| Lane | `AgentRun.state` |
|---|---|
| needs-you | `input` |
| blocked | `stuck` |
| working | `running` |
| queued | *(dropped: no bar presence)* |
| done | `done` |

`AgentRun.task` is the task title, `detail` its caption, `progress` its steps
as a fraction, `glyph` the member's glyph shape, `name` the member's name.
Human assignees are dropped: it is an agent bar.

The type is redeclared locally, with a comment naming the file it mirrors.
**On merge:** delete `RoomAgentRun`, import `AgentRun` from
`@/components/composer/agent-status/types`, and the mapping table is the only
thing that has to survive. The two are structurally identical today; if that
branch changes its shape, this file is the one place that has to move.

### 6.2 `feat/rooms` — the room itself

Three additive touches, kept deliberately small because that branch is moving:

1. `RoomTab` gains `"tracker"`, and `RoomHeader` a third `TabsTrigger`.
2. `RoomMessageRow` gains one optional prop, `onFocusAgent?: (id: string) => void`.
   When it is given and the author is an agent, the face and the name become
   one ghost control; otherwise the row is exactly what it is today.
3. `RoomMessageList` gains one optional prop, `highlightedMessageId?: string`,
   for the return trip from a card.

`RoomView` grows the provider and the third branch. Nothing else in
`src/components/rooms/` is edited.

## 7. The pulse

Clicking an agent in a message switches to the tracker and pulses that agent's
cards **once**. The state is a pair — the agent id and a token that increments
on every click — so clicking the same agent twice pulses twice.

- A sheen sweeps the card left to right once, 700ms on `ease-out-quart`, over
  a 2px `ring-tint-20` that fades in with it and out after. No hue: this is a
  pointer, not a status, and the lanes already own the two hues the board
  spends. The card does not move or grow, the same rule the board card has
  always had.
- **Reduced motion** drops the sweep and keeps the ring, faded in over 200ms
  and out over 900ms, so the answer still arrives without anything travelling.
- The first pulsed card is scrolled into view (`block: "nearest"`), because an
  answer below the fold is not an answer.
- A polite live region says it in words: "3 tasks for Media Lab Director" —
  the pulse is a pointer, and a pointer nobody can see is nothing.

## 8. Verification

`npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run build` clean, and
`/teams` unchanged at 1456×868 against the branch point: the extraction has to
be invisible there or it is not an extraction.
