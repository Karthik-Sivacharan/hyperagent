# Rooms, the agent bar and the tracker: handoff

Written 2026-09-17 at the end of the day's work. Everything below is on
`feat/rooms` and pushed. **It is not on `main`** — see §7.

If you are picking this up: read §1 to know where the code is, §3 to know what
the feature does, and §5 before you change anything, because most of §5 is a
decision that was made, reversed, and made again.

## 1. Where it is

| | |
|---|---|
| Branch | `feat/rooms`, pushed to origin |
| Worktree | `.claude/worktrees/agent-status`, dev server on **3013** |
| Main checkout | `/Users/karthiksivacharan/Projects/hyperagent`, dev server on 3007, **another session is working there** |
| `main` | 5 commits behind `feat/rooms` |
| Also pushed | `feat/room-threads` — merged into `feat/rooms`, keep or delete, it holds nothing unique |

The worktree is the one to work in. The main checkout has a second session
building `src/components/trace/` (a `/design/trace` reasoning-trace lab route,
plan at `docs/plans/2026-09-17-reasoning-trace-v1.md`, untracked). Its files
are half-written, so `tsc` fails there for reasons that are not yours.

## 2. Routes

- `/rooms` — the directory
- `/rooms/room-capability-checks` — **the demo**. The only room with a
  conversation; the other three have `days: []` on purpose.
- `/design/agent-status` — every state of the composer's agent bar, including
  the always-open stacked specimen and the three-running-of-four row.
- `/design/brand`, `/design/glyphs` — the tokens and the figures it is made of.

## 3. What the feature does

A room is a channel where a team and its agents talk. Above its composer is an
**agent bar**; beside it is the **thread rail**; behind a tab is the
**tracker**, a board of the room's tasks. The day's work was making those three
one feature rather than three screens.

1. Typing `@` in the composer opens the room's roster (agents first). Sending
   starts a run for every agent named.
2. The bar holds **two lifetimes of the same thing**: the board's standing work
   (one chip per live task, there when you arrive) and a mention's run (started
   just now, no card yet). Concatenated, board first, de-duplicated on id.
3. The left of the bar counts what is out — "3 agents working" — shimmering on
   the product's running-label device while anything runs, past-tense when the
   last one lands.
4. Clicking a chip opens that **agent's** detail: one line per task it holds.
   An agent with one run also jumps; an agent with several does not (§5.4).
5. Each line ends in a neutral arrow to that task's **conversation**, and a
   `running` line also carries Stop.
6. The jump opens the task's thread in the rail, scrolls the middle column to
   the source message and pulses it, and washes the rail once.
7. A `working` task puts a **live cell** in its thread: a message row whose
   whole box is swept by a band, saying what the agent is on.
8. Clicking that cell opens the agent's **reasoning turn** in the rail — tool
   rows and streaming prose — with a Back that knows which thread it came from.

## 4. The file map

**The bar** — `src/components/composer/`
- `composer-agent-status.tsx` — the 40px strip, the stack/detail swap, the
  focus contract across it, `agentGroup`, and which click navigates.
- `agent-status/agent-detail.tsx` — one run as a row, several as a stack. The
  stretched row target, Stop, the arrow.
- `agent-status/run-state.ts` — **the one table**. Label, tone, tint, ring,
  icon and priority per state. Everything else reads it.
- `agent-status/{agent-chip,agent-stack,state-dial,run-count,types}.tsx|ts`

**The room** — `src/components/rooms/`
- `room-view.tsx` — assembly, the rail's nav stack, the fleet, the jump.
- `room-composer.tsx` + `room-mention-menu.tsx` — the field and `@`.
- `room-thread-panel.tsx` — the rail, both levels, the arrival wash.
- `room-working-message.tsx` — the live cell.
- `room-agent-thread.tsx` — the reasoning turn in the rail.
- `tracker/` — the board, the list, the pulse, the context.

**The data** — `src/lib/mock/`
- `rooms.ts` — roster, messages, threads.
- `room-tracker.ts` — 14 tasks in the demo room, every one with a
  `sourceMessageId`.
- `room-reasoning.ts` — a turn per `working` task.
- `room-agent-runs.ts` — a mention's run, and `threadForAgent`.
- `agent-status.ts` — the design page's fleets.

## 5. Decisions. Read before changing

**5.1 The bar's left is a count, not "Working…".** The variant emptied it on
purpose; a count came back because three discs and a "+3" is six agents and
nobody reads that sum off overlapping circles. Do not put a status word there.

**5.2 The arrow is neutral and has no text.** It was "View task" in the state's
tint. A stack then ended in four coloured arrows down its right edge, which
read as four more state marks beside the four dials that already are. The
state lives on the dial, the glyph and the control's accessible name.

**5.3 Stop makes a run `stopped`, not `done`.** `done` handed a green tick to
work somebody called off; `stuck` would blame the agent for the reader's
decision. `stopped` is red like `stuck` and wears a stop square — the only
non-circular mark in the table, because it is the only state a person put
there.

**5.4 A chip for a multi-run agent opens the list and nothing else.** It used
to jump as well, which meant the app picked one of four before the reader had
read them, and dragged the column to prove it. One run still goes straight
through.

**5.5 The working cell's shimmer crosses the cell, not the words.**
`thread/shimmer.ts` clips its band to the glyphs, which is right for a label
inside a sentence. Here the thing that is running is the row, face included, so
the band is a layer over the box and the text keeps its tiers. This also
removed the failure mode where the row could paint as invisible text.

**5.6 The tracker keeps all its code and none of its inbound link from the
bar.** `focusTask` still exists and still works; the bar stopped calling it
when the arrow started opening conversations. An agent's name in a message
still goes to the board.

**5.7 One table, never two.** `agent-runs.ts` kept its own copy of
`STATE_PRIORITY` and it went stale the moment the bar learnt a fifth state. It
imports the shared one now. Do not re-copy it.

## 6. Known gaps

- **Three of the four rooms have no conversation** (`days: []`), so their tasks
  have no `sourceMessageId`, no thread to open and no live cell. Their chips
  open a detail whose rows keep the state word. Deliberate; the demo is one
  room.
- **No pause**, only Stop. `AgentRunState` has no paused state to land in.
- **Nothing was verified in a browser.** Every claim here is from `tsc`, lint,
  `npm test`, `curl` for a status code, and reading the served HTML. Two things
  specifically want an eye: the row target's 8px bleed against the bar's gutter
  at the 512px measure, and whether pressing a row anywhere *feels* pressed.
- **An open question from the user, unanswered.** They asked for "the shimmer
  in the middle chat"; it was read as the one-shot pulse on the source message,
  which is what ships. If they meant the live cell should also appear in the
  middle column's message list, that is unbuilt.

## 7. The merge

`main` is 5 commits behind and the merge has not been done, because the main
checkout has uncommitted edits to `docs/components.md` — the one file this work
also changes. Merging into it would clobber or abort. When that session lands:

```bash
cd /Users/karthiksivacharan/Projects/hyperagent
git merge --no-ff feat/rooms
npx tsc --noEmit && npm run lint && npm test
git push origin main
```

A push to `main` is a production deploy (Vercel project `hyperagent-onboard`,
https://hyperagent-onboard.vercel.app), so the gates are not optional.

## 8. The gates

From the worktree, all four, every time:

```bash
npx tsc --noEmit                 # silent
npm run lint                     # 0 problems
npm test                         # 13 files / 158 tests
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3013/rooms/room-capability-checks
```
