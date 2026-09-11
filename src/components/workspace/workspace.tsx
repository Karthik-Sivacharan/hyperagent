import { IconCompass } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArtifactCard } from "@/components/workspace/artifact-card";
import { ArtifactDock } from "@/components/workspace/artifact-dock";
import { WorkspaceToolbar } from "@/components/workspace/workspace-toolbar";
import { WorkspaceWallpaper } from "@/components/workspace/workspace-artwork";
import { GLASS, ON_GLASS_QUIET } from "@/components/workspace/glass";
import { DESKTOP_WALLPAPER, type Wallpaper, type WorkspaceArtifact } from "@/lib/mock/workspace";

// The artifact workspace: the desktop hyperagent.com opens beside a thread
// once it has produced something. Wallpaper, a glass toolbar, the artifacts on
// a carousel, a dock, and the Browser pill in the corner. Ground truth:
// docs/reference/overlays/thread-workspace-carousel.html, measured at 1456×868
// where the desktop is 684×850 beside a 512px thread column.
//
// Self-contained: it fills whatever positioned box it is given, so it can sit
// beside ThreadView (its `workspace` prop) or anywhere else, such as the signup
// handoff. On the site the carousel layer spans the whole frame and scrolls
// its cards under the thread column; here it starts at the desktop's own edge,
// which is the same picture at rest and needs nothing from the host.
//
// Static by design: the Carousel layout at rest. Dragging, snapping between
// cards, reordering the dock, the Tile and Windows layouts and every menu are
// not built. The carousel still scrolls natively and snaps, because that is
// CSS alone.

function BrowserPill() {
  return (
    <div className="absolute top-2 right-2 z-20 flex items-start gap-1.5">
      <div className={cn("flex items-center gap-1 rounded-full p-1", GLASS)}>
        <Button
          variant="ghost"
          size="none"
          aria-pressed={false}
          className={cn("h-6 gap-1.5 px-2.5 text-xs hover:text-foreground", ON_GLASS_QUIET)}
        >
          <IconCompass className="size-3.5" aria-hidden="true" />
          Browser
          {/* The agent's browser is idle: a quiet status dot, as the brand spells status. */}
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-pending" />
        </Button>
      </div>
    </div>
  );
}

export function Workspace({
  artifacts,
  activeId,
  wallpaper = DESKTOP_WALLPAPER,
  className,
}: {
  artifacts: WorkspaceArtifact[];
  activeId: string;
  wallpaper?: Wallpaper;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate flex size-full min-h-0 min-w-0 flex-col overflow-hidden", className)}>
      <WorkspaceWallpaper wallpaper={wallpaper} />
      <BrowserPill />
      <WorkspaceToolbar count={artifacts.length} />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* The first card sits 48px in from the desktop's edge and snaps 12px in; the 100px under
            the cards is the dock's lane. */}
        <div className="scrollbar-hide flex min-h-0 flex-1 snap-x snap-mandatory scroll-pl-3 items-center gap-10 overflow-x-auto overflow-y-hidden pt-8 pr-9 pb-25 pl-12">
          {artifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} active={artifact.id === activeId} />
          ))}
          <div aria-hidden="true" className="size-px flex-none" />
        </div>
        <ArtifactDock artifacts={artifacts} activeId={activeId} />
      </div>
    </div>
  );
}
