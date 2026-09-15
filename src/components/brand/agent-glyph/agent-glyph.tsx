import { GlyphSvg } from "./glyph-svg";
import { resolveGlyph } from "./registry";
import type { GlyphTone } from "./tones";
import type { GlyphShape } from "./types";

export type AgentGlyphProps = {
  /** The shape, or its registry id. */
  shape: GlyphShape | string;
  /** Rendered edge length in px. Square. Defaults to 40. */
  size?: number;
  /** Colourway. Defaults to `sand`. */
  tone?: GlyphTone;
  /**
   * Draw the rounded-square tile behind the glyph. Defaults to true. Without
   * it the eyes are still painted in the tone's tile colour, so a bare glyph
   * belongs on a surface of that colour.
   */
  tile?: boolean;
  /** Accessible name. Omit beside a visible name: the glyph is then
      `aria-hidden`, which is the avatar case. */
  label?: string;
  className?: string;
};

/**
 * A glyph at rest: the authored outline and eyes, no motion, no client code.
 * Safe in server components. For a glyph that changes shape, use
 * `MorphingAgentGlyph`; at rest both render the same markup.
 */
export function AgentGlyph({ shape, size = 40, tone = "sand", tile = true, label, className }: AgentGlyphProps) {
  const glyph = resolveGlyph(shape);
  return (
    <GlyphSvg
      body={glyph.body}
      eyes={glyph.eyes}
      tone={tone}
      tile={tile}
      size={size}
      label={label}
      className={className}
    />
  );
}
