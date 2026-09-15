import {
  BAND,
  CORNER_RADIUS as r,
  HALF,
  INNER_ARC,
  OPTICAL_SCALE,
  eyePair,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/** Each leg is one band wide, which leaves a 6-module doorway between them. */
const LEG_L = BAND; // 40
const LEG_R = W - BAND; // 100

/**
 * The doorway's straight sides rise 3 modules from the floor; its round top is
 * a semicircle as wide as the doorway (radius `INNER_ARC`, since 6 modules
 * = 2 × 3), so the crown above it is 8 modules deep at the centre.
 */
const DOOR_Y = W - 3 * MODULE; // 110

/**
 * A full-width semicircle on straight sides with a round-topped doorway cut
 * up from the floor, standing on two band-wide legs.
 */
export const portal: GlyphShape = {
  id: "portal",
  name: "Portal",
  set: "original",
  body: scaleBody(
    `M ${HALF} 0 A ${HALF} ${HALF} 0 0 1 ${W} ${HALF}
     V ${W - r} A ${r} ${r} 0 0 1 ${W - r} ${W}
     H ${LEG_R + r} A ${r} ${r} 0 0 1 ${LEG_R} ${W - r}
     V ${DOOR_Y} A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${HALF} ${DOOR_Y - INNER_ARC}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${LEG_L} ${DOOR_Y}
     V ${W - r} A ${r} ${r} 0 0 1 ${LEG_L - r} ${W}
     H ${r} A ${r} ${r} 0 0 1 0 ${W - r}
     V ${HALF} A ${HALF} ${HALF} 0 0 1 ${HALF} 0 Z`,
    OPTICAL_SCALE.large,
  ),
  eyes: eyePair(56),
  entry: { scaleY: 0.93, translateY: 4.7 },
  archetype: "The doorway between your tools: carries work from one to the next.",
};
