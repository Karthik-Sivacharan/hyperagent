"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import type { FleetRun, RunStatus } from "@/lib/mock/teams";
import { RUN_STATUS_META, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { RunRow } from "@/components/teams/list/run-row";

// One status group: a header that folds the group, then its rows. The
// header is the status glyph (in the same lane as the rows' glyphs, so the
// whole list reads down one column of status), the label, the count, and a
// chevron that turns a quarter when the group folds. It sticks under the
// column header while its rows scroll past, the way a section header does in
// any long grouped list, and is the section's heading.
//
// MOTION. Folding animates the content's height on the Collapsible's own
// measured height (the collapsible-down / -up keyframes in globals.css) at
// the brand's layout move, 220ms on ease-out-layout; the chevron turns at
// the normal 200ms. Both are CSS, so reduced motion drops them outright
// (motion-reduce:) and the group simply opens. The group itself is a motion
// section: it takes its first-paint entrance from the list's stagger
// (`GROUP_VARIANTS`, inherited from list-view.tsx), slides on the layout
// move when a search reflows the groups above it, and fades out faster than
// anything enters when a search empties it. Rows keep their own presence:
// a row a search removes fades in 90ms while the rest close up; one it
// brings back fades in on 200ms. Rows do not animate when their group opens,
// the height does that.

export const GROUP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.outExpo } },
};

const GROUP_EXIT = { opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } };

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
      variants={GROUP_VARIANTS}
      exit={GROUP_EXIT}
      transition={{ layout: LAYOUT_TRANSITION }}
      data-status={status}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        {/* Opaque, so rows scrolling under the stuck header never show through its hover tint. */}
        <h2 className="sticky top-8 z-10 bg-background pt-3">
          <CollapsibleTrigger
            data-list-nav=""
            className="group/trigger flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left outline-none transition-[background-color] duration-(--duration-fast) ease-out-quart hover:bg-tint-7 focus-visible:bg-tint-7 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
          >
            <RunStatusIcon status={status} />
            {/* The spaces between the spans keep the accessible name "Needs you, 4 runs" apart; flex drops them visually. */}
            <span className="text-sm font-medium text-foreground">{meta.label}</span>{" "}
            <span className="text-sm text-foreground-low tabular-nums">
              <span className="sr-only">, </span>
              {runs.length}
              <span className="sr-only">{runs.length === 1 ? " run" : " runs"}</span>
            </span>
            <IconChevronDown
              className="size-3.5 text-foreground-low transition-transform duration-(--duration-normal) ease-out-quart group-data-[state=closed]/trigger:-rotate-90 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapsible-up_var(--duration-move)_var(--ease-out-layout)] data-[state=open]:animate-[collapsible-down_var(--duration-move)_var(--ease-out-layout)] motion-reduce:animate-none">
          <ul className="relative flex flex-col pb-1">
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
