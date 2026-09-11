"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { FleetRun, RunStatus } from "@/lib/mock/teams";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import { RUN_STATUS_META, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { RunCard } from "@/components/teams/board/run-card";

// One status lane. The lane is the brand's grouping ground (surface-secondary,
// sunken in dark) and the cards on it are the tiles you act on (card + a
// hairline shadow), the two-ground pattern docs/brand/design.md §3.2 records;
// radii are concentric, a 22px lane around 18px cards 6-8px in. The header is
// the status glyph in its tone, the label and the count; the list below it
// scrolls on its own when the lane is taller than the view.
//
// MOTION. First paint only, the lane rises in, one lane after another at the
// brand's 80ms stagger (the board decides whether this is the first paint).
// After that the lane is still and only its cards move: when search changes
// the set, cards that leave pop out of the flow and fade at the exit speed,
// the rest slide into place on LAYOUT_TRANSITION, and cards that come back
// fade and settle in at 200ms. The scroller is `layoutScroll` so a scrolled
// lane measures its cards correctly. Reduced motion is MotionConfig's job
// (teams-page.tsx): it drops the rise and the slides and keeps the fades.

const EMPTY_COPY: Record<RunStatus, string> = {
  "needs-you": "Nothing needs you right now",
  working: "No agent is working",
  queued: "The queue is clear",
  review: "Nothing waiting for review",
  done: "Nothing finished yet",
};

export function BoardColumn({
  status,
  index,
  runs,
  searching,
  entrance,
  queuePositions,
}: {
  status: RunStatus;
  index: number;
  runs: FleetRun[];
  /** A search is active, so an empty lane means "no match", not "nothing here". */
  searching: boolean;
  /** Play the first-paint rise. */
  entrance: boolean;
  queuePositions: Map<string, number>;
}) {
  const meta = RUN_STATUS_META[status];
  const headingId = React.useId();

  return (
    <motion.section
      aria-labelledby={headingId}
      data-board-column={status}
      className="flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-3xl bg-surface-secondary"
      initial={entrance ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.enter, ease: EASE.outQuart, delay: index * DURATION.stagger }}
    >
      <header className="flex h-11 shrink-0 items-center gap-2 px-4">
        <RunStatusIcon status={status} />
        <h2 id={headingId} className="text-sm font-medium text-foreground">
          {meta.label}
        </h2>
        <span className="text-sm text-foreground-low tabular-nums">
          <span className="sr-only">, </span>
          {runs.length}
          <span className="sr-only"> {runs.length === 1 ? "run" : "runs"}</span>
        </span>
      </header>

      <motion.ul
        layoutScroll
        className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain px-2 pb-2 [scrollbar-color:var(--color-tint-40)_transparent] [scrollbar-width:thin]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {runs.map((run, row) => (
            <motion.li
              key={run.id}
              layout
              transition={LAYOUT_TRANSITION}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: DURATION.exit, ease: EASE.out } }}
            >
              <RunCard run={run} queuePosition={queuePositions.get(run.id)} phase={row * 0.55} />
            </motion.li>
          ))}
          {runs.length === 0 ? (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: DURATION.normal, ease: EASE.out, delay: DURATION.exit } }}
              exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
              className="flex items-center justify-center rounded-2xl border border-dashed border-border-subtle px-4 py-8 text-center text-md text-foreground-low"
            >
              {searching ? "No runs match your search" : EMPTY_COPY[status]}
            </motion.li>
          ) : null}
        </AnimatePresence>
      </motion.ul>
    </motion.section>
  );
}
