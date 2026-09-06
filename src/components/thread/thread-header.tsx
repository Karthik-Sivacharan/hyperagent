"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, PanelRight, Star } from "lucide-react";
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

const MODELS = [
  { name: "Fable 5.1", blurb: "Model for demanding tasks. Higher cost." },
  { name: "Opus 5", blurb: "Powerful model for complex tasks." },
  { name: "Sonnet 5", blurb: "Great for everyday tasks. Lower cost." },
];

export function ThreadHeader({ title, model, starred: initialStarred }: { title: string; model: string; starred: boolean }) {
  const [starred, setStarred] = useState(initialStarred);
  const [selectedModel, setSelectedModel] = useState(model);

  return (
    <div className="shrink-0 px-3">
      <div className="flex items-center gap-1 h-12">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <div className="min-w-0 max-w-full overflow-hidden" data-slot="context-menu-trigger">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-0 max-w-full cursor-pointer items-center gap-0.5 rounded-[6px] px-2 py-0.5 transition-colors hover:bg-muted/50 focus-visible:outline-offset-[-2px]"
                >
                  <span className="truncate font-normal text-sm">{title}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
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
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={starred ? "Unstar thread" : "Star thread"}
            aria-pressed={starred}
            onClick={() => setStarred((s) => !s)}
          >
            <Star className={cn("size-3.5", starred && "fill-current")} />
          </Button>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center rounded-md font-medium text-xs transition-colors gap-1 px-1.5 py-0.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <span className="size-2 rounded-full border border-muted-foreground/40" />
          <span>Live</span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Model: ${selectedModel}`}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[6px] border border-border px-2 text-xs transition-colors hover:bg-muted/50"
              >
                {/* Context-usage ring: empty on a fresh thread. */}
                <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden="true">
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
            className="size-7 rounded-[6px] border border-border hover:text-foreground text-muted-foreground"
            aria-label="Open panel"
          >
            <PanelRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
