import {
  BAND,
  CENTRE,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  HALF,
  INNER_ARC,
  OPTICAL_SCALE,
  POST,
  eyePair,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/** Brim to floor: 6.25 modules of legs under the head. */
const LEGS_HEIGHT = 6.25 * MODULE;
/**
 * The head is a 7.1-module circle centred 0.1 module below the brim, so the
 * brim ends kick out just past the curve of the dome.
 */
const HEAD_DROP = 0.1 * MODULE;
const HEAD = HALF + HEAD_DROP;

// Centre the drawing vertically: head top and floor sit symmetric about 70.
const BRIM = (W - HEAD_DROP + HEAD - LEGS_HEIGHT) / 2;
const FLOOR = BRIM + LEGS_HEIGHT;
const NECK = BAND; // neck half-width: the neck is 8 modules wide
const FOOT = POST / 2;

const head = { cx: CENTRE, cy: BRIM + HEAD_DROP, r: HEAD };
// The legs are the notched block's horn band turned upside down: a 4-module
// annulus (radii 3 and 7 modules) centred on the middle of the floor.
const legs = { cx: CENTRE, cy: FLOOR, r: HALF };
const inner = { cx: CENTRE, cy: FLOOR, r: INNER_ARC };

const brim = roundEdgeCircle({ y: BRIM }, head, r, { side: -1, inside: true, pick: 1 });
const neck = roundEdgeCircle({ x: CENTRE + NECK }, legs, c, { side: 1, inside: false, pick: -1 });
const toe = roundEdgeCircle({ y: FLOOR }, legs, r, { side: -1, inside: true, pick: 1 });
const heel = roundEdgeCircle({ y: FLOOR }, inner, r, { side: -1, inside: false, pick: 1 });
const slot = roundEdgeCircle({ x: CENTRE + FOOT }, inner, c, { side: 1, inside: true, pick: -1 });

const fx = (x: number) => W - x;
const top = BRIM + HEAD_DROP - HEAD;

/**
 * A dome head with a flat brim on an 8-module neck, standing on two
 * quarter-circle legs with a centre foot between them.
 */
export const domeWalker: GlyphShape = {
  id: "dome-walker",
  name: "Dome walker",
  set: "study",
  body: scaleBody(
    `M ${CENTRE} ${top} A ${HEAD} ${HEAD} 0 0 1 ${brim.onCircle[0]} ${brim.onCircle[1]}
     A ${r} ${r} 0 0 1 ${brim.onEdge[0]} ${BRIM}
     H ${CENTRE + NECK + c} A ${c} ${c} 0 0 0 ${CENTRE + NECK} ${BRIM + c}
     V ${neck.onEdge[1]} A ${c} ${c} 0 0 0 ${neck.onCircle[0]} ${neck.onCircle[1]}
     A ${HALF} ${HALF} 0 0 1 ${toe.onCircle[0]} ${toe.onCircle[1]}
     A ${r} ${r} 0 0 1 ${toe.onEdge[0]} ${FLOOR}
     H ${heel.onEdge[0]} A ${r} ${r} 0 0 1 ${heel.onCircle[0]} ${heel.onCircle[1]}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${slot.onCircle[0]} ${slot.onCircle[1]}
     A ${c} ${c} 0 0 0 ${CENTRE + FOOT} ${slot.onEdge[1]}
     V ${FLOOR - r} A ${r} ${r} 0 0 1 ${CENTRE + FOOT - r} ${FLOOR}
     H ${CENTRE - FOOT + r} A ${r} ${r} 0 0 1 ${CENTRE - FOOT} ${FLOOR - r}
     V ${slot.onEdge[1]} A ${c} ${c} 0 0 0 ${fx(slot.onCircle[0])} ${slot.onCircle[1]}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${fx(heel.onCircle[0])} ${heel.onCircle[1]}
     A ${r} ${r} 0 0 1 ${fx(heel.onEdge[0])} ${FLOOR}
     H ${fx(toe.onEdge[0])} A ${r} ${r} 0 0 1 ${fx(toe.onCircle[0])} ${toe.onCircle[1]}
     A ${HALF} ${HALF} 0 0 1 ${fx(neck.onCircle[0])} ${neck.onCircle[1]}
     A ${c} ${c} 0 0 0 ${CENTRE - NECK} ${neck.onEdge[1]}
     V ${BRIM + c} A ${c} ${c} 0 0 0 ${CENTRE - NECK - c} ${BRIM}
     H ${fx(brim.onEdge[0])} A ${r} ${r} 0 0 1 ${fx(brim.onCircle[0])} ${brim.onCircle[1]}
     A ${HEAD} ${HEAD} 0 0 1 ${CENTRE} ${top} Z`,
    OPTICAL_SCALE.medium,
  ),
  eyes: eyePair(53.5),
  entry: { scaleX: 1.035, scaleY: 1.065, translateX: 0.7, translateY: -3.7 },
  archetype: "A scout that walks out and brings findings back.",
};
