"use client";

import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconSearch,
  type TablerIcon,
} from "@tabler/icons-react";

import { HyperagentMark } from "@/components/app/brand-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavItem } from "@/components/ui/nav-item";
import { Overline } from "@/components/ui/overline";

import { A11Y, DEMO_CHROME, DEMO_USER } from "./content";
import type { DemoAgent, DemoAgentId } from "./demo-agents";
import { DemoAgentAvatar } from "./demo-agent-avatar";

const ACTION_ICONS: TablerIcon[] = [IconEdit, IconSearch, IconInbox];

// A section header as the app draws one: the caps label and its chevron.
function SectionLabel({ label, open }: { label: string; open: boolean }) {
  const Chevron = open ? IconChevronDown : IconChevronRight;
  return (
    <Overline className="mb-1 flex items-center gap-1 py-1 pr-1 pl-3.5">
      <span className="whitespace-nowrap">{label}</span>
      <Chevron className="size-3" aria-hidden="true" />
    </Overline>
  );
}

// The app's sidebar, pared down to what the demo is about: the brand, the
// three top actions, the agents, the two other sections folded, and the
// account. Built from the primitives the app's own sidebar uses and its
// measurements (a 256px column on the sidebar ground, 56px header, pill
// rows), because the app sidebar is a whole router-bound navigation and
// this one only needs to choose an agent. The agents read as a message
// list: avatar, name and time, then where the job stands on one line.
//
// Only the agent rows are live. Everything around them is a picture of the
// app and is inert and hidden from assistive tech.
export function DemoSidebar({
  agents,
  selectedId,
  onSelect,
}: {
  agents: readonly DemoAgent[];
  selectedId: DemoAgentId;
  onSelect: (id: DemoAgentId) => void;
}) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div
        inert
        aria-hidden="true"
        className="mt-1 flex h-14 shrink-0 items-center gap-2 pr-3 pl-5.5"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <HyperagentMark className="size-5 shrink-0 text-primary" />
          <span className="text-logo whitespace-nowrap">
            {DEMO_CHROME.brand}
          </span>
        </span>
        <span className="flex size-6 items-center justify-center text-muted-foreground">
          <IconLayoutSidebarLeftCollapse
            className="size-4"
            aria-hidden="true"
          />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 py-2">
        <div inert aria-hidden="true" className="mb-2 space-y-0.5">
          {DEMO_CHROME.actions.map((label, index) => {
            const Icon = ACTION_ICONS[index] ?? IconEdit;
            return (
              <NavItem key={label} tabIndex={-1}>
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </NavItem>
            );
          })}
        </div>

        <div className="mb-3">
          <div inert aria-hidden="true">
            <SectionLabel label={DEMO_CHROME.agents} open />
          </div>
          <nav aria-label={A11Y.agents}>
            <ul role="list" className="space-y-0.5">
              {agents.map((agent) => {
                const selected = agent.id === selectedId;
                return (
                  <li key={agent.id}>
                    <NavItem
                      active={selected}
                      aria-current={selected ? "true" : undefined}
                      onClick={() => onSelect(agent.id)}
                      className="items-center gap-2.5 rounded-2xl px-2 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    >
                      <DemoAgentAvatar agent={agent} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {agent.label}
                          </span>
                          <span className="shrink-0 text-xs font-normal text-foreground-low tabular-nums">
                            {agent.time}
                          </span>
                        </span>
                        <span className="truncate text-xs font-normal text-muted-foreground">
                          {agent.preview}
                        </span>
                      </span>
                    </NavItem>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div inert aria-hidden="true">
          <SectionLabel label={DEMO_CHROME.recent} open={false} />
          <div className="mt-3">
            <SectionLabel label={DEMO_CHROME.resources} open={false} />
          </div>
        </div>
      </div>

      <div inert aria-hidden="true" className="shrink-0 p-2">
        <div className="flex items-center gap-2 rounded-2xl px-2 py-1.5">
          <Avatar>
            <AvatarImage src={DEMO_USER.avatarUrl} alt="" />
            <AvatarFallback>{DEMO_USER.initials}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col text-left">
            <span className="truncate text-xs leading-4 font-medium text-foreground">
              {DEMO_USER.name}
            </span>
            <span className="truncate text-xs leading-4 text-muted-foreground">
              {DEMO_USER.email}
            </span>
          </span>
          <IconChevronRight
            className="size-4 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
