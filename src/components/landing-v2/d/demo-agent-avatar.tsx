import { AgentGlyph } from "@/components/brand/agent-glyph";
import { cn } from "@/lib/utils";

import { AGENT_SHAPES, agentTone } from "./agent-icons";
import type { DemoAgent } from "./demo-agents";

const SIZE_PX = { xs: 20, md: 32 } as const;

// A demo agent's avatar: its glyph, the brand's agent mark (a silhouette
// with eyes, so every agent in the list has a face of its own), at rest. The
// agent waiting on a person wears the tangerine tile. Always decorative:
// the button around it carries the name, so the glyph takes no label.
export function DemoAgentAvatar({
  agent,
  size = "md",
  className,
}: {
  agent: Pick<DemoAgent, "id">;
  size?: keyof typeof SIZE_PX;
  className?: string;
}) {
  return (
    <AgentGlyph
      shape={AGENT_SHAPES[agent.id]}
      tone={agentTone(agent.id)}
      size={SIZE_PX[size]}
      className={cn("shrink-0", className)}
    />
  );
}
