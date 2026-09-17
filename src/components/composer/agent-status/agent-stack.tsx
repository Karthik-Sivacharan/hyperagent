import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { AgentChip } from "./agent-chip";
import { RUN_STATES, STATE_PRIORITY } from "./run-state";
import type { AgentRun } from "./types";

// The right-hand end of the composer's agent bar: a row of overlapping agent
// discs, whoever wants something first, with the rest folded into a counter.
// The reference is the avatar stack — circles cutting into each other, then a
// flat `+N` — and the reading is the same one it always is: how many are out
// there, and is any of them looking at me.
//
// ORDER is STATE_PRIORITY, not arrival: `input` and `stuck` are at the front
// because they are the two that cost the person something, and `done` is last
// because a finished agent is the one piece of news that can wait. The sort is
// stable, so agents inside one state keep the order they were handed in.
//
// THE BITE. Each disc wears a 2px ring of `surface-elevated`, the colour of
// the composer card this bar sits on (composer.tsx), so the one in front cuts
// a clean edge out of the one behind instead of a smudge. Painting order runs
// down the row, so the agent the sort put first is the one on top and the one
// never bitten into — except when a chip is open in the bar, which lifts it
// over the lot of them, because the row should agree with what is on screen.
//
// UNSTACKING. Hovering the row slides every disc but the last 6px left, which
// is enough to give the bite back and leave each figure whole before you pick
// one. It is `translate`, so nothing reflows, and only the TRANSITION is
// dropped under `prefers-reduced-motion`: the row still opens, it just
// arrives rather than travels, because the loosening is there to be read, not
// to delight. A coarse pointer has no hover to give, so it gets the open row
// from the start — which is also what leaves each disc 26px of exclusive
// target, over the 24px floor, while its halo reaches 44 (agent-chip.tsx).

/** Disc diameter, shared by the chips and the counter so they cannot drift. */
const CHIP_PX = 28;
/** How far a disc sits under the one before it, at rest. */
const OVERLAP_PX = 8;
/** How much of that the row gives back when it opens. */
const SPREAD_PX = 6;
/** The comfortable touch target, as in agent-chip.tsx: the counter is a
    control too, and it gets the same invisible halo. */
const HIT_TARGET_PX = 44;

export function AgentStack({
  runs,
  max = 3,
  onSelect,
  activeId,
  className,
}: {
  runs: readonly AgentRun[];
  /** How many chips before the rest collapse into a count. Defaults to 3. */
  max?: number;
  onSelect?: (run: AgentRun) => void;
  activeId?: string | null;
  className?: string;
}) {
  const sorted = [...runs].sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state]);
  const shown = sorted.slice(0, max);
  const hidden = sorted.slice(max);
  // The counter is one more thing in the row, so it shares the run of z-index
  // and the run of shifts.
  const count = shown.length + (hidden.length > 0 ? 1 : 0);

  /** Per-item stacking, overlap and the distance it travels when the row opens. */
  const seat = (index: number, front: boolean): CSSProperties =>
    ({
      "--chip-z": String(front ? count + 1 : count - index),
      "--chip-shift": `-${(count - 1 - index) * SPREAD_PX}px`,
      marginLeft: index === 0 ? undefined : -OVERLAP_PX,
    }) as CSSProperties;

  // `focus-within` outranks the custom property by one pseudo-class, so a
  // chip reached by keyboard comes to the front without any state up here.
  //
  // `transition-transform`, NOT `transition-[transform]`: Tailwind v4 compiles
  // `translate-x-*` to the `translate` property, and only the named utility
  // expands to cover it — the same trap ui/button.tsx documents for `scale`.
  // And the reduced-motion escape is `transition-none`, not a `motion-safe:`
  // on the property alone: `transition-property` starts life as `all`, so a
  // lone `duration-*` left here would quietly put a 150ms ease on every
  // animatable thing about the row for exactly the people who asked for none.
  const seatClass = cn(
    "relative z-(--chip-z) focus-within:z-50",
    "group-hover/stack:translate-x-(--chip-shift) group-focus-within/stack:translate-x-(--chip-shift) pointer-coarse:translate-x-(--chip-shift)",
    "transition-transform duration-(--duration-fast) ease-out-quart motion-reduce:transition-none",
  );

  return (
    <ul role="list" aria-label="Agents" className={cn("group/stack flex shrink-0 items-center", className)}>
      {shown.map((run, index) => (
        <li key={run.id} style={seat(index, run.id === activeId)} className={seatClass}>
          <AgentChip run={run} size={CHIP_PX} active={run.id === activeId} onSelect={onSelect} />
        </li>
      ))}
      {hidden.length > 0 && (
        <li style={seat(count - 1, false)} className={seatClass}>
          <OverflowBubble runs={hidden} onSelect={onSelect} />
        </li>
      )}
    </ul>
  );
}

/**
 * The rest of the fleet as a number. Flat tint, no hue and no figure: it is a
 * count, not a state, and giving it one would say something about agents it is
 * not showing. Picking it opens the first of them.
 */
function OverflowBubble({ runs, onSelect }: { runs: readonly AgentRun[]; onSelect?: (run: AgentRun) => void }) {
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
        {onSelect ? (
          <Button
            type="button"
            variant="ghost"
            size="none"
            aria-label={`Show ${runs.length} more: ${summary}`}
            onClick={() => onSelect(runs[0])}
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
