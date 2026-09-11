"use client";

import { IconAlertTriangle, IconPlayerPauseFilled } from "@tabler/icons-react";

import {
  FlowNode,
  FlowNodeAction,
  FlowNodeContent,
  FlowNodeDescription,
  FlowNodeFooter,
  FlowNodeHeader,
  FlowNodeMedia,
  FlowNodeTitle,
  type NodeProps,
} from "@/components/ui/flow";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FleetAgent, FleetRun } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { RUN_TONE_CLASSES, RunStatusIcon } from "@/components/teams/fleet/run-status";
import { formatUsd } from "@/components/teams/fleet/format";
import { ORG_NODE_SIZE, isActiveRun, type OrgAgentNode } from "@/components/teams/org/org-graph";
import { cardEntranceClass, cardEntranceStyle, useOrgEntrance } from "@/components/teams/org/org-entrance";

// One agent on the org chart: a compact profile card, Paperclip's org node
// with the live state Relevance AI's workforce canvas puts on each agent.
//
//   header   the monogram with its state dot, then name, role and model on
//            three rows (Paperclip's order), and the accountable person's
//            face at the right: whose agent this is
//   live     what it is doing now, in the agent's own words; paused and error
//            in their tones with a glyph, so the state never rests on colour
//            alone. When a run is blocked on a person, the ask sits under it
//            on the brand tint: the one tangerine thing on the card
//   footer   active runs, spend against the monthly budget on a hairline
//            meter (amber from 90%, as in the summary strip), and the rubric
//            score, all tabular so a row of cards scans as a column
//
// COMPACT. Specialists (no reports) are the chart's bottom rank, and that
// rank sets how far the canvas has to zoom out (org-graph.ts), so their card
// is 64px narrower: a 24px monogram in line with the name and the owner's
// face, the role on its own row under all three (the longest, "Refunds and
// disputes", needs 129px of the 152 there), no model row (the sheet has
// it), the ask in place of the live line when there is one (the state dot
// still says what the agent is doing), and spend and score in the footer on
// a shorter meter.
//
// The card is a fixed box (ORG_NODE_SIZE) so the layout can place it before
// React Flow measures it; the live area takes the slack and clips.

function LiveLine({ agent, lines }: { agent: FleetAgent; lines: 1 | 2 }) {
  const clamp = lines === 2 ? "line-clamp-2 text-pretty" : "truncate";

  if (agent.state === "idle") {
    return (
      <p className="truncate text-foreground-low">
        Idle · <span className="tabular-nums">{agent.runsThisWeek}</span> runs this week
      </p>
    );
  }

  if (agent.state === "paused" || agent.state === "error") {
    const Icon = agent.state === "paused" ? IconPlayerPauseFilled : IconAlertTriangle;
    return (
      <p className={cn("flex gap-1.5", agent.state === "paused" ? "text-warning" : "text-destructive")}>
        <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span className={clamp}>
          <span className="sr-only">{agent.state === "paused" ? "Paused: " : "Error: "}</span>
          {agent.activity ?? (agent.state === "paused" ? "Paused" : "Stopped with an error")}
        </span>
      </p>
    );
  }

  return <p className={cn(clamp, "text-muted-foreground")}>{agent.activity ?? "Working"}</p>;
}

function NeedsYou({ run, more, lines }: { run: FleetRun; more: number; lines: 1 | 2 }) {
  return (
    <p
      className={cn(
        "flex min-w-0 gap-1 rounded-md px-1.5 py-0.5 text-brand-subtle-foreground",
        lines === 2 ? "items-start" : "items-center",
        RUN_TONE_CLASSES.brand.tint,
      )}
    >
      <RunStatusIcon status="needs-you" className={cn("size-3.5", lines === 2 && "mt-0.5")} />
      <span className={lines === 2 ? "line-clamp-2 text-pretty" : "truncate"}>
        <span className="sr-only">Needs you: </span>
        {run.needs}
      </span>
      {more > 0 ? <span className="ml-auto shrink-0 pl-1 tabular-nums">+{more}</span> : null}
    </p>
  );
}

function BudgetMeter({ spend, budget, compact }: { spend: number; budget: number; compact: boolean }) {
  const share = budget > 0 ? Math.min(1, spend / budget) : 0;
  return (
    <span
      aria-hidden="true"
      className={cn("relative h-1 shrink-0 overflow-hidden rounded-full bg-chart-track", compact ? "w-5" : "w-7")}
    >
      <span
        className={cn("absolute inset-y-0 left-0 rounded-full", share >= 0.9 ? "bg-warning" : "bg-muted-foreground")}
        style={{ width: `${Math.round(share * 100)}%` }}
      />
    </span>
  );
}

export function AgentNode({ data }: NodeProps<OrgAgentNode>) {
  const { agentById, memberById, runsForAgent } = useFleet();
  const phase = useOrgEntrance();
  const agent = agentById(data.agentId);
  const owner = memberById(agent.ownerId);
  const runs = runsForAgent(agent.id);
  const active = runs.filter(isActiveRun).length;
  const asks = runs.filter((run) => run.status === "needs-you");
  const { compact } = data;

  return (
    <FlowNode
      handles={{ target: true, source: data.hasReports }}
      className={cn("[--avatar-cutout:var(--surface-elevated)]", cardEntranceClass(phase))}
      style={{ ...(compact ? ORG_NODE_SIZE.specialist : ORG_NODE_SIZE.agent), ...cardEntranceStyle(data.rank) }}
    >
      <FlowNodeHeader>
        <FlowNodeMedia className={compact ? "row-span-1 mr-2" : "row-span-3"}>
          <AgentAvatar agent={agent} size={compact ? "sm" : "lg"} showState />
        </FlowNodeMedia>
        <FlowNodeTitle>{agent.name}</FlowNodeTitle>
        {compact ? (
          // The role takes the whole row under the monogram, name and owner
          // (the description part is pinned to the text column).
          <p className="col-span-3 row-start-2 mt-1 truncate text-md text-muted-foreground">{agent.role}</p>
        ) : (
          <>
            <FlowNodeDescription>{agent.role}</FlowNodeDescription>
            <p className="col-start-2 row-start-3 truncate text-foreground-low text-xs">{agent.model}</p>
          </>
        )}
        <FlowNodeAction className="row-span-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <MemberAvatar member={owner} size="xs" aria-label={`Owner: ${owner.name}`} />
            </TooltipTrigger>
            <TooltipContent side="top">Owner · {owner.name}</TooltipContent>
          </Tooltip>
        </FlowNodeAction>
      </FlowNodeHeader>

      <FlowNodeContent className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
        {compact && asks.length > 0 ? (
          <NeedsYou run={asks[0]} more={asks.length - 1} lines={2} />
        ) : (
          <>
            <LiveLine agent={agent} lines={asks.length > 0 ? 1 : 2} />
            {asks.length > 0 ? <NeedsYou run={asks[0]} more={asks.length - 1} lines={1} /> : null}
          </>
        )}
      </FlowNodeContent>

      <FlowNodeFooter className="justify-between whitespace-nowrap tabular-nums">
        {compact ? null : (
          <span>
            <span className="font-medium text-muted-foreground">{active}</span> active
          </span>
        )}
        <span className={cn("flex min-w-0 items-center", compact ? "gap-1" : "gap-1.5")}>
          <BudgetMeter spend={agent.spend} budget={agent.budget} compact={compact} />
          <span className="truncate">
            <span className="font-medium text-muted-foreground">{formatUsd(agent.spend, { whole: true })}</span>
            <span aria-hidden="true"> / </span>
            <span className="sr-only"> spent of </span>
            {formatUsd(agent.budget, { whole: true })}
          </span>
        </span>
        <span>
          Score <span className="font-medium text-muted-foreground">{agent.score}</span>
        </span>
      </FlowNodeFooter>
    </FlowNode>
  );
}
