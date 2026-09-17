"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

// The one-shot "here it is" (docs/plans/2026-09-17-room-tracker.md §7). Three
// surfaces play it and they all play the same thing: the board card and the
// list row when someone clicks an agent in the conversation, and the message
// row when a card points back at where it came from. One component, so the
// answer looks the same whichever direction the reader asked from.
//
// It is keyed by a token rather than switched by a flag. A flag cannot say
// "the same agent, again": the second ask would set a value that was already
// set and nothing would move. Remounting on a new token replays it.
//
// NO HUE. This is a pointer, not a status. The board spends its two hues on
// the lane that is asking and the lane that is stuck, and a third colour here
// would be a third meaning for the reader to hold. The sheen and the ring are
// both foreground tints, which need no dark variant.
//
// MOTION. The sheen crosses on `slide` (480ms), the token for a large
// transform move, on its paired `out-quint`; the ring fades in behind it and
// out after, over the sheen plus a `reveal`. Reduced motion drops the sheen
// and keeps the ring: the answer still arrives, nothing travels to deliver it.
// Nothing here moves layout, so nothing around the element shifts while it
// plays.

// Not `as const`: motion types a transition's `times` as a mutable number[],
// and a readonly tuple is not assignable to it.
const SWEEP = { duration: DURATION.slide, ease: EASE.outQuint };
const RING = { duration: DURATION.slide + DURATION.reveal, times: [0, 0.16, 0.55, 1], ease: EASE.out };

/** The corner the pulse has to match, per surface. */
const RADIUS = {
  /** The full-bleed message row, which has no corner of its own. */
  none: "",
  /** The list row. */
  lg: "rounded-lg",
  /** The board card. */
  "2xl": "rounded-2xl",
} as const;

export function Pulse({
  token,
  radius = "lg",
  className,
}: {
  /** The ask this is, from `useRoomTracker().pulse`. Null plays nothing. */
  token: number | null;
  radius?: keyof typeof RADIUS;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (token === null) return null;
  const corner = RADIUS[radius];

  return (
    <span
      key={token}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", corner, className)}
    >
      <motion.span
        className={cn("absolute inset-0 inset-ring-2 inset-ring-tint-40", corner)}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={RING}
      />
      {reduceMotion ? null : (
        <motion.span
          // Wide enough to read as a pass of light rather than a bar, and its
          // travel is stated in its own widths, so it clears any element it is
          // laid over without knowing how wide that element is.
          className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-tint-20 to-transparent"
          initial={{ x: "-150%" }}
          animate={{ x: "450%" }}
          transition={SWEEP}
        />
      )}
    </span>
  );
}
