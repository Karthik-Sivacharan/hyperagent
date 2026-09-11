"use client";

import { IconPlus, IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeading } from "@/components/patterns/page-heading";
import type { TeamMember } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { MemberAvatar } from "@/components/teams/fleet/member-avatar";

// The team's title row on the shared `PageHeading`, under the hairline rule
// every resource page keeps (docs/plans/2026-09-11-teams-fleet-polish.md
// §4.1). The name alone: a subtitle would only repeat it. The actions are
// who is here, a quiet way to add someone, and the one ink action: the
// people as a stack of 24px faces overlapped by 6px, Invite as a ghost icon
// button, New agent on ink. Presence and role live in each face's tooltip
// and accessible name ("Karthik Sivacharan, Founder, online"), not on the face, and
// the group's name keeps the count the old "2 online" label showed.

function memberLabel(member: TeamMember): string {
  return `${member.name}, ${member.role}, ${member.online ? "online" : "away"}`;
}

// The 2px outline in the canvas colour is the cutout where a face overlaps
// its neighbour. An outline, not a ring, so it never fights the avatar's own
// ring or shadow classes in `cn()`.
function MemberStack({ members }: { members: TeamMember[] }) {
  const online = members.filter((member) => member.online).length;
  return (
    <div
      role="group"
      aria-label={`${members.length} members, ${online} online`}
      className="flex items-center -space-x-1.5"
    >
      {members.map((member) => {
        const label = memberLabel(member);
        return (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <MemberAvatar member={member} size="sm" aria-label={label} className="outline-2 outline-background" />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function FleetHeader() {
  const { team } = useFleet();
  return (
    <header className="shrink-0 border-b border-border-subtle px-6 py-4">
      <PageHeading
        title={team.name}
        actions={
          <>
            <MemberStack members={team.members} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Invite people">
                  <IconUserPlus aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Invite people</TooltipContent>
            </Tooltip>
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
