import Link from "next/link";
import { IconCalendarClock, IconHash, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/patterns/page-heading";
import { SearchInput } from "@/components/patterns/search-input";
import { RoomFacepile } from "@/components/rooms/room-avatar";
import { roomMember, type Room, type RoomMember } from "@/lib/mock/rooms";

// The /rooms index. Rooms are a short list someone reads top to bottom, not a
// catalogue they browse, so this is rows under hairlines rather than a grid of
// cards: a grid would make four rooms look like a shop, and it would set the
// slug and the topic at the same weight in the same box.
//
// The rhythm is the point. The slug is the first text tier at body size and
// medium weight, the topic the second at 13px, the counts on the right the
// third (docs/brand/design.md §4.1) — three sizes and three greys down one
// row, so the eye lands on the name and only then reads the line under it.
//
// "New room" is INK, not orange: this page has no brand action. The room's one
// tangerine control is the composer's send button, one route further in (§11).

/** The whole row is one link, so every count spells its unit out for a reader who cannot see it. */
function RoomRow({ room }: { room: Room }) {
  const members = room.memberIds.map(roomMember).filter((member): member is RoomMember => member !== undefined);

  return (
    <li className="border-b border-border-subtle">
      <Button
        asChild
        variant="ghost"
        size="none"
        className={cn(
          "flex w-full items-center justify-between gap-4 rounded-none px-4 py-3.5 text-left",
          "hover:bg-tint-5",
          // A full-width row that shrinks by 2% on press reads as a squeeze,
          // not as feedback; the hover fill already says the row is live.
          "motion-safe:active:scale-100",
          // The ring hugs the row instead of floating 2px outside it, where a
          // full-bleed row would cut it against its neighbours' hairlines.
          "focus-visible:ring-offset-0",
        )}
      >
        <Link href={`/rooms/${room.slug}`}>
          <span className="flex min-w-0 flex-1 items-start gap-1.5">
            <IconHash className="mt-0.5 size-4 shrink-0 text-foreground-low" aria-hidden="true" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="truncate text-base font-medium text-foreground">{room.slug}</span>
                {room.badge ? (
                  <Badge variant="outline" className="shrink-0 uppercase tracking-wide">
                    {room.badge}
                  </Badge>
                ) : null}
              </span>
              <span className="truncate text-md font-normal text-muted-foreground">{room.topic}</span>
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-4">
            <span className="flex items-center gap-2">
              <RoomFacepile members={members} max={3} size="sm" overflow={false} />
              <span className="text-md font-normal text-foreground-low tabular-nums">
                {members.length}
                <span className="sr-only"> members</span>
              </span>
            </span>

            {room.scheduleCount > 0 ? (
              <span className="flex items-center gap-1 text-md font-normal text-foreground-low tabular-nums">
                <IconCalendarClock className="size-3.5" aria-hidden="true" />
                {room.scheduleCount}
                <span className="sr-only"> scheduled jobs</span>
              </span>
            ) : null}

            {room.unread ? (
              <Badge>
                {room.unread}
                <span className="sr-only"> unread messages</span>
              </Badge>
            ) : null}
          </span>
        </Link>
      </Button>
    </li>
  );
}

export function RoomsDirectory({ rooms }: { rooms: Room[] }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="border-b border-border-subtle px-6 py-4">
          <PageHeading
            title="Rooms"
            subtitle="Where your team and its agents work in the open, one channel at a time."
            actions={
              <Button className="gap-2">
                <IconPlus className="size-4" aria-hidden="true" />
                New room
              </Button>
            }
          />
        </header>

        <div className="flex-1 px-6 py-5">
          <SearchInput aria-label="Search rooms" placeholder="Search rooms" className="max-w-sm" />
          <ul className="mt-5 border-t border-border-subtle">
            {rooms.map((room) => (
              <RoomRow key={room.id} room={room} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
