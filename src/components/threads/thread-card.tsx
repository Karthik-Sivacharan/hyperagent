"use client";

import Link from "next/link";
import { Archive, ChevronRight, Ellipsis, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Thread } from "@/lib/mock/threads";

// One row of the threads list (docs/reference/pages/threads.html). The whole
// row is a link; the actions in its top-right corner fade in on hover at xl
// and stay visible below it. The green "Archive" sheet underneath is the
// swipe-to-archive reveal on touch devices (opacity-0 on desktop).

const ACTION =
  "size-7 rounded-[6px] border border-border bg-background/80 shadow-xs backdrop-blur-sm group-hover:opacity-100 focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity opacity-100 xl:opacity-0 xl:group-hover:opacity-100 xl:focus-visible:opacity-100 xl:group-has-[:focus-visible]:opacity-100 [@media(hover:none)]:opacity-100";

// The site shows "1d" where the wide label says "yesterday".
function compactLabel(label: string) {
  if (label === "yesterday") return "1d";
  if (label === "today") return "now";
  const m = /^(\d+) (minute|hour|day|week|month|year)s? ago$/.exec(label);
  if (m) return `${m[1]}${m[2][0]}`;
  return label;
}

export function ThreadCard({
  thread,
  starred,
  onToggleStar,
}: {
  thread: Thread;
  starred: boolean;
  onToggleStar: () => void;
}) {
  return (
    <div className="transition-colors duration-150 [&:hover:not(:has([data-nested-threads]:hover))]:bg-muted/40">
      <div>
        <div className="relative overflow-hidden">
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
              data-slot="context-menu-trigger"
              href={`/thread/${thread.id}`}
            >
              <div className="group relative flex transition-colors duration-150 items-center gap-8 px-6 py-6 max-sm:gap-4 max-sm:px-6 max-sm:py-3 max-xl:pr-20">
                <div className="flex min-w-0 flex-1 flex-col gap-2 max-sm:gap-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="line-clamp-1 min-w-0 flex-1 font-medium text-foreground text-xl leading-[24px] max-sm:line-clamp-2 max-sm:text-base max-sm:leading-5">
                      {thread.title}
                    </h3>
                  </div>
                  <p className="line-clamp-2 min-w-0 text-muted-foreground text-sm leading-relaxed">{thread.summary}</p>
                  <div className="flex min-w-0 items-center text-muted-foreground gap-2 text-sm">
                    <span className="shrink-0 sm:hidden">{compactLabel(thread.updatedLabel)}</span>
                    <span className="hidden shrink-0 sm:inline">{thread.updatedLabel}</span>
                  </div>
                </div>
                <div />
                {/* The actions sit inside the row link; swallow their clicks so they do not navigate. */}
                <div
                  className="absolute right-3 flex items-center gap-1 top-3"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className={ACTION} aria-label="Thread actions">
                        <Ellipsis className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Regenerate name</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Move to project
                        <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                      </DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Fork thread</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Exclude from knowledge</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Thread settings…</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={ACTION}
                    aria-label={starred ? "Unstar thread" : "Star thread"}
                    aria-pressed={starred}
                    onClick={onToggleStar}
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
