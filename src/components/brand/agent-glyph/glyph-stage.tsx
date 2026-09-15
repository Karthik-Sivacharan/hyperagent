"use client";

import { useCallback, useRef, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { EXPRESSIVE_MIN_SIZE, glyphOutline, type GlyphFrame } from "./choreography";
import type { BBox } from "./geometry";
import { resolveMotionProps, type GlyphMotionProps } from "./motion-props";
import { TONE_PALETTES, type GlyphTone } from "./tones";
import { GLYPH_BOX, MODULE } from "./types";
import { useGlyphMotion } from "./use-glyph-motion";

/* The stage in glyph units: the drawing box centred in a 15 : 11 field, the
   proportions of the landing row it was drawn for. */
const STAGE_W = 300;
const STAGE_H = 220;
const ORIGIN_X = (STAGE_W - GLYPH_BOX) / 2;
const ORIGIN_Y = (STAGE_H - GLYPH_BOX) / 2;
/** Corner squares: 1.2 modules, sharp. */
const CORNER = 1.2 * MODULE;
/** Clear space between the body's bounding box and the corner squares. */
const CORNER_GAP = 1.4 * MODULE;
/** Dot grid pitch and dot size, in CSS px (the grid does not scale with the
    stage, like a page texture). */
const DOT_PITCH = 13;
const DOT_SIZE = 1.5;

type Corner = { x: number; y: number };

function cornersFor(box: BBox): Corner[] {
  const left = ORIGIN_X + box.x - CORNER_GAP - CORNER;
  const top = ORIGIN_Y + box.y - CORNER_GAP - CORNER;
  const right = ORIGIN_X + box.x + box.width + CORNER_GAP;
  const bottom = ORIGIN_Y + box.y + box.height + CORNER_GAP;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: left, y: bottom },
    { x: right, y: bottom },
  ];
}

export type GlyphStageProps = GlyphMotionProps & {
  /** Colourway: the stage paints the tile colour, the dots and the body. */
  tone?: GlyphTone;
  /** Accessible name; omit when a visible label names the glyph. */
  label?: string;
  /** Sizing is the caller's: the stage fills its width at 15 : 11. */
  className?: string;
};

/**
 * The landing-page presentation: a dot-grid field, the glyph, and four corner
 * squares that ease to the body's bounding box as it changes shape. Autoplays
 * the shipping set unless given a `shape` or a `sequence`.
 */
export function GlyphStage({ tone = "sand", label, className, ...motionProps }: GlyphStageProps) {
  const palette = TONE_PALETTES[tone];
  const cornersRef = useRef<SVGGElement>(null);

  const onFrame = useCallback((frame: GlyphFrame) => {
    const nodes = cornersRef.current?.children;
    if (!nodes) return;
    cornersFor(frame.box).forEach((corner, index) => {
      nodes[index]?.setAttribute("x", String(corner.x));
      nodes[index]?.setAttribute("y", String(corner.y));
    });
  }, []);

  // The stage is a hero presentation at any width: expressive unless told.
  const resolved = resolveMotionProps(motionProps, EXPRESSIVE_MIN_SIZE);
  const { initial, bodyRef, groupRef, eyeRef } = useGlyphMotion({ ...resolved, onFrame });

  const style = {
    backgroundColor: palette.tile,
    // Square dots from two stripes: dot-coloured columns, masked by
    // tile-coloured rows everywhere but the last 1.5px of each cell.
    backgroundImage: `linear-gradient(to bottom, ${palette.tile} ${DOT_PITCH - DOT_SIZE}px, transparent ${DOT_PITCH - DOT_SIZE}px), linear-gradient(to right, ${palette.dot} ${DOT_SIZE}px, transparent ${DOT_SIZE}px)`,
    backgroundSize: `${DOT_PITCH}px ${DOT_PITCH}px`,
  } satisfies CSSProperties;

  if (!initial) return null;
  const corners = cornersFor(glyphOutline(initial).bbox);

  return (
    <div
      className={cn("relative aspect-[15/11] w-full overflow-hidden", className)}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} fill="none" className="absolute inset-0 size-full">
        <g ref={cornersRef}>
          {corners.map((corner, index) => (
            <rect key={index} x={corner.x} y={corner.y} width={CORNER} height={CORNER} fill={palette.body} />
          ))}
        </g>
        <g transform={`translate(${ORIGIN_X} ${ORIGIN_Y})`}>
          <g ref={groupRef}>
            <path ref={bodyRef} d={initial.body} fill={palette.body} fillRule="nonzero" />
            {initial.eyes.map((eye, index) => (
              <rect
                key={index}
                ref={eyeRef(index as 0 | 1)}
                x={eye.x}
                y={eye.y}
                width={eye.width}
                height={eye.height}
                rx={eye.radius}
                fill={palette.tile}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
