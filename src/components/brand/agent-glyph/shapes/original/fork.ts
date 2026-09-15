import {
  BAND,
  CENTRE_BAND_END,
  CENTRE_BAND_START,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  OPTICAL_SCALE,
  eyePair,
  scaleBody,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

/** Bottom of the face band and top of the stem: one band up from the floor. */
const STEM_TOP = W - BAND; // 100

/**
 * Two 4-module prongs rise from a full-width face band, leaving a 6 × 4 module
 * notch between them; a 4-module stem on the centre band carries it to the
 * floor. Open at the top and at both lower corners, so it sits at full size.
 */
export const fork: GlyphShape = {
  id: "fork",
  name: "Fork",
  set: "original",
  body: scaleBody(
    `M ${r} 0 H ${BAND - r} A ${r} ${r} 0 0 1 ${BAND} ${r}
     V ${BAND - c} A ${c} ${c} 0 0 0 ${BAND + c} ${BAND}
     H ${W - BAND - c} A ${c} ${c} 0 0 0 ${W - BAND} ${BAND - c}
     V ${r} A ${r} ${r} 0 0 1 ${W - BAND + r} 0
     H ${W - r} A ${r} ${r} 0 0 1 ${W} ${r}
     V ${STEM_TOP - r} A ${r} ${r} 0 0 1 ${W - r} ${STEM_TOP}
     H ${CENTRE_BAND_END + c} A ${c} ${c} 0 0 0 ${CENTRE_BAND_END} ${STEM_TOP + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${CENTRE_BAND_END - r} ${W}
     H ${CENTRE_BAND_START + r} A ${r} ${r} 0 0 1 ${CENTRE_BAND_START} ${W - r}
     V ${STEM_TOP + c} A ${c} ${c} 0 0 0 ${CENTRE_BAND_START - c} ${STEM_TOP}
     H ${r} A ${r} ${r} 0 0 1 0 ${STEM_TOP - r}
     V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,
    OPTICAL_SCALE.full,
  ),
  eyes: eyePair(62.5),
  entry: { scaleX: 1.08 },
  archetype: "Catches what comes in, requests and signals, and sorts it for you.",
};
