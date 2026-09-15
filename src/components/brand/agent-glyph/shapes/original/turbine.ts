import {
  CENTRE,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  HALF,
  OPTICAL_SCALE,
  eyePair,
  roundEdgeCircle,
  scaleBody,
  type Point,
} from "../../grammar";
import type { GlyphShape } from "../../types";

/** Scoop radius: half the disc's radius, the same scoop as the pinwheel's. */
const S = HALF / 2;

// One unit is drawn at the top and turned by thirds. The scoop is centred where
// the disc's rim crosses the vertical axis and bites the clockwise side of it,
// so the unit reads: rim, corner, straight cut down the radius, concave round,
// scoop, corner, back onto the rim.
const disc = { cx: CENTRE, cy: CENTRE, r: HALF };
const scoop = { cx: HALF, cy: 0, r: S };
const lip = roundEdgeCircle({ x: HALF }, disc, r, { side: -1, inside: true, pick: -1 });
const floor = roundEdgeCircle({ x: HALF }, scoop, c, { side: 1, inside: true, pick: 1 });

// Where the scoop leaves the rim: a corner round r inside the disc and outside
// the scoop, so its centre is HALF - r from the disc centre and S + r from the
// scoop centre (both centres lie on the vertical axis).
const gap = disc.cy - scoop.cy;
const exitY = scoop.cy + ((S + r) ** 2 - (HALF - r) ** 2 + gap ** 2) / (2 * gap);
const exitCentre: Point = [HALF + Math.sqrt((S + r) ** 2 - (exitY - scoop.cy) ** 2), exitY];
const along = (from: typeof disc, radius: number): Point => {
  const k = radius / Math.hypot(exitCentre[0] - from.cx, exitCentre[1] - from.cy);
  return [from.cx + (exitCentre[0] - from.cx) * k, from.cy + (exitCentre[1] - from.cy) * k];
};
const exitOnScoop = along(scoop, S);
const exitOnRim = along(disc, HALF);

const round = (n: number) => Math.round(n * 1000) / 1000;

/** `p` turned clockwise about the box centre by `thirds` × 120°. */
function turn([x, y]: Point, thirds: number): Point {
  const a = (thirds * 2 * Math.PI) / 3;
  const dx = x - CENTRE;
  const dy = y - CENTRE;
  return [round(CENTRE + dx * Math.cos(a) - dy * Math.sin(a)), round(CENTRE + dx * Math.sin(a) + dy * Math.cos(a))];
}

function drawUnits(): string {
  const out: string[] = [];
  for (let k = 0; k < 3; k++) {
    const at = (p: Point) => turn(p, k).join(" ");
    out.push(
      `A ${r} ${r} 0 0 1 ${at(lip.onEdge)}`,
      `L ${at(floor.onEdge)}`,
      `A ${c} ${c} 0 0 0 ${at(floor.onCircle)}`,
      `A ${S} ${S} 0 0 0 ${at(exitOnScoop)}`,
      `A ${r} ${r} 0 0 1 ${at(exitOnRim)}`,
      `A ${HALF} ${HALF} 0 0 1 ${turn(lip.onCircle, k + 1).join(" ")}`,
    );
  }
  return out.join(" ");
}

/**
 * A disc with three scoops cut into its rim at thirds, each on the clockwise
 * side of its radius, so the silhouette spins like a rotor. Symmetric under
 * third turns, no mirror.
 */
export const turbine: GlyphShape = {
  id: "turbine",
  name: "Turbine",
  set: "original",
  body: scaleBody(`M ${turn(lip.onCircle, 0).join(" ")} ${drawUnits()} Z`, OPTICAL_SCALE.large),
  eyes: eyePair(),
  entry: { rotate: -30 },
  archetype: "A tracker that keeps churning through updates all day.",
};
