"use client";

import Link from "next/link";
import { IconArchive, IconChevronRight, IconDots, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThreadContextMenu } from "@/components/app/thread-menu";
import type { Thread } from "@/lib/mock/threads";

// One row of the threads list (docs/reference/pages/threads.html). The whole
// row is a link; the actions in its top-right corner fade in on hover at xl
// and stay visible below it. The "Archive" sheet underneath is the
// swipe-to-archive reveal on touch devices (opacity-0 on desktop).
// Phase 2: each row is a 22px brand card on the resting card shadow that
// lifts to the hover shadow; the title is the display serif on tier 1, the
// summary tier 2, the timestamp tier 3; the actions are glass pills and the
// archive sheet the success fill (docs/brand/design.md §4.1, §5, §6, §8).
// On phones the cards go full-bleed and share hairline dividers, as the
// site's rows did. The shell is the `Card` with no padding of its own; the
// hover lift stays the site's rule (it holds off while a nested thread is
// hovered) rather than the plain interactive variant, and the row link is
// the trigger of the thread context menu.

// The glass override on the ghost icon button: a translucent elevated fill,
// the hairline edge and a blur, with opacity in the transition list.
//
// `scale` rather than `transform` for the same reason as the home card's copy
// of this string: an arbitrary `transition-[…]` here replaces the button's own
// list, and v4 compiles the base's `scale-(--scale-press)` to the separate CSS
// `scale` property. Naming `transform` named a property nothing sets.
const ACTION =
  "size-7 bg-surface-elevated/80 text-muted-foreground shadow-edge backdrop-blur-sm hover:text-foreground aria-pressed:text-foreground group-hover:opacity-100 focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100 transition-[opacity,color,background-color,scale] duration-(--duration-normal) ease-out opacity-100 xl:opacity-0 xl:group-hover:opacity-100 xl:focus-visible:opacity-100 xl:group-has-[:focus-visible]:opacity-100 [@media(hover:none)]:opacity-100";

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
    <Card
      size="none"
      className="transition-[box-shadow] duration-(--duration-slow) ease-out [&:hover:not(:has([data-nested-threads]:hover))]:shadow-card-hover max-sm:rounded-none max-sm:border-b max-sm:border-border-subtle max-sm:shadow-none"
    >
      <div>
        <div className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-end gap-2 bg-success pr-6 font-medium text-sm text-success-foreground opacity-0"
          >
            <IconArchive className="size-5" aria-hidden="true" />
            Archive
          </div>
          <div className="relative touch-pan-y">
            <ThreadContextMenu thread={thread}>
              <Link
                className="block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset max-sm:rounded-none"
                href={`/thread/${thread.id}`}
              >
                <div className="group relative flex items-center gap-8 px-6 py-6 max-sm:gap-4 max-sm:px-6 max-sm:py-3 max-xl:pr-20">
                  <div className="flex min-w-0 flex-1 flex-col gap-2 max-sm:gap-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="line-clamp-1 min-w-0 flex-1 font-heading text-foreground text-xl leading-[24px] max-sm:line-clamp-2 max-sm:text-base max-sm:leading-5">
                        {thread.title}
                      </h3>
                    </div>
                    <p className="line-clamp-2 min-w-0 text-muted-foreground text-sm leading-relaxed">{thread.summary}</p>
                    <div className="flex min-w-0 items-center text-foreground-low gap-2 text-sm">
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
                          <IconDots className="size-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Regenerate name</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Move to project
                          <IconChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
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
                      <IconStar className={cn("size-4", starred && "fill-current")} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Link>
            </ThreadContextMenu>
          </div>
        </div>
      </div>
    </Card>
  );
}
