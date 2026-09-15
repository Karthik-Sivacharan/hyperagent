import {
  BAND,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  HALF,
  OPTICAL_SCALE,
  SLOT,
  eyePair,
  scaleBody,
} from "../../grammar";
import { GLYPH_BOX as W, type GlyphShape } from "../../types";

/** Top of the two leg slots: a flat end with concave rounds, 4.8 modules up. */
const SLOT_TOP = 92;

const leg1 = BAND; // 40
const leg2 = BAND + SLOT; // 50
const leg3 = 2 * BAND + SLOT; // 90
const leg4 = 2 * BAND + 2 * SLOT; // 100

/**
 * A full-width semicircle on straight sides, standing on three 4-module legs
 * split by two 1-module slots (4 | 1 | 4 | 1 | 4).
 */
export const archGhost: GlyphShape = {
  id: "arch-ghost",
  name: "Arch ghost",
  set: "study",
  body: scaleBody(
    `M ${HALF} 0 A ${HALF} ${HALF} 0 0 1 ${W} ${HALF}
     V ${W - r} A ${r} ${r} 0 0 1 ${W - r} ${W}
     H ${leg4 + r} A ${r} ${r} 0 0 1 ${leg4} ${W - r}
     V ${SLOT_TOP + c} A ${c} ${c} 0 0 0 ${leg4 - c} ${SLOT_TOP}
     H ${leg3 + c} A ${c} ${c} 0 0 0 ${leg3} ${SLOT_TOP + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${leg3 - r} ${W}
     H ${leg2 + r} A ${r} ${r} 0 0 1 ${leg2} ${W - r}
     V ${SLOT_TOP + c} A ${c} ${c} 0 0 0 ${leg2 - c} ${SLOT_TOP}
     H ${leg1 + c} A ${c} ${c} 0 0 0 ${leg1} ${SLOT_TOP + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${leg1 - r} ${W}
     H ${r} A ${r} ${r} 0 0 1 0 ${W - r}
     V ${HALF} A ${HALF} ${HALF} 0 0 1 ${HALF} 0 Z`,
    OPTICAL_SCALE.medium,
  ),
  eyes: eyePair(50.25),
  entry: { scaleX: 0.995, scaleY: 0.925, translateY: 4.4 },
  archetype: "A patient watcher that keeps an eye on things.",
};
