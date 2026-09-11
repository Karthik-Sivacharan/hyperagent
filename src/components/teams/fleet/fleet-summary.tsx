"use client";

import { cn } from "@/lib/utils";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentStateDot } from "@/components/teams/fleet/agent-avatar";
import { formatUsd } from "@/components/teams/fleet/format";

// The team at a glance, before any detail: one line that reads as a
// sentence, numbers first, the way Claude Code's agent view opens ("1
// awaiting input · 1 working · 2 completed"). Small on purpose, not tiles.
// The tangerine accent goes to the one number that is the reader's own debt,
// "need you"; working carries the live info dot; spend gets a hairline meter
// against the month's budget (amber past 90%); the score is the fleet's
// average rubric score. Counts are the whole team, never the search result.

function Divider() {
  return <li aria-hidden="true" className="h-3.5 w-px bg-border-subtle max-sm:hidden" />;
}

export function FleetSummary() {
  const { agents, allRuns } = useFleet();
  const needsYou = allRuns.filter((run) => run.status === "needs-you").length;
  const working = allRuns.filter((run) => run.status === "working").length;
  const spend = agents.reduce((sum, agent) => sum + agent.spend, 0);
  const budget = agents.reduce((sum, agent) => sum + agent.budget, 0);
  const share = budget > 0 ? Math.min(1, spend / budget) : 0;
  const score = agents.length ? Math.round(agents.reduce((sum, agent) => sum + agent.score, 0) / agents.length) : 0;

  return (
    <ul aria-label="Team at a glance" className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 px-6 pt-4 text-sm">
      <li className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-brand-accent" aria-hidden="true" />
        <span className="font-medium text-brand-subtle-foreground tabular-nums">{needsYou}</span>
        <span className="text-muted-foreground">{needsYou === 1 ? "needs you" : "need you"}</span>
      </li>
      <Divider />
      <li className="flex items-center gap-2">
        <AgentStateDot state="working" />
        <span className="font-medium text-foreground tabular-nums">{working}</span>
        <span className="text-muted-foreground">working now</span>
      </li>
      <Divider />
      <li className="flex items-center gap-2">
        <span className="font-medium text-foreground tabular-nums">{formatUsd(spend, { whole: true })}</span>
        <span className="text-muted-foreground tabular-nums">of {formatUsd(budget, { whole: true })} this month</span>
        <span aria-hidden="true" className="relative h-1 w-14 overflow-hidden rounded-full bg-chart-track">
          <span
            className={cn("absolute inset-y-0 left-0 rounded-full", share >= 0.9 ? "bg-warning" : "bg-muted-foreground")}
            style={{ width: `${Math.round(share * 100)}%` }}
          />
        </span>
      </li>
      <Divider />
      <li className="flex items-center gap-2">
        <span className="font-medium text-foreground tabular-nums">{score}</span>
        <span className="text-muted-foreground">avg score</span>
      </li>
    </ul>
  );
}
