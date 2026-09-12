"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconListCheck } from "@tabler/icons-react";
import { EmptyState } from "@/components/patterns/empty-state";
import { cn } from "@/lib/utils";
import { RUN_STATUS_ORDER, type RunStatus } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { RunSearchEmpty } from "@/components/teams/fleet/run-search-empty";
import { RunGroup } from "@/components/teams/list/run-group";

// The List view of /teams: triage. Every run the search keeps, one line
// each, grouped by status in RUN_STATUS_ORDER, so the list opens on what the
// human owes (Needs you) and ends on what is finished (Done, folded by
// default). An agent console's run view gave the shape: a plain group label,
// then rows of who, what and one line of state, with the time on the right.
// Everything else about a run is one interaction deeper: on hover in the
// row's reserved right cluster, and in the agent sheet a click opens.
//
// It is its own scroller, for two reasons: the group headers stick to it,
// and motion's layout animations measure against it (`layoutScroll`), so
// rows reflowing under a search land true even when the list is scrolled.
// It is also the `list` container the rows size their columns by.
//
// FOLDING. Done starts folded; other groups start open; the reader's toggles
// stick. A search opens every group that has a match (a result behind a
// fold reads as no result), and folds made during a search are forgotten
// when it clears, which puts the list back the way it was.
//
// KEYBOARD. Every row and group header is a button in tab order; ↑ and ↓
// also walk them top to bottom, skipping folded rows, and scroll the next
// one into view below the sticky header (the rows' scroll-margin). Enter on
// a row opens its agent; on a header it folds the group.
//
// MOTION. No first-paint entrance: the list arrives at rest (the page's
// cross-fade carries a view switch). The rest lives with the group and the
// row.

function walkRows(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const current = (event.target as HTMLElement).closest<HTMLElement>("[data-list-nav]");
  if (!current) return;
  event.preventDefault();
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-list-nav]"));
  const next = items[items.indexOf(current) + (event.key === "ArrowDown" ? 1 : -1)];
  if (!next) return;
  next.focus({ preventScroll: true });
  next.scrollIntoView({ block: "nearest" });
}

export function ListView() {
  const { runs, runsByStatus, query } = useFleet();
  const searching = query.trim() !== "";

  // Folded groups outside a search, and during one; the second resets each
  // time a search starts (state adjusted during render, not in an effect).
  const [folded, setFolded] = useState<RunStatus[]>(["done"]);
  const [foldedInSearch, setFoldedInSearch] = useState<RunStatus[]>([]);
  const [wasSearching, setWasSearching] = useState(searching);
  if (searching !== wasSearching) {
    setWasSearching(searching);
    setFoldedInSearch([]);
  }
  const closed = searching ? foldedInSearch : folded;
  const setClosed = searching ? setFoldedInSearch : setFolded;

  const groups = RUN_STATUS_ORDER.filter((status) => runsByStatus[status].length > 0);

  return (
    <motion.div layoutScroll className="@container/list min-h-0 flex-1 overflow-y-auto" onKeyDown={walkRows}>
      {/* 16px between groups. The 12px inset puts the rows' content on the
          page's 24px gutter and lets their hover fill bleed past it. No
          bottom padding without groups, so a search miss sits where the
          board's does. */}
      <div className={cn("relative flex flex-col gap-4 px-3", groups.length > 0 && "pb-10")}>
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map((status) => (
            <RunGroup
              key={status}
              status={status}
              runs={runsByStatus[status]}
              open={!closed.includes(status)}
              onOpenChange={(open) =>
                setClosed((current) => (open ? current.filter((s) => s !== status) : [...current, status]))
              }
            />
          ))}
        </AnimatePresence>
      </div>

      {runs.length === 0 ? (
        searching ? (
          <RunSearchEmpty />
        ) : (
          <div className="px-6">
            <EmptyState
              variant="plain"
              icon={IconListCheck}
              title="No runs yet"
              description="Runs your agents start will show up here, grouped by what they need from you."
            />
          </div>
        )
      ) : null}
    </motion.div>
  );
}
