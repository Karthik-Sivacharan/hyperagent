import {
  BAND,
  CONCAVE_RADIUS as c,
  HALF,
  OPTICAL_SCALE,
  eyePair,
  scaleBody,
  type Point,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

/** Lobe radius: a 4-module band, so each lobe is 8 modules across. */
const lobe = BAND;
/** The lower lobes sit 3 modules either side of the axis and touch the box sides. */
const spread = HALF - BAND;
/** Height from the lower lobe centres up to the top one: an equilateral triangle. */
const rise = spread * Math.sqrt(3);
/** Top of the drawing, which centres it vertically in the box. */
const top = (W - rise - 2 * lobe) / 2;

const centres = {
  top: [HALF, top + lobe],
  right: [HALF + spread, top + lobe + rise],
  left: [HALF - spread, top + lobe + rise],
} satisfies Record<string, Point>;
const centroid: Point = [HALF, top + lobe + (2 * rise) / 3];

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The concave round where lobes `p` and `q` meet on the outside: its centre is
 * `lobe + c` from both centres, on their bisector, away from the centroid.
 * Returns the tangent point on `p`, then on `q`.
 */
function cusp(p: Point, q: Point): [Point, Point] {
  const mid: Point = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const half = Math.hypot(q[0] - p[0], q[1] - p[1]) / 2;
  const reach = Math.sqrt((lobe + c) ** 2 - half ** 2);
  let n: Point = [-(q[1] - p[1]) / (2 * half), (q[0] - p[0]) / (2 * half)];
  if ((mid[0] - centroid[0]) * n[0] + (mid[1] - centroid[1]) * n[1] < 0) n = [-n[0], -n[1]];
  const f: Point = [mid[0] + n[0] * reach, mid[1] + n[1] * reach];
  const k = lobe / (lobe + c);
  const on = (o: Point): Point => [round(o[0] + (f[0] - o[0]) * k), round(o[1] + (f[1] - o[1]) * k)];
  return [on(p), on(q)];
}

const [topRight, rightTop] = cusp(centres.top, centres.right);
const [rightBottom, leftBottom] = cusp(centres.right, centres.left);
const [leftTop, topLeft] = cusp(centres.left, centres.top);

/**
 * Three 8-module lobes on an equilateral triangle: a head lobe over two foot
 * lobes. Symmetric under third turns and mirrored left to right.
 */
export const trefoil: GlyphShape = {
  id: "trefoil",
  name: "Trefoil",
  set: "original",
  body: scaleBody(
    `M ${HALF} ${round(top)} A ${lobe} ${lobe} 0 0 1 ${topRight[0]} ${topRight[1]}
     A ${c} ${c} 0 0 0 ${rightTop[0]} ${rightTop[1]}
     A ${lobe} ${lobe} 0 1 1 ${rightBottom[0]} ${rightBottom[1]}
     A ${c} ${c} 0 0 0 ${leftBottom[0]} ${leftBottom[1]}
     A ${lobe} ${lobe} 0 1 1 ${leftTop[0]} ${leftTop[1]}
     A ${c} ${c} 0 0 0 ${topLeft[0]} ${topLeft[1]}
     A ${lobe} ${lobe} 0 0 1 ${HALF} ${round(top)} Z`,
    OPTICAL_SCALE.large,
  ),
  eyes: eyePair(),
  entry: { scaleX: 0.96, scaleY: 1.05, translateY: -5 },
  archetype: "A researcher that pulls its sources together into one answer.",
};
