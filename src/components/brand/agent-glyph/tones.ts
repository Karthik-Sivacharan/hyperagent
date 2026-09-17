import { GLYPH_BOX, MODULE } from "./types";

/**
 * The glyph's colourways, in two families.
 *
 * THE ARTWORK TONES (`sand`, `ink`, `tangerine`, `accent`, `success`,
 * `warning`, `danger`) are the original doctrine and it still holds: a glyph
 * is artwork, like the mark, so an agent keeps the same face in the light and
 * the dark theme and these read the brand ramps directly (`--color-*`
 * primitives in brand.css) rather than the theme-mapped semantics. They are
 * what a glyph wears on a stage, in a hero, on a poster or in a line of type.
 *
 * THE AVATAR TONES (`avatar`, `avatar-success`, `avatar-warning`,
 * `avatar-danger`) are the documented exception, added 2026-09-17 for the
 * composer's agent bar. An avatar is not artwork: it is a 28px disc of UI
 * FURNITURE sitting on a themed surface, and furniture is supposed to move
 * with the room. The app ships dark by default, and a row of paper-white
 * discs in a dark composer is the brightest object on the screen — which is
 * the complaint that produced this family. So these four read
 * `--glyph-avatar*`, declared on `:root` and re-mapped on `.dark` like every
 * other themed token, and one tone name is correct in both themes.
 *
 * That last part is the reason it is done in CSS rather than by picking a
 * different artwork tone per theme in the component: `next-themes` only knows
 * the theme on the client after mount, so a chip that chose its own tone
 * would server-render the wrong one and flash. A variable resolves on the
 * element, in the first paint, with no JavaScript — and a subtree that puts
 * `dark` on its own wrapper (the swatch page at /design/brand) flips these
 * with everything else, for free.
 *
 * The eyes are always painted in the tile colour, so they read as holes
 * without being holes. That is exactly why an avatar tone could not be a
 * background change alone: invert the tile and the eyes invert with it, which
 * means every hued figure has to be re-measured against the new ground.
 *
 * - `sand`: the default. Paper tile, ink body.
 * - `ink`: the inverse. Ink tile, paper body.
 * - `tangerine`: the accent as a tile. Brand-orange tile, ink body. One per
 *   view, the same budget as the brand's orange button.
 * - `accent`: the accent as the mark. Paper tile, brand-orange body. The tone
 *   for a bare glyph (`tile={false}`) set in a line of type, where the three
 *   tile tones all leave it reading as one more ink letterform. The body takes
 *   `--color-tangerine-500`, the brand's graphics orange (the same step
 *   `--brand-accent` reads, and the same one `tangerine` puts in its tile), so
 *   a view spends the one orange budget on either this or `tangerine`.
 * - `success`, `warning`, `danger`: `accent`'s shape in the three state hues,
 *   for a readout where a row of glyphs has to say which agent finished,
 *   which one is asking and which one fell over. Paper tile again, so the
 *   eyes stay holes punched to paper and only the figure carries the state;
 *   these spend no orange budget, because they answer a different question
 *   from the accent's.
 *
 *   They read the raw ramps, not the theme-mapped `--success` / `--warning` /
 *   `--destructive`: the tile is paper in BOTH themes, so the body has one
 *   right answer in both, and a semantic that flips to its 500 step in the
 *   dark would leave a light figure on light paper. The steps are measured
 *   against that tile (#efefed), where a figure is a graphic and 3:1 is the
 *   floor — amber-600 at 4.3:1 and red-600 at 4.5:1, the same two steps the
 *   light theme maps `--warning` and `--destructive` to. Green goes one
 *   darker, to 700 (5.0:1), because green's luminance runs high at equal L
 *   and green-600 lands at 3.9:1: over the floor, but thin for a filled
 *   silhouette at avatar size. It is the step brand.css already picks for
 *   `--success`, for that same reason.
 *
 * - `avatar`: the hueless disc. In the light theme it is `sand` to the pixel
 *   — the same paper tile, the same ink body — so nothing about the light
 *   composer changed. In the dark it is a neutral-800 tile with a
 *   neutral-100 figure.
 * - `avatar-success`, `avatar-warning`, `avatar-danger`: the same three
 *   states as above, on whichever tile the theme is showing. Light is the
 *   paper measurement verbatim; dark lifts the figures two ramp steps to the
 *   400s, the way `--brand-accent` lifts tangerine-500 → 400 for the dark.
 *   brand.css carries both sets of numbers beside the declarations.
 */
export type GlyphTone =
  | "sand"
  | "ink"
  | "tangerine"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "avatar"
  | "avatar-success"
  | "avatar-warning"
  | "avatar-danger";

export const GLYPH_TONES: readonly GlyphTone[] = [
  "sand",
  "ink",
  "tangerine",
  "accent",
  "success",
  "warning",
  "danger",
  "avatar",
  "avatar-success",
  "avatar-warning",
  "avatar-danger",
];

export type TonePalette = {
  /** Tile fill, and the eye colour. */
  tile: string;
  /** Body fill, and the stage's corner squares. */
  body: string;
  /** The stage's dot grid. */
  dot: string;
};

export const TONE_PALETTES: Readonly<Record<GlyphTone, TonePalette>> = {
  sand: {
    tile: "var(--color-neutral-100)",
    body: "var(--color-neutral-950)",
    dot: "var(--color-neutral-300)",
  },
  ink: {
    tile: "var(--color-neutral-950)",
    body: "var(--color-neutral-100)",
    dot: "var(--color-neutral-800)",
  },
  tangerine: {
    tile: "var(--color-tangerine-500)",
    body: "var(--color-neutral-950)",
    dot: "var(--color-tangerine-400)",
  },
  // The field stays sand, so the eyes still read as holes punched to the paper
  // and the stage's dot grid stays quiet; only the figure takes the colour.
  accent: {
    tile: "var(--color-neutral-100)",
    body: "var(--color-tangerine-500)",
    dot: "var(--color-neutral-300)",
  },
  // The three states, on the same paper. The note above `GlyphTone` has why
  // these are ramp steps rather than the theme's semantics, and why green
  // sits a step darker than the other two.
  success: {
    tile: "var(--color-neutral-100)",
    body: "var(--color-green-700)",
    dot: "var(--color-neutral-300)",
  },
  warning: {
    tile: "var(--color-neutral-100)",
    body: "var(--color-amber-600)",
    dot: "var(--color-neutral-300)",
  },
  danger: {
    tile: "var(--color-neutral-100)",
    body: "var(--color-red-600)",
    dot: "var(--color-neutral-300)",
  },
  // The avatar family, and the only tones in this file that move with the
  // theme. Every value is one variable: brand.css holds both mappings and the
  // contrast measurement for each, so the numbers live next to the colours
  // rather than one file away from them.
  avatar: {
    tile: "var(--glyph-avatar)",
    body: "var(--glyph-avatar-figure)",
    dot: "var(--glyph-avatar-dot)",
  },
  "avatar-success": {
    tile: "var(--glyph-avatar)",
    body: "var(--glyph-avatar-success)",
    dot: "var(--glyph-avatar-dot)",
  },
  "avatar-warning": {
    tile: "var(--glyph-avatar)",
    body: "var(--glyph-avatar-warning)",
    dot: "var(--glyph-avatar-dot)",
  },
  "avatar-danger": {
    tile: "var(--glyph-avatar)",
    body: "var(--glyph-avatar-danger)",
    dot: "var(--glyph-avatar-dot)",
  },
};

/** Room between the drawing box and the tile edge: two modules a side. */
export const TILE_PAD = 2 * MODULE;
/** The tile's edge length in glyph units (the drawing box plus the pad). */
export const TILE_SIZE = GLYPH_BOX + 2 * TILE_PAD;
/** Corner radius of the tile: 22% of its edge, the soft rounded square the
    brand uses for app tiles. */
export const TILE_RADIUS = Math.round(TILE_SIZE * 0.22);

/** The tiled viewBox. Its origin sits at (−pad, −pad) so the shapes keep
    their own 0-140 coordinates. */
export const TILE_VIEWBOX = `${-TILE_PAD} ${-TILE_PAD} ${TILE_SIZE} ${TILE_SIZE}`;
/** The bare viewBox: just the drawing box. */
export const BARE_VIEWBOX = `0 0 ${GLYPH_BOX} ${GLYPH_BOX}`;
