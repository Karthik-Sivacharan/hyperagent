import {
  BAND,
  CORNER_RADIUS as r,
  INNER_ARC,
  OPTICAL_SCALE,
  eyePair,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/** The dome is two bands wide, so its radius is one band. */
const DOME = BAND; // 40
const NECK_L = W / 2 - DOME; // 30
const NECK_R = W / 2 + DOME; // 110

/** The neck drops 3 modules below the dome's centre line, then flares. */
const FLARE_Y = DOME + 3 * MODULE; // 70

/**
 * The flare is a concave quarter circle centred on the box edge, so it leaves
 * the neck vertically and lands on the lip horizontally, 3 modules lower.
 * Below the lip the base is one band tall.
 */
const lipR = roundEdgeCircle({ x: W }, { cx: W, cy: FLARE_Y, r: INNER_ARC }, r, {
  side: -1,
  inside: false,
  pick: 1,
});
const lipL = roundEdgeCircle({ x: 0 }, { cx: 0, cy: FLARE_Y, r: INNER_ARC }, r, {
  side: 1,
  inside: false,
  pick: 1,
});

/**
 * A narrow dome on a short neck that flares out through two concave quarter
 * circles onto a full-width band. The eyes sit where the dome meets the neck.
 */
export const bell: GlyphShape = {
  id: "bell",
  name: "Bell",
  set: "original",
  body: scaleBody(
    `M ${W / 2} 0 A ${DOME} ${DOME} 0 0 1 ${NECK_R} ${DOME}
     V ${FLARE_Y} A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${lipR.onCircle[0]} ${lipR.onCircle[1]}
     A ${r} ${r} 0 0 1 ${W} ${lipR.onEdge[1]}
     V ${W - r} A ${r} ${r} 0 0 1 ${W - r} ${W}
     H ${r} A ${r} ${r} 0 0 1 0 ${W - r}
     V ${lipL.onEdge[1]} A ${r} ${r} 0 0 1 ${lipL.onCircle[0]} ${lipL.onCircle[1]}
     A ${INNER_ARC} ${INNER_ARC} 0 0 0 ${NECK_L} ${FLARE_Y}
     V ${DOME} A ${DOME} ${DOME} 0 0 1 ${W / 2} 0 Z`,
    OPTICAL_SCALE.large,
  ),
  eyes: eyePair(57),
  entry: { rotate: -8 },
  archetype: "Rings when something falls due, then chases it.",
};
