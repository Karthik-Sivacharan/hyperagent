import {
  BAND,
  CENTRE,
  CENTRE_BAND_END,
  CENTRE_BAND_START,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  OPTICAL_SCALE,
  SCOOP,
  eyePair,
  roundCircleCircle,
  roundEdgeCircle,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

const L = CENTRE_BAND_START; // 50
const R = CENTRE_BAND_END; // 90

// Top half; the bottom mirrors it. Two 4-module quarter-annulus bands:
// the horn is centred on (9, 0) modules, radii 5 to 9; the tab is centred on
// the top-right corner, radii 5 to 9, and its inner edge is the scoop that
// leaves the plug. The 1-module gap between them is the slanted slot.
const hornOuter = { cx: R, cy: 0, r: R };
const hornInner = { cx: R, cy: 0, r: SCOOP };
const tabOuter = { cx: W, cy: 0, r: SCOOP + BAND };
const scoop = { cx: W, cy: 0, r: SCOOP };

const hornTip = roundEdgeCircle({ y: 0 }, hornOuter, r, { side: 1, inside: true, pick: -1 });
const hornIn = roundEdgeCircle({ y: 0 }, hornInner, r, { side: 1, inside: false, pick: -1 });
const tabIn = roundEdgeCircle({ y: 0 }, tabOuter, r, { side: 1, inside: true, pick: -1 });
const tabOut = roundEdgeCircle({ y: 0 }, scoop, r, { side: 1, inside: false, pick: -1 });
const slot = roundCircleCircle(hornInner, tabOuter, c, { insideA: true, insideB: false, pick: 1 });
const plug = roundEdgeCircle({ x: W }, scoop, r, { side: -1, inside: false, pick: 1 });
// Flank junction at the convex radius, as on the notched block.
const flank = roundEdgeCircle({ y: L }, hornOuter, r, { side: -1, inside: false, pick: -1 });

const fy = (y: number) => W - y;
const pt = (p: readonly [number, number], mirror = false) =>
  `${p[0]} ${mirror ? fy(p[1]) : p[1]}`;

/**
 * The notched block's left half with its slots bent into curved bands, and a
 * right half cut by two 5-module quarter-circle scoops that leave a 4-module
 * plug on the right edge: a connector pointing right.
 */
export const plugArrow: GlyphShape = {
  id: "plug-arrow",
  name: "Plug arrow",
  set: "study",
  body: scaleBody(
    `M ${hornTip.onEdge[0]} 0 H ${hornIn.onEdge[0]}
     A ${r} ${r} 0 0 1 ${pt(hornIn.onCircle)}
     A ${SCOOP} ${SCOOP} 0 0 0 ${pt(slot.onA)}
     A ${c} ${c} 0 0 0 ${pt(slot.onB)}
     A ${tabOuter.r} ${tabOuter.r} 0 0 1 ${pt(tabIn.onCircle)}
     A ${r} ${r} 0 0 1 ${tabIn.onEdge[0]} 0 H ${tabOut.onEdge[0]}
     A ${r} ${r} 0 0 1 ${pt(tabOut.onCircle)}
     A ${SCOOP} ${SCOOP} 0 0 0 ${pt(plug.onCircle)}
     A ${r} ${r} 0 0 1 ${W} ${plug.onEdge[1]}
     V ${fy(plug.onEdge[1])}
     A ${r} ${r} 0 0 1 ${pt(plug.onCircle, true)}
     A ${SCOOP} ${SCOOP} 0 0 0 ${pt(tabOut.onCircle, true)}
     A ${r} ${r} 0 0 1 ${tabOut.onEdge[0]} ${W} H ${tabIn.onEdge[0]}
     A ${r} ${r} 0 0 1 ${pt(tabIn.onCircle, true)}
     A ${tabOuter.r} ${tabOuter.r} 0 0 1 ${pt(slot.onB, true)}
     A ${c} ${c} 0 0 0 ${pt(slot.onA, true)}
     A ${SCOOP} ${SCOOP} 0 0 0 ${pt(hornIn.onCircle, true)}
     A ${r} ${r} 0 0 1 ${hornIn.onEdge[0]} ${W} H ${hornTip.onEdge[0]}
     A ${r} ${r} 0 0 1 ${pt(hornTip.onCircle, true)}
     A ${R} ${R} 0 0 1 ${pt(flank.onCircle, true)}
     A ${r} ${r} 0 0 0 ${flank.onEdge[0]} ${R}
     H ${r} A ${r} ${r} 0 0 1 0 ${R - r}
     V ${L + r} A ${r} ${r} 0 0 1 ${r} ${L}
     H ${flank.onEdge[0]} A ${r} ${r} 0 0 0 ${pt(flank.onCircle)}
     A ${R} ${R} 0 0 1 ${pt(hornTip.onCircle)}
     A ${r} ${r} 0 0 1 ${hornTip.onEdge[0]} 0 Z`,
    OPTICAL_SCALE.large,
  ),
  // The pair shifts 2/3 module away from the plug, onto the solid half.
  eyes: eyePair(62.25, CENTRE - (2 / 3) * MODULE),
  // The plug thrusts right: 6% wider with the left edge held in place.
  entry: { scaleX: 1.06, translateX: 4 },
  archetype: "A connector that plugs one tool into another.",
};
