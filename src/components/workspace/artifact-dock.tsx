import { IconChevronLeft, IconChevronRight, IconFolderOpen, IconSlideshow } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentTileFace } from "@/components/workspace/workspace-artwork";
import { GLASS, ON_GLASS_QUIET } from "@/components/workspace/glass";
import type { WorkspaceArtifact } from "@/lib/mock/workspace";

// The dock along the bottom of the desktop: one 52px tile per artifact, a dot
// under the one in focus, and "See all assets" at the end. Site: the
// `role=toolbar aria-label=Artifacts` block of the capture.
//
// Brand skin on the site's measure: the tiles take the brand's soft 14px
// corner (the `IconTile` soft shape) and the dock the corner concentric with
// it (14 + the 8px from the tile to the dock's edge = 22, `rounded-3xl`), both
// under the brand's raised-control shadow. The focus ring stays white, as on
// the site: it sits on the tile's own picture, where the accent would fight it.
//
// The two scroll buttons are the site's too: disabled and zero-wide until the
// dock overflows, they hold its spacing. Scrolling, reordering and the dot's
// travel are not built.

function ProjectBadge() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-0.5 right-0.5 flex items-center rounded-full bg-background p-0.5 text-foreground shadow-xs ring-1 ring-black/10"
    >
      <IconFolderOpen className="size-2.5" />
    </span>
  );
}

function DockTile({ artifact, active }: { artifact: WorkspaceArtifact; active: boolean }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-0 min-[900px]:gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            aria-pressed={active}
            aria-label={artifact.tileLabel}
            className={cn(
              "relative size-13 overflow-hidden rounded-xl shadow-md hover:bg-transparent",
              active ? "ring-2 ring-white/70" : "ring-1 ring-white/20",
            )}
          >
            {artifact.kind === "document" ? (
              <DocumentTileFace />
            ) : (
              <span className="pointer-events-none size-full bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artifact.src} alt="" className="size-full object-cover object-top" />
              </span>
            )}
            {artifact.kind === "document" && artifact.scope === "project" ? <ProjectBadge /> : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{artifact.title}</TooltipContent>
      </Tooltip>
      <span
        aria-hidden="true"
        className={cn("hidden size-1 rounded-full bg-foreground min-[900px]:block", active ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}

function ScrollButton({ side }: { side: "left" | "right" }) {
  const Icon = side === "left" ? IconChevronLeft : IconChevronRight;
  return (
    <Button
      variant="ghost"
      size="none"
      disabled
      aria-label={`Scroll dock ${side}`}
      className="h-12 w-0 overflow-hidden text-foreground/25"
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  );
}

export function ArtifactDock({ artifacts, activeId }: { artifacts: WorkspaceArtifact[]; activeId: string }) {
  return (
    <div className="pointer-events-none absolute right-0 bottom-4 left-3 z-20 flex justify-center px-4">
      <div
        role="toolbar"
        aria-label="Artifacts"
        aria-orientation="horizontal"
        className={cn("pointer-events-auto flex min-w-0 max-w-full items-center gap-1 rounded-3xl p-1.5 shadow-md", GLASS)}
      >
        <ScrollButton side="left" />
        <div className="scrollbar-hide -m-0.5 flex min-w-0 items-center gap-1.5 overflow-x-auto p-1">
          {artifacts.map((artifact) => (
            <DockTile key={artifact.id} artifact={artifact} active={artifact.id === activeId} />
          ))}
        </div>
        <ScrollButton side="right" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="none"
              aria-label="See all assets"
              className={cn("h-12 w-6 hover:text-foreground min-[900px]:-translate-y-1", ON_GLASS_QUIET)}
            >
              <IconSlideshow className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>See all assets</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
