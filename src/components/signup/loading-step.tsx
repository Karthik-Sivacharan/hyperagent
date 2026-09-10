"use client";

import { useEffect, useState } from "react";

import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { cn } from "@/lib/utils";

// What the screen says while the identity provider is being read back. Three
// lines, in the order the work actually happens, so the wait explains itself
// instead of just occupying time. Nothing here is real — this repo is static
// mock data (docs/clone-conventions.md) — but the sequence is the one the real
// flow would run: the OAuth round trip, the ID token, then the enrichment
// lookup that turns a work domain into a company.
const STEPS = [
  "Signing in with Google",
  "Reading your profile",
  "Finding your company",
];

// How long each line holds. 850ms is long enough to read a three-word line and
// short enough that three of them stay under the 2.5s where a wait starts to
// feel like a stall. The last line does NOT get its own dwell: the parent
// switches screens on it, so the total is 3 x 850 = 2550ms and the third line
// is on screen for the tail of it.
const STEP_MS = 850;

/**
 * How long the whole wait runs, for the parent that owns the step change. It
 * is derived rather than written down twice: retune STEP_MS and the screen
 * still hands over on the last line rather than half a line early or late.
 */
export const LOADING_TOTAL_MS = STEP_MS * STEPS.length;

// 44px, not the signup landing page's 64: small enough to read as a busy
// indicator rather than a logo, and still clear of material-mark.tsx's own
// 40px filter gate — below that its rims go sub-pixel and the mark turns to
// mud. See MATERIAL_MIN_PX there.
const SPINNER_PX = 44;

const LINE =
  "col-start-1 row-start-1 text-center text-sm text-muted-foreground transition-opacity duration-(--duration-normal) ease-out motion-reduce:transition-none";

export function LoadingStep({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  // One timer per line rather than a single interval: the effect re-runs on
  // each index, so a step that is already the last one simply schedules
  // nothing and the sequence stops on its own.
  useEffect(() => {
    if (index >= STEPS.length - 1) return;
    const id = window.setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [index]);

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {/* `spin="auto"` is the busy loop: one turn, a beat of stillness, another
          turn. It takes no hover and no cursor in that mode — there is nothing
          to click here. Reduced motion drops the loop and leaves a still mark,
          which is why the status line below has to carry the "still working"
          signal on its own; it changes text three times either way. */}
      <MaterialMark size={SPINNER_PX} spin="auto" />

      {/* The three lines share one grid cell, so the region is as tall as the
          tallest of them and swapping one for another moves nothing. Same
          device as the provider/email panel swap in signup-screen.tsx, and the
          same reason: no layout shift under a crossfade. */}
      <p
        role="status"
        aria-live="polite"
        className="mt-6 grid w-full"
      >
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={cn(LINE, i === index ? "opacity-100" : "opacity-0")}
            // Only the live line is announced; the other two are painted at
            // zero opacity and would otherwise be read out as well.
            aria-hidden={i === index ? undefined : true}
          >
            {step}
          </span>
        ))}
      </p>
    </div>
  );
}
