"use client";

import { useId, type ReactNode } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { FleetAgent } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { formatUsd } from "@/components/teams/fleet/format";
import { AgentChip } from "@/components/teams/sheet/agent-chip";
import {
  FOLD_CHEVRON,
  FOLD_CONTENT,
  FOLD_TRIGGER,
  SECTION_TITLE,
} from "@/components/teams/sheet/sheet-parts";

// The facts about an agent that are rarely why someone opened it: model,
// owner, reporting line, sub-agents, spend, score, skills. They fold away
// under "Details", closed by default; agent-sheet.tsx holds the open state,
// so a reader who opened it keeps it open while moving from agent to agent.
//
// ONE LIST, TWO COLUMNS. A `dl` with the labels on the third text tier and
// the values in ink. Every text value sits in a 28px line (`py-1` on a 20px
// line), the height of an agent chip, so a row of text and a row of chips
// share a rhythm, and a value that wraps (a long skills list) keeps its first
// line level with its label.
//
// SPEND is the figure and a 48px meter beside it. The fill is neutral until
// the agent nears its cap: warning from 90%, destructive at the cap (Gauge,
// paused at its $80), the one coloured fill on the page (plan §3). The track
// stays neutral in every state, and the figure and the meter's spoken value
// say the same thing in words, so the colour is never the only signal.

type SpendTone = "neutral" | "warning" | "destructive";

const SPEND_FILL: Record<SpendTone, string> = {
  neutral: "bg-muted-foreground",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

function money(value: number) {
  return formatUsd(value, { whole: Number.isInteger(value) });
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="py-1 text-foreground-low">{label}</dt>
      <dd className="flex min-h-7 min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-foreground">{children}</dd>
    </>
  );
}

function Spend({ agent }: { agent: FleetAgent }) {
  const share = agent.budget > 0 ? agent.spend / agent.budget : 0;
  const pct = Math.round(Math.min(1, share) * 100);
  const tone: SpendTone = share >= 1 ? "destructive" : share >= 0.9 ? "warning" : "neutral";
  const figure = `${money(agent.spend)} of ${money(agent.budget)}`;
  const spoken =
    tone === "destructive"
      ? `${figure} this month, at its monthly cap`
      : `${figure} this month, ${pct}% of the monthly budget${tone === "warning" ? ", nearing the cap" : ""}`;

  return (
    <>
      <span className="py-1 tabular-nums">{figure}</span>
      <span
        role="meter"
        aria-label="Spend this month"
        aria-valuemin={0}
        aria-valuemax={agent.budget}
        aria-valuenow={Math.min(agent.spend, agent.budget)}
        aria-valuetext={spoken}
        className="relative h-1 w-12 shrink-0 overflow-hidden rounded-full bg-chart-track"
      >
        <span className={cn("absolute inset-y-0 left-0 rounded-full", SPEND_FILL[tone])} style={{ width: `${pct}%` }} />
      </span>
    </>
  );
}

export function AgentDetails({
  agent,
  open,
  onOpenChange,
}: {
  agent: FleetAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { team, agentById, memberById, subAgentsOf, openAgent } = useFleet();
  const titleId = useId();

  const owner = memberById(agent.ownerId);
  const parent = agent.parentId ? agentById(agent.parentId) : null;
  const subAgents = subAgentsOf(agent.id);

  return (
    <Collapsible asChild open={open} onOpenChange={onOpenChange}>
      <section aria-labelledby={titleId}>
        <h3 id={titleId} className="flex">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="none"
              className={cn(FOLD_TRIGGER, SECTION_TITLE, "hover:text-foreground")}
            >
              Details
              <IconChevronDown className={FOLD_CHEVRON} aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
        </h3>

        {/* `-mx-2 px-2` widens the clip box the fold needs, so a chip's
            focus ring (4px outside a chip that already sits 4px left of the
            column) is not cut off at the section's edge. */}
        <CollapsibleContent className={cn(FOLD_CONTENT, "-mx-2 px-2")}>
          <dl className="grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-x-4 gap-y-1 pt-1 text-sm">
            <Fact label="Model">
              <span className="py-1">{agent.model}</span>
            </Fact>
            <Fact label="Owner">
              <MemberAvatar member={owner} size="xs" aria-hidden="true" />
              <span className="min-w-0 truncate py-1">
                {owner.name}
                <span className="sr-only">{owner.online ? ", online" : ", away"}</span>
              </span>
            </Fact>
            <Fact label="Reports to">
              {parent ? (
                <AgentChip agent={parent} onSelect={openAgent} className="-ml-1" />
              ) : (
                <span className="py-1">{team.name}</span>
              )}
            </Fact>
            {subAgents.length ? (
              <Fact label="Sub-agents">
                <ul className="-ml-1 flex min-w-0 flex-wrap gap-1">
                  {subAgents.map((sub) => (
                    <li key={sub.id} className="min-w-0">
                      <AgentChip agent={sub} onSelect={openAgent} />
                    </li>
                  ))}
                </ul>
              </Fact>
            ) : null}
            <Fact label="Spend">
              <Spend agent={agent} />
            </Fact>
            <Fact label="Score">
              <span className="py-1 tabular-nums">{agent.score} of 100</span>
            </Fact>
            <Fact label="Skills">
              <span className="py-1">{agent.skills.join(", ")}</span>
            </Fact>
          </dl>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
