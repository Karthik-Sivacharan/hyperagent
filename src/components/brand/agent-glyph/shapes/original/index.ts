import type { GlyphShape } from "../../types";
import { bell } from "./bell";
import { folio } from "./folio";
import { fork } from "./fork";
import { hammerhead } from "./hammerhead";
import { pinwheel } from "./pinwheel";
import { portal } from "./portal";
import { slotStack } from "./slot-stack";
import { sweep } from "./sweep";
import { trefoil } from "./trefoil";

/**
 * The original set, the glyphs the product ships, in loop order. Each
 * silhouette stays distinct at 16px from the others and from the reference
 * drawings. The order alternates block and curve and swaps where the mass
 * sits (top-heavy fork, bottom-heavy bell), so every step of the loop is a
 * visible change.
 */
// Alternates, kept as files but out of the loop: step-tower (reads too close to bell when small) and turbine (a second spinner beside pinwheel).
export const ORIGINAL_SHAPES: readonly GlyphShape[] = [
  fork,
  bell,
  hammerhead,
  sweep,
  slotStack,
  portal,
  pinwheel,
  trefoil,
  folio,
];
