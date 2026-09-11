"use client";

import * as React from "react";
import { LayoutGroup, useReducedMotion } from "motion/react";
import { RUN_STATUS_ORDER } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { RunSearchEmpty } from "@/components/teams/fleet/run-search-empty";
import { BoardColumn } from "@/components/teams/board/board-column";

// The Board: what each run needs next, one lane per status in
// RUN_STATUS_ORDER, read left to right from what the human owes (Needs you)
// to what is finished (Done). The lane and the card are
// board/board-column.tsx and board/run-card.tsx.
//
// LAYOUT. The view slot (teams-page.tsx) is an absolutely positioned column
// with no padding, so the board brings its own 24px gutter. The lanes share
// the width, each between 240px and 320px, 16px apart; Done starts folded to
// its header, so at 1456px four lanes and the folded Done fit with no
// sideways scroll. The row is `min-w-min`, so only when the lanes reach
// 240px does the board scroll sideways, gutter included. The board is one
// scroller in both directions, like a page: the lanes grow to their cards
// and their headers stick to the top.
//
// FOLDING DONE. Done opens on a click, or by itself while a search finds a
// run in it, as the list's groups do. While it is open every lane may shrink
// to 208px instead of 240px, so at 1456 the five open lanes still share the
// width (about 218px each) and Needs you stays in view. Only on a narrower
// window does the open lane still overflow; a click then scrolls the board
// to its end to show the whole lane (smoothly unless the reader asks for
// less motion). Everything that moves is a `layout` node in one
// LayoutGroup. The scroller is deliberately not `layoutScroll`: motion then
// measures in view coordinates, so when folding Done shrinks the row and the
// browser clamps the scroll back, the lanes slide back into place instead of
// jumping.
//
// KEYBOARD. Tab walks the cards and the Done header; the arrow keys move
// between cards: up and down within a lane, left and right to the nearest
// card at the same height in the next lane that has any (a folded lane has
// none, so it is skipped).

const ARROWS: Record<string, [column: number, row: number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function cardsIn(lane: Element) {
  return Array.from(lane.querySelectorAll<HTMLElement>("[data-run-card]"));
}

function moveBetweenCards(event: React.KeyboardEvent<HTMLElement>) {
  const step = ARROWS[event.key];
  const card = event.target as HTMLElement;
  if (!step || !card.hasAttribute("data-run-card")) return;
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

export function BoardView() {
  const { runs, runsByStatus, allRuns, query } = useFleet();
  const searching = query.trim().length > 0;
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Done's fold, as the list keeps its groups': folded outside a search
  // unless the reader opened it; during one, open whenever it holds a match
  // (a result behind a fold reads as no result) until the reader toggles it.
  // The search-time choice resets each time a search starts (state adjusted
  // during render, not in an effect).
  const [doneOpenAtRest, setDoneOpenAtRest] = React.useState(false);
  const [doneOpenInSearch, setDoneOpenInSearch] = React.useState<boolean | null>(null);
  const [wasSearching, setWasSearching] = React.useState(searching);
  if (searching !== wasSearching) {
    setWasSearching(searching);
    setDoneOpenInSearch(null);
  }
  const doneOpen = searching ? (doneOpenInSearch ?? runsByStatus.done.length > 0) : doneOpenAtRest;

  // The team's queue, oldest first (the mock lists each status newest first).
  // From every run, not the search result, so a search never renumbers it.
  // Cards say it to screen readers only.
  const queuePositions = React.useMemo(() => {
    const queued = allRuns.filter((run) => run.status === "queued").reverse();
    return new Map(queued.map((run, i) => [run.id, i + 1]));
  }, [allRuns]);

  const toggleDone = (open: boolean) => {
    if (searching) setDoneOpenInSearch(open);
    else setDoneOpenAtRest(open);
    if (!open) return;
    // After the commit (a click's update is flushed before the next frame).
    requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
      scroller.scrollTo({ left: scroller.scrollWidth, behavior: reduceMotion ? "auto" : "smooth" });
    });
  };

  // A search that keeps no run at all gets one empty state, not five empty
  // lanes.
  if (searching && runs.length === 0) return <RunSearchEmpty />;

  return (
    <div
      ref={scrollerRef}
      role="region"
      aria-label="Runs by status"
      className="min-h-0 flex-1 overflow-auto overscroll-contain"
      onKeyDown={moveBetweenCards}
    >
      <LayoutGroup>
        <div className="flex w-full min-w-min gap-4 px-6 pb-6">
          {RUN_STATUS_ORDER.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              runs={runsByStatus[status]}
              searching={searching}
              queuePositions={queuePositions}
              narrow={doneOpen}
              {...(status === "done" ? { open: doneOpen, onOpenChange: toggleDone } : {})}
            />
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
