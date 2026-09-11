"use client";

import * as React from "react";
import { RUN_STATUS_ORDER } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { RunSearchEmpty } from "@/components/teams/fleet/run-search-empty";
import { useViewEntrance } from "@/components/teams/fleet/view-entrance";
import { BoardColumn } from "@/components/teams/board/board-column";

// The Board: the team's runs as a kanban, one lane per status in
// RUN_STATUS_ORDER, so the columns read left to right as what the human owes
// next (Needs you) through to what is finished (Devin's Sessions board, with
// Vibe Kanban's live cards and Linear's owner-plus-agent; the lane and the
// card are board/board-column.tsx and board/run-card.tsx).
//
// LAYOUT. The view slot (teams-page.tsx) is an absolutely positioned column
// with no padding, so the board brings its own 24px gutter. Lanes are a fixed
// 288px; when five of them do not fit, the board scrolls sideways and each
// lane scrolls on its own. The gutter sits on an inner `w-max` row rather
// than on the scroller, so the right-hand gutter survives horizontal scroll.
//
// FIRST PAINT. The lanes rise in once, when the board is the first view the
// page paints. Arriving on the board from another view is the view
// cross-fade's job (teams-page.tsx), so then the lanes render at rest; the
// page decides which it is (fleet/view-entrance.tsx).
//
// KEYBOARD. Tab walks the cards and the controls inside them; the arrow keys
// move between cards: up and down within a lane, left and right to the
// nearest card at the same height in the next lane that has any.

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
  const entrance = useViewEntrance();

  // A search that keeps no run at all gets one empty state, not five empty
  // lanes. The lanes it replaces come back at rest: their rise is a first
  // paint, and once a miss has happened this is no longer one (state
  // adjusted during render).
  const miss = searching && runs.length === 0;
  const [missed, setMissed] = React.useState(false);
  if (miss && !missed) setMissed(true);

  // The team's queue, oldest first (the mock lists each status newest first).
  // From every run, not the search result, so a search never renumbers it.
  const queuePositions = React.useMemo(() => {
    const queued = allRuns.filter((run) => run.status === "queued").reverse();
    return new Map(queued.map((run, i) => [run.id, i + 1]));
  }, [allRuns]);

  if (miss) return <RunSearchEmpty />;

  return (
    <div
      role="region"
      aria-label="Runs by status"
      className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain"
      onKeyDown={moveBetweenCards}
    >
      <div className="flex h-full w-max gap-3 px-6 pb-6">
        {RUN_STATUS_ORDER.map((status, index) => (
          <BoardColumn
            key={status}
            status={status}
            index={index}
            runs={runsByStatus[status]}
            searching={searching}
            entrance={entrance && !missed}
            queuePositions={queuePositions}
          />
        ))}
      </div>
    </div>
  );
}
