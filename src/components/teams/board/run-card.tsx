"use client";

import * as React from "react";
import { IconAlertTriangle, IconCornerDownRight, IconHourglassLow, IconPlayerPause } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FleetAgent, FleetRun, TeamMember } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AGENT_STATE_META, AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { formatMinutes, formatUsd } from "@/components/teams/fleet/format";
import { RUN_TRIGGER_META } from "@/components/teams/board/triggers";
import { StepBar } from "@/components/teams/board/step-bar";

// One run on the board. Top to bottom: where it came from (the trigger glyph
// and the project) and how fresh it is; the title, two lines at most; one
// row that changes with the status, because each column asks a different
// question of a card; and who is on it with what it has cost so far.
//
// THE MIDDLE ROW. Needs you: the ask itself on the tangerine tint, the only
// place the accent lands on a card, with a Review pill beside it. Working:
// the agent's live line and its steps, the step under way sweeping softly
// (step-bar.tsx), and the sub-agents it has handed work to. Queued: where it
// sits in the team's queue, or why it cannot start (its agent is paused or
// broken). In review and Done: the receipt, what the run produced.
//
// WHO. The agent doing the work leads, and the person who answers for it
// follows as "for" plus their face: Linear's delegate-not-reassign, where the
// human stays accountable and the agent is nested under them. The agent's
// state dot shows only when something is wrong (paused, error); a board full
// of healthy working dots would pulse for no reason.
//
// INTERACTION. The card is a focusable `article` (the ARIA feed shape: a
// focusable item that holds its own controls), so Tab lands on each card and
// then on the controls inside it; arrow keys move between cards
// (board-view.tsx). A click or Enter on the card opens the agent sheet for
// the run's agent, the same thing the agent's name does, since v1 has no run
// page. Hover lifts the shadow at --duration-slow; press scales to
// --scale-press at the button speed, but not while an inner control is the
// one being pressed.

export function RunCard({ run, queuePosition, phase = 0 }: { run: FleetRun; queuePosition?: number; phase?: number }) {
  const { agentById, memberById, openAgent } = useFleet();
  const agent = agentById(run.agentId);
  const owner = memberById(run.ownerId);
  const trigger = RUN_TRIGGER_META[run.trigger];
  const TriggerIcon = trigger.icon;
  const titleId = React.useId();
  const detailId = React.useId();

  return (
    <Card
      asChild
      size="none"
      className={cn(
        "cursor-pointer gap-2.5 rounded-2xl p-3 outline-none [--avatar-cutout:var(--card)]",
        "[transition:box-shadow_var(--duration-slow)_var(--ease-out),scale_var(--duration-fast)_var(--ease-out-quart)] hover:shadow-card-hover",
        "motion-safe:active:not-has-[button:active]:scale-(--scale-press)",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-secondary",
      )}
    >
      <article
        data-run-card=""
        data-status={run.status}
        tabIndex={0}
        aria-labelledby={titleId}
        aria-describedby={detailId}
        onClick={() => openAgent(agent.id)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || event.key !== "Enter") return;
          event.preventDefault();
          openAgent(agent.id);
        }}
      >
        <div className="flex items-center justify-between gap-3 text-xs text-foreground-low">
          <span className="flex min-w-0 items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex shrink-0">
                  <TriggerIcon className="size-3.5" aria-hidden="true" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{trigger.label}</TooltipContent>
            </Tooltip>
            <span className="sr-only">{trigger.label}, </span>
            <span className="truncate">{run.project}</span>
          </span>
          <span className="shrink-0 tabular-nums">{run.updated}</span>
        </div>

        <h3 id={titleId} className="line-clamp-2 text-sm font-medium text-foreground">
          {run.title}
        </h3>

        <div id={detailId}>
          <RunDetail run={run} agent={agent} queuePosition={queuePosition} phase={phase} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Delegation agent={agent} owner={owner} onOpenAgent={openAgent} />
          <span className="shrink-0 text-xs text-foreground-low tabular-nums">
            {formatUsd(run.cost)} · {formatMinutes(run.minutes)}
          </span>
        </div>
      </article>
    </Card>
  );
}

/** Stops a control's click from also landing on the card behind it. */
function own(handler?: () => void) {
  return (event: React.MouseEvent) => {
    event.stopPropagation();
    handler?.();
  };
}

function RunDetail({
  run,
  agent,
  queuePosition,
  phase,
}: {
  run: FleetRun;
  agent: FleetAgent;
  queuePosition?: number;
  phase: number;
}) {
  switch (run.status) {
    case "needs-you":
      return (
        <div className="flex items-center gap-2 rounded-xl bg-brand-subtle py-1.5 pr-1.5 pl-2.5">
          <p className="min-w-0 flex-1 text-md font-medium text-brand-subtle-foreground">{run.needs}</p>
          {/* v1: no action behind it yet. */}
          <Button size="xs" variant="outline" className="shrink-0" onClick={own()}>
            Review
          </Button>
        </div>
      );
    case "working":
      return <WorkingDetail run={run} agent={agent} phase={phase} />;
    case "queued":
      return <QueuedDetail run={run} agent={agent} queuePosition={queuePosition} />;
    default:
      return (
        <p className="flex items-start gap-1.5 text-md text-muted-foreground">
          <IconCornerDownRight className="mt-0.5 size-3.5 shrink-0 text-foreground-low" aria-hidden="true" />
          <span className="sr-only">Outcome: </span>
          <span className="line-clamp-2">{run.outcome}</span>
        </p>
      );
  }
}

function WorkingDetail({ run, agent, phase }: { run: FleetRun; agent: FleetAgent; phase: number }) {
  const { agentById, openAgent } = useFleet();
  const helpers = (run.helpers ?? []).map(agentById);
  const progress = run.progress;

  return (
    <div className="flex flex-col gap-2">
      {agent.activity ? <p className="line-clamp-2 text-md text-muted-foreground">{agent.activity}</p> : null}
      {progress || helpers.length ? (
        <div className="flex h-5 items-center gap-2.5">
          {progress ? (
            <>
              <StepBar done={progress.done} total={progress.total} live phase={phase} />
              <span className="shrink-0 text-xs text-foreground-low tabular-nums">
                <span className="sr-only">Step </span>
                {progress.done}/{progress.total}
                <span className="sr-only"> done</span>
              </span>
            </>
          ) : (
            <span className="flex-1" />
          )}
          {helpers.length ? (
            <div role="group" aria-label="Helping on this run" className="flex shrink-0 items-center -space-x-1">
              {helpers.map((helper) => (
                <Tooltip key={helper.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="none"
                      className="relative rounded-sm hover:z-10 hover:bg-transparent focus-visible:z-10"
                      onClick={own(() => openAgent(helper.id))}
                    >
                      <AgentAvatar agent={helper} size="xs" aria-hidden="true" className="shadow-[0_0_0_2px_var(--card)]" />
                      <span className="sr-only">{helper.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {helper.name} · {helper.role}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ordinal(position: number) {
  if (position === 1) return "Next up";
  const tens = position % 100;
  const suffix = tens >= 11 && tens <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[position % 10] ?? "th";
  return `${position}${suffix} in line`;
}

function QueuedDetail({ run, agent, queuePosition }: { run: FleetRun; agent: FleetAgent; queuePosition?: number }) {
  // A queued run waits either for its turn or, if its agent cannot work, for
  // a person to unblock the agent; the second is the one worth saying.
  const held = agent.state === "paused" || agent.state === "error";
  const Icon = agent.state === "error" ? IconAlertTriangle : agent.state === "paused" ? IconPlayerPause : IconHourglassLow;
  const text = held ? (agent.activity ?? AGENT_STATE_META[agent.state].label) : queuePosition ? ordinal(queuePosition) : "Queued";
  const total = run.progress?.total;

  return (
    <div className="flex items-start justify-between gap-3">
      <p className="flex min-w-0 items-start gap-1.5 text-md text-muted-foreground">
        <Icon
          className={cn(
            "mt-0.5 size-3.5 shrink-0",
            agent.state === "error" ? "text-destructive" : agent.state === "paused" ? "text-warning" : "text-foreground-low",
          )}
          aria-hidden="true"
        />
        <span className="line-clamp-2">{text}</span>
      </p>
      {total ? <span className="mt-px shrink-0 text-xs text-foreground-low tabular-nums">{total} steps</span> : null}
    </div>
  );
}

function Delegation({
  agent,
  owner,
  onOpenAgent,
}: {
  agent: FleetAgent;
  owner: TeamMember;
  onOpenAgent: (id: string) => void;
}) {
  const flagged = agent.state === "paused" || agent.state === "error";
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            className="-my-0.5 -ml-1 h-6 min-w-0 gap-1.5 py-0 pr-2 pl-0.5 text-md"
            aria-label={flagged ? `${agent.name}, ${AGENT_STATE_META[agent.state].label.toLowerCase()}` : undefined}
            onClick={own(() => onOpenAgent(agent.id))}
          >
            <AgentAvatar agent={agent} size="xs" showState={flagged} aria-hidden="true" />
            <span className="truncate">{agent.name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {agent.role} · {agent.model}
        </TooltipContent>
      </Tooltip>
      <span className="text-xs text-foreground-low">for</span>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* On a tint, not the chip fill: in dark the chip is the card's own neutral-900. */}
          <MemberAvatar member={owner} size="xs" className="bg-tint-15" />
        </TooltipTrigger>
        <TooltipContent>Owner · {owner.name}</TooltipContent>
      </Tooltip>
    </div>
  );
}
