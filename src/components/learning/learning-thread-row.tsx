"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconBulb,
  IconChevronDown,
  IconChevronRight,
  IconClipboardCheck,
  IconMessage2,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Thread } from "@/lib/mock/threads";

// One thread card on /learning (docs/reference/pages/learning.html): a
// collapsible row whose header is the expander button, plus four icon
// actions on the right. The capture has the row collapsed; the expanded
// body here shows the thread summary and a link into the thread. Phase 2:
// the brand card (22px, the resting card shadow) with a tint hover on the
// header row, the title on the first text tier at the body size (the card's
// own 14px is reset with `text-base`) and the meta line on the third, ghost
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
  const Chevron = open ? IconChevronDown : IconChevronRight;

  return (
    <Card size="none" className="text-base">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center transition-[background-color] duration-(--duration-fast) ease-out-quart hover:bg-tint-10">
          <CollapsibleTrigger className="flex flex-1 items-center gap-3 p-4 text-left">
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
          </CollapsibleTrigger>
          <div className="shrink-0 pr-4">
            <div className="flex items-center gap-1">
              <RowAction label="Give feedback" href={`/thread/${thread.id}?feedback=true`}>
                <IconMessage2 className="size-4" aria-hidden="true" />
              </RowAction>
              <RowAction label="Extract learnings" href={`/thread/${thread.id}?learn=true`}>
                <IconBulb className="size-4" aria-hidden="true" />
              </RowAction>
              <RowAction label="Generate skill">
                <IconSparkles className="size-4" aria-hidden="true" />
              </RowAction>
              <RowAction label="Evaluate" href={`/thread/${thread.id}?eval=true`}>
                <IconClipboardCheck className="size-4" aria-hidden="true" />
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
              <IconArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
