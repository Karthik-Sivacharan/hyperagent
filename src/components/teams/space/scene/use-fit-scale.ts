"use client";

import * as React from "react";

import { COLS, ROWS, TILE } from "@/components/teams/space/scene/world";

// The stage fills the view area and draws the map at the largest whole
// scale that fits it (2x at 1456x868: 1152x704 CSS px), so every art pixel
// is a whole number of screen pixels; the map is centred in what is left.
// Measured with a ResizeObserver; null until the first measure, which lands
// before the first paint (a layout effect), so the map never flashes at 1x.

export interface StageFit {
  scale: number;
  width: number;
  height: number;
  /** The map's offset inside the view area, in px (0 when it overflows). */
  left: number;
  top: number;
}

export function fitStage(width: number, height: number): StageFit {
  const scale = Math.max(1, Math.floor(Math.min(width / (COLS * TILE), height / (ROWS * TILE))));
  const w = COLS * TILE * scale;
  const h = ROWS * TILE * scale;
  return {
    scale,
    width: w,
    height: h,
    left: Math.max(0, Math.floor((width - w) / 2)),
    top: Math.max(0, Math.floor((height - h) / 2)),
  };
}

export function useFitStage(ref: React.RefObject<HTMLElement | null>): StageFit | null {
  const [fit, setFit] = React.useState<StageFit | null>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = fitStage(el.clientWidth, el.clientHeight);
      setFit((prev) =>
        prev && prev.scale === next.scale && prev.left === next.left && prev.top === next.top ? prev : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return fit;
}
