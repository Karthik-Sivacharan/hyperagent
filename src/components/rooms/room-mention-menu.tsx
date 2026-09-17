"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoomAvatar } from "@/components/rooms/room-avatar";
import type { RoomMember } from "@/lib/mock/rooms";

// The list that opens over the composer when you type `@`. Slack's shape and
// Slack's reason: a room holds people and agents, the two are addressed the
// same way, and the roster is the only place that knows which is which.
//
// IT IS NOT A POPOVER, and that is the point. Radix's Popover takes focus
// when it opens, and an autocomplete that steals the caret out of the field
// you are typing into is a different, worse control — you would have to click
// back to keep writing. So this is a plain positioned card, the field keeps
// focus the whole time, and every key it needs (Up, Down, Enter, Tab, Escape)
// is handled by the textarea and forwarded here as an index. The mouse is the
// same story: `onMouseDown` is prevented so a click never blurs the field.
//
// IT LISTS EVERYONE, AGENTS FIRST. Only an agent can be handed work, so only
// an agent turns into a run in the bar above the field, but a room mentions
// its people too and a menu that hid them would read as broken. The sort is
// the honest version of "agents first": the ones a mention does something to,
// then the ones it only notifies.
//
// ONE ROW IS ALWAYS ACTIVE, because Enter has to mean something the instant
// the menu is open. The active row is marked with `aria-selected` and scrolled
// into view by the keyboard rather than by hover, so a list longer than the
// card does not jump under the pointer.

/** Agents first, then people; each group keeps its roster order. */
export function sortForMention(members: readonly RoomMember[]): RoomMember[] {
  return [...members].sort((a, b) => Number(b.kind === "agent") - Number(a.kind === "agent"));
}

/**
 * Who `@query` could mean. Empty query lists the room. A name matches on any
 * of its words so "lab" finds "Media Lab Director", and the id matches too so
 * the mock's own handles keep working.
 */
export function matchMembers(members: readonly RoomMember[], query: string): RoomMember[] {
  const q = query.trim().toLowerCase();
  const ranked = sortForMention(members);
  if (!q) return ranked;
  return ranked.filter((member) => {
    const name = member.name.toLowerCase();
    return name.startsWith(q) || name.split(" ").some((word) => word.startsWith(q)) || member.id.startsWith(q);
  });
}

export function RoomMentionMenu({
  members,
  activeIndex,
  onPick,
  onHover,
  className,
}: {
  members: readonly RoomMember[];
  activeIndex: number;
  onPick: (member: RoomMember) => void;
  onHover: (index: number) => void;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard scrolling only: the row the arrows moved to is brought into view,
  // and hover never moves the list under the pointer.
  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (members.length === 0) return null;

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Mention someone in this room"
      // The field owns the caret, so nothing in here may take focus — not even
      // for the instant a mousedown would.
      onMouseDown={(event) => event.preventDefault()}
      className={cn(
        "absolute bottom-full left-0 z-20 mb-2 max-h-64 w-[min(20rem,100%)] overflow-y-auto",
        "rounded-2xl bg-surface-elevated p-1 shadow-lg ring-1 ring-border-subtle",
        "animate-in fade-in-0 slide-in-from-bottom-1 duration-(--duration-enter) ease-out-quart motion-reduce:animate-none",
        className,
      )}
    >
      {members.map((member, index) => (
        <Button
          key={member.id}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          data-index={index}
          variant="ghost"
          size="none"
          onMouseEnter={() => onHover(index)}
          onClick={() => onPick(member)}
          className={cn(
            "h-auto w-full justify-start gap-2.5 rounded-xl px-2 py-1.5 text-left",
            index === activeIndex && "bg-tint-10",
          )}
        >
          <RoomAvatar member={member} size="default" className="shrink-0" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{member.name}</span>
            {member.role ? <span className="truncate text-xs text-muted-foreground">{member.role}</span> : null}
          </span>
        </Button>
      ))}
    </div>
  );
}
