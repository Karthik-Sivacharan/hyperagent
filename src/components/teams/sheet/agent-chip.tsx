"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FleetAgent } from "@/lib/mock/teams";
import { AGENT_STATE_META, AgentAvatar } from "@/components/teams/fleet/agent-avatar";

// An agent as a pressable chip: its monogram with the state dot, then its
// name. The sheet uses it for "Reports to" and for the sub-agents, and
// pressing one moves the sheet to that agent without closing it.
//
// A SOFT SQUARE, NOT A PILL. Agents are rounded squares everywhere in the
// fleet (agent-avatar.tsx), so the chip that carries one takes the same
// shape: 10px outside, 4px of padding, the 20px monogram's 6px inside, which
// keeps the two corners concentric. A pill around a square monogram leaves a
// wedge of fill in each corner.
//
// The visible text is the name alone; the accessible name adds the role and
// the state ("Iris, Research lead, working"), and the role shows on hover.

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
          variant="tint"
          size="none"
          onClick={() => onSelect(agent.id)}
          aria-label={`${agent.name}, ${agent.role}, ${AGENT_STATE_META[agent.state].label.toLowerCase()}`}
          className={cn(
            "h-7 gap-1.5 rounded-lg py-1 pr-2.5 pl-1 text-foreground hover:text-foreground",
            className,
          )}
        >
          <AgentAvatar agent={agent} size="xs" showState aria-hidden="true" />
          <span className="truncate">{agent.name}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{agent.role}</TooltipContent>
    </Tooltip>
  );
}
