"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import { TrackerStatusIcon, type TrackerStatusMeta } from "@/components/tracker/status";

// One status lane of the tracker board: a header and a stack of items 8px
// apart, with no ground of its own, so the cards sit on the page like
// /threads' rows. The header is the status glyph, the label and the count,
// sticky to the board's scroller so a long lane keeps its name. The lane
// names no status and knows nothing about what it holds: its label, its glyph
// and its tone come from the status table the board was handed
// (tracker/status.tsx), and the card is whatever `renderItem` returns
// (docs/plans/2026-09-17-room-tracker.md §5).
//
// WIDTH. An open lane shares the row between a floor and a ceiling; `density`
// picks the pair, written out as literals because Tailwind's JIT only sees
// literal strings. `default` is a page's board, 240px to 320px; `compact` is a
// column narrower than a page, 208px to 288px. `narrow` drops the floor one
// step, which is what lets five open lanes still share a page's width.
//
// FOLDING. A lane given `onOpenChange` folds (a board folds one lane, as the
// list does). Folded, it is its header alone, a ghost button sized to its
// content with a chevron; open, the same button over the cards, its chevron
// hidden at rest and shown on hover or focus, so the open lane reads like the
// others. The cards arrive on opacity; the move is the board's (the headers
// and cards around it slide on `layout`, tracker-board.tsx). Folding removes
// the cards at once and the lanes slide back.
//
// MOTION. When search changes the set, cards that leave pop out of the flow
// and fade at the exit speed, the rest slide into place on LAYOUT_TRANSITION,
// and cards that come back fade and settle in at 200ms. Layout is position
// only (`layout="position"`): a card's width follows the lane without a
// scale, so text and shadows never stretch mid-move. Nothing plays on first
// paint. Reduced motion is MotionConfig's job, on the page that renders the
// board: it drops every slide and keeps the fades.

export type TrackerDensity = "default" | "compact";

/** The floor, the narrowed floor and the ceiling per density, as literals Tailwind can see. */
const LANE_WIDTH: Record<TrackerDensity, { max: string; wide: string; narrow: string }> = {
  default: { max: "max-w-80", wide: "min-w-60", narrow: "min-w-52" },
  compact: { max: "max-w-72", wide: "min-w-52", narrow: "min-w-48" },
};

export function TrackerColumn<T>({
  status,
  meta,
  items,
  noun,
  getKey,
  renderItem,
  emptyCopy,
  searching,
  density = "default",
  narrow = false,
  open = true,
  onOpenChange,
}: {
  /** The status this lane holds. It goes on `data-board-column`, which the board's arrow keys walk. */
  status: string;
  meta: TrackerStatusMeta;
  items: T[];
  /** The word for one item and for several, so the count reads "Needs you, 4 runs". */
  noun: { one: string; many: string };
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  /** The line this lane shows when it is empty outside a search. */
  emptyCopy: string;
  /** A search is active, so an empty lane means "no match", not "nothing here". */
  searching: boolean;
  /** Lane widths: `compact` is for a column narrower than a page. */
  density?: TrackerDensity;
  /** Lets an open lane shrink one step (the board sets it while the folding lane is open). */
  narrow?: boolean;
  /** Whether a foldable lane shows its items. */
  open?: boolean;
  /** Makes the lane foldable. */
  onOpenChange?: (open: boolean) => void;
}) {
  const headingId = React.useId();
  const listId = React.useId();
  const foldable = Boolean(onOpenChange);
  const width = LANE_WIDTH[density];

  const label = (
    <>
      <TrackerStatusIcon meta={meta} />
      <span className="text-sm font-medium text-foreground">{meta.label}</span>
      <span className="text-sm font-normal text-foreground-low tabular-nums">
        <span className="sr-only">, </span>
        {items.length}
        <span className="sr-only"> {items.length === 1 ? noun.one : noun.many}</span>
      </span>
    </>
  );

  return (
    <section
      aria-labelledby={headingId}
      data-board-column={status}
      // An open lane is `contain-inline-size`: its cards' one-line captions
      // would otherwise lend it their full width as a minimum, and the board
      // would scroll long before the lanes reached their floor.
      className={cn(
        "relative flex flex-col",
        open ? cn(width.max, "flex-1 contain-inline-size", narrow ? width.narrow : width.wide) : "flex-none",
      )}
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
                  "size-3.5 text-foreground-low transition-[opacity,rotate] duration-(--duration-exit) ease-out group-hover/button:duration-(--duration-fast) group-focus-visible/button:duration-(--duration-fast)",
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
            {items.map((item) => (
              <motion.li
                key={getKey(item)}
                layout="position"
                transition={LAYOUT_TRANSITION}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: DURATION.exit, ease: EASE.out } }}
              >
                {renderItem(item)}
              </motion.li>
            ))}
            {items.length === 0 ? (
              <motion.li
                key="empty"
                layout="position"
                transition={LAYOUT_TRANSITION}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: DURATION.normal, ease: EASE.out, delay: DURATION.exit } }}
                exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
                className="truncate px-3 py-2 text-md text-foreground-low"
              >
                {searching ? "No matches" : emptyCopy}
              </motion.li>
            ) : null}
          </AnimatePresence>
        </motion.ul>
      ) : null}
    </section>
  );
}
