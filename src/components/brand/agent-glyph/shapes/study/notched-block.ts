import {
  CENTRE_BAND_END,
  CENTRE_BAND_START,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  HALF,
  INNER_ARC,
  OPTICAL_SCALE,
  eyePair,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

const L = CENTRE_BAND_START; // 50
const R = CENTRE_BAND_END; // 90

// Top-left quarter; everything else mirrors it. Two circles centred on the
// top-edge midpoint shape each horn: the outer `HALF` arc and the inner
// `INNER_ARC`, which leaves a 4-module horn and a 1-module slot at the top.
const outer = { cx: HALF, cy: 0, r: HALF };
const inner = { cx: HALF, cy: 0, r: INNER_ARC };
const hornTip = roundEdgeCircle({ y: 0 }, outer, r, { side: 1, inside: true, pick: -1 });
const hornInner = roundEdgeCircle({ y: 0 }, inner, r, { side: 1, inside: false, pick: -1 });
const slot = roundEdgeCircle({ x: L }, inner, c, { side: -1, inside: true, pick: 1 });
// The flank junction is the one concave round drawn at the convex radius: the
// exact vector softens this wider wedge (0.44 module) while it keeps the slot
// bottoms tight (0.32) so the slots stay deep.
const j = r;
const side = roundEdgeCircle({ y: L }, outer, j, { side: -1, inside: false, pick: -1 });

const fx = (x: number) => W - x;
const fy = (y: number) => W - y;
const [tipX] = hornTip.onEdge;
const [tipCx, tipCy] = hornTip.onCircle;
const [innerX] = hornInner.onEdge;
const [innerCx, innerCy] = hornInner.onCircle;
const [slotCx, slotCy] = slot.onCircle;
const slotY = slot.onEdge[1];
const [sideCx, sideCy] = side.onCircle;
const sideX = side.onEdge[0];

/**
 * A square whose top and bottom read horn | slot | tab | slot | horn
 * (4 | 1 | 4 | 1 | 4 modules), with a 4-module tab on each side and a
 * full-width arc cutting each flank between horn and tab.
 */
export const notchedBlock: GlyphShape = {
  id: "notched-block",
  name: "Notched block",
  set: "study",
  body: scaleBody(
    `M ${tipX} 0 H ${innerX} A ${r} ${r} 0 0 1 ${innerCx} ${innerCy}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${slotCx} ${slotCy}
     A ${c} ${c} 0 0 0 ${L} ${slotY}
     V ${r} A ${r} ${r} 0 0 1 ${L + r} 0 H ${R - r} A ${r} ${r} 0 0 1 ${R} ${r}
     V ${slotY} A ${c} ${c} 0 0 0 ${fx(slotCx)} ${slotCy}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${fx(innerCx)} ${innerCy}
     A ${r} ${r} 0 0 1 ${fx(innerX)} 0
     H ${fx(tipX)} A ${r} ${r} 0 0 1 ${fx(tipCx)} ${tipCy}
     A ${HALF} ${HALF} 0 0 1 ${fx(sideCx)} ${sideCy}
     A ${j} ${j} 0 0 0 ${fx(sideX)} ${L}
     H ${W - r} A ${r} ${r} 0 0 1 ${W} ${L + r}
     V ${R - r} A ${r} ${r} 0 0 1 ${W - r} ${R}
     H ${fx(sideX)} A ${j} ${j} 0 0 0 ${fx(sideCx)} ${fy(sideCy)}
     A ${HALF} ${HALF} 0 0 1 ${fx(tipCx)} ${fy(tipCy)}
     A ${r} ${r} 0 0 1 ${fx(tipX)} ${W}
     H ${fx(innerX)} A ${r} ${r} 0 0 1 ${fx(innerCx)} ${fy(innerCy)}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${fx(slotCx)} ${fy(slotCy)}
     A ${c} ${c} 0 0 0 ${R} ${fy(slotY)}
     V ${W - r} A ${r} ${r} 0 0 1 ${R - r} ${W} H ${L + r} A ${r} ${r} 0 0 1 ${L} ${W - r}
     V ${fy(slotY)} A ${c} ${c} 0 0 0 ${slotCx} ${fy(slotCy)}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${innerCx} ${fy(innerCy)}
     A ${r} ${r} 0 0 1 ${innerX} ${W}
     H ${tipX} A ${r} ${r} 0 0 1 ${tipCx} ${fy(tipCy)}
     A ${HALF} ${HALF} 0 0 1 ${sideCx} ${fy(sideCy)}
     A ${j} ${j} 0 0 0 ${sideX} ${R}
     H ${r} A ${r} ${r} 0 0 1 0 ${R - r}
     V ${L + r} A ${r} ${r} 0 0 1 ${r} ${L}
     H ${sideX} A ${j} ${j} 0 0 0 ${sideCx} ${sideCy}
     A ${HALF} ${HALF} 0 0 1 ${tipCx} ${tipCy}
     A ${r} ${r} 0 0 1 ${tipX} 0 Z`,
    OPTICAL_SCALE.large,
  ),
  eyes: eyePair(66.75),
  entry: { scaleX: 1.095, scaleY: 0.995 },
  archetype: "A builder that stacks parts into working apps.",
};
