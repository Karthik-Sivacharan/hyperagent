// The characters of the /teams office: which sheet each actor wears and
// which frame of it to show (docs/plans/2026-09-11-teams-space-v1.md §6).
//
// Every sheet has Pixel Agents' layout (v1.4.1, MIT, (c) Pablo De Lucca):
// 112 x 96, 7 columns x 3 rows of 16 x 32 frames, a frame one tile wide and
// two tall. Rows face down, up and right; left is the right row mirrored.
// Columns 0-2 walk (played 0-1-2-1, column 1 is the standing frame), 3-4
// type, 5-6 read; the down-facing typing and reading frames are drawn seated.
// People wear three Pixel Agents sheets as they are. Agents wear robot sheets
// made from them by scripts/space/make-agent-sprites.mjs: a white shell with
// a visor and lit eyes, an antenna (Atlas has two), and a body in the agent's
// own orb hue, so it matches its avatar. Facing down or up, a standing
// frame's top is art row 1 for the robots (antenna tips) and Diego (spikes)
// and row 3 for Karthik and Sam; up to two rows lower facing sideways, and one
// row higher on walk frames 0 and 2.
//
// Timings are Pixel Agents' (webview-ui/src/constants.ts). Pure data and
// maths: no React rendering, no colour.

import type { CSSProperties } from "react";
import type { ActorId, Facing, Pose } from "../types";

export const SHEET = { frameW: 16, frameH: 32, cols: 7, rows: 3 } as const;

/** One walk frame, in ms (Pixel Agents' WALK_FRAME_DURATION_SEC). */
export const FRAME_MS = 150;

/** One typing or reading frame, in ms (Pixel Agents' TYPE_FRAME_DURATION_SEC). */
export const TYPE_FRAME_MS = 300;

/** The walk cycle, as sheet columns. */
export const WALK_CYCLE = [0, 1, 2, 1] as const;

/** Pixel Agents' walking pace, in art px a second: 3 tiles. The plan's office walks about twice as fast. */
export const WALK_SPEED_PX_PER_SEC = 48;

/**
 * How much lower, in art px, Pixel Agents draws a typing or reading
 * character, so it sits in its chair. It anchors every frame bottom-centre on
 * its tile's centre, so a standing frame's top edge is 24 art px above the
 * tile's top edge and a seated one's is 18.
 */
export const SITTING_OFFSET_PX = 6;

const PEOPLE: readonly ActorId[] = ["m-karthik", "m-diego", "m-sam"];
const AGENTS: readonly ActorId[] = [
  "a-atlas",
  "a-iris",
  "a-scout",
  "a-gauge",
  "a-rook",
  "a-finch",
  "a-echo",
  "a-quill",
  "a-cadence",
  "a-mosaic",
  "a-ledger",
  "a-tally",
];

/**
 * The public URL of the sheet an actor wears. An id with no sheet of its own
 * gets the fallback of its kind (a fourth person, or a neutral steel robot),
 * so a person never turns into a robot.
 */
export function sheetFor(id: ActorId): string {
  if (id.startsWith("m-")) return `/space/characters/member-${PEOPLE.includes(id) ? id : "fallback"}.png`;
  return `/space/characters/agent-${AGENTS.includes(id) ? id : "fallback"}.png`;
}

/** One frame of a sheet: its column and row, and whether to mirror it (facing left). */
export interface SpriteFrame {
  col: number;
  row: number;
  flip: boolean;
}

const ROW: Record<Facing, number> = { down: 0, up: 1, right: 2, left: 2 };

/**
 * The frame for a pose and facing. `step` counts frames of the pose (for
 * example `Math.floor(elapsedMs / FRAME_MS)` while walking, over
 * `TYPE_FRAME_MS` while typing or reading); any integer works, negatives
 * included. Idle is the standing walk frame and ignores `step`.
 */
export function frameFor(pose: Pose, facing: Facing, step: number): SpriteFrame {
  const row = ROW[facing];
  const flip = facing === "left";
  const n = Number.isFinite(step) ? Math.floor(step) : 0;
  const cycle = (length: number) => ((n % length) + length) % length;
  switch (pose) {
    case "walk":
      return { col: WALK_CYCLE[cycle(WALK_CYCLE.length)], row, flip };
    case "type":
      return { col: 3 + cycle(2), row, flip };
    case "read":
      return { col: 5 + cycle(2), row, flip };
    case "idle":
      return { col: WALK_CYCLE[1], row, flip };
  }
}

/** A frame's `background-position` at `scale` CSS px per art px, for a loop that swaps frames through a ref. */
export function framePosition(frame: SpriteFrame, scale: number): string {
  return `${-frame.col * SHEET.frameW * scale}px ${-frame.row * SHEET.frameH * scale}px`;
}

/**
 * The style of an element showing one frame at `scale` CSS px per art px:
 * its size, the sheet as a background scaled to match, the frame's position,
 * and pixelated rendering. It never sets `transform`: the caller mirrors a
 * `flip` frame with `scaleX(-1)`, on this element or a wrapper, whichever
 * carries no positioning transform. A frame mirrors about its own centre, so
 * the character stays on its tile.
 */
export function spriteStyle(src: string, frame: SpriteFrame, scale: number): CSSProperties {
  const width = SHEET.frameW * scale;
  const height = SHEET.frameH * scale;
  return {
    width,
    height,
    backgroundImage: `url(${src})`,
    backgroundSize: `${SHEET.cols * width}px ${SHEET.rows * height}px`,
    backgroundPosition: framePosition(frame, scale),
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  };
}
