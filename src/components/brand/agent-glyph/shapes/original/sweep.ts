import {
  CORNER_RADIUS as r,
  HALF,
  OPTICAL_SCALE,
  eyePair,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

// Both arcs are centred on the bottom-left corner of the box: a 14-module
// quarter circle with a 7-module quarter circle scooped out of it. All four
// corners of the band are right angles, rounded with the convex radius.
const outer = { cx: 0, cy: W, r: W };
const inner = { cx: 0, cy: W, r: HALF };
const topLeft = roundEdgeCircle({ x: 0 }, outer, r, { side: 1, inside: true, pick: -1 });
const bottomRight = roundEdgeCircle({ y: W }, outer, r, { side: -1, inside: true, pick: 1 });
const innerBottom = roundEdgeCircle({ y: W }, inner, r, { side: -1, inside: false, pick: 1 });
const innerLeft = roundEdgeCircle({ x: 0 }, inner, r, { side: 1, inside: false, pick: -1 });

const round = (n: number) => Math.round(n * 1000) / 1000;
const pt = ([x, y]: readonly [number, number]) => `${round(x)} ${round(y)}`;

/**
 * A 7-module band bent through a quarter turn around the bottom-left corner,
 * facing up and to the right. Mirror-symmetric about that diagonal only.
 */
export const sweep: GlyphShape = {
  id: "sweep",
  name: "Sweep",
  set: "original",
  body: scaleBody(
    `M ${pt(topLeft.onCircle)} A ${W} ${W} 0 0 1 ${pt(bottomRight.onCircle)}
     A ${r} ${r} 0 0 1 ${pt(bottomRight.onEdge)}
     H ${round(innerBottom.onEdge[0])} A ${r} ${r} 0 0 1 ${pt(innerBottom.onCircle)}
     A ${HALF} ${HALF} 0 0 0 ${pt(innerLeft.onCircle)}
     A ${r} ${r} 0 0 1 ${pt(innerLeft.onEdge)}
     V ${round(topLeft.onEdge[1])} A ${r} ${r} 0 0 1 ${pt(topLeft.onCircle)} Z`,
    OPTICAL_SCALE.full,
  ),
  eyes: eyePair(64),
  entry: { translateX: 4, translateY: -4 },
  archetype: "A reporter that sends the week's brief out to everyone.",
};
