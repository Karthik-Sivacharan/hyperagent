import type { GlyphTone } from "@/components/brand/agent-glyph";

import type { DemoAgentId } from "./demo-agents";

// The glyph each demo agent wears, one shape from the original set per
// agent, the same in the window's sidebar and in the phone's chip row. The
// shapes are abstract (a glyph is an agent's mark, not a job pictogram), so
// the pairing only has to keep every agent different from its neighbours.
export const AGENT_SHAPES: Record<DemoAgentId, string> = {
  engineering: "fork",
  marketing: "bell",
  copywriting: "sweep",
  support: "portal",
  sales: "hammerhead",
  data: "slot-stack",
};

// The agent whose work is waiting on a person: its replies are held for
// approval, so its glyph wears the tangerine tile, the view's one accent.
export const ATTENTION_AGENT: DemoAgentId = "support";

export function agentTone(id: DemoAgentId): GlyphTone {
  return id === ATTENTION_AGENT ? "tangerine" : "sand";
}
