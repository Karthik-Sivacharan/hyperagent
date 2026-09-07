"use client";

import { useState } from "react";
import Link from "next/link";
import { IconLayoutGrid, IconList, type TablerIcon } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock/threads";
import { ThreadCard, type ThreadLayout } from "@/components/home/thread-card";

// "Recent threads" on the home screen (docs/reference/pages/threads-new.html):
// heading, List/Grid layout toggle, "Show all" link, and the thread list. The
// dump was captured with the list layout selected; the grid layout is this
// clone's own 3-column arrangement of the same card. Phase 2: the heading
// takes the brand's section-heading step in the serif face, the toggle is
// the joined pill track (a radix ToggleGroup now, so the track owns the
// selection), "Show all" is an outline pill, and every thread is its own
// 22px card, so the list is the brand's stack of list rows rather than one
// bordered box (docs/brand/design.md §4, §5, §6). The header row keeps its
// 36px height.

// The tooltip wraps the toggle from the inside: as the outer element the
// toggle's `data-state="on"` (what the pill track styles on) is the one that
// survives the prop spread, instead of the tooltip's open/closed state.
function LayoutToggle({ value, icon: Icon, label }: { value: ThreadLayout; icon: TablerIcon; label: string }) {
  return (
    <Tooltip>
      <ToggleGroupItem value={value} asChild>
        <TooltipTrigger aria-label={label}>
          <Icon className="size-4" aria-hidden="true" />
        </TooltipTrigger>
      </ToggleGroupItem>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function RecentThreads({ threads }: { threads: Thread[] }) {
  const [layout, setLayout] = useState<ThreadLayout>("list");

  return (
    <section className="w-full">
      <div className="mb-4 flex min-h-9 items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-heading text-xl text-foreground">Recent threads</h2>
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <ToggleGroup
                type="single"
                value={layout}
                onValueChange={(next) => {
                  if (next) setLayout(next as ThreadLayout);
                }}
                spacing={0}
                aria-label="Layout"
                className="shrink-0 max-sm:hidden"
              >
                <LayoutToggle value="list" icon={IconList} label="List view" />
                <LayoutToggle value="grid" icon={IconLayoutGrid} label="Grid view" />
              </ToggleGroup>
            </TooltipProvider>
            <Button variant="outline" size="sm" asChild>
              <Link href="/threads">Show all</Link>
            </Button>
          </div>
        </div>
      </div>

      {layout === "list" ? (
        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} layout="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
