"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AGENT_ICONS } from "./agent-icons";
import { A11Y } from "./content";
import type { DemoAgent, DemoAgentId } from "./demo-agents";

// The agent switch where the window's sidebar is too small to touch: one row
// of chips above the window that scrolls sideways under the thumb. The pressed
// chip turns ink, the brand's pressed chip. Each is 44px tall, a thumb.
export function AgentChips({
  agents,
  selectedId,
  onSelect,
  className,
}: {
  agents: readonly DemoAgent[];
  selectedId: DemoAgentId;
  onSelect: (id: DemoAgentId) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={A11Y.agents}
      className={cn(
        "scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:-mx-6 sm:px-6",
        className,
      )}
    >
      {agents.map((agent) => {
        const Icon = AGENT_ICONS[agent.id];
        const selected = agent.id === selectedId;
        return (
          <Button
            key={agent.id}
            type="button"
            variant="chip"
            aria-pressed={selected}
            onClick={() => onSelect(agent.id)}
            className="h-11 shrink-0 gap-1.5 px-4"
          >
            <Icon className="size-4" aria-hidden="true" />
            {agent.label}
          </Button>
        );
      })}
    </div>
  );
}
