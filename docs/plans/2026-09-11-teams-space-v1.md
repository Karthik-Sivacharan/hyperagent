# /teams office: the fleet as a place (v1)

Branch `feat/teams-space`, worktree `.claude/worktrees/teams-space`, dev server `http://localhost:3002` (running; do not start another). A fourth view, `?view=space`, labelled **Office** in the view switch, beside Board, List and Org chart. Same data (`useFleet()`), same agent sheet. A 2D top-down pixel office in the spirit of Gather: departments are rooms, every agent and every present person is a character, and you can walk around, drag anyone and hover anyone. v1 is a prototype: no backend, no persistence (positions reset on reload), light verification.

Research behind it (session scratchpad, not in the repo; the builders read these):
`research/gather-ui.md` (Gather's interaction model and chrome, measured read-only) and `research/oss-survey.md` (engines, reusable code and asset licences), under `/private/tmp/claude-501/-Users-karthiksivacharan-Projects-hyperagent/4b90636c-063c-412a-a828-97b250f2add1/scratchpad/`.

## 1. Decisions

- **No game engine.** Gather itself renders the map to one canvas and lays name tags and bubbles over it as DOM. We do the same, one step further: floors, carpets and walls paint once into a `<canvas>`; furniture and characters are absolutely positioned DOM sprites, y-sorted by `z-index`; tags, bubbles and cards are DOM chrome at screen scale. No dependency is added, nothing needs `ssr: false`, and every character is a real `Button` with an accessible name, so keyboard and screen readers work as they do on the other views. If the scene ever needs zoom or hundreds of sprites, PixiJS 8 behind a `ui/` primitive is the fallback.
- **Art is licence-clean.** Pixel Agents v1.4.1 (MIT, © Pablo De Lucca) for floors, walls, carpets, furniture and the human characters; optionally Antea's Free Office Furniture Set (CC-BY 4.0, credit required) for the modern pieces. Agents are **robots**: palette-swapped from the Pixel Agents character sheets by a script (grey metal skin, a visor or antenna, body in the department hue). Never LimeZu (free or paid), Donarg, WorkAdventure, Star-Office, SkyOffice or AI Town art. Nothing from Gather: no code, no art.
- **Code borrowed with its MIT header:** Pixel Agents' `findPath` / `isWalkable` (BFS), its walk/idle/type timing, its wall bitmask auto-tiling and its floor colorize. Not its renderer.
- **Scale.** Source tiles are 16px. The map is **36 x 22 tiles**, drawn at the largest whole-number scale that fits the view area (2x at 1456 x 868, so 1152 x 704 CSS px), centred, `image-rendering: pixelated`. One coordinate system for everything: `px = tile * 16 * scale`. Chrome (tags, bubbles, cards) is NOT scaled; it is positioned in the same px space at its natural size.
- **Theme.** The art is the same in both themes (it is a place, not a surface). The ground around the map is `bg-background`; in dark the map sits on it as a lit room would. The builders may soften the art in dark with a light filter if it glares, never with hue.

## 2. The floor plan

36 x 22 tiles, outer wall ring, a hall across the middle, doors (2-tile gaps) from every room onto the hall.

```
 Research (3 desks + lead desk)   | Atlas's office (Atlas, Priya) | Outbound (Rook, Finch, Echo, Diego)
 -------------------------------- hall, entrance on the left edge ---------------------------------
 Content (3 desks + lead desk)    | Meeting room (round table, 6) | Lounge (sofa, coffee) | Finance ops (Ledger, Tally, Sam)
```

Every agent owns a desk in its department's room; Atlas and Priya share the small office; Diego has a desk in Outbound; Sam's desk is in Finance ops. Rooms read as places through furniture, carpets and floor tone, not through colour-coded zones. Each room gets a small label (its name) near its door.

**The snapshot (seed).** The mock is a moment in time, so the scene starts where the data says everyone is:
- The week 37 growth review (RUN-224, scheduled, Atlas with helpers Iris, Rook, Quill) is **in the meeting room**: those four sit round the table. Their own desks are empty. This is Gather's rule: a meeting room means a multi-agent run.
- Everyone else works at their desk: Scout and Gauge (Research), Finch and Echo (Outbound), Cadence and Mosaic (Content), Ledger and Tally (Finance ops).
- **You are Priya** (Founder), standing in the hall outside the meeting room. Diego (online) is at his desk. Sam is offline: no character, but his empty desk carries a quiet "away" tag, so the room whose owner is away is the one with the broken agent (Tally).

## 3. What a character shows (progressive disclosure)

| Level | Trigger | Agent | Person |
|---|---|---|---|
| 0 | always | Sprite in its pose (typing at a desk when working, standing still when idle, sitting still when paused or in error). A name tag above the head. A **Needs you** bubble when it has an ask. | Sprite, name tag with presence, a "You" chip on Priya. |
| 1 | hover or focus, instant | The tag adds the role ("Echo, Email copywriter"). The agents it is working with right now (lead and helpers of its live run, wherever they sit) get a highlight on their tags. | The tag adds the role. |
| 2 | hover or focus, 250ms intent delay | A card (the `Tooltip` primitive, as the org chart's): the live line (activity, the paused or error reason, or "Idle, 11 runs this week"), the current run and its caption, the first ask with "+1 more", and "Priya Nair, $119 of $200, score 89". | "Priya Nair, Founder, online" and how many asks are waiting on them. |
| 3 | click or Enter | The agent sheet opens (the existing `openAgent`). | Nothing in v1 beyond selection. |

Nothing needed to finish a task hides behind hover: level 2 is a tooltip with no controls; the actions live in the ask card (below) and the sheet.

**Name tag** (Gather's pill in the brand): 24px tall, fully rounded or 8px radius, `text-xs font-medium`, a small caret pointing down at the head, about 10px above it, pointer-events pass through to the character. Agent: a 20px `AgentAvatar` (the brand orb, so an agent is never mistaken for a person) and the name; a 14px state glyph after the name only when paused (`IconPlayerPause`, `text-warning`) or in error (`IconAlertTriangle`, `text-destructive`). Person: a presence mark (filled dot online, hollow ring away; neutral, not green) and the name. The tag's colours follow the ink `Tooltip`.

**Needs you bubble**: a small `bg-card shadow` bubble up and to the right of the head holding `IconProgressHelp` in `text-brand-accent`. It is the only tangerine in the view. It never merges away into a group tag, and neither does an error glyph (Gather's lesson: an error must never hide inside a merge).

**State in motion, not in colour.** Working = the typing frames at the desk. Idle = standing still at the desk. Paused and error = still, with the tag glyph. No state dots, no rings, no glow.

## 4. Interaction

- **Walk (you).** Arrow keys or WASD move Priya one tile per press (held keys repeat) while the map has focus. Click an empty floor tile to walk there along the BFS path. Walls and furniture block; other characters do not (v1).
- **Move anyone.** Drag any character (agent or person, you included) and drop it on a floor tile; it snaps to the nearest free walkable tile. A drag starts after 4px, so a click still opens the sheet.
- **Proximity groups.** Characters within 2 tiles of each other, in the same room, form a group: their tags merge into one tag listing first names, "Atlas, Iris, Rook, Quill", with `IconUsers` when they share a live run and `IconMessageCircle` otherwise (an ad hoc chat you made by dragging). Hovering the group tag shows the shared run and its caption, or "Chatting". Needs-you bubbles and error glyphs stay on their heads inside a group. A group with a live shared run shows Gather's static "…" bubble at its lead.
- **Walk up to an ask.** When you stand next to an agent (1 tile) that has an ask, its ask opens as a small card above it: the ask, whose it is ("For Diego"), a `Review` button (ink, inert in v1) and `Open` (ghost, opens the sheet). One card at a time, the nearest agent. Walking away closes it.
- **Keyboard and screen readers.** The map region is focusable (arrows walk). Every character is a `Button` in the tab order with a full name ("Echo, Email copywriter, working, needs you: Approve sending 42 emails, Outbound"); Enter opens the sheet. A one-line hint in a corner: "Arrow keys to walk. Drag anyone to move them."
- **Search.** While the toolbar has a query, agents that do not match dim; an `sr-only` live line says "3 of 12 agents match" (the org chart's pattern).

## 5. Motion (web-animation-design, emil-design-engineering)

- Walking is constant-speed movement, so it is **linear**: about 6 tiles a second, the walk cycle at 0.15s a frame (0-1-2-1), facing follows the step. Typing loops the two typing frames. Both are frame swaps and transforms written through refs in one rAF loop, never React state per frame.
- Tag role reveal and group merge or split: opacity, 140ms in (`--duration-enter`), 90ms out (`--duration-exit`). The level-2 card uses the Tooltip primitive's own motion and a 250ms delay. The ask card and bubble: 140ms, opacity with a 0.96 to 1 scale from their bottom edge; no loop, no bounce.
- Drag: the character follows the pointer 1:1; on drop it settles into the tile in 150ms ease-out.
- **Reduced motion** (`useReducedMotion` / `MotionConfig reducedMotion="user"`): characters jump tile to tile and a click-to-walk teleports, the typing and walk cycles hold a still frame, and tags and cards appear without scale.

## 6. Contract and file ownership

The shared types are `src/components/teams/space/types.ts` (orchestrator). The orchestrator also owns the wiring: `fleet-toolbar.tsx` (the `space` view, its label and icon, the runs count `sr-only` here as in org) and `teams-page.tsx`. Everything else belongs to exactly one builder. Import from a teammate's file, never edit it; if you need a change there, say so in your report.

**World agent** (`src/components/teams/space/world/*` except `sprites.ts`; `public/space/**` except `public/space/characters/`):
- `map.ts`: `TILE = 16`, `COLS = 36`, `ROWS = 22`, `ROOMS: Room[]`, `SEATS: Seat[]` (every desk chair and meeting seat, `owner` set for owned desks), `isWalkable(t)`, `roomAt(t)`, and the tile and furniture layout data.
- `path.ts`: `tileKey(t)`, `findPath(from, to)` (4-connected BFS over `isWalkable`; returns the tiles after `from` up to and including `to`, or `null`), `nearestWalkable(t, taken?)`.
- `seed.ts`: `SEED: Record<ActorId, Placement>` for the 12 agents, Priya and Diego, per §2; `AWAY_DESKS: { memberId: ActorId; seat: string }[]` (Sam).
- `floor-canvas.tsx`: `<FloorCanvas scale />`, the baked floor, carpet and wall layer, sized `COLS * TILE * scale` by `ROWS * TILE * scale`.
- `furniture-layer.tsx`: `<FurnitureLayer scale />`, a fragment of absolutely positioned furniture sprites with `zIndex` = their bottom edge in px, to be rendered as direct children of the stage so characters interleave with them.
- `room-labels.tsx`: `<RoomLabels scale />`, each room's name near its door.
- `public/space/CREDITS.md` plus the licence texts of every pack used.

**Sprites agent** (`src/components/teams/space/world/sprites.ts`, `public/space/characters/**`, `scripts/space/**`):
- `scripts/space/make-agent-sprites.mjs` (pngjs or sharp from the dev tree; add a dev dependency only if needed) turns the Pixel Agents character sheets into robot sheets per department (Atlas violet, Research blue, Outbound rose, Content green, Finance gold, matching the agents' orb hues in `src/lib/mock/teams.ts`), written to `public/space/characters/`. The PNGs are committed; the script documents how they were made.
- `sprites.ts`: `SHEET` (frame 16 x 32, the sheet's columns and rows), `sheetFor(id: ActorId): string` (every agent a robot in its department colour, no two agents in one room identical; each person a distinct human sheet), and `frameFor(pose, facing, step): { col; row; flip }` for Pixel Agents' layout (rows down, up, right with left mirrored; walk 0-2, type 3-4, read 5-6), plus `FRAME_MS` and the walk cycle.

**Actors agent** (`src/components/teams/space-view.tsx` and `src/components/teams/space/actors/**`, `src/components/teams/space/scene/**`):
- `space-view.tsx`: the stage (fit scale, centring, focus), composing `FloorCanvas`, `FurnitureLayer`, `RoomLabels`, the characters and the chrome layer.
- `scene/*`: the positions store (tile, facing, pose, path), the rAF loop, keyboard, click-to-walk, drag, proximity groups, the ask card trigger.
- `actors/*`: the character (`Button` + sprite), name tag, group tag, needs-you and "…" bubbles, the level-2 card, the ask card, the hint.

## 7. Rules (from the /teams plans, still in force)

- Brand tokens only; no hex, no stock palette classes in `src/components` (`npm run brand:lint-tokens`). Tabler icons only, `aria-hidden="true"` on decorative ones. No raw `<button>`, `<input>`, `<textarea>`, `<select>` or `<label>` outside `ui/`: characters are `Button`s. Never name `transform` in a `transition-[…]` list next to `translate-*` / `scale-*` / `rotate-*` utilities.
- Tangerine only on the Needs you glyph. Warning and destructive only on the paused and error glyphs. No `·` in rendered strings, sentence case, accessible names keep every fact.
- `motion` for JS animation, timed from `src/lib/motion.ts`; every animation honours reduced motion.
- Commits are made by the orchestrator. Builders do not commit, do not start dev servers, and touch only their own files.

## 8. Done means (v1)

`npx tsc --noEmit`, `npm run lint`, `npm run brand:lint-tokens` and `npm test` pass. `/teams?view=space` at 1456 x 868 in light and dark shows the whole office without scrolling, the seeded scene of §2, walking, dragging, grouping, the three disclosure levels and the ask card working in a real browser. Every other view unchanged.
