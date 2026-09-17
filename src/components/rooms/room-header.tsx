"use client";

import { useState } from "react";
import {
  IconCalendarClock,
  IconChevronDown,
  IconDots,
  IconHash,
  IconLayoutSidebarRight,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Overline } from "@/components/ui/overline";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RoomAvatar, RoomFacepile } from "@/components/rooms/room-avatar";
import { roomMember, type Room, type RoomMember } from "@/lib/mock/rooms";

// The chrome above a room: two bands under one hairline, so the whole thing
// reads as a single column of chrome rather than two stacked bars.
//
// Band 1 keeps ThreadHeader's metrics exactly — 48px tall, `px-3`, `gap-1`,
// 32px ghost icon buttons — because a reader moving between a thread and a
// room should not feel the app change height under them. What differs is the
// title: a thread is named by a sentence someone wrote, so it sits at `sm` on
// the first tier; a room is named by a slug people type, so it gets the
// heading-at-body-size role (`text-base font-semibold`, docs/brand/design.md
// §4) with the `#` on the third tier in front of it.
//
// Band 2 is the tab row. Its triggers start at the same 18px inset as the `#`
// above (12px of band padding + the line tab's own 6px), which is the whole
// reason the title trigger runs `px-1.5` where ThreadHeader's runs `px-2`.
// `pb-1.5` lands the active tab's 2px rule one pixel above the bottom
// hairline, so the two lines read as one edge.
//
// Colour discipline (§11): the panel toggle is the only tint pill among the
// buttons and it earns that fill by being pressed; the schedule readout is a
// tint pill because it is a readout, not a control. No orange lives up here —
// the room's single brand action is the composer's send button.

export type RoomTab = "messages" | "canvas";

/** Band 1's ghost icon buttons: 32px, third tier at rest, first tier on hover. */
const ICON_BUTTON = "size-8 shrink-0 text-muted-foreground hover:text-foreground";

/**
 * One kind of member under its own caps label. People come first: the room
 * belongs to a team, and its agents are the team's, not the other way round.
 */
function MemberGroup({ label, members }: { label: string; members: RoomMember[] }) {
  if (members.length === 0) return null;

  return (
    <div className="px-1 py-1.5">
      <Overline className="px-2 pb-1">{label}</Overline>
      <ul>
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <RoomAvatar member={member} size="default" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-foreground">{member.name}</span>
              {member.role ? <span className="truncate text-md text-muted-foreground">{member.role}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RoomHeader({
  room,
  tab,
  onTabChange,
  threadOpen,
  onToggleThread,
  className,
}: {
  room: Room;
  tab: RoomTab;
  onTabChange: (tab: RoomTab) => void;
  /** The thread rail beside the room is showing. */
  threadOpen: boolean;
  onToggleThread: () => void;
  className?: string;
}) {
  // Seeded from the mock and owned here: nothing in this clone persists a
  // star, and a caller that does not care should not have to hold the state.
  const [starred, setStarred] = useState(room.starred ?? false);

  const members = room.memberIds.map(roomMember).filter((member): member is RoomMember => member !== undefined);
  const people = members.filter((member) => member.kind === "human");
  const agents = members.filter((member) => member.kind === "agent");

  const scheduleLabel =
    room.scheduleCount === 1 ? "1 scheduled job posts here" : `${room.scheduleCount} scheduled jobs post here`;

  return (
    // No margin of its own: the caller owns the column and makes this `shrink-0`.
    <div className={cn("border-b border-border-subtle bg-background", className)}>
      <div className="flex h-12 items-center gap-1 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* `flex`, not the base's inline-flex, so the line box cannot grow past the row. */}
              <Button type="button" variant="ghost" size="none" className="flex min-w-0 max-w-full gap-1.5 px-1.5 py-1">
                <IconHash className="size-4 shrink-0 text-foreground-low" aria-hidden="true" />
                <span className="truncate text-base font-semibold text-foreground">{room.slug}</span>
                <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>Room details</DropdownMenuItem>
              <DropdownMenuItem>Edit topic</DropdownMenuItem>
              <DropdownMenuItem>Manage members</DropdownMenuItem>
              <DropdownMenuItem>Notification preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Leave room</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(ICON_BUTTON, "aria-pressed:text-foreground")}
            aria-label={starred ? "Unstar room" : "Star room"}
            aria-pressed={starred}
            onClick={() => setStarred((current) => !current)}
          >
            {/* Tabler ships the filled star as its own export; the outline and
                the fill share a grid, so nothing shifts when it flips. */}
            {starred ? (
              <IconStarFilled className="size-3.5" aria-hidden="true" />
            ) : (
              <IconStar className="size-3.5" aria-hidden="true" />
            )}
          </Button>

          {room.badge ? (
            <Badge variant="outline" className="shrink-0 uppercase tracking-wide">
              {room.badge}
            </Badge>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* A readout, not a control, so it is a badge rather than a button:
              nothing happens when you press it. The sr-only sentence carries
              the same words as the tooltip, which is why the pill needs no
              tab stop of its own to be understood without a pointer. */}
          {room.scheduleCount > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="h-7 gap-1.5 px-2.5">
                  <IconCalendarClock className="size-3" aria-hidden="true" />
                  {room.scheduleCount}
                  <span className="sr-only">{scheduleLabel}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{scheduleLabel}</TooltipContent>
            </Tooltip>
          ) : null}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="none"
                className="h-8 shrink-0 gap-2 px-2"
                aria-label={`Show the ${members.length} room members`}
              >
                <RoomFacepile members={members} max={3} size="sm" overflow={false} />
                <span className="text-md text-muted-foreground tabular-nums">{members.length}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-1">
              <div className="max-h-80 overflow-y-auto">
                <MemberGroup label="People" members={people} />
                <MemberGroup label="Agents" members={agents} />
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className={ICON_BUTTON} aria-label="More room actions">
                <IconDots className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Search this room</DropdownMenuItem>
              <DropdownMenuItem>Pin a message</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Archive room</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* One glyph in both states, as the thread header argues: the rail it
              points at is on screen saying which state it is in, so the state
              rides `aria-pressed`, a label that flips, and the tint fill. That
              fill is the only one in the bar, which is what makes it read. */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              ICON_BUTTON,
              threadOpen && "bg-tint-10 text-foreground hover:bg-tint-15",
            )}
            aria-label={threadOpen ? "Hide the thread rail" : "Show the thread rail"}
            aria-pressed={threadOpen}
            onClick={onToggleThread}
          >
            <IconLayoutSidebarRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="px-3 pb-1.5">
        <Tabs value={tab} onValueChange={(value) => onTabChange(value as RoomTab)}>
          <TabsList variant="line">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
