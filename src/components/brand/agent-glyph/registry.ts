import { ORIGINAL_SHAPES } from "./shapes/original";
import { STUDY_SHAPES } from "./shapes/study";
import type { GlyphSet, GlyphShape } from "./types";

/** Both sets, each in its loop order. */
export const GLYPH_SETS: Readonly<Record<GlyphSet, readonly GlyphShape[]>> = {
  study: STUDY_SHAPES,
  original: ORIGINAL_SHAPES,
};

/** Every registered shape: the study set, then the original set. */
export const ALL_GLYPHS: readonly GlyphShape[] = [...STUDY_SHAPES, ...ORIGINAL_SHAPES];

const byId = new Map(ALL_GLYPHS.map((shape) => [shape.id, shape]));

export function findGlyph(id: string): GlyphShape | undefined {
  return byId.get(id);
}

/** A shape by id; throws on an unknown id so a typo fails loudly. */
export function getGlyph(id: string): GlyphShape {
  const shape = byId.get(id);
  if (!shape) throw new Error(`Unknown agent glyph "${id}"`);
  return shape;
}

/** Accepts a shape or its id, as every glyph component's `shape` prop does. */
export function resolveGlyph(shape: GlyphShape | string): GlyphShape {
  return typeof shape === "string" ? getGlyph(shape) : shape;
}

/** The set the product loops through by default: the originals once they
    exist, the study set until then. */
export function defaultSequence(): readonly GlyphShape[] {
  return ORIGINAL_SHAPES.length > 0 ? ORIGINAL_SHAPES : STUDY_SHAPES;
}
