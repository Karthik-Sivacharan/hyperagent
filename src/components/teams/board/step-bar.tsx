import * as React from "react";
import { cn } from "@/lib/utils";

// A run's steps as a row of segments: finished steps filled in the working
// tone, the rest on the chart track. On a live run the segment for the step
// under way carries the card's one moving part, a soft band that sweeps it
// left to right, on the repo's own `@keyframes shimmer` (src/app/globals.css;
// the 200% tile and `reverse` are the same arithmetic as thread/shimmer.ts).
// Linear, because it is constant motion, not an arrival. `phase` offsets the
// cycle so a column of working cards does not pulse in lockstep; it is a
// negative delay derived from the card's position, never from the clock.
//
// Everything that moves is behind `motion-safe:`. Under reduced motion the
// live segment is a still half-tone, which still says "this one is next".

export function StepBar({
  done,
  total,
  live = false,
  phase = 0,
  className,
}: {
  done: number;
  total: number;
  live?: boolean;
  /** Seconds to offset the sweep by, so neighbours drift apart. */
  phase?: number;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("flex h-1 min-w-0 flex-1 items-stretch gap-0.5", className)}>
      {Array.from({ length: total }, (_, step) => {
        const current = live && step === done;
        return (
          <span
            key={step}
            className={cn(
              "min-w-0 flex-1 rounded-full",
              step < done && "bg-info",
              step > done && "bg-chart-track",
              step === done && !live && "bg-chart-track",
              current &&
                "bg-info/35 motion-safe:bg-info/20 motion-safe:bg-[linear-gradient(90deg,transparent,var(--color-info),transparent)] motion-safe:[background-size:200%_100%] motion-safe:animate-[shimmer_2.4s_linear_infinite_reverse]",
            )}
            style={current ? { animationDelay: `${-phase}s` } : undefined}
          />
        );
      })}
    </span>
  );
}
