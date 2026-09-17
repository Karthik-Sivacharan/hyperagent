"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomFacepile } from "@/components/rooms/room-avatar";
import { RoomMessageRow } from "@/components/rooms/room-message";
import { Pulse } from "@/components/rooms/tracker/pulse";
import type { MessagePulse } from "@/components/rooms/tracker/tracker-context";
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
// The second is what does not reach the screen. Membership events are real
// messages in the mock and the row knows how to draw them; the prototype keeps
// them out of the column anyway, because a room this size would spend a third
// of its height announcing arrivals instead of showing work. That filter is
// this file's job rather than the row's: it is a question about the column, and
// it is the reason a day can turn out to have nothing in it.
//
// The column opens at the bottom, which is where a room's newest message is
// and where every chat client in the world puts you.
//
// THE RETURN TRIP. A card on the room's tracker can point back at the message
// its work came out of. The column brings that message into view and pulses it
// once, with the same component the cards pulse with, so the two directions of
// the jump read as one gesture (`tracker/pulse.tsx`,
// docs/plans/2026-09-17-room-tracker.md §7). The pulse is drawn by a wrapper
// around the row rather than by the row itself: it is a fact about this column
// and the tracker beside it, not about a message.

/**
 * A prototype decision, not a product one: "Mara Osei joined the room." stays
 * in the mock and stays renderable by `RoomMessageRow`, it just does not reach
 * the screen. Flipping this to `true` is the whole of putting it back.
 */
const SHOW_MEMBERSHIP_EVENTS = false;

/** The messages a reader is actually shown, of the ones the mock holds. */
export function visibleRoomMessages(messages: RoomMessage[]): RoomMessage[] {
  return SHOW_MEMBERSHIP_EVENTS ? messages : messages.filter((message) => !message.system);
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
  onFocusAgent,
  highlight,
  className,
}: {
  room: Room;
  /** The message whose thread the side rail is showing, if any. */
  activeThreadId?: string;
  onOpenThread: (messageId: string) => void;
  /** Handed to every row: an agent's name opens its cards on the tracker. */
  onFocusAgent?: (agentId: string) => void;
  /** The message a tracker card pointed back at, and which ask it was. */
  highlight?: MessagePulse | null;
  className?: string;
}): ReactNode {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Open at the newest message. A jump rather than a smooth scroll: this is
  // the room's resting position, not a movement the reader asked for.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [room.id]);

  // A card asked for a message. Centre it, because a message arriving at the
  // very edge of the column reads as the column having jumped rather than as
  // an answer. The token is in the dependency list, so asking twice scrolls
  // twice even when the answer is the same message.
  useEffect(() => {
    if (!highlight) return;
    const frame = requestAnimationFrame(() => {
      viewportRef.current
        ?.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(highlight.messageId)}"]`)
        ?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlight]);

  // A day whose every message was filtered out drops with its divider: a date
  // pinned over nothing is a promise the column does not keep.
  const days = room.days
    .map((day) => ({ label: day.label, messages: visibleRoomMessages(day.messages) }))
    .filter((day) => day.messages.length > 0);

  return (
    <ScrollArea className={cn("min-h-0 flex-1", className)} viewportRef={viewportRef}>
      <div className="flex flex-col pb-4">
        <RoomIntro room={room} />
        {days.map((day, dayIndex) => (
          <section key={day.label} className="flex flex-col">
            <RoomDayDivider label={day.label} sticky={dayIndex === days.length - 1} />
            {day.messages.map((message) => (
              <div key={message.id} data-message-id={message.id} className="relative">
                <RoomMessageRow
                  message={message}
                  active={activeThreadId === message.id}
                  onOpenThread={onOpenThread}
                  onFocusAgent={onFocusAgent}
                />
                <Pulse token={highlight?.messageId === message.id ? highlight.token : null} radius="none" />
              </div>
            ))}
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}
