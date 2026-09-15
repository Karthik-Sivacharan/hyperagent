import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { cn } from "@/lib/utils";

import { AGENT_HUES, AGENT_ICONS, ATTENTION_AGENT } from "./agent-icons";
import type { DemoAgent } from "./demo-agents";

// A demo agent's avatar: the fleet avatar (the product's own agent mark, a
// tinted orb field with a pictogram) drawn round, in the agent's hue, with
// its sidebar icon. The agent waiting on a person carries the attention dot,
// cut out of whatever ground the row sits on (`--avatar-cutout`). Always
// decorative: the button around it carries the name.
export function DemoAgentAvatar({
  agent,
  size = "md",
  className,
}: {
  agent: Pick<DemoAgent, "id" | "label">;
  size?: "xs" | "md";
  className?: string;
}) {
  const attention = agent.id === ATTENTION_AGENT;
  return (
    <AgentAvatar
      aria-hidden="true"
      agent={{
        id: `demo-${agent.id}`,
        name: agent.label,
        role: agent.label,
        hue: AGENT_HUES[agent.id],
        state: attention ? "error" : "idle",
      }}
      icon={AGENT_ICONS[agent.id]}
      size={size}
      showState={attention && size !== "xs"}
      className={cn("rounded-full", className)}
    />
  );
}
