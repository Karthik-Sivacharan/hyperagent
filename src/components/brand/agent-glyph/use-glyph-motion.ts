"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { Choreography, GlyphFrame, GlyphPace } from "./choreography";
import { GlyphController, type GlyphMotionSettings } from "./glyph-controller";
import type { GlyphShape } from "./types";

export type GlyphMotionInput = {
  /** Controlled target. Wins over `sequence`. */
  shape?: GlyphShape;
  /** Autoplay loop, used when `shape` is not set. */
  sequence?: readonly GlyphShape[];
  /** Freeze on the `from` → `shape` transition at this linear time (0-1). */
  progress?: number;
  from?: GlyphShape;
  choreography: Choreography;
  pace: GlyphPace;
  hold: number;
  blink: boolean;
  glance: boolean;
  paused: boolean;
  onSettle?: (shape: GlyphShape) => void;
  onFrame?: (frame: GlyphFrame) => void;
};

/**
 * Wires a `GlyphController` to one glyph's SVG. Returns the refs to spread on
 * the markup and the shape to render first; after mount React never touches
 * the animated attributes again (the first render's values never change), so
 * the controller's writes are not overwritten.
 *
 * The controller is built and driven in layout effects, so a glyph that
 * mounts frozen mid-transition (`progress`) paints that frame first, not a
 * flash of its rest pose. It stops its clock while the glyph is scrolled out
 * of view or the tab is hidden.
 */
export function useGlyphMotion(input: GlyphMotionInput) {
  const bodyRef = useRef<SVGPathElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const eyeNodes = useRef<Array<SVGRectElement | null>>([null, null]);
  const eyeRef = useMemo(() => {
    const setters = [
      (node: SVGRectElement | null) => {
        eyeNodes.current[0] = node;
      },
      (node: SVGRectElement | null) => {
        eyeNodes.current[1] = node;
      },
    ];
    return (index: 0 | 1) => setters[index];
  }, []);

  const reducedMotion = useReducedMotion() ?? false;
  const scrubbing = input.progress !== undefined;

  // What the server renders and the first client paint shows, frozen for the
  // life of the component.
  const [initial] = useState<GlyphShape | undefined>(() => {
    if (!scrubbing) return input.shape ?? input.sequence?.[0];
    return (input.progress ?? 0) >= 1 ? input.shape : (input.from ?? input.shape);
  });

  const callbacks = useRef({ onSettle: input.onSettle, onFrame: input.onFrame });
  useEffect(() => {
    callbacks.current = { onSettle: input.onSettle, onFrame: input.onFrame };
  }, [input.onSettle, input.onFrame]);

  const controllerRef = useRef<GlyphController | null>(null);
  const { choreography, pace, hold, blink, glance, paused } = input;
  const settingsRef = useRef<GlyphMotionSettings>({
    choreography,
    pace,
    hold,
    blink,
    glance,
    paused,
    reducedMotion,
    visible: true,
  });

  useLayoutEffect(() => {
    if (!initial) return;
    const controller = new GlyphController(
      {
        body: () => bodyRef.current,
        eyes: () => eyeNodes.current,
        group: () => groupRef.current,
        onFrame: (frame) => callbacks.current.onFrame?.(frame),
        onSettle: (shape) => callbacks.current.onSettle?.(shape),
      },
      initial,
      settingsRef.current,
    );
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [initial]);

  useLayoutEffect(() => {
    settingsRef.current = { ...settingsRef.current, choreography, pace, hold, blink, glance, paused, reducedMotion };
    controllerRef.current?.update(settingsRef.current);
  }, [choreography, pace, hold, blink, glance, paused, reducedMotion]);

  // Off screen or in a hidden tab, nobody sees the glyph: stop its clock.
  // Written straight to the controller, never through React state.
  useEffect(() => {
    const svg = groupRef.current?.ownerSVGElement;
    if (!svg) return;
    let onScreen = true;
    const sync = () => {
      const visible = onScreen && document.visibilityState !== "hidden";
      if (visible === settingsRef.current.visible) return;
      settingsRef.current = { ...settingsRef.current, visible };
      controllerRef.current?.update(settingsRef.current);
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
            sync();
          });
    observer?.observe(svg);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // The sequence is compared by ids, so a parent that rebuilds the array
  // every render does not restart the loop.
  const sequenceKey = input.sequence?.map((shape) => shape.id).join("|") ?? "";
  const sequenceRef = useRef(input.sequence);
  // A layout effect, declared first, so the drive below reads this render's
  // sequence.
  useLayoutEffect(() => {
    sequenceRef.current = input.sequence;
  }, [input.sequence]);

  const { shape, from, progress } = input;
  useLayoutEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (progress !== undefined && shape) {
      controller.scrub(from ?? shape, shape, progress);
    } else if (shape) {
      controller.show(shape);
    } else if (sequenceRef.current) {
      controller.play(sequenceRef.current);
    }
  }, [shape, from, progress, sequenceKey, choreography, pace]);

  return { initial, bodyRef, groupRef, eyeRef };
}
