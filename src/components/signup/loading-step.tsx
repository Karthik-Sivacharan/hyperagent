"use client";

import { useEffect, useState } from "react";

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

// How long each line holds. This was 850ms, chosen to keep three lines under
// the 2.5s where a wait starts to feel like a stall — but the screen now opens
// with the mark travelling in from the signin column, and a status list that
// starts sprinting the moment the mark lands makes the whole arrival feel
// rushed. At 1100ms a three-word line is read, understood and gone with room
// to spare, and the three of them plus the mark's travel put the wait at about
// 3.8s: long enough to read as work being done rather than a flicker.
const STEP_MS = 1100;

/**
 * How long the three lines take on their own, for the parent that owns the
 * step change. It is derived rather than written down twice: retune STEP_MS
 * and the screen still hands over on the last line rather than half a line
 * early or late.
 *
 * This is deliberately NOT the whole wait. The screen also holds a lead before
 * the first line while the mark is still travelling (see `leadMs`), and that
 * lead belongs to the mark, which signup-screen.tsx owns — so the parent adds
 * the two together rather than this file guessing at the travel.
 */
export const LOADING_SEQUENCE_MS = STEP_MS * STEPS.length;

const LINE =
  "col-start-1 row-start-1 text-center text-sm text-muted-foreground transition-opacity duration-(--duration-normal) ease-out motion-reduce:transition-none";

export function LoadingStep({
  /**
   * Dead air before the first line, for the mark's flight in from the signin
   * column. The status list has to wait it out rather than start at zero:
   * three lines that begin while the mark is still moving would spend their
   * first line competing with it, and the last line would then be the only one
   * the eye ever settles on. Zero under `prefers-reduced-motion`, where there
   * is no flight to wait for — the parent decides that, not this file.
   */
  leadMs = 0,
  className,
}: {
  leadMs?: number;
  className?: string;
}) {
  // -1 is "the mark is still arriving": no line is live, and the region below
  // is empty rather than showing a first line that would have to sit through
  // the flight. The sequence proper starts when this reaches 0.
  const [index, setIndex] = useState(-1);

  // One timer per line rather than a single interval: the effect re-runs on
  // each index, so a step that is already the last one simply schedules
  // nothing and the sequence stops on its own. The first hop is the lead
  // rather than a step, which is the only asymmetry.
  useEffect(() => {
    if (index >= STEPS.length - 1) return;
    const id = window.setTimeout(() => setIndex((i) => i + 1), index < 0 ? leadMs : STEP_MS);
    return () => window.clearTimeout(id);
  }, [index, leadMs]);

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {/* The mark's seat on this screen, and nothing else: the mark itself is
          rendered once in signup-screen.tsx and flown between the three seats,
          because an instance per screen replays its entrance on every swap —
          which is exactly the blink this screen used to open with. 44px, the
          size the mark scales down to while it works: small enough to read as
          a busy indicator rather than a logo. The parent finds this by its
          data attribute; it takes no ref and no props. */}
      <div data-mark-slot="loading" className="size-11" />

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
            // zero opacity and would otherwise be read out as well. While the
            // mark is still flying in, index is -1 and none of them is.
            aria-hidden={i === index ? undefined : true}
          >
            {step}
          </span>
        ))}
      </p>
    </div>
  );
}
