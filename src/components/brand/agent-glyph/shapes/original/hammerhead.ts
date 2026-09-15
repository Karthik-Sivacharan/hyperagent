import {
  BAND,
  CENTRE,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  OPTICAL_SCALE,
  SLOT,
  eyePair,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/** The full-width head band is 7 modules tall. */
const HEAD = 7 * MODULE; // 70

/** Two 4-module legs and the 1-module slot between them, centred. */
const legL = (W - 2 * BAND - SLOT) / 2; // 25
const legR = W - legL; // 115
const slotL = CENTRE - SLOT / 2; // 65
const slotR = CENTRE + SLOT / 2; // 75

/** The leg slot is one band deep. */
const SLOT_TOP = W - BAND; // 100

/**
 * A full-width head band on a 9-module body that splits into two 4-module
 * legs (4 | 1 | 4). The eyes sit low in the head, under a heavy brow.
 */
export const hammerhead: GlyphShape = {
  id: "hammerhead",
  name: "Hammerhead",
  set: "original",
  body: scaleBody(
    `M ${r} 0 H ${W - r} A ${r} ${r} 0 0 1 ${W} ${r}
     V ${HEAD - r} A ${r} ${r} 0 0 1 ${W - r} ${HEAD}
     H ${legR + c} A ${c} ${c} 0 0 0 ${legR} ${HEAD + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${legR - r} ${W}
     H ${slotR + r} A ${r} ${r} 0 0 1 ${slotR} ${W - r}
     V ${SLOT_TOP + c} A ${c} ${c} 0 0 0 ${slotR - c} ${SLOT_TOP}
     H ${slotL + c} A ${c} ${c} 0 0 0 ${slotL} ${SLOT_TOP + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${slotL - r} ${W}
     H ${legL + r} A ${r} ${r} 0 0 1 ${legL} ${W - r}
     V ${HEAD + c} A ${c} ${c} 0 0 0 ${legL - c} ${HEAD}
     H ${r} A ${r} ${r} 0 0 1 0 ${HEAD - r}
     V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`,
    OPTICAL_SCALE.medium,
  ),
  eyes: eyePair(47.38),
  entry: { rotate: -5, translateY: -3 },
  archetype: "Chases people and suppliers until the answer comes back.",
};
