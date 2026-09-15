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

/** The middle tier steps in 2 modules from each side. */
const MID = 2 * MODULE; // 20

/** Tier lines: top tier one band tall, middle tier down to 9 modules. */
const TIER = 2 * BAND + SLOT; // 90

/** Top of the two foot slots, 3 modules up from the floor. */
const FOOT = 11 * MODULE; // 110

/** Foot columns: 4 | 1 | 4 | 1 | 4, the slots aligned under the top tier. */
const leg1 = BAND; // 40
const leg2 = BAND + SLOT; // 50
const leg3 = 2 * BAND + SLOT; // 90
const leg4 = 2 * BAND + 2 * SLOT; // 100

/**
 * Three tiers, 6, 10 and 14 modules wide, stepping out towards the floor. The
 * base splits into three 4-module feet (4 | 1 | 4 | 1 | 4) whose slots line up
 * under the edges of the top tier. The eyes sit in the middle tier.
 */
export const stepTower: GlyphShape = {
  id: "step-tower",
  name: "Step tower",
  set: "original",
  body: scaleBody(
    `M ${BAND + r} 0 H ${W - BAND - r} A ${r} ${r} 0 0 1 ${W - BAND} ${r}
     V ${BAND - c} A ${c} ${c} 0 0 0 ${W - BAND + c} ${BAND}
     H ${W - MID - r} A ${r} ${r} 0 0 1 ${W - MID} ${BAND + r}
     V ${TIER - c} A ${c} ${c} 0 0 0 ${W - MID + c} ${TIER}
     H ${W - r} A ${r} ${r} 0 0 1 ${W} ${TIER + r}
     V ${W - r} A ${r} ${r} 0 0 1 ${W - r} ${W}
     H ${leg4 + r} A ${r} ${r} 0 0 1 ${leg4} ${W - r}
     V ${FOOT + c} A ${c} ${c} 0 0 0 ${leg4 - c} ${FOOT}
     H ${leg3 + c} A ${c} ${c} 0 0 0 ${leg3} ${FOOT + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${leg3 - r} ${W}
     H ${leg2 + r} A ${r} ${r} 0 0 1 ${leg2} ${W - r}
     V ${FOOT + c} A ${c} ${c} 0 0 0 ${leg2 - c} ${FOOT}
     H ${leg1 + c} A ${c} ${c} 0 0 0 ${leg1} ${FOOT + c}
     V ${W - r} A ${r} ${r} 0 0 1 ${leg1 - r} ${W}
     H ${r} A ${r} ${r} 0 0 1 0 ${W - r}
     V ${TIER + r} A ${r} ${r} 0 0 1 ${r} ${TIER}
     H ${MID - c} A ${c} ${c} 0 0 0 ${MID} ${TIER - c}
     V ${BAND + r} A ${r} ${r} 0 0 1 ${MID + r} ${BAND}
     H ${BAND - c} A ${c} ${c} 0 0 0 ${BAND} ${BAND - c}
     V ${r} A ${r} ${r} 0 0 1 ${BAND + r} 0 Z`,
    OPTICAL_SCALE.large,
  ),
  eyes: eyePair(65.24),
  entry: { scaleX: 0.97, scaleY: 1.05, translateY: -4 },
  archetype: "Builds the weekly report up, one step of numbers at a time.",
};
