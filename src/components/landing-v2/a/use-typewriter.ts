"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";

// A layout effect on the client, a harmless no-op on the server. The first
// client paint has to show the empty line rather than the finished one, or the
// type-on reads as a flicker, and only a layout effect lands before that paint.
// Plain `useLayoutEffect` warns when React renders this on the server.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Quick enough to read as a detail rather than a performance: about this long
// per character, and never longer than the cap however long the line runs.
const MS_PER_CHARACTER = 24;
const MAX_DURATION_MS = 840;

/**
 * Types `text` out on mount, and again from the start whenever `text` changes.
 *
 * The count comes from elapsed time inside one animation frame loop, so a run
 * is cancelled whole: switching fast can never interleave one line's
 * characters with the next one's. Under `prefers-reduced-motion: reduce` the
 * whole line is there on the first frame with nothing animating.
 *
 * The caller owns the layout: `typed` grows from empty, so render the finished
 * string underneath it to hold the height. `done` is for a caret that stops
 * when the line does.
 */
export function useTypewriter(text: string): { typed: string; done: boolean } {
  const reducedMotion = useReducedMotion() ?? false;
  // Server and first client render both hold the whole line: hydration matches,
  // and a visitor whose JavaScript never arrives still reads the request.
  const [count, setCount] = useState(text.length);

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) {
      setCount(text.length);
      return;
    }

    setCount(0);
    const duration = Math.min(text.length * MS_PER_CHARACTER, MAX_DURATION_MS);
    let frame = 0;
    let start = 0;

    const tick = (now: number) => {
      if (start === 0) start = now;
      const progress = duration > 0 ? Math.min((now - start) / duration, 1) : 1;
      setCount(Math.round(progress * text.length));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, text]);

  return { typed: text.slice(0, count), done: count >= text.length };
}
