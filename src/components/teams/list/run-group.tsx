"use client";

import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import type { FleetRun, RunStatus } from "@/lib/mock/teams";
import { RUN_STATUS_META, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { RunRow } from "@/components/teams/list/run-row";

// One status group: a header that folds the group, then its rows. The
// header is the status glyph (centred on the rows' avatar column), the
// label and the count; its text starts where the rows' titles start, so the
// list reads down one left edge. It is the only place a row's status is
// said, and the only place tangerine appears in the list (the Needs you
// glyph). It sticks to the top of the list while its rows scroll past.
//
// The chevron is hidden at rest: it fades in when the header is hovered or
// focused, and stays while the group is folded, so a folded group always
// says it can open. The header is sized to its content, like the board's
// folded Done lane.
//
// MOTION. Folding animates the content's measured height (the
// collapsible-down / -up keyframes) on the layout move, 220ms ease-out-layout;
// the chevron turns with it. Reveals are opacity only: 150ms in, 90ms out.
// Reduced motion drops the fold and the turn and the group simply opens.
// There is no first-paint entrance: a group a search brings back fades in,
// one it empties fades out faster than anything enters, and the groups below
// slide on the layout move when one above changes height.

const GROUP_ENTER = { opacity: 1, transition: { duration: DURATION.normal, ease: EASE.out } };
const GROUP_EXIT = { opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } };

const CHEVRON =
  "size-3.5 text-foreground-low opacity-0 transition-[opacity,rotate] duration-(--duration-exit) ease-out motion-reduce:transition-opacity group-hover/trigger:opacity-100 group-hover/trigger:duration-(--duration-fast) group-focus-visible/trigger:opacity-100 group-focus-visible/trigger:duration-(--duration-fast) group-data-[state=closed]/trigger:-rotate-90 group-data-[state=closed]/trigger:opacity-100";

export function RunGroup({
  status,
  runs,
  open,
  onOpenChange,
}: {
  status: RunStatus;
  runs: FleetRun[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const meta = RUN_STATUS_META[status];

  return (
    <motion.section
      layout="position"
      initial={{ opacity: 0 }}
      animate={GROUP_ENTER}
      exit={GROUP_EXIT}
      transition={{ layout: LAYOUT_TRANSITION }}
      data-status={status}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        {/* Opaque, so rows scrolling under the stuck header never show through it. */}
        <h2 className="sticky top-0 z-10 bg-background">
          <CollapsibleTrigger
            data-list-nav=""
            className="group/trigger flex h-9 w-fit cursor-pointer items-center gap-3 rounded-lg px-3 text-left outline-none transition-[background-color] duration-(--duration-fast) ease-out-quart hover:bg-tint-7 focus-visible:bg-tint-7 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
          >
            <span className="flex w-5 shrink-0 justify-center">
              <RunStatusIcon status={status} />
            </span>
            {/* The spaces between the spans keep the accessible name "Needs you, 4 runs" apart; flex drops them visually. */}
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{meta.label}</span>{" "}
              <span className="text-sm text-foreground-low tabular-nums">
                <span className="sr-only">, </span>
                {runs.length}
                <span className="sr-only">{runs.length === 1 ? " run" : " runs"}</span>
              </span>
              <IconChevronDown className={CHEVRON} aria-hidden="true" />
            </span>
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapsible-up_var(--duration-move)_var(--ease-out-layout)] data-[state=open]:animate-[collapsible-down_var(--duration-move)_var(--ease-out-layout)] motion-reduce:animate-none">
          <ul className="relative flex flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              {runs.map((run) => (
                <RunRow key={run.id} run={run} />
              ))}
            </AnimatePresence>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </motion.section>
  );
}
