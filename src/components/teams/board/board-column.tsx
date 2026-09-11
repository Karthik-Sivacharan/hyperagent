"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FleetRun, RunStatus } from "@/lib/mock/teams";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import { RUN_STATUS_META, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { RunCard } from "@/components/teams/board/run-card";

// One status lane: a header and a stack of cards 8px apart, with no ground
// of its own, so the cards sit on the page like /threads' rows. The header
// is the status glyph, the label and the count, sticky to the board's
// scroller so a long lane keeps its name. Only the Needs you glyph carries
// the accent; every other glyph is third-tier grey, because the label
// already says which lane it is.
//
// FOLDING. A lane given `onOpenChange` folds (the board folds Done, as the
// list does). Folded, it is its header alone, a ghost button sized to its
// content with a chevron; open, the same button over the cards, its chevron
// hidden at rest and shown on hover or focus, so the open lane reads like
// the others. The cards arrive on opacity; the move is the board's (the
// headers and cards around it slide on `layout`, board-view.tsx). Folding
// removes the cards at once and the lanes slide back.
//
// MOTION. When search changes the set, cards that leave pop out of the flow
// and fade at the exit speed, the rest slide into place on
// LAYOUT_TRANSITION, and cards that come back fade and settle in at 200ms.
// Layout is position only (`layout="position"`): a card's width follows the
// lane without a scale, so text and shadows never stretch mid-move. Nothing
// plays on first paint. Reduced motion is MotionConfig's job (teams-page):
// it drops every slide and keeps the fades.

const EMPTY_COPY: Record<RunStatus, string> = {
  "needs-you": "Nothing needs you right now",
  working: "No agent is working",
  queued: "The queue is clear",
  review: "Nothing waiting for review",
  done: "Nothing finished yet",
};

export function BoardColumn({
  status,
  runs,
  searching,
  queuePositions,
  open = true,
  onOpenChange,
}: {
  status: RunStatus;
  runs: FleetRun[];
  /** A search is active, so an empty lane means "no match", not "nothing here". */
  searching: boolean;
  queuePositions: Map<string, number>;
  /** Whether a foldable lane shows its cards. */
  open?: boolean;
  /** Makes the lane foldable. */
  onOpenChange?: (open: boolean) => void;
}) {
  const meta = RUN_STATUS_META[status];
  const headingId = React.useId();
  const listId = React.useId();
  const foldable = Boolean(onOpenChange);

  const label = (
    <>
      {/* The accent is spent on Needs you alone (polish plan §3). */}
      <RunStatusIcon status={status} className={meta.tone === "brand" ? undefined : "text-foreground-low"} />
      <span className="text-sm font-medium text-foreground">{meta.label}</span>
      <span className="text-sm font-normal text-foreground-low tabular-nums">
        <span className="sr-only">, </span>
        {runs.length}
        <span className="sr-only"> {runs.length === 1 ? "run" : "runs"}</span>
      </span>
    </>
  );

  return (
    <section
      aria-labelledby={headingId}
      data-board-column={status}
      // An open lane is `contain-inline-size`: its cards' one-line captions
      // would otherwise lend it their full width as a minimum, and the board
      // would scroll long before the lanes reached 240px.
      className={cn("relative flex flex-col", open ? "min-w-60 max-w-80 flex-1 contain-inline-size" : "flex-none")}
    >
      <motion.div layout="position" transition={LAYOUT_TRANSITION} className="sticky top-0 z-10 bg-background">
        {foldable ? (
          <h2 id={headingId} className="flex">
            <Button
              variant="ghost"
              size="none"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              onClick={() => onOpenChange?.(!open)}
              className="h-9 gap-2 px-3 aria-expanded:bg-transparent aria-expanded:hover:bg-tint-10"
            >
              {label}
              <IconChevronRight
                aria-hidden="true"
                className={cn(
                  "size-4 text-foreground-low transition-[opacity,rotate] duration-(--duration-exit) ease-out group-hover/button:duration-(--duration-fast) group-focus-visible/button:duration-(--duration-fast)",
                  open && "rotate-90 opacity-0 group-hover/button:opacity-100 group-focus-visible/button:opacity-100",
                )}
              />
            </Button>
          </h2>
        ) : (
          <h2 id={headingId} className="flex h-9 items-center gap-2 px-3">
            {label}
          </h2>
        )}
      </motion.div>

      {open ? (
        <motion.ul
          id={listId}
          className="relative flex flex-col gap-2 pt-1"
          // A foldable lane's cards arrive with it; a lane that is always
          // open is there from first paint and does not fade in.
          initial={foldable ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={LAYOUT_TRANSITION}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {runs.map((run) => (
              <motion.li
                key={run.id}
                layout="position"
                transition={LAYOUT_TRANSITION}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: DURATION.exit, ease: EASE.out } }}
              >
                <RunCard run={run} queuePosition={queuePositions.get(run.id)} />
              </motion.li>
            ))}
            {runs.length === 0 ? (
              <motion.li
                key="empty"
                layout="position"
                transition={LAYOUT_TRANSITION}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: DURATION.normal, ease: EASE.out, delay: DURATION.exit } }}
                exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
                className="truncate px-3 py-2 text-md text-foreground-low"
              >
                {searching ? "No matches" : EMPTY_COPY[status]}
              </motion.li>
            ) : null}
          </AnimatePresence>
        </motion.ul>
      ) : null}
    </section>
  );
}
