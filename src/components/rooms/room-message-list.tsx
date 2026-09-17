"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomFacepile } from "@/components/rooms/room-avatar";
import { RoomMessageRow } from "@/components/rooms/room-message";
import { roomMember, type Room, type RoomMessage } from "@/lib/mock/rooms";

// The scrolling column: an orientation block, then each day behind its own
// divider, then the rows.
//
// Two decisions are worth naming. The first is the divider: a hairline with
// the date sitting on it as a pill, and the current day's pill pinned to the
// top of the viewport while its own messages are on screen. That stickiness is
// not decoration — it is the answer to "am I looking at today or at Tuesday?"
// for a reader who has scrolled a long way and lost the header. Only the last
// group sticks, because only one date can be the one you are inside.
//
// The second is grouping. A run of messages from the same speaker loses its
// face and its name (see `room-message.tsx`), and the rule for when a run
// breaks lives here rather than in the row, because it is a question about
// neighbours. A system line never joins a run and never continues one, and
// neither does a scheduled post: both are announcements, and an announcement
// that inherits the face above it reads as a reply to it.
//
// The column opens at the bottom, which is where a room's newest message is
// and where every chat client in the world puts you.

/**
 * Does this message continue the one above it? Same author, both ordinary
 * messages, neither posted by a schedule. The mock's times are written labels
 * rather than instants, so the "within a few minutes" half of the usual rule
 * is the day group itself: a run never crosses a divider.
 */
function isGrouped(messages: RoomMessage[], index: number): boolean {
  const message = messages[index];
  const previous = messages[index - 1];
  if (!previous) return false;
  if (previous.system || message.system) return false;
  if (previous.schedule || message.schedule) return false;
  return previous.authorId === message.authorId;
}

/**
 * A hairline with the date on it. `sticky` pins it while its day is on screen,
 * and once it is pinned it is floating over a sentence rather than sitting
 * between two of them, so the pill takes the elevated surface and a `shadow-sm`
 * instead of the canvas fill: on the canvas fill it reads as a hole punched in
 * the line under it.
 */
function RoomDayDivider({ label, sticky = false }: { label: string; sticky?: boolean }) {
  return (
    <div
      data-slot="room-day-divider"
      className={cn("relative flex items-center justify-center py-3", sticky && "sticky top-2 z-10")}
    >
      <span aria-hidden="true" className="absolute inset-x-4 top-1/2 h-px bg-border-subtle" />
      <span className="relative rounded-full border border-border-subtle bg-surface-elevated px-3 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
        {label}
      </span>
    </div>
  );
}

/**
 * The top of the scroll: what this room is, and who is in it. Deliberately
 * quiet — somebody arriving needs their bearings, not a title card, so the
 * name is the largest thing here and nothing under it competes with it.
 */
export function RoomIntro({ room, className }: { room: Room; className?: string }): ReactNode {
  const members = room.memberIds.map((id) => roomMember(id)).filter((member) => member !== undefined);
  const people = members.filter((member) => member.kind === "human").length;
  const agents = members.length - people;

  return (
    <div data-slot="room-intro" className={cn("flex flex-col gap-2 px-4 pt-10 pb-2", className)}>
      {/* `text-2xl` already carries the heading weight, so no weight class. */}
      <h2 className="text-2xl text-foreground">
        <span className="text-foreground-low">#</span>
        {room.slug}
      </h2>
      <p className="text-base text-muted-foreground">{room.topic}</p>
      <div className="flex items-center gap-2 pt-1">
        <RoomFacepile members={members} max={5} size="default" />
        <p className="text-sm text-muted-foreground">
          This is the beginning of the room. {people} {people === 1 ? "person" : "people"} and {agents}{" "}
          {agents === 1 ? "agent" : "agents"} are in it.
        </p>
      </div>
    </div>
  );
}

export function RoomMessageList({
  room,
  activeThreadId,
  onOpenThread,
  className,
}: {
  room: Room;
  /** The message whose thread the side rail is showing, if any. */
  activeThreadId?: string;
  onOpenThread: (messageId: string) => void;
  className?: string;
}): ReactNode {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Open at the newest message. A jump rather than a smooth scroll: this is
  // the room's resting position, not a movement the reader asked for.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [room.id]);

  return (
    <ScrollArea className={cn("min-h-0 flex-1", className)} viewportRef={viewportRef}>
      <div className="flex flex-col pb-4">
        <RoomIntro room={room} />
        {room.days.map((day, dayIndex) => (
          <section key={day.label} className="flex flex-col">
            <RoomDayDivider label={day.label} sticky={dayIndex === room.days.length - 1} />
            {day.messages.map((message, index) => (
              <RoomMessageRow
                key={message.id}
                message={message}
                grouped={isGrouped(day.messages, index)}
                active={activeThreadId === message.id}
                onOpenThread={onOpenThread}
              />
            ))}
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}
