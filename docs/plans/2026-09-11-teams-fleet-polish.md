# /teams polish: fewer things, said once

Branch `feat/teams-fleet`, worktree `.claude/worktrees/teams-fleet`, dev server `http://localhost:3001` (running; do not start another). This round changes no data and adds no features. It takes things away, puts detail one interaction deeper, and makes /teams look like the /threads, /agents and /skills pages. The rules in `docs/plans/2026-09-10-teams-fleet-v1.md` ("Rules that apply to every agent") still hold. Where the two plans disagree, this one wins. The agent avatar's style is being redesigned in parallel (§5 is the only avatar contract here).

## 1. Diagnosis

At 1456×868 the board shows about 200 separate facts, the accent appears about 10 times, there are 6 text sizes plus 3 monogram sizes, and 5 status hues. These are the tells:

- **Shell.** The description sentence repeats what the team name already says. Member faces each wear a green online ring, followed by "2 online", a vertical rule and a labelled outline Invite: four kinds of object in one action cluster. The summary strip is the stat-strip template (dot, bold number, grey label, a divider, four times, plus a hairline meter). Every count in it repeats a column or group header just below, and spend and average score are not the task anyone came for. The toolbar puts search on the right with a labelled, sliding segmented control on the left, the reverse of every other resource page.
- **Board.** Each run sits in two containers (a `surface-secondary` lane around a shadowed card). A card has 4 to 6 rows: trigger glyph + project + time; title; a status block; agent + "for" + a ringed owner face + "$3.88 · 15m". Needs you puts a tangerine-tinted callout with an outline Review button on every card, so the column is four stacked orange slabs. Working says progress three ways (the live line, a segmented step bar with a shimmer and "2/6") and adds a stack of helper faces. Queued adds an hourglass, "4th in line" and "6 steps"; review and done put a corner-arrow glyph before the outcome. The five column glyphs come in five hues, which only repeat what the column labels already say. The Done column is cut in half at 1456.
- **List.** A caps header row over 9 columns (ID, Run, Project, Agent, Owner, Cost, Time, Updated) turns triage into a spreadsheet. Every row carries a RUN-2xx id, a project pill, an owner face with a presence ring, cost, run time and updated. The four asks are set in tangerine text, working rows add a meter and "2/6", and every row repeats its sticky group header's status glyph in colour.
- **Org chart.** There is a legend panel (a caps "AGENTS" label, four coloured dots with counts, a key to the two line styles), and it exists only because the chart encodes six colours. Each node carries about 11 facts: a 48px monogram with a state dot, name, role, model, the owner's face, a two-line live line, a tinted ask chip, and a footer tray (active count, meter, $x / $y, score). At the fitted zoom (0.81) that text renders at about 10px. Around the nodes: blue dashed edges, a dotted ground inside a rounded, shadowed frame, 6px dots on every edge end, and a team node with an icon tile and "3 people · 12 agents".
- **Sheet.** The header has a state dot and two placeholder outline buttons. Below it, five hairline-ruled bands with caps labels ("SPEND THIS MONTH", "RUNS 2", "SKILLS 3") make it read like a settings form. Spend is told three times (the figure, a meter, "37% of budget / $37.60 left"). There is a 7-bar chart of derived numbers, coloured status pills on the run rows, and skills as badges.
- **Everywhere.** Middle-dot meta strings, pills and tints around plain text, and hairlines and boxes where whitespace would do.

## 2. Principles

1. One idea per surface: the board is what each run needs next, the list is triage, the org chart is who reports to whom, the sheet is one agent.
2. Type and whitespace carry the hierarchy. A container appears only where it is the thing you click (board cards, org nodes).
3. Colour means a person is needed. Tangerine marks Needs you, warning and destructive mark a stuck agent, everything else is ink and grey.
4. One line of state per run, in words. The words carry progress, so glyphs, meters and counters can go.
5. Detail is one interaction deeper: hover and focus reveal it in reserved space, a click opens the sheet, and the sheet folds what is rarely needed.
6. Show numbers only where they are the point: counts on headers, times on rows, money and score in the sheet and in the tooltips.
7. Native first: the header, toolbar, card and switch come from /threads and /agents, not new inventions.

## 3. Chrome and colour budget

- **Tangerine** (`text-brand-accent`) appears only on the Needs you glyph (`IconProgressHelp`): the board lane header, the list group header, the org node's state slot, the org tooltip's ask and the sheet's Needs you rows. It is never a text colour, fill, tint, ring or count.
- **Warning and destructive** mark an agent that is paused or in error, as a 14px glyph (`IconPlayerPause`, `IconAlertTriangle`) before the reason. The reason text stays `muted-foreground`. The only coloured fill is the sheet's spend meter (warning from 90%, destructive at the cap).
- **Info and success are not used on /teams.** Every status glyph except Needs you is `text-foreground-low`. Avatars carry no state dots, no working ping and no presence rings.
- **Fills.** Board cards and org nodes use the native card look (`bg-card shadow-card`, `hover:shadow-card-hover`). Rows get `hover:bg-tint-7`. Tooltips use the primitive. Nothing else is filled: no lanes, trays, chips, badges or tinted callouts.
- **Borders.** Only the header hairline stays. The sheet header's hairline shows only while the sheet body is scrolled.
- **Radius.** Board card 18px (`rounded-2xl`), org node 14px (`rounded-xl`), row 10px (`rounded-lg`). Controls keep their primitive's radius.
- **Type.** Four sizes across the page and sheet: `text-2xl` page title (600), `text-xl` sheet title (600), `text-sm` for titles and labels (500) and body (400), and `text-md` for captions, times and meta (400). No `text-xs`, `text-heading-lg`, caps, `Overline` or `text-[…]` in /teams, except inside the avatar files and tooltips.
- **Mono** is not used. Counts, times and money get `tabular-nums`.
- **Copy.** No "·" in any rendered string; tooltips use commas ("Priya Nair, Founder"). Sentence case everywhere. Accessible names keep every fact the old visuals showed.

**The caption rule** (board card, list row and sheet run row all use it). Needs you: `run.needs`. Working: `agent.activity` while the agent is working. Queued: `agent.activity` only when the agent is paused or in error, after its tone glyph; otherwise no caption. In review and Done: `run.outcome`. Each owner writes this function locally, and the orchestrator folds the copies into `fleet/run-caption.ts` at merge.

## 4. Per-surface spec

### 4.1 Shell. Agent 1: `teams-page.tsx`, `fleet/fleet-header.tsx`, `fleet/fleet-toolbar.tsx`, `fleet/run-status.tsx`; delete `fleet/fleet-summary.tsx`
- **Default header.** `PageHeading` under the hairline, title "Growth Ops", no subtitle. The actions are the member stack (24px faces overlapped by 6px), a ghost `icon-sm` Invite (`IconUserPlus`, tooltip "Invite people") and the ink New agent button.
- **Default toolbar** (`px-6 py-4`). `SearchInput` on the left (`sm:max-w-[306px]`, placeholder "Search runs and agents"). On the right, while a query is set, the live count ("8 of 24 runs", `text-md text-foreground-low`; kept in the aria-live region but hidden visually in org view). After it, the /threads view switch copied as-is: an icon-only `ToggleGroup` with `VIEW_ITEM` and the Board / List / Org chart labels as tooltips.
- **`run-status.tsx`.** The `info`, `warning` and `success` tones become neutral (`text-foreground-low`, dot `bg-foreground-low`), and `brand` keeps `text-brand-accent` for the Needs you glyph. Change values only (every `tint` becomes `""`), remove no keys so no other agent's build breaks mid-round, and rewrite the file's header comment to match.
- **Revealed.** A member face's tooltip reads "Priya Nair, Founder, online".
- **Delete:** the description; "2 online"; the vertical `Separator`; the labelled Invite; the summary strip; the `layoutId` sliding indicator and the labelled segments.

### 4.2 Board. Agent 2: `board-view.tsx`, `board/*`; delete `board/step-bar.tsx`, `board/triggers.ts`
- **Lanes.** No background. A lane is its header plus a stack of cards 8px apart. Lanes share the width (min 240px, max 320px, 16px apart) and scroll sideways only below that, so at 1456 four lanes and a folded Done fit.
- **Lane header** (`h-9 px-3`): the status glyph, the label (`text-sm font-medium`) and the count (`text-sm text-foreground-low`). **Done is folded by default** (as in the list): the header alone, as a ghost `Button` with `aria-expanded`, sized to its content, with a chevron. A click expands it into a full lane on a motion `layout` move.
- **Card default** (native `Card`, `rounded-2xl p-3`, no controls inside; the card is the one target):
  1. Title, `text-sm font-medium`, `line-clamp-2`.
  2. The caption, `text-md text-muted-foreground`, truncated to one line, 2px below the title. Plain queued cards have none.
  3. The footer, 12px below: a 20px agent avatar and the name (`text-md text-muted-foreground`), with `run.updated` on the right (`text-md text-foreground-low`).
- **Revealed.** On hover the shadow lifts, nothing more; focus shows the ring. A click or Enter opens the sheet, which holds the ask and its Review action. A card never grows on hover.
- **Empty lane.** One line of `text-md text-foreground-low` copy with no dashed box.
- **Delete:** the lane ground; the trigger glyph and project row; the step bar and "2/6"; the helper faces; the tinted Needs you block and its Review button; the queue ordinal and "N steps"; the corner-arrow glyph; "for" and the owner face; cost and minutes; the avatar state dot; the first-paint lane stagger.

### 4.3 List. Agent 3: `list-view.tsx`, `list/*`
- **Row default.** One line, `h-10`, the whole row the ghost `Button` (as today), laid out on `grid-cols-[1.25rem_minmax(0,20rem)_minmax(0,1fr)_11rem] gap-x-3`: a 20px agent avatar, the title (`text-sm font-medium`, truncated), the caption (`text-md text-muted-foreground`, truncated), and a right cluster. Below `@3xl/list` the caption and the reveal drop out and the grid becomes avatar, title, time.
- **Right cluster** (fixed 11rem, right-aligned). At rest it shows only `run.updated`. **Revealed** on row hover or `focus-visible`: the agent's name and the run's cost fade in to the left of the time, inside the reserved width, so nothing reflows.
- **Group header.** `sticky top-0` (no column header above it any more), `bg-background`, `h-9`, 16px above each group: the glyph, the label (`text-sm font-medium`) and the count (`text-foreground-low`). The chevron stays hidden at rest, fades in on hover or focus, and stays visible while the group is folded. Done still starts folded.
- **Delete:** `ListColumnHeader`; ID; the project pill; the owner, agent-name, cost, time and updated columns as columns; the per-row status glyph; the tangerine ask colour; `StepMeter` and "2/6"; the group stagger.

### 4.4 Org chart. Agent 4: `org-view.tsx`, `org/*`, `ui/flow.tsx`, `ui/flow.css`; delete `org/org-legend.tsx`
- **Canvas.** Full-bleed in the view area: no `px-6 pb-6` frame, no `rounded-3xl shadow-card`. `className="bg-background"`, `background={false}` (no dots), fit at `{ padding: "48px", maxZoom: 1 }`. `FlowControls` stay top right.
- **Layout** (`org/layout.ts`). Team, then Atlas, then the four leads in a row 32px apart. A lead lists its specialists *vertically* under itself, indented 24px and 12px apart. Each specialist hangs off a tree elbow that runs from a source handle 24px in from the lead's bottom-left corner into a target handle on the specialist's left side: the delegate elbow. `FlowNode` gains per-side handle positions and an extra source handle; all handles render invisible, since the canvas is never connectable. Every agent node is 208×56. The tree is 1024px wide and fits a 1456 window at zoom 1, so text renders at its true size.
- **Agent node default** (`rounded-xl p-3`): a 32px avatar; the name (`text-sm font-medium`) over the role (`text-md text-muted-foreground`), both truncated; and a 16px state slot on the right holding at most one glyph, the first that applies of Needs you (tangerine), error or paused. The slot stays empty when nothing needs a person.
- **Team node.** One row, auto width, `h-12`: the team name (`text-sm font-semibold`) and 20px member faces, overlapped.
- **Edges.** The static hairline stays. Live delegation keeps its travelling dashes but in a new neutral `strong` tone (`var(--foreground-low)`, 1px, `4 4`). No blue.
- **Revealed.** Hover or keyboard focus lights the node's chain of command as today. After 250ms, a controlled `Tooltip` (the ink primitive, side bottom, align start, `max-w-64`) shows: the live line (the activity, the paused or error reason, or "Idle, 11 runs this week"); the first ask with its glyph and "+1 more"; and "Priya Nair, $119 of $200, score 89" in `text-muted-foreground`. The team node's tooltip shows the description, "3 people and 12 agents", "$1,000 of $1,620 this month" and "Average score 86". A search result count moves to an `sr-only` aria-live line ("3 of 12 agents match").
- **Delete:** the legend; on the node, the model, owner face, live line, ask chip, footer tray (active count, meter, $x / $y, score) and monogram state dot; the compact and full node variants; the team node's icon tile and counts; the dotted ground; the frame; the visible handle dots; the `info` edge tone.

### 4.5 Agent sheet. Agent 5: `agent-sheet.tsx`, `sheet/*`; delete `sheet/week-activity.tsx`, `sheet/spend-meter.tsx`
- **Header** (does not scroll). A 48px avatar; the name (`text-xl`) over the role (`text-md text-muted-foreground`); on the right, a ghost `icon-sm` "More" `DropdownMenu` (Open agent page; Pause agent or Resume agent) and the close button. One more line only when there is something to say: the activity for a working agent, or the tone glyph and reason for a paused or stuck one. An idle agent gets nothing.
- **Body.** Sections 32px apart with no rules. Titles are `text-md font-medium text-foreground-low`, sentence case, with no counts.
  1. **Needs you** (only when the agent has asks). For each ask: the tangerine glyph; the ask (`text-sm`) over the run title (`text-md text-muted-foreground`); and Review (`Button`, default ink, `size="sm"`, inert in v1).
  2. **Runs.** Working, queued and in-review rows: the neutral glyph; the title (`text-sm font-medium`) over its caption; and `run.updated`. Done runs sit behind a ghost "Show 2 done" toggle (`Collapsible`, closed each time).
  3. **Details** (`Collapsible`, closed by default; `AgentSheet` holds the open state so it carries across agents). A `dl` in `text-sm` with `text-foreground-low` labels: Model; Owner (a 20px face and the name); Reports to (`AgentChip` or the team name); Sub-agents (`AgentChip`s); Spend ("$22.40 of $60" and a 48px inline meter, toned only as in §3); Score ("81 of 100"); Skills (plain text, comma-separated).
- **Delete:** the header state dot; the Open agent and Pause buttons; the `PanelSection` bands and their caps labels, counts and hairlines; the spend block's big meter, percentage and "left"; the week chart; the run `Badge` pills; the skill `Badge`s.

## 5. Avatars: size and placement only

| Where | Who | Size |
|---|---|---|
| Header member stack | people | 24px, overlapped 6px |
| Board card footer, list row (first cell) | the run's agent | 20px |
| Org agent node | the agent | 32px (every rank) |
| Org team node | people | 20px, overlapped |
| Sheet header | the agent | 48px |
| Sheet details: Owner; Reports to and Sub-agents chips | a person; agents | 20px |

People are circles with initials on a neutral fill. Agents are never circles and carry their own hue or mark, so at 20px an agent beside a person reads as two different kinds of member. /teams uses only these four sizes. It passes no `showState`, and it shows no presence ring: whichever style the avatar agent ships, both marks must be opt-in. Owners, helpers and presence appear on no card, row or node.

## 6. Motion

- **Reveals** animate opacity only: in at 150ms (`--duration-fast`, ease-out), out at 90ms (`--duration-exit`), on `group-hover` and `group-focus-visible` alike. They never change height, width or font weight. Revealed content sits either in space already reserved for it (the list's right cluster) or in a floating layer with `pointer-events-none` (the org tooltip). Nothing needed to finish a task hides behind hover: the sheet has everything, and Tailwind v4 `hover:` only fires on devices that can hover.
- **Intent delay.** An org tooltip opens 250ms after the pointer or focus lands on a node, opens instantly when moving to a neighbour within 300ms, and closes on the chain's 90ms grace.
- **Folds.** The board's Done lane moves on motion `layout` (220ms, ease-out-layout). The list groups and the sheet's `Collapsible`s keep the `collapsible-down`/`-up` keyframes. Under reduced motion all of them jump.
- **Continuous motion.** Only the org chart's live dashes move. The step-bar shimmer, the working-dot ping and the sliding view pill are deleted.
- **Entrances.** Only one survives: the org chart's first-paint entrance, rank by rank. The board and list staggers go. The view cross-fade and the sheet's content cross-fade stay.
- **Reduced motion.** `MotionConfig reducedMotion="user"` and `motion-safe:` keep the fades and drop every movement.

## 7. Done means

- Each agent touches only its own files, listed in §4. The avatar files belong to the avatar agent. Commits are made by the orchestrator.
- `rg -n "text-info|bg-info|text-success|bg-success|brand-subtle|label-12-caps|Overline|text-xs|text-heading-lg|·" src/components/teams --glob '!**/*-avatar.tsx'` prints nothing.
- `npx tsc --noEmit`, `npx eslint <your files>`, `npm run brand:lint-tokens` and `npm test` all pass.
- `ONLY=teams node scripts/dev/screenshot-pages.mjs <scratch> http://localhost:3001` in light and dark at 1456×868: the board without horizontal scroll, the list, the org chart at zoom 1, and the sheet open on Tally. The only colours in any of them are the Needs you glyphs and the Gauge and Tally glyphs.
