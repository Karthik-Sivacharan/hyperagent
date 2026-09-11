"use client";

import {
  FlowNode,
  FlowNodeAction,
  FlowNodeDescription,
  FlowNodeHeader,
  FlowNodeMedia,
  FlowNodeTitle,
  type NodeProps,
} from "@/components/ui/flow";
import { cn } from "@/lib/utils";
import type { FleetAgent, FleetRun } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { RunStatusIcon } from "@/components/teams/fleet/run-status";
import { TONE_GLYPH } from "@/components/teams/fleet/run-caption";
import { accountLine, liveLine, type OrgAgentNode } from "@/components/teams/org/org-graph";
import { cardEntranceClass, cardEntranceStyle, useOrgEntrance } from "@/components/teams/org/org-entrance";
import { NodeTip } from "@/components/teams/org/node-tip";

// One agent on the org chart: who it is, and whether a person is needed.
// The same 208×56 card at every rank (org-graph.ts, AGENT_NODE_SIZE):
//
//   a 32px avatar, the name over the role (both truncated), and a 16px
//   state slot holding at most one glyph, the first that applies: Needs
//   you (the tangerine glyph every view uses for a run blocked on a person),
//   error, paused. Nothing needs a person, nothing in the slot. The slot sits
//   at the end of the name's row and the role runs under it, so the longest
//   role ("Refunds and disputes", 129px) fits beside the avatar untruncated.
//
// Everything else is one interaction deeper. Hover or keyboard focus opens
// the tooltip (org/node-tip.tsx): what the agent is doing (or why it
// stopped), the first thing it is waiting on, and whose it is with its spend
// and score. A click or Enter opens the sheet with the rest. The node's
// accessible name carries all of it (org-graph.ts).

function StateGlyph({ agent, asks }: { agent: FleetAgent; asks: number }) {
  if (asks > 0) return <RunStatusIcon status="needs-you" />;
  if (agent.state !== "error" && agent.state !== "paused") return null;
  const { icon: Icon, className } = TONE_GLYPH[agent.state];
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden="true" />;
}

function AgentTip({ agent, ownerName, asks }: { agent: FleetAgent; ownerName: string; asks: FleetRun[] }) {
  const [ask] = asks;
  return (
    <>
      <p className="text-pretty">{liveLine(agent)}</p>
      {ask ? (
        <p className="flex gap-1.5">
          {/* The tooltip inverts the theme, so in dark it is a light card: the
              deeper tangerine step keeps the glyph at 3:1 there. */}
          <RunStatusIcon status="needs-you" className="mt-px size-3.5 dark:text-brand" />
          <span className="text-pretty">
            {ask.needs ?? ask.title}
            {asks.length > 1 ? (
              <span className="text-muted-foreground tabular-nums">, +{asks.length - 1} more</span>
            ) : null}
          </span>
        </p>
      ) : null}
      <p className="text-muted-foreground tabular-nums">{accountLine(agent, ownerName)}</p>
    </>
  );
}

export function AgentNode({ id, data }: NodeProps<OrgAgentNode>) {
  const { agentById, memberById, runsForAgent } = useFleet();
  const phase = useOrgEntrance();
  const agent = agentById(data.agentId);
  const owner = memberById(agent.ownerId);
  const asks = runsForAgent(agent.id).filter((run) => run.status === "needs-you");

  return (
    <NodeTip id={id} content={<AgentTip agent={agent} ownerName={owner.name} asks={asks} />}>
      <FlowNode
        handles={data.handles}
        className={cn("h-14 w-52 justify-center rounded-xl py-0 [--avatar-cutout:var(--card)]", cardEntranceClass(phase))}
        style={cardEntranceStyle(data.rank)}
      >
        <FlowNodeHeader>
          <FlowNodeMedia>
            {/* The node's accessible name already starts with the agent's. */}
            <AgentAvatar agent={agent} size="md" aria-hidden="true" />
          </FlowNodeMedia>
          <FlowNodeTitle className="font-sans font-medium">{agent.name}</FlowNodeTitle>
          <FlowNodeDescription className="col-[2/4]">{agent.role}</FlowNodeDescription>
          <FlowNodeAction className="row-span-1 size-4">
            <StateGlyph agent={agent} asks={asks.length} />
          </FlowNodeAction>
        </FlowNodeHeader>
      </FlowNode>
    </NodeTip>
  );
}
