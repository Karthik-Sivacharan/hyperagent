import type { DemoAgentId } from "./demo-agents";

// The glyph each demo agent wears, one shape from the original set per
// agent, the same in the window's sidebar and in the phone's chip row. The
// shapes are abstract (a glyph is an agent's mark, not a job pictogram), so
// the pairing only has to keep every agent different from its neighbours.
// Every agent wears the same sand tone; the page keeps its one tangerine for
// its own call to action.
export const AGENT_SHAPES: Record<DemoAgentId, string> = {
  engineering: "fork",
  marketing: "bell",
  copywriting: "sweep",
  support: "portal",
  sales: "hammerhead",
  data: "slot-stack",
};
