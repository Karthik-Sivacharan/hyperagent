import type { ComponentType } from "react";

import { WorkspaceWallpaper } from "@/components/workspace/workspace-artwork";

import type { DemoAgentId } from "../demo-agents";
import { CopywritingScene } from "./scenes/copywriting";
import { DataScene } from "./scenes/data";
import { EngineeringScene } from "./scenes/engineering";
import { MarketingScene } from "./scenes/marketing";
import { SalesScene } from "./scenes/sales";
import { SupportScene } from "./scenes/support";
import { WALLPAPERS } from "./wallpapers";

// The demo agent's computer, as the hero shows it: the agent's wallpaper, one
// or two app windows that fit its job, and a dock. A still picture that fills
// whatever positioned box it is given (the agent panel's Computer tab).

const SCENES: Record<DemoAgentId, ComponentType> = {
  engineering: EngineeringScene,
  marketing: MarketingScene,
  copywriting: CopywritingScene,
  support: SupportScene,
  sales: SalesScene,
  data: DataScene,
};

export function DemoComputer({ agentId }: { agentId: DemoAgentId }) {
  const Scene = SCENES[agentId];
  return (
    <div
      aria-hidden="true"
      className="relative isolate size-full min-h-0 min-w-0 overflow-hidden select-none"
    >
      <WorkspaceWallpaper wallpaper={WALLPAPERS[agentId]} />
      <Scene />
    </div>
  );
}
