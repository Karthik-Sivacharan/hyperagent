"use client";

import { IconPlus, IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeading } from "@/components/patterns/page-heading";
import type { TeamMember } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";

// The team's title row on the shared `PageHeading`, under the hairline rule
// every resource page keeps: name, one line of purpose, then who is here
// (the people in a tight row, ringed when online, with a count) and the two
// actions, Invite on the outline pill and New agent on ink.

function MemberStack({ members }: { members: TeamMember[] }) {
  const online = members.filter((member) => member.online).length;
  return (
    <div role="group" aria-label={`${members.length} members, ${online} online`} className="flex items-center gap-2.5">
      {/* Spaced, not overlapped: two online rings crossing read as one knot. */}
      <div className="flex items-center gap-1">
        {members.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <MemberAvatar member={member} size="md" />
            </TooltipTrigger>
            <TooltipContent>
              {member.name} · {member.role}
              {member.online ? null : " · away"}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <span className="text-md text-muted-foreground tabular-nums" aria-hidden="true">
        {online} online
      </span>
    </div>
  );
}

export function FleetHeader() {
  const { team } = useFleet();
  return (
    <header className="shrink-0 border-b border-border-subtle px-6 py-4">
      <PageHeading
        title={team.name}
        subtitle={team.description}
        actions={
          <>
            <MemberStack members={team.members} />
            <Separator orientation="vertical" className="data-vertical:h-5 data-vertical:self-center" />
            <Button variant="outline">
              <IconUserPlus aria-hidden="true" />
              Invite
            </Button>
            <Button>
              <IconPlus aria-hidden="true" />
              New agent
            </Button>
          </>
        }
      />
    </header>
  );
}
