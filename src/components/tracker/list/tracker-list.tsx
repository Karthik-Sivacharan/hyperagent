"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { TrackerStatusMeta } from "@/components/tracker/status";
import { TrackerGroup } from "@/components/tracker/list/tracker-group";

// The list half of the tracker shell: triage. Every item the caller kept, one
// line each, in folding groups in the statuses' reading order, so the list
// opens on what the person owes and ends on what is finished (folded by
// default). It names no status and holds no data: the vocabulary, the items
// and the row arrive as props (docs/plans/2026-09-17-room-tracker.md §5). The
// group is list/tracker-group.tsx; the row is the caller's `renderItem`.
//
// It is its own scroller, for two reasons: the group headers stick to it, and
// motion's layout animations measure against it (`layoutScroll`), so rows
// reflowing under a search land true even when the list is scrolled. It is
// also the `list` container a row may size its columns by.
//
// FOLDING. `defaultFolded` starts folded, the last status by default; other
// groups start open; the reader's toggles stick. A search opens every group
// that has a match (a result behind a fold reads as no result), and folds
// made during a search are forgotten when it clears, which puts the list back
// the way it was.
//
// KEYBOARD. Every group header is a button in tab order, and so should every
// row be; ↑ and ↓ also walk them top to bottom, skipping folded rows, and
// scroll the next one into view below the sticky header (the row's own
// scroll-margin). The walk finds them by `data-list-nav`: the header carries
// it here, and a `renderItem` has to put it on the element it makes
// focusable, or the arrow keys will step over that row.
//
// MOTION. No first-paint entrance: the list arrives at rest (a page that
// cross-fades between views carries the switch). The rest lives with the
// group and the row.

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

export function TrackerList<S extends string, T>({
  statuses,
  meta,
  itemsByStatus,
  getKey,
  renderItem,
  noun,
  searching,
  defaultFolded,
  empty,
  searchEmpty,
}: {
  /** Reading order, top to bottom. */
  statuses: readonly S[];
  meta: Record<S, TrackerStatusMeta>;
  /** Every status present, possibly empty; a status with no items has no group. */
  itemsByStatus: Record<S, T[]>;
  getKey: (item: T) => string;
  /** Must carry `data-list-nav` on its focusable element, or ↑ and ↓ skip the row. */
  renderItem: (item: T) => ReactNode;
  /** The word for one item and for several, so a group header reads "Needs you, 4 runs". */
  noun: { one: string; many: string };
  /** A search is active: it opens every group that has a match, and its folds are forgotten when it clears. */
  searching: boolean;
  /** Statuses folded at rest. Defaults to the last status. */
  defaultFolded?: readonly S[];
  /** Shown below the groups when there is nothing at all. */
  empty?: ReactNode;
  /** Shown below the groups instead of `empty` when a search is what kept nothing. */
  searchEmpty?: ReactNode;
}) {
  // Folded groups outside a search, and during one; the second resets each
  // time a search starts (state adjusted during render, not in an effect).
  const [folded, setFolded] = useState<S[]>(() => [...(defaultFolded ?? statuses.slice(-1))]);
  const [foldedInSearch, setFoldedInSearch] = useState<S[]>([]);
  const [wasSearching, setWasSearching] = useState(searching);
  if (searching !== wasSearching) {
    setWasSearching(searching);
    setFoldedInSearch([]);
  }
  const closed = searching ? foldedInSearch : folded;
  const setClosed = searching ? setFoldedInSearch : setFolded;

  const groups = statuses.filter((status) => itemsByStatus[status].length > 0);
  const total = statuses.reduce((count, status) => count + itemsByStatus[status].length, 0);

  return (
    <motion.div layoutScroll className="@container/list min-h-0 flex-1 overflow-y-auto" onKeyDown={walkRows}>
      {/* 16px between groups. The 12px inset puts the rows' content on the
          page's 24px gutter and lets their hover fill bleed past it. No
          bottom padding without groups, so a search miss sits where the
          board's does. */}
      <div className={cn("relative flex flex-col gap-4 px-3", groups.length > 0 && "pb-10")}>
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map((status) => (
            <TrackerGroup
              key={status}
              status={status}
              meta={meta[status]}
              items={itemsByStatus[status]}
              noun={noun}
              getKey={getKey}
              renderItem={renderItem}
              open={!closed.includes(status)}
              onOpenChange={(open) =>
                setClosed((current) => (open ? current.filter((s) => s !== status) : [...current, status]))
              }
            />
          ))}
        </AnimatePresence>
      </div>

      {total === 0 ? (searching ? searchEmpty : empty) : null}
    </motion.div>
  );
}
