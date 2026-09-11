"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useIsPresent } from "motion/react";
import { IconArrowUpRight, IconPlayerPause, IconPlayerPlay, IconUsersGroup } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";
import { RUN_STATUS_ORDER, type AgentState, type FleetAgent, type FleetRun } from "@/lib/mock/teams";
import { PanelEmpty, PanelSection } from "@/components/agent-panel/panel-section";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AGENT_STATE_META, AgentAvatar, AgentStateDot } from "@/components/teams/fleet/agent-avatar";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { RunStatusBadge } from "@/components/teams/fleet/run-status";
import { AgentChip } from "@/components/teams/sheet/agent-chip";
import { SpendSection } from "@/components/teams/sheet/spend-meter";
import { WeekActivitySection } from "@/components/teams/sheet/week-activity";

// One agent's page inside the sheet. agent-sheet.tsx keys it by agent id
// under AnimatePresence, so moving to another agent (a sub-agent chip, the
// "Reports to" chip) swaps one of these for the next in place: the old one
// fades out in 90ms while the new one fades in over 200ms with a 4px rise,
// and the sheet itself never moves. Each page is absolutely stacked in the
// same box with its own scroller, so the outgoing page keeps its scroll
// position while it fades and the incoming one starts at the top.
//
// While a page is leaving it is `inert` (no focus, no clicks) and its title
// and description drop the dialog's ids, so for those 90ms the sheet still
// has exactly one title for aria-labelledby to find.
//
// LAYOUT. The header does not scroll: who this is, what it is doing now,
// and the two actions stay in reach. Under it, in the agent panel's own
// bands (PanelSection: 20px inset, a caps group label, hairlines between
// bands, never between rows): the facts, this month's spend, the week's
// runs, the runs themselves with the ones waiting on a person first, the
// sub-agents, the skills. Summary before detail, the page shell's rule.

const TITLE = "truncate font-heading text-xl font-semibold text-foreground";
const DESCRIPTION = "truncate text-sm text-muted-foreground";

/** The state line's colour: the live line reads as copy; paused and error in their tone. */
const STATE_LINE: Record<AgentState, string> = {
  working: "text-muted-foreground",
  idle: "text-foreground-low",
  paused: "text-warning",
  error: "text-destructive",
};

function stateLine(agent: FleetAgent) {
  if (agent.activity) return agent.activity;
  return agent.state === "idle" ? "Idle, nothing running right now" : AGENT_STATE_META[agent.state].label;
}

/** The second line of a run row: what the person owes, how far it got, or what it produced. */
function runDetail(run: FleetRun): string | undefined {
  switch (run.status) {
    case "needs-you":
      return run.needs;
    case "working":
      return run.progress ? `${run.progress.done} of ${run.progress.total} steps` : undefined;
    case "queued":
      return run.progress ? `${run.progress.total} steps planned` : undefined;
    default:
      return run.outcome;
  }
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-foreground-low">{label}</dt>
      <dd className="flex min-h-7 min-w-0 items-center gap-2 text-foreground">{children}</dd>
    </>
  );
}

function RunRow({ run }: { run: FleetRun }) {
  const detail = runDetail(run);
  return (
    <li className="flex min-h-10 items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate text-sm leading-5 font-medium text-foreground">{run.title}</span>
        <span className="flex min-w-0 items-center gap-1.5 text-xs leading-4 text-foreground-low">
          {detail ? (
            <>
              {/* What the person has to do is read, not scanned: tier two. */}
              <span className={cn("truncate", run.status === "needs-you" && "text-muted-foreground")}>{detail}</span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span className="shrink-0">{run.updated}</span>
        </span>
      </div>
      <RunStatusBadge status={run.status} />
    </li>
  );
}

export function AgentProfile({ agent }: { agent: FleetAgent }) {
  const isPresent = useIsPresent();
  const { team, agentById, memberById, subAgentsOf, runsForAgent, openAgent } = useFleet();

  const owner = memberById(agent.ownerId);
  const parent = agent.parentId ? agentById(agent.parentId) : null;
  const subAgents = subAgentsOf(agent.id);
  const runs = [...runsForAgent(agent.id)].sort(
    (a, b) => RUN_STATUS_ORDER.indexOf(a.status) - RUN_STATUS_ORDER.indexOf(b.status),
  );
  const paused = agent.state === "paused";

  const Title: ElementType = isPresent ? SheetTitle : "h2";
  const Description: ElementType = isPresent ? SheetDescription : "p";

  return (
    <motion.div
      inert={!isPresent}
      data-agent={agent.id}
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.outQuart } }}
      exit={{ opacity: 0, transition: { duration: DURATION.exit, ease: EASE.out } }}
    >
      <header className="shrink-0 border-b border-border-subtle p-5">
        {/* pr-10 keeps the name clear of the close button in the corner. The
            monogram leaves its state dot off here: the state line under it
            carries the same dot, and two of them 40px apart read as two
            signals. */}
        <div className="flex items-center gap-4 pr-10">
          <AgentAvatar agent={agent} size="lg" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <Title className={TITLE}>{agent.name}</Title>
            <Description className={DESCRIPTION}>{agent.role}</Description>
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-sm">
          <AgentStateDot state={agent.state} className="mt-1.5" />
          <span className={STATE_LINE[agent.state]}>
            <span className="sr-only">{AGENT_STATE_META[agent.state].label}: </span>
            {stateLine(agent)}
          </span>
        </p>

        {/* Both actions are placeholders in v1: there is no agent page to
            open and nothing to pause. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <IconArrowUpRight aria-hidden="true" />
            Open agent
          </Button>
          <Button variant="outline" size="sm">
            {paused ? <IconPlayerPlay aria-hidden="true" /> : <IconPlayerPause aria-hidden="true" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
      </header>

      {/* `[&>div]:!block`: Radix wraps the viewport's content in an inline
          `display: table` box that sizes to its widest line, which would
          stop the run titles from truncating (agent-panel.tsx has the long
          version of this note). */}
      <ScrollArea className="min-h-0 flex-1" viewportProps={{ className: "[&>div]:!block" }}>
        <div className="pb-8">
          <dl className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1.5 border-b border-border-subtle p-5 text-sm">
            <Fact label="Model">{agent.model}</Fact>
            <Fact label="Owner">
              {/* A tint, not the chip fill: in dark the chip fill is the
                  sheet's own neutral-900, so an offline face (no presence
                  ring) would have no edge at all. */}
              <MemberAvatar member={owner} size="xs" aria-hidden="true" className="bg-tint-15" />
              <span className="truncate">{owner.name}</span>
              <span className="sr-only">{owner.online ? ", online" : ", away"}</span>
            </Fact>
            <Fact label="Reports to">
              {parent ? (
                <AgentChip agent={parent} onSelect={openAgent} />
              ) : (
                <>
                  <IconUsersGroup className="size-4 shrink-0 text-foreground-low" aria-hidden="true" />
                  <span className="truncate">{team.name}</span>
                </>
              )}
            </Fact>
            <Fact label="Score">
              <span className="tabular-nums">
                {agent.score}
                <span className="text-foreground-low"> / 100</span>
              </span>
            </Fact>
          </dl>

          <SpendSection agent={agent} />
          <WeekActivitySection agent={agent} />

          <PanelSection meta={{ id: "runs", title: "Runs", empty: "" }} count={runs.length}>
            {runs.length ? (
              <ul className="flex flex-col gap-2">
                {runs.map((run) => (
                  <RunRow key={run.id} run={run} />
                ))}
              </ul>
            ) : (
              <PanelEmpty>Nothing on its plate this week.</PanelEmpty>
            )}
          </PanelSection>

          {subAgents.length ? (
            <PanelSection meta={{ id: "sub-agents", title: "Sub-agents", empty: "" }} count={subAgents.length}>
              <ul className="flex flex-wrap gap-2">
                {subAgents.map((sub) => (
                  <li key={sub.id} className="min-w-0">
                    <AgentChip agent={sub} onSelect={openAgent} />
                  </li>
                ))}
              </ul>
            </PanelSection>
          ) : null}

          <PanelSection meta={{ id: "skills", title: "Skills", empty: "" }} count={agent.skills.length}>
            <ul className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="secondary">{skill}</Badge>
                </li>
              ))}
            </ul>
          </PanelSection>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
