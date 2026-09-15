"use client";

import type { AgentGlyphProps } from "./agent-glyph";
import { GlyphSvg } from "./glyph-svg";
import { resolveMotionProps, type GlyphMotionProps } from "./motion-props";
import { useGlyphMotion } from "./use-glyph-motion";

export type MorphingAgentGlyphProps = Omit<AgentGlyphProps, "shape"> & GlyphMotionProps;

/**
 * A glyph that changes shape. Server-renders the first shape's authored
 * drawing; on the client a `motion` clock drives the choreography and writes
 * the outline and eyes straight to the SVG. Under `prefers-reduced-motion`
 * there is no tween and no blink: each change is a short fade through the
 * tile.
 */
export function MorphingAgentGlyph({
  size = 40,
  tone = "sand",
  tile = true,
  label,
  className,
  ...motionProps
}: MorphingAgentGlyphProps) {
  const resolved = resolveMotionProps(motionProps);
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
