import {
  CORNER_RADIUS as r,
  OPTICAL_SCALE,
  SCOOP,
  eyePair,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

/**
 * The turned corner: a 5-module scoop centred on the top-right corner of the
 * box, so it bites the same depth into the top edge and the right side. Both
 * ends of the bite are convex, since the page's edge turns into it at a right
 * angle, so each takes the one corner radius where the edge meets the circle.
 */
const corner = { cx: W, cy: 0, r: SCOOP };
const top = roundEdgeCircle({ y: 0 }, corner, r, { side: 1, inside: false, pick: -1 });
const right = roundEdgeCircle({ x: W }, corner, r, { side: -1, inside: false, pick: 1 });

/**
 * A page with its top-right corner turned down: the full box with one scoop
 * taken out of a corner. Nearly all of it is body, so it takes the smallest
 * optical step, the hourglass's.
 */
export const folio: GlyphShape = {
  id: "folio",
  name: "Folio",
  set: "original",
  body: scaleBody(
    `M ${r} 0 H ${top.onEdge[0]}
     A ${r} ${r} 0 0 1 ${top.onCircle[0]} ${top.onCircle[1]}
     A ${SCOOP} ${SCOOP} 0 0 0 ${right.onCircle[0]} ${right.onCircle[1]}
     A ${r} ${r} 0 0 1 ${W} ${right.onEdge[1]}
     V ${W - r} A ${r} ${r} 0 0 1 ${W - r} ${W}
     H ${r} A ${r} ${r} 0 0 1 0 ${W - r}
     V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,
    OPTICAL_SCALE.small,
  ),
  eyes: eyePair(64),
  entry: { rotate: -6 },
  archetype: "A librarian that reads every page, finds what disagrees and asks you to settle it.",
};
