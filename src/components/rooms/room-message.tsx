"use client";

import type { ReactNode } from "react";
import {
  IconChevronRight,
  IconClockPlay,
  IconDots,
  IconMessageReply,
  IconMoodPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoomAvatar, RoomFacepile } from "@/components/rooms/room-avatar";
import { renderRoomInline } from "@/components/rooms/room-rich-text";
import { roomMember, type RoomMember, type RoomMessage } from "@/lib/mock/rooms";

// One line of a room: a face in a fixed gutter, a name, and what was said.
//
// Every row carries all three, including the second and third message from
// the same speaker. Collapsing a run of them buys back a little height and
// charges the reader for it at the worst moment: the message most likely to be
// quoted, answered, or asked "when was that?" about is exactly the one a run
// strips of its face, its name and its clock. One padding value serves the
// whole column now, because every row is the same shape.
//
// The other thing this row has to say is *why* an agent spoke. A reply is
// obvious from the thread it sits in; a message that arrived on a timer is
// not, so `message.schedule` puts a small clock chip beside the name naming
// the job that posted it. Nobody asked for that message: the chip says so.
//
// Membership events are not messages and are not laid out as any. They are one
// quiet `sm` line at tier 2, aligned into the same column so the eye skips
// them: furniture, not conversation. The prototype currently keeps them off
// screen entirely; the branch stays because the decision is a flag in
// `room-message-list.tsx`, not a deletion.
//
// Phase 2: fills are tints, the hover cluster is an elevated surface behind a
// hairline and a `shadow-sm`, and the only colour spent is `text-brand-accent`
// on the reply count — the one link-shaped affordance in the row
// (docs/brand/design.md §3, §5, §6, §8).

/** Rendered inside a thread rail, the row is the same minus its reply bar. */
export type RoomMessageVariant = "channel" | "thread";

/** The menu behind the hover cluster's `IconDots`. Same four on every row. */
const MORE_ACTIONS = ["Copy link", "Pin to room", "Mark unread", "Remind me"] as const;

/**
 * An author id the roster no longer resolves — someone who left the workspace.
 * The message still happened, so it still renders; it just loses its face.
 */
function formerMember(id: string): RoomMember {
  return { id, name: "Former member", kind: "human", initials: "?" };
}

/** The clock chip beside the name: an agent posted this on a schedule. */
function ScheduleChip({ label }: { label: string }) {
  return (
    <span
      data-slot="room-schedule-chip"
      // Tier 3 on a `tint-10` ground drops to `muted-foreground`;
      // `foreground-low` misses AA there (docs/brand/design.md §4.1, §10).
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tint-10 px-2 py-0.5 text-xs text-muted-foreground"
    >
      <IconClockPlay className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function RoomMessageRow({
  message,
  variant = "channel",
  active = false,
  onOpenThread,
  onFocusAgent,
  className,
}: {
  message: RoomMessage;
  variant?: RoomMessageVariant;
  /** This message's thread is the one open in the side rail. */
  active?: boolean;
  /**
   * Opens the thread hanging off this message. Omitted, the reply bar and the
   * reply action render exactly as they do wired but do nothing — the row is
   * used for static previews as well as for the live column.
   */
  onOpenThread?: (messageId: string) => void;
  /**
   * Takes the reader to this agent's cards on the room's tracker and pulses
   * them once (`tracker/tracker-context.tsx`). Given only where a tracker is
   * mounted beside the column; without it the name is plain text, which is
   * what every static preview of this row wants.
   */
  onFocusAgent?: (agentId: string) => void;
  className?: string;
}): ReactNode {
  const author = roomMember(message.authorId) ?? formerMember(message.authorId);
  const openThread = onOpenThread ? () => onOpenThread(message.id) : undefined;

  if (message.system) {
    // No blocks, no reactions, no hover cluster. The `sm` avatar is
    // right-aligned in the same 36px gutter the faces use, so the sentence
    // starts on the same column as every message around it.
    const text = message.blocks
      .filter((block) => block.kind === "paragraph")
      .map((block) => (block.kind === "paragraph" ? block.text : ""))
      .join(" ");

    return (
      <div
        data-slot="room-message"
        data-system="true"
        className={cn("flex items-center gap-3 px-4 py-1", className)}
      >
        <span className="flex w-9 shrink-0 justify-end">
          <RoomAvatar member={author} size="sm" />
        </span>
        {/* The time follows the sentence instead of being pushed to the far
            edge: at the column's full width a right-aligned clock ends up a
            hand's breadth from the line it belongs to. */}
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-muted-foreground">{author.name}</span> {renderRoomInline(text)}{" "}
          <span className="text-xs text-foreground-low tabular-nums">{message.time}</span>
        </p>
      </div>
    );
  }

  const replies = variant === "channel" ? message.replies : undefined;
  const participants = replies
    ? replies.participantIds.map((id) => roomMember(id) ?? formerMember(id))
    : [];

  return (
    <div
      data-slot="room-message"
      data-active={active || undefined}
      className={cn(
        "group/message relative flex gap-3 px-4",
        // Symmetric, and a shade tighter than the old new-speaker gap: a name
        // opens every row now, so the gap between two rows no longer has to do
        // the separating by itself.
        "py-2",
        "transition-[background-color] duration-(--duration-fast) ease-out",
        active ? "bg-tint-5" : "hover:bg-tint-5",
        className,
      )}
    >
      <div className="w-9 shrink-0">
        <RoomAvatar member={author} size="lg" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-6">
          {/* The name labels the block under it, so it cannot be smaller than
              the block. `base` at 600 is the brand's heading-at-body-size role
              (docs/brand/design.md §4): weight does the separating and the
              scale does not have to grow a size for it. */}
          {/* An agent's name is the way into its work: one click and the
              tracker opens on its cards. The face beside it stays decorative,
              so the row keeps one tab stop for one action rather than two for
              the same one. A person's name is not a control: people do not
              have cards of their own to point at. */}
          {onFocusAgent && author.kind === "agent" ? (
            <Button
              type="button"
              variant="ghost"
              size="none"
              onClick={() => onFocusAgent(author.id)}
              aria-label={`Show ${author.name}'s work on the tracker`}
              className="-mx-1 rounded-md px-1 text-base font-semibold text-foreground hover:bg-tint-10"
            >
              {author.name}
            </Button>
          ) : (
            <span className="text-base font-semibold text-foreground">{author.name}</span>
          )}
          {message.schedule ? <ScheduleChip label={message.schedule} /> : null}
          <span className="text-xs text-foreground-low tabular-nums">{message.time}</span>
        </div>

        {/* Running copy is tier 2. It sat on tier 1 to say "these are a
            colleague's own words", but at 16/400 the name above it is the
            same size and only 200 weight units away, so the two shared a
            voice. There is no lighter weight than 400 in the brand's set, so
            the step down is the tier: the message reads as the sentence it is
            (docs/brand/design.md §4.1), and what stays on tier 1 is the name,
            a `<strong>` run and a code span, which is the right short list. */}
        <div className="mt-0.5 flex flex-col gap-1.5">
          {message.blocks.map((block, i) =>
            block.kind === "paragraph" ? (
              <p key={i} className="text-base text-muted-foreground">
                {renderRoomInline(block.text)}
              </p>
            ) : (
              <ul key={i} className="flex list-disc flex-col gap-1 pl-5 marker:text-foreground-low">
                {block.items.map((item, j) => (
                  <li key={j} className="text-base text-muted-foreground">
                    {renderRoomInline(item)}
                  </li>
                ))}
              </ul>
            ),
          )}
        </div>

        {message.reactions?.length ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                type="button"
                variant="ghost"
                size="none"
                aria-pressed={reaction.reacted ?? false}
                aria-label={`${reaction.emoji} reaction, ${reaction.count}`}
                className={cn(
                  "h-6 gap-1 rounded-full px-2 text-xs font-medium",
                  reaction.reacted
                    ? // Pressed: the brand's quiet fill with its own foreground,
                      // rimmed so the state survives on either canvas without
                      // reaching for the solid orange.
                      "bg-brand-subtle text-brand-subtle-foreground ring-1 ring-brand-accent/40 hover:bg-brand-subtle"
                    : "bg-tint-10 text-muted-foreground hover:bg-tint-15 hover:text-foreground",
                )}
              >
                <span aria-hidden="true">{reaction.emoji}</span>
                <span className="tabular-nums">{reaction.count}</span>
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Add reaction"
              // The list overrides the base transition, so it has to carry
              // `scale` through or the press feedback stops easing.
              className="text-foreground-low opacity-0 transition-[color,background-color,opacity,scale] duration-(--duration-fast) ease-out hover:text-foreground focus-visible:opacity-100 group-hover/message:opacity-100"
            >
              <IconMoodPlus className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        ) : null}

        {replies ? (
          <Button
            type="button"
            variant="ghost"
            size="none"
            data-active={active || undefined}
            aria-expanded={active}
            onClick={openThread}
            className={cn(
              "group/replies mt-1.5 -ml-1.5 flex h-9 w-full max-w-md justify-start gap-2 rounded-lg px-1.5 font-normal",
              "transition-[color,background-color,scale] duration-(--duration-fast) ease-out",
              active ? "bg-tint-5" : "hover:bg-tint-5",
            )}
          >
            <RoomFacepile members={participants} max={3} size="sm" />
            {/* The one link-coloured thing in the row, and the only place in
                this view a brand colour is spent on text. */}
            <span className="shrink-0 text-sm font-medium text-brand-accent">
              {replies.count} {replies.count === 1 ? "reply" : "replies"}
            </span>
            {/* Both labels share one grid cell so the swap moves no pixels. */}
            <span className="grid min-w-0 flex-1 text-left">
              <span className="col-start-1 row-start-1 truncate text-xs text-foreground-low transition-opacity duration-(--duration-fast) ease-out group-hover/replies:opacity-0 group-data-[active]/replies:opacity-0">
                {replies.lastReplyLabel}
              </span>
              <span
                aria-hidden="true"
                className="col-start-1 row-start-1 inline-flex items-center gap-0.5 truncate text-xs text-foreground-low opacity-0 transition-opacity duration-(--duration-fast) ease-out group-hover/replies:opacity-100 group-data-[active]/replies:opacity-100"
              >
                View thread
                <IconChevronRight className="size-3" aria-hidden="true" />
              </span>
            </span>
          </Button>
        ) : null}
      </div>

      {/* The cluster hangs over the top edge of the row. `:hover` on an
          ancestor does not care where a descendant is painted, so the row
          stays hovered while the pointer is up here; `pointer-events-none` at
          rest keeps the invisible cluster from swallowing clicks. */}
      <div
        className="pointer-events-none absolute -top-3 right-3 z-10 flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-elevated p-0.5 opacity-0 shadow-sm transition-opacity duration-(--duration-fast) ease-out focus-within:pointer-events-auto focus-within:opacity-100 group-hover/message:pointer-events-auto group-hover/message:opacity-100"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="React to message"
          className="text-foreground-low hover:text-foreground"
        >
          <IconMoodPlus className="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Reply in thread"
          onClick={openThread}
          className="text-foreground-low hover:text-foreground"
        >
          <IconMessageReply className="size-3.5" aria-hidden="true" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="More message actions"
              className="text-foreground-low hover:text-foreground"
            >
              <IconDots className="size-3.5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {MORE_ACTIONS.slice(0, 2).map((action) => (
              <DropdownMenuItem key={action}>{action}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {MORE_ACTIONS.slice(2).map((action) => (
              <DropdownMenuItem key={action}>{action}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
