/**
 * The glyph grammar: the few numbers every body and eye pair is built from,
 * measured on the reference drawings and expressed in drawing-box units
 * (1 module = 10 units, box = 140 × 140).
 *
 * How to build a body: draw it on the full 14-module grid with these
 * constants (template literals), then shrink it to its optical size with
 * `scaleBody(d, OPTICAL_SCALE.x)`. Eyes are NOT scaled: every glyph has the
 * same eyes at the same absolute size, which is what makes the set read as
 * one character.
 *
 * Each value notes the reference shapes it was confirmed on, measured at the
 * shared scale where the largest drawing fills the box exactly.
 */

import { GLYPH_BOX, MODULE, type EyeRect } from "./types";

/** Centre of the drawing box on both axes. */
export const CENTRE = GLYPH_BOX / 2;

// ---------------------------------------------------------------------------
// Bands and slots (grid-true in the reference)
// ---------------------------------------------------------------------------

/**
 * A 4-module band: the horns and tabs of the notched block (4|1|4|1|4), the
 * three legs of the arch, the stems of the orb, the plug of the arrow.
 */
export const BAND = 4 * MODULE;

/** A 1-module slot between bands: the notched block's and the arch's slots. */
export const SLOT = MODULE;

/**
 * A 3.4-module post, a little narrower than a band: the cog's teeth (33.8
 * measured) and the dome walker's centre foot (33.2).
 */
export const POST = 3.4 * MODULE;

/**
 * The centre band runs from module 5 to module 9. Tabs, stems and the plug
 * sit on it (notched block, plug arrow, orb, arch middle leg).
 */
export const CENTRE_BAND_START = 5 * MODULE;
export const CENTRE_BAND_END = CENTRE_BAND_START + BAND;

// ---------------------------------------------------------------------------
// Curves
// ---------------------------------------------------------------------------

/**
 * Radius of a full-width semicircle (diameter = the 14-module grid): the arch
 * dome, both hourglass bowls, the dome walker's legs, and the outer edge of
 * the notched block's horns (centred on the top and bottom edge midpoints).
 */
export const HALF = 7 * MODULE;

/**
 * Radius of a 5-module round: the plug arrow's quarter-circle scoops
 * (centred on the box corners) and the inner edges of its curved bands, and
 * the orb's end caps (centred on modules 5 and 9, so the flat between them
 * hides under the stems).
 */
export const SCOOP = 5 * MODULE;

/**
 * Radius of a 3-module arc, concentric with a `HALF` arc so the two bound a
 * 4-module band: the inner edge of the notched block's horns (leaving a
 * 1-module slot at the top edge) and of the dome walker's legs.
 */
export const INNER_ARC = 3 * MODULE;

/**
 * The one convex corner radius (0.4 module). Exact in the notched block
 * vector (0.400 module); 0.39 to 0.41 on the arch, pedestal and arrow.
 */
export const CORNER_RADIUS = 0.4 * MODULE;

/**
 * The concave round where a band meets a body (slot ends, stem and neck
 * junctions), a touch tighter than the convex corners. Measured 0.32 module
 * at the notched block's slot bottoms (exact vector), about 0.32 at the orb's
 * stems and 0.36 at the arch's slot tops and the pedestal's neck. Keep it
 * small: in a narrow wedge-shaped slot a bigger round eats the slot's depth.
 */
export const CONCAVE_RADIUS = 0.3 * MODULE;

// ---------------------------------------------------------------------------
// Optical size
// ---------------------------------------------------------------------------

/**
 * The reference draws every silhouette on the full 14-module grid, then sizes
 * it optically in steps of 1/21 of the box so open, spiky shapes and compact
 * solid ones read the same size. Measured widths in units: cog 140, notched
 * block 133.4, plug arrow 134.2, arch 126.6, orb 126.5, pedestal 127.4, dome
 * walker 128.2, hourglass 119.8.
 */
export const OPTICAL_SCALE = {
  /** Open, toothy silhouettes with lots of background between parts. */
  full: 1,
  /** Blocky silhouettes that fill their square (notched block, plug arrow). */
  large: 20 / 21,
  /** Rounded silhouettes (arch, orb, pedestal, dome walker). */
  medium: 19 / 21,
  /** The most compact, heaviest silhouettes (hourglass). */
  small: 18 / 21,
} as const;

// ---------------------------------------------------------------------------
// Eyes (never scaled with the body)
// ---------------------------------------------------------------------------

/**
 * Eye width and height: 17/12 module (≈ 14.17). The ratio is exact in the
 * notched block vector; the eight reference shapes measure 14.20 to 14.25.
 */
export const EYE_SIZE = (17 / 12) * MODULE;

/** Eye corner radius: a quarter module, exact in the notched block vector. */
export const EYE_RADIUS = MODULE / 4;

/** Centre-to-centre eye distance: 3.5 modules, 35.0 on all eight shapes. */
export const EYE_SPACING = 3.5 * MODULE;

/**
 * Typical eye-centre height: one module above the box centre (cog 60.1,
 * pedestal 60.6, plug arrow 62.3). Each shape moves its pair into its own
 * face zone, from 38.8 (hourglass bowl) to 69.5 (orb).
 */
export const EYE_ROW_Y = CENTRE - MODULE;

/** Closed-eye height during a blink: a quarter of the open eye. */
export const BLINK_HEIGHT = EYE_SIZE / 4;

/** Minimum body left around each eye (contract rule 3). */
export const EYE_CLEARANCE = 0.75 * MODULE;

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The left and right eye, level, centred on `cx` (default: the box centre)
 * with their centres at height `cy`.
 */
export function eyePair(
  cy: number = EYE_ROW_Y,
  cx: number = CENTRE,
): readonly [EyeRect, EyeRect] {
  const half = EYE_SIZE / 2;
  const eye = (centreX: number): EyeRect => ({
    x: round(centreX - half),
    y: round(cy - half),
    width: round(EYE_SIZE),
    height: round(EYE_SIZE),
    radius: EYE_RADIUS,
  });
  return [eye(cx - EYE_SPACING / 2), eye(cx + EYE_SPACING / 2)];
}

// ---------------------------------------------------------------------------
// Rounds where a straight edge meets a circle
// ---------------------------------------------------------------------------

export type Point = readonly [x: number, y: number];
export type Circle = { cx: number; cy: number; r: number };

/**
 * Where a round of radius `r` touches a straight edge and a circle it joins.
 * The round's centre sits `r` from the edge on `side` (+1: towards larger
 * coordinates, -1: smaller), at `R - r` from the circle centre when the round
 * is inside the circle and `R + r` when outside. Of the two solutions along
 * the edge, `pick` +1 takes the one with the larger coordinate.
 */
export function roundEdgeCircle(
  edge: { x: number } | { y: number },
  circle: Circle,
  r: number,
  { side, inside, pick }: { side: 1 | -1; inside: boolean; pick: 1 | -1 },
): { onEdge: Point; onCircle: Point } {
  const reach = inside ? circle.r - r : circle.r + r;
  let centre: Point;
  let onEdge: Point;
  if ("y" in edge) {
    const y = edge.y + side * r;
    const x = circle.cx + pick * Math.sqrt(reach ** 2 - (y - circle.cy) ** 2);
    centre = [x, y];
    onEdge = [x, edge.y];
  } else {
    const x = edge.x + side * r;
    const y = circle.cy + pick * Math.sqrt(reach ** 2 - (x - circle.cx) ** 2);
    centre = [x, y];
    onEdge = [edge.x, y];
  }
  const k = circle.r / reach;
  const onCircle: Point = [
    circle.cx + (centre[0] - circle.cx) * k,
    circle.cy + (centre[1] - circle.cy) * k,
  ];
  return { onEdge, onCircle };
}

/**
 * Where a round of radius `r` touches two circles it joins (a slot between
 * two arcs, a waist between two bowls). `insideA` / `insideB` say whether the
 * round sits inside each circle. Of the two solutions, `pick` +1 takes the
 * one to the right of the direction from `a` to `b` in screen coordinates
 * (below the line when `b` is to the right of `a`).
 */
export function roundCircleCircle(
  a: Circle,
  b: Circle,
  r: number,
  { insideA, insideB, pick }: { insideA: boolean; insideB: boolean; pick: 1 | -1 },
): { onA: Point; onB: Point } {
  const dA = insideA ? a.r - r : a.r + r;
  const dB = insideB ? b.r - r : b.r + r;
  const d = Math.hypot(b.cx - a.cx, b.cy - a.cy);
  const ux = (b.cx - a.cx) / d;
  const uy = (b.cy - a.cy) / d;
  const along = (dA ** 2 - dB ** 2 + d ** 2) / (2 * d);
  const across = pick * Math.sqrt(dA ** 2 - along ** 2);
  const cx = a.cx + ux * along - uy * across;
  const cy = a.cy + uy * along + ux * across;
  const on = (c: Circle, reach: number): Point => [
    c.cx + ((cx - c.cx) * c.r) / reach,
    c.cy + ((cy - c.cy) * c.r) / reach,
  ];
  return { onA: on(a, dA), onB: on(b, dB) };
}

// ---------------------------------------------------------------------------
// Scaling an authored body to its optical size
// ---------------------------------------------------------------------------

const ARG_COUNT: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, A: 7, Z: 0 };

/**
 * Scale an absolute `M L H V A Z` path about the box centre by `k`, keeping
 * arcs circular (radii scale, rotation and flags do not). Numbers are rounded
 * to 3 decimals.
 */
export function scaleBody(d: string, k: number): string {
  const tokens = d.match(/[MLHVAZ]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
  const at = (n: number) => round(CENTRE + (n - CENTRE) * k);
  const out: string[] = [];
  let cmd = "";
  let args: number[] = [];

  const flush = () => {
    const [a0, a1, a2, a3, a4, a5, a6] = args;
    switch (cmd) {
      case "M":
      case "L":
        out.push(`${cmd} ${at(a0)} ${at(a1)}`);
        break;
      case "H":
      case "V":
        out.push(`${cmd} ${at(a0)}`);
        break;
      case "A":
        out.push(
          `A ${round(a0 * k)} ${round(a1 * k)} ${a2} ${a3} ${a4} ${at(a5)} ${at(a6)}`,
        );
        break;
    }
    args = [];
  };

  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (upper in ARG_COUNT) {
      if (token !== upper) {
        throw new Error(`scaleBody: relative command "${token}" is not allowed`);
      }
      cmd = upper;
      if (cmd === "Z") out.push("Z");
      continue;
    }
    args.push(Number(token));
    if (args.length === ARG_COUNT[cmd]) flush();
  }
  return out.join(" ");
}
