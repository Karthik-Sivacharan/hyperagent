# Agent glyphs

An agent glyph is a solid geometric silhouette with two eyes. It is drawn on a 14-module grid and shown in a rounded-square tile, and it can morph into any other glyph. This page covers where the glyphs go, the two shape sets, the grammar and contract every shape follows, how to add a shape, the component API, how a transition works and the preview page. Written 2026-09-15 on `feat/agent-glyphs`.

- Code: `src/components/brand/agent-glyph/`. Import from its `index.ts`.
- Preview: `/design/glyphs` (§10).
- Tests: `src/components/brand/agent-glyph/agent-glyph.test.ts`.
- Research: `docs/research/15-agent-glyphs/` holds the captures and measurements the grammar came from. It is git-ignored, so it lives on the maintainer's machine and not in the repo.

## 1. What a glyph is for

A glyph is an agent's mark. The silhouette tells agents apart at avatar size, and because every glyph has the same eyes, the family reads as one character. Glyphs are brand artwork, like the mark in `src/components/brand/mark.tsx`, not icons: the Tabler-only rule in `docs/brand/icons.md` does not cover them, and a glyph never stands in for an action icon.

Where they are meant to go. None of these is wired up yet (see `HANDOFF.md`).

| Where | Size | Component | Tone, pace | Notes |
|---|---|---|---|---|
| Landing hero roster (one row per agent) | 24px | `AgentGlyph`, or `MorphingAgentGlyph` if the row's agent changes | `sand`, `quick` | The agent's name sits beside it, so no `label` |
| Landing team section | 40px | `AgentGlyph` | `sand` | One tile per agent |
| Landing use-case tabs | 40px | `AgentGlyph` or `MorphingAgentGlyph` | `sand`, `quick` | Twenty agents share nine shapes, so the tab's name carries identity. The preview's Roster section is this case |
| Landing closing band | 64 to 96px | `MorphingAgentGlyph` | `ink` on the dark band, `expressive` (the default from 64px) | Glances are fine at this size |
| A landing hero or feature row | fills its column | `GlyphStage` | any tone, always `expressive` | Loops the shipping set |
| Product avatars in lists, sheets and chips | 20 to 40px | `AgentGlyph` | `sand` | No `label` next to a visible name |

Rules for using them:

- Give an agent one shape and keep it wherever that agent appears.
- Use `tangerine` or `accent` at most once per view. They have the same budget as the brand's orange button.
- A bare glyph (`tile={false}`) still paints its eyes in the tone's tile colour, so put it only on a surface of that colour.
- Small sizes lose the eyes first. The eye is 14.17 units in a 180-unit tile, so it draws at 1.26px in a 16px tile, 1.89px at 24px, 3.15px at 40px and 7.56px at 96px. Below 24px the silhouette does all the work.

## 2. The two sets

`STUDY_SHAPES` (`shapes/study/`) are rebuilds of the eight reference drawings, each redrawn on the grid. They exist to learn the grammar: every constant in §3 was measured on them, and rebuilding all eight showed the constants can draw a whole family. `ORIGINAL_SHAPES` (`shapes/original/`) are new silhouettes built from the same grammar, and they are the only set the product ships. `defaultSequence()` returns the originals, so a `MorphingAgentGlyph` or `GlyphStage` with neither `shape` nor `sequence` loops them.

Both sets are registered so the preview can compare them, which means `getGlyph("cog")` resolves. No test stops product code from passing a study id, so that is a review rule: product code names original ids only. Do not add to the study set, and do not edit a study shape toward a new design. Draw an original instead.

The originals, in loop order. Eye row is the eye-centre height in box units; scale is the `OPTICAL_SCALE` step (§3).

| # | `id` | Silhouette | Scale | Eye row | `entry` | `archetype` |
|---|---|---|---|---|---|---|
| 1 | `fork` | Two 4-module prongs on a full-width face band, carried to the floor by a centre stem | full | 62.5 | scaleX 1.08 | Catches what comes in, requests and signals, and sorts it for you. |
| 2 | `bell` | A narrow dome on a short neck that flares through two concave quarter circles onto a full-width band | large | 57 | rotate -8 | Rings when something falls due, then chases it. |
| 3 | `hammerhead` | A full-width head band on two 4-module legs with a 1-module slot between them | medium | 47.38 | rotate -5, translateY -3 | Chases people and suppliers until the answer comes back. |
| 4 | `sweep` | A 7-module band bent a quarter turn around the bottom-left corner | full | 64 | translateX 4, translateY -4 | A reporter that sends the week's brief out to everyone. |
| 5 | `slot-stack` | Three 4-module blocks on a spine, split by 1-module slots cut in from both sides | large | 67.62 | scaleY 0.93, translateY 4.7 | Keeps the records in order: ledgers, invoices, logs. |
| 6 | `portal` | A full-width semicircle on straight sides, with a round-topped doorway between two band-wide legs | large | 56 | scaleY 0.93, translateY 4.7 | The doorway between your tools: carries work from one to the next. |
| 7 | `pinwheel` | A square with a quarter-circle scoop biting the clockwise half of each side | large | 60 | rotate -20 | A routine runner that keeps the schedule turning. |
| 8 | `trefoil` | Three 8-module lobes on an equilateral triangle, a head lobe over two foot lobes | large | 60 | scaleX 0.96, scaleY 1.05, translateY -5 | A researcher that pulls its sources together into one answer. |
| 9 | `folio` | A page with its top-right corner turned: the full box less one 5-module scoop centred on that corner. Added 2026-09-18 as Wiki Agent's face (`src/components/wiki/wiki-agent.ts`) | small | 64 | rotate -6 | A librarian that reads every page, finds what disagrees and asks you to settle it. |

The order alternates block and curve and moves the mass between top and bottom (top-heavy fork, then bottom-heavy bell), so every step of the loop is a visible change. Folio closes the loop as the one near-solid block, between trefoil's round lobes and fork's open prongs.

Two alternates are kept as files but left out of `ORIGINAL_SHAPES`. That also keeps them out of the registry: `getGlyph` does not know them and the preview does not show them. Both pass `glyphIssues` today. To try one in the loop, import it in `shapes/original/index.ts` and put it in the list; the tests then cover it.

| `id` | Silhouette | Scale | Eye row | `entry` | Why it is out |
|---|---|---|---|---|---|
| `step-tower` | Three tiers, 6, 10 and 14 modules wide, on three 4-module feet | large | 65.24 | scaleX 0.97, scaleY 1.05, translateY -4 | Reads too close to bell when small |
| `turbine` | A disc with three scoops cut into its rim at thirds | large | 60 | rotate -30 | A second spinner beside pinwheel |

The study set loops in this order: `cog`, `notched-block`, `plug-arrow`, `dome-walker`, `pedestal`, `arch-ghost`, `orb-stems`, `hourglass`.

## 3. The grammar

One module is 10 units and the drawing box is 140 × 140. A body is drawn on the full 14-module grid with these constants in template literals, then shrunk to its optical size. The first three live in `types.ts`, the rest in `grammar.ts`.

| Constant | Value | Meaning |
|---|---|---|
| `MODULE` | 10 | Units per grid module |
| `GRID_MODULES` | 14 | Modules across the box |
| `GLYPH_BOX` | 140 | Edge of the drawing box in units |
| `CENTRE` | 70 | Centre of the box on both axes |
| `BAND` | 40 (4 modules) | The main stroke: horns, tabs, legs, stems, plugs |
| `SLOT` | 10 (1 module) | The gap between two bands |
| `POST` | 34 (3.4 modules) | A post a little narrower than a band: the cog's teeth, the dome walker's centre foot |
| `CENTRE_BAND_START`, `CENTRE_BAND_END` | 50, 90 | The centre band, modules 5 to 9. Tabs, stems and plugs sit on it |
| `HALF` | 70 (7 modules) | Radius of a full-width semicircle |
| `SCOOP` | 50 (5 modules) | Radius of a 5-module round: quarter-circle scoops centred on the box corners, end caps |
| `INNER_ARC` | 30 (3 modules) | An arc concentric with a `HALF` arc, so the two bound a 4-module band |
| `CORNER_RADIUS` | 4 (0.4 module) | The one convex corner radius |
| `CONCAVE_RADIUS` | 3 (0.3 module) | The round where a band meets a body. Kept tighter than the corners, because a bigger round eats a narrow slot's depth |
| `OPTICAL_SCALE` | `full` 1, `large` 20/21 (0.952), `medium` 19/21 (0.905), `small` 18/21 (0.857) | How much a body shrinks about the box centre (below) |
| `EYE_SIZE` | 14.167 (17/12 module) | Eye width and height |
| `EYE_RADIUS` | 2.5 (1/4 module) | Eye corner radius |
| `EYE_SPACING` | 35 (3.5 modules) | Distance between the eye centres |
| `EYE_ROW_Y` | 60 | Default eye-centre height, one module above centre. Each shape moves its pair to its own face zone: 38.75 (hourglass) to 69.5 (orb stems) in the study set, 47.38 (hammerhead) to 67.62 (slot stack) in the originals |
| `BLINK_HEIGHT` | 3.54 (a quarter of the eye) | A closed eye in the grammar. The runtime does not read it: blinks use `BLINK_SCALE`, 0.23, in `choreography.ts` |
| `EYE_CLEARANCE` | 7.5 (0.75 module) | Body to keep around each eye. `validate.ts` checks its own `EYE_MARGIN` of 0.7 module, which allows for rounding |

The helpers in `grammar.ts`:

- `eyePair(cy = EYE_ROW_Y, cx = CENTRE)` returns `[left, right]`, level, centred on `cx` at height `cy`.
- `roundEdgeCircle(edge, circle, r, { side, inside, pick })` gives the two tangent points of a round of radius `r` where a straight edge meets a circle. `roundCircleCircle` does the same where two circles meet (a slot between two arcs, a waist between two bowls).
- `scaleBody(d, k)` scales an absolute path about the box centre. Radii scale; rotation and flags do not, so arcs stay circular. It rounds to 3 decimals and throws on a relative command.

**Optical size.** An open, toothy silhouette looks smaller than a solid one of the same width. So every body is drawn full size and then scaled in steps of 1/21 of the box. The steps come from widths measured on the reference drawings, from 140 for the cog down to 119.8 for the hourglass:

- `full`: open shapes with a lot of background between the parts (fork, sweep, cog).
- `large`: blocky shapes that fill their square (bell, slot stack, portal, pinwheel, trefoil, notched block, plug arrow).
- `medium`: rounded shapes (hammerhead, arch ghost, orb stems, pedestal, dome walker).
- `small`: the most compact, heaviest shape (hourglass).

**Eyes are never scaled.** `scaleBody` touches the body only. The eyes are placed afterwards with `eyePair`, in final box coordinates. Every glyph has the same eyes at the same absolute size and spacing, and that shared pair is what makes sixteen different bodies read as one character. It also means a morph only moves the eyes and never resizes them.

## 4. The shape contract

A `GlyphShape` (`types.ts`) has an `id` (kebab-case, unique across both sets), a `name`, a `set`, a `body`, `eyes` as `[left, right]`, and optionally an `entry` pose and an `archetype` line. One shape per file: `shapes/<set>/<id>.ts` exporting `const <camelId>: GlyphShape`.

`glyphIssues(shape)` in `validate.ts` returns each broken rule as a sentence, or an empty array. These rules are what let any two shapes morph:

1. **One closed subpath.** One `M`, one `Z` at the end, no holes and no second `M`.
2. **Absolute `M L H V A Z` only.** No `C`, `Q`, `S` or `T` and no lowercase (relative) commands. Arcs draw every round: semicircles, scoops, corner rounds.
3. **The start point** is the left end of the topmost edge. The `M` sits on the outline's smallest y, at the leftmost authored vertex on that line (0.01 unit tolerance). A shape whose top is a single point starts on it: the bell's dome, the portal's crown, the trefoil's head.
4. **Clockwise on screen** (y grows down), which means a positive shoelace area.
5. **In the box and centred.** Nothing leaves the 140 box (0.05 unit tolerance), and the bounding box is centred to within 0.5 unit on both axes. A body drawn centred on the grid stays centred through `scaleBody`, which scales about the centre.
6. **Eyes inside with clearance.** Both eyes sit wholly inside the body with 0.75 module of body around each (checked at 0.7), and `eyes[0]` is left of `eyes[1]`.
7. **Entry pose limits.** During a cut, `entry` transforms the body alone, about its bounding-box centre; the eyes do not take the pose. The posed body must therefore still cover both eyes. Today's poses stay within rotate -30 to 0.5 degrees, scale 0.925 to 1.095 on either axis, and 5 units of translation. Only the rotationally symmetric shapes turn past 12 degrees (pinwheel -20, turbine -30), where a turn reads as spin rather than tilt. Keep a new pose inside that range. The test suite checks a cut's eyes against the authored body, not the posed one, so check the pose in the playground (§5, step 8).

## 5. Adding a shape

1. **Draw on the grid.** Sketch the silhouette on 14 × 14 modules using bands, slots, full-width semicircles and scoops. Compare it with the originals and the reference drawings before writing code: a new shape must not be a copy of either.
2. **Write the file.** Create `shapes/original/<id>.ts` with `set: "original"`. Build `body` as a template literal from the §3 constants on the full 140 grid. Round convex corners with `CORNER_RADIUS` (arc sweep flag 1) and concave junctions with `CONCAVE_RADIUS` (sweep flag 0). Where a straight edge or a round meets a circle, take the tangent points from `roundEdgeCircle` or `roundCircleCircle`, rounded to 3 decimals. Start at the left end of the topmost edge and run clockwise.
3. **Pick the optical size.** Wrap the path in `scaleBody(d, OPTICAL_SCALE.<step>)`, choosing the step by how much background the silhouette holds (§3).
4. **Place the eyes.** `eyes: eyePair(cy)` in final box units. Move `cy` until both eyes have 0.75 module of body on every side.
5. **Add `entry` and `archetype`.** Keep the pose small (§4, rule 7). The archetype is one line naming the kind of agent the shape suits.
6. **Register it.** Add it to `ORIGINAL_SHAPES` in `shapes/original/index.ts`, at a place where its neighbours differ from it (block against curve, mass high against low). The registry picks it up from there.
7. **Run the contract.** `glyphIssues(shape)` must return `[]`. The Sizes section of `/design/glyphs` lists any issues under the specimen, and `npm test` runs the check for every registered shape along with the pair tests (§11).
8. **Check the motion.** In the playground, morph and cut the new shape to and from its loop neighbours and a few distant shapes, at both paces. Freeze with `?t=` or the filmstrip and look for folds, slivers and eyes near an edge. For the cut, scrub through 60 to 220ms at the expressive pace, where the entry pose holds, and confirm both eyes stay on the posed body.
9. **Check 16px distinctness.** In the Sizes section, read the new shape's 16px and 24px specimens against every original and every study shape, in `sand` and `ink`. If it could be taken for one of them at a glance, redraw it or keep it as an alternate. This check is by eye; no test measures it. `step-tower` failed it against `bell`.
10. **Run the gates.** `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run brand:lint-tokens`.

## 6. Components

```tsx
import { AgentGlyph, GlyphStage, MorphingAgentGlyph } from "@/components/brand/agent-glyph";

<AgentGlyph shape="fork" size={24} />
<MorphingAgentGlyph shape={selectedId} size={40} />
<GlyphStage tone="ink" className="rounded-xl" />
```

### `AgentGlyph`

A glyph at rest: the authored outline and eyes, with no motion and no client code, so it is safe in a server component.

| Prop | Default | What it does |
|---|---|---|
| `shape` | required | A `GlyphShape` or its registry id. An unknown id throws |
| `size` | 40 | Edge length in px. Always square |
| `tone` | `"sand"` | Colourway (below) |
| `tile` | `true` | Draw the rounded-square tile. Without it the eyes are still painted in the tile colour |
| `label` | none | Accessible name: the SVG gets `role="img"` and `aria-label`. Omitted, the SVG is `aria-hidden`, which is the avatar case |
| `className` | none | On the `<svg>` |

### `MorphingAgentGlyph`

A client component that changes shape. It server-renders the first shape's drawing, then a `motion` clock drives the transitions and writes the outline and eyes straight to the SVG. It takes `size`, `tone`, `tile`, `label` and `className` as `AgentGlyph` does, plus these motion props, which `GlyphStage` shares:

| Prop | Default | What it does |
|---|---|---|
| `shape` | none | Controlled: the shape to show. A change plays the choreography from whatever is on screen, even mid-transition. Wins over `sequence` |
| `sequence` | the originals, when neither `shape` nor `sequence` is set | Autoplay: loop through these shapes or ids. Compared by id, so a rebuilt array with the same ids does not restart the loop |
| `choreography` | `"morph"` | `"morph"`, a true tween, or `"cut"`, a hard cut into the entry pose and a settle |
| `pace` | `"expressive"` from 64px up, `"quick"` below | How fast and how much (§7) |
| `hold` | 1100 | Milliseconds at rest on each shape in a loop (`DEFAULT_HOLD_MS`) |
| `blink` | `true` | Blink now and then at rest |
| `glance` | `false` | Glance aside now and then at rest. Keep it for 64px and up |
| `paused` | `false` | Stops the loop clock, blinks and glances. A running transition still finishes |
| `progress` | none | Freeze on the transition from `from` to `shape` at this linear time, 0 to 1. Needs `shape`. Turns off autoplay, blinks and glances. For scrubbers and screenshots |
| `from` | `shape` | Where a frozen transition starts |
| `onSettle` | none | `(shape) => void`, called each time the glyph comes to rest on a shape |

A loop step is `hold` plus the transition: 1580ms a shape at the expressive pace and 1320ms at the quick one, so the nine originals come round every 14.2s or 11.9s.

After mount, React never rewrites the animated attributes. Move a glyph through `shape`, `sequence` or `progress`. A new `key` remounts it at its first shape, which is how the playground's Play button restarts a transition.

### `GlyphStage`

The landing presentation: a dot-grid field in the tone's tile colour, the glyph, and four square corner marks that ease to the body's bounding box as it changes shape. It takes the motion props (it loops the originals unless given `shape` or `sequence`), plus `tone` (default `"sand"`), `label` and `className`.

- It has no `size`. It fills its width at 15:11, so size it from the parent or through `className`, which is also where rounding and a shadow go.
- `pace` defaults to `"expressive"` at any width.
- In glyph units the field is 300 × 220 with the drawing box centred. The corner squares are 1.2 modules and sit 1.4 modules clear of the bounding box. The dots are 1.5px on a 13px pitch in CSS pixels, so the grid does not scale with the stage.
- `label` goes on the stage's `div` as `role="img"`. Without it the stage is `aria-hidden`.

### Tones

| Tone | Tile, eyes, stage field | Body, stage corners | Stage dots | Use |
|---|---|---|---|---|
| `sand` | `--color-neutral-100` | `--color-neutral-950` | `--color-neutral-300` | The default: paper tile, ink body |
| `ink` | `--color-neutral-950` | `--color-neutral-100` | `--color-neutral-800` | The inverse, for dark bands |
| `tangerine` | `--color-tangerine-500` | `--color-neutral-950` | `--color-tangerine-400` | The accent, once per view |
| `accent` | `--color-neutral-100` | `--color-tangerine-500` | `--color-neutral-300` | The accent as the mark, for a bare glyph in a line of type |

Tones read the brand ramps directly rather than the theme-mapped semantics, so an agent looks the same in the light and the dark theme. The eyes are painted in the tile colour: they read as holes without being holes. The tile is 180 units (the box plus 2 modules a side) with a 40-unit radius, 22% of its edge.

`index.ts` also exports the registry (`ALL_GLYPHS`, `GLYPH_SETS`, `getGlyph`, `findGlyph`, `resolveGlyph`, `defaultSequence`), the engine (`planTransition`, `frameAt`, `restSnapshot`, `PACE_TIMING`, `TRANSITION_MS`, `defaultPace`, `CHOREOGRAPHIES`, `GLYPH_PACES`), `glyphIssues`, `GLYPH_TONES`, `TONE_PALETTES` and `DEFAULT_HOLD_MS`.

## 7. How a transition works

`planTransition(from, to, choreography, pace)` in `choreography.ts` does the per-pair work once, and `frameAt(plan, t)` returns what to draw at linear time `t`. Both are pure TypeScript with no DOM and no clock, so the component, the playground's filmstrip and the tests all read the same frames. Easing lives inside `frameAt`, per channel; the clock itself runs linear.

### Morph

1. **Resample.** The authored body is parsed, flattened (arcs in steps of 2 degrees or less), made clockwise and resampled to 240 points evenly spaced by arc length (`SAMPLE_COUNT`).
2. **Least-travel alignment.** `alignOffset` picks the cyclic shift that minimises the summed squared distance between the two point lists. A banded warp then lets the pairing slide locally (band 1/6 of the outline, off-diagonal steps cost one squared sample spacing), so a tooth or slot that only one shape has shares partners with its neighbours instead of being dragged across the body. The result is resampled back to 240 pairs.
3. **Arrival.** Each point's remaining distance falls as (1 - p)^(1.5 + 1.5 × travel), where p is the eased progress and travel is the point's journey, smoothed along the outline and normalised to the longest. Long journeys land first, so the target is crisp while the short hops finish. The tests hold both paces to within 0.5 unit of the target drawing at half the clock.
4. **Softening** (expressive pace only). Both ends are pre-smoothed with 10 passes of ¼ ½ ¼ neighbour averaging and blended in by sin³(πp), a short window around the fastest moment. At that moment the body is also 1.5% smaller about its moving centre. The folds melt while the outline is moving too fast to read as a blob.
5. **Eye carry.** The eyes trail the body by 60ms at the expressive pace (0 at quick) on ease-out-quart. If a trailing eye would leave the in-between body (tested at a 3 × 3 grid of points half a unit outside the eye), six steps of bisection push the pair toward its target just far enough to fit.
6. **Rest.** At t = 1 the glyph draws the target's authored `body`, so every still frame is the crisp drawing. A change that arrives mid-morph starts the next plan from the polygon on screen.

The stage corners follow a box interpolated between the two bounding boxes on the body's curve. The in-between path is written to tenths of a unit and filled nonzero, so an outline that crosses itself still paints solid.

### Cut

The cut follows the reference timing. At the expressive pace the frame starts moving first. The body then swaps to the target's authored drawing held in its full `entry` pose, drops to 15% of the pose, and comes to rest, with no in-between drawings. If the old eyes fit wholly inside the new body they hold their place for a beat after the swap; otherwise they jump with it.

| | `expressive` | `quick` |
|---|---|---|
| Frame's move (whole transition) | 480ms | 220ms |
| Body swaps at | 60ms | 0ms |
| Full entry pose holds | 160ms | 80ms |
| 15% of the pose holds | 120ms | 60ms |
| At rest from | 340ms | 140ms |
| Eyes hold after the swap | 80ms | 40ms |

### Paces

`expressive` is for the landing stage and anything at hero size. `quick` is for an avatar in a list changing state, where a change must be fast and quiet. `defaultPace(size)` picks `expressive` at 64px and up.

| `PACE_TIMING` | `expressive` | `quick` |
|---|---|---|
| `durationMs` | 480 (`--duration-slide`) | 220 (`--duration-move`) |
| `ease` (body and frame) | ease-out-quint | ease-out-quart |
| `eyeEase` | ease-out-quart | ease-out-quart |
| `eyeDelayMs` | 60 | 0 |
| `softPasses` | 10 | 0 |
| `dip` | 0.015 | 0 |
| `arrival`, `lead` | 1.5, 1.5 | 1.5, 1.5 |
| `cutAtMs`, `cutHoldMs`, `cutSettleMs` | 60, 160, 120 | 0, 80, 60 |
| `cutSettleWeight` | 0.15 | 0.15 |
| `cutEyeLagMs` | 80 | 40 |
| `blinkEveryMs` | 2800 to 6400 | 4000 to 9000 |

### Blinks and glances

A blink flattens both eyes to 23% of their height about their own centres, instantly, for 80 to 120ms. One blink in six is a double: the second comes 150ms later and lasts 80ms.

A glance moves the eyes 3 units aside (2 units up, one time in four) over 150ms on ease-out-quart, holds for 480 to 1000ms, and brings them back. Inside a loop the hold is cut short, so the eyes are home before the next change.

In a loop, about every other hold has a blink 30 to 65% of the way through, and a hold without a blink glances half the time when `glance` is on. A lone glyph (a controlled `shape`) idles on the pace's `blinkEveryMs` instead; with `glance` on, about a third of those idles are glances, or all of them if `blink` is off.

## 8. Performance

A running transition costs no React render. `GlyphController` (`glyph-controller.ts`, wired up by `useGlyphMotion`) writes `d`, `transform` and the eye attributes through refs, skips any attribute that has not changed, and updates the stage's corners only when the box moves.

The clock stops while nobody can see the glyph: an `IntersectionObserver` on the SVG covers scrolling offscreen and the `visibilitychange` event covers a hidden tab. A transition already running finishes, no idle timers run, and a shape change lands straight at rest without planning a tween. The idle schedule starts again when the glyph is back in view.

Work is shared between glyphs. A shape's sampled outline is computed once per shape object. A plan that starts from rest is cached per source shape, target, choreography and pace, so a roster of twenty changing on one beat plans each pair once. Bezier functions are cached too. Every glyph writes its in-between polygon into the same two scratch buffers, within one synchronous call. Smoothing is linear, so it runs once on each pair's ends instead of on every frame.

The quick pace skips softening, because below about 64px a fold is under a pixel, and its blinks are rarer so that twenty avatars on one page do not twitch.

## 9. Reduced motion

Under `prefers-reduced-motion` (read with `motion`'s `useReducedMotion`):

- A controlled change has no tween. The glyph fades out over 90ms (`--duration-exit`), swaps to the target at rest, and fades in over 140ms (`--duration-enter`), both on ease-out.
- No blinks and no glances.
- An autoplay loop does not advance. It holds the shape it is on, which is the first one on load.
- A frozen `progress` frame still draws, so screenshots work either way.

## 10. The preview page

`/design/glyphs` (`src/app/design/glyphs/page.tsx`, parts in `agent-glyph/preview/`) has a Tone switch and a Light/Dark theme switch in its header, then four sections:

- **Stage.** `GlyphStage` looping a set at the expressive pace, with toggles for the set (Study or Original), the choreography, glances and pause. The loop order is listed beside it, with the current shape highlighted.
- **Playground.** From and To pickers across both sets, a swap button, and choreography and pace toggles. The transition plays in a 240px glyph, a stage, and 96, 40 and 24px glyphs side by side. Play runs it live. The scrubber freezes every view: arrow keys move 1/48 of the transition, Page Up and Page Down ten steps, Home and End jump to the ends. The 13-frame filmstrip samples the same transition 40ms apart at the expressive pace (about 18ms at quick); pick a frame to freeze on it.
- **Roster.** Twenty 40px glyphs at the quick pace, each looping the originals from a staggered starting shape, all changing on the same beat. This is the busiest a landing page gets.
- **Sizes.** Every registered shape at 240, 96, 40, 24 and 16px in the chosen tone, with its name, id, archetype and any `glyphIssues` in red.

The query string presets the playground, so a frame can be linked or screenshotted:

| Param | Values | Effect |
|---|---|---|
| `from`, `to` | any registered id | The pair. A missing or unknown id falls back to `cog` and `arch-ghost` |
| `t` | 0 to 1, clamped | Freezes every playground view at that linear time. Without it the playground rests on `to` (t = 1) |
| `choreo` | `morph`, `cut` | The choreography. Anything else is ignored |
| `tone` | `sand`, `ink`, `tangerine`, `accent` | The starting tone |

Pace and theme have no parameter; the playground opens at the expressive pace. Example: `/design/glyphs?from=fork&to=bell&t=0.25&choreo=cut&tone=ink` freezes at 120ms, inside the entry-pose hold.

## 11. Tests and gates

`agent-glyph.test.ts` (vitest, node) covers the parser, flattening, sampling, alignment and warping; easing and frames, including the cut's hold, a transition started mid-morph, shared plans and early arrival; the pace ceilings (quick at 300ms or less, every cut at rest before its transition ends) and the size default; blinks; the contract checks on two fixtures and on broken bodies; and the registry. Three checks then sweep the registry:

- every registered shape returns `[]` from `glyphIssues`;
- every ordered pair, the two fixtures included, morphs to 240 finite points at t = 0.1, 0.5 and 0.9;
- for every ordered pair of registered shapes, at both paces and in both choreographies, both eye centres stay on the body, sampled every 20ms.

Before a glyph change is done: `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run brand:lint-tokens` (tones must stay on brand variables, never raw colours).
