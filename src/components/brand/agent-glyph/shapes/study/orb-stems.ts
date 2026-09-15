import {
  CENTRE,
  CENTRE_BAND_END,
  CENTRE_BAND_START,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  OPTICAL_SCALE,
  SCOOP,
  eyePair,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

const L = CENTRE_BAND_START; // 50: left stem edge and left cap centre
const R = CENTRE_BAND_END; // 90: right stem edge and right cap centre

// The caps are 5-module circles centred on the stem edges, so each stem side
// meets its cap exactly at the cap's apex; a concave round joins them.
const capRight = { cx: R, cy: CENTRE, r: SCOOP };
const joint = roundEdgeCircle({ x: R }, capRight, c, { side: 1, inside: false, pick: -1 });
const [jx, jy] = joint.onCircle;
const flipY = (y: number) => W - y;
const flipX = (x: number) => W - x;

/**
 * A horizontal pill (two 5-module caps on the centre band, 14 × 10 modules)
 * with a 4-module stem running through it top to bottom.
 */
export const orbStems: GlyphShape = {
  id: "orb-stems",
  name: "Orb with stems",
  set: "study",
  body: scaleBody(
    `M ${L + r} 0 H ${R - r} A ${r} ${r} 0 0 1 ${R} ${r}
     V ${joint.onEdge[1]} A ${c} ${c} 0 0 0 ${jx} ${jy}
     A ${SCOOP} ${SCOOP} 0 0 1 ${jx} ${flipY(jy)}
     A ${c} ${c} 0 0 0 ${R} ${flipY(joint.onEdge[1])}
     V ${W - r} A ${r} ${r} 0 0 1 ${R - r} ${W}
     H ${L + r} A ${r} ${r} 0 0 1 ${L} ${W - r}
     V ${flipY(joint.onEdge[1])} A ${c} ${c} 0 0 0 ${flipX(jx)} ${flipY(jy)}
     A ${SCOOP} ${SCOOP} 0 0 1 ${flipX(jx)} ${jy}
     A ${c} ${c} 0 0 0 ${L} ${joint.onEdge[1]}
     V ${r} A ${r} ${r} 0 0 1 ${L + r} 0 Z`,
    OPTICAL_SCALE.medium,
  ),
  eyes: eyePair(69.5),
  // The reference enters with its two halves offset vertically (left low,
  // right high); a small counter-clockwise tilt is the closest rigid pose.
  entry: { rotate: -8 },
  archetype: "A bright idea: the generalist that lights up any task.",
};
