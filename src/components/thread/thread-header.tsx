"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronRight, IconLayoutSidebarRight, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThreadContextMenu } from "@/components/app/thread-menu";
import type { Thread } from "@/lib/mock/threads";

// The 48px bar above a conversation (docs/reference/pages/thread-detail.html):
// title menu and star on the left; live status, model pill and the preview
// panel toggle on the right. Menu items are the ones the live site lists.
// Phase 2: the bar is a paper band under a hairline; the title trigger, the
// star and "Live" are ghost pills, the model pill and the panel toggle tint
// pills, and the live dot is the one sanctioned status use, a small
// `bg-success` dot (docs/brand/design.md §1, §5, §8). The title trigger and
// "Live" are `Button` ghost pills with no size of their own (the bar's own
// 24px and 20px metrics), the model pill the tint `xs` button, and the
// title block is the trigger of the thread context menu, as on the site.

const MODELS = [
  { name: "Fable 5.1", blurb: "Model for demanding tasks. Higher cost." },
  { name: "Opus 5", blurb: "Powerful model for complex tasks." },
  { name: "Sonnet 5", blurb: "Great for everyday tasks. Lower cost." },
];

export function ThreadHeader({ thread, model }: { thread: Thread; model: string }) {
  const [starred, setStarred] = useState(thread.starred);
  const [selectedModel, setSelectedModel] = useState(model);

  return (
    <div className="shrink-0 border-b border-border-subtle bg-background px-3">
      <div className="flex items-center gap-1 h-12">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <ThreadContextMenu thread={thread}>
            <div className="min-w-0 max-w-full overflow-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* `flex` (not the base's inline-flex) so the wrapper's line box stays the button's 24px. */}
                  <Button type="button" variant="ghost" size="none" className="flex min-w-0 max-w-full gap-0.5 px-2 py-0.5 font-normal">
                    <span className="truncate font-normal text-sm text-foreground">{thread.title}</span>
                    <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
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
            </div>
          </ThreadContextMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground aria-pressed:text-foreground"
            aria-label={starred ? "Unstar thread" : "Star thread"}
            aria-pressed={starred}
            onClick={() => setStarred((s) => !s)}
          >
            <IconStar className={cn("size-3.5", starred && "fill-current")} aria-hidden="true" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="none"
          className="gap-1 px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="size-2 rounded-full bg-success" />
          <span>Live</span>
        </Button>

        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="tint"
                size="xs"
                aria-label={`Model: ${selectedModel}`}
                className="gap-1.5 px-2.5 has-[>svg]:px-2.5"
              >
                {/* Context-usage ring: empty on a fresh thread. `size-3.5` keeps the 14px box against the button's unsized-svg rule. */}
                <svg width="14" height="14" viewBox="0 0 14 14" className="size-3.5 shrink-0 text-foreground" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-15" />
                </svg>
                <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-muted-foreground text-xs">
                  <span className="truncate">{selectedModel}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuRadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                {MODELS.map((m) => (
                  <DropdownMenuRadioItem key={m.name} value={m.name} className="items-start py-1.5">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground text-xs">{m.blurb}</span>
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Compact context now</DropdownMenuItem>
              <DropdownMenuItem>View detailed usage</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 bg-tint-10 text-muted-foreground hover:bg-tint-15 hover:text-foreground"
            aria-label="Open panel"
          >
            <IconLayoutSidebarRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
