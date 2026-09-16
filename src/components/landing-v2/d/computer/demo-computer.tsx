import type { ComponentType } from "react";

import { WorkspaceWallpaper } from "@/components/workspace/workspace-artwork";
import { cn } from "@/lib/utils";

import type { DemoAgentId } from "../demo-agents";
import motion from "../hero-motion.module.css";
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
//
// Still, but not dead on arrival: the windows and the dock come in one after
// the other behind the chat (hero-motion.module.css), which counts them as
// the desktop's children after the wallpaper. The wallpaper itself crossfades
// rather than rising, with the outgoing one held under it, so the ground the
// windows land on never blinks.

const SCENES: Record<DemoAgentId, ComponentType> = {
  engineering: EngineeringScene,
  marketing: MarketingScene,
  copywriting: CopywritingScene,
  support: SupportScene,
  sales: SalesScene,
  data: DataScene,
};

export function DemoComputer({
  agentId,
  previousAgentId = null,
}: {
  agentId: DemoAgentId;
  /** The desk being left, painted under the arriving one for the crossfade. */
  previousAgentId?: DemoAgentId | null;
}) {
  const Scene = SCENES[agentId];
  const leaving =
    previousAgentId && previousAgentId !== agentId ? previousAgentId : null;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate size-full min-h-0 min-w-0 overflow-hidden select-none",
        motion.desktop,
      )}
    >
      {/* Both wallpapers in one box: the pair is the desktop's first child,
          so the windows keep their place in the order. */}
      <div className="absolute inset-0">
        {leaving && <WorkspaceWallpaper wallpaper={WALLPAPERS[leaving]} />}
        <WorkspaceWallpaper
          wallpaper={WALLPAPERS[agentId]}
          className={motion.wallpaper}
        />
      </div>
      <Scene />
    </div>
  );
}
