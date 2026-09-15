import {
  BAND,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  OPTICAL_SCALE,
  SLOT,
  eyePair,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/** The stack is 10 modules wide: 2 modules of air on each side. */
const left = 2 * MODULE; // 20
const right = W - left; // 120

/** The spine the side slots stop at, 2 modules in from each side. */
const spineL = BAND; // 40
const spineR = W - BAND; // 100

/** Rows of the two side slots between the 4 | 1 | 4 | 1 | 4 bands. */
const slot1 = BAND; // 40
const band2 = BAND + SLOT; // 50
const slot2 = 2 * BAND + SLOT; // 90
const band3 = 2 * BAND + 2 * SLOT; // 100

/**
 * Three 4-module blocks stacked on a spine, split by 1-module slots cut
 * 2 modules in from both sides (the reference's 4 | 1 | 4 | 1 | 4 rhythm,
 * turned on its side). The eyes sit in the middle block.
 */
export const slotStack: GlyphShape = {
  id: "slot-stack",
  name: "Slot stack",
  set: "original",
  body: scaleBody(
    `M ${left + r} 0 H ${right - r} A ${r} ${r} 0 0 1 ${right} ${r}
     V ${slot1 - r} A ${r} ${r} 0 0 1 ${right - r} ${slot1}
     H ${spineR + c} A ${c} ${c} 0 0 0 ${spineR} ${slot1 + c}
     V ${band2 - c} A ${c} ${c} 0 0 0 ${spineR + c} ${band2}
     H ${right - r} A ${r} ${r} 0 0 1 ${right} ${band2 + r}
     V ${slot2 - r} A ${r} ${r} 0 0 1 ${right - r} ${slot2}
     H ${spineR + c} A ${c} ${c} 0 0 0 ${spineR} ${slot2 + c}
     V ${band3 - c} A ${c} ${c} 0 0 0 ${spineR + c} ${band3}
     H ${right - r} A ${r} ${r} 0 0 1 ${right} ${band3 + r}
     V ${W - r} A ${r} ${r} 0 0 1 ${right - r} ${W}
     H ${left + r} A ${r} ${r} 0 0 1 ${left} ${W - r}
     V ${band3 + r} A ${r} ${r} 0 0 1 ${left + r} ${band3}
     H ${spineL - c} A ${c} ${c} 0 0 0 ${spineL} ${band3 - c}
     V ${slot2 + c} A ${c} ${c} 0 0 0 ${spineL - c} ${slot2}
     H ${left + r} A ${r} ${r} 0 0 1 ${left} ${slot2 - r}
     V ${band2 + r} A ${r} ${r} 0 0 1 ${left + r} ${band2}
     H ${spineL - c} A ${c} ${c} 0 0 0 ${spineL} ${band2 - c}
     V ${slot1 + c} A ${c} ${c} 0 0 0 ${spineL - c} ${slot1}
     H ${left + r} A ${r} ${r} 0 0 1 ${left} ${slot1 - r}
     V ${r} A ${r} ${r} 0 0 1 ${left + r} 0 Z`,
    OPTICAL_SCALE.large,
  ),
  eyes: eyePair(67.62),
  entry: { scaleY: 0.93, translateY: 4.7 },
  archetype: "Keeps the records in order: ledgers, invoices, logs.",
};
