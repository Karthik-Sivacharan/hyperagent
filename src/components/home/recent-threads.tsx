"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock/threads";
import { ThreadCard, type ThreadLayout } from "@/components/home/thread-card";

// "Recent threads" on the home screen (docs/reference/pages/threads-new.html):
// heading, List/Grid layout toggle (a role="group" of tooltip-wrapped ghost
// buttons, not a radix ToggleGroup), "Show all" link, and the thread list.
// The dump was captured with the list layout selected; the grid layout is
// this clone's own 3-column arrangement of the same card.

function LayoutButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-pressed={active}
          aria-label={label}
          onClick={onClick}
          className={cn(
            "size-7 rounded-[5px]",
            active
              ? "bg-accent text-foreground hover:bg-accent dark:bg-background dark:hover:bg-background"
              : "text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function RecentThreads({ threads }: { threads: Thread[] }) {
  const [layout, setLayout] = useState<ThreadLayout>("list");

  return (
    <section className="w-full">
      <div className="mb-4 flex justify-between gap-2 items-center">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-semibold text-lg">Recent threads</h2>
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div
                role="group"
                aria-label="Layout"
                className="inline-flex h-9 shrink-0 items-center gap-0.5 rounded-[8px] border bg-white p-[3px] shadow-xs max-sm:hidden dark:border-input dark:bg-muted"
              >
                <LayoutButton icon={List} label="List view" active={layout === "list"} onClick={() => setLayout("list")} />
                <LayoutButton icon={LayoutGrid} label="Grid view" active={layout === "grid"} onClick={() => setLayout("grid")} />
              </div>
            </TooltipProvider>
            <Link
              className="rounded-[8px] border border-border bg-background px-3 py-1.5 text-foreground text-sm shadow-xs transition-colors hover:bg-muted"
              href="/threads"
            >
              Show all
            </Link>
          </div>
        </div>
      </div>

      {layout === "list" ? (
        <div className="overflow-hidden rounded-lg border border-border bg-background max-sm:-mx-6 max-sm:rounded-none max-sm:border-x-0 max-sm:bg-transparent">
          <div>
            {threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {threads.map((thread) => (
            <div key={thread.id} className="overflow-hidden rounded-lg border border-border bg-background">
              <ThreadCard thread={thread} layout="grid" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
