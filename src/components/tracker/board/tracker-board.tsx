"use client";

import * as React from "react";
import { LayoutGroup, useReducedMotion } from "motion/react";
import type { TrackerStatusMeta } from "@/components/tracker/status";
import { TrackerColumn, type TrackerDensity } from "@/components/tracker/board/tracker-column";

// The board half of the tracker shell: one lane per status, read left to
// right from what the person owes to what is finished. It names no status and
// holds no data. The vocabulary, the items, the card and the empty lines all
// arrive as props (docs/plans/2026-09-17-room-tracker.md §5), so /teams and a
// room draw the same board over different work and neither owns it. The lane
// is board/tracker-column.tsx; the card is the caller's `renderItem`.
//
// LAYOUT. The board brings its own 24px gutter, because the slot it fills has
// none. The lanes share the width between the floor and the ceiling `density`
// sets, 16px apart, and the folding lane starts folded to its header, so a
// page's five lanes fit 1456px with no sideways scroll. The row is
// `min-w-min`, so only when the lanes reach their floor does the board scroll
// sideways, gutter included. The board is one scroller in both directions,
// like a page: the lanes grow to their cards and their headers stick to the
// top.
//
// FOLDING. One lane folds, the last by default. It opens on a click, or by
// itself while a search finds an item in it, as the list's groups do. While
// it is open every lane may shrink one step (`narrow`), so at 1456 five open
// lanes still share the width and the first lane stays in view. Only on a
// narrower window does the open lane still overflow; a click then scrolls the
// board to its end to show the whole lane (smoothly unless the reader asks
// for less motion). Everything that moves is a `layout` node in one
// LayoutGroup. The scroller is deliberately not `layoutScroll`: motion then
// measures in view coordinates, so when folding the lane shrinks the row and
// the browser clamps the scroll back, the lanes slide back into place instead
// of jumping.
//
// KEYBOARD. Tab walks the cards and the folding lane's header; the arrow keys
// move between cards: up and down within a lane, left and right to the
// nearest card at the same height in the next lane that has any (a folded
// lane has none, so it is skipped). The walk finds the cards by
// `data-tracker-card`, which is why a `renderItem` has to put that attribute
// on the element it makes focusable: without it the card is still a tab stop,
// but the arrow keys pass it by.

const ARROWS: Record<string, [column: number, row: number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function cardsIn(lane: Element) {
  return Array.from(lane.querySelectorAll<HTMLElement>("[data-tracker-card]"));
}

function moveBetweenCards(event: React.KeyboardEvent<HTMLElement>) {
  const step = ARROWS[event.key];
  const card = event.target as HTMLElement;
  if (!step || !card.hasAttribute("data-tracker-card")) return;
  const lane = card.closest("[data-board-column]");
  if (!lane) return;
  const lanes = Array.from(event.currentTarget.querySelectorAll("[data-board-column]"));
  const row = cardsIn(lane).indexOf(card);

  let target: HTMLElement | undefined;
  if (step[1] !== 0) {
    target = cardsIn(lane)[row + step[1]];
  } else {
    for (let i = lanes.indexOf(lane) + step[0]; i >= 0 && i < lanes.length; i += step[0]) {
      const cards = cardsIn(lanes[i]);
      if (cards.length) {
        target = cards[Math.min(row, cards.length - 1)];
        break;
      }
    }
  }
  if (!target) return;
  event.preventDefault();
  target.focus();
}

export function TrackerBoard<S extends string, T>({
  statuses,
  meta,
  itemsByStatus,
  getKey,
  renderItem,
  noun,
  emptyCopy,
  searching,
  foldable,
  density = "default",
  searchEmpty,
  ariaLabel,
}: {
  /** Reading order, left to right. */
  statuses: readonly S[];
  meta: Record<S, TrackerStatusMeta>;
  /** Every status present, possibly empty. */
  itemsByStatus: Record<S, T[]>;
  getKey: (item: T) => string;
  /** Must carry `data-tracker-card` on its focusable element, or the arrow keys skip it. */
  renderItem: (item: T) => React.ReactNode;
  /** The word for one item and for several, so a lane header reads "Needs you, 4 runs". */
  noun: { one: string; many: string };
  /** The line an empty lane shows outside a search. */
  emptyCopy: Record<S, string>;
  /** A search is active, so an empty lane means "no match". */
  searching: boolean;
  /** The one lane that folds, folded at rest. Defaults to the last status; `null` folds nothing. */
  foldable?: S | null;
  /** Lane widths. `compact` is for a column narrower than a page. */
  density?: TrackerDensity;
  /** Shown instead of the lanes when a search keeps nothing at all. Without one the lanes stay, each saying "No matches". */
  searchEmpty?: React.ReactNode;
  ariaLabel: string;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const folding = foldable === undefined ? (statuses.length > 0 ? statuses[statuses.length - 1] : null) : foldable;

  // The fold, as the list keeps its groups': folded outside a search unless
  // the reader opened it; during one, open whenever it holds a match (a
  // result behind a fold reads as no result) until the reader toggles it.
  // The search-time choice resets each time a search starts (state adjusted
  // during render, not in an effect).
  const [openAtRest, setOpenAtRest] = React.useState(false);
  const [openInSearch, setOpenInSearch] = React.useState<boolean | null>(null);
  const [wasSearching, setWasSearching] = React.useState(searching);
  if (searching !== wasSearching) {
    setWasSearching(searching);
    setOpenInSearch(null);
  }
  const holdsMatch = folding !== null && itemsByStatus[folding].length > 0;
  const foldOpen = folding === null ? false : searching ? (openInSearch ?? holdsMatch) : openAtRest;

  const toggleFold = (open: boolean) => {
    if (searching) setOpenInSearch(open);
    else setOpenAtRest(open);
    if (!open) return;
    // After the commit (a click's update is flushed before the next frame).
    requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
      scroller.scrollTo({ left: scroller.scrollWidth, behavior: reduceMotion ? "auto" : "smooth" });
    });
  };

  // A search that keeps nothing at all gets one empty state, not a row of
  // empty lanes.
  const total = statuses.reduce((count, status) => count + itemsByStatus[status].length, 0);
  if (searching && total === 0 && searchEmpty) return <>{searchEmpty}</>;

  return (
    <div
      ref={scrollerRef}
      role="region"
      aria-label={ariaLabel}
      className="min-h-0 flex-1 overflow-auto overscroll-contain"
      onKeyDown={moveBetweenCards}
    >
      <LayoutGroup>
        <div className="flex w-full min-w-min gap-4 px-6 pb-6">
          {statuses.map((status) => (
            <TrackerColumn
              key={status}
              status={status}
              meta={meta[status]}
              items={itemsByStatus[status]}
              noun={noun}
              getKey={getKey}
              renderItem={renderItem}
              emptyCopy={emptyCopy[status]}
              searching={searching}
              density={density}
              narrow={foldOpen}
              {...(status === folding ? { open: foldOpen, onOpenChange: toggleFold } : {})}
            />
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
