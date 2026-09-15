import {
  CORNER_RADIUS as r,
  HALF,
  OPTICAL_SCALE,
  eyePair,
  roundCircleCircle,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/**
 * The waist round. The two semicircles meet tip to tip; a 0.2-module round
 * opens the waist to 3 modules, as in the reference. The full concave radius
 * would thicken the waist past 3.5 modules and lose the pinch.
 */
const PINCH = 0.2 * MODULE;

const bowl = { cx: HALF, cy: 0, r: HALF };
const dome = { cx: HALF, cy: W, r: HALF };

// Corner rounds where the flat top and base meet the circles (right side;
// the left side mirrors them).
const top = roundEdgeCircle({ y: 0 }, bowl, r, { side: 1, inside: true, pick: 1 });
const base = roundEdgeCircle({ y: W }, dome, r, { side: -1, inside: true, pick: 1 });

// The pinch round is tangent to both circles, on the right of the waist.
const pinch = roundCircleCircle(bowl, dome, PINCH, { insideA: false, insideB: false, pick: -1 });
const pinchTop = pinch.onA;
const pinchBottom = pinch.onB;
const mirror = (x: number) => W - x;

/**
 * A bowl hanging from a flat full-width top over a dome standing on a flat
 * full-width base: two full-width semicircles tip to tip.
 */
export const hourglass: GlyphShape = {
  id: "hourglass",
  name: "Hourglass",
  set: "study",
  body: scaleBody(
    `M ${mirror(top.onEdge[0])} 0 H ${top.onEdge[0]}
     A ${r} ${r} 0 0 1 ${top.onCircle[0]} ${top.onCircle[1]}
     A ${HALF} ${HALF} 0 0 1 ${pinchTop[0]} ${pinchTop[1]}
     A ${PINCH} ${PINCH} 0 0 0 ${pinchBottom[0]} ${pinchBottom[1]}
     A ${HALF} ${HALF} 0 0 1 ${base.onCircle[0]} ${base.onCircle[1]}
     A ${r} ${r} 0 0 1 ${base.onEdge[0]} ${W}
     H ${mirror(base.onEdge[0])}
     A ${r} ${r} 0 0 1 ${mirror(base.onCircle[0])} ${base.onCircle[1]}
     A ${HALF} ${HALF} 0 0 1 ${mirror(pinchBottom[0])} ${pinchBottom[1]}
     A ${PINCH} ${PINCH} 0 0 0 ${mirror(pinchTop[0])} ${pinchTop[1]}
     A ${HALF} ${HALF} 0 0 1 ${mirror(top.onCircle[0])} ${top.onCircle[1]}
     A ${r} ${r} 0 0 1 ${mirror(top.onEdge[0])} 0 Z`,
    OPTICAL_SCALE.small,
  ),
  eyes: eyePair(38.75),
  entry: { scaleX: 1.02, scaleY: 0.93 },
  archetype: "A timekeeper for schedules and deadlines.",
};
