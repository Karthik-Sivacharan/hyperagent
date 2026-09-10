import {
  IconArrowsDiagonal,
  IconChevronDown,
  IconCopy,
  IconEyeOff,
  IconFileText,
  IconFolderOpen,
  IconPhoto,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentView } from "@/components/workspace/document-view";
import type { WorkspaceArtifact } from "@/lib/mock/workspace";

// One artifact on the carousel: a label pill over the content, both floating on
// the wallpaper. Site: the `[data-card-id]` blocks of the capture.
//
// Keep the layout, change the skin: the 600px document card, the 32px label
// row, the 240px floor and the hover actions are the site's; the 14px corners
// become the brand's 22px card corner, the label a pill, and the selection ring
// the brand accent (rings and selection are what `brand-accent` is for) under
// the brand's tile shadow. A card out of focus sits at 92% until hovered, as on
// the site. The label keeps its black-glass-and-white look: it is always over
// the wallpaper, and white / black alpha over imagery is the brand's rule too.

const ACTIONS: Record<WorkspaceArtifact["kind"], { label: string; icon: TablerIcon }[]> = {
  document: [
    { label: "Hide", icon: IconEyeOff },
    { label: "Copy as markdown", icon: IconCopy },
    { label: "Spotlight", icon: IconArrowsDiagonal },
  ],
  image: [
    { label: "Hide", icon: IconEyeOff },
    { label: "Spotlight", icon: IconArrowsDiagonal },
  ],
};

function CardLabel({ artifact }: { artifact: WorkspaceArtifact }) {
  const Icon = artifact.kind === "document" ? IconFileText : IconPhoto;
  return (
    <div className="flex max-w-full items-center overflow-hidden rounded-full border border-white/20 bg-black/30">
      <Button
        variant="ghost"
        size="none"
        className="min-w-0 max-w-full gap-1.5 px-2 py-[3px] text-sm text-white hover:bg-white/5"
      >
        <Icon className="size-3 opacity-60" aria-hidden="true" />
        <span className="min-w-0 truncate">{artifact.title}</span>
        <IconChevronDown className="size-3 opacity-70" aria-hidden="true" />
      </Button>
      {artifact.kind === "document" && artifact.scope === "project" ? (
        <span className="mr-1 flex shrink-0 items-center gap-0.5 rounded-full bg-white/15 px-1.5 py-px font-medium text-[10px] text-white/90">
          <IconFolderOpen className="size-2.5" aria-hidden="true" />
          Project-wide
        </span>
      ) : null}
    </div>
  );
}

// Revealed by hovering the content or by tabbing into it, so a keyboard user is
// never on a control they cannot see. The floating pill is the thread view's
// scroll-to-bottom pill, not a new glass. Every card carries the same three
// names, so the group says whose they are.
function CardActions({ artifact }: { artifact: WorkspaceArtifact }) {
  return (
    <div
      role="group"
      aria-label={`${artifact.title} actions`}
      className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-(--duration-fast) ease-out group-focus-within/content:opacity-100 group-hover/content:opacity-100"
    >
      {ACTIONS[artifact.kind].map(({ label, icon: Icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={label}
              className="bg-surface-elevated/90 text-muted-foreground shadow-md ring-1 ring-border-subtle backdrop-blur-sm hover:bg-surface-elevated hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function ArtifactCard({ artifact, active }: { artifact: WorkspaceArtifact; active: boolean }) {
  const focus = active ? "shadow-lg ring-2 ring-brand-accent/70" : "";
  const rest = active ? "" : "opacity-92 transition-opacity duration-(--duration-normal) ease-out hover:opacity-100";

  if (artifact.kind === "document") {
    return (
      // 600px, or the carousel's content box when that is narrower: exactly 600
      // in a 684px desktop, and the whole card stays on screen in a narrower
      // one (the agent panel squeezed by an open sidebar) instead of losing
      // its right edge. The percentage resolves against the scroller's
      // content box because the card is its flex item.
      <div data-artifact-id={artifact.id} className="h-full w-[min(--spacing(150),100%)] shrink-0 snap-center">
        <div className={cn("relative flex h-full min-w-0 flex-col gap-1", rest)}>
          <div className="flex min-w-0 max-w-full shrink-0 items-center gap-1 pt-1">
            <CardLabel artifact={artifact} />
          </div>
          <div className={cn("group/content relative min-h-60 flex-1 overflow-hidden rounded-3xl", focus)}>
            <div className="size-full overflow-hidden rounded-[inherit] bg-card">
              <DocumentView document={artifact.document} />
            </div>
            <CardActions artifact={artifact} />
          </div>
        </div>
      </div>
    );
  }

  // An image sizes to itself, up to the card's 600px and 70% of the viewport,
  // and the label row is contained so a long title never widens the card.
  return (
    <div data-artifact-id={artifact.id} className="max-w-150 shrink-0 snap-center">
      <div className={cn("relative flex min-w-0 flex-col items-start justify-center gap-1", rest)}>
        <div className="flex w-fit max-w-full flex-col gap-1">
          <div className="flex max-w-full shrink-0 items-center gap-1 pt-1 [contain:inline-size]">
            <CardLabel artifact={artifact} />
          </div>
          <div className={cn("group/content relative max-h-[70vh] min-w-0 max-w-full overflow-hidden rounded-3xl leading-0", focus)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artifact.src}
              alt={artifact.title}
              width={artifact.width}
              height={artifact.height}
              className="block h-auto max-h-[70vh] w-auto max-w-full bg-muted/30 object-contain"
            />
            <CardActions artifact={artifact} />
          </div>
        </div>
      </div>
    </div>
  );
}
