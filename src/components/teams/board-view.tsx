"use client";

import * as React from "react";
import { RUN_STATUS_ORDER, type RunStatus } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { RUN_STATUS_META } from "@/components/teams/fleet/run-status";
import { RunSearchEmpty } from "@/components/teams/fleet/run-search-empty";
import { RunCard } from "@/components/teams/board/run-card";
import { TrackerBoard } from "@/components/tracker/board/tracker-board";

// The Board: what each run needs next, one lane per status in
// RUN_STATUS_ORDER, read left to right from what the human owes (Needs you)
// to what is finished (Done, folded to its header until it is asked for).
//
// The board is the shared tracker shell (tracker/board/tracker-board.tsx,
// docs/plans/2026-09-17-room-tracker.md §2). The lanes and their widths, the
// fold and the scroll it triggers, the sticky headers, the motion and the
// arrow-key walk between cards all live there, over any status vocabulary.
// What is left here is the /teams half: the fleet's statuses and their meta,
// the runs, the card (board/run-card.tsx) and the words an empty lane says.
// There is no layout decision in this file.
//
// The queue positions stay here rather than moving into the shell, because
// they are a fact about this team's runs and only the card says them.

const EMPTY_COPY: Record<RunStatus, string> = {
  "needs-you": "Nothing needs you right now",
  working: "No agent is working",
  queued: "The queue is clear",
  review: "Nothing waiting for review",
  done: "Nothing finished yet",
};

export function BoardView() {
  const { runsByStatus, allRuns, query } = useFleet();
  const searching = query.trim().length > 0;

  // The team's queue, oldest first (the mock lists each status newest first).
  // From every run, not the search result, so a search never renumbers it.
  // Cards say it to screen readers only.
  const queuePositions = React.useMemo(() => {
    const queued = allRuns.filter((run) => run.status === "queued").reverse();
    return new Map(queued.map((run, i) => [run.id, i + 1]));
  }, [allRuns]);

  return (
    <TrackerBoard
      statuses={RUN_STATUS_ORDER}
      meta={RUN_STATUS_META}
      itemsByStatus={runsByStatus}
      getKey={(run) => run.id}
      renderItem={(run) => <RunCard run={run} queuePosition={queuePositions.get(run.id)} />}
      noun={{ one: "run", many: "runs" }}
      emptyCopy={EMPTY_COPY}
      searching={searching}
      searchEmpty={<RunSearchEmpty />}
      ariaLabel="Runs by status"
    />
  );
}
