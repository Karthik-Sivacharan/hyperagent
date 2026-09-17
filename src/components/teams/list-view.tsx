"use client";

import { IconListCheck } from "@tabler/icons-react";
import { EmptyState } from "@/components/patterns/empty-state";
import { RUN_STATUS_ORDER } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { RUN_STATUS_META } from "@/components/teams/fleet/run-status";
import { RunSearchEmpty } from "@/components/teams/fleet/run-search-empty";
import { RunRow } from "@/components/teams/list/run-row";
import { TrackerList } from "@/components/tracker/list/tracker-list";

// The List view of /teams: triage. Every run the search keeps, one line each,
// grouped by status in RUN_STATUS_ORDER, so the list opens on what the human
// owes (Needs you) and ends on what is finished (Done, folded by default). An
// agent console's run view gave the shape: a plain group label, then rows of
// who, what and one line of state, with the time on the right. Everything else
// about a run is one interaction deeper: on hover in the row's reserved right
// cluster, and in the agent sheet a click opens.
//
// The list is the shared tracker shell (tracker/list/tracker-list.tsx,
// docs/plans/2026-09-17-room-tracker.md §2), which owns the scroller, the
// sticky group headers, the folds and their search rules, the ↑/↓ walk and
// the motion. This file is the /teams half: the fleet's statuses and their
// meta, the runs, the row (list/run-row.tsx) and the two ways the list can be
// empty.

export function ListView() {
  const { runsByStatus, query } = useFleet();
  const searching = query.trim() !== "";

  return (
    <TrackerList
      statuses={RUN_STATUS_ORDER}
      meta={RUN_STATUS_META}
      itemsByStatus={runsByStatus}
      getKey={(run) => run.id}
      renderItem={(run) => <RunRow run={run} />}
      noun={{ one: "run", many: "runs" }}
      searching={searching}
      empty={
        <div className="px-6">
          <EmptyState
            variant="plain"
            icon={IconListCheck}
            title="No runs yet"
            description="Runs your agents start will show up here, grouped by what they need from you."
          />
        </div>
      }
      searchEmpty={<RunSearchEmpty />}
    />
  );
}
