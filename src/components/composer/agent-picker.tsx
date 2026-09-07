"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBallpen, IconSearch } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Overline } from "@/components/ui/overline";
import { AGENT_TEMPLATES, AgentOrbTile } from "@/components/app/agent-orb";

// The composer's "Agent" pill menu (docs/reference/overlays/composer-agent-picker.html):
// a search box, the starter agents, and "Create from scratch" (which lands on
// /agents here since /agents/new is not cloned).

export function AgentPicker({ children, ...triggerProps }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const agents = AGENT_TEMPLATES.filter((a) => !q || a.name.toLowerCase().includes(q));

  return (
    <DropdownMenu onOpenChange={(open) => !open && setQuery("")}>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      {/* The live picker sits 6px below the pill (captured wrapper y=263 for a 257px anchor bottom). */}
      <DropdownMenuContent align="start" sideOffset={6} className="w-72">
        <div>
          <div className="flex items-center gap-2 px-3 py-2">
            <IconSearch className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              variant="bare"
              placeholder="Search agents…"
              className="flex-1 text-sm"
              autoComplete="off"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <DropdownMenuSeparator />
          {/* The overline renders as the menu label (the site emits the `overline` slot here). */}
          <Overline asChild>
            <DropdownMenuLabel className="pt-1 pb-1">Starter agents</DropdownMenuLabel>
          </Overline>
          {agents.map((agent) => (
            <DropdownMenuItem key={agent.name} className="items-center gap-2">
              <AgentOrbTile template={agent} />
              <div className="flex min-w-0 flex-col">
                <span className="text-sm">{agent.name}</span>
                <span className="line-clamp-1 text-muted-foreground text-xs">{agent.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="items-center gap-2">
            <Link href="/agents">
              <IconBallpen className="mx-1 size-4" aria-hidden="true" />
              <span className="text-sm">Create from scratch</span>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
