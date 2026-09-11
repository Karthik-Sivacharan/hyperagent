// The office's furniture: one absolutely positioned sprite per piece, at the
// same scale as the floor canvas. It returns a fragment on purpose: render it
// as direct children of the stage that also holds the characters, so desks,
// plants and characters share one stacking context and sort by `zIndex`
// (`Furniture.z * scale`, the bottom edge of the row a piece stands on). A
// character behind a desk is covered by it; one sitting at it is drawn over
// the chair. Decorative only: hidden from assistive tech, never hit-testable.
// Softened in dark exactly as the floor canvas is.

import type { CSSProperties } from "react";

import { FURNITURE, TILE, type Furniture } from "./map";

function pieceStyle(f: Furniture, scale: number): CSSProperties {
  return {
    left: (f.x * TILE + (f.dx ?? 0)) * scale,
    top: (f.y * TILE + (f.dy ?? 0)) * scale,
    width: f.w * scale,
    height: f.h * scale,
    zIndex: f.z * scale,
    backgroundImage: `url(${f.src})`,
    transform: f.flip ? "scaleX(-1)" : undefined,
  };
}

export function FurnitureLayer({ scale }: { scale: number }) {
  return (
    <>
      {FURNITURE.map((f) => (
        <span
          key={f.id}
          aria-hidden="true"
          data-piece={f.id}
          className="pointer-events-none absolute block select-none bg-size-[100%_100%] bg-no-repeat [image-rendering:pixelated] dark:brightness-90"
          style={pieceStyle(f, scale)}
        />
      ))}
    </>
  );
}
