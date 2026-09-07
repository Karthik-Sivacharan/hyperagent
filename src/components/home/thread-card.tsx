"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, ArrowRightLeft, BookX, Ellipsis, Pencil, RefreshCw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Thread } from "@/lib/mock/threads";

// One row of the home screen's "Recent threads" list
// (docs/reference/pages/threads-new.html). The dump only renders the list
// layout; `layout="grid"` reuses the same markup with tighter spacing for
// the 3-column grid the Layout toggle switches to. Phase 2: each row is a
// brand card (22px, the resting card shadow, the 300ms hover lift) with the
// title in the serif face on tier 1, the summary on tier 2 and the time on
// tier 3; the hover-revealed actions are outline icon pills
// (docs/brand/design.md §4.1, §5, §6, §8).

export type ThreadLayout = "list" | "grid";

// Hover-revealed action buttons: the outline icon pill over a blurred
// canvas wash, with opacity added to the button's transition list.
const ACTION =
  "size-7 bg-background/80 backdrop-blur-sm transition-[color,background-color,box-shadow,transform,opacity] opacity-100 group-hover:opacity-100 focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100 xl:opacity-0 xl:group-hover:opacity-100 xl:focus-visible:opacity-100 xl:group-has-[:focus-visible]:opacity-100 [@media(hover:none)]:opacity-100";

// The "Thread actions" menu is not in the dump (closed at capture); its items
// were read from the live menu and the brand menu item already carries their
// metrics. Actions are no-ops except "Star thread", which toggles the local
// star state.

export function ThreadCard({ thread, layout = "list" }: { thread: Thread; layout?: ThreadLayout }) {
  const [starred, setStarred] = useState(thread.starred);
  const grid = layout === "grid";

  return (
    <div className="rounded-3xl bg-card text-card-foreground shadow-card transition-[box-shadow] duration-(--duration-slow) ease-out hover:shadow-card-hover">
      <div>
        <div className="relative overflow-hidden rounded-3xl">
          {/* Swipe-to-archive backdrop (touch only on the site). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-end gap-2 bg-success pr-6 font-medium text-sm text-success-foreground opacity-0"
          >
            <Archive className="size-5" aria-hidden="true" />
            Archive
          </div>
          <div className="relative touch-pan-y">
            <Link
              className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
              data-state="closed"
              data-slot="context-menu-trigger"
              href={`/thread/${thread.id}`}
            >
              <div
                className={cn(
                  "group relative flex items-center gap-8 px-6 py-6 max-sm:gap-4 max-sm:px-6 max-sm:py-3 max-xl:pr-20",
                  grid && "h-full items-start gap-4 px-5 py-5 pr-20",
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 max-sm:gap-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3
                      className={cn(
                        "line-clamp-1 min-w-0 flex-1 font-heading text-xl leading-[24px] text-foreground max-sm:line-clamp-2 max-sm:text-base max-sm:leading-5",
                        grid && "line-clamp-2 text-base leading-5",
                      )}
                    >
                      {thread.title}
                    </h3>
                  </div>
                  <p className="line-clamp-2 min-w-0 text-muted-foreground text-sm leading-relaxed">
                    {thread.summary}
                  </p>
                  <div className="flex min-w-0 items-center gap-2 text-sm text-foreground-low">
                    <span className="shrink-0 sm:hidden">{thread.updatedShortLabel}</span>
                    <span className="hidden shrink-0 sm:inline">{thread.updatedLabel}</span>
                  </div>
                </div>
                <div />
                <div className="absolute right-3 flex items-center gap-1 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        className={ACTION}
                        aria-label="Thread actions"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-auto" onClick={(e) => e.preventDefault()}>
                      <DropdownMenuItem>
                        <Pencil className="size-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="size-4" />
                        Regenerate name
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setStarred((s) => !s)}>
                        <Star className="size-4" />
                        {starred ? "Unstar thread" : "Star thread"}
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ArrowRightLeft className="size-4" />
                          Move to project
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem disabled>No projects</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem>
                        <BookX className="size-4" />
                        Exclude from knowledge
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="size-4" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className={ACTION}
                    aria-label={starred ? "Unstar thread" : "Star thread"}
                    aria-pressed={starred}
                    onClick={(e) => {
                      e.preventDefault();
                      setStarred((s) => !s);
                    }}
                  >
                    <Star className={cn("size-4", starred && "fill-current")} />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
