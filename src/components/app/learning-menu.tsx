"use client";

import Link from "next/link";
import { IconClipboardCheck, IconSparkles } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Overline } from "@/components/ui/overline";

// The "Learning" dropdown in the sidebar's Resources group
// (docs/reference/overlays/learning-menu.html). Rubrics is not cloned, so it
// lands on /learning.

// Rest props are the ones an enclosing TooltipTrigger slot injects.
export function LearningMenu({ children, ...triggerProps }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-48">
        <DropdownMenuLabel asChild className="whitespace-nowrap py-1 pr-1 pl-2">
          <Overline>Learning</Overline>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/learning">
            <IconSparkles className="size-4" aria-hidden="true" />
            Improvements
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/learning">
            <IconClipboardCheck className="size-4" aria-hidden="true" />
            Rubrics
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
