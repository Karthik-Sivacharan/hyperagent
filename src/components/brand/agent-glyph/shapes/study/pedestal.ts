import {
  CENTRE,
  CONCAVE_RADIUS as c,
  CORNER_RADIUS as r,
  HALF,
  OPTICAL_SCALE,
  type Point,
  eyePair,
  scaleBody,
} from "../../grammar";
import { MODULE, GLYPH_BOX as W, type GlyphShape } from "../../types";

/** Hat: 8.3 modules wide, 3.75 modules tall. */
const HAT = 4.15 * MODULE;
const BRIM = 3.75 * MODULE;
/** Plinth: 12.6 modules wide, 2.9 modules tall. */
const PLINTH = 6.3 * MODULE;
const PLINTH_TOP = W - 2.9 * MODULE;
/** Neck: 5 modules wide. */
const NECK = 2.5 * MODULE;

// The bowl is a half-ellipse: full width across the brim, deep enough to
// reach the plinth.
const bowl = { cx: CENTRE, cy: BRIM, rx: HALF, ry: PLINTH_TOP - BRIM };

/**
 * Where a round of radius `rad` touches the bowl and a straight edge. The
 * round's centre sits on the bowl's normal (`out` +1 outside, -1 inside) and
 * on the given axis line; the bowl angle is found by bisection in [t0, t1].
 */
function roundBowl(
  line: { x: number } | { y: number },
  rad: number,
  out: 1 | -1,
  t0: number,
  t1: number,
): { onBowl: Point; onLine: Point } {
  const at = (t: number) => {
    const ex = bowl.cx + bowl.rx * Math.cos(t);
    const ey = bowl.cy + bowl.ry * Math.sin(t);
    const nx = Math.cos(t) / bowl.rx;
    const ny = Math.sin(t) / bowl.ry;
    const len = Math.hypot(nx, ny);
    return { ex, ey, px: ex + (out * rad * nx) / len, py: ey + (out * rad * ny) / len };
  };
  const miss = (t: number) => ("x" in line ? at(t).px - line.x : at(t).py - line.y);
  let a = t0;
  let b = t1;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (Math.sign(miss(m)) === Math.sign(miss(a))) a = m;
    else b = m;
  }
  const p = at((a + b) / 2);
  return {
    onBowl: [p.ex, p.ey],
    onLine: "x" in line ? [line.x, p.py] : [p.px, line.y],
  };
}

const rim = roundBowl({ y: BRIM + r }, r, -1, 0.001, 0.6);
const neck = roundBowl({ x: CENTRE + NECK + c }, c, 1, 0.5, Math.PI / 2);
const fx = (x: number) => W - x;
const pt = (p: Point, mirror = false) => `${mirror ? fx(p[0]) : p[0]} ${p[1]}`;

/**
 * A hat on a full-width brim, a half-elliptical bowl hanging from the brim
 * into a short neck, and a wide plinth underneath.
 */
export const pedestal: GlyphShape = {
  id: "pedestal",
  name: "Pedestal",
  set: "study",
  body: scaleBody(
    `M ${CENTRE - HAT + r} 0 H ${CENTRE + HAT - r} A ${r} ${r} 0 0 1 ${CENTRE + HAT} ${r}
     V ${BRIM - c} A ${c} ${c} 0 0 0 ${CENTRE + HAT + c} ${BRIM}
     H ${rim.onLine[0]} A ${r} ${r} 0 0 1 ${pt(rim.onBowl)}
     A ${bowl.rx} ${bowl.ry} 0 0 1 ${pt(neck.onBowl)}
     A ${c} ${c} 0 0 0 ${CENTRE + NECK} ${neck.onLine[1]}
     V ${PLINTH_TOP - c} A ${c} ${c} 0 0 0 ${CENTRE + NECK + c} ${PLINTH_TOP}
     H ${CENTRE + PLINTH - r} A ${r} ${r} 0 0 1 ${CENTRE + PLINTH} ${PLINTH_TOP + r}
     V ${W - r} A ${r} ${r} 0 0 1 ${CENTRE + PLINTH - r} ${W}
     H ${CENTRE - PLINTH + r} A ${r} ${r} 0 0 1 ${CENTRE - PLINTH} ${W - r}
     V ${PLINTH_TOP + r} A ${r} ${r} 0 0 1 ${CENTRE - PLINTH + r} ${PLINTH_TOP}
     H ${CENTRE - NECK - c} A ${c} ${c} 0 0 0 ${CENTRE - NECK} ${PLINTH_TOP - c}
     V ${neck.onLine[1]} A ${c} ${c} 0 0 0 ${pt(neck.onBowl, true)}
     A ${bowl.rx} ${bowl.ry} 0 0 1 ${pt(rim.onBowl, true)}
     A ${r} ${r} 0 0 1 ${fx(rim.onLine[0])} ${BRIM}
     H ${CENTRE - HAT - c} A ${c} ${c} 0 0 0 ${CENTRE - HAT} ${BRIM - c}
     V ${r} A ${r} ${r} 0 0 1 ${CENTRE - HAT + r} 0 Z`,
    OPTICAL_SCALE.medium,
  ),
  eyes: eyePair(60.5),
  entry: { rotate: 0.5, scaleX: 0.985, scaleY: 1.035, translateY: -2.1 },
  archetype: "A presenter that puts results on show.",
};
