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
// the 3-column grid the Layout toggle switches to.

export type ThreadLayout = "list" | "grid";

// Hover-revealed action buttons; `transition-opacity` replaces the button
// base's `transition-all` through tailwind-merge, as on the site.
const ACTION =
  "size-7 rounded-[6px] border border-border bg-background/80 shadow-xs backdrop-blur-sm group-hover:opacity-100 focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity opacity-100 xl:opacity-0 xl:group-hover:opacity-100 xl:focus-visible:opacity-100 xl:group-has-[:focus-visible]:opacity-100 [@media(hover:none)]:opacity-100";

// The "Thread actions" menu is not in the dump (closed at capture); its items
// and item metrics were read from the live menu. Actions are no-ops except
// "Star thread", which toggles the local star state.
const MENU_ITEM = "cursor-pointer gap-2 rounded-sm px-2 py-1.5";

export function ThreadCard({ thread, layout = "list" }: { thread: Thread; layout?: ThreadLayout }) {
  const [starred, setStarred] = useState(thread.starred);
  const grid = layout === "grid";

  return (
    <div className="transition-colors duration-150 [&:hover:not(:has([data-nested-threads]:hover))]:bg-muted/40">
      <div>
        <div className="relative overflow-hidden">
          {/* Swipe-to-archive backdrop (touch only on the site). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-end gap-2 bg-green-600 pr-6 font-medium text-sm text-white opacity-0"
          >
            <Archive className="size-5" aria-hidden="true" />
            Archive
          </div>
          <div className="relative touch-pan-y">
            <Link
              className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              data-state="closed"
              data-slot="context-menu-trigger"
              href={`/thread/${thread.id}`}
            >
              <div
                className={cn(
                  "group relative flex transition-colors duration-150 items-center gap-8 px-6 py-6 max-sm:gap-4 max-sm:px-6 max-sm:py-3 max-xl:pr-20",
                  grid && "h-full items-start gap-4 px-5 py-5 pr-20",
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 max-sm:gap-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3
                      className={cn(
                        "line-clamp-1 min-w-0 flex-1 font-medium text-foreground text-xl leading-[24px] max-sm:line-clamp-2 max-sm:text-base max-sm:leading-5",
                        grid && "line-clamp-2 text-base leading-5",
                      )}
                    >
                      {thread.title}
                    </h3>
                  </div>
                  <p className="line-clamp-2 min-w-0 text-muted-foreground text-sm leading-relaxed">
                    {thread.summary}
                  </p>
                  <div className="flex min-w-0 items-center text-muted-foreground gap-2 text-sm">
                    <span className="shrink-0 sm:hidden">{thread.updatedShortLabel}</span>
                    <span className="hidden shrink-0 sm:inline">{thread.updatedLabel}</span>
                  </div>
                </div>
                <div />
                <div className="absolute right-3 flex items-center gap-1 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ACTION}
                        aria-label="Thread actions"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-auto" onClick={(e) => e.preventDefault()}>
                      <DropdownMenuItem className={MENU_ITEM}>
                        <Pencil className="size-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className={MENU_ITEM}>
                        <RefreshCw className="size-4" />
                        Regenerate name
                      </DropdownMenuItem>
                      <DropdownMenuItem className={MENU_ITEM} onSelect={() => setStarred((s) => !s)}>
                        <Star className="size-4" />
                        {starred ? "Unstar thread" : "Star thread"}
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 rounded-sm px-2 py-1.5">
                          <ArrowRightLeft className="size-4" />
                          Move to project
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem className={MENU_ITEM} disabled>
                            No projects
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem className={MENU_ITEM}>
                        <BookX className="size-4" />
                        Exclude from knowledge
                      </DropdownMenuItem>
                      <DropdownMenuItem className={MENU_ITEM}>
                        <Archive className="size-4" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
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
