"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import type { AgentState, FleetRun } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { RUN_STATUS_META } from "@/components/teams/fleet/run-status";
import { formatUsd } from "@/components/teams/fleet/format";
import { runCaption, TONE_GLYPH } from "@/components/teams/fleet/run-caption";

// One run, one line: the agent's face, the title, the caption
// (fleet/run-caption.ts) and, on the right, when it last moved. The whole row is the control (the
// shared ghost `Button` as a grid): a click or Enter opens the agent's sheet,
// which holds everything else, so there is nothing inside it to tab through.
// The group header above says the status; the row does not repeat it.
//
// THE GRID. Four tracks: a 20px avatar, the title (up to 20rem), the caption
// (the rest), and a fixed 11rem cluster on the right. The cluster shows only
// `run.updated` at rest; on hover or keyboard focus the agent's name and the
// run's cost fade in to the left of it, inside the width already reserved,
// so nothing reflows. Below the list's @3xl (768px, the `list` container on
// the scroller, since the sidebar and the sheet change the list's real
// width) the caption and the reveal drop out and the row is avatar, title,
// time.
//
// MOTION. The reveal is opacity only: in on 150ms ease-out, out on the 90ms
// exit (each state carries the duration of the transition into it). Under a
// search a row that leaves fades out in 90ms while the rest close up on the
// layout move; one that comes back fades in on 200ms. Reduced motion keeps
// the fades and drops the move (MotionConfig on the page).

export const ROW_GRID =
  "grid items-center gap-x-3 grid-cols-[1.25rem_minmax(0,1fr)_auto] @3xl/list:grid-cols-[1.25rem_minmax(0,20rem)_minmax(0,1fr)_11rem]";

const REVEAL =
  "opacity-0 transition-opacity duration-(--duration-exit) ease-out group-hover/button:opacity-100 group-hover/button:duration-(--duration-fast) group-focus-visible/button:opacity-100 group-focus-visible/button:duration-(--duration-fast)";

const ENTER = { duration: DURATION.normal, ease: EASE.out };
const EXIT = { opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } };

const SPOKEN_STATE: Record<AgentState, string> = {
  working: "working",
  idle: "idle",
  paused: "paused",
  error: "in error",
};

/** Run time for the accessible name: "19m" would be read as nineteen metres. */
function spokenMinutes(minutes: number): string {
  const total = Math.max(1, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (hours === 0) return part(rest, "minute");
  return rest === 0 ? part(hours, "hour") : `${part(hours, "hour")} ${part(rest, "minute")}`;
}

export function RunRow({ run }: { run: FleetRun }) {
  const { agentById, memberById, openAgent } = useFleet();
  const agent = agentById(run.agentId);
  const owner = memberById(run.ownerId);
  const caption = runCaption(run, agent);
  const cost = formatUsd(run.cost);
  // A stuck agent's glyph, before its reason: the only status colour on a row.
  const tone = caption?.tone ? TONE_GLYPH[caption.tone] : null;

  // Every fact the row used to show stays in its name, even the ones the
  // polish took off the screen (id, project, owner, steps, run time).
  const status = RUN_STATUS_META[run.status].label;
  const label = [
    `${run.title}, ${run.id}`,
    caption ? `${status}: ${caption.text}` : status,
    run.progress && run.status === "working" ? `${run.progress.done} of ${run.progress.total} steps done` : null,
    run.progress && run.status === "queued" ? `${run.progress.total} steps planned` : null,
    `Project ${run.project}`,
    `Agent ${agent.name}, ${SPOKEN_STATE[agent.state]}, owner ${owner.name}`,
    `Cost ${cost}, run time ${spokenMinutes(run.minutes)}, updated ${run.updated}`,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={EXIT}
      transition={{ opacity: ENTER, layout: LAYOUT_TRANSITION }}
    >
      <Button
        variant="ghost"
        size="none"
        data-list-nav=""
        data-run-id={run.id}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => openAgent(agent.id)}
        className={cn(
          ROW_GRID,
          "h-10 w-full justify-normal rounded-lg px-3 text-left font-normal",
          "hover:bg-tint-7 active:bg-tint-10 motion-safe:active:scale-100",
          "focus-visible:bg-tint-7 focus-visible:ring-inset focus-visible:ring-offset-0",
          // Keyboard walking stops a row clear of the sticky group header (h-9).
          "scroll-mt-9 scroll-mb-3",
        )}
      >
        <AgentAvatar agent={agent} size="xs" />

        <span className="truncate text-sm font-medium text-foreground">{run.title}</span>

        <span className="hidden min-w-0 items-center gap-1.5 text-md text-muted-foreground @3xl/list:flex">
          {tone ? <tone.icon className={cn("size-3.5 shrink-0", tone.className)} aria-hidden="true" /> : null}
          {caption ? <span className="truncate">{caption.text}</span> : null}
        </span>

        <span className="flex min-w-0 items-center justify-end gap-3 text-md">
          <span className={cn("hidden min-w-0 items-center gap-3 @3xl/list:flex", REVEAL)}>
            <span className="truncate text-muted-foreground">{agent.name}</span>
            <span className="text-foreground-low tabular-nums">{cost}</span>
          </span>
          <span className="whitespace-nowrap text-foreground-low tabular-nums">{run.updated}</span>
        </span>
      </Button>
    </motion.li>
  );
}
