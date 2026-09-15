import type { Ref } from "react";

import {
  BARE_VIEWBOX,
  TILE_PAD,
  TILE_RADIUS,
  TILE_SIZE,
  TILE_VIEWBOX,
  TONE_PALETTES,
  type GlyphTone,
} from "./tones";
import type { EyeRect } from "./types";

/**
 * The glyph's markup, shared by the static and the animated glyph so both
 * paint the same pixels at rest. No hooks, no state: the animated glyph
 * passes refs and writes the attributes itself, frame by frame.
 */
export type GlyphSvgProps = {
  body: string;
  /** SVG transform on the body alone (a frame caught in a cut's entry pose). */
  bodyTransform?: string | null;
  eyes: readonly [EyeRect, EyeRect];
  tone: GlyphTone;
  tile: boolean;
  size: number;
  label?: string;
  className?: string;
  bodyRef?: Ref<SVGPathElement>;
  groupRef?: Ref<SVGGElement>;
  eyeRef?: (index: 0 | 1) => Ref<SVGRectElement>;
};

export function GlyphSvg({
  body,
  bodyTransform,
  eyes,
  tone,
  tile,
  size,
  label,
  className,
  bodyRef,
  groupRef,
  eyeRef,
}: GlyphSvgProps) {
  const palette = TONE_PALETTES[tone];
  return (
    <svg
      width={size}
      height={size}
      viewBox={tile ? TILE_VIEWBOX : BARE_VIEWBOX}
      fill="none"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-agent-glyph={tone}
    >
      {tile ? (
        <rect x={-TILE_PAD} y={-TILE_PAD} width={TILE_SIZE} height={TILE_SIZE} rx={TILE_RADIUS} fill={palette.tile} />
      ) : null}
      <g ref={groupRef}>
        {/* Nonzero fill: a mid-morph outline that crosses itself still
            paints solid instead of punching a hole. */}
        <path
          ref={bodyRef}
          d={body}
          transform={bodyTransform ?? undefined}
          fill={palette.body}
          fillRule="nonzero"
        />
        {eyes.map((eye, index) => (
          <rect
            key={index}
            ref={eyeRef?.(index as 0 | 1)}
            x={eye.x}
            y={eye.y}
            width={eye.width}
            height={eye.height}
            rx={eye.radius}
            fill={palette.tile}
          />
        ))}
      </g>
    </svg>
  );
}
