"use client";

import type { AgentGlyphProps } from "./agent-glyph";
import { GlyphSvg } from "./glyph-svg";
import { resolveMotionProps, type GlyphMotionProps } from "./motion-props";
import { useGlyphMotion } from "./use-glyph-motion";

export type MorphingAgentGlyphProps = Omit<AgentGlyphProps, "shape"> & GlyphMotionProps;

/**
 * A glyph that changes shape. Server-renders the first shape's authored
 * drawing; on the client a `motion` clock drives the choreography and writes
 * the outline and eyes straight to the SVG. Below 64px it defaults to the
 * `quick` pace, the one for avatars in lists. Under `prefers-reduced-motion`
 * there is no tween, no blink and no autoplay: a controlled change is a short
 * fade through the tile, and a loop holds its first shape.
 */
export function MorphingAgentGlyph({
  size = 40,
  tone = "sand",
  tile = true,
  label,
  className,
  ...motionProps
}: MorphingAgentGlyphProps) {
  const resolved = resolveMotionProps(motionProps, size);
  const { initial, bodyRef, groupRef, eyeRef } = useGlyphMotion(resolved);
  if (!initial) return null;
  return (
    <GlyphSvg
      body={initial.body}
      eyes={initial.eyes}
      tone={tone}
      tile={tile}
      size={size}
      label={label}
      className={className}
      bodyRef={bodyRef}
      groupRef={groupRef}
      eyeRef={eyeRef}
    />
  );
}
