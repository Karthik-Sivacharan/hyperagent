"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Lightbulb,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock/threads";

// One thread card on /learning (docs/reference/pages/learning.html): a
// collapsible row whose header is the expander button, plus four icon
// actions on the right. The capture has the row collapsed; the expanded
// body here shows the thread summary and a link into the thread. Phase 2:
// a 22px card with the resting card shadow, a tint hover on the header row,
// the title on the first text tier and the meta line on the third, ghost
// icon pills for the actions and a hairline above the expanded body
// (docs/brand/design.md §4.1, §5, §6).
function RowAction({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const button = (
    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" aria-label={label}>
      {children}
    </Button>
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>{href ? <Link href={href}>{button}</Link> : button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function LearningThreadRow({ thread }: { thread: Thread }) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-card">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center transition-[background-color] duration-(--duration-fast) ease-out-quart hover:bg-tint-10">
          <CollapsibleTrigger asChild>
            <button className="flex flex-1 items-center gap-3 p-4 text-left" type="button">
              <div className="shrink-0">
                <Chevron className="size-4 text-foreground-low" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-foreground">{thread.title}</span>
                </div>
                <p className="mt-0.5 text-xs text-foreground-low">
                  {thread.messageCount} messages · {thread.updatedLabel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-foreground-low">—</span>
              </div>
            </button>
          </CollapsibleTrigger>
          <div className="shrink-0 pr-4">
            <div className="flex items-center gap-1">
              <RowAction label="Give feedback" href={`/thread/${thread.id}?feedback=true`}>
                <MessageSquareText className="size-4" aria-hidden="true" />
              </RowAction>
              <RowAction label="Extract learnings" href={`/thread/${thread.id}?learn=true`}>
                <Lightbulb className="size-4" aria-hidden="true" />
              </RowAction>
              <RowAction label="Generate skill">
                <Sparkles className="size-4" aria-hidden="true" />
              </RowAction>
              <RowAction label="Evaluate" href={`/thread/${thread.id}?eval=true`}>
                <ClipboardCheck className="size-4" aria-hidden="true" />
              </RowAction>
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <div className="border-t border-border-subtle px-4 py-3 pl-11">
            <p className="text-sm text-muted-foreground">{thread.summary}</p>
            <Link
              href={`/thread/${thread.id}`}
              className="mt-2 inline-flex items-center gap-1 text-sm text-foreground hover:underline"
            >
              Open thread
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
