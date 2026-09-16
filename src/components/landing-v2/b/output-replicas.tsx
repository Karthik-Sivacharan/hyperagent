import type { JSX, ReactNode } from "react";
import { IconPlayerPlayFilled, IconWorld } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Format } from "./content";

// Five pictures of a finished piece of work, one per format, drawn from
// tint bars and our primitives rather than screenshots: a page, a video
// player, a deck, a document, a dashboard. Each is cropped by its square so
// one edge bleeds, the way the reference frames its outputs. They carry no
// words a visitor needs (the request card under them does), so the whole
// picture is hidden from the accessibility tree.

function Bar({ className }: { className?: string }) {
  return <div className={cn("h-2 rounded-full bg-tint-15", className)} />;
}

function Page({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute top-[11%] left-[10%] w-[104%] rounded-2xl bg-background p-4 shadow-card-soft sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function WebsiteReplica() {
  return (
    <Page>
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-full bg-foreground" />
        <Bar className="w-10" />
        <Bar className="w-8" />
        <Bar className="w-12" />
        <div className="ml-auto h-4 w-14 rounded-full bg-foreground" />
      </div>
      <div className="mt-7 flex flex-col gap-2.5">
        <div className="h-4 w-4/5 rounded-full bg-tint-25" />
        <div className="h-4 w-3/5 rounded-full bg-tint-25" />
        <Bar className="mt-1 w-2/3" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="col-span-2 flex h-24 items-center justify-center rounded-xl bg-tint-10">
          <IconWorld className="size-6 text-foreground-low" />
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Bar className="w-full" />
          <Bar className="w-5/6" />
          <Bar className="w-2/3" />
        </div>
      </div>
    </Page>
  );
}

function VideoReplica() {
  return (
    <Page className="p-3 sm:p-3">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-foreground">
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        <div className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20">
          <IconPlayerPlayFilled className="ml-0.5 size-5 text-background" />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-3">
          <div className="h-1 flex-1 rounded-full bg-white/25">
            <div className="h-1 w-3/5 rounded-full bg-background" />
          </div>
          <span className="text-label-12-mono text-background/80">
            0:05 / 0:08
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <div className="h-3 w-1/2 rounded-full bg-tint-25" />
        <Bar className="w-3/4" />
      </div>
    </Page>
  );
}

function SlidesReplica() {
  return (
    <Page>
      <div className="aspect-video rounded-xl bg-surface-secondary p-4 shadow-edge">
        <div className="h-4 w-2/3 rounded-full bg-tint-25" />
        <div className="mt-4 flex h-16 items-end gap-2">
          <div className="h-1/2 flex-1 rounded-sm bg-tint-20" />
          <div className="h-full flex-1 rounded-sm bg-foreground" />
          <div className="h-2/3 flex-1 rounded-sm bg-tint-20" />
          <div className="h-3/4 flex-1 rounded-sm bg-tint-20" />
          <div className="h-2/5 flex-1 rounded-sm bg-tint-20" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="aspect-video rounded-md bg-surface-secondary shadow-edge" />
        <div className="aspect-video rounded-md bg-surface-secondary shadow-edge" />
        <div className="aspect-video rounded-md bg-surface-secondary shadow-edge" />
      </div>
    </Page>
  );
}

function DocumentReplica() {
  return (
    <Page>
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-1/2 rounded-full bg-tint-25" />
        <Badge variant="success">Current</Badge>
      </div>
      <div className="mt-5 flex flex-col gap-2.5">
        <Bar className="w-full" />
        <Bar className="w-11/12" />
        <Bar className="w-4/5" />
      </div>
      <div className="mt-5 h-3 w-1/3 rounded-full bg-tint-25" />
      <div className="mt-3 flex flex-col gap-2.5">
        <Bar className="w-full" />
        <Bar className="w-5/6" />
        <Bar className="w-2/3" />
      </div>
    </Page>
  );
}

function DashboardReplica() {
  return (
    <Page>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((tile) => (
          <div
            key={tile}
            className="rounded-xl bg-surface-secondary p-2.5 shadow-edge"
          >
            <Bar className="w-2/3" />
            <div className="mt-2 h-4 w-1/2 rounded-full bg-tint-25" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {[
          "h-2/5",
          "h-3/5",
          "h-1/2",
          "h-4/5",
          "h-3/5",
          "h-full",
          "h-3/4",
          "h-1/2",
        ].map((height, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-sm",
              height,
              index === 5 ? "bg-foreground" : "bg-tint-20",
            )}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <Bar className="w-1/3" />
          <Bar className="ml-auto w-10" />
        </div>
        <div className="flex items-center gap-3">
          <Bar className="w-1/4" />
          <Bar className="ml-auto w-8" />
        </div>
      </div>
    </Page>
  );
}

const REPLICAS: Record<Format, () => JSX.Element> = {
  website: WebsiteReplica,
  video: VideoReplica,
  slides: SlidesReplica,
  document: DocumentReplica,
  dashboard: DashboardReplica,
};

export function OutputReplica({ format }: { format: Format }) {
  const Replica = REPLICAS[format];
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Replica />
    </div>
  );
}
