"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DURATION, EASE, LAYOUT_TRANSITION } from "@/lib/motion";
import type { FleetAgent, FleetRun } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { RUN_STATUS_META, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { formatMinutes, formatUsd } from "@/components/teams/fleet/format";
import { LIST_COL, LIST_GRID } from "@/components/teams/list/list-grid";

// One run, one row: status, id, the title over a detail line that changes
// with the status, then who and what it cost. The whole row is the control
// (the shared ghost `Button` as a grid): a click or Enter opens the agent's
// sheet, the one thing a run leads to in v1, so there is no second control
// inside it to tab through. Two lines at 50px, the density of a Linear list
// with GitHub's outcome line under the title.
//
// THE DETAIL LINE is what the reader would otherwise have to open the run to
// learn, and it is different per status:
//   needs you   the ask, in the tangerine text tier: the one place the
//               accent is spent in this view besides the status glyph
//   working     a step meter and the agent's live line
//   queued      the planned step count, or who it is waiting on when its
//               agent is paused or in error
//   review/done the receipt (the outcome)
//
// The row's hover and focus fill is tint-7, the brand's row hover; the focus
// ring is drawn inset so the group's clipping never cuts it. The owner's
// avatar drops its canvas band (--avatar-cutout) because the row under it is
// not always the canvas.

const ENTER = { duration: DURATION.normal, ease: EASE.out };
const EXIT = { opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } };

/** The detail line as plain text (the row's accessible name reuses it). */
export function runDetail(run: FleetRun, agent: FleetAgent): string {
  switch (run.status) {
    case "needs-you":
      return run.needs ?? "Waiting on you";
    case "working":
      return agent.state === "working" && agent.activity
        ? agent.activity
        : run.progress
          ? `Step ${Math.min(run.progress.done + 1, run.progress.total)} of ${run.progress.total}`
          : "Under way";
    case "queued":
      if ((agent.state === "paused" || agent.state === "error") && agent.activity) {
        return `Waiting on ${agent.name} · ${agent.activity}`;
      }
      return run.progress ? `${run.progress.total} steps planned` : "Up next";
    case "review":
    case "done":
      return run.outcome ?? "";
  }
}

/** Run time for the accessible name: "19m" would be read as nineteen metres. */
function spokenMinutes(minutes: number): string {
  const total = Math.max(1, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (hours === 0) return part(rest, "minute");
  return rest === 0 ? part(hours, "hour") : `${part(hours, "hour")} ${part(rest, "minute")}`;
}

function StepMeter({ done, total }: { done: number; total: number }) {
  const share = total > 0 ? Math.min(1, done / total) : 0;
  return (
    <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
      <span className="relative h-1 w-8 overflow-hidden rounded-full bg-chart-track">
        <span className="absolute inset-y-0 left-0 rounded-full bg-info" style={{ width: `${Math.round(share * 100)}%` }} />
      </span>
      <span className="text-xs text-foreground-low tabular-nums">
        {done}/{total}
      </span>
    </span>
  );
}

function DetailLine({ run, text }: { run: FleetRun; text: string }) {
  if (run.status === "needs-you") {
    return <span className="truncate text-md text-brand-subtle-foreground">{text}</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-2 text-md text-muted-foreground">
      {run.status === "working" && run.progress ? <StepMeter {...run.progress} /> : null}
      <span className="truncate">{text}</span>
    </span>
  );
}

export function RunRow({ run }: { run: FleetRun }) {
  const { agentById, memberById, openAgent } = useFleet();
  const agent = agentById(run.agentId);
  const owner = memberById(run.ownerId);
  const detail = runDetail(run, agent);
  const cost = formatUsd(run.cost);
  const time = formatMinutes(run.minutes);

  const label = [
    `${run.title}, ${run.id}`,
    `${RUN_STATUS_META[run.status].label}: ${detail}`,
    run.status === "working" && run.progress ? `${run.progress.done} of ${run.progress.total} steps done` : null,
    `Project ${run.project}`,
    `Agent ${agent.name}, owner ${owner.name}`,
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
          LIST_GRID,
          "w-full justify-normal rounded-lg px-3 py-1.5 text-left font-normal whitespace-normal",
          "hover:bg-tint-7 active:bg-tint-10 motion-safe:active:scale-100",
          "focus-visible:bg-tint-7 focus-visible:ring-inset focus-visible:ring-offset-0",
          "scroll-mt-20 scroll-mb-3",
        )}
      >
        <span className={LIST_COL.status}>
          <RunStatusIcon status={run.status} />
        </span>

        <span className={cn(LIST_COL.id, "text-md text-foreground-low tabular-nums")}>{run.id}</span>

        <span className={LIST_COL.run}>
          <span className="truncate text-sm font-medium text-foreground">{run.title}</span>
          <DetailLine run={run} text={detail} />
        </span>

        <span className={LIST_COL.project}>
          <Badge variant="secondary" className="max-w-full">
            <span className="truncate">{run.project}</span>
          </Badge>
        </span>

        <span className={LIST_COL.agent}>
          <AgentAvatar agent={agent} size="xs" showState />
          <span className="hidden truncate text-sm text-muted-foreground transition-[color] duration-(--duration-fast) ease-out-quart group-hover/button:text-foreground @xl/list:block">
            {agent.name}
          </span>
        </span>

        <span className={LIST_COL.owner}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <MemberAvatar member={owner} size="xs" className="[--avatar-cutout:transparent]" />
            </TooltipTrigger>
            <TooltipContent>
              {owner.name} · {owner.role}
            </TooltipContent>
          </Tooltip>
        </span>

        <span className={cn(LIST_COL.cost, "text-md text-muted-foreground tabular-nums")}>{cost}</span>
        <span className={cn(LIST_COL.time, "text-md text-muted-foreground tabular-nums")}>{time}</span>
        <span className={cn(LIST_COL.updated, "text-md whitespace-nowrap text-foreground-low tabular-nums")}>
          {run.updated}
        </span>
      </Button>
    </motion.li>
  );
}
