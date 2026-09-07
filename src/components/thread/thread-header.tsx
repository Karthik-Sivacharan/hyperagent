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

// The 48px bar above a conversation (docs/reference/pages/thread-detail.html):
// title menu and star on the left; live status, model pill and the preview
// panel toggle on the right. Menu items are the ones the live site lists.
// Phase 2: the bar is a paper band under a hairline; the title trigger, the
// star and "Live" are ghost pills, the model pill and the panel toggle tint
// pills, and the live dot is the one sanctioned status use, a small
// `bg-success` dot (docs/brand/design.md §1, §5, §8).

const MODELS = [
  { name: "Fable 5.1", blurb: "Model for demanding tasks. Higher cost." },
  { name: "Opus 5", blurb: "Powerful model for complex tasks." },
  { name: "Sonnet 5", blurb: "Great for everyday tasks. Lower cost." },
];

const GHOST_PILL =
  "cursor-pointer rounded-full transition-[color,background-color] duration-(--duration-fast) ease-out-quart hover:bg-tint-10 aria-expanded:bg-tint-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

export function ThreadHeader({ title, model, starred: initialStarred }: { title: string; model: string; starred: boolean }) {
  const [starred, setStarred] = useState(initialStarred);
  const [selectedModel, setSelectedModel] = useState(model);

  return (
    <div className="shrink-0 border-b border-border-subtle bg-background px-3">
      <div className="flex items-center gap-1 h-12">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <div className="min-w-0 max-w-full overflow-hidden" data-slot="context-menu-trigger">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={cn(GHOST_PILL, "flex min-w-0 max-w-full items-center gap-0.5 px-2 py-0.5")}>
                  <span className="truncate font-normal text-sm text-foreground">{title}</span>
                  <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
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

        <button
          type="button"
          className={cn(GHOST_PILL, "flex shrink-0 items-center gap-1 px-1.5 py-0.5 font-medium text-xs text-muted-foreground hover:text-foreground")}
        >
          <span className="size-2 rounded-full bg-success" />
          <span>Live</span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Model: ${selectedModel}`}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-tint-10 px-2.5 text-xs transition-[color,background-color] duration-(--duration-fast) ease-out-quart hover:bg-tint-15 aria-expanded:bg-tint-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {/* Context-usage ring: empty on a fresh thread. */}
                <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0 text-foreground" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-15" />
                </svg>
                <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-muted-foreground text-xs">
                  <span className="truncate">{selectedModel}</span>
                </span>
              </button>
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
