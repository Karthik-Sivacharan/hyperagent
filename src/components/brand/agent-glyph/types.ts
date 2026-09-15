/**
 * The agent glyph contract. A glyph is a solid silhouette with two eyes,
 * drawn on a 14 × 14 module grid (1 module = 10 units, so the drawing box is
 * 140 × 140) and shown inside a rounded-square tile.
 *
 * Every body is authored so that any two glyphs can morph into each other:
 * one closed outline, no holes, clockwise, absolute M/L/H/V/A/Z commands only.
 * The runtime resamples outlines to matching point lists for the tween and
 * renders the authored path at rest.
 */

/** Units per grid module. The drawing box is `GRID_MODULES * MODULE` wide. */
export const MODULE = 10;
export const GRID_MODULES = 14;
export const GLYPH_BOX = MODULE * GRID_MODULES;

/** An eye in drawing-box units, painted in the tile colour over the body. */
export type EyeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

/**
 * A pose the body takes for a beat right after a hard cut, before it settles
 * to rest. Transforms are about the body's bounding-box centre.
 */
export type EntryPose = {
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
};

/**
 * `study` shapes reproduce the reference drawings and exist to learn the
 * grammar; `original` shapes are the family the product ships.
 */
export type GlyphSet = "study" | "original";

export type GlyphShape = {
  /** Kebab-case, unique across both sets. */
  id: string;
  /** Display name for the preview page. */
  name: string;
  set: GlyphSet;
  /**
   * One closed subpath in the 140 × 140 box: starts with `M` at the left end
   * of the topmost edge, runs clockwise, ends with `Z`. Absolute `M L H V A Z`
   * only.
   */
  body: string;
  /** Left eye, then right eye. Both sit fully inside the body. */
  eyes: readonly [EyeRect, EyeRect];
  /** Optional settle beat for the hard-cut choreography. */
  entry?: EntryPose;
  /** Optional one-line hint of the kind of agent this glyph suits. */
  archetype?: string;
};
