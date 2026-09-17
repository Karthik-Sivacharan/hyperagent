"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import { TrackerStatusIcon, type TrackerStatusMeta } from "@/components/tracker/status";

// One status group of the tracker list: a header that folds the group, then
// its rows. The header is the status glyph (centred on the rows' avatar
// column), the label and the count; its text starts where the rows' titles
// start, so the list reads down one left edge. It is the only place a row's
// status is said, and the only place the status table's hues appear in the
// list. It sticks to the top of the list while its rows scroll past. Like
// every file under tracker/, it names no status: the label, the glyph and the
// tone come from the table the list was handed, and the row is the caller's
// `renderItem` (docs/plans/2026-09-17-room-tracker.md §5).
//
// The chevron is hidden at rest: it fades in when the header is hovered or
// focused, and stays while the group is folded, so a folded group always says
// it can open. The header is sized to its content, like the board's folded
// lane.
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

/**
 * The caller's row under a key of its own, so AnimatePresence can track it
 * while the group stays ignorant of its shape. It renders no element.
 */
function TrackerItem<T>({ item, render }: { item: T; render: (item: T) => ReactNode }) {
  return <>{render(item)}</>;
}

export function TrackerGroup<T>({
  status,
  meta,
  items,
  noun,
  getKey,
  renderItem,
  open,
  onOpenChange,
}: {
  /** The status this group holds, kept on `data-status` for anything reading the list back. */
  status: string;
  meta: TrackerStatusMeta;
  items: T[];
  /** The word for one item and for several, so the count reads "Needs you, 4 runs". */
  noun: { one: string; many: string };
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
              <TrackerStatusIcon meta={meta} />
            </span>
            {/* The spaces between the spans keep the accessible name "Needs you, 4 runs" apart; flex drops them visually. */}
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{meta.label}</span>{" "}
              <span className="text-sm text-foreground-low tabular-nums">
                <span className="sr-only">, </span>
                {items.length}
                <span className="sr-only">{items.length === 1 ? ` ${noun.one}` : ` ${noun.many}`}</span>
              </span>
              <IconChevronDown className={CHEVRON} aria-hidden="true" />
            </span>
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-[collapsible-up_var(--duration-move)_var(--ease-out-layout)] data-[state=open]:animate-[collapsible-down_var(--duration-move)_var(--ease-out-layout)] motion-reduce:animate-none">
          <ul className="relative flex flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <TrackerItem key={getKey(item)} item={item} render={renderItem} />
              ))}
            </AnimatePresence>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </motion.section>
  );
}
