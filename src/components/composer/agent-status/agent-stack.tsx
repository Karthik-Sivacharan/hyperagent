"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from "react";
import { IconChevronsRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { AgentChip } from "./agent-chip";
import { agentLeads, foldStack, sameAgent, STACK_MAX } from "./fold";
import { RUN_STATES } from "./run-state";
import type { AgentRun } from "./types";

// The right-hand end of the composer's agent bar: a row of overlapping agent
// discs with the rest folded into a counter. The reference is the avatar
// stack — circles cutting into each other, then a flat `+N` — and the reading
// is the same one it always is: how many are out there, and what are they up
// to.
//
// WHICH DISCS is fold.ts: one seat per state before any state gets two, a
// different agent in each seat where the fleet has one, in SEAT_PRIORITY
// (run-state.ts) — working, done, stuck, then the two that are about a person.
// Three seats are a sample of the fleet, not the top of a queue; the queue is
// what the counter holds, in STATE_PRIORITY, and it leads with whoever wants
// something.
//
// THE BITE. Each disc wears a 2px ring of `surface-elevated`, the colour of
// the composer card this bar sits on (composer.tsx), so the one in front cuts
// a clean edge out of the one behind instead of a smudge. Painting order runs
// down the row, so the first seat is the one on top and the one never bitten
// into — except when a chip is open in the bar, which lifts it over the lot of
// them, because the row should agree with what is on screen.
//
// UNSTACKING. Hovering the row slides every disc but the last 6px left, which
// is enough to give the bite back and leave each figure whole before you pick
// one. It is `translate`, so nothing reflows, and only the TRANSITION is
// dropped under `prefers-reduced-motion`: the row still opens, it just
// arrives rather than travels, because the loosening is there to be read, not
// to delight. A coarse pointer has no hover to give, so it gets the open row
// from the start — which is also what leaves each disc 26px of exclusive
// target, over the 24px floor, while its halo reaches 44 (agent-chip.tsx).
//
// UNFOLDING. The counter is a disclosure: pressed, it becomes the discs it was
// counting, in the same row, and a chevron at the row's right edge folds them
// back. The seated discs stay first and the rest arrive after them, where the
// counter was, so the faces already read do not move relative to each other.
// Unfolded, every disc sits at the SPACING THE HOVER OPENS TO and holds it:
// unfolding is asking to pick one, which is what the hover was for, so the
// row is simply held open, and a hover that slid a dozen discs 60px left would
// be dragging the whole row at the pointer.
//
// IT NEVER GROWS A LINE. The bar's height is fixed (composer-agent-status.tsx),
// so a fleet wider than the row scrolls sideways inside it rather than
// wrapping, with the chevron pinned outside the scroll so the way back is
// never scrolled away. No scrollbar — a bar 40px tall has no room for one —
// so an edge that has more behind it fades out over 16px instead, the one cue
// a hidden scrollbar leaves. A trackpad scrolls it, Shift and a wheel scrolls
// it, and Tab walks it, because focusing a disc scrolls it into view.

/** Disc diameter, shared by the chips and the counter so they cannot drift. */
const CHIP_PX = 28;
/** How far a disc sits under the one before it, at rest. */
const OVERLAP_PX = 8;
/** How much of that the row gives back when it opens. */
const SPREAD_PX = 6;
/** The comfortable touch target, as in agent-chip.tsx: the counter is a
    control too, and it gets the same invisible halo. */
const HIT_TARGET_PX = 44;

/** The unfolded disc's arrival, the bar's own fade. Only on the discs the
    counter stood for: the seated ones were already there. */
const REVEAL = "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none";

/** A fade for something that already carries a `duration-*` of its own — a
    Button, a hovering seat — so it borrows that duration instead of fighting
    it: tailwind-merge keeps one `duration-*` per element and the loser would
    silently take the element's transition timing with it (ROW_TARGET in
    agent-detail.tsx is the same trap). */
const FADE = "animate-in fade-in-0 motion-reduce:animate-none";

/**
 * The unfolded row's scroll box. `overflow-y-hidden` because `overflow-x`
 * forces the other axis to scroll too, and a disc's invisible 44px halo is
 * taller than the 40px row: without it a wheel would nudge the row a few px
 * up and down. The mask is two 16px fades, each switched on by the edge that
 * has something behind it (useScrollEdges).
 */
const SCROLLER = cn(
  "flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide",
  "[--fade-end:0px] [--fade-start:0px] data-more-end:[--fade-end:16px] data-more-start:[--fade-start:16px]",
  "[mask-image:linear-gradient(to_right,transparent,black_var(--fade-start),black_calc(100%_-_var(--fade-end)),transparent)]",
);

const NO_EDGES = { start: false, end: false } as const;

/** Whether the scroll box has anything off either edge. Measured on scroll and
    whenever the box or the row inside it changes size — a run arriving widens
    the row without the box moving at all. Off while folded. */
function useScrollEdges(ref: RefObject<HTMLElement | null>, active: boolean) {
  const [edges, setEdges] = useState<{ start: boolean; end: boolean }>(NO_EDGES);
  useEffect(() => {
    const box = ref.current;
    if (!active || !box) return;
    const measure = () => {
      const start = box.scrollLeft > 1;
      const end = box.scrollLeft + box.clientWidth < box.scrollWidth - 1;
      setEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }));
    };
    // A ResizeObserver reports once on `observe`, which is the first measure.
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    for (const child of box.children) observer.observe(child);
    box.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      box.removeEventListener("scroll", measure);
    };
  }, [ref, active]);
  return active ? edges : NO_EDGES;
}

export function AgentStack({
  runs,
  max = STACK_MAX,
  onSelect,
  activeId,
  expanded = false,
  onExpandedChange,
  className,
}: {
  runs: readonly AgentRun[];
  /** How many chips before the rest collapse into a count. Defaults to 3. */
  max?: number;
  onSelect?: (run: AgentRun) => void;
  activeId?: string | null;
  /** Every disc on show instead of three and a count. Controlled, because the
      bar keeps it across the detail it swaps in (composer-agent-status.tsx). */
  expanded?: boolean;
  /** Given, the counter unfolds the row and a chevron folds it back. Omitted,
      the counter is a figure and not a control. */
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}) {
  // One disc per agent, then the seats among them (fold.ts). The counts are
  // taken from the whole fleet, so a disc can say how much it stands for.
  const { seated, folded } = foldStack(agentLeads(runs), max);
  const tasksOf = (lead: AgentRun) => runs.filter((run) => sameAgent(run, lead)).length;
  // Nothing to unfold is folded, whatever the caller last asked for.
  const open = expanded && folded.length > 0;
  const items = open ? [...seated, ...folded] : seated;
  // The counter is one more thing in the row, so it shares the run of z-index
  // and the run of shifts.
  const count = items.length + (!open && folded.length > 0 ? 1 : 0);

  const listId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scrollerRef, open);

  /** Per-item stacking, overlap and the distance it travels when the row opens.
      Unfolded, the row is already open, so the overlap is the opened one and
      there is nowhere left to travel. */
  const seat = (index: number, front: boolean): CSSProperties =>
    ({
      "--chip-z": String(front ? count + 1 : count - index),
      "--chip-shift": `-${(count - 1 - index) * SPREAD_PX}px`,
      marginLeft: index === 0 ? undefined : -(open ? OVERLAP_PX - SPREAD_PX : OVERLAP_PX),
    }) as CSSProperties;

  // `focus-within` outranks the custom property by one pseudo-class, so a
  // chip reached by keyboard comes to the front without any state up here.
  const stackingClass = "relative z-(--chip-z) focus-within:z-50";

  // `transition-transform`, NOT `transition-[transform]`: Tailwind v4 compiles
  // `translate-x-*` to the `translate` property, and only the named utility
  // expands to cover it — the same trap ui/button.tsx documents for `scale`.
  // And the reduced-motion escape is `transition-none`, not a `motion-safe:`
  // on the property alone: `transition-property` starts life as `all`, so a
  // lone `duration-*` left here would quietly put a 150ms ease on every
  // animatable thing about the row for exactly the people who asked for none.
  const seatClass = cn(
    stackingClass,
    "group-hover/stack:translate-x-(--chip-shift) group-focus-within/stack:translate-x-(--chip-shift) pointer-coarse:translate-x-(--chip-shift)",
    "transition-transform duration-(--duration-fast) ease-out-quart motion-reduce:transition-none",
  );

  return (
    <div className={cn("flex items-center", open ? "min-w-0" : "shrink-0", className)}>
      {/* Folded, this box is `contents` and the row lays out exactly as it
          did before it could unfold. */}
      <div
        ref={scrollerRef}
        data-more-start={edges.start || undefined}
        data-more-end={edges.end || undefined}
        className={open ? SCROLLER : "contents"}
      >
        {/* `ml-auto` rather than `justify-end` on the box: an overflowing row
            pushed from the end spills off the START, where no scroll reaches
            it. An auto margin collapses to nothing instead. `px-2` holds the
            end discs' 44px halos inside the row, or they would make a row
            that fits scroll by the 4px they overhang. `py-1` is the rings'
            room: a box that scrolls on one axis clips the other, and the
            state ring (2px, 4px on the active disc) is drawn OUTSIDE the
            28px disc, so a box exactly as tall as the discs sheared the top
            and bottom off every one. 28 + 8 still fits the 40px bar. */}
        <ul
          id={listId}
          role="list"
          aria-label="Agents"
          className={cn("group/stack flex shrink-0 items-center", open && "ml-auto px-2 py-1")}
        >
          {items.map((run, index) => {
            const revealed = open && index >= seated.length;
            return (
              <li
                key={run.id}
                // The first disc the counter stood for, which is where the bar
                // puts focus that the counter took with it (the bar's note).
                data-revealed={revealed && index === seated.length ? "" : undefined}
                style={seat(index, run.id === activeId)}
                className={open ? cn(stackingClass, revealed && REVEAL) : seatClass}
              >
                <AgentChip
                  run={run}
                  size={CHIP_PX}
                  tasks={tasksOf(run)}
                  active={run.id === activeId}
                  onSelect={onSelect}
                />
              </li>
            );
          })}
          {!open && folded.length > 0 && (
            <li style={seat(count - 1, false)} className={cn(seatClass, FADE)}>
              <OverflowBubble
                runs={folded}
                controls={listId}
                onExpand={onExpandedChange ? () => onExpandedChange(true) : undefined}
              />
            </li>
          )}
        </ul>
      </div>
      {open && onExpandedChange && (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* A chevron, because this folds the row in place rather than
                going anywhere (docs/brand/icons.md: an arrow goes, a chevron
                reveals). Doubled and pointing right, because the discs fold
                back into the right edge they unfolded out of — the collapse
                glyph a side panel wears — and a single › at the end of a row
                reads as "next". The ghost's own `aria-expanded` fill is taken
                off: on this control it is always true, and a chevron sitting
                in a permanent tint would read as pressed. */}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Show fewer agents"
              aria-expanded
              aria-controls={listId}
              onClick={() => onExpandedChange(false)}
              className={cn(
                "-mr-1.5 shrink-0 text-muted-foreground hover:text-foreground aria-expanded:bg-transparent aria-expanded:hover:bg-tint-10",
                FADE,
              )}
            >
              <IconChevronsRight className="size-3.5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show fewer</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

/**
 * The rest of the fleet as a number. Flat tint, no hue and no figure: it is a
 * count, not a state, and giving it one would say something about agents it is
 * not showing. Picking it unfolds the row into them.
 */
function OverflowBubble({
  runs,
  controls,
  onExpand,
}: {
  runs: readonly AgentRun[];
  /** The list it unfolds, for `aria-controls`. */
  controls: string;
  onExpand?: () => void;
}) {
  const style = {
    width: CHIP_PX,
    height: CHIP_PX,
    "--chip-halo": `${Math.min(0, (CHIP_PX - HIT_TARGET_PX) / 2)}px`,
  } as CSSProperties;

  const disc = "relative shrink-0 rounded-full bg-tint-15 text-muted-foreground text-xs font-medium tabular-nums ring-2 ring-surface-elevated";

  // "+3" says nothing out loud, so the agents it stands for are spelled out
  // for a screen reader and the digits go decorative — the same split the
  // chip makes, and for the same reason.
  const summary = runs.map((run) => `${run.name}, ${RUN_STATES[run.state].label.toLowerCase()}`).join(". ");
  const digits = <span aria-hidden="true">+{runs.length}</span>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {onExpand ? (
          <Button
            type="button"
            variant="ghost"
            size="none"
            aria-label={`Show ${runs.length} more: ${summary}`}
            aria-expanded={false}
            aria-controls={controls}
            onClick={onExpand}
            style={style}
            className={cn(
              disc,
              "touch-manipulation hover:bg-tint-20 hover:text-foreground focus-visible:ring-offset-surface-elevated",
              "before:absolute before:inset-(--chip-halo) before:rounded-full before:content-['']",
            )}
          >
            {digits}
          </Button>
        ) : (
          <span
            role="img"
            aria-label={`${runs.length} more: ${summary}`}
            style={style}
            className={cn(disc, "inline-flex select-none items-center justify-center")}
          >
            {digits}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>
        {runs.map((run) => (
          <span key={run.id} className="block">
            {run.name} <span className="text-muted-foreground">{RUN_STATES[run.state].label}</span>
          </span>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
