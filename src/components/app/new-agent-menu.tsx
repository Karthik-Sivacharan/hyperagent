"use client";

import Link from "next/link";
import { IconCompass, IconCopy, IconMessageCirclePlus, IconBuildingStore, IconUpload, IconWand } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AGENT_TEMPLATES, AgentOrbSmall } from "@/components/app/agent-orb";

// The "New agent" menu behind the Agents header "+" and the empty-state row
// (docs/reference/overlays/new-agent-menu.html, new-agent-menu-templates.html).
// The wizard / manual-create routes are not cloned, so those links land on
// /agents.

// Rest props are the ones an enclosing TooltipTrigger slot injects (rail mode).
export function NewAgentMenu({ children, ...triggerProps }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-64">
        <DropdownMenuItem asChild>
          <Link href="/agents">
            <IconCompass className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Guided setup</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconMessageCirclePlus className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Create with chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/agents">
            <IconWand className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Create manually</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconCopy className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Start from a template</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-w-72">
            {AGENT_TEMPLATES.map((template) => (
              <DropdownMenuItem key={template.name} className="items-start" data-drawer-keep-open="">
                <AgentOrbSmall template={template} />
                <div className="flex flex-col">
                  <span className="text-sm">{template.name}</span>
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link href="/marketplace">
            <IconBuildingStore className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Search the marketplace</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconUpload className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Import</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
