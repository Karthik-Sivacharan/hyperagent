import {
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  HALF,
  OPTICAL_SCALE,
  eyePair,
  roundEdgeCircle,
  scaleBody,
  type Point,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

/**
 * Scoop radius: half a full-width round. It is the largest scoop that still
 * leaves 0.75 module of body beside the eyes once the body is at its optical
 * size.
 */
const S = HALF / 2;

// The top side is drawn once: a quarter-circle scoop centred on the edge's
// midpoint bites its right half, leaving a blade tip where the scoop meets the
// edge. The other three sides are the same side turned 90° clockwise.
const scoop = { cx: HALF, cy: 0, r: S };
const inner = roundEdgeCircle({ x: HALF }, scoop, c, { side: 1, inside: true, pick: 1 });
const tip = roundEdgeCircle({ y: 0 }, scoop, r, { side: 1, inside: false, pick: 1 });

type Step = { to: Point } & ({ line: true } | { radius: number; sweep: 0 | 1 });

const side: readonly Step[] = [
  { line: true, to: [HALF - r, 0] },
  { radius: r, sweep: 1, to: [HALF, r] },
  { line: true, to: inner.onEdge },
  { radius: c, sweep: 0, to: inner.onCircle },
  { radius: S, sweep: 0, to: tip.onCircle },
  { radius: r, sweep: 1, to: tip.onEdge },
  { line: true, to: [W - r, 0] },
  { radius: r, sweep: 1, to: [W, r] },
];

/** A point turned 90° clockwise about the box centre, `times` times. */
function turn([x, y]: Point, times: number): Point {
  return times === 0 ? [x, y] : turn([W - y, x], times - 1);
}

function drawSides(): string {
  const out: string[] = [];
  let at: Point = [r, 0];
  for (let times = 0; times < 4; times++) {
    for (const step of side) {
      const [x, y] = turn(step.to, times);
      if ("line" in step) {
        out.push(Math.abs(x - at[0]) < 1e-9 ? `V ${y}` : Math.abs(y - at[1]) < 1e-9 ? `H ${x}` : `L ${x} ${y}`);
      } else {
        out.push(`A ${step.radius} ${step.radius} 0 0 ${step.sweep} ${x} ${y}`);
      }
      at = [x, y];
    }
  }
  return out.join(" ");
}

/**
 * A square with four quarter-circle scoops, each biting the clockwise half of
 * a side, so the silhouette turns like a pinwheel. Rotationally symmetric, no
 * mirror.
 */
export const pinwheel: GlyphShape = {
  id: "pinwheel",
  name: "Pinwheel",
  set: "original",
  body: scaleBody(`M ${r} 0 ${drawSides()} Z`, OPTICAL_SCALE.large),
  eyes: eyePair(),
  entry: { rotate: -20 },
  archetype: "A routine runner that keeps the schedule turning.",
};
