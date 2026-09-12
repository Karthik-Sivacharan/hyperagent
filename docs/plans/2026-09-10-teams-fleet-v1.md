# /teams fleet views, v1

Branch `feat/teams-fleet`, worktree `.claude/worktrees/teams-fleet`, dev server `http://localhost:3001` (already running; do not start another, do not run `next build` while it runs).

## What we are building

`/teams` today is an empty state ("You're not on any teams yet"). v1 turns it into one populated team, **Growth Ops**, whose fleet of named agents and their runs can be seen three ways:

1. **Board**: kanban of runs, columns keyed to what the human owes next (a coding-agent desktop's sessions board, a kanban whose cards carry live agent state, an issue tracker's owner with the delegated agent nested under).
2. **List**: the same runs grouped by status, dense rows, collapsible groups (an agent console's Needs input / Working / Completed, a mission-control view whose rows end in an outcome, an agent inbox's groups).
3. **Org chart**: the hierarchy of the team: team at the top, the orchestrator agent, lead agents, specialist sub-agents, each node a small profile card; live delegation drawn as animated edges (an agent-workforce product's org chart and its workforce canvas). Built on React Flow (`@xyflow/react`) through our own `ui/flow.tsx` primitives modelled on Vercel AI Elements' workflow components (Canvas, Node, Edge, Controls, Panel).

Clicking any agent (card avatar, row, node) opens an **agent sheet** (profile, budget, score, current runs, sub-agents). The old empty state stays reachable at `/teams?state=empty`.

This is v1: static mock data, no persistence, no drag and drop. Make it look and move like a shipped product.

## Reference material (Read this before designing your part)

The survey, the six recurring patterns and the screenshots behind them live in
the git-ignored research folder: `docs/research/09-agent-orchestration-ux.md` in
the main checkout (`/Users/karthiksivacharan/Projects/hyperagent/docs/research/`),
with the images beside it. That file names the products it read. This plan
describes the patterns only, and the table below says which pattern each part of
`/teams` is answering.

| Part | The pattern to study |
|---|---|
| Board | A coding-agent desktop's sessions board (Running / Waiting for review / Done); a kanban whose cards carry live agent state and a diff; an issue tracker showing the owner with the delegated agent nested under; a glow on the card that is running |
| List | Grouped triage in an agent console; rows that end in an outcome; an inbox grouped by what it is waiting on |
| Org chart | An agent-workforce product's org chart, its named agents laid out on a canvas, and its per-agent dashboard |
| Agent sheet | That same per-agent dashboard (profile with run charts); a run receipt pane; a kanban's side panel |
| Presence | Avatars parked on the work they are doing, and an online roster |

## Rules that apply to every agent

- Read `AGENTS.md`, `docs/components.md` and `docs/brand/design.md` first. This is Next.js 16: read the relevant guide in `node_modules/next/dist/docs/` before using any Next API (search params, client components, Suspense).
- Load the skills `emil-design-engineering`, `impeccable` (run it with `IMPECCABLE_CONTEXT_DIR=docs/brand`) and `web-animation-design` before designing. Follow them.
- Brand tokens only: the utilities bridged in `src/app/globals.css` onto `src/design/brand/brand.css` (`bg-surface-*`, `text-foreground-low`, `border-border-subtle`, `rounded-*`, `shadow-card`, `text-label-12-caps`, etc.). No raw hex, no Tailwind palette colours (`bg-blue-500`). Status colours come from `--success`, `--warning`, `--destructive`, `--info`; the tangerine brand accent is spent on one thing only: **Needs you** (the human is blocking). `npm run brand:lint-tokens` must pass.
- Type: Geist via the existing role classes; headings 600 via `font-heading`; no other faces.
- Icons: `@tabler/icons-react` only (`docs/brand/icons.md`), `aria-hidden="true"` on decorative icons, `stroke` not `strokeWidth`.
- Components: build from `src/components/ui` primitives and `src/components/patterns`. Page/feature files never contain a raw `<button>`, `<input>`, `<textarea>`, `<select>` or `<label>`; only `src/components/ui/` imports `radix-ui`, `cmdk` or `@xyflow/react`. A new primitive goes in `ui/` with a `data-slot`, per `docs/components.md` §3.
- Motion: CSS transitions use the brand tokens (`duration-(--duration-fast)`, `ease-(--ease-out-quart)` …). JS animation uses `motion/react` with the constants in `src/lib/motion.ts` (created by the foundation agent; mirrors brand.css). Enter ≤ 200ms, exits faster than enters, layout moves 220ms `--ease-out-layout`, stagger 80ms only on first paint, nothing over 500ms. Every animation honours `prefers-reduced-motion` (motion's `useReducedMotion` / `MotionConfig reducedMotion="user"`; CSS `motion-safe:`/`motion-reduce:`).
- Mock data is static: no `Date.now()`, no `Math.random()` at render (hydration). Relative times are pre-baked strings.
- Do not commit. Do not touch files you do not own; if you need a change in someone else's file, say so in your final report. The orchestrator commits by path.
- Check your part visually at `http://localhost:3001/teams` (BrowserOS neo in your own tab, or `ONLY=teams node scripts/dev/screenshot-pages.mjs <scratch-dir> http://localhost:3001` for light + dark). v1: one or two looks, not a test loop.
- Before reporting: `npx tsc --noEmit` and `npx eslint <your files>` clean for your files. Final report: files touched, what you built, anything left rough, under 200 words.

## The data contract (`src/lib/mock/teams.ts`, owned by the foundation agent)

```ts
export type RunStatus = "queued" | "working" | "needs-you" | "review" | "done";
export type AgentState = "working" | "idle" | "paused" | "error";
export type RunTrigger = "thread" | "slack" | "schedule" | "email" | "webhook" | "agent";

export interface TeamMember {
  id: string;            // "m-priya"
  name: string;          // "Priya Nair"
  initials: string;      // "PN"
  role: string;          // "Founder"
  online: boolean;
}

export interface FleetAgent {
  id: string;            // "a-atlas"
  name: string;          // "Atlas"
  role: string;          // "Chief of staff"
  hue: number;           // OKLCH hue 0-360 for the monogram tint
  model: string;         // "Claude Opus 4.8"
  parentId: string | null; // the agent it reports to; null = reports to the team
  ownerId: string;       // accountable human (TeamMember.id)
  state: AgentState;
  activity?: string;     // live line when working: "Drafting slide 7 of 12"
  spend: number;         // USD this month
  budget: number;        // USD monthly cap
  score: number;         // average rubric score, 0-100
  runsThisWeek: number;
  skills: string[];
}

export interface FleetRun {
  id: string;            // "RUN-214"
  title: string;
  agentId: string;       // agent doing the work
  ownerId: string;       // human accountable
  status: RunStatus;
  trigger: RunTrigger;
  project: string;       // "Q3 launch"
  progress?: { done: number; total: number }; // steps, for queued/working
  needs?: string;        // only for needs-you: "Approve sending 42 emails"
  outcome?: string;      // for review/done: "Deck, 14 slides" / "38 leads added"
  updated: string;       // pre-baked relative time: "4m ago"
  cost: number;          // USD so far
  minutes: number;       // run time so far
  helpers?: string[];    // sub-agent ids it delegated to (drives live org edges)
}

export interface Team {
  id: string;
  name: string;          // "Growth Ops"
  description: string;
  members: TeamMember[];
}

export const TEAM: Team;
export const FLEET_AGENTS: FleetAgent[];   // ~12, a 3-level tree under one orchestrator
export const FLEET_RUNS: FleetRun[];      // ~24, every status represented, 3-6 per column
export const RUN_STATUS_ORDER: RunStatus[]; // ["needs-you","working","queued","review","done"]
```

Shape of the fleet (names are the foundation agent's call, business work not code): 3 humans; one orchestrator agent ("Atlas, Chief of staff") reporting to the team; 4 lead agents (research, outbound, content, finance ops) reporting to it; 1-3 specialists under each lead. Runs are Hyperagent-style deliverables (investor update deck, weekly competitor digest, 50 Series A fintech prospects, refund triage, podcast launch kit …).

## Shared UI (owned by the foundation agent, used by everyone)

All under `src/components/teams/` unless noted.

| Export | File | API |
|---|---|---|
| `AgentAvatar` | `fleet/agent-avatar.tsx` | `{ agent: FleetAgent; size?: "xs" \| "sm" \| "md" \| "lg"; showState?: boolean }`, monogram on an OKLCH tint from `agent.hue`, optional state dot (working pulses) |
| `MemberAvatar` | `fleet/member-avatar.tsx` | `{ member: TeamMember; size?: "xs" \| "sm" \| "md" }` initials, online ring |
| `RunStatusBadge`, `RUN_STATUS_META` | `fleet/run-status.tsx` | meta per status: `{ label, icon (Tabler component), tone }`; labels **Needs you / Working / Queued / In review / Done** |
| `formatUsd`, `formatMinutes` | `fleet/format.ts` | `$3.88`, `15m`, `1h 20m` |
| `FleetProvider`, `useFleet` | `fleet/fleet-context.tsx` | `{ team, agents, runs /* filtered by query */, allRuns, agentById, memberById, query, setQuery, selectedAgentId, openAgent(id), closeAgent() }` |
| motion constants | `src/lib/motion.ts` | `DURATION.{exit,instant,enter,fast,normal,move,slow,entrance,stagger}` in seconds, `EASE.{out,outQuart,outQuint,outLayout,outExpo,inOut}` as bezier arrays, matching brand.css |

Views are default-free components with no props, reading `useFleet()`:

- `BoardView` in `board-view.tsx` (+ `board/*`), owned by the board agent
- `ListView` in `list-view.tsx` (+ `list/*`), owned by the list agent
- `OrgView` in `org-view.tsx` (+ `org/*`), owned by the org agent; `src/components/ui/flow.tsx` owned by the flow agent
- `AgentSheet` in `agent-sheet.tsx` (+ `sheet/*`), owned by the sheet agent; the page renders it once and it opens when `selectedAgentId` is set

The foundation agent creates each of these four files as a stub with the exact export name, so the page compiles from day one; the owner replaces the stub.

## As built in phase 1 (read this, it overrides the tables above where they differ)

- `useFleet()` also returns `runsByStatus`, `subAgentsOf(id)`, `runsForAgent(id)`; `agentById` / `memberById` **throw** on an unknown id.
- Extra helpers: `LAYOUT_TRANSITION` in `src/lib/motion.ts`; `RUN_TONE_CLASSES`, `RunStatusIcon`, `AGENT_STATE_META`, `AgentStateDot`, `AGENT_TINT_CLASS` + `agentTintStyle(hue)` (put both on an element to get `bg-(--agent-bg)` / `text-(--agent-fg)`).
- Avatars on cards: set `[--avatar-cutout:var(--card)]` (or the surface they sit on) so the state-dot and ring cutouts match.
- Each view is mounted in an absolutely positioned, scrolling flex column with **no padding**: add your own `px-6` gutter.
- `activity` is also set on paused/error agents (Gauge: paused at its $80 budget; Tally: Stripe connection expired).
- Fleet: people Priya, Diego, Sam; agents Atlas → Iris (Scout, Gauge), Rook (Finch, Echo), Quill (Cadence, Mosaic), Ledger (Tally); runs RUN-201…RUN-227 (24; per status 4/6/4/4/6).
- Flow primitives (`src/components/ui/flow.tsx`): `FlowCanvas`, `FlowNode` (`handles`, `direction`), `FlowNodeHeader|Media|Title|Description|Action|Content|Footer`, `FlowEdgeStatic|Animated|Temporary`, `flowEdgeTypes`, `FlowControls`, `FlowPanel`, `FlowToolbar`; types `FlowEdge`, `FlowEdgeData { tone, curve }`; re-exports `Node`, `Edge`, `NodeProps`, `Handle`, `Position`, `useReactFlow`, `useNodesState`, `useEdgesState`, `useNodesInitialized`, `FlowProvider`. `FlowNode` must be the node component's root; live edges need `zIndex: 1`; set `ariaLabel` on edges with names, not ids; controlled `nodes` need `onNodesChange` to be selectable. Preview at `/design/flow`.

## Page shell (foundation agent)

`src/components/teams/teams-page.tsx` (keep the `TeamsPage` export; the route file stays as is):

- Header on the existing `PageHeading`: team name as title, a one-line description, member avatar stack with an online count, actions **Invite** (outline) and **New agent** (ink). Keep the hairline header rule.
- Summary strip under the header (summary before detail): Needs you (count, tangerine), Working now, Spend this month vs budget, Avg score. Small, not hero tiles.
- Toolbar: view switcher **Board / List / Org chart** (segmented, sliding active indicator via a motion `layoutId`), search (`SearchInput`) filtering runs by title/agent/project. View lives in `?view=board|list|org`, default `board`, shareable.
- View container: cross-fade between views (outgoing ~90ms, incoming ~200ms with 4-6px rise), no layout jump; the view area fills the remaining height and scrolls inside itself (board scrolls horizontally when columns overflow).
- `?state=empty` renders the previous empty state unchanged.
