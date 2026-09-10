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

export function ThreadHeader({
  thread,
  model,
  panelOpen,
  onTogglePanel,
  panelId,
}: {
  thread: Thread;
  model: string;
  /**
   * The three props that wire the panel toggle, all optional and all inert
   * unless `onTogglePanel` is given.
   *
   * Opt-in because this bar is shared with `/thread/[id]`, a cloned route that
   * must stay pixel-identical to the capture: omit them and the button renders
   * exactly the byte-for-byte markup it rendered before — the same
   * `aria-label="Open panel"`, the same resting tint fill, no handler — because
   * on that route there is still nothing behind it to open.
   */
  panelOpen?: boolean;
  onTogglePanel?: () => void;
  /** The panel's element id, for `aria-controls`. */
  panelId?: string;
}) {
  const [starred, setStarred] = useState(thread.starred);
  const [selectedModel, setSelectedModel] = useState(model);
  // "Wired" is the presence of a handler rather than of `panelOpen`, because
  // `panelOpen={false}` is a real state a caller passes and `undefined` is the
  // absence of the feature; conflating them would make a closed panel look like
  // an unwired one.
  const panelToggleWired = onTogglePanel !== undefined;

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
          {/* ONE GLYPH IN BOTH STATES. The precedent is the sidebar's own
              collapse control, which keeps `IconLayoutSidebarLeftCollapse` and
              flips only its label between "Pin sidebar" and "Hide sidebar": a
              toggle that swaps its icon asks the reader to re-identify the
              control every time they press it, and the panel it points at is
              right there on screen saying which state it is in. So the state is
              carried by `aria-expanded`, by a label that flips, and by the tint
              fill — which is the fill this button already had at rest, now
              earning its keep as the open state. */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "size-7",
              // Unwired, or open: the resting fill this button has always had.
              // Wired and closed: a plain ghost, so the fill means something.
              panelToggleWired && !panelOpen ? undefined : "bg-tint-10",
              "text-muted-foreground hover:bg-tint-15 hover:text-foreground",
            )}
            aria-label={
              panelToggleWired
                ? panelOpen
                  ? "Hide agent panel"
                  : "Show agent panel"
                : "Open panel"
            }
            aria-expanded={panelToggleWired ? panelOpen : undefined}
            aria-controls={panelToggleWired ? panelId : undefined}
            onClick={onTogglePanel}
          >
            <IconLayoutSidebarRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
