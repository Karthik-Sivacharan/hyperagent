"use client";

import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { IconListCheck } from "@tabler/icons-react";
import { EmptyState } from "@/components/patterns/empty-state";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { RUN_STATUS_ORDER, type RunStatus } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { RunSearchEmpty } from "@/components/teams/fleet/run-search-empty";
import { useViewEntrance } from "@/components/teams/fleet/view-entrance";
import { ListColumnHeader } from "@/components/teams/list/list-grid";
import { RunGroup } from "@/components/teams/list/run-group";

// The List view of /teams: every run the search keeps, grouped by status in
// RUN_STATUS_ORDER, so the list opens on what the human owes (Needs you)
// and ends on what is finished (Done, folded by default). Claude Code's
// agent view gave the grouping, GitHub's agent sessions the outcome line,
// Linear the density and the one column template (list/list-grid.tsx).
//
// It is its own scroller, for two reasons: the column header and the group
// headers stick to it, and motion's layout animations measure against it
// (`layoutScroll`), so rows reflowing under a search land true even when the
// list is scrolled.
//
// FOLDING. Done starts folded; other groups start open; the reader's toggles
// stick. A search opens every group that has a match (a result behind a
// fold reads as no result), and folds made during a search are forgotten
// when it clears, which puts the list back the way it was.
//
// KEYBOARD. Every row and group header is a button in tab order; ↑ and ↓
// also walk them top to bottom, skipping folded rows, and scroll the next
// one into view below the sticky headers (the rows' scroll-margin). Enter
// on a row opens its agent; on a header it folds the group.
//
// MOTION. When the list is the first view the page paints, the groups
// stagger in (80ms apart, capped at the fourth, so the last one is settled
// inside 500ms). Arriving from another view, the page cross-fade carries it
// and the groups render at rest (fleet/view-entrance.tsx). Later changes do
// not stagger. The rest lives with the group and the row.

const LIST_VARIANTS: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: (index: number) => Math.min(index, 3) * DURATION.stagger } },
};

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
  const entrance = useViewEntrance();
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
      {runs.length > 0 ? <ListColumnHeader /> : null}

      {/* Two presence scopes, both `initial={entrance}`. Without an entrance
          the outer one holds the stagger container at "shown" and the inner
          one holds each group there too; blocking only the container would
          leave the groups at their inherited "hidden", waiting for a stagger
          that never starts. Groups mounted later (a search bringing one back)
          are past the inner scope's first render, so they fade in on their
          own from "hidden". */}
      <AnimatePresence initial={entrance}>
        <motion.div
          key="groups"
          // No bottom padding without groups, so a search miss sits where
          // the board's does.
          className={cn("relative px-3", groups.length > 0 && "pb-10")}
          initial="hidden"
          animate="shown"
          variants={LIST_VARIANTS}
        >
          <AnimatePresence mode="popLayout" initial={entrance}>
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
        </motion.div>
      </AnimatePresence>

      {runs.length === 0 ? (
        searching ? (
          <RunSearchEmpty />
        ) : (
          <motion.div
            className="px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
          >
            <EmptyState
              variant="plain"
              icon={IconListCheck}
              title="No runs yet"
              description="Runs your agents start will show up here, grouped by what they need from you."
            />
          </motion.div>
        )
      ) : null}
    </motion.div>
  );
}
