"use client";

import { useState } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTile } from "@/components/ui/icon-tile";
import { Overline } from "@/components/ui/overline";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// The workspace the dashboard is looking at, under the logo: a letter tile,
// the name and a chevron, opening a menu of the workspaces this account can
// see. The list arrives from the server as plain values (app-shell.tsx reads
// the wiki store there, so the store never reaches the browser), the first
// entry is the one selected, and choosing another only moves the selection:
// every page's data stays as it is (docs/clone-conventions.md rule 2).
//
// On the 64px rail the tile stays where the nav icons sit (its centre on the
// rail's centre line), the name and chevron fade the way the nav labels do,
// and the name moves into a tooltip.

export type Workspace = {
  id: string;
  name: string;
  /** A second fact for the menu row, such as the member count. */
  detail?: string;
};

function WorkspaceTile({ name }: { name: string }) {
  return (
    <IconTile size="xs" tone="tint" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </IconTile>
  );
}

export function WorkspaceSwitcher({ workspaces, collapsed }: { workspaces: Workspace[]; collapsed: boolean }) {
  const [selectedId, setSelectedId] = useState(workspaces[0]?.id);
  const selected = workspaces.find((workspace) => workspace.id === selectedId) ?? workspaces[0];
  if (!selected) return null;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="none"
              aria-label={`${selected.name}, switch workspace`}
              className={cn(
                "h-auto w-full justify-start gap-2 overflow-hidden rounded-xl border border-border-subtle py-1.5 pr-2.5 pl-[13px] text-sm font-medium transition-[color,background-color,border-color] duration-(--duration-normal) ease-out",
                collapsed && "border-transparent",
              )}
            >
              <WorkspaceTile name={selected.name} />
              <span className={cn("min-w-0 flex-1 truncate text-left transition-opacity duration-200", collapsed && "opacity-0")}>
                {selected.name}
              </span>
              <IconChevronDown
                className={cn("size-4 shrink-0 text-muted-foreground transition-opacity duration-200", collapsed && "opacity-0")}
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{selected.name}</TooltipContent>}
      </Tooltip>
      <DropdownMenuContent
        side={collapsed ? "right" : "bottom"}
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
      >
        <DropdownMenuLabel asChild className="py-1 pr-1 pl-2">
          <Overline>Workspaces</Overline>
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={selected.id} onValueChange={setSelectedId}>
          {workspaces.map((workspace) => (
            <DropdownMenuRadioItem key={workspace.id} value={workspace.id} indicator="none">
              <WorkspaceTile name={workspace.name} />
              <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
              {workspace.detail && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{workspace.detail}</span>}
              <IconCheck className={cn("size-4", workspace.id !== selected.id && "invisible")} aria-hidden="true" />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
