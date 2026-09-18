import { SHIMMER, sweepStyle } from "@/components/thread/shimmer";
import { cn } from "@/lib/utils";

import { agentCount } from "./fold";
import type { AgentRun } from "./types";

// The left of the agent bar, in one line: how many agents are out, and whether
// any of them is still going.
//
// THE LEFT WAS EMPTY ON PURPOSE, AND THIS IS NOT THAT LABEL COMING BACK. The
// strip this variant replaces spent its left on "Working…", which says only
// that something is happening — the exact thing four figures wearing their own
// states already say, louder. A COUNT is the one fact the stack cannot give
// you at a glance: three discs and a "+3" is six agents, and nobody reads that
// sum off a row of overlapping circles. So the left carries the number and
// nothing else, and it changes as the fleet does.
//
// IT SHIMMERS ONLY WHILE SOMETHING IS RUNNING, on the product's own running-
// label device (thread/shimmer.ts) — the same band that crosses a tool call's
// label and the signup heading, so a working label looks the same everywhere
// in the app. When the last run lands, the band stops and the words change
// tense: a label that kept sweeping over a finished fleet would be the one
// dishonest thing in the bar. The device is entirely `motion-safe:`, so under
// `prefers-reduced-motion` this is plain muted text and the tense still tells
// the truth.
//
// THE MUTED TIER BRIGHTENS, which is the direction shimmer.ts asks for: the
// band sweeps a muted label towards `foreground` rather than dimming it with
// --shimmer-sweep, because a 40% neutral over a muted grey is a smaller step
// than the antialiasing and the band simply vanishes.
//
// IT IS THE BAR'S SPOKEN VERSION. Every other readout here is a colour or a
// shape, so this is the one part a screen reader can use: `aria-live="polite"`
// announces the count when it changes, and the state hues stay confirmation
// rather than the whole message.

/** One crossing of the band per ~1.6s of work, which is the pace the chips'
    eyes already move at (agent-chip.tsx). Two crossings to a cycle. */
const CYCLE_MS = 3200;

/** "3 agents working", "1 agent done" — the tense is the state of the fleet.
    AGENTS, not runs: one agent on three running tasks is one agent working,
    the same count the stack beside it draws faces for. */
export function runCountLabel(runs: readonly AgentRun[]): string {
  const working = agentCount(runs.filter((run) => run.state === "running"));
  const n = working > 0 ? working : agentCount(runs);
  const noun = n === 1 ? "agent" : "agents";
  return `${n} ${noun} ${working > 0 ? "working" : "done"}`;
}

export function RunCount({ runs, className }: { runs: readonly AgentRun[]; className?: string }) {
  if (runs.length === 0) return null;

  const working = runs.some((run) => run.state === "running");
  const label = runCountLabel(runs);

  return (
    <span
      aria-live="polite"
      className={cn(
        "min-w-0 truncate text-xs text-muted-foreground",
        "animate-in fade-in-0 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none",
        working && SHIMMER,
        className,
      )}
      // Sized to the label, so a two-character count and a ten-character one
      // are swept by a band of the same proportion rather than the same width.
      style={working ? sweepStyle(label.length, "var(--color-foreground)", "var(--color-muted-foreground)", { cycleMs: CYCLE_MS }) : undefined}
    >
      {label}
    </span>
  );
}
