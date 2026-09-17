"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { IconChevronDown, IconMessageOff, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/patterns/empty-state";
import { RoomComposer } from "@/components/rooms/room-composer";
import { RoomMessageRow } from "@/components/rooms/room-message";
import { visibleRoomMessages } from "@/components/rooms/room-message-list";
import { RoomWorkingMessage, type RoomWorkingTask } from "@/components/rooms/room-working-message";
import { reasoningForTask } from "@/lib/mock/room-reasoning";
import { roomMessages, roomThread, type Room } from "@/lib/mock/rooms";

// The room's third column: one message and everything said under it, kept out
// of the channel so the room stays readable.
//
// SHAPE. A rail, not a dialog, so it takes the app's second neutral layer
// (`bg-surface-secondary`) with a left hairline rather than a frame: the
// message column beside it is `bg-background`, and that one step of value is
// the whole separation the brand asks for (docs/brand/design.md §3.2, §6:
// prefer `border-subtle` and reserve shadows for composers, popovers and
// tiles). No glass, no drop shadow; the seam does the work.
//
// The header is 48px, the same band as the room header on the other side of
// the seam, so the two bars line up and the panel reads as part of the room
// instead of something dropped on top of it. At 48px there is no room for a
// stacked title, so "Thread" and the room it belongs to share one line: tier 1
// for the word, tier 3 for the `#slug`, which is scanned rather than read
// (§4.1).
//
// WIDTH is the caller's. Everything in here is fluid and truncates, because a
// rail that only works at exactly 400px is a rail that breaks the first time
// someone makes it resizable.
//
// MOTION. The caller mounts and unmounts the panel, so the entrance is a
// one-shot `animate-in` on the root: opacity and transform only, never width
// or position, because animating the rail's box would push the message column
// around for 220ms. It is entirely `motion-safe:`, so with reduced motion the
// panel simply appears.
//
// `entrance` is the one thing the caller has to tell it, and it exists because
// the rail is now two levels deep (room-agent-thread.tsx). A rail that just
// appeared beside the column travels 16px in from the right, because that is
// where it came from. A thread the reader popped BACK to did not travel: the
// rail stood exactly where it is the whole time and only its contents changed,
// so it fades and stays put. Sliding a box in from the right on a back move is
// the same lie in the opposite direction.
//
// A WORKING TASK STANDS IN THE THREAD IT CAME OUT OF. The board knows which
// tasks are running and which message each one came out of, so a thread whose
// root started work shows that work as a live cell after the replies — the
// newest thing in the thread, which is what it is (room-working-message.tsx).
// It is a cell rather than a line of copy because it leads somewhere: the rail
// has a second level, and this is the way into it. A task nothing has written
// a turn for keeps the cell and loses the press, which is the same rule the
// composer's agent bar keeps at the end of a row.
//
// THE ARRIVAL WASH. Opening a thread yourself needs no announcement: you
// clicked the reply count, the rail is where you were looking. Being SENT here
// — by a chip in the composer's agent bar, which swaps the whole rail under a
// reader whose eyes were on the field — does, or the thread that was already
// open and the one that just replaced it are the same grey rectangle. So an
// arrival tints the surface one step warmer for ARRIVAL_MS and then eases back
// over `--duration-slow`, which is long enough to be noticed and short enough
// that nothing is left marked. It is a tint, not a hue: the room spends its
// one colour on the send arrow, and a thread is not a status.
//
// The wash is keyed on the caller's token rather than on the rootId, for the
// same reason the tracker's pulse is (tracker/pulse.tsx): being sent to the
// thread you are already reading is still an arrival, and a flag cannot say
// "again", so a new token remounts the layer and replays it. It is a layer
// rather than a class on the root for the same reason — a class cannot be
// replayed — and it sits at `-z-10` inside the rail's own stacking context, so
// it covers the surface and nothing else: the tint is over the fill and under
// every word, and no text fades with it.
//
// IT SURVIVES REDUCED MOTION, unlike the sheen in the tracker's pulse. Nothing
// here travels and nothing changes size; a colour that arrives and settles
// asks nothing of a vestibular system, and dropping it would leave exactly the
// readers who most need the orientation without it.

/** The model the read-out names; the mock carries no per-thread model. */
const USAGE_MODEL = "Opus 5";

/**
 * The Usage menu's three figures. The mock has no usage numbers, so they are
 * derived from the one thing the thread does know, how long it ran, so they
 * stay stable per thread and differ between threads instead of every thread in
 * the app quoting the same token count.
 */
function usageRows(replyCount: number): { label: string; value: string }[] {
  const seconds = 38 + replyCount * 47;
  return [
    { label: "Tokens used", value: `${(2.4 + replyCount * 1.7).toFixed(1)}K` },
    { label: "Model", value: USAGE_MODEL },
    { label: "Duration", value: `${Math.floor(seconds / 60)}m ${seconds % 60}s` },
  ];
}

/** Full on for the first third, then off over the rest: long enough to be
    caught by an eye that was on the composer, gone before it is furniture. */
const ARRIVAL = { duration: DURATION.slide * 3, times: [0, 0.34, 1], ease: EASE.out };

export function RoomThreadPanel({
  room,
  rootId,
  arrival,
  entrance = "rail",
  working,
  onOpenAgent,
  onClose,
  className,
}: {
  room: Room;
  /** The message the thread hangs off, by id. */
  rootId: string;
  /**
   * Bumped every time something OPENED this rail for the reader rather than
   * the reader opening it. Null, or left out, and the rail never washes.
   */
  arrival?: number | null;
  /**
   * How this panel arrived. `rail` is the rail itself appearing beside the
   * column; `level` is the reader coming back to it from the agent view, where
   * the rail never moved (see MOTION above).
   */
  entrance?: "rail" | "level";
  /** Work still running that came out of this thread's root message. */
  working?: readonly RoomWorkingTask[];
  /** Open one of those tasks' turns in the rail, in place of this panel. */
  onOpenAgent?: (taskId: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const alsoSendId = useId();
  const root = roomMessages(room).find((message) => message.id === rootId);
  // The channel's own filter, not a copy of it: a membership event is no more
  // welcome in a thread than in the room, and filtering here rather than in the
  // map keeps the count on the rule counting what is under it.
  const replies = visibleRoomMessages(roomThread(room, rootId));
  const live = working ?? [];

  return (
    <aside
      aria-label={`Thread in #${room.slug}`}
      className={cn(
        "relative isolate flex h-full min-h-0 flex-col border-l border-border-subtle bg-surface-secondary",
        // `animation-duration-*` is the animate-in form of the duration token:
        // `duration-*` alone would set transition-duration, which this element
        // has no transition to spend it on (src/components/teams/org/org-entrance.tsx).
        "motion-safe:animate-in motion-safe:fade-in",
        entrance === "rail"
          ? "ease-out-quint motion-safe:slide-in-from-right-4 motion-safe:animation-duration-(--duration-move)"
          : "ease-out-quart motion-safe:animation-duration-(--duration-enter)",
        className,
      )}
    >
      {arrival === null || arrival === undefined ? null : (
        <motion.span
          key={arrival}
          aria-hidden="true"
          // A tint, not a hue: the room spends its one colour on the send
          // arrow, and being moved is not a status. `-z-10` in the rail's own
          // `isolate` puts it over the fill and under every word.
          className="pointer-events-none absolute inset-0 -z-10 bg-tint-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [1, 1, 0] }}
          transition={ARRIVAL}
        />
      )}

      {/* 48px, matching the room header's band across the seam. */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border-subtle px-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="shrink-0 font-medium text-foreground text-sm">Thread</span>
          <span className="truncate text-foreground-low text-xs">#{room.slug}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="tint" size="xs" className="gap-1">
              Usage
              <IconChevronDown className="size-3.5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          {/* Read-outs, not actions: the three figures are plain rows in a
              description list, so nothing in here looks pressable that is
              not. "View full usage" is the one real item, and it is also what
              keeps the menu keyboard-reachable. */}
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="text-foreground-low text-xs">This thread</DropdownMenuLabel>
            <dl className="grid gap-1.5 px-2 pt-0.5 pb-1.5 text-xs">
              {usageRows(replies.length).map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-foreground-low">{row.label}</dt>
                  <dd className="font-medium text-foreground tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View full usage</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Close thread"
          onClick={onClose}
        >
          <IconX className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {/* The body owns no horizontal padding: a message row carries its own
          `px-4` gutters so its hover and active fills reach the rail's edges,
          the way they do in the channel. This file's own chrome is inset to
          the same 16px, so the separator's rule starts where a message does. */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="py-3">
          {root ? <RoomMessageRow message={root} variant="thread" /> : null}

          {replies.length > 0 ? (
            <>
              {/* One hairline doing two jobs: it closes the root and it
                  carries the count. A rule under the root plus a second rule
                  over the replies would put two lines 12px apart. */}
              <div className="relative my-2 px-4">
                <span aria-hidden="true" className="absolute inset-x-4 top-1/2 h-px bg-border-subtle" />
                <span className="relative mx-auto block w-fit bg-surface-secondary px-2 text-foreground-low text-xs">
                  {replies.length === 1 ? "1 reply" : `${replies.length} replies`}
                </span>
              </div>

              {replies.map((reply) => (
                <RoomMessageRow key={reply.id} message={reply} variant="thread" />
              ))}
            </>
          ) : (
            // The same hairline with no count to carry: it is closing the
            // root, which is a job it has whether or not anyone replied.
            <div className="mx-4 my-2 h-px bg-border-subtle" />
          )}

          {/* Last, because it is the newest thing in the thread and because it
              is the only part of it that has not finished happening. */}
          {live.map((task) => (
            <RoomWorkingMessage
              key={task.taskId}
              {...task}
              onOpen={
                onOpenAgent && reasoningForTask(task.taskId) ? () => onOpenAgent(task.taskId) : undefined
              }
            />
          ))}

          {replies.length === 0 && live.length === 0 ? (
            <EmptyState
              variant="plain"
              icon={IconMessageOff}
              title="No replies yet"
              description="Replies here stay in the thread and do not post back to the room."
            />
          ) : null}
        </div>
      </ScrollArea>

      {/* Pinned: the reply box is the panel's one action and never scrolls
          away from the thread it belongs to. */}
      <div className="shrink-0 border-t border-border-subtle px-3 pt-2 pb-3">
        <RoomComposer size="compact" placeholder="Reply in thread" />
        <div className="mt-2 flex items-center gap-2">
          <Checkbox id={alsoSendId} />
          <Label htmlFor={alsoSendId} className="cursor-pointer font-normal text-muted-foreground text-xs">
            Also send to #{room.slug}
          </Label>
        </div>
      </div>
    </aside>
  );
}
