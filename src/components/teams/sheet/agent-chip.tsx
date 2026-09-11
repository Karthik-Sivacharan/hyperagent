"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AgentState, FleetAgent } from "@/lib/mock/teams";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";

// An agent as something to press: its 20px face and its name. The sheet's
// details use it for "Reports to" and the sub-agents, and pressing one moves
// the sheet to that agent without closing it.
//
// A ghost, not a chip. Nothing in the sheet is filled at rest (plan §3), so
// the pill fill only shows on hover and focus, and at rest the face and name
// read as a value in the details column like the owner's beside it. The name
// keeps the body weight of the other values for the same reason. Callers
// pull it 4px left (`-ml-1`) so the face lines up with the owner's face.
//
// The visible text is the name alone; the accessible name adds the role and
// the state ("Iris, Research lead, working"), and the role shows on hover.

const SPOKEN_STATE: Record<AgentState, string> = {
  working: "working",
  idle: "idle",
  paused: "paused",
  error: "in error",
};

export function AgentChip({
  agent,
  onSelect,
  className,
}: {
  agent: FleetAgent;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="none"
          onClick={() => onSelect(agent.id)}
          aria-label={`${agent.name}, ${agent.role}, ${SPOKEN_STATE[agent.state]}`}
          className={cn("h-7 max-w-full gap-1.5 pr-2.5 pl-1 font-normal", className)}
        >
          <AgentAvatar agent={agent} size="xs" aria-hidden="true" />
          <span className="truncate">{agent.name}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{agent.role}</TooltipContent>
    </Tooltip>
  );
}
