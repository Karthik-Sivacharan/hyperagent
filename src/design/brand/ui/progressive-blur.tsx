import * as React from "react";

import { cn } from "@/design/brand/utils";

/**
 * Progressive blur — a stack of masked `backdrop-filter` layers whose blur
 * radius steps from `blur` down to 0 across the element, plus a surface fade
 * in the canvas colour. This is the exact construction the brand site uses for its
 * fixed header and mobile bar (12 layers, 6px → 0, 8.33% mask bands, layers
 * overhanging the far edge by 6px so the blur has pixels to sample).
 *
 * Place inside a `relative` container; it fills it (`absolute inset-0`).
 */
export function ProgressiveBlur({
  direction = "top",
  blur = 6,
  layers = 12,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** Which edge is solid: `top` for a header, `bottom` for a bar. */
  direction?: "top" | "bottom";
  /** Blur radius (px) at the solid edge. */
  blur?: number;
  layers?: number;
}) {
  const toward = direction === "top" ? "to bottom" : "to top";
  const band = 100 / layers;
  const layerStyles = Array.from({ length: layers }, (_, i) => {
    const n = i + 1;
    const amount = (blur * (layers - i - 1)) / (layers - 1);
    const stops =
      n === 1
        ? `black 0%, black ${band}%, transparent ${band + 10}%`
        : n === layers
          ? `transparent ${Math.max(0, (n - 1) * band - 10)}%, black ${(n - 1) * band}%, black 100%`
          : `transparent ${Math.max(0, (n - 1) * band - 10)}%, black ${(n - 1) * band}%, black ${n * band}%, transparent ${Math.min(100, n * band + 10)}%`;
    const mask = `linear-gradient(${toward}, ${stops})`;
    return {
      backdropFilter: `blur(${amount.toFixed(4)}px)`,
      WebkitBackdropFilter: `blur(${amount.toFixed(4)}px)`,
      maskImage: mask,
      WebkitMaskImage: mask,
      maskPosition: direction,
      WebkitMaskPosition: direction,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskSize: "100% calc(100% - 6px)",
      WebkitMaskSize: "100% calc(100% - 6px)",
      transform: "translateZ(0)",
    } as React.CSSProperties;
  });

  // Canvas fade: eased alpha ramp from the solid edge (measured on the brand site).
  const fadeAlphas = [100, 98.88, 95.7, 90.77, 84.38, 76.81, 68.36, 59.33, 50, 40.67, 31.64, 23.19, 15.63, 9.23, 4.3, 1.12, 0];
  const fade = `linear-gradient(${toward}, ${fadeAlphas
    .map((a, i) => `color-mix(in srgb, var(--background) ${a}%, transparent) ${(i * 100) / (fadeAlphas.length - 1)}%`)
    .join(", ")})`;

  return (
    <div
      aria-hidden="true"
      data-slot="progressive-blur"
      data-direction={direction}
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      {...props}
    >
      <div className="absolute inset-x-0" style={direction === "top" ? { top: 0, height: "calc(100% + 6px)" } : { bottom: 0, height: "calc(100% + 6px)" }}>
        {layerStyles.map((style, i) => (
          <div key={i} data-blur-layer={i + 1} className="absolute inset-0" style={style} />
        ))}
      </div>
      <div
        data-slot="progressive-blur-surface-fade"
        className="absolute inset-x-0"
        style={direction === "top" ? { top: 0, bottom: 8, backgroundImage: fade } : { bottom: 0, top: 8, backgroundImage: fade }}
      />
    </div>
  );
}
