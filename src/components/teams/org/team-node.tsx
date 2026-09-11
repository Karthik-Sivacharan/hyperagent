"use client";

import { IconUsersGroup } from "@tabler/icons-react";

import {
  FlowNode,
  FlowNodeAction,
  FlowNodeDescription,
  FlowNodeHeader,
  FlowNodeMedia,
  FlowNodeTitle,
  type NodeProps,
} from "@/components/ui/flow";
import { IconTile } from "@/components/ui/icon-tile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";
import { ORG_NODE_SIZE, type OrgTeamNode } from "@/components/teams/org/org-graph";
import { cardEntranceClass, cardEntranceStyle, useOrgEntered } from "@/components/teams/org/org-entrance";

// The root of the chart: the team the orchestrator reports to, with its
// people beside its name (spaced, not stacked, like the page header, so two
// online rings never read as one knot). Not selectable: it is where the
// chart hangs from, not a thing to open.

export function TeamNode({ data }: NodeProps<OrgTeamNode>) {
  const { team, agents } = useFleet();
  const entered = useOrgEntered();

  return (
    <FlowNode
      handles={{ target: false, source: agents.length > 0 }}
      className={cn("justify-center [--avatar-cutout:var(--surface-elevated)]", cardEntranceClass(entered))}
      style={{ ...ORG_NODE_SIZE.team, ...cardEntranceStyle(data.rank) }}
    >
      <FlowNodeHeader>
        <FlowNodeMedia>
          <IconTile size="lg" shape="soft" tone="raised" className="size-10">
            <IconUsersGroup className="size-5" aria-hidden="true" />
          </IconTile>
        </FlowNodeMedia>
        <FlowNodeTitle>{team.name}</FlowNodeTitle>
        <FlowNodeDescription className="tabular-nums">
          {team.members.length} people · {agents.length} agents
        </FlowNodeDescription>
        <FlowNodeAction className="gap-1">
          {team.members.map((member) => (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <MemberAvatar member={member} size="sm" />
              </TooltipTrigger>
              <TooltipContent side="top">
                {member.name} · {member.role}
                {member.online ? null : " · away"}
              </TooltipContent>
            </Tooltip>
          ))}
        </FlowNodeAction>
      </FlowNodeHeader>
    </FlowNode>
  );
}
