"use client";

import { FlowNode, FlowNodeTitle, type NodeProps } from "@/components/ui/flow";
import { cn } from "@/lib/utils";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { spendOfBudget, teamTotals, type OrgTeamNode } from "@/components/teams/org/org-graph";
import { cardEntranceClass, cardEntranceStyle, useOrgEntrance } from "@/components/teams/org/org-entrance";
import { NodeTip } from "@/components/teams/org/node-tip";

// The root of the chart, the team Atlas reports to: one row, its name and
// its people's faces overlapped, as wide as that and no wider (org-graph.ts
// centres it on the chart's axis). Not selectable, since nothing opens from
// it; its tooltip holds what the page's summary line used to: the team's
// purpose, its size, its spend against budget and its average score. The
// faces are hidden from assistive tech because the node's name lists the
// people.

function TeamTip() {
  const { team, agents } = useFleet();
  const totals = teamTotals(team, agents);
  return (
    <>
      <p className="text-pretty">{team.description}</p>
      <p className="text-muted-foreground tabular-nums">
        {totals.people} people and {totals.agents} agents
      </p>
      <p className="text-muted-foreground tabular-nums">{spendOfBudget(totals.spend, totals.budget)} this month</p>
      <p className="text-muted-foreground tabular-nums">Average score {totals.score}</p>
    </>
  );
}

export function TeamNode({ id, data }: NodeProps<OrgTeamNode>) {
  const { team, agents } = useFleet();
  const phase = useOrgEntrance();

  return (
    <NodeTip id={id} content={<TeamTip />}>
      <FlowNode
        handles={{ target: false, source: agents.length > 0 }}
        className={cn(
          "h-12 w-auto flex-row items-center gap-3 rounded-xl px-4 py-0 [--avatar-cutout:var(--card)]",
          cardEntranceClass(phase),
        )}
        style={cardEntranceStyle(data.rank)}
      >
        <FlowNodeTitle className="shrink-0">{team.name}</FlowNodeTitle>
        <div aria-hidden="true" className="flex shrink-0 -space-x-1">
          {team.members.map((member) => (
            <MemberAvatar key={member.id} member={member} size="xs" />
          ))}
        </div>
      </FlowNode>
    </NodeTip>
  );
}
