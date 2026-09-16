import { GLYPH_BOX, MODULE } from "./types";

/**
 * The glyph's colourways. A glyph is artwork, like the mark: an agent keeps
 * the same face in the light and the dark theme, so tones read the brand
 * ramps directly (`--color-*` primitives in brand.css) rather than the
 * theme-mapped semantics. The eyes are always painted in the tile colour, so
 * they read as holes without being holes.
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
 */
export type GlyphTone = "sand" | "ink" | "tangerine" | "accent";

export const GLYPH_TONES: readonly GlyphTone[] = [
  "sand",
  "ink",
  "tangerine",
  "accent",
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
