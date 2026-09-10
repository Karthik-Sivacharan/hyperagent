// The Hyperagent mark, decomposed for motion.
//
// The shipped mark (src/components/app/brand-icons.tsx `HyperagentMark`, and
// the site's own https://hyperagent.com/static/favicons/icon.svg) is ONE
// compound path in a 22 viewBox. Splitting it at its `Z` boundaries gives the
// three pieces below, byte-for-byte:
//
//   1. TURN   — the centrally symmetric S: the top-right lobe and the
//               bottom-left lobe joined by a concave bridge through the middle.
//   2. CORNER — the bottom-right disc.
//   3. CORNER — the top-left disc.
//
// Two facts about the geometry are what the variants animate:
//
//   * All four lobes are the same disc: r = 4.96 on a 2x2 grid whose centres
//     are (4.96, 4.96) (16.48, 4.96) (4.96, 16.48) (16.48, 16.46).
//   * TURN is centrally symmetric, so rotating it 180 deg maps it exactly onto
//     itself - a seamless loop - and rotating it 90 deg lands its two lobes on
//     the two corner discs. Both only hold about the RIGHT point: `TURN_PIVOT`
//     (10.72023), the midpoint of TURN's two lobe centres, not the viewBox
//     centre (11). The half-unit difference is the mark being drawn 21.4404
//     wide inside a 22 box; rotating about 11 leaves the 180 deg turn 0.56
//     units off its rest position, which reads as a snap.
//
// Nothing here changes the rendered mark: TURN + the two CORNERs at rest
// composite to the same pixels as the single shipped path.

/** The mark's own coordinate system. Height and width of the viewBox. */
export const MARK_VIEWBOX = 22;

/**
 * Centre of the 22 viewBox. Useful for layout, but NOT the origin to rotate
 * about: the mark is drawn 21.4404 wide inside that 22 box, so its own centre
 * sits half a unit up and left of the box's. Rotate about `TURN_PIVOT`.
 */
export const MARK_CENTER = 11;

/** Radius of each of the four lobes, in mark units. */
export const LOBE_RADIUS = 4.96;

/** The four lobe centres, in mark units. */
export const LOBES = {
  topLeft: { cx: 4.95996, cy: 4.95996 },
  topRight: { cx: 16.4805, cy: 4.95996 },
  bottomLeft: { cx: 4.95996, cy: 16.4805 },
  bottomRight: { cx: 16.5098, cy: 16.46 },
} as const;

/**
 * The origin every rotation of TURN must turn about: the midpoint of TURN's
 * own two lobe centres, ((16.4805 + 4.95996) / 2). This is what makes the
 * 180 deg self-map and the 90 deg lobe-to-disc landing exact.
 */
export const TURN_PIVOT = (LOBES.topRight.cx + LOBES.bottomLeft.cx) / 2;

/**
 * The centrally symmetric S: top-right lobe + bottom-left lobe + the concave
 * bridge between them. Subpath 1 of the shipped compound path.
 */
export const TURN_PATH =
  "M16.4805 0C19.2192 0.000148464 21.4403 2.22119 21.4404 4.95996C21.4404 7.69884 19.2193 9.91977 16.4805 9.91992C12.8578 9.91992 9.91992 12.8578 9.91992 16.4805C9.91977 19.2193 7.69884 21.4404 4.95996 21.4404C2.22119 21.4403 0.000148466 19.2192 0 16.4805C0 13.7416 2.2211 11.5206 4.95996 11.5205C8.58259 11.5205 11.5205 8.58259 11.5205 4.95996C11.5206 2.2211 13.7416 0 16.4805 0Z";

/** The top-left disc. Subpath 3 of the shipped compound path. */
export const TOP_LEFT_PATH =
  "M4.95996 0C7.69922 0 9.9198 2.22074 9.91992 4.95996C9.91992 7.69929 7.69929 9.91992 4.95996 9.91992C2.22074 9.9198 0 7.69922 0 4.95996C0.000126519 2.22081 2.22081 0.000126521 4.95996 0Z";

/** The bottom-right disc. Subpath 2 of the shipped compound path. */
export const BOTTOM_RIGHT_PATH =
  "M16.5098 11.5C19.249 11.5 21.4695 13.7208 21.4697 16.46C21.4697 19.1993 19.2491 21.4199 16.5098 21.4199C13.7705 21.4198 11.5498 19.1992 11.5498 16.46C11.55 13.7209 13.7707 11.5001 16.5098 11.5Z";

/** The shipped mark as one path - the rest state every variant must match. */
export const FULL_MARK_PATH = `${TURN_PATH}${BOTTOM_RIGHT_PATH}${TOP_LEFT_PATH}`;
