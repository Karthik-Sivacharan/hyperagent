"use client";

import type { ComponentType, ReactNode } from "react";
import { Archive, ArrowRightLeft, ArrowUpRight, BookX, Pencil, Plus, RefreshCw, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Thread } from "@/lib/mock/threads";

// The recent-thread row menu from hyperagent.com, reachable from the row's
// "..." button (dropdown) and from a right-click (context menu). Both render
// the same items (docs/reference/overlays/thread-options-menu.html,
// thread-context-menu.html, thread-options-menu-move-to-project.html).

type ItemProps = {
  children?: ReactNode;
  className?: string;
  asChild?: boolean;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
};
type Kit = {
  Item: ComponentType<ItemProps>;
  Separator: ComponentType<{ className?: string }>;
  Sub: ComponentType<{ children?: ReactNode }>;
  SubTrigger: ComponentType<{ children?: ReactNode; className?: string }>;
  SubContent: ComponentType<{ children?: ReactNode; className?: string }>;
};

const dropdownKit: Kit = {
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};

const contextKit: Kit = {
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
};

function ThreadMenuItems({ thread, kit: K }: { thread: Thread; kit: Kit }) {
  return (
    <>
      <K.Item asChild>
        <a href={`/thread/${thread.id}`} target="_blank" rel="noopener noreferrer">
          <ArrowUpRight className="size-4" aria-hidden="true" />
          Open in new tab
        </a>
      </K.Item>
      <K.Item>
        <Pencil className="size-4" aria-hidden="true" />
        Rename
      </K.Item>
      <K.Item data-drawer-keep-open="true">
        <RefreshCw className="size-4" aria-hidden="true" />
        Regenerate name
      </K.Item>
      <K.Separator />
      <K.Item data-drawer-keep-open="true">
        <Star className="size-4" aria-hidden="true" />
        Star thread
      </K.Item>
      <K.Sub>
        <K.SubTrigger>
          <ArrowRightLeft className="size-4" aria-hidden="true" />
          Move to project
        </K.SubTrigger>
        <K.SubContent>
          <K.Item disabled>No projects yet</K.Item>
          <K.Separator />
          <K.Item data-drawer-keep-open="true">
            <Plus className="size-4" aria-hidden="true" />
            Create new project…
          </K.Item>
        </K.SubContent>
      </K.Sub>
      <K.Separator />
      <span className="block">
        <K.Item data-drawer-keep-open="true">
          <BookX className="size-4" aria-hidden="true" />
          Exclude from knowledge
        </K.Item>
      </span>
      <K.Item>
        <Archive className="size-4" aria-hidden="true" />
        Archive
      </K.Item>
    </>
  );
}

/** The "..." options dropdown; `children` is the trigger button. */
export function ThreadOptionsMenu({ thread, children }: { thread: Thread; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        <ThreadMenuItems thread={thread} kit={dropdownKit} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Right-click menu; `children` is the whole thread row. */
export function ThreadContextMenu({ thread, children }: { thread: Thread; children: ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ThreadMenuItems thread={thread} kit={contextKit} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
